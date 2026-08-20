"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "motion/react";

/**
 * The one thing a first-time visitor should be able to do without reading
 * anything: type the handle a seller gave them and find out what stands behind
 * it. Everything else on the page is secondary to this field.
 */
export function HandleLookup({ autoFocus = false }: { autoFocus?: boolean }) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  const clean = value.trim().toLowerCase().replace(/^@/, "");
  const valid = /^[a-z0-9._-]{1,32}$/.test(clean);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!clean) {
      setError("Type the handle the seller gave you.");
      return;
    }
    if (!valid) {
      setError("Handles use lowercase letters, digits, dot, underscore or hyphen.");
      return;
    }
    setError(null);
    router.push(`/s/${clean}`);
  }

  return (
    <form onSubmit={submit} className="w-full max-w-lg">
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint">
            bondmark.app/s/
          </span>
          <input
            autoFocus={autoFocus}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              if (error) setError(null);
            }}
            placeholder="seller-handle"
            aria-label="Seller handle"
            spellCheck={false}
            autoCapitalize="none"
            autoComplete="off"
            className="figure h-14 w-full rounded-xl border border-rule-strong bg-surface pl-[122px] pr-4 text-[15px] text-ink shadow-[var(--shadow-card)] outline-none transition-colors placeholder:text-ink-faint focus:border-bond"
          />
        </div>

        <motion.button
          type="submit"
          whileTap={{ scale: 0.98 }}
          className="h-14 shrink-0 rounded-xl bg-ink px-7 text-[15px] font-medium text-paper transition-colors hover:bg-bond"
        >
          Check it
        </motion.button>
      </div>

      <div className="mt-2.5 min-h-5 text-sm">
        {error ? (
          <span className="text-claim">{error}</span>
        ) : (
          <span className="text-ink-faint">
            Nothing to install, no account needed. Try{" "}
            <button
              type="button"
              onClick={() => setValue("warung.mirna")}
              className="underline decoration-rule-strong underline-offset-2 transition-colors hover:text-ink"
            >
              warung.mirna
            </button>{" "}
            to see a live profile.
          </span>
        )}
      </div>
    </form>
  );
}
