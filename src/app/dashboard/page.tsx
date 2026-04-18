"use client"

import { useState, useEffect, useCallback } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import TopBar from '@/components/layout/TopBar'
import EnquiryCard, { Enquiry } from '@/components/ui/EnquiryCard'
import api from '@/lib/api'

const interactionStats = [
  { key: 'views', label: 'Website Views' },
  { key: 'duration', label: 'Avg Session Duration', suffix: 'Sec' },
  { key: 'projectViews', label: 'Project Views' },
  { key: 'totalEnquiries', label: 'Total Enquiries' },
]

const performanceStats = [
  { key: 'formAbandonment', label: 'Form Abandonment Rate' },
  { key: 'ctaClicks', label: 'CTA Click Rates' },
  { key: 'returnFrequency', label: 'Return Frequency', suffix: '% Percent' },
  { key: 'errorRates', label: 'Error Rates' },
]

type ViewMode = 'grid' | 'list'

export default function DashboardPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([])
  const [stats, setStats] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')

  const fetchData = useCallback(async () => {
    try {
      const [contactRes, statsRes] = await Promise.allSettled([
        api.get('/contact'),
        api.get('/contact/stats'),
      ])

      if (contactRes.status === 'fulfilled') {
        const data = contactRes.value.data
        setEnquiries(data.data || data.contacts || [])
      }
      if (statsRes.status === 'fulfilled') {
        const data = statsRes.value.data
        setStats({
          totalEnquiries: data.data?.total || data.total || 0,
          actionTaken: (data.data?.contacted || 0) + (data.data?.completed || 0) + (data.data?.archived || 0),
        })
      }
    } catch {
      // API not connected yet — show empty state
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleAccept = async (id: string) => {
    try {
      await api.put(`/contact/${id}`, { status: 'contacted' })
      setEnquiries((prev) => prev.map((e) => e._id === id ? { ...e, status: 'contacted' } : e))
    } catch { /* */ }
  }

  const handleDecline = async (id: string) => {
    try {
      await api.put(`/contact/${id}`, { status: 'archived' })
      setEnquiries((prev) => prev.map((e) => e._id === id ? { ...e, status: 'archived' } : e))
    } catch { /* */ }
  }

  return (
    <DashboardLayout>
      <TopBar title="Dashboard" subtitle="Dashboard" />

      <div className="p-6 space-y-8">
        {/* Website Interaction Statistics */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-4">Website Interaction Statistics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {interactionStats.map((stat) => (
              <StatCard
                key={stat.key}
                label={stat.label}
                value={stats[stat.key] ?? '—'}
                suffix={stat.suffix}
              />
            ))}
          </div>
        </section>

        {/* Performance Statistics */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-4">Performance Statistics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {performanceStats.map((stat) => (
              <StatCard
                key={stat.key}
                label={stat.label}
                value={stats[stat.key] ?? '—'}
                suffix={stat.suffix}
              />
            ))}
          </div>
        </section>

        {/* Enquiries Received / Action Taken */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 text-center">
            <p className="text-4xl font-bold text-emerald-400">
              {stats.totalEnquiries ?? '—'}
            </p>
            <p className="text-sm text-gray-400 mt-2">Total Enquiries received</p>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 text-center">
            <p className="text-4xl font-bold text-emerald-400">
              {stats.actionTaken ?? '—'}
            </p>
            <p className="text-sm text-gray-400 mt-2">Interacted or rejected the request</p>
          </div>
        </div>

        {/* Enquiries List */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-white">Enquiries</h2>
              <button className="text-gray-500 hover:text-white transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
                </svg>
              </button>
            </div>
            <div className="flex items-center gap-1.5">
              {/* View toggle */}
              <button
                onClick={() => setViewMode('grid')}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                  viewMode === 'grid' ? 'bg-white/[0.08] text-white' : 'text-gray-500 hover:text-white'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                  viewMode === 'list' ? 'bg-white/[0.08] text-white' : 'text-gray-500 hover:text-white'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
                </svg>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : enquiries.length === 0 ? (
            <div className="bg-[#1a1a1a] border border-white/[0.06] rounded-xl p-12 text-center">
              <svg className="w-12 h-12 text-gray-700 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
              <p className="text-sm text-gray-500">No enquiries yet</p>
              <p className="text-xs text-gray-600 mt-1">Enquiries from the contact form will appear here</p>
            </div>
          ) : (
            <div className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 gap-4'
                : 'flex flex-col gap-3'
            }>
              {enquiries.map((enquiry) => (
                <EnquiryCard
                  key={enquiry._id}
                  enquiry={enquiry}
                  onAccept={handleAccept}
                  onDecline={handleDecline}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  )
}

function StatCard({ label, value, suffix }: { label: string; value: string | number; suffix?: string }) {
  return (
    <div className="bg-[#1a1a1a] border border-white/[0.06] rounded-xl p-5 text-center">
      <p className="text-3xl font-bold text-emerald-400">{value}</p>
      {suffix && <p className="text-xs text-gray-500 mt-0.5">{suffix}</p>}
      <p className="text-sm text-gray-400 mt-2">{label}</p>
    </div>
  )
}
