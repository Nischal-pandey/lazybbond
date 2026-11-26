"use client";

import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  ChevronDown,
  Coffee,
  LoaderCircle,
  MapPin,
  MessageCircle,
  Plus,
  Search,
  Send,
  Shield,
  Users,
  UserPlus,
  UserRound,
  X,
} from "lucide-react";
import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import { Wordmark } from "@/components/wordmark";

type User = { id: string; displayName: string; email: string };
type Plan = {
  id: string;
  title: string;
  description: string;
  category: string;
  startsAt: string;
  expiresAt: string;
  approximateArea: string;
  creatorId?: string;
  creator: { id: string; displayName: string };
  _count: { participants: number };
};
type Community = {
  id: string;
  name: string;
  description: string;
  category: string;
  creator: { id: string; displayName: string };
  _count: { memberships: number };
};
type ChatMessage = { id: string; body: string; createdAt: string; sender: { id: string; displayName: string } };
type JoinRequest = { id: string; status: string; message: string | null; requester: { id: string; displayName: string } };
type Section = "plans" | "mine" | "communities" | "people";

export function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [section, setSection] = useState<Section>("plans");
  const [plans, setPlans] = useState<Plan[]>([]);
  const [mine, setMine] = useState<Plan[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [communityIds, setCommunityIds] = useState<string[]>([]);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [openChat, setOpenChat] = useState<string | null>(null);
  const [requestsFor, setRequestsFor] = useState<string | null>(null);
  const [requests, setRequests] = useState<JoinRequest[]>([]);

  const loadData = useCallback(async () => {
    const [profile, planData, mineData, communityData, myCommunities] = await Promise.all([
      apiRequest<{ user: User }>("/auth/me"),
      apiRequest<{ plans: Plan[] }>("/plans"),
      apiRequest<{ plans: Plan[] }>("/plans/mine"),
      apiRequest<{ communities: Community[] }>("/communities"),
      apiRequest<{ communityIds: string[] }>("/communities/mine"),
    ]);
    setUser(profile.user);
    setPlans(planData.plans);
    setMine(mineData.plans);
    setCommunities(communityData.communities);
    setCommunityIds(myCommunities.communityIds);
  }, []);

  useEffect(() => {
    loadData().catch((reason: unknown) => {
      setError(reason instanceof Error ? reason.message : "Could not load your LazyBond account.");
      if (reason instanceof Error && reason.message === "Authentication required.") {
        window.location.assign("/login");
      }
    }).finally(() => setBusy(false));
  }, [loadData]);

  async function logout() {
    await apiRequest("/auth/logout", { method: "POST" });
    window.location.assign("/");
  }

  async function refresh() {
    setNotice("");
    await loadData();
  }

  if (busy) {
    return <main className="dashboard-loading"><LoaderCircle className="spin" size={25} /><span>Getting your plans ready…</span></main>;
  }

  return (
    <main className="dashboard-page">
      <header className="dashboard-nav">
        <Link href="/" aria-label="LazyBond home"><Wordmark /></Link>
        <div className="dashboard-user"><span className="user-avatar">{user?.displayName.slice(0, 1).toUpperCase() ?? "L"}</span><span>{user?.displayName ?? "LazyBond member"}</span><button type="button" onClick={logout}>Sign out</button></div>
      </header>
      <div className="dashboard-layout">
        <aside className="dashboard-sidebar">
          <p className="sidebar-label">YOUR SPACE</p>
          <button className={section === "plans" ? "active" : ""} type="button" onClick={() => setSection("plans")}><MapPin size={17} /> Discover plans</button>
          <button className={section === "mine" ? "active" : ""} type="button" onClick={() => setSection("mine")}><CalendarDays size={17} /> Your plans <span>{mine.length}</span></button>
          <button className={section === "communities" ? "active" : ""} type="button" onClick={() => setSection("communities")}><Users size={17} /> Communities</button>
          <button className={section === "people" ? "active" : ""} type="button" onClick={() => setSection("people")}><UserRound size={17} /> People</button>
          <div className="sidebar-safety"><Shield size={17} /><b>A quick safety note</b><p>Meet in public places, keep your location private, and tell someone where you’re going.</p><Link href="/#safety">Read safety tips <ArrowRight size={13} /></Link></div>
          <Link className="sidebar-home" href="/"><ArrowLeft size={15} /> Back to LazyBond</Link>
        </aside>
        <section className="dashboard-main">
          <div className="dashboard-heading">
            <div><p className="eyebrow"><span className="eyebrow-dot" /> {section === "plans" ? "A LITTLE SOMETHING NEARBY" : section === "mine" ? "YOUR PLANS, YOUR PEOPLE" : "FIND YOUR CORNER"}</p><h1>{section === "plans" ? "What sounds good?" : section === "mine" ? "Your plans." : "Communities."}</h1><p>{section === "plans" ? "Browse plans and find people who are up for the same thing." : section === "mine" ? "All the plans you’ve created or joined." : "Meet people around the things you enjoy."}</p></div>
            {section === "plans" && <CreatePlan onCreated={refresh} />}
          </div>
          {notice && <p className="dashboard-notice" role="status">{notice}</p>}
          {error && <p className="form-error dashboard-error" role="alert">{error}</p>}
          {section === "plans" && <PlanList plans={plans} onAction={async (message) => { setNotice(message); await refresh(); }} />}
          {section === "mine" && <div className="dashboard-list">{mine.length ? mine.map((plan) => <article className="dashboard-plan-card" key={plan.id}><PlanDetails plan={plan} /><div className="plan-actions"><button type="button" onClick={() => setOpenChat(plan.id)}><MessageCircle size={15} /> Plan chat</button>{plan.creatorId === user?.id && <button className="secondary-action" type="button" onClick={() => { setRequestsFor(plan.id); void loadRequests(plan.id, setRequests, setError); }}>Join requests <ChevronDown size={15} /></button>}</div>{requestsFor === plan.id && <RequestList requests={requests} planId={plan.id} onUpdated={async () => { await refresh(); await loadRequests(plan.id, setRequests, setError); }} setError={setError} />}</article>) : <EmptyState text="You haven’t joined a plan yet. There’s always something good to start." action={() => setSection("plans")} label="Find a plan" />}</div>}
          {section === "communities" && <CommunityList communities={communities} communityIds={communityIds} onAction={async (message) => { setNotice(message); await refresh(); }} onCreated={refresh} />}
          {section === "people" && <NetworkPanel />}
          <p className="dashboard-demo-note">Plan areas and people shown here are user-provided. Public discovery displays approximate areas only.</p>
        </section>
      </div>
      {openChat && <ChatPanel plan={mine.find((plan) => plan.id === openChat)!} userId={user?.id ?? ""} onClose={() => setOpenChat(null)} />}
    </main>
  );
}

