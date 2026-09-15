"use client";

import { useState } from "react";
import { MARKS, CASE_FACTS } from "@/lib/content";

export default function MarksReference() {
  const [open, setOpen] = useState(false);

  return (
    <div className="paper-card rounded-sm overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 font-chrome text-xs uppercase tracking-wide"
      >
        <span>The Three Marks &amp; Case File</span>
        <span className="text-gold text-base">{open ? "−" : "+"}</span>
      </button>
      {open && (
        <div className="px-4 pb-4 flex flex-col gap-3 text-sm border-t border-ink/10 pt-3">
          {MARKS.map((m) => (
            <div key={m.title}>
              <p className="font-chrome text-[11px] uppercase tracking-wide text-oxblood">{m.title}</p>
              <p className="leading-relaxed">{m.body}</p>
            </div>
          ))}
          <div>
            <p className="font-chrome text-[11px] uppercase tracking-wide text-oxblood mb-1">Fixed Facts</p>
            <ul className="flex flex-col gap-1">
              {CASE_FACTS.map((f) => (
                <li key={f} className="flex gap-2">
                  <span className="text-gold">✦</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
