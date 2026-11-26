"use client";

import { Menu, X } from "lucide-react";
import { useState } from "react";

export function MobileMenu() {
  const [open, setOpen] = useState(false);

  const closeMenu = () => setOpen(false);

  return (
    <div className="mobile-menu">
      <button
        className="mobile-menu-trigger"
        type="button"
        aria-label={open ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={open}
        aria-controls="mobile-navigation"
        onClick={() => setOpen(!open)}
      >
        {open ? <X size={21} /> : <Menu size={21} />}
      </button>
      {open && (
        <nav className="mobile-menu-panel" id="mobile-navigation" aria-label="Mobile navigation">
          <a href="#how-it-works" onClick={closeMenu}>How it works</a>
          <a href="#discover" onClick={closeMenu}>Discover</a>
          <a href="#safety" onClick={closeMenu}>Safety</a>
          <a href="/login" onClick={closeMenu}>Sign in</a>
          <a href="#download" onClick={closeMenu}>Get the app</a>
        </nav>
      )}
    </div>
  );
}