function PlanDetails({ plan }: { plan: Plan }) {
  const date = new Date(plan.startsAt);
  return (
    <div className="dashboard-plan-details">
      <span className="plan-category-icon"><Coffee size={20} /></span>
      <div className="dashboard-plan-copy"><span className="plan-category">{plan.category} · {date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}</span><h2>{plan.title}</h2><p>{plan.description}</p><div className="plan-meta"><span><MapPin size={13} /> {plan.approximateArea}</span><span><Users size={13} /> {plan._count.participants} going</span><span><CalendarDays size={13} /> {date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}</span></div></div>
    </div>
  );
}

function PlanList({ plans, onAction }: { plans: Plan[]; onAction: (message: string) => Promise<void> }) {
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function join(plan: Plan) {
    setPending(plan.id);
    setError("");
    try {
      await apiRequest(`/plans/${plan.id}/join`, { method: "POST", body: JSON.stringify({}) });
      await onAction(`Your request to join “${plan.title}” is on its way.`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not send join request.");
    } finally {
      setPending(null);
    }
  }

  return <div className="dashboard-list">{error && <p className="form-error" role="alert">{error}</p>}{plans.length ? plans.map((plan) => <article className="dashboard-plan-card" key={plan.id}><PlanDetails plan={plan} /><button className="join-plan-button" type="button" disabled={pending === plan.id} onClick={() => void join(plan)}>{pending === plan.id ? <LoaderCircle size={15} className="spin" /> : <Plus size={16} />} Ask to join</button></article>) : <div className="dashboard-empty"><span><Coffee size={23} /></span><b>No open plans just yet.</b><p>Try again soon, or start a plan of your own.</p></div>}</div>;
}

function CommunityList({ communities, communityIds, onAction, onCreated }: { communities: Community[]; communityIds: string[]; onAction: (message: string) => Promise<void>; onCreated: () => Promise<void> }) {
  const [error, setError] = useState("");
  const [pending, setPending] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);

  async function createCommunity(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const data = new FormData(event.currentTarget);
    try {
      await apiRequest("/communities", {
        method: "POST",
        body: JSON.stringify({
          name: data.get("name"),
          description: data.get("description"),
          category: data.get("category"),
          isPublic: true,
        }),
      });
      setCreating(false);
      await onCreated();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not create community.");
    } finally {
      setSaving(false);
    }
  }

  return <>
    <div className="community-dashboard-toolbar"><span>Shared interests make a good place to start.</span><button className="create-plan-trigger" type="button" onClick={() => setCreating(true)}><Plus size={16} /> Start a community</button></div>
    {error && !creating && <p className="form-error community-list-error" role="alert">{error}</p>}
    <div className="community-dashboard-grid">{communities.length ? communities.map((community) => {
      const joined = communityIds.includes(community.id);
      return <article className="community-dashboard-card" key={community.id}><span className="community-dashboard-icon"><Users size={21} /></span><span className="plan-category">{community.category} · {community._count.memberships} members</span><h2>{community.name}</h2><p>{community.description}</p><span className="community-host">Started by {community.creator.displayName}</span><button type="button" disabled={joined || pending === community.id} onClick={async () => { setPending(community.id); setError(""); try { await apiRequest(`/communities/${community.id}/join`, { method: "POST", body: JSON.stringify({}) }); await onAction(`You joined ${community.name}.`); } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not join community."); } finally { setPending(null); } }}>{pending === community.id ? <LoaderCircle size={15} className="spin" /> : joined ? <Check size={15} /> : <Plus size={15} />}{joined ? "Joined" : "Join community"}</button></article>;
    }) : <div className="dashboard-empty community-empty"><span><Users size={23} /></span><b>No public communities just yet.</b><p>Create the first one around something you love.</p></div>}</div>
    {creating && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setCreating(false); }}><section className="form-modal" role="dialog" aria-modal="true" aria-labelledby="create-community-title"><button className="modal-close" type="button" aria-label="Close form" onClick={() => setCreating(false)}><X size={19} /></button><p className="eyebrow"><span className="eyebrow-dot" /> FIND YOUR CORNER</p><h2 id="create-community-title">Bring your people together.</h2><form onSubmit={createCommunity}><label>Community name<input name="name" placeholder="Good Food Club" minLength={3} maxLength={70} required /></label><label>What’s it about?<textarea name="description" placeholder="Tell people what brings this community together." minLength={10} maxLength={600} required /></label><label>Category<select name="category" defaultValue="Food"><option>Food</option><option>Travel</option><option>Fitness</option><option>Movies</option><option>Coffee</option><option>Outdoors</option><option>Other</option></select></label>{error && <p className="form-error" role="alert">{error}</p>}<button className="form-submit" type="submit" disabled={saving}>{saving ? <LoaderCircle size={16} className="spin" /> : <Plus size={16} />} Create community</button></form></section></div>}
  </>;
}

