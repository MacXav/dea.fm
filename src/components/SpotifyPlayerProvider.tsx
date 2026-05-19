'use client'

import {
  createContext,
  useContext,
  useMemo,
  useState,
  ReactNode,
} from 'react'

interface ActiveTrack {
  id: string
  title: string
  artist: string
  albumArt?: string
}

interface SpotifyPlayerContextValue {
  activeTrack: ActiveTrack | null
  setActiveTrack: (track: ActiveTrack) => void
  clearActiveTrack: () => void
}

const SpotifyPlayerContext = createContext<SpotifyPlayerContextValue | null>(
  null
)

export function SpotifyPlayerProvider({ children }: { children: ReactNode }) {
  const [activeTrack, setActiveTrackState] = useState<ActiveTrack | null>(null)

  const value = useMemo(
    () => ({
      activeTrack,
      setActiveTrack: setActiveTrackState,
      clearActiveTrack: () => setActiveTrackState(null),
    }),
    [activeTrack]
  )

  return (
    <SpotifyPlayerContext.Provider value={value}>
      {children}
    </SpotifyPlayerContext.Provider>
  )
}

export function useSpotifyPlayer() {
  const context = useContext(SpotifyPlayerContext)

  if (!context) {
    throw new Error(
      'useSpotifyPlayer must be used inside SpotifyPlayerProvider'
    )
  }

  return context
}