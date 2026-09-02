import { useState } from "react";
import { List, X } from "@phosphor-icons/react";

const LINKS = [
  { href: "#capabilities", label: "Capabilities" },
  { href: "#work", label: "Work" },
];

export function ConcreteNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b-2 border-foreground bg-background">
      <div className="flex items-center justify-between px-6 py-4 md:px-10">
        <a href="#top" className="font-display text-xl tracking-tight">
          TECHPOTAM
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="text-sm font-bold uppercase tracking-wide underline decoration-2 underline-offset-4 hover:text-primary">
              {l.label}
            </a>
          ))}
        </nav>

        <a href="#contact" className="concrete-block hidden border-2 border-foreground bg-primary px-5 py-2 text-sm font-bold uppercase tracking-wide text-primary-foreground md:inline-flex">
          Contact
        </a>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center border-2 border-foreground md:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <List className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t-2 border-foreground md:hidden">
          <div className="flex flex-col gap-5 px-6 py-6">
            {LINKS.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="text-lg font-bold uppercase">
                {l.label}
              </a>
            ))}
            <a href="#contact" onClick={() => setOpen(false)} className="text-lg font-bold uppercase text-primary">
              Contact
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
