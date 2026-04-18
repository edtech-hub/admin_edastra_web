"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import TopBar from '@/components/layout/TopBar'
import api from '@/lib/api'
import Image from 'next/image'

interface Blog {
  id: string
  title: string
  description: string
  image: string
  authorName: string
  authorCompany: string
  readingTime: string
  mainTag: string
  additionalTags: { name: string; isVisible: boolean }[]
  isVisible?: boolean
}

const initialBlogForm = {
  title: '',
  description: '',
  image: '',
  authorName: '',
  authorCompany: '',
  readingTime: '',
  mainTag: '',
  additionalTags: [] as { name: string; isVisible: boolean }[],
}

const defaultBlogs: Blog[] = [
  {
    id: '1',
    title: 'Next.js 14 Server Components: The Ultimate Performance Guide',
    description: 'Learn how React Server Components can reduce your JavaScript bundle by 70% and improve Core Web Vitals significantly.',
    image: '',
    authorName: 'Ed-Astra Team',
    authorCompany: 'Ed-Astra',
    readingTime: '12 min',
    mainTag: 'FRONTEND',
    additionalTags: [{ name: 'Next.js', isVisible: true }, { name: 'React', isVisible: true }],
    isVisible: true,
  },
  {
    id: '2',
    title: 'Building AI-Powered SaaS Applications in 2026',
    description: 'From GPT-4 integration to custom ML pipelines — how to architect scalable AI-first products.',
    image: '',
    authorName: 'Ed-Astra Team',
    authorCompany: 'Ed-Astra',
    readingTime: '18 min',
    mainTag: 'AI & ML',
    additionalTags: [{ name: 'AI', isVisible: true }, { name: 'SaaS', isVisible: true }],
    isVisible: true,
  },
  {
    id: '3',
    title: 'Flutter vs React Native: Which to Choose in 2026?',
    description: 'An in-depth comparison of performance, DX, and ecosystem maturity for cross-platform development.',
    image: '',
    authorName: 'Ed-Astra Team',
    authorCompany: 'Ed-Astra',
    readingTime: '15 min',
    mainTag: 'MOBILE',
    additionalTags: [{ name: 'Flutter', isVisible: true }, { name: 'React Native', isVisible: true }],
    isVisible: true,
  },
  {
    id: '4',
    title: 'AWS Serverless: How We Cut Cloud Costs by 60%',
    description: 'A case study on migrating to serverless with Lambda, API Gateway, and DynamoDB.',
    image: '',
    authorName: 'Ed-Astra Team',
    authorCompany: 'Ed-Astra',
    readingTime: '14 min',
    mainTag: 'CLOUD',
    additionalTags: [{ name: 'AWS', isVisible: true }, { name: 'Serverless', isVisible: true }],
    isVisible: true,
  },
  {
    id: '5',
    title: 'UX Principles That Increased Conversions by 340%',
    description: 'A breakdown of the UX redesign process that transformed an e-commerce platform\'s performance.',
    image: '',
    authorName: 'Ed-Astra Team',
    authorCompany: 'Ed-Astra',
    readingTime: '13 min',
    mainTag: 'DESIGN',
    additionalTags: [{ name: 'UX', isVisible: true }, { name: 'Conversion', isVisible: true }],
    isVisible: true,
  },
  {
    id: '6',
    title: 'Microservices on Kubernetes: Production Guide',
    description: 'Everything about deploying microservices with Istio, Prometheus, and zero-downtime strategies.',
    image: '',
    authorName: 'Ed-Astra Team',
    authorCompany: 'Ed-Astra',
    readingTime: '22 min',
    mainTag: 'DEVOPS',
    additionalTags: [{ name: 'Kubernetes', isVisible: true }, { name: 'Microservices', isVisible: true }],
    isVisible: true,
  },
]

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [displayCount, setDisplayCount] = useState(6)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<Blog | null>(null)
  const [newBlog, setNewBlog] = useState(initialBlogForm)
  const [newImagePreview, setNewImagePreview] = useState('')
  const [showAddForm, setShowAddForm] = useState(true)
  const [addSuccess, setAddSuccess] = useState(false)
  const [newTagName, setNewTagName] = useState('')
  const [editTagName, setEditTagName] = useState('')
  const newFileInputRef = useRef<HTMLInputElement>(null)
  const editFileInputRef = useRef<HTMLInputElement>(null)

  const fetchBlogs = useCallback(async () => {
    try {
      const response = await api.get('/settings')
      const settings = response.data.data

      const blogsSettings = settings.find((s: { key: string }) => s.key === 'homepage_blogs')
      const countSettings = settings.find((s: { key: string }) => s.key === 'homepage_blogs_count')

      if (blogsSettings?.value && blogsSettings.value.length > 0) {
        setBlogs(blogsSettings.value)
      } else {
        setBlogs(defaultBlogs)
      }
      if (countSettings?.value) {
        setDisplayCount(countSettings.value)
      }
    } catch (error) {
      console.error('Error fetching blogs:', error)
      setBlogs(defaultBlogs)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBlogs()
  }, [fetchBlogs])

  const saveBlogs = async (updatedBlogs: Blog[]) => {
    setIsSaving(true)
    try {
      await api.put('/settings', {
        key: 'homepage_blogs',
        value: updatedBlogs,
        description: 'Homepage blogs section'
      })
      setBlogs(updatedBlogs)
    } catch (error) {
      console.error('Error saving blogs:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const saveDisplayCount = async (count: number) => {
    try {
      await api.put('/settings', {
        key: 'homepage_blogs_count',
        value: count,
        description: 'Number of blogs displayed'
      })
      setDisplayCount(count)
    } catch (error) {
      console.error('Error saving count:', error)
    }
  }

  const handleNewImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result as string
        setNewImagePreview(base64)
        setNewBlog({ ...newBlog, image: base64 })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && editData) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result as string
        setEditData({ ...editData, image: base64 })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAddBlog = async () => {
    if (!newBlog.title) return
    const blog: Blog = {
      id: Date.now().toString(),
      ...newBlog,
      isVisible: true,
    }
    await saveBlogs([...blogs, blog])
    setNewBlog(initialBlogForm)
    setNewImagePreview('')
    setAddSuccess(true)
    setTimeout(() => setAddSuccess(false), 3000)
  }

  const startEditing = (blog: Blog) => {
    setEditingId(blog.id)
    setEditData({ ...blog })
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditData(null)
    setEditTagName('')
  }

  const saveEdit = () => {
    if (!editData) return
    const updatedBlogs = blogs.map(b => b.id === editData.id ? editData : b)
    saveBlogs(updatedBlogs)
    setEditingId(null)
    setEditData(null)
    setEditTagName('')
  }

  const handleDeleteBlog = (id: string) => {
    if (confirm('Are you sure you want to delete this blog?')) {
      saveBlogs(blogs.filter(b => b.id !== id))
    }
  }

  const handleToggleVisibility = (id: string) => {
    const updated = blogs.map(b => b.id === id ? { ...b, isVisible: !b.isVisible } : b)
    saveBlogs(updated)
  }

  const handleAddNewTag = () => {
    if (newTagName.trim()) {
      setNewBlog({
        ...newBlog,
        additionalTags: [...newBlog.additionalTags, { name: newTagName.trim(), isVisible: true }]
      })
      setNewTagName('')
    }
  }

  const handleRemoveNewTag = (name: string) => {
    setNewBlog({
      ...newBlog,
      additionalTags: newBlog.additionalTags.filter(t => t.name !== name)
    })
  }

  const handleToggleNewTagVisibility = (name: string) => {
    setNewBlog({
      ...newBlog,
      additionalTags: newBlog.additionalTags.map(t =>
        t.name === name ? { ...t, isVisible: !t.isVisible } : t
      )
    })
  }

  const handleAddEditTag = () => {
    if (editTagName.trim() && editData) {
      setEditData({
        ...editData,
        additionalTags: [...editData.additionalTags, { name: editTagName.trim(), isVisible: true }]
      })
      setEditTagName('')
    }
  }

  const handleRemoveEditTag = (name: string) => {
    if (editData) {
      setEditData({
        ...editData,
        additionalTags: editData.additionalTags.filter(t => t.name !== name)
      })
    }
  }

  const handleToggleEditTagVisibility = (name: string) => {
    if (editData) {
      setEditData({
        ...editData,
        additionalTags: editData.additionalTags.map(t =>
          t.name === name ? { ...t, isVisible: !t.isVisible } : t
        )
      })
    }
  }

  const visibleBlogs = blogs.filter(b => b.isVisible !== false).slice(0, displayCount)

  if (isLoading) {
    return (
      <DashboardLayout>
        <TopBar title="Blogs" subtitle="Manage blog posts" />
        <div className="p-6">
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <TopBar title="Blogs" subtitle="Manage blog posts" />
      <div className="p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column */}
          <div className="flex-1 space-y-5">
            {/* Display Count */}
            <div>
              <label className="block text-xs text-gray-400 mb-2">Number of blogs displayed</label>
              <input
                type="number"
                value={displayCount}
                onChange={(e) => saveDisplayCount(parseInt(e.target.value) || 6)}
                min={1}
                max={blogs.length}
                className="w-full bg-[#252525] border border-white/[0.06] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/30"
              />
            </div>

            {/* Blogs List */}
            <div>
              <label className="block text-xs text-gray-400 mb-2">Testimonials</label>
              <div className="space-y-2">
                {blogs.map((blog, index) => (
                  <div key={blog.id}>
                    <div
                      className={`flex items-center justify-between px-3 py-2.5 rounded-lg border transition-colors ${editingId === blog.id
                        ? 'bg-emerald-500/10 border-emerald-500/30'
                        : blog.isVisible === false
                          ? 'bg-[#252525] border-amber-500/20 opacity-60'
                          : 'bg-[#252525] border-white/[0.06]'
                        }`}
                    >
                      <span className={`text-sm ${editingId === blog.id ? 'text-emerald-400' : 'text-white'}`}>
                        Blog {index + 1}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDeleteBlog(blog.id)}
                          className="w-7 h-7 rounded flex items-center justify-center text-gray-500 hover:text-red-400 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleToggleVisibility(blog.id)}
                          className={`w-7 h-7 rounded flex items-center justify-center transition-colors ${blog.isVisible !== false ? 'text-gray-500 hover:text-white' : 'text-amber-400'
                            }`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {blog.isVisible !== false ? (
                              <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></>
                            ) : (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            )}
                          </svg>
                        </button>
                        <button
                          onClick={() => editingId === blog.id ? cancelEditing() : startEditing(blog)}
                          className={`w-7 h-7 rounded flex items-center justify-center transition-colors ${editingId === blog.id ? 'text-emerald-400' : 'text-gray-500 hover:text-white'
                            }`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Edit Form */}
                    {editingId === blog.id && editData && (
                      <div className="mt-2 p-4 bg-[#1a1a1a] border border-emerald-500/20 rounded-lg space-y-3">
                        <span className="text-xs text-gray-500">Edit Review</span>

                        <div>
                          <label className="block text-[10px] text-gray-500 mb-1">Title</label>
                          <input
                            type="text"
                            value={editData.title}
                            onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                            className="w-full bg-[#252525] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/30"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-gray-500 mb-1">Description</label>
                          <textarea
                            value={editData.description}
                            onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                            rows={6}
                            className="w-full bg-[#252525] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/30 resize-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-gray-500 mb-1">Image</label>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 flex items-center gap-2 bg-[#252525] border border-white/[0.06] rounded-lg px-3 py-2">
                              <span className="text-sm text-white">{editData.image ? '1 image attached' : 'No image'}</span>
                              {editData.image && <span className="text-emerald-400">✓</span>}
                            </div>
                            <button onClick={() => setEditData({ ...editData, image: '' })} className="w-9 h-9 rounded-lg bg-[#252525] border border-white/[0.06] flex items-center justify-center text-gray-400 hover:text-red-400">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                            <input ref={editFileInputRef} type="file" accept="image/*" onChange={handleEditImageChange} className="hidden" />
                            <button onClick={() => editFileInputRef.current?.click()} className="w-9 h-9 rounded-lg bg-[#252525] border border-white/[0.06] flex items-center justify-center text-gray-400 hover:text-white">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] text-gray-500 mb-1">Name of the blogger</label>
                          <input
                            type="text"
                            value={editData.authorName}
                            onChange={(e) => setEditData({ ...editData, authorName: e.target.value })}
                            className="w-full bg-[#252525] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/30"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-gray-500 mb-1">Reading time</label>
                          <input
                            type="text"
                            value={editData.readingTime}
                            onChange={(e) => setEditData({ ...editData, readingTime: e.target.value })}
                            className="w-full bg-[#252525] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/30"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-gray-500 mb-1">Main Tag</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={editData.mainTag}
                              onChange={(e) => setEditData({ ...editData, mainTag: e.target.value })}
                              className="flex-1 bg-[#252525] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/30"
                            />
                            <button className="w-9 h-9 rounded-lg bg-[#252525] border border-white/[0.06] flex items-center justify-center text-gray-400 hover:text-red-400">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                            <button className="w-9 h-9 rounded-lg bg-[#252525] border border-white/[0.06] flex items-center justify-center text-gray-400 hover:text-white">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            </button>
                            <button className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 hover:bg-emerald-500/30">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] text-gray-500 mb-1">Additional Tags</label>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {editData.additionalTags.map((tag, i) => (
                              <div key={i} className="flex items-center gap-1 px-2 py-1 bg-[#252525] border border-white/[0.06] rounded-lg">
                                <span className="text-xs text-white">{tag.name}</span>
                                <button onClick={() => handleToggleEditTagVisibility(tag.name)} className="text-gray-500 hover:text-white">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    {tag.isVisible ? (
                                      <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></>
                                    ) : (
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                    )}
                                  </svg>
                                </button>
                                <button onClick={() => handleRemoveEditTag(tag.name)} className="text-gray-500 hover:text-red-400">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                              </div>
                            ))}
                            <div className="flex items-center gap-1 px-2 py-1 bg-[#252525] border border-white/[0.06] rounded-lg">
                              <input
                                type="text"
                                value={editTagName}
                                onChange={(e) => setEditTagName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddEditTag()}
                                className="w-16 bg-transparent text-xs text-white focus:outline-none"
                                placeholder="Add tag"
                              />
                              <button onClick={() => handleToggleEditTagVisibility('')} className="text-gray-500 hover:text-white">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                              </button>
                              <button onClick={handleAddEditTag} className="text-emerald-400 hover:text-emerald-300">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 pt-2">
                          <button onClick={cancelEditing} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-gray-400 text-sm border border-white/[0.06]">
                            Cancel
                          </button>
                          <button onClick={saveEdit} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                            Save changes
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Add Blog */}
          <div className="lg:w-[350px] space-y-4">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-white"
            >
              Add Blog
              <svg className={`w-4 h-4 transition-transform ${showAddForm ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>

            {showAddForm && (
              <div className="space-y-3">
                <input
                  type="text"
                  value={newBlog.title}
                  onChange={(e) => setNewBlog({ ...newBlog, title: e.target.value })}
                  className="w-full bg-[#252525] border border-white/[0.06] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/30"
                  placeholder="Title"
                />

                <input
                  type="text"
                  value={newBlog.description}
                  onChange={(e) => setNewBlog({ ...newBlog, description: e.target.value })}
                  className="w-full bg-[#252525] border border-white/[0.06] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/30"
                  placeholder="Description"
                />

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newImagePreview ? '1 image attached' : ''}
                    readOnly
                    className="flex-1 bg-[#252525] border border-white/[0.06] rounded-lg px-3 py-2.5 text-sm text-white cursor-default"
                    placeholder="Image"
                  />
                  <input ref={newFileInputRef} type="file" accept="image/*" onChange={handleNewImageChange} className="hidden" />
                  <button onClick={() => newFileInputRef.current?.click()} className="w-10 h-10 rounded-lg bg-[#252525] border border-white/[0.06] text-gray-400 hover:text-white flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                  </button>
                </div>

                <input
                  type="text"
                  value={newBlog.authorName}
                  onChange={(e) => setNewBlog({ ...newBlog, authorName: e.target.value })}
                  className="w-full bg-[#252525] border border-white/[0.06] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/30"
                  placeholder="Name of the blogger"
                />

                <input
                  type="text"
                  value={newBlog.authorCompany}
                  onChange={(e) => setNewBlog({ ...newBlog, authorCompany: e.target.value })}
                  className="w-full bg-[#252525] border border-white/[0.06] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/30"
                  placeholder="Company of the blogger"
                />

                <input
                  type="text"
                  value={newBlog.readingTime}
                  onChange={(e) => setNewBlog({ ...newBlog, readingTime: e.target.value })}
                  className="w-full bg-[#252525] border border-white/[0.06] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/30"
                  placeholder="Reading time"
                />

                <input
                  type="text"
                  value={newBlog.mainTag}
                  onChange={(e) => setNewBlog({ ...newBlog, mainTag: e.target.value })}
                  className="w-full bg-[#252525] border border-white/[0.06] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/30"
                  placeholder="Main Tag"
                />

                <div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {newBlog.additionalTags.map((tag, i) => (
                      <div key={i} className="flex items-center gap-1 px-2 py-1 bg-[#252525] border border-white/[0.06] rounded-lg">
                        <span className="text-xs text-white">{tag.name}</span>
                        <button onClick={() => handleToggleNewTagVisibility(tag.name)} className="text-gray-500 hover:text-white">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {tag.isVisible ? (
                              <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></>
                            ) : (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            )}
                          </svg>
                        </button>
                        <button onClick={() => handleRemoveNewTag(tag.name)} className="text-gray-500 hover:text-red-400">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddNewTag()}
                      className="flex-1 bg-[#252525] border border-white/[0.06] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/30"
                      placeholder="Add Additional tag"
                    />
                    <button className="w-10 h-10 rounded-lg bg-[#252525] border border-white/[0.06] text-gray-400 hover:text-red-400 flex items-center justify-center">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                    <button className="w-10 h-10 rounded-lg bg-[#252525] border border-white/[0.06] text-gray-400 hover:text-white flex items-center justify-center">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    </button>
                    <button onClick={handleAddNewTag} className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30 flex items-center justify-center">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => { setNewBlog(initialBlogForm); setNewImagePreview(''); setNewTagName('') }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-gray-400 text-sm border border-white/[0.06]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddBlog}
                    disabled={!newBlog.title || isSaving}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 disabled:cursor-not-allowed text-white text-sm font-medium"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                    Add Blog
                  </button>
                </div>

                {addSuccess && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    <span className="text-sm text-emerald-400">Blog added!</span>
                  </div>
                )}
              </div>
            )}

            {/* Saving indicator */}
            {isSaving && (
              <div className="flex items-center gap-2 text-emerald-400 text-xs">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Saving...
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
