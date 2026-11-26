import { createHash, randomBytes } from "node:crypto";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type ErrorRequestHandler, type Request, type RequestHandler, type Response } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { Prisma, prisma } from "@lazybond/database";
import argon2 from "argon2";
import { ZodError } from "zod";
import {
  communitySchema,
  friendReviewSchema,
  joinSchema,
  loginSchema,
  messageSchema,
  planSchema,
  privacySchema,
  profileSchema,
  registrationSchema,
  reportSchema,
  reviewSchema,
} from "./validators.js";

const app = express();
const port = Number(process.env.PORT ?? 4000);
const webOrigin = process.env.WEB_ORIGIN ?? "http://localhost:3000";
const secureCookie = process.env.SESSION_COOKIE_SECURE === "true" || process.env.NODE_ENV === "production";
const sessionCookie = "lazybond_session";
const sessionDurationMs = 1000 * 60 * 60 * 24 * 30;
const tokenHash = (token: string) => createHash("sha256").update(token).digest("hex");

class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

const routeParam = (req: Request, name: string) => {
  const value = req.params[name];
  if (!value || Array.isArray(value)) throw new HttpError(400, `Invalid ${name}.`);
  return value;
};

app.disable("x-powered-by");
app.use(helmet());
app.use(cors({ origin: webOrigin, credentials: true, methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"] }));
app.use(express.json({ limit: "16kb" }));
app.use(cookieParser());
app.use((req, _res, next) => {
  if (["POST", "PATCH", "DELETE"].includes(req.method) && req.get("origin") && req.get("origin") !== webOrigin) {
    next(new HttpError(403, "Request origin is not allowed."));
    return;
  }
  next();
});

const asyncRoute = (handler: (req: Request, res: Response) => Promise<void>): RequestHandler =>
  (req, res, next) => {
    void handler(req, res).catch(next);
  };

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Too many attempts. Please try again later." },
});
const writeLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 30,
  standardHeaders: "draft-8",
  legacyHeaders: false,
});

const safeUser = (user: { id: string; email: string; displayName: string; role: string }) => ({
  id: user.id,
  email: user.email,
  displayName: user.displayName,
  role: user.role,
});

const setSessionCookie = (res: Response, token: string) => {
  res.cookie(sessionCookie, token, {
    httpOnly: true,
    secure: secureCookie,
    sameSite: "lax",
    path: "/",
    maxAge: sessionDurationMs,
  });
};

const requireAuth: RequestHandler = async (req, res, next) => {
  const token: unknown = req.cookies?.[sessionCookie];
  if (typeof token !== "string" || token.length < 32) {
    res.status(401).json({ error: "Authentication required." });
    return;
  }

  try {
    const session = await prisma.session.findUnique({
      where: { tokenHash: tokenHash(token) },
      include: { user: { select: { id: true, email: true, displayName: true, role: true } } },
    });
    if (!session || session.expiresAt <= new Date()) {
      if (session) await prisma.session.delete({ where: { id: session.id } });
      res.clearCookie(sessionCookie, { httpOnly: true, secure: secureCookie, sameSite: "lax", path: "/" });
      res.status(401).json({ error: "Authentication required." });
      return;
    }

    req.authUser = session.user;
    req.sessionId = session.id;
    next();
  } catch (error) {
    next(error);
  }
};

const createSession = async (userId: string, res: Response) => {
  const token = randomBytes(32).toString("base64url");
  await prisma.session.create({
    data: {
      userId,
      tokenHash: tokenHash(token),
      expiresAt: new Date(Date.now() + sessionDurationMs),
    },
  });
  setSessionCookie(res, token);
};

const ensureConversationIsUnblocked = async (conversationId: string, userId: string) => {
  const peers = await prisma.conversationParticipant.findMany({
    where: { conversationId, userId: { not: userId } },
    select: { userId: true },
  });
  const peerIds = peers.map((peer) => peer.userId);
  if (!peerIds.length) return;

  const block = await prisma.userBlock.findFirst({
    where: {
      OR: [
        { blockerId: userId, blockedId: { in: peerIds } },
        { blockerId: { in: peerIds }, blockedId: userId },
      ],
    },
  });
  if (block) throw new HttpError(403, "This conversation is unavailable.");
};

