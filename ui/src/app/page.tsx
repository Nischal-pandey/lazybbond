import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Bike,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Coffee,
  Compass,
  Heart,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Users,
  Volleyball,
} from "lucide-react";
import { DownloadButton } from "@/components/download-button";
import { MobileMenu } from "@/components/mobile-menu";
import { Reveal, RevealSection } from "@/components/reveal";
import { Showcase } from "@/components/showcase";
import { Wordmark } from "@/components/wordmark";

const features = [
  {
    icon: Compass,
    label: "Find your next thing",
    title: "Plans worth leaving home for.",
    description:
      "From a quick coffee to a Saturday hike, find people nearby who are genuinely ready to go.",
    className: "feature-lavender",
    visual: (
      <div className="mini-plan-list">
        <div className="mini-plan">
          <span className="mini-icon mini-coffee"><Coffee size={17} /></span>
          <div><b>Coffee & a catch-up</b><small>0.8 mi · Today, 4:30 PM</small></div>
          <span className="mini-avatar avatar-one">A</span>
        </div>
        <div className="mini-plan">
          <span className="mini-icon mini-bike"><Bike size={17} /></span>
          <div><b>Easy riverside ride</b><small>1.2 mi · Sat, 9:00 AM</small></div>
          <span className="mini-avatar avatar-two">M</span>
        </div>
      </div>
    ),
  },
  {
    icon: Users,
    label: "Better together",
    title: "Meet through the things you love.",
    description:
      "Join welcoming communities around food, fitness, film, and all the little things that make you, you.",
    className: "feature-peach",
    visual: (
      <div className="community-stack">
        <div className="community-bubble community-food"><Coffee size={23} /><span>Good Food Club</span><small>128 members</small></div>
        <div className="community-bubble community-move"><Volleyball size={23} /><span>Move More</span><small>84 members</small></div>
        <div className="community-bubble community-film"><Sparkles size={22} /><span>Indie Film Nights</span><small>56 members</small></div>
      </div>
    ),
  },
  {
    icon: MessageCircle,
    label: "Make it real",
    title: "A chat with somewhere to go.",
    description:
      "Every plan has its own conversation. Sort out the details, say hello, and show up together.",
    className: "feature-blue",
    visual: (
      <div className="chat-preview">
        <div className="chat-line chat-in">Still on for the little bookshop café? <small>3:12</small></div>
        <div className="chat-line chat-out">Wouldn’t miss it ☕ <small>3:14 · Seen</small></div>
        <div className="chat-typing"><i /><i /><i /><span>Sam is typing</span></div>
      </div>
    ),
  },
];

const steps = [
  { number: "01", icon: MapPin, title: "See what’s on", text: "Explore plans around your area or choose a place that works for you." },
  { number: "02", icon: Heart, title: "Find your people", text: "Join a plan or start one of your own. No awkward introductions needed." },
  { number: "03", icon: CalendarDays, title: "Make it happen", text: "Chat about the details, then get out there and enjoy the moment." },
];

const communities = [
  { icon: Coffee, title: "Coffee & conversations", meta: "Good brews, better company", color: "community-card-coffee" },
  { icon: Bike, title: "Outside, please", meta: "Fresh air for all levels", color: "community-card-outdoors" },
  { icon: Sparkles, title: "Screen & scene", meta: "Films, shows, and opinions", color: "community-card-film" },
];

const faqs = [
  { question: "What is LazyBond?", answer: "LazyBond helps you turn shared interests into real-life plans. Discover something happening nearby, invite others, and coordinate in a dedicated plan chat." },
  { question: "Is LazyBond available to download?", answer: "The Google Play listing is not configured yet. We’ll link directly to the verified app listing as soon as it’s published." },
  { question: "How does LazyBond protect my location?", answer: "Public discovery is designed around approximate areas rather than your live location. Exact meeting details should only be shared with people who are part of a plan." },
  { question: "Do I need a group of friends to get started?", answer: "Not at all. Browse an open plan, join a community around an interest, or post a simple idea and meet people who want to do the same thing." },
];

