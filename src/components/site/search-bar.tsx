"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Clock, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { getSearchSuggestions } from "@/lib/actions/search";

const RECENT_KEY = "beltyx-recent-searches";
const MAX_RECENT = 5;

interface Suggestion {
  id: string;
  slug: string;
  name: string;
  image: string | null;
}

function readRecent(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function writeRecent(term: string) {
  try {
    const existing = readRecent().filter((t) => t.toLowerCase() !== term.toLowerCase());
    const next = [term, ...existing].slice(0, MAX_RECENT);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    // ignore storage failures (private mode, etc.)
  }
}

export function SearchBar({ autoFocus, onNavigate }: { autoFocus?: boolean; onNavigate?: () => void }) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [suggestions, setSuggestions] = React.useState<Suggestion[]>([]);
  const [recent, setRecent] = React.useState<string[]>([]);
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setRecent(readRecent());
  }, []);

  React.useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    const handle = setTimeout(() => {
      getSearchSuggestions(query.trim()).then(setSuggestions);
    }, 250);
    return () => clearTimeout(handle);
  }, [query]);

  React.useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function goToSearch(term: string) {
    const trimmed = term.trim();
    if (!trimmed) return;
    writeRecent(trimmed);
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    setOpen(false);
    onNavigate?.();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    goToSearch(query);
  }

  const showDropdown = open && (suggestions.length > 0 || (query.trim().length === 0 && recent.length > 0));

  return (
    <div ref={containerRef} className="relative mx-auto max-w-7xl">
      <form onSubmit={handleSubmit} className="relative">
        <Input
          autoFocus={autoFocus}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder="Search for wallets, belts, card holders..."
          className="h-11 w-full rounded-full pl-10"
        />
        <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
      </form>

      {showDropdown && (
        <div className="absolute inset-x-0 top-full z-10 mt-2 max-h-96 overflow-y-auto rounded-2xl bg-popover p-2 shadow-lg ring-1 ring-border">
          {query.trim().length === 0 && recent.length > 0 && (
            <div className="mb-1">
              <p className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase">Recent Searches</p>
              {recent.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => goToSearch(term)}
                  className="flex w-full items-center gap-2 rounded-xl px-2 py-2 text-left text-sm hover:bg-muted"
                >
                  <Clock className="size-3.5 text-muted-foreground" />
                  {term}
                </button>
              ))}
            </div>
          )}

          {suggestions.map((s) => (
            <Link
              key={s.id}
              href={`/product/${s.slug}`}
              onClick={() => {
                writeRecent(query.trim());
                setOpen(false);
                onNavigate?.();
              }}
              className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-muted"
            >
              <div className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-muted">
                {s.image && <Image src={s.image} alt={s.name} fill sizes="40px" className="object-cover" />}
              </div>
              <span className="text-sm">{s.name}</span>
            </Link>
          ))}

          {query.trim().length >= 2 && (
            <button
              type="button"
              onClick={() => goToSearch(query)}
              className="mt-1 flex w-full items-center justify-between rounded-xl px-2 py-2 text-left text-sm text-accent hover:bg-muted"
            >
              Search for &ldquo;{query.trim()}&rdquo;
              <ArrowRight className="size-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
