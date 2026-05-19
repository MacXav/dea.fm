'use client'

import { motion } from 'framer-motion'

export default function Login() {
  const handleLogin = () => {
    const clientId = process.env.SPOTIFY_CLIENT_ID

    if (!clientId) {
      console.error('Missing Spotify Client ID')
      return
    }

    const redirectUri = process.env.SPOTIFY_REDIRECT_URI!

    const scopes =
      'user-read-private user-read-email playlist-read-private playlist-read-collaborative user-library-read'

    const authUrl =
      `https://accounts.spotify.com/authorize` +
      `?client_id=${clientId}` +
      `&response_type=code` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&scope=${encodeURIComponent(scopes)}`

    window.location.href = authUrl
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 max-w-md w-full text-center"
      >
        <h1 className="text-4xl font-bold text-white mb-4">dea.fm</h1>
        <p className="text-gray-300 mb-8">
          Connect your Spotify account to start your music journey
        </p>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogin}
          className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-full transition-colors duration-200 shadow-lg w-full"
        >
          Login with Spotify
        </motion.button>
      </motion.div>
    </div>
  )
}