app.get("/health", asyncRoute(async (_req, res) => {
  await prisma.$queryRaw`SELECT 1`;
  res.json({ status: "ok" });
}));

const api = express.Router();

api.post("/auth/register", authLimiter, asyncRoute(async (req, res) => {
  const input = registrationSchema.parse(req.body);
  const passwordHash = await argon2.hash(input.password, { type: argon2.argon2id });

  try {
    const user = await prisma.user.create({
      data: {
        email: input.email,
        displayName: input.displayName,
        passwordHash,
        privacy: { create: {} },
      },
    });
    await createSession(user.id, res);
    res.status(201).json({ user: safeUser(user) });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new HttpError(409, "An account with that email already exists.");
    }
    throw error;
  }
}));

api.post("/auth/login", authLimiter, asyncRoute(async (req, res) => {
  const input = loginSchema.parse(req.body);
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  const valid = user ? await argon2.verify(user.passwordHash, input.password) : false;
  if (!user || !valid) throw new HttpError(401, "Email or password is incorrect.");
  await createSession(user.id, res);
  res.json({ user: safeUser(user) });
}));

api.post("/auth/logout", asyncRoute(async (req, res) => {
  const token: unknown = req.cookies?.[sessionCookie];
  if (typeof token === "string" && token.length >= 32) {
    await prisma.session.deleteMany({ where: { tokenHash: tokenHash(token) } });
  }
  res.clearCookie(sessionCookie, { httpOnly: true, secure: secureCookie, sameSite: "lax", path: "/" });
  res.status(204).end();
}));

api.get("/auth/me", requireAuth, asyncRoute(async (req, res) => {
  res.json({ user: req.authUser });
}));

api.patch("/me", requireAuth, asyncRoute(async (req, res) => {
  const input = profileSchema.parse(req.body);
  const user = await prisma.user.update({
    where: { id: req.authUser!.id },
    data: { displayName: input.displayName },
    select: { id: true, email: true, displayName: true, role: true },
  });
  res.json({ user });
}));

api.get("/me/privacy", requireAuth, asyncRoute(async (req, res) => {
  const settings = await prisma.privacySettings.upsert({
    where: { userId: req.authUser!.id },
    create: { userId: req.authUser!.id },
    update: {},
  });
  res.json({ settings });
}));

api.patch("/me/privacy", requireAuth, asyncRoute(async (req, res) => {
  const input = privacySchema.parse(req.body);
  const settings = await prisma.privacySettings.upsert({
    where: { userId: req.authUser!.id },
    create: { userId: req.authUser!.id, ...input },
    update: input,
  });
  res.json({ settings });
}));

api.get("/plans", asyncRoute(async (req, res) => {
  const category = typeof req.query.category === "string" ? req.query.category : undefined;
  const plans = await prisma.plan.findMany({
    where: {
      visibility: "PUBLIC",
      startsAt: { gte: new Date() },
      expiresAt: { gt: new Date() },
      ...(category ? { category: { equals: category, mode: "insensitive" as const } } : {}),
    },
    take: 30,
    orderBy: { startsAt: "asc" },
    select: {
      id: true,
      title: true,
      description: true,
      category: true,
      startsAt: true,
      expiresAt: true,
      maxParticipants: true,
      approximateArea: true,
      creator: {
        select: {
          id: true,
          displayName: true,
          privacy: { select: { showApproximateArea: true } },
        },
      },
      _count: { select: { participants: true } },
    },
  });
  res.json({
    plans: plans.map(({ creator, ...plan }) => {
      const { privacy, ...publicCreator } = creator;
      return {
        ...plan,
        creator: publicCreator,
        approximateArea: privacy?.showApproximateArea === false
          ? "Area not shared"
          : plan.approximateArea,
      };
    }),
  });
}));

api.get("/plans/mine", requireAuth, asyncRoute(async (req, res) => {
  const memberships = await prisma.planParticipant.findMany({
    where: { userId: req.authUser!.id, plan: { expiresAt: { gt: new Date() } } },
    take: 30,
    orderBy: { joinedAt: "desc" },
    select: {
      joinedAt: true,
      plan: {
        select: {
          id: true,
          title: true,
          description: true,
          category: true,
          startsAt: true,
          expiresAt: true,
          approximateArea: true,
          creatorId: true,
          creator: { select: { id: true, displayName: true } },
          _count: { select: { participants: true } },
        },
      },
    },
  });
  res.json({ plans: memberships.map(({ plan }) => plan) });
}));

