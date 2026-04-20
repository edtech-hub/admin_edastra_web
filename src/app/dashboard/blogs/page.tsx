"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import TopBar from '@/components/layout/TopBar'
import api from '@/lib/api'
import Image from 'next/image'

interface Blog {
  _id?: string
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
  const [displayCount, setDisplayCount] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<Blog | null>(null)
  const [newBlog, setNewBlog] = useState(initialBlogForm)
  const [newImagePreview, setNewImagePreview] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [addSuccess, setAddSuccess] = useState(false)
  const [newTagName, setNewTagName] = useState('')
  const [editTagName, setEditTagName] = useState('')
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [blogToDelete, setBlogToDelete] = useState<Blog | null>(null)
  const [successToast, setSuccessToast] = useState<string | null>(null)
  const [savingStatus, setSavingStatus] = useState<'saving' | 'success' | null>(null)
  const [addError, setAddError] = useState<string | null>(null)
  const newFileInputRef = useRef<HTMLInputElement>(null)
  const editFileInputRef = useRef<HTMLInputElement>(null)

  const showSuccessToast = (message: string) => {
    setSuccessToast(message)
    setTimeout(() => setSuccessToast(null), 3000)
  }

  const fetchBlogs = useCallback(async () => {
    try {
      const response = await api.get('/blogs')
      if (response.data.success && response.data.data) {
        // Map _id to id for consistency
        const blogsData = response.data.data.map((blog: any) => ({
          ...blog,
          id: blog._id || blog.id
        }))
        setBlogs(blogsData)
        // Set displayCount to total blogs if not set yet
        setDisplayCount(prev => prev === null ? blogsData.length : prev)
      } else {
        setBlogs([])
        setDisplayCount(prev => prev === null ? 0 : prev)
      }
    } catch (error) {
      console.error('Error fetching blogs:', error)
      setBlogs([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBlogs()
  }, [fetchBlogs])

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

  const [isUploading, setIsUploading] = useState(false)

  const uploadToS3 = async (file: File): Promise<string | null> => {
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const response = await api.post('/upload?folder=blogs', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return response.data.url
    } catch (error) {
      console.error('S3 upload error:', error)
      return null
    } finally {
      setIsUploading(false)
    }
  }

  const handleNewImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = await uploadToS3(file)
      if (url) {
        setNewImagePreview(url)
        setNewBlog({ ...newBlog, image: url })
      }
    }
  }

  const handleEditImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && editData) {
      const url = await uploadToS3(file)
      if (url) {
        setEditData({ ...editData, image: url })
      }
    }
  }

  const handleAddBlog = async () => {
    if (!newBlog.title) return
    setAddError(null)
    setIsSaving(true)
    setSavingStatus('saving')
    try {
      const response = await api.post('/blogs', {
        ...newBlog,
        isVisible: true,
      })
      if (response.data.success) {
        setSavingStatus('success')
        await fetchBlogs()
        setTimeout(() => {
          setSavingStatus(null)
          setIsSaving(false)
          setShowAddForm(false)
          setNewBlog(initialBlogForm)
          setNewImagePreview('')
          showSuccessToast('Blog added successfully!')
        }, 1500)
        return
      }
    } catch (error: any) {
      console.error('Error adding blog:', error)
      const msg = error?.response?.data?.message || error?.response?.data?.error || 'Failed to add blog. Please check all required fields.'
      setAddError(msg)
    }
    setSavingStatus(null)
    setIsSaving(false)
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

  const saveEdit = async () => {
    if (!editData) return
    setIsSaving(true)
    try {
      const blogId = editData._id || editData.id
      const response = await api.put(`/blogs/${blogId}`, editData)
      if (response.data.success) {
        await fetchBlogs() // Refresh from database
        setEditingId(null)
        setEditData(null)
        setEditTagName('')
        showSuccessToast('Changes saved successfully!')
      }
    } catch (error) {
      console.error('Error updating blog:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteBlog = (blog: Blog) => {
    setBlogToDelete(blog)
    setDeleteModalOpen(true)
  }

  const confirmDeleteBlog = async () => {
    if (!blogToDelete) return
    setIsSaving(true)
    try {
      const blogId = blogToDelete._id || blogToDelete.id
      const response = await api.delete(`/blogs/${blogId}`)
      if (response.data.success) {
        await fetchBlogs() // Refresh from database
        setDeleteModalOpen(false)
        setBlogToDelete(null)
        showSuccessToast('Blog deleted successfully!')
      }
    } catch (error) {
      console.error('Error deleting blog:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const cancelDelete = () => {
    setDeleteModalOpen(false)
    setBlogToDelete(null)
  }

  const handleToggleVisibility = async (blog: Blog) => {
    setIsSaving(true)
    try {
      const blogId = blog._id || blog.id
      const response = await api.patch(`/blogs/${blogId}/visibility`)
      if (response.data.success) {
        await fetchBlogs() // Refresh from database
        showSuccessToast('Visibility updated!')
      }
    } catch (error) {
      console.error('Error toggling visibility:', error)
    } finally {
      setIsSaving(false)
    }
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

  const visibleBlogs = blogs.filter(b => b.isVisible !== false).slice(0, displayCount ?? blogs.length)

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
                value={displayCount ?? blogs.length}
                onChange={(e) => saveDisplayCount(parseInt(e.target.value) || blogs.length)}
                min={1}
                max={blogs.length || 1}
                className="w-full bg-[#252525] border border-white/[0.06] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/30"
              />
            </div>

            {/* Blogs List */}
            <div>
              <label className="block text-xs text-gray-400 mb-2">Existing Blogs</label>
              <div className="space-y-4">
                {blogs.map((blog, index) => (
                  <div key={blog.id}>
                    <div
                      className={`flex items-center justify-between px-4 py-3.5 rounded-xl border transition-colors ${editingId === blog.id
                        ? 'bg-emerald-500/10 border-emerald-500/30'
                        : blog.isVisible === false
                          ? 'bg-[#252525] border-amber-500/20 opacity-60'
                          : 'bg-[#252525] border-white/[0.06] hover:border-white/[0.12]'
                        }`}
                    >
                      <span className={`text-sm font-medium ${editingId === blog.id ? 'text-emerald-400' : 'text-white'}`}>
                        Blog {index + 1}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDeleteBlog(blog)}
                          className="w-7 h-7 rounded flex items-center justify-center text-gray-500 hover:text-red-400 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleToggleVisibility(blog)}
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
                              <span className="text-sm text-white">{isUploading ? 'Uploading...' : editData.image ? '1 image attached' : 'No image'}</span>
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

          {/* Right Column - Add Blog Button */}
          <div className="lg:w-[350px] space-y-4">
            <div className="bg-[#1a1a1a] border border-white/[0.06] rounded-xl p-5">
              <h3 className="text-sm font-medium text-white mb-3">Quick Actions</h3>
              <button
                onClick={() => setShowAddForm(true)}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add New Blog
              </button>
              <p className="text-xs text-gray-500 mt-3 text-center">Create a new blog post for your website</p>
            </div>

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

      {/* Add Blog Popup Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => { if (!savingStatus) { setShowAddForm(false); setNewBlog(initialBlogForm); setNewImagePreview(''); setNewTagName('') } }}
          />

          {/* Modal */}
          <div className="relative bg-[#1a1a1a] border border-white/10 rounded-2xl w-full max-w-5xl max-h-[95vh] overflow-y-auto shadow-2xl">
            
            {/* Saving Status Overlay */}
            {savingStatus && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm rounded-2xl">
                <div className="bg-[#242424] border border-white/10 rounded-2xl p-8 text-center shadow-2xl">
                  {savingStatus === 'saving' ? (
                    <>
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-500/10 flex items-center justify-center">
                        <svg className="w-8 h-8 text-blue-400 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">Saving Blog...</h3>
                      <p className="text-sm text-gray-400">Please wait while your blog is being saved</p>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/10 flex items-center justify-center">
                        <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">Blog Saved!</h3>
                      <p className="text-sm text-gray-400">Your blog has been added successfully</p>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Header */}
            <div className="sticky top-0 bg-[#1a1a1a] border-b border-white/[0.06] px-8 py-5 flex items-center justify-between z-10">
              <h2 className="text-xl font-semibold text-white">Add New Blog</h2>
              <button
                onClick={() => { if (!savingStatus) { setShowAddForm(false); setNewBlog(initialBlogForm); setNewImagePreview(''); setNewTagName('') } }}
                disabled={!!savingStatus}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/[0.06] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Form Content */}
            <div className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Title *</label>
                <input
                  type="text"
                  value={newBlog.title}
                  onChange={(e) => setNewBlog({ ...newBlog, title: e.target.value })}
                  className="w-full bg-[#252525] border border-white/[0.06] rounded-xl px-5 py-4 text-base text-white focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20"
                  placeholder="Enter blog title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description * (up to 1500 characters)</label>
                <textarea
                  value={newBlog.description}
                  onChange={(e) => setNewBlog({ ...newBlog, description: e.target.value })}
                  rows={12}
                  maxLength={1500}
                  className="w-full bg-[#252525] border border-white/[0.06] rounded-xl px-5 py-4 text-base text-white focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 resize-none leading-relaxed"
                  placeholder="Enter blog description... Write a detailed description for your blog post."
                />
                <div className="text-right text-xs text-gray-500 mt-2">
                  {newBlog.description.length}/1500 characters
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Featured Image</label>
                <div className="flex items-center gap-3">
                  <div className="flex-1 flex items-center gap-3 bg-[#252525] border border-white/[0.06] rounded-xl px-5 py-4">
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm text-gray-400">{isUploading ? 'Uploading...' : newImagePreview ? '1 image attached ✓' : 'No image selected'}</span>
                  </div>
                  <input ref={newFileInputRef} type="file" accept="image/*" onChange={handleNewImageChange} className="hidden" />
                  <button onClick={() => newFileInputRef.current?.click()} className="px-6 py-4 rounded-xl bg-[#252525] border border-white/[0.06] text-gray-400 hover:text-white hover:border-emerald-500/30 transition-colors font-medium">
                    Browse
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Author Name</label>
                  <input
                    type="text"
                    value={newBlog.authorName}
                    onChange={(e) => setNewBlog({ ...newBlog, authorName: e.target.value })}
                    className="w-full bg-[#252525] border border-white/[0.06] rounded-xl px-5 py-4 text-base text-white focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20"
                    placeholder="Name of the blogger"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Company</label>
                  <input
                    type="text"
                    value={newBlog.authorCompany}
                    onChange={(e) => setNewBlog({ ...newBlog, authorCompany: e.target.value })}
                    className="w-full bg-[#252525] border border-white/[0.06] rounded-xl px-5 py-4 text-base text-white focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20"
                    placeholder="Company of the blogger"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Reading Time</label>
                  <input
                    type="text"
                    value={newBlog.readingTime}
                    onChange={(e) => setNewBlog({ ...newBlog, readingTime: e.target.value })}
                    className="w-full bg-[#252525] border border-white/[0.06] rounded-xl px-5 py-4 text-base text-white focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20"
                    placeholder="e.g., 5 min"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Main Tag</label>
                  <input
                    type="text"
                    value={newBlog.mainTag}
                    onChange={(e) => setNewBlog({ ...newBlog, mainTag: e.target.value })}
                    className="w-full bg-[#252525] border border-white/[0.06] rounded-xl px-5 py-4 text-base text-white focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20"
                    placeholder="e.g., FRONTEND"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Additional Tags</label>
                <div className="flex flex-wrap gap-2 mb-4">
                  {newBlog.additionalTags.map((tag, i) => (
                    <div key={i} className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                      <span className="text-sm text-emerald-400">{tag.name}</span>
                      <button onClick={() => handleToggleNewTagVisibility(tag.name)} className="text-emerald-400/60 hover:text-white">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          {tag.isVisible ? (
                            <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></>
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          )}
                        </svg>
                      </button>
                      <button onClick={() => handleRemoveNewTag(tag.name)} className="text-emerald-400/60 hover:text-red-400">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddNewTag()}
                    className="flex-1 bg-[#252525] border border-white/[0.06] rounded-xl px-5 py-3.5 text-base text-white focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20"
                    placeholder="Type tag and press Enter"
                  />
                  <button onClick={handleAddNewTag} className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30 flex items-center justify-center transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  </button>
                </div>
              </div>

              {addError && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span className="text-sm text-red-400">{addError}</span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-[#1a1a1a] border-t border-white/[0.06] px-8 py-5 flex items-center justify-end gap-4">
              <button
                onClick={() => { if (!savingStatus) { setShowAddForm(false); setNewBlog(initialBlogForm); setNewImagePreview(''); setNewTagName('') } }}
                disabled={!!savingStatus}
                className="px-8 py-3.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-gray-400 text-base font-medium border border-white/[0.06] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleAddBlog}
                disabled={!newBlog.title || isSaving || isUploading || !!savingStatus}
                className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 disabled:cursor-not-allowed text-white text-base font-medium transition-colors shadow-lg shadow-emerald-500/20"
              >
                {isSaving ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Adding...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Add Blog
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && blogToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={cancelDelete}
          />

          {/* Modal */}
          <div className="relative bg-[#1a1a1a] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl">
            {/* Warning Icon */}
            <div className="flex justify-center pt-8 pb-4">
              <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
            </div>

            {/* Content */}
            <div className="px-8 pb-6 text-center">
              <h3 className="text-xl font-semibold text-white mb-2">Delete Blog</h3>
              <p className="text-gray-400 mb-4">Are you sure you want to delete this blog?</p>
              <div className="bg-[#252525] border border-white/[0.06] rounded-xl px-4 py-3 mb-4">
                <p className="text-white font-medium truncate">{blogToDelete.title}</p>
              </div>
              <p className="text-red-400/80 text-sm">This action cannot be undone.</p>
            </div>

            {/* Footer */}
            <div className="border-t border-white/[0.06] px-6 py-4 flex items-center justify-center gap-4">
              <button
                onClick={cancelDelete}
                className="flex-1 px-6 py-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-gray-400 font-medium border border-white/[0.06] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteBlog}
                disabled={isSaving}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-red-500 hover:bg-red-600 disabled:bg-red-500/50 text-white font-medium transition-colors"
              >
                {isSaving ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Deleting...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete Blog
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
          <div className="flex items-center gap-3 px-5 py-4 rounded-xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/25">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="font-medium">{successToast}</span>
            <button
              onClick={() => setSuccessToast(null)}
              className="ml-2 w-6 h-6 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
