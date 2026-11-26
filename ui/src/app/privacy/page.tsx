import Link from "next/link";
import { Wordmark } from "@/components/wordmark";

export default function PrivacyPage() {
  return (
    <main className="legal-page">
      <header><Link href="/" aria-label="LazyBond home"><Wordmark /></Link><Link href="/">Back to LazyBond</Link></header>
      <article><p className="eyebrow"><span className="eyebrow-dot" /> PRIVACY</p><h1>Your plans are yours.</h1><p className="legal-updated">Draft overview · October 2026</p>
        <div className="legal-notice"><b>Launch note</b><p>This page describes the current prototype, not a complete legal privacy notice. A reviewed policy with the operating entity, lawful basis, retention schedule, processors, and user-rights process must be published before public launch.</p></div>
        <h2>Information in this preview</h2><p>The API stores account email, display name, an Argon2id password hash, opaque session-token hashes, plans, join requests, community memberships, plan messages, privacy preferences, blocks, and submitted reports in PostgreSQL. Passwords and raw session tokens are not stored in the database.</p>
        <h2>Location and plans</h2><p>Public plan responses include an approximate area label and do not return coordinates. The current creation flow does not collect latitude or longitude. Avoid posting a private address or other sensitive meeting details in public plan fields.</p>
        <h2>Messages and reports</h2><p>Plan messages are returned only to accepted conversation participants. Reports are stored for a future moderation workflow; this preview does not yet include a moderation queue or response-time commitment.</p>
        <h2>Your choices</h2><p>You can change your display name and available discovery preferences in the API. Account deletion removes the user's database record and associated records configured for cascading deletion. A self-service data export and a complete account/privacy settings screen are not yet available.</p>
        <h2>Contact</h2><p>Contact details will be published before launch. Do not use the preview for urgent safety reports.</p>
        <Link className="legal-back" href="/">Return to LazyBond <span>→</span></Link>
      </article>
    </main>
  );
}