api.post("/plans", requireAuth, writeLimiter, asyncRoute(async (req, res) => {
  const input = planSchema.parse(req.body);
  const plan = await prisma.plan.create({
    data: {
      ...input,
      creatorId: req.authUser!.id,
      participants: { create: { userId: req.authUser!.id } },
      conversation: {
        create: { participants: { create: { userId: req.authUser!.id } } },
      },
    },
    select: {
      id: true,
      title: true,
      category: true,
      startsAt: true,
      expiresAt: true,
      approximateArea: true,
      maxParticipants: true,
    },
  });
  res.status(201).json({ plan });
}));

api.post("/plans/:planId/join", requireAuth, writeLimiter, asyncRoute(async (req, res) => {
  const { message } = joinSchema.parse(req.body);
  const plan = await prisma.plan.findUnique({
    where: { id: routeParam(req, "planId") },
    select: { id: true, creatorId: true, visibility: true, expiresAt: true, maxParticipants: true },
  });
  if (!plan || plan.visibility !== "PUBLIC" || plan.expiresAt <= new Date()) {
    throw new HttpError(404, "Plan not found.");
  }
  if (plan.creatorId === req.authUser!.id) throw new HttpError(409, "You created this plan.");
  const block = await prisma.userBlock.findFirst({
    where: {
      OR: [
        { blockerId: req.authUser!.id, blockedId: plan.creatorId },
        { blockerId: plan.creatorId, blockedId: req.authUser!.id },
      ],
    },
  });
  if (block) throw new HttpError(404, "Plan not found.");
  const participant = await prisma.planParticipant.findUnique({
    where: { planId_userId: { planId: plan.id, userId: req.authUser!.id } },
  });
  if (participant) throw new HttpError(409, "You are already part of this plan.");

  try {
    const request = await prisma.planJoinRequest.create({
      data: { planId: plan.id, requesterId: req.authUser!.id, message },
      select: { id: true, status: true, createdAt: true },
    });
    res.status(201).json({ request });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new HttpError(409, "You have already requested to join this plan.");
    }
    throw error;
  }
}));

api.get("/plans/:planId/requests", requireAuth, asyncRoute(async (req, res) => {
  const plan = await prisma.plan.findUnique({
    where: { id: routeParam(req, "planId") },
    select: { creatorId: true },
  });
  if (!plan) throw new HttpError(404, "Plan not found.");
  if (plan.creatorId !== req.authUser!.id) throw new HttpError(403, "Only the plan creator can view requests.");

  const requests = await prisma.planJoinRequest.findMany({
    where: { planId: routeParam(req, "planId") },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      message: true,
      status: true,
      createdAt: true,
      requester: { select: { id: true, displayName: true } },
    },
  });
  res.json({ requests });
}));