function NetworkPanel() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<User[]>([]);
  const [friends, setFriends] = useState<User[]>([]);
  const [requests, setRequests] = useState<Array<{ id: string; user: User }>>([]);
  const [sentRequests, setSentRequests] = useState<Array<{ id: string; user: User }>>([]);
  const [sentIds, setSentIds] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [searching, setSearching] = useState(false);

  const loadNetwork = useCallback(async () => {
    const [friendList, received, sent] = await Promise.all([
      apiRequest<{ friends: User[] }>("/friends"),
      apiRequest<{ requests: Array<{ id: string; user: User }> }>("/friend-requests"),
      apiRequest<{ requests: Array<{ id: string; user: User }> }>("/friend-requests?direction=sent"),
    ]);
    setFriends(friendList.friends);
    setRequests(received.requests);
    setSentRequests(sent.requests);
  }, []);

  useEffect(() => {
    loadNetwork().catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Could not load your people."));
  }, [loadNetwork]);

  async function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = query.trim();
    if (normalized.length < 2) {
      setError("Enter at least two characters to search.");
      return;
    }
    setSearching(true);
    setError("");
    try {
      const response = await apiRequest<{ users: User[] }>(`/users/search?query=${encodeURIComponent(normalized)}`);
      setResults(response.users);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not search for people.");
    } finally {
      setSearching(false);
    }
  }

  async function sendRequest(user: User) {
    setError("");
    try {
      await apiRequest(`/users/${user.id}/friend-requests`, { method: "POST", body: JSON.stringify({}) });
      setSentIds((current) => [...current, user.id]);
      await loadNetwork();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not send friend request.");
    }
  }

  async function reviewRequest(requestId: string, status: "ACCEPTED" | "DECLINED") {
    setError("");
    try {
      await apiRequest(`/friend-requests/${requestId}`, { method: "PATCH", body: JSON.stringify({ status }) });
      await loadNetwork();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not update friend request.");
    }
  }

  async function removeFriend(friend: User) {
    setError("");
    try {
      await apiRequest(`/friends/${friend.id}`, { method: "DELETE" });
      await loadNetwork();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not remove friend.");
    }
  }

  return <div className="network-panel">
    <form className="people-search" onSubmit={search}><label htmlFor="people-query">Find people</label><div><Search size={17} /><input id="people-query" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by display name" minLength={2} maxLength={40} /><button type="submit" disabled={searching}>{searching ? <LoaderCircle size={16} className="spin" /> : "Search"}</button></div></form>
    {error && <p className="form-error" role="alert">{error}</p>}
    {results.length > 0 && <section className="network-section"><h2>Search results</h2><div className="people-list">{results.map((person) => {
      const alreadyFriend = friends.some((friend) => friend.id === person.id);
      const requestPending = requests.some((request) => request.user.id === person.id)
        || sentRequests.some((request) => request.user.id === person.id)
        || sentIds.includes(person.id);
      return <article className="person-card" key={person.id}><span className="person-avatar">{person.displayName.slice(0, 1).toUpperCase()}</span><div><b>{person.displayName}</b><small>LazyBond member</small></div><button type="button" disabled={alreadyFriend || requestPending} onClick={() => void sendRequest(person)}>{alreadyFriend ? <Check size={15} /> : <UserPlus size={15} />}{alreadyFriend ? "Friends" : requestPending ? "Requested" : "Add friend"}</button></article>;
    })}</div></section>}
    {requests.length > 0 && <section className="network-section"><h2>Friend requests <span>{requests.length}</span></h2><div className="people-list">{requests.map(({ id, user }) => <article className="person-card" key={id}><span className="person-avatar">{user.displayName.slice(0, 1).toUpperCase()}</span><div><b>{user.displayName}</b><small>Wants to connect</small></div><button type="button" onClick={() => void reviewRequest(id, "ACCEPTED")}><Check size={15} /> Accept</button><button className="person-decline" type="button" aria-label={`Decline request from ${user.displayName}`} onClick={() => void reviewRequest(id, "DECLINED")}><X size={15} /></button></article>)}</div></section>}
    <section className="network-section"><h2>Your people <span>{friends.length}</span></h2>{friends.length ? <div className="people-list">{friends.map((friend) => <article className="person-card" key={friend.id}><span className="person-avatar">{friend.displayName.slice(0, 1).toUpperCase()}</span><div><b>{friend.displayName}</b><small>Friend</small></div><button className="person-remove" type="button" onClick={() => void removeFriend(friend)}>Remove</button></article>)}</div> : <div className="dashboard-empty"><span><Users size={23} /></span><b>Your people will show up here.</b><p>Search by name to connect with people you know.</p></div>}</section>
  </div>;
}

