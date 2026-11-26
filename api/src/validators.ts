import { z } from "zod";

export const registrationSchema = z.object({
  email: z.string().trim().pipe(z.email().max(254)).transform((email) => email.toLowerCase()),
  displayName: z.string().trim().min(2).max(50),
  password: z.string().min(12).max(128),
});

export const loginSchema = z.object({
  email: z.string().trim().pipe(z.email().max(254)).transform((email) => email.toLowerCase()),
  password: z.string().min(1).max(128),
});

export const planSchema = z.object({
  title: z.string().trim().min(4).max(80),
  description: z.string().trim().min(8).max(1000),
  category: z.string().trim().min(2).max(32),
  startsAt: z.iso.datetime().transform((value) => new Date(value)),
  expiresAt: z.iso.datetime().transform((value) => new Date(value)),
  maxParticipants: z.number().int().min(2).max(50),
  approximateArea: z.string().trim().min(2).max(120),
  visibility: z.enum(["PUBLIC", "COMMUNITY", "PRIVATE"]).default("PUBLIC"),
}).refine((value) => value.startsAt > new Date(), {
  path: ["startsAt"],
  message: "Plan start time must be in the future.",
}).refine((value) => value.expiresAt > value.startsAt, {
  path: ["expiresAt"],
  message: "Plan expiry must be after its start time.",
});

export const joinSchema = z.object({ message: z.string().trim().max(240).optional() });
export const reviewSchema = z.object({ status: z.enum(["ACCEPTED", "DECLINED"]) });
export const friendReviewSchema = z.object({ status: z.enum(["ACCEPTED", "DECLINED"]) });

export const communitySchema = z.object({
  name: z.string().trim().min(3).max(70),
  description: z.string().trim().min(10).max(600),
  category: z.string().trim().min(2).max(32),
  isPublic: z.boolean().default(true),
});

export const profileSchema = z.object({ displayName: z.string().trim().min(2).max(50) });

export const privacySchema = z.object({
  discoverable: z.boolean().optional(),
  showApproximateArea: z.boolean().optional(),
  allowFriendRequests: z.boolean().optional(),
}).refine((value) => Object.keys(value).length > 0);

export const reportSchema = z.object({
  targetType: z.enum(["user", "plan", "community", "message"]),
  targetId: z.string().min(1).max(64),
  reason: z.string().trim().min(3).max(80),
  details: z.string().trim().max(1000).optional(),
});

export const messageSchema = z.object({ body: z.string().trim().min(1).max(2000) });