api.patch("/plans/:planId/requests/:requestId", requireAuth, writeLimiter, asyncRoute(async (req, res) => {
  const { status } = reviewSchema.parse(req.body);
  try {
    const result = await prisma.$transaction(async (tx) => {
      const plan = await tx.plan.findUnique({
        where: { id: routeParam(req, "planId") },
        select: { id: true, creatorId: true, maxParticipants: true, expiresAt: true },
      });
      if (!plan) throw new HttpError(404, "Plan not found.");
      if (plan.creatorId !== req.authUser!.id) throw new HttpError(403, "Only the plan creator can review requests.");
      if (plan.expiresAt <= new Date()) throw new HttpError(409, "This plan has expired.");

      const request = await tx.planJoinRequest.findFirst({
        where: { id: routeParam(req, "requestId"), planId: plan.id },
      });
      if (!request || request.status !== "PENDING") throw new HttpError(404, "Pending request not found.");

      if (status === "ACCEPTED") {
        const participantCount = await tx.planParticipant.count({ where: { planId: plan.id } });
        if (participantCount >= plan.maxParticipants) throw new HttpError(409, "This plan is full.");
        await tx.planParticipant.create({ data: { planId: plan.id, userId: request.requesterId } });
        const conversation = await tx.conversation.upsert({
          where: { planId: plan.id },
          create: {
            planId: plan.id,
            participants: { create: [{ userId: plan.creatorId }, { userId: request.requesterId }] },
          },
          update: {},
          select: { id: true },
        });
        await tx.conversationParticipant.upsert({
          where: { conversationId_userId: { conversationId: conversation.id, userId: request.requesterId } },
          create: { conversationId: conversation.id, userId: request.requesterId },
          update: {},
        });
      }

      return tx.planJoinRequest.update({
        where: { id: request.id },
        data: { status },
        select: { id: true, status: true, updatedAt: true },
      });
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    res.json({ request: result });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034") {
      throw new HttpError(409, "The plan changed while this request was being handled. Please retry.");
    }
    throw error;
  }
}));

api.get("/plans/:planId/messages", requireAuth, asyncRoute(async (req, res) => {
  const conversation = await prisma.conversation.findUnique({
    where: { planId: routeParam(req, "planId") },
    select: { id: true },
  });
  if (!conversation) throw new HttpError(404, "Plan conversation not found.");
  const membership = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId: conversation.id, userId: req.authUser!.id } },
  });
  if (!membership) throw new HttpError(403, "You are not a participant in this plan conversation.");
  await ensureConversationIsUnblocked(conversation.id, req.authUser!.id);

  const cursor = typeof req.query.before === "string" ? req.query.before : undefined;
  const messages = await prisma.message.findMany({
    where: { conversationId: conversation.id },
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    take: 50,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    select: {
      id: true,
      body: true,
      createdAt: true,
      sender: { select: { id: true, displayName: true } },
    },
  });
  res.json({ messages: messages.reverse(), nextCursor: messages.length === 50 ? messages[0]?.id ?? null : null });
}));

api.post("/plans/:planId/messages", requireAuth, writeLimiter, asyncRoute(async (req, res) => {
  const { body } = messageSchema.parse(req.body);
  const conversation = await prisma.conversation.findUnique({
    where: { planId: routeParam(req, "planId") },
    select: { id: true },
  });
  if (!conversation) throw new HttpError(404, "Plan conversation not found.");
  const membership = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId: conversation.id, userId: req.authUser!.id } },
  });
  if (!membership) throw new HttpError(403, "You are not a participant in this plan conversation.");
  await ensureConversationIsUnblocked(conversation.id, req.authUser!.id);
  const message = await prisma.message.create({
    data: { conversationId: conversation.id, senderId: req.authUser!.id, body },
    select: {
      id: true,
      body: true,
      createdAt: true,
      sender: { select: { id: true, displayName: true } },
    },
  });
  res.status(201).json({ message });
}));

api.get("/communities", asyncRoute(async (req, res) => {
  const category = typeof req.query.category === "string" ? req.query.category : undefined;
  const communities = await prisma.community.findMany({
    where: { isPublic: true, ...(category ? { category: { equals: category, mode: "insensitive" as const } } : {}) },
    take: 30,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      description: true,
      category: true,
      createdAt: true,
      creator: { select: { id: true, displayName: true } },
      _count: { select: { memberships: true } },
    },
  });
  res.json({ communities });
}));

api.get("/communities/mine", requireAuth, asyncRoute(async (req, res) => {
  const memberships = await prisma.communityMember.findMany({
    where: { userId: req.authUser!.id },
    take: 100,
    orderBy: { joinedAt: "desc" },
    select: { communityId: true },
  });
  res.json({ communityIds: memberships.map(({ communityId }) => communityId) });
}));

api.post("/communities", requireAuth, writeLimiter, asyncRoute(async (req, res) => {
  const input = communitySchema.parse(req.body);
  const community = await prisma.community.create({
    data: {
      ...input,
      creatorId: req.authUser!.id,
      memberships: { create: { userId: req.authUser!.id } },
    },
    select: { id: true, name: true, description: true, category: true, isPublic: true, createdAt: true },
  });
  res.status(201).json({ community });
}));