function CreatePlan({ onCreated }: { onCreated: () => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const data = new FormData(event.currentTarget);
    const startsAt = new Date(String(data.get("startsAt")));
    try {
      await apiRequest("/plans", {
        method: "POST",
        body: JSON.stringify({
          title: data.get("title"),
          description: data.get("description"),
          category: data.get("category"),
          startsAt: startsAt.toISOString(),
          expiresAt: new Date(startsAt.getTime() + 2 * 60 * 60 * 1000).toISOString(),
          maxParticipants: Number(data.get("maxParticipants")),
          approximateArea: data.get("approximateArea"),
          visibility: "PUBLIC",
        }),
      });
      setOpen(false);
      await onCreated();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not create your plan.");
    } finally {
      setBusy(false);
    }
  }

  return <>
    <button className="create-plan-trigger" type="button" onClick={() => setOpen(true)}><Plus size={17} /> Make a plan</button>
    {open && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}><section className="form-modal" role="dialog" aria-modal="true" aria-labelledby="create-plan-title"><button className="modal-close" type="button" aria-label="Close form" onClick={() => setOpen(false)}><X size={19} /></button><p className="eyebrow"><span className="eyebrow-dot" /> QUICK PLAN</p><h2 id="create-plan-title">What are you up for?</h2><form onSubmit={submit}><label>Plan name<input name="title" placeholder="Coffee in 30 minutes?" minLength={4} maxLength={80} required /></label><label>Details<textarea name="description" placeholder="A few more details for the people joining." minLength={8} maxLength={1000} required /></label><div className="form-row"><label>Category<select name="category" defaultValue="Coffee"><option>Coffee</option><option>Food</option><option>Fitness</option><option>Outdoors</option><option>Movies</option><option>Travel</option><option>Other</option></select></label><label>People max<input name="maxParticipants" type="number" min={2} max={50} defaultValue={5} required /></label></div><div className="form-row"><label>Approximate area<input name="approximateArea" placeholder="e.g. Downtown" minLength={2} maxLength={120} required /></label><label>Starts<input name="startsAt" type="datetime-local" required /></label></div>{error && <p className="form-error" role="alert">{error}</p>}<button className="form-submit" type="submit" disabled={busy}>{busy ? <LoaderCircle size={16} className="spin" /> : <Plus size={16} />} Create plan</button></form></section></div>}
  </>;
}

