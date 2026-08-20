/**
 * Display rules for every figure the product shows.
 *
 * Amounts here are what a buyer weighs against the order they are about to place,
 * so they are formatted for reading rather than for precision theatre: enough
 * decimals to be honest, never so many that the eye has to count digits.
 */

import { UNITS_PER_USD } from "./score";

export function usdFromUnits(units: bigint): number {
  return Number(units) / UNITS_PER_USD;
}

/**
 * A bond amount as a buyer reads it. Cents are shown below a hundred dollars,
 * where they still change the decision, and dropped above it, where they only
 * make the number harder to compare against an order total.
 */
export function formatUsd(units: bigint): string {
  const usd = usdFromUnits(units);
  if (usd === 0) return "$0";
  if (usd < 0.01) return "<$0.01";
  if (usd < 100) return `$${usd.toFixed(2).replace(/0$/, "").replace(/\.$/, "")}`;
  return `$${Math.round(usd).toLocaleString("en-US")}`;
}

/** Shortens a base58 key to something a person can compare by eye. */
export function shortKey(key: string, lead = 4, tail = 4): string {
  if (key.length <= lead + tail + 1) return key;
  return `${key.slice(0, lead)}…${key.slice(-tail)}`;
}

const MINUTE = 60;
const HOUR = 3600;
const DAY = 86_400;

/** "3 days ago", "just now". Past tense only. */
export function timeAgo(unixSeconds: number, now = Date.now() / 1000): string {
  if (unixSeconds <= 0) return "never";
  const delta = Math.max(0, now - unixSeconds);
  if (delta < MINUTE) return "just now";
  if (delta < HOUR) return `${Math.floor(delta / MINUTE)} min ago`;
  if (delta < DAY) return `${Math.floor(delta / HOUR)} hr ago`;
  const days = Math.floor(delta / DAY);
  if (days < 60) return `${days} day${days === 1 ? "" : "s"} ago`;
  const months = Math.floor(days / 30);
  if (months < 24) return `${months} month${months === 1 ? "" : "s"} ago`;
  return `${Math.floor(months / 12)} years ago`;
}

/** "6d 4h left". Used for the withdrawal notice, which is the tensest number here. */
export function timeLeft(unixSeconds: number, now = Date.now() / 1000): string {
  const delta = unixSeconds - now;
  if (delta <= 0) return "elapsed";
  const days = Math.floor(delta / DAY);
  const hours = Math.floor((delta % DAY) / HOUR);
  const minutes = Math.floor((delta % HOUR) / MINUTE);
  if (days > 0) return `${days}d ${hours}h left`;
  if (hours > 0) return `${hours}h ${minutes}m left`;
  return `${minutes}m left`;
}

/** Absolute date, for anything a buyer might screenshot as evidence. */
export function formatDate(unixSeconds: number): string {
  if (unixSeconds <= 0) return "—";
  return new Date(unixSeconds * 1000).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
