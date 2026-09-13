"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { CompassIcon } from "@/components/CompassIcon";

export default function UnlockPage() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error || "Falsche PIN");
        setBusy(false);
        return;
      }
      router.replace("/");
      router.refresh();
    } catch {
      setError("Netzwerkfehler — bitte nochmals versuchen.");
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-leather px-4 text-paper">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm rounded-sm border border-gold/30 bg-leather-2 p-6 shadow-2xl"
      >
        <div className="mb-5 flex items-center gap-3">
          <CompassIcon className="h-10 w-10 shrink-0" />
          <div>
            <h1 className="font-display text-lg tracking-wide text-gold">RDR2 Map</h1>
            <p className="text-xs text-paper-dim">PIN eingeben, um die Karte zu öffnen</p>
          </div>
        </div>
        <label htmlFor="pin" className="sr-only">
          PIN
        </label>
        <input
          id="pin"
          name="pin"
          type="password"
          inputMode="numeric"
          autoComplete="one-time-code"
          autoFocus
          maxLength={12}
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
          className="w-full rounded-sm border border-gold/35 bg-ink/60 px-3 py-3 text-center font-mono text-xl tracking-[0.4em] outline-none focus:border-gold"
        />
        {error && <p className="mt-3 text-center text-sm text-red-300">{error}</p>}
        <button
          type="submit"
          disabled={busy || pin.length < 4}
          className="mt-5 w-full rounded-sm border border-gold bg-gold/20 py-2.5 text-sm font-semibold uppercase tracking-wide text-gold hover:bg-gold/30 disabled:opacity-40"
        >
          {busy ? "Prüfen…" : "Öffnen"}
        </button>
      </form>
    </div>
  );
}
