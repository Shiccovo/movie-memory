"use client";

import { useState, useEffect, useRef } from "react";
import { api, ApiError, type Fact } from "@/lib/api";

// How long (ms) to reuse a cached fact before fetching a new one
const FACT_CACHE_TTL = 30_000;

type FactCache = { fact: Fact; fetchedAt: number };

export default function DashboardClient({
  initialMovie,
}: {
  userId: string;
  initialMovie: string;
}) {
  // ─── Movie editing state ────────────────────────────────────────────────
  const [movie, setMovie] = useState(initialMovie);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(initialMovie);
  const [movieError, setMovieError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // ─── Fact state ──────────────────────────────────────────────────────────
  const [fact, setFact] = useState<Fact | null>(null);
  const [factLoading, setFactLoading] = useState(false);
  const [factError, setFactError] = useState<string | null>(null);

  // In-memory cache: survives re-renders, reset on movie change
  const cacheRef = useRef<FactCache | null>(null);

  // ─── Fetch fact (with 30s client-side cache) ─────────────────────────────
  async function fetchFact(force = false) {
    const now = Date.now();
    const cached = cacheRef.current;

    // Reuse cache if it's fresh and caller didn't force a refresh
    if (!force && cached && now - cached.fetchedAt < FACT_CACHE_TTL) {
      setFact(cached.fact);
      return;
    }

    setFactLoading(true);
    setFactError(null);

    try {
      const newFact = await api.getFact();
      cacheRef.current = { fact: newFact, fetchedAt: Date.now() };
      setFact(newFact);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Something went wrong fetching the fact.";
      setFactError(message);
    } finally {
      setFactLoading(false);
    }
  }

  // Load fact on first render
  useEffect(() => {
    fetchFact();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Movie edit handlers ──────────────────────────────────────────────────
  function startEditing() {
    setDraft(movie);
    setMovieError(null);
    setEditing(true);
  }

  function cancelEditing() {
    setEditing(false);
    setMovieError(null);
  }

  async function saveMovie() {
    const trimmed = draft.trim();

    // Client-side pre-validation (mirrors server rules)
    if (trimmed.length < 1) {
      setMovieError("Movie name is required.");
      return;
    }
    if (trimmed.length > 100) {
      setMovieError("Movie name must be 100 characters or fewer.");
      return;
    }

    // Optimistic update — immediately show the new value
    const previous = movie;
    setMovie(trimmed);
    setEditing(false);
    setSaving(true);

    try {
      await api.updateMovie(trimmed);
      // Movie changed → invalidate the fact cache so a new fact is generated
      cacheRef.current = null;
      setFact(null);
      fetchFact();
    } catch (err) {
      // Server rejected it — revert to the previous value
      setMovie(previous);
      setEditing(true);
      const message =
        err instanceof ApiError
          ? err.message
          : "Failed to save. Please try again.";
      setMovieError(message);
    } finally {
      setSaving(false);
    }
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8">
      {/* Movie section */}
      <section className="ios-card p-8 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-2xl font-bold">Favorite Movie</h2>
          {!editing && (
            <button
              onClick={startEditing}
              className="text-accent font-semibold text-base hover:scale-110 transition-transform active:scale-95"
            >
              ✏️ Edit
            </button>
          )}
        </div>

        {editing ? (
          <div className="space-y-5">
            <div className="space-y-3">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                maxLength={100}
                autoFocus
                className="ios-input text-xl"
                placeholder="Enter your favorite movie"
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-secondary font-medium">
                  {draft.length} / 100 characters
                </p>
                {draft.length > 90 && (
                  <p className="text-xs text-warning font-medium">
                    ⚠️ Approaching limit
                  </p>
                )}
              </div>
            </div>

            {movieError && (
              <div className="ios-card p-5 bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800">
                <p role="alert" className="text-danger font-semibold text-base">
                  {movieError}
                </p>
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={saveMovie}
                disabled={saving}
                className="ios-button flex-1 text-lg py-4 font-semibold"
              >
                {saving ? "💾 Saving…" : "💾 Save"}
              </button>
              <button
                onClick={cancelEditing}
                disabled={saving}
                className="ios-button-secondary flex-1 text-lg py-4 font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-blue-500/15 via-purple-500/10 to-blue-500/15 dark:from-blue-500/20 dark:via-purple-500/15 dark:to-blue-500/20 rounded-3xl p-8 border border-blue-200/50 dark:border-blue-800/50">
            <p className="text-5xl font-bold text-center break-words leading-relaxed">
              {movie}
            </p>
          </div>
        )}
      </section>

      {/* Fact section */}
      <section className="ios-card p-8 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-2xl font-bold">Fun Fact</h2>
          {fact?.cached && (
            <span className="text-xs text-warning font-semibold bg-orange-100/80 dark:bg-orange-950/80 px-3 py-1.5 rounded-full">
              📚 From Cache
            </span>
          )}
        </div>

        <div className="min-h-[140px] flex flex-col justify-between">
          {factLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="space-y-4 text-center">
                <div className="flex justify-center">
                  <div className="w-14 h-14 rounded-full border-3 border-accent/30 border-t-accent animate-spin-smooth"></div>
                </div>
                <p className="text-base text-secondary font-semibold">Generating amazing fact…</p>
              </div>
            </div>
          )}

          {factError && !factLoading && (
            <div className="bg-orange-50 dark:bg-orange-950 rounded-2xl p-6 border-2 border-orange-200 dark:border-orange-800">
              <p role="alert" className="text-warning font-semibold text-base">
                😕 {factError}
              </p>
            </div>
          )}

          {fact && !factLoading && (
            <div className="space-y-4">
              <p className="text-lg leading-relaxed font-medium">
                {fact.content}
              </p>
              {fact.cached && (
                <p className="text-xs text-secondary italic font-medium">
                  This fact was saved earlier. New facts are temporarily unavailable.
                </p>
              )}
            </div>
          )}

          {!fact && !factLoading && !factError && (
            <div className="flex items-center justify-center py-8">
              <p className="text-secondary text-base text-center font-medium">
                👆 Tap to discover something interesting!
              </p>
            </div>
          )}
        </div>

        <button
          onClick={() => fetchFact(true)}
          disabled={factLoading}
          className="ios-button w-full text-lg py-4 font-semibold"
        >
          {factLoading ? "⏳ Loading…" : "✨ Get new fact"}
        </button>
      </section>
    </div>
  );
}
