"use client"

import { useState } from 'react'

export interface Enquiry {
  _id: string
  name: string
  email: string
  phone?: string
  company?: string
  projectType?: string
  budget?: string
  timeline?: string
  message?: string
  status: string
  priority?: string
  createdAt: string
}

interface EnquiryCardProps {
  enquiry: Enquiry
  onAccept?: (id: string) => void
  onDecline?: (id: string) => void
}

const statusColors: Record<string, string> = {
  new: 'bg-emerald-400',
  contacted: 'bg-blue-400',
  'in-progress': 'bg-amber-400',
  completed: 'bg-gray-400',
  archived: 'bg-red-400',
}

export default function EnquiryCard({ enquiry, onAccept, onDecline }: EnquiryCardProps) {
  const [expanded, setExpanded] = useState(false)

  const date = new Date(enquiry.createdAt)
  const formattedDate = date.toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: '2-digit',
  })
  const formattedTime = date.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', hour12: true,
  })

  return (
    <div className="bg-[#1e1e1e] border border-white/[0.06] rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-white/[0.02] border-b border-white/[0.04]">
        <p className="text-[10px] text-gray-500">
          Received on {formattedDate} ({formattedTime})
        </p>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${statusColors[enquiry.status] || 'bg-gray-400'}`} />
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-gray-500 hover:text-white transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
          <button className="text-gray-500 hover:text-red-400 transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Project type badge */}
      <div className="px-4 pt-3 pb-1">
        <div className="inline-flex items-center gap-1.5">
          <span className="text-sm font-medium text-white">{enquiry.projectType || 'General'}</span>
          <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-3 space-y-2">
        {/* Name */}
        <FieldRow icon="user" value={enquiry.name} />

        {/* Location / Company */}
        <FieldRow icon="location" value={enquiry.company || 'Location not specified'} muted={!enquiry.company} />

        {expanded && (
          <>
            <FieldRow icon="email" value={enquiry.email} />
            <FieldRow icon="phone" value={enquiry.phone || 'Not provided'} muted={!enquiry.phone} />
            {enquiry.budget && <FieldRow icon="budget" value={enquiry.budget} />}
            {enquiry.message && <FieldRow icon="message" value={enquiry.message} />}
            {enquiry.timeline && <FieldRow icon="calendar" value={enquiry.timeline} />}
          </>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 px-4 py-3 border-t border-white/[0.04]">
        <button
          onClick={() => onDecline?.(enquiry._id)}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-red-500/10 text-gray-400 hover:text-red-400 text-xs font-medium transition-all border border-white/[0.06] hover:border-red-500/20"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Decline
        </button>
        <button
          onClick={() => onAccept?.(enquiry._id)}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-medium transition-all"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Accept
        </button>
      </div>
    </div>
  )
}

function FieldRow({ icon, value, muted }: { icon: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-start gap-2.5">
      <FieldIcon type={icon} />
      <p className={`text-xs leading-relaxed ${muted ? 'text-gray-600 italic' : 'text-gray-300'}`}>
        {value}
      </p>
    </div>
  )
}

function FieldIcon({ type }: { type: string }) {
  const cls = "w-3.5 h-3.5 text-gray-600 mt-0.5 flex-shrink-0"
  switch (type) {
    case 'user':
      return <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
    case 'location':
      return <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
    case 'email':
      return <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
    case 'phone':
      return <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>
    case 'budget':
      return <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    case 'message':
      return <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" /></svg>
    case 'calendar':
      return <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
    default:
      return null
  }
}