api.post("/communities/:communityId/join", requireAuth, writeLimiter, asyncRoute(async (req, res) => {
  const community = await prisma.community.findUnique({
    where: { id: routeParam(req, "communityId") },
    select: { id: true, isPublic: true },
  });
  if (!community || !community.isPublic) throw new HttpError(404, "Community not found.");
  try {
    await prisma.communityMember.create({
      data: { communityId: community.id, userId: req.authUser!.id },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new HttpError(409, "You are already a member of this community.");
    }
    throw error;
  }
  res.status(201).json({ joined: true });
}));

api.get("/users/search", requireAuth, asyncRoute(async (req, res) => {
  const query = typeof req.query.query === "string" ? req.query.query.trim() : "";
  if (query.length < 2 || query.length > 40) {
    throw new HttpError(400, "Search text must be between 2 and 40 characters.");
  }
  const users = await prisma.user.findMany({
    where: {
      id: { not: req.authUser!.id },
      displayName: { contains: query, mode: "insensitive" },
      privacy: { is: { discoverable: true } },
      blocksSent: { none: { blockedId: req.authUser!.id } },
      blocksRecv: { none: { blockerId: req.authUser!.id } },
    },
    take: 20,
    orderBy: { displayName: "asc" },
    select: { id: true, displayName: true },
  });
  res.json({ users });
}));

api.get("/friends", requireAuth, asyncRoute(async (req, res) => {
  const requests = await prisma.friendRequest.findMany({
    where: {
      status: "ACCEPTED",
      OR: [{ requesterId: req.authUser!.id }, { recipientId: req.authUser!.id }],
    },
    take: 100,
    orderBy: { createdAt: "desc" },
    select: {
      requesterId: true,
      requester: { select: { id: true, displayName: true } },
      recipient: { select: { id: true, displayName: true } },
    },
  });
  res.json({
    friends: requests.map((request) => ({
      id: request.requesterId === req.authUser!.id ? request.recipient.id : request.requester.id,
      displayName: request.requesterId === req.authUser!.id
        ? request.recipient.displayName
        : request.requester.displayName,
    })),
  });
}));

api.get("/friend-requests", requireAuth, asyncRoute(async (req, res) => {
  const direction = req.query.direction === "sent" ? "sent" : "received";
  const requests = await prisma.friendRequest.findMany({
    where: {
      status: "PENDING",
      ...(direction === "sent"
        ? { requesterId: req.authUser!.id }
        : { recipientId: req.authUser!.id }),
    },
    take: 50,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      status: true,
      createdAt: true,
      requesterId: true,
      requester: { select: { id: true, displayName: true } },
      recipient: { select: { id: true, displayName: true } },
    },
  });
  res.json({
    requests: requests.map((request) => ({
      id: request.id,
      status: request.status,
      createdAt: request.createdAt,
      user: direction === "sent" ? request.recipient : request.requester,
    })),
  });
}));

api.post("/users/:userId/friend-requests", requireAuth, writeLimiter, asyncRoute(async (req, res) => {
  const userId = routeParam(req, "userId");
  if (userId === req.authUser!.id) throw new HttpError(400, "You cannot add yourself as a friend.");
  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, privacy: { select: { allowFriendRequests: true } } },
  });
  if (!target || target.privacy?.allowFriendRequests === false) {
    throw new HttpError(404, "User not found.");
  }
  const block = await prisma.userBlock.findFirst({
    where: {
      OR: [
        { blockerId: req.authUser!.id, blockedId: target.id },
        { blockerId: target.id, blockedId: req.authUser!.id },
      ],
    },
  });
  if (block) throw new HttpError(404, "User not found.");

  const [outgoing, incoming] = await Promise.all([
    prisma.friendRequest.findUnique({
      where: { requesterId_recipientId: { requesterId: req.authUser!.id, recipientId: target.id } },
    }),
    prisma.friendRequest.findUnique({
      where: { requesterId_recipientId: { requesterId: target.id, recipientId: req.authUser!.id } },
    }),
  ]);
  if (outgoing?.status === "ACCEPTED" || incoming?.status === "ACCEPTED") {
    throw new HttpError(409, "You are already friends.");
  }
  if (incoming?.status === "PENDING") {
    const request = await prisma.friendRequest.update({
      where: { id: incoming.id },
      data: { status: "ACCEPTED" },
      select: { id: true, status: true },
    });
    res.status(200).json({ request });
    return;
  }
  if (outgoing?.status === "PENDING") {
    throw new HttpError(409, "You have already sent a friend request.");
  }

  const request = await prisma.friendRequest.upsert({
    where: { requesterId_recipientId: { requesterId: req.authUser!.id, recipientId: target.id } },
    create: { requesterId: req.authUser!.id, recipientId: target.id },
    update: { status: "PENDING", createdAt: new Date() },
    select: { id: true, status: true, createdAt: true },
  });
  res.status(201).json({ request });
}));

