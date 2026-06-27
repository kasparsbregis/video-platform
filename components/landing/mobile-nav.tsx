"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { IconClose, IconMenu } from "./icons";

const links = [
  { href: "#how-it-works", label: "How It Works" },
  { href: "#exercises", label: "Exercises" },
  { href: "#programs", label: "Programs" },
  { href: "#pdf", label: "PDF Export" },
  { href: "#faq", label: "FAQ" },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="nav-mobile">
      <button
        type="button"
        className="nav-menu-btn"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <IconClose className="nav-menu-icon" /> : <IconMenu className="nav-menu-icon" />}
      </button>

      {open && (
        <div className="nav-drawer" role="dialog" aria-modal="true" aria-label="Navigation menu">
          <ul className="nav-drawer-links">
            {links.map((link) => (
              <li key={link.href}>
                <a href={link.href} onClick={() => setOpen(false)}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <Link href="/login" className="btn btn-primary btn-full" onClick={() => setOpen(false)}>
            Get Started
          </Link>
        </div>
      )}
    </div>
  );
}
