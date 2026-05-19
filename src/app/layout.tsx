import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'
import Navbar from '@/components/Navbar'
import { SpotifyPlayerProvider } from '@/components/SpotifyPlayerProvider'
import GlobalSpotifyPlayer from '@/components/GlobalSpotifyPlayer'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'dea.fm',
  description: 'Music social app',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-black text-white`}
      >
        <SpotifyPlayerProvider>
          <ThemeProvider>
            <Navbar />
            {children}
            <GlobalSpotifyPlayer />
          </ThemeProvider>
        </SpotifyPlayerProvider>
      </body>
    </html>
  )
}