api.patch("/friend-requests/:requestId", requireAuth, writeLimiter, asyncRoute(async (req, res) => {
  const { status } = friendReviewSchema.parse(req.body);
  const requestId = routeParam(req, "requestId");
  const request = await prisma.friendRequest.findUnique({
    where: { id: requestId },
    select: { id: true, requesterId: true, recipientId: true, status: true },
  });
  if (!request || request.recipientId !== req.authUser!.id || request.status !== "PENDING") {
    throw new HttpError(404, "Pending friend request not found.");
  }
  const block = await prisma.userBlock.findFirst({
    where: {
      OR: [
        { blockerId: req.authUser!.id, blockedId: request.requesterId },
        { blockerId: request.requesterId, blockedId: req.authUser!.id },
      ],
    },
  });
  if (block) throw new HttpError(404, "Pending friend request not found.");
  const updated = await prisma.friendRequest.update({
    where: { id: request.id },
    data: { status },
    select: { id: true, status: true, updatedAt: true },
  });
  res.json({ request: updated });
}));

api.delete("/friends/:userId", requireAuth, asyncRoute(async (req, res) => {
  const userId = routeParam(req, "userId");
  await prisma.friendRequest.deleteMany({
    where: {
      status: "ACCEPTED",
      OR: [
        { requesterId: req.authUser!.id, recipientId: userId },
        { requesterId: userId, recipientId: req.authUser!.id },
      ],
    },
  });
  res.status(204).end();
}));

api.post("/reports", requireAuth, writeLimiter, asyncRoute(async (req, res) => {
  const input = reportSchema.parse(req.body);
  const report = await prisma.userReport.create({
    data: { ...input, reporterId: req.authUser!.id },
    select: { id: true, status: true, createdAt: true },
  });
  res.status(201).json({ report });
}));

api.post("/users/:userId/block", requireAuth, asyncRoute(async (req, res) => {
  const userId = routeParam(req, "userId");
  if (userId === req.authUser!.id) throw new HttpError(400, "You cannot block your own account.");
  const target = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
  if (!target) throw new HttpError(404, "User not found.");
  try {
    await prisma.userBlock.create({ data: { blockerId: req.authUser!.id, blockedId: target.id } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new HttpError(409, "This user is already blocked.");
    }
    throw error;
  }
  await prisma.friendRequest.deleteMany({
    where: {
      OR: [
        { requesterId: req.authUser!.id, recipientId: target.id },
        { requesterId: target.id, recipientId: req.authUser!.id },
      ],
    },
  });
  res.status(201).json({ blocked: true });
}));

api.delete("/account", requireAuth, asyncRoute(async (req, res) => {
  await prisma.user.delete({ where: { id: req.authUser!.id } });
  res.clearCookie(sessionCookie, { httpOnly: true, secure: secureCookie, sameSite: "lax", path: "/" });
  res.status(204).end();
}));

app.use("/v1", api);
app.use((_req, _res, next) => next(new HttpError(404, "Endpoint not found.")));

const errorHandler: ErrorRequestHandler = (error: unknown, _req, res, _next) => {
  if (error instanceof ZodError) {
    res.status(400).json({ error: "Invalid request.", issues: error.issues });
    return;
  }
  if (error instanceof HttpError) {
    res.status(error.status).json({ error: error.message });
    return;
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
    res.status(404).json({ error: "The requested resource was not found." });
    return;
  }
  console.error("Unhandled API error", error);
  res.status(500).json({ error: "An unexpected server error occurred." });
};
app.use(errorHandler);

const server = app.listen(port, () => {
  console.log(`LazyBond API listening on port ${port}`);
});

const shutdown = () => {
  server.close(() => {
    void prisma.$disconnect().then(() => process.exit(0));
  });
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
