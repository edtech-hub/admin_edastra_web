"use client"

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

const pageTabs = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Main', href: '/dashboard/hero', divider: true },
  { label: 'Services', href: '/dashboard/services-page' },
  { label: 'Our Work', href: '/dashboard/our-work-page' },
  { label: 'About Us', href: '/dashboard/about' },
  { label: 'Testimonials', href: '/dashboard/testimonials-page' },
]

interface TopBarProps {
  title: string
  subtitle?: string
}

export default function TopBar({ title, subtitle }: TopBarProps) {
  const { user } = useAuth()
  const [searchOpen, setSearchOpen] = useState(false)
  const pathname = usePathname()

  return (
    <div className="sticky top-0 z-30 bg-[#111111]/80 backdrop-blur-xl border-b border-white/[0.06]">
      {/* Header row */}
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <h1 className="text-xl font-semibold text-white">Website Controls</h1>
          <p className="text-sm text-gray-500">{subtitle || title}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="w-9 h-9 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center text-gray-400 hover:text-white transition-colors border border-white/[0.06]"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          <button className="w-9 h-9 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center text-gray-400 hover:text-white transition-colors border border-white/[0.06] relative">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400" />
          </button>

          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold cursor-pointer">
            {user?.name?.charAt(0)?.toUpperCase() || 'A'}
          </div>
        </div>
      </div>

      {/* Page tabs */}
      <div className="flex items-center gap-2 px-6 pb-3 overflow-x-auto scrollbar-none">
        {pageTabs.map((tab) => {
          const mainSubPaths = ['/dashboard/hero', '/dashboard/services', '/dashboard/our-work', '/dashboard/technology', '/dashboard/testimonials', '/dashboard/blogs']
          const isActive = tab.label === 'Main'
            ? mainSubPaths.includes(pathname)
            : pathname === tab.href
          return (
            <div key={tab.label} className="flex items-center gap-2">
              {tab.divider && <div className="w-px h-4 bg-white/[0.08]" />}
              <Link
                href={tab.href}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-emerald-500 text-white'
                    : 'bg-white/[0.04] text-gray-400 hover:bg-white/[0.08] hover:text-white border border-white/[0.06]'
                }`}
              >
                {tab.label}
              </Link>
            </div>
          )
        })}
      </div>

      {searchOpen && (
        <div className="px-6 pb-3">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search sections, settings..."
              className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/30 focus:bg-white/[0.06]"
              autoFocus
            />
          </div>
        </div>
      )}
    </div>
  )
}
