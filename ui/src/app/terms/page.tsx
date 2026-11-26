import Link from "next/link";
import { Wordmark } from "@/components/wordmark";

export default function TermsPage() {
  return (
    <main className="legal-page">
      <header><Link href="/" aria-label="LazyBond home"><Wordmark /></Link><Link href="/">Back to LazyBond</Link></header>
      <article><p className="eyebrow"><span className="eyebrow-dot" /> TERMS</p><h1>A few ground rules.</h1><p className="legal-updated">Draft overview · October 2026</p>
        <div className="legal-notice"><b>Launch note</b><p>This is a product preview, not a complete legal agreement. Final terms, operator details, dispute processes, and jurisdiction must be reviewed and published before public launch.</p></div>
        <h2>Be kind, be real</h2><p>Use LazyBond respectfully, provide accurate information, and only join plans you intend to attend. Do not harass, threaten, impersonate, or share another person's private information.</p>
        <h2>Meeting in person</h2><p>Use your judgment when meeting someone new. Choose public places, arrange your own transport, and let someone you trust know your plans. LazyBond is not an emergency service and cannot guarantee another person's conduct.</p>
        <h2>Preview functionality</h2><p>This preview includes account, plan, community, and plan-chat features, but it does not yet include verified accounts, mature moderation operations, real-time chat delivery, password recovery, or a published mobile app. Do not rely on it for urgent communication or safety monitoring.</p>
        <h2>Changes and contact</h2><p>Final terms and contact details will be provided before launch.</p>
        <Link className="legal-back" href="/">Return to LazyBond <span>→</span></Link>
      </article>
    </main>
  );
}
