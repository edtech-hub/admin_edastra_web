"use client"

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

const mainSubItems = [
  { href: '/dashboard/hero', label: 'Hero Section' },
  { href: '/dashboard/services', label: 'Services' },
  { href: '/dashboard/our-work', label: 'Our Work' },
  { href: '/dashboard/technology', label: 'Technology' },
  { href: '/dashboard/testimonials', label: 'Testimonials' },
  { href: '/dashboard/blogs', label: 'Blogs' },
]

const topLevelItems = [
  { href: '/dashboard/services-page', label: 'SERVICES' },
  { href: '/dashboard/our-work-page', label: 'OUR WORK' },
  { href: '/dashboard/about', label: 'ABOUT US' },
  { href: '/dashboard/testimonials-page', label: 'TESTIMONIALS' },
]

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const [homeOpen, setHomeOpen] = useState(true)
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const isMainSection = mainSubItems.some((i) => i.href === pathname)

  return (
    <aside
      className={`fixed top-0 left-0 h-screen bg-[#0a0a0a] border-r border-white/[0.06] flex flex-col transition-all duration-300 z-50 ${collapsed ? 'w-[68px]' : 'w-[240px]'
        }`}
    >
      {/* Logo + Collapse */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-white/[0.06]">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-sm font-bold">
              EA
            </div>
            <div>
              <p className="text-sm font-semibold text-white leading-none">Ed-Astra</p>
              <p className="text-[10px] text-gray-500 mt-0.5">Admin Console</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-sm font-bold mx-auto">
            EA
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`w-7 h-7 rounded-full bg-white/[0.06] hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors ${collapsed ? 'absolute -right-3.5 top-6 bg-[#0a0a0a] border border-white/[0.06]' : ''
            }`}
        >
          <svg className={`w-3.5 h-3.5 transition-transform ${collapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {/* DASHBOARD — standalone top link */}
        {!collapsed ? (
          <Link
            href="/dashboard"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${pathname === '/dashboard'
                ? 'text-emerald-400 bg-emerald-500/10'
                : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
              }`}
          >
            DASHBOARD
          </Link>
        ) : (
          <Link
            href="/dashboard"
            className={`flex items-center justify-center py-2 rounded-lg transition-colors ${pathname === '/dashboard' ? 'text-emerald-400 bg-emerald-500/10' : 'text-gray-500 hover:text-white hover:bg-white/[0.04]'
              }`}
            title="Dashboard"
          >
            <DashboardIcon className="w-[18px] h-[18px]" />
          </Link>
        )}

        {/* MAIN — collapsible section (homepage sections) */}
        {!collapsed ? (
          <div>
            <button
              onClick={() => setHomeOpen(!homeOpen)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${isMainSection ? 'text-white' : 'text-gray-400 hover:text-white'
                }`}
            >
              <span>MAIN</span>
              <svg
                className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-200 ${homeOpen ? 'rotate-180' : ''}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Sub-items */}
            <div className={`overflow-hidden transition-all duration-200 ${homeOpen ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'}`}>
              <ul className="mt-1 ml-3 pl-3 border-l border-white/[0.06] space-y-0.5">
                {mainSubItems.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`block px-3 py-1.5 rounded-md text-[13px] transition-all duration-150 ${isActive
                            ? 'text-emerald-400 bg-emerald-500/10'
                            : 'text-gray-500 hover:text-white hover:bg-white/[0.04]'
                          }`}
                      >
                        {item.label}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>
        ) : (
          <Link
            href="/dashboard/hero"
            className={`flex items-center justify-center py-2 rounded-lg transition-colors ${isMainSection ? 'text-emerald-400 bg-emerald-500/10' : 'text-gray-500 hover:text-white hover:bg-white/[0.04]'
              }`}
            title="Main"
          >
            <HomeIcon className="w-[18px] h-[18px]" />
          </Link>
        )}

        {/* Divider */}
        <div className="my-2 mx-2 border-t border-white/[0.04]" />

        {/* Top-level nav items */}
        <ul className="space-y-0.5">
          {topLevelItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.label}>
                {!collapsed ? (
                  <Link
                    href={item.href}
                    className={`block px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${isActive
                        ? 'text-emerald-400 bg-emerald-500/10'
                        : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                      }`}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <Link
                    href={item.href}
                    className={`flex items-center justify-center py-2 rounded-lg transition-colors ${isActive ? 'text-emerald-400 bg-emerald-500/10' : 'text-gray-500 hover:text-white hover:bg-white/[0.04]'
                      }`}
                    title={item.label}
                  >
                    <span className="text-[10px] font-bold">{item.label.charAt(0)}</span>
                  </Link>
                )}
              </li>
            )
          })}
        </ul>

        {/* Back to Top */}
        {!collapsed && (
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2 px-3 py-2 mt-4 text-gray-600 hover:text-gray-400 text-xs transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
            Back to Top
          </button>
        )}
      </nav>

      {/* Bottom — User + Logout */}
      <div className="border-t border-white/[0.06] p-3">
        {!collapsed ? (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
              {user?.name?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white truncate">{user?.name || 'Admin'}</p>
              <p className="text-[10px] text-gray-500 truncate">{user?.email || ''}</p>
            </div>
            <button
              onClick={logout}
              className="w-7 h-7 rounded-lg hover:bg-red-500/10 flex items-center justify-center text-gray-500 hover:text-red-400 transition-colors"
              title="Logout"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        ) : (
          <button
            onClick={logout}
            className="w-full flex justify-center py-2 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-colors"
            title="Logout"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        )}
      </div>
    </aside>
  )
}

function DashboardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zm0 8a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1h-4a1 1 0 01-1-1v-5zm-10-2a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1v-7z" />
    </svg>
  )
}

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
  )
}