async function loadRequests(planId: string, setRequests: (requests: JoinRequest[]) => void, setError: (message: string) => void) {
  setError("");
  try {
    const result = await apiRequest<{ requests: JoinRequest[] }>(`/plans/${planId}/requests`);
    setRequests(result.requests);
  } catch (reason) {
    setError(reason instanceof Error ? reason.message : "Could not load join requests.");
  }
}

function RequestList({ requests, planId, onUpdated, setError }: { requests: JoinRequest[]; planId: string; onUpdated: () => Promise<void>; setError: (message: string) => void }) {
  return <div className="join-requests"><b>Requests to join</b>{requests.filter((request) => request.status === "PENDING").length ? requests.filter((request) => request.status === "PENDING").map((request) => <div className="join-request" key={request.id}><span><b>{request.requester.displayName}</b><small>{request.message || "Would like to join your plan."}</small></span><button type="button" aria-label={`Accept ${request.requester.displayName}`} onClick={() => void reviewRequest(planId, request.id, "ACCEPTED", onUpdated, setError)}><Check size={16} /></button><button type="button" aria-label={`Decline ${request.requester.displayName}`} onClick={() => void reviewRequest(planId, request.id, "DECLINED", onUpdated, setError)}><X size={16} /></button></div>) : <p>No pending requests yet.</p>}</div>;
}

async function reviewRequest(planId: string, requestId: string, status: "ACCEPTED" | "DECLINED", onUpdated: () => Promise<void>, setError: (message: string) => void) {
  try {
    await apiRequest(`/plans/${planId}/requests/${requestId}`, { method: "PATCH", body: JSON.stringify({ status }) });
    await onUpdated();
  } catch (reason) {
    setError(reason instanceof Error ? reason.message : "Could not update request.");
  }
}

function ChatPanel({ plan, userId, onClose }: { plan: Plan; userId: string; onClose: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  const loadMessages = useCallback(async () => {
    const result = await apiRequest<{ messages: ChatMessage[] }>(`/plans/${plan.id}/messages`);
    setMessages(result.messages);
  }, [plan.id]);

  useEffect(() => {
    loadMessages().catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Could not load the plan chat."));
    const timer = window.setInterval(() => {
      loadMessages().catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Could not refresh the plan chat."));
    }, 5000);
    return () => window.clearInterval(timer);
  }, [loadMessages]);

  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const body = String(new FormData(form).get("body") ?? "").trim();
    if (!body) return;
    setSending(true);
    setError("");
    try {
      await apiRequest(`/plans/${plan.id}/messages`, { method: "POST", body: JSON.stringify({ body }) });
      form.reset();
      await loadMessages();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not send message.");
    } finally {
      setSending(false);
    }
  }

  return <div className="chat-backdrop"><section className="chat-modal" role="dialog" aria-modal="true" aria-labelledby="chat-title"><header><span className="chat-modal-icon"><MessageCircle size={19} /></span><div><h2 id="chat-title">{plan.title}</h2><p>Plan chat · members only</p></div><button type="button" aria-label="Close chat" onClick={onClose}><X size={19} /></button></header><div className="chat-message-list" aria-live="polite">{messages.map((message) => <div className={`chat-message ${message.sender.id === userId ? "chat-message-own" : ""}`} key={message.id}><b>{message.sender.displayName}</b><p>{message.body}</p><small>{new Date(message.createdAt).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}</small></div>)}{!messages.length && !error && <div className="chat-empty"><span><MessageCircle size={20} /></span><b>Say hello to the group.</b><small>Keep it kind and plan-specific.</small></div>}</div>{error && <p className="form-error chat-error" role="alert">{error}</p>}<form className="chat-composer" onSubmit={send}><input name="body" placeholder="Write a message…" aria-label="Write a message" maxLength={2000} required /><button type="submit" aria-label="Send message" disabled={sending}>{sending ? <LoaderCircle size={17} className="spin" /> : <Send size={17} />}</button></form></section></div>;
}

function EmptyState({ text, action, label }: { text: string; action: () => void; label: string }) {
  return <div className="dashboard-empty"><span><Coffee size={23} /></span><b>{text}</b><button type="button" onClick={action}>{label} <ArrowRight size={14} /></button></div>;
}
