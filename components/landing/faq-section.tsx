"use client";

import { useState } from "react";
import { IconChevron } from "./icons";

const faqs = [
  {
    q: "Who is this platform built for?",
    a: "Physiotherapists, sports physios, personal trainers, S&C coaches, athletic trainers, and rehabilitation clinics — anyone who prescribes movement and wants to deliver it through their own video demonstrations.",
  },
  {
    q: "Do I need to edit my exercise videos?",
    a: "No. Upload a single demonstration clip showing 3–5 full repetitions at natural tempo. The platform plays your original footage — no alternate modes or editing required.",
  },
  {
    q: "What can I attach to each exercise?",
    a: "Each exercise supports a demonstration video, spoken audio description, written text instructions, and up to four thumbnail frames selected from the video for previews and PDF export.",
  },
  {
    q: "How does program prescription work?",
    a: "Build programs in the admin panel by ordering exercises and prescribing reps or hold time, multiple sets, and progressive loading — for example 15 kg × 20, 20 kg × 15, 25 kg × 10.",
  },
  {
    q: "Is a PDF included with every program?",
    a: "Yes. When you save a program, a printable PDF is generated automatically with thumbnails, descriptions, and rep details — bundled alongside the video program.",
  },
  {
    q: "When can I get access?",
    a: "The administration panel and program builder are coming soon. Request early access to be notified when onboarding opens for movement professionals.",
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="faq-list">
      {faqs.map((faq, i) => {
        const isOpen = openIndex === i;
        return (
          <div key={faq.q} className={`faq-item${isOpen ? " is-open" : ""}`}>
            <button
              type="button"
              className="faq-trigger"
              aria-expanded={isOpen}
              onClick={() => setOpenIndex(isOpen ? null : i)}
            >
              <span>{faq.q}</span>
              <IconChevron className="faq-chevron" />
            </button>
            <div className="faq-panel" aria-hidden={!isOpen}>
              <div className="faq-panel-inner">
                <p>{faq.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
