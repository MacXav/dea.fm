'use client'

import { useSpotifyPlayer } from '@/components/SpotifyPlayerProvider'

export default function GlobalSpotifyPlayer() {
  const { activeTrack, clearActiveTrack } = useSpotifyPlayer()

  if (!activeTrack) return null

  return (
    <div className="fixed bottom-3 left-3 right-3 z-[9999] mx-auto max-w-xl sm:bottom-4 sm:left-4 sm:right-4">
      <div
        className="border border-white/10 bg-black/85 p-2 shadow-2xl backdrop-blur-md sm:p-3"
        style={{
          borderRadius: 'var(--site-radius)',
        }}
      >
        <div className="mb-2 flex items-center justify-between gap-2 sm:mb-3 sm:gap-3">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            {activeTrack.albumArt && (
              <img
                src={activeTrack.albumArt}
                alt={`${activeTrack.title} album art`}
                className="h-8 w-8 shrink-0 object-cover sm:h-10 sm:w-10"
                style={{
                  borderRadius: 'calc(var(--site-radius) * 0.6)',
                }}
              />
            )}

            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-white sm:text-sm">
                {activeTrack.title}
              </p>
              <p className="truncate text-[11px] text-white/60 sm:text-xs">
                {activeTrack.artist}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={clearActiveTrack}
            className="shrink-0 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-white/70 transition hover:bg-white/10 hover:text-white sm:px-3 sm:text-xs"
          >
            Close
          </button>
        </div>

        <iframe
          src={`https://open.spotify.com/embed/track/${activeTrack.id}?utm_source=generator`}
          width="100%"
          height="80"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          className="rounded-xl sm:h-[152px]"
        />
      </div>
    </div>
  )
}