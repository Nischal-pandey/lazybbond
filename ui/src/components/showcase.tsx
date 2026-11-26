"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUpRight,
  Bike,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Coffee,
  MapPin,
  MessageCircle,
  Users,
} from "lucide-react";
import { useCallback, useState } from "react";
import { useReducedMotionPreference } from "@/hooks/use-reduced-motion";

const slides = [
  {
    eyebrow: "DISCOVER PLANS",
    title: "Something good\nis close by.",
    icon: MapPin,
    tone: "showcase-lilac",
    cards: [
      { icon: Coffee, label: "COFFEE · TODAY", title: "Coffee & a catch-up", detail: "A cozy spot, good conversation", badge: "3 going" },
      { icon: Bike, label: "OUTDOORS · SAT", title: "Easy morning ride", detail: "Riverside path · all levels", badge: "5 going" },
    ],
  },
  {
    eyebrow: "MAKE NEW FRIENDS",
    title: "Start with a\nshared interest.",
    icon: Users,
    tone: "showcase-peach",
    cards: [
      { icon: Users, label: "GOOD FOOD CLUB", title: "Sunday market stroll", detail: "Find the best little stalls", badge: "8 going" },
      { icon: Coffee, label: "BOOKISH PEOPLE", title: "Read & recharge", detail: "Bring a book and settle in", badge: "4 going" },
    ],
  },
  {
    eyebrow: "PLAN TOGETHER",
    title: "Make the group\nchat happen.",
    icon: MessageCircle,
    tone: "showcase-blue",
    cards: [
      { icon: CalendarDays, label: "YOUR PLAN CHAT", title: "Saturday picnic 🌿", detail: "The plan is on for 12:30", badge: "4 replies" },
      { icon: MessageCircle, label: "A LITTLE UPDATE", title: "I’ll bring something to share", detail: "Just now · Plan participants", badge: "Reply" },
    ],
  },
  {
    eyebrow: "FIND YOUR PEOPLE",
    title: "Your interests\nfeel at home.",
    icon: Users,
    tone: "showcase-green",
    cards: [
      { icon: Bike, label: "COMMUNITY", title: "Outside, please", detail: "Fresh air for all levels", badge: "84 people" },
      { icon: Coffee, label: "COMMUNITY", title: "Good Food Club", detail: "Markets, bites & new places", badge: "128 people" },
    ],
  },
];

export function Showcase() {
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState(0);
  const reduceMotion = useReducedMotionPreference();
  const SlideIcon = slides[active].icon;

  const goTo = useCallback((next: number) => {
    setDirection(next > active ? 1 : -1);
    setActive((next + slides.length) % slides.length);
  }, [active]);

  const swipeConfidence = (offset: number, velocity: number) =>
    Math.abs(offset) * velocity;

  return (
    <div className="showcase-carousel">
      <div
        className="showcase-viewport"
        role="region"
        aria-label="LazyBond app feature previews"
        aria-roledescription="carousel"
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") goTo(active + 1);
          if (event.key === "ArrowLeft") goTo(active - 1);
        }}
        tabIndex={0}
      >
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={active}
            className={`showcase-slide ${slides[active].tone}`}
            custom={direction}
            initial={{ opacity: 0, x: direction > 0 ? 50 : -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: direction > 0 ? -50 : 50 }}
            transition={{ duration: reduceMotion ? 0.12 : 0.35, ease: [0.22, 1, 0.36, 1] }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.75}
            onDragEnd={(_, info) => {
              const swipe = swipeConfidence(info.offset.x, info.velocity.x);
              if (swipe < -5000) goTo(active + 1);
              else if (swipe > 5000) goTo(active - 1);
            }}
            aria-roledescription="slide"
            aria-label={`${active + 1} of ${slides.length}: ${slides[active].eyebrow}`}
          >
            <div className="showcase-slide-copy">
              <span className="showcase-slide-label"><SlideIcon size={14} /> {slides[active].eyebrow}</span>
              <h3>{slides[active].title}</h3>
              <p>Demo preview — sample plans and activity shown for illustration.</p>
              <a className="showcase-link" href="#how-it-works">A little more about the app <ArrowUpRight size={16} /></a>
            </div>
            <div className="showcase-phone-wrap">
              <div className="showcase-phone">
                <div className="showcase-phone-top"><span>9:41</span><span>●●● ▰</span></div>
                <div className="showcase-phone-greeting"><small>GOOD AFTERNOON</small><b>Ready to get out?</b></div>
                <div className="showcase-phone-location"><MapPin size={13} /><span>Near you</span><span>Change</span></div>
                <div className="showcase-phone-label">PLANS YOU MIGHT LIKE <span>See all</span></div>
                {slides[active].cards.map(({ icon: Icon, label, title, detail, badge }) => (
                  <div className="showcase-plan" key={title}>
                    <span className="showcase-plan-icon"><Icon size={18} /></span>
                    <div className="showcase-plan-copy"><small>{label}</small><b>{title}</b><span>{detail}</span></div>
                    <span className="showcase-plan-badge">{badge}</span>
                  </div>
                ))}
                <div className="showcase-phone-tab"><span><MapPin size={15} />Explore</span><span><Users size={15} />People</span><span><MessageCircle size={15} />Chat</span></div>
              </div>
              <div className="showcase-notification"><span className="notification-dot" /><span><b>A plan for later?</b><small>There’s still time to join.</small></span><ArrowUpRight size={16} /></div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="showcase-controls">
        <button type="button" aria-label="Previous app preview" onClick={() => goTo(active - 1)}><ChevronLeft size={18} /></button>
        <div className="showcase-dots" role="group" aria-label="Choose app preview">
          {slides.map((slide, index) => <button key={slide.eyebrow} type="button" aria-label={`Show ${slide.eyebrow.toLowerCase()} preview`} aria-current={index === active} onClick={() => goTo(index)} />)}
        </div>
        <button type="button" aria-label="Next app preview" onClick={() => goTo(active + 1)}><ChevronRight size={18} /></button>
      </div>
    </div>
  );
}
