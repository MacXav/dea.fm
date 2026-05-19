'use client'

import { useState } from 'react'

interface SpotifyTrackEmbedProps {
  songId: string
  albumArt: string
  title: string
  artist: string
}

export default function SpotifyTrackEmbed({
  songId,
  albumArt,
  title,
  artist,
}: SpotifyTrackEmbedProps) {
  const [showPlayer, setShowPlayer] = useState(false)

  if (!songId) {
    return (
      <img
        src={albumArt}
        alt={`${title} album cover`}
        className="w-full aspect-square object-cover rounded-xl"
      />
    )
  }

  return (
    <div className="w-full">
      {!showPlayer ? (
        <button
          type="button"
          onClick={() => setShowPlayer(true)}
          className="relative group block w-full"
          aria-label={`Play ${title} by ${artist} on Spotify`}
        >
          <img
            src={albumArt}
            alt={`${title} album cover`}
            className="w-full aspect-square object-cover rounded-xl"
          />

          <div className="absolute inset-0 rounded-xl bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
            <div className="bg-green-500 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl shadow-lg">
              ▶
            </div>
          </div>

          <div className="absolute bottom-3 left-3 right-3 bg-black/60 text-white text-sm rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition">
            Click to play on Spotify
          </div>
        </button>
      ) : (
        <div className="space-y-2">
          <iframe
            src={`https://open.spotify.com/embed/track/${songId}?utm_source=generator`}
            width="100%"
            height="152"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            className="rounded-xl"
          />

          <button
            type="button"
            onClick={() => setShowPlayer(false)}
            className="text-sm text-gray-300 hover:text-white"
          >
            Hide player
          </button>
        </div>
      )}
    </div>
  )
}