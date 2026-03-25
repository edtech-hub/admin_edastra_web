"use client"

import DashboardLayout from '@/components/layout/DashboardLayout'
import TopBar from '@/components/layout/TopBar'

export default function ContactPageDedicated() {
  return (
    <DashboardLayout>
      <TopBar title="Contact" subtitle="Manage your contact page" />
      <div className="p-6">
        <div className="bg-[#1a1a1a] border border-white/[0.06] rounded-xl p-12 text-center">
          <p className="text-sm text-gray-500">Contact page editor — Coming soon</p>
        </div>
      </div>
    </DashboardLayout>
  )
}
