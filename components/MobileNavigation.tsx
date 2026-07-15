"use client";

import { useState } from "react";

export function MobileNavigation() {
  const [open, setOpen] = useState(false);

  return (
    <div className="mobile-nav">
      <button
        className="menu-toggle"
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen((value) => !value)}
      >
        {open ? "Close" : "Menu"}
      </button>
      {open && (
        <nav id="mobile-menu" aria-label="Mobile navigation">
          <a href="#menu" onClick={() => setOpen(false)}>Menu</a>
          <a href="#story" onClick={() => setOpen(false)}>Our story</a>
          <a href="#visit" onClick={() => setOpen(false)}>Visit</a>
        </nav>
      )}
    </div>
  );
}