export default function Home() {
  return (
    <main>
      <section className="hero" id="home">
        <div className="hero-orb hero-orb-one" aria-hidden="true" />
        <div className="hero-orb hero-orb-two" aria-hidden="true" />
        <header className="nav-wrap">
          <nav className="nav" aria-label="Main navigation">
            <a className="brand-link" href="#home" aria-label="LazyBond home"><Wordmark inverse /></a>
            <div className="nav-links">
              <a href="#how-it-works">How it works</a>
              <a href="#discover">Discover</a>
              <a href="#safety">Safety</a>
              <a href="/login">Sign in</a>
            </div>
            <DownloadButton className="nav-download" />
            <MobileMenu />
          </nav>
        </header>

        <div className="hero-content">
          <div className="hero-copy">
            <div className="eyebrow hero-eyebrow"><span className="eyebrow-dot" /> GOOD PLANS. GOOD PEOPLE.</div>
            <h1>Make plans<br /><span>happen.</span></h1>
            <p className="hero-subtitle">A little less “we should sometime.”<br className="desktop-break" /> A lot more “see you there.”</p>
            <div className="hero-actions">
              <DownloadButton className="play-button" />
              <a className="text-link" href="#how-it-works">See how it works <ArrowDown size={16} /></a>
            </div>
            <div className="hero-pills" aria-label="Explore LazyBond features">
              <span><MapPin size={14} /> Nearby plans</span>
              <span><Users size={14} /> Your people</span>
              <span><MessageCircle size={14} /> Plan chats</span>
            </div>
          </div>

          <div className="hero-visual" aria-label="Preview of the LazyBond app">
            <div className="hero-sparkle sparkle-a">✳</div>
            <div className="hero-sparkle sparkle-b">✦</div>
            <div className="phone-shadow" />
            <div className="phone">
              <div className="phone-notch" />
              <div className="phone-screen">
                <div className="phone-status"><span>9:41</span><span>●●● ▰</span></div>
                <div className="phone-greeting"><small>MONDAY, OCTOBER 28</small><b>What sounds good?</b></div>
                <div className="phone-search"><Compass size={15} /><span>Plans near you</span><span className="phone-search-filter">≡</span></div>
                <div className="phone-section-title">HAPPENING SOON <a href="#discover">See all</a></div>
                <div className="phone-plan-card">
                  <div className="phone-plan-art art-coffee"><Coffee size={31} /></div>
                  <div className="phone-plan-info"><small>COFFEE · IN 30 MIN</small><b>Afternoon pick-me-up</b><span><MapPin size={11} /> 0.6 mi away</span></div>
                  <div className="phone-join">Join <ArrowUpRight size={12} /></div>
                </div>
                <div className="phone-plan-card">
                  <div className="phone-plan-art art-game"><Volleyball size={31} /></div>
                  <div className="phone-plan-info"><small>SPORTS · 5:30 PM</small><b>Casual volleyball</b><span><MapPin size={11} /> Riverside courts</span></div>
                  <div className="phone-join">Join <ArrowUpRight size={12} /></div>
                </div>
                <div className="phone-section-title phone-community-title">YOUR COMMUNITIES <a href="#communities">View all</a></div>
                <div className="phone-community-row"><span className="phone-community-icon"><Users size={15} /></span><span><b>Good Food Club</b><small>2 plans this week</small></span><ChevronRight size={16} /></div>
                <div className="phone-tabbar"><span className="tab-active"><Compass size={16} />Explore</span><span><Users size={16} />Community</span><span><MessageCircle size={16} />Inbox</span><span><Heart size={16} />You</span></div>
              </div>
            </div>
            <div className="float-card float-card-plan"><span className="float-card-icon"><Coffee size={18} /></span><span><b>Coffee in 30?</b><small>3 people are going</small></span><span className="float-card-check"><Check size={14} /></span></div>
            <div className="float-card float-card-people"><span className="avatar-cluster"><i>J</i><i>A</i><i>M</i></span><span><b>Your kind of people</b><small>Found around the corner</small></span></div>
          </div>
        </div>
        <div className="hero-bottom">
          <span>REAL PLANS, WITH REAL PEOPLE</span>
          <span className="hero-bottom-line" />
          <span>MADE FOR SHOWING UP <ArrowDown size={13} /></span>
        </div>
      </section>

      <RevealSection className="intro-section section-wrap">
        <p className="eyebrow"><span className="eyebrow-dot" /> THE BEST PART IS BEING THERE</p>
        <h2>Less scrolling.<br /><span>More stories.</span></h2>
        <p className="intro-description">We make it easier to go from “that sounds fun” to actually doing it. Find a plan that fits your day, meet someone new, and make ordinary moments a little less ordinary.</p>
        <a className="underlined-link" href="#how-it-works">A simpler way to make plans <ArrowRight size={16} /></a>
      </RevealSection>

      <section className="showcase-section" id="discover">
        <Reveal className="section-wrap showcase-heading">
          <div><p className="eyebrow"><span className="eyebrow-dot" /> A SNEAK PEEK</p><h2>See it in<br /><span>action.</span></h2></div>
          <p>Little plans. Shared interests.<br />A much better reason to leave the house.</p>
        </Reveal>
        <Reveal><Showcase /></Reveal>
        <Reveal className="showcase-caption"><span><ChevronLeft size={15} /> SWIPE TO EXPLORE <ChevronRight size={15} /></span><span>01 — 04</span></Reveal>
      </section>

      <RevealSection className="features-section section-wrap" id="features">
        <div className="features-heading">
          <div><p className="eyebrow"><span className="eyebrow-dot" /> A BETTER WAY TO GET TOGETHER</p><h2>Good things happen<br />when you <span>show up.</span></h2></div>
          <p>Big plans or last-minute ones. Find your people, pick a place, and let the rest fall into place.</p>
        </div>
        <Reveal className="feature-grid">
          {features.map(({ icon: Icon, label, title, description, className, visual }) => (
            <article className={`feature-card ${className}`} key={title}>
              <div className="feature-visual">{visual}</div>
              <div className="feature-copy"><p className="eyebrow"><Icon size={14} /> {label}</p><h3>{title}</h3><p>{description}</p><a href="#download" aria-label={`Learn more: ${title}`}><ArrowUpRight size={19} /></a></div>
            </article>
          ))}
        </Reveal>
      </RevealSection>

      <section className="how-section" id="how-it-works">
        <Reveal className="how-top section-wrap">
          <div><p className="eyebrow"><span className="eyebrow-dot" /> THREE LITTLE STEPS</p><h2>From “maybe”<br />to <span>“see you there.”</span></h2></div>
          <p>No complicated setup. No pressure to be someone you’re not. Just an easier way to make time for the things you enjoy.</p>
        </Reveal>
        <Reveal className="steps section-wrap">
          {steps.map(({ number, icon: Icon, title, text }) => <article className="step" key={number}><span className="step-number">{number}</span><div className="step-icon"><Icon size={24} /></div><h3>{title}</h3><p>{text}</p></article>)}
        </Reveal>
      </section>

      <RevealSection className="community-section section-wrap" id="communities">
        <div className="community-heading"><div><p className="eyebrow"><span className="eyebrow-dot" /> FIND YOUR CORNER</p><h2>There’s a group<br />for <span>your kind of thing.</span></h2></div><a className="underlined-link" href="#download">Explore communities <ArrowRight size={16} /></a></div>
        <Reveal className="community-grid">
          {communities.map(({ icon: Icon, title, meta, color }) => <article className={`community-card ${color}`} key={title}><div className="community-art"><Icon size={30} strokeWidth={1.6} /><span className="art-sun" /></div><div className="community-info"><span><b>{title}</b><small>{meta}</small></span><ArrowUpRight size={19} /></div></article>)}
        </Reveal>
        <p className="demo-note">Illustrative examples — real communities will appear when the app is available.</p>
      </RevealSection>

      <section className="comparison-section">
        <Reveal className="section-wrap comparison-inner">
          <div className="comparison-heading">
            <p className="eyebrow"><span className="eyebrow-dot" /> THE POINT IS GETTING TOGETHER</p>
            <h2>Not another chat<br />that <span>goes nowhere.</span></h2>
            <p>Skip the “we should hang out” loop. Start with something you actually want to do.</p>
          </div>
          <div className="comparison-table">
            <div className="comparison-row">
              <span className="comparison-label"><MessageCircle size={17} /> Group chats</span>
              <span>48 messages. Still no plan.</span><span className="comparison-mark">–</span>
            </div>
            <div className="comparison-row">
              <span className="comparison-label"><Heart size={17} /> Dating apps</span>
              <span>Start with a profile.</span><span className="comparison-mark">–</span>
            </div>
            <div className="comparison-row">
              <span className="comparison-label"><CalendarDays size={17} /> Event apps</span>
              <span>Start with a ticket.</span><span className="comparison-mark">–</span>
            </div>
            <div className="comparison-row comparison-lazybond">
              <span className="comparison-label"><Wordmark compact /></span>
              <span>Start with a plan you can join.</span>
              <span className="comparison-check"><Check size={17} /></span>
            </div>
          </div>
        </Reveal>
      </section>

      <RevealSection className="safety-section section-wrap" id="safety">
        <div className="safety-icon"><ShieldCheck size={30} /></div>
        <div className="safety-copy"><p className="eyebrow"><span className="eyebrow-dot" /> GOOD VIBES, WITH GOOD GUARDRAILS</p><h2>Feeling comfortable<br />is part of <span>the plan.</span></h2><p>Meeting someone new should feel good. Privacy and personal choice belong in every part of the experience.</p></div>
        <div className="safety-points"><div><Check size={16} /><span>Choose what you share</span></div><div><Check size={16} /><span>Approximate public locations</span></div><div><Check size={16} /><span>Plan-specific conversations</span></div><a href="#faq">Read our safety approach <ArrowRight size={15} /></a></div>
      </RevealSection>

      <RevealSection className="faq-section section-wrap" id="faq">
        <div className="faq-heading"><p className="eyebrow"><span className="eyebrow-dot" /> THE LITTLE DETAILS</p><h2>Good questions.<br /><span>Honest answers.</span></h2></div>
        <div className="faq-list">{faqs.map(({ question, answer }) => <details className="faq-item" key={question}><summary>{question}<span>+</span></summary><p>{answer}</p></details>)}</div>
      </RevealSection>

      <RevealSection className="download-section section-wrap" id="download">
        <div className="download-deco download-deco-one" /><div className="download-deco download-deco-two" />
        <p className="eyebrow"><span className="eyebrow-dot" /> YOUR NEXT GOOD DAY IS OUT THERE</p>
        <h2>Got a plan?<br /><span>Make it happen.</span></h2>
        <p className="download-copy">Find people who are up for the same things.<br />Your next plan could start right here.</p>
        <DownloadButton className="download-cta" />
        <p className="download-footnote">Free to download · A real-world kind of social</p>
      </RevealSection>

      <footer className="footer">
        <div className="footer-top"><a className="brand-link footer-brand" href="#home" aria-label="LazyBond home"><Wordmark /></a><p>Less “sometime.” More <span>“see you there.”</span></p><DownloadButton className="footer-download" /></div>
        <div className="footer-bottom"><span>© 2026 LazyBond · Make plans happen</span><nav aria-label="Footer navigation"><a href="#download">Download</a><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="#contact">Contact</a></nav><a href="#home" className="back-top">Back to top ↑</a><span id="contact" className="contact-status">Contact details will be added before launch.</span></div>
      </footer>
    </main>
  );
}
