'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

interface Post {
  id: string
  song_id: string
  title: string
  artist: string
  album: string
  album_art: string
  genre: string
  rating: number
  caption: string
  mood_tags: string[]
  created_at: string
}

export default function MusicPostCard({ post }: { post: Post }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 rounded-lg p-6 border border-white/10"
    >
      <div className="flex space-x-4">
        <Image
          src={post.album_art || '/placeholder.jpg'}
          alt={post.album}
          width={80}
          height={80}
          className="rounded"
        />

        <div>
          <h3 className="text-lg font-semibold">{post.title}</h3>
          <p className="text-gray-300">
            {post.artist} • {post.album}
          </p>

          <div className="flex mt-2">
            {[...Array(5)].map((_, i) => (
              <span
                key={i}
                className={i < post.rating ? 'text-yellow-400' : 'text-gray-600'}
              >
                ★
              </span>
            ))}
          </div>

          <p className="text-gray-400 mt-2">{post.caption}</p>
        </div>
      </div>
    </motion.div>
  )
}