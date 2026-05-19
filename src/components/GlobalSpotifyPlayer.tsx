'use client'

import { useSpotifyPlayer } from '@/components/SpotifyPlayerProvider'

export default function GlobalSpotifyPlayer() {
  const { activeTrack, clearActiveTrack } = useSpotifyPlayer()

  if (!activeTrack) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[9999] mx-auto max-w-2xl">
      <div
        className="border border-white/10 bg-black/80 p-3 shadow-2xl backdrop-blur-md"
        style={{
          borderRadius: 'var(--site-radius)',
        }}
      >
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            {activeTrack.albumArt && (
              <img
                src={activeTrack.albumArt}
                alt={`${activeTrack.title} album art`}
                className="h-10 w-10 shrink-0 object-cover"
                style={{
                  borderRadius: 'calc(var(--site-radius) * 0.6)',
                }}
              />
            )}

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">
                {activeTrack.title}
              </p>
              <p className="truncate text-xs text-white/60">
                {activeTrack.artist}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={clearActiveTrack}
            className="shrink-0 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            Close
          </button>
        </div>

        <iframe
          src={`https://open.spotify.com/embed/track/${activeTrack.id}?utm_source=generator`}
          width="100%"
          height="152"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          className="rounded-xl"
        />
      </div>
    </div>
  )
}