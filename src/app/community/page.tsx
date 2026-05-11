"use client"

import React, { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageCircle, Heart, Share2, Plus, User, Calendar, Send } from "lucide-react"
import { getPosts, createPost, addComment, getComments } from "@/services/community/actions"
import { Button } from "@/components/atoms/Button"
import { Navbar } from "@/components/organisms/Navbar"
import { useAuth } from "@/hooks/use-auth"

export default function CommunityPage() {
  const { user } = useAuth()
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newContent, setNewContent] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null)
  const [comments, setComments] = useState<any>({})
  const [newComment, setNewComment] = useState("")

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    const res = await getPosts()
    if (res.success) setPosts(res.posts)
    setLoading(false)
  }

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    const res = await createPost(newTitle, newContent)
    if (res.success) {
      setNewTitle("")
      setNewContent("")
      setShowCreateModal(false)
      fetchPosts()
    }
    setSubmitting(false)
  }

  const handleToggleComments = async (postId: string) => {
    if (expandedPostId === postId) {
      setExpandedPostId(null)
      return
    }

    setExpandedPostId(postId)
    if (!comments[postId]) {
      const res = await getComments(postId)
      if (res.success) {
        setComments({ ...comments, [postId]: res.comments })
      }
    }
  }

  const handleAddComment = async (postId: string) => {
    if (!newComment.trim()) return
    const res = await addComment(postId, newComment)
    if (res.success) {
      setComments({
        ...comments,
        [postId]: [...(comments[postId] || []), res.comment]
      })
      setNewComment("")
    }
  }

  return (
    <div className="min-h-screen bg-[#02040a] text-white font-inter">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-6 py-24">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-bold font-outfit mb-2">Community</h1>
            <p className="text-gray-400">Share knowledge, ask questions, and connect with peers.</p>
          </div>
          <Button className="gap-2" onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4" /> New Post
          </Button>
        </div>

        <div className="space-y-6">
          {loading ? (
            [1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-gray-900/50 rounded-3xl animate-pulse border border-gray-800" />
            ))
          ) : posts.length > 0 ? (
            posts.map((post, index) => (
              <motion.div
                key={post.$id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-gray-900/40 backdrop-blur-sm border border-gray-800 p-8 rounded-3xl hover:border-blue-500/30 transition-all"
              >
                <div className="flex items-center gap-3 mb-4 text-sm text-gray-500">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500 font-bold uppercase">
                    {post.authorName?.charAt(0) || "U"}
                  </div>
                  <span className="font-medium text-gray-300">{post.authorName || "User"}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(post.$createdAt).toLocaleDateString()}</span>
                </div>

                <h3 className="text-2xl font-bold mb-4">{post.title}</h3>
                <p className="text-gray-300 leading-relaxed mb-6 whitespace-pre-wrap">{post.content}</p>
                
                <div className="flex items-center gap-6 pt-6 border-t border-gray-800">
                  <button className="flex items-center gap-2 text-gray-500 hover:text-pink-500 transition-colors">
                    <Heart className="w-5 h-5" />
                    <span>0</span>
                  </button>
                  <button 
                    onClick={() => handleToggleComments(post.$id)}
                    className="flex items-center gap-2 text-gray-500 hover:text-blue-500 transition-colors"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>{comments[post.$id]?.length || 0}</span>
                  </button>
                  <button className="flex items-center gap-2 text-gray-500 hover:text-green-500 transition-colors">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>

                {/* Comments Section */}
                <AnimatePresence>
                  {expandedPostId === post.$id && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-6 mt-6 space-y-4">
                        {comments[post.$id]?.map((comment: any) => (
                          <div key={comment.$id} className="bg-white/5 p-4 rounded-xl border border-white/5">
                            <div className="flex items-center gap-2 mb-2 text-xs text-gray-400">
                              <span className="font-bold text-gray-200">{comment.authorName}</span>
                              <span>•</span>
                              <span>{new Date(comment.$createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="text-sm text-gray-300">{comment.content}</p>
                          </div>
                        ))}

                        <div className="flex gap-2 mt-4">
                          <input
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Write a comment..."
                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          />
                          <Button 
                            size="sm" 
                            className="rounded-xl px-4"
                            onClick={() => handleAddComment(post.$id)}
                          >
                            <Send className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))
          ) : (
            <div className="py-20 text-center bg-gray-900/20 rounded-3xl border-2 border-dashed border-gray-800">
              <h3 className="text-xl text-gray-500">No posts yet. Start the conversation!</h3>
            </div>
          )}
        </div>
      </main>

      {/* Create Post Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-gray-950 border border-white/10 p-8 rounded-3xl w-full max-w-lg shadow-2xl"
            >
              <h2 className="text-2xl font-bold mb-6">Create Community Post</h2>
              
              <form onSubmit={handleCreatePost} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Title</label>
                  <input
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="What's on your mind?"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Content</label>
                  <textarea
                    required
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    rows={6}
                    placeholder="Share your thoughts or questions..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="flex gap-4">
                  <Button variant="ghost" type="button" className="flex-1 h-12" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                  <Button type="submit" disabled={submitting} className="flex-1 h-12 shadow-lg shadow-blue-500/20">
                    {submitting ? "Posting..." : "Post to Community"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
