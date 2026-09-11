import { useEffect, useState, type FormEvent } from "react";

const API_URL = import.meta.env.VITE_API_URL as string;

type BookingConfig = { active: boolean; durationMinutes: number; timezone: string };

const inputClass =
  "w-full rounded-lg border border-border bg-background/95 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/70 outline-none transition-colors focus:border-primary";

function nextDays(count: number) {
  const days: Date[] = [];
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  for (let i = 0; i < count; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    days.push(d);
  }
  return days;
}

function toDateKey(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Self-hosted replacement for the Calendly embed — reads availability from
 * our own backend (working hours minus existing bookings) and writes
 * straight to the Lead/LeadMeeting tables, so a booking shows up in the
 * admin exactly like a contact-form submission.
 */
export function BookingWidget() {
  const [config, setConfig] = useState<BookingConfig | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [slots, setSlots] = useState<string[] | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/api/booking/config`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setConfig(data))
      .catch(() => setConfig({ active: false, durationMinutes: 30, timezone: "UTC" }));
  }, []);

  const days = nextDays(21);

  useEffect(() => {
    if (!selectedDate) return;
    setSlots(null);
    setSelectedSlot(null);
    fetch(`${API_URL}/api/booking/slots?date=${selectedDate}`)
      .then((res) => (res.ok ? res.json() : { slots: [] }))
      .then((data) => setSlots(data.slots || []))
      .catch(() => setSlots([]));
  }, [selectedDate]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedSlot) return;
    const form = e.currentTarget;
    const data = new FormData(form);
    if (data.get("company")) return; // honeypot

    setStatus("submitting");
    setErrorMessage("");
    try {
      const res = await fetch(`${API_URL}/api/booking`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          phone: data.get("phone"),
          message: data.get("message"),
          startTime: selectedSlot,
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Something went wrong. Please try again later.");
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong. Please try again later.");
      // The slot may have just been taken by someone else — drop back to picking so they can choose another.
      setSelectedSlot(null);
    }
  }

  if (!config) {
    return <div className="flex min-h-[300px] items-center justify-center text-sm text-muted-foreground">Loading...</div>;
  }

  if (!config.active) {
    return (
      <div className="flex min-h-[200px] items-center justify-center p-6 text-center text-sm text-muted-foreground">
        Online booking isn't available right now — use the message form instead.
      </div>
    );
  }

  if (status === "success") {
    const when = selectedSlot
      ? new Date(selectedSlot).toLocaleString(undefined, { dateStyle: "full", timeStyle: "short" })
      : "";
    return (
      <div className="p-6 text-center">
        <p className="text-sm font-medium text-foreground">You're booked.</p>
        <p className="mt-1 text-sm text-muted-foreground">{when}</p>
        <p className="mt-3 text-xs text-muted-foreground">We've sent this to our team — you'll hear from us before the call.</p>
      </div>
    );
  }

  if (selectedSlot) {
    return (
      <form onSubmit={handleSubmit} className="space-y-3 p-6">
        <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 opacity-0" />
        <button
          type="button"
          onClick={() => setSelectedSlot(null)}
          className="text-xs text-muted-foreground transition-colors hover:text-primary"
        >
          ← Choose a different time
        </button>
        <p className="text-sm font-medium text-foreground">
          {new Date(selectedSlot).toLocaleString(undefined, { dateStyle: "full", timeStyle: "short" })}
        </p>
        <input type="text" name="name" placeholder="Your name" required className={inputClass} />
        <input type="email" name="email" placeholder="Your email" required className={inputClass} />
        <input type="tel" name="phone" placeholder="Phone (optional)" className={inputClass} />
        <textarea name="message" placeholder="Anything we should know before the call? (optional)" rows={3} className={inputClass} />
        {status === "error" && <p className="text-xs text-destructive">{errorMessage}</p>}
        <button
          type="submit"
          disabled={status === "submitting"}
          className="w-full rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-[var(--shadow-ember)] transition-transform duration-300 hover:scale-[1.02] disabled:opacity-60"
        >
          {status === "submitting" ? "Booking..." : "Confirm booking"}
        </button>
      </form>
    );
  }

  return (
    <div className="p-6">
      <div className="flex gap-2 overflow-x-auto pb-2">
        {days.map((d) => {
          const key = toDateKey(d);
          const active = key === selectedDate;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setSelectedDate(key)}
              className={`flex shrink-0 flex-col items-center rounded-xl border px-3 py-2 text-xs transition-colors ${
                active ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/50"
              }`}
            >
              <span className="uppercase tracking-wide">{d.toLocaleDateString(undefined, { weekday: "short" })}</span>
              <span className="mt-1 text-sm font-medium text-foreground">{d.getDate()}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 min-h-[140px]">
        {!selectedDate ? (
          <p className="text-sm text-muted-foreground">Pick a day above to see available times.</p>
        ) : slots === null ? (
          <p className="text-sm text-muted-foreground">Loading times...</p>
        ) : slots.length === 0 ? (
          <p className="text-sm text-muted-foreground">No times available this day — try another date.</p>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {slots.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSelectedSlot(s)}
                className="rounded-lg border border-border px-3 py-2 text-sm text-foreground transition-colors hover:border-primary hover:text-primary"
              >
                {new Date(s).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
