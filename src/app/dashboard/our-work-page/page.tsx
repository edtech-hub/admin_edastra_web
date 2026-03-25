"use client"

import DashboardLayout from '@/components/layout/DashboardLayout'
import TopBar from '@/components/layout/TopBar'

export default function OurWorkPageDedicated() {
  return (
    <DashboardLayout>
      <TopBar title="Our Work" subtitle="Manage your portfolio page" />
      <div className="p-6">
        <div className="bg-[#1a1a1a] border border-white/[0.06] rounded-xl p-12 text-center">
          <p className="text-sm text-gray-500">Our Work page editor — Coming soon</p>
        </div>
      </div>
    </DashboardLayout>
  )
}
