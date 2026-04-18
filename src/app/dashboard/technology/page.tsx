"use client"

import { useState, useEffect, useCallback } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import TopBar from '@/components/layout/TopBar'
import api from '@/lib/api'

interface Software {
  name: string
  icon?: string
}

interface Category {
  id: string
  title: string
  software: Software[]
  isVisible?: boolean
}

interface HeaderData {
  title: string
  titleHighlight: string
  subtitle: string
}

const defaultHeader: HeaderData = {
  title: 'Our Technology',
  titleHighlight: 'Expertise',
  subtitle: 'The tools we trust to bring your vision to life',
}

const defaultCategories: Category[] = [
  {
    id: '1',
    title: 'Front-end',
    software: [
      { name: 'React', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg' },
      { name: 'Next.js', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg' },
      { name: 'Flutter', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/flutter/flutter-original.svg' },
      { name: 'TypeScript', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg' },
      { name: 'Tailwind CSS', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg' },
    ],
    isVisible: true,
  },
  {
    id: '2',
    title: 'Back-end',
    software: [
      { name: 'Node.js', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg' },
      { name: 'Express', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg' },
      { name: 'Python', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg' },
      { name: 'FastAPI', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/fastapi/fastapi-original.svg' },
      { name: 'REST APIs' },
    ],
    isVisible: true,
  },
  {
    id: '3',
    title: 'Database',
    software: [
      { name: 'MongoDB', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg' },
      { name: 'PostgreSQL', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg' },
      { name: 'Redis', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redis/redis-original.svg' },
      { name: 'Mongoose', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongoose/mongoose-original.svg' },
    ],
    isVisible: true,
  },
  {
    id: '4',
    title: 'UI/UX',
    software: [
      { name: 'Figma', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg' },
      { name: 'Miro' },
      { name: 'Adobe Creative', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/photoshop/photoshop-plain.svg' },
      { name: 'Framer' },
    ],
    isVisible: true,
  },
  {
    id: '5',
    title: 'Cloud & Devops',
    software: [
      { name: 'AWS' },
      { name: 'Docker', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg' },
      { name: 'GitHub CI', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg' },
      { name: 'Vercel', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vercel/vercel-original.svg' },
      { name: 'Nginx', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nginx/nginx-original.svg' },
    ],
    isVisible: true,
  },
  {
    id: '6',
    title: 'Testing',
    software: [
      { name: 'Jest', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/jest/jest-plain.svg' },
      { name: 'Cypress', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cypressio/cypressio-original.svg' },
      { name: 'Playwright', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/playwright/playwright-original.svg' },
      { name: 'Postman', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postman/postman-original.svg' },
      { name: 'Vitest' },
    ],
    isVisible: true,
  },
]

export default function TechnologyPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [header, setHeader] = useState<HeaderData>(defaultHeader)
  const [displayCount, setDisplayCount] = useState(6)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<Category | null>(null)
  const [newCategory, setNewCategory] = useState({ title: '', software: [] as Software[] })
  const [newSoftwareName, setNewSoftwareName] = useState('')
  const [editSoftwareName, setEditSoftwareName] = useState('')
  const [addSuccess, setAddSuccess] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const response = await api.get('/settings')
      const settings = response.data.data

      const techSettings = settings.find((s: { key: string }) => s.key === 'homepage_technology')
      const headerSettings = settings.find((s: { key: string }) => s.key === 'homepage_technology_header')
      const countSettings = settings.find((s: { key: string }) => s.key === 'homepage_technology_count')

      if (techSettings?.value && techSettings.value.length > 0) {
        setCategories(techSettings.value)
      } else {
        setCategories(defaultCategories)
      }
      if (headerSettings?.value) {
        setHeader(headerSettings.value)
      }
      if (countSettings?.value) {
        setDisplayCount(countSettings.value)
      }
    } catch (error) {
      console.error('Error fetching technology:', error)
      setCategories(defaultCategories)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const saveCategories = async (updatedCategories: Category[]) => {
    setIsSaving(true)
    try {
      await api.put('/settings', {
        key: 'homepage_technology',
        value: updatedCategories,
        description: 'Homepage technology section'
      })
      setCategories(updatedCategories)
    } catch (error) {
      console.error('Error saving technology:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const saveDisplayCount = async (count: number) => {
    try {
      await api.put('/settings', {
        key: 'homepage_technology_count',
        value: count,
        description: 'Number of technology categories displayed'
      })
      setDisplayCount(count)
    } catch (error) {
      console.error('Error saving display count:', error)
    }
  }

  const handleAddCategory = async () => {
    if (!newCategory.title) return
    const category: Category = {
      id: Date.now().toString(),
      ...newCategory,
      isVisible: true,
    }
    await saveCategories([...categories, category])
    setNewCategory({ title: '', software: [] })
    setNewSoftwareName('')
    setAddSuccess(true)
    setTimeout(() => setAddSuccess(false), 3000)
  }

  const startEditing = (category: Category) => {
    setEditingId(category.id)
    setEditData({ ...category })
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditData(null)
    setEditSoftwareName('')
  }

  const saveEdit = () => {
    if (!editData) return
    const updated = categories.map(c => c.id === editData.id ? editData : c)
    saveCategories(updated)
    setEditingId(null)
    setEditData(null)
    setEditSoftwareName('')
  }

  const handleDeleteCategory = (id: string) => {
    if (confirm('Are you sure you want to delete this category?')) {
      saveCategories(categories.filter(c => c.id !== id))
    }
  }

  const handleToggleVisibility = (id: string) => {
    const updated = categories.map(c => c.id === id ? { ...c, isVisible: !c.isVisible } : c)
    saveCategories(updated)
  }

  const handleAddNewSoftware = () => {
    if (newSoftwareName.trim()) {
      setNewCategory({
        ...newCategory,
        software: [...newCategory.software, { name: newSoftwareName.trim() }]
      })
      setNewSoftwareName('')
    }
  }

  const handleRemoveNewSoftware = (name: string) => {
    setNewCategory({
      ...newCategory,
      software: newCategory.software.filter(s => s.name !== name)
    })
  }

  const handleAddEditSoftware = () => {
    if (editSoftwareName.trim() && editData) {
      setEditData({
        ...editData,
        software: [...editData.software, { name: editSoftwareName.trim() }]
      })
      setEditSoftwareName('')
    }
  }

  const handleRemoveEditSoftware = (name: string) => {
    if (editData) {
      setEditData({
        ...editData,
        software: editData.software.filter(s => s.name !== name)
      })
    }
  }

  const visibleCategories = categories.filter(c => c.isVisible !== false).slice(0, displayCount)

  if (isLoading) {
    return (
      <DashboardLayout>
        <TopBar title="Technology" subtitle="Customize your technology content with ease" />
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
      <TopBar title="Technology" subtitle="Customize your technology content with ease" />
      <div className="p-6">
        <div className="bg-[#1a1a1a] border border-white/[0.06] rounded-xl p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left Column */}
            <div className="flex-1 space-y-5">
              {/* Display Count */}
              <div>
                <label className="block text-xs text-gray-400 mb-2">Number of Categories displayed</label>
                <input
                  type="number"
                  value={displayCount}
                  onChange={(e) => saveDisplayCount(parseInt(e.target.value) || 6)}
                  min={1}
                  max={categories.length}
                  className="w-full bg-[#252525] border border-white/[0.06] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/30"
                />
              </div>

              {/* Categories List */}
              <div>
                <label className="block text-xs text-gray-400 mb-2">Categories</label>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <div key={category.id}>
                      <div
                        className={`flex items-center justify-between px-3 py-2.5 rounded-lg border transition-colors ${editingId === category.id
                            ? 'bg-emerald-500/10 border-emerald-500/30'
                            : category.isVisible === false
                              ? 'bg-[#252525] border-amber-500/20 opacity-60'
                              : 'bg-[#252525] border-white/[0.06]'
                          }`}
                      >
                        <span className={`text-sm ${editingId === category.id ? 'text-emerald-400' : 'text-white'}`}>
                          {category.title}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleToggleVisibility(category.id)}
                            className={`w-7 h-7 rounded flex items-center justify-center transition-colors ${category.isVisible !== false ? 'text-gray-500 hover:text-white' : 'text-amber-400'
                              }`}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              {category.isVisible !== false ? (
                                <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></>
                              ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                              )}
                            </svg>
                          </button>
                          <button
                            onClick={() => editingId === category.id ? cancelEditing() : startEditing(category)}
                            className={`w-7 h-7 rounded flex items-center justify-center transition-colors ${editingId === category.id ? 'text-emerald-400' : 'text-gray-500 hover:text-white'
                              }`}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {/* Edit Form */}
                      {editingId === category.id && editData && (
                        <div className="mt-2 p-4 bg-[#1e1e1e] border border-emerald-500/20 rounded-lg space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">Edit Category</span>
                            <button onClick={() => handleDeleteCategory(category.id)} className="w-6 h-6 rounded bg-red-500/10 flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-colors">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </div>

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
                            <label className="block text-[10px] text-gray-500 mb-1">Software/Tools</label>
                            <div className="flex flex-wrap gap-1.5 mb-2">
                              {editData.software.map((sw, i) => (
                                <span key={i} className="inline-flex items-center gap-1 px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 text-xs">
                                  {sw.name}
                                  <button onClick={() => handleRemoveEditSoftware(sw.name)} className="hover:text-red-400">×</button>
                                </span>
                              ))}
                            </div>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={editSoftwareName}
                                onChange={(e) => setEditSoftwareName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddEditSoftware()}
                                className="flex-1 bg-[#252525] border border-white/[0.06] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500/30"
                                placeholder="Add software..."
                              />
                              <button onClick={handleAddEditSoftware} className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 flex items-center justify-center">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                              </button>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 pt-2">
                            <button onClick={cancelEditing} className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-gray-400 text-xs border border-white/[0.06]">Cancel</button>
                            <button onClick={saveEdit} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                              Save
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="lg:w-[320px] space-y-5">
              {/* Add Category */}
              <div>
                <label className="block text-xs text-gray-400 mb-2">Add Category</label>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={newCategory.title}
                    onChange={(e) => setNewCategory({ ...newCategory, title: e.target.value })}
                    className="w-full bg-[#252525] border border-white/[0.06] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/30"
                    placeholder="Title"
                  />

                  <div>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {newCategory.software.map((sw, i) => (
                        <span key={i} className="inline-flex items-center gap-1 px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 text-xs">
                          {sw.name}
                          <button onClick={() => handleRemoveNewSoftware(sw.name)} className="hover:text-red-400">×</button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newSoftwareName}
                        onChange={(e) => setNewSoftwareName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddNewSoftware()}
                        className="flex-1 bg-[#252525] border border-white/[0.06] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/30"
                        placeholder="Software 1"
                      />
                      <button onClick={handleAddNewSoftware} className="w-10 h-10 rounded-lg bg-[#252525] border border-white/[0.06] text-gray-400 hover:text-white flex items-center justify-center">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={() => { setNewCategory({ title: '', software: [] }); setNewSoftwareName('') }}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-gray-400 text-sm border border-white/[0.06]"
                    >
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" /></svg>
                      Discard
                    </button>
                    <button
                      onClick={handleAddCategory}
                      disabled={!newCategory.title || isSaving}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 disabled:cursor-not-allowed text-white text-sm font-medium"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                      Save Technology
                    </button>
                  </div>

                  {addSuccess && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                      <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      <span className="text-sm text-emerald-400">Category added!</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Preview */}
              <div>
                <label className="block text-xs text-gray-500 uppercase tracking-wide mb-2">PREVIEW</label>
                <div className="bg-[#0a0f14] border border-white/[0.06] rounded-xl overflow-hidden">
                  {/* Preview Header */}
                  <div className="p-4 text-center border-b border-white/[0.04]">
                    <h3 className="text-xs font-medium">
                      <span className="text-white">{header.title}</span>{' '}
                      <span className="text-emerald-400">{header.titleHighlight}</span>
                    </h3>
                  </div>

                  {/* Preview Grid */}
                  <div className="p-3 grid grid-cols-3 gap-2">
                    {visibleCategories.map((category) => (
                      <div key={category.id} className="bg-[#0d1318] border border-white/[0.08] rounded-lg p-2">
                        <p className="text-[7px] text-emerald-400 uppercase tracking-wider mb-1.5">{category.title}</p>
                        <div className="space-y-1">
                          {category.software.slice(0, 3).map((sw, i) => (
                            <div key={i} className="flex items-center gap-1">
                              {sw.icon ? (
                                <img src={sw.icon} alt={sw.name} className="w-3 h-3" />
                              ) : (
                                <div className="w-3 h-3 rounded bg-emerald-500/20 flex items-center justify-center">
                                  <span className="text-[6px] text-emerald-400">{sw.name.charAt(0)}</span>
                                </div>
                              )}
                              <span className="text-[6px] text-gray-400 truncate">{sw.name}</span>
                            </div>
                          ))}
                          {category.software.length > 3 && (
                            <span className="text-[6px] text-gray-500">+{category.software.length - 3} more</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Stats */}
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
      </div>
    </DashboardLayout>
  )
}
