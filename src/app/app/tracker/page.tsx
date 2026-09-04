'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { ApplicationItem, ApplicationStatus } from '@/types'
import { useToast } from '@/components/Toast'
import {
  CheckCircle,
  Briefcase,
  Clock,
  ExternalLink,
  Plus,
  Trash2,
  Edit3,
  MapPin,
  Building2,
  Calendar,
  AlertCircle,
  ChevronRight,
  Filter,
} from '@/components/icons'

const STATUS_COLUMNS: { key: ApplicationStatus; label: string; color: string; bg: string }[] = [
  { key: 'Saved', label: 'Saved Jobs', color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200' },
  { key: 'Applied', label: 'Applied', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  { key: 'Interview', label: 'Interviewing', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
  { key: 'Offer', label: 'Offers Received', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  { key: 'Closed', label: 'Archived / Closed', color: 'text-gray-700', bg: 'bg-gray-100 border-gray-200' },
]

export default function ApplicationTrackerPage() {
  const router = useRouter()
  const supabase = createClient()
  const toast = useToast()

  const [loading, setLoading] = useState(true)
  const [applications, setApplications] = useState<ApplicationItem[]>([])
  const [activeTab, setActiveTab] = useState<ApplicationStatus | 'all'>('all')

  // Modal State for adding/editing notes & follow-ups
  const [editingApp, setEditingApp] = useState<ApplicationItem | null>(null)
  const [notesInput, setNotesInput] = useState('')
  const [followUpInput, setFollowUpInput] = useState('')
  const [statusInput, setStatusInput] = useState<ApplicationStatus>('Applied')
  const [savingNote, setSavingNote] = useState(false)

  // Manual Add Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newCompany, setNewCompany] = useState('')
  const [newUrl, setNewUrl] = useState('')
  const [newStatus, setNewStatus] = useState<ApplicationStatus>('Applied')
  const [addingApp, setAddingApp] = useState(false)

  useEffect(() => {
    async function loadApplications() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login?next=/app/tracker')
        return
      }

      // Fetch from applications table
      const { data: apps } = await supabase
        .from('applications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      // Fetch from saved_jobs table to merge any saved jobs
      const { data: savedJobs } = await supabase
        .from('saved_jobs')
        .select('*')
        .eq('user_id', user.id)

      const mergedApps: ApplicationItem[] = [...(apps || [])]

      // Add saved jobs that aren't already in applications
      if (savedJobs && savedJobs.length > 0) {
        for (const sj of savedJobs) {
          const alreadyExists = mergedApps.some((a) => a.job_title === sj.job_title && a.company_name === sj.company_name)
          if (!alreadyExists) {
            mergedApps.push({
              id: sj.id,
              user_id: user.id,
              job_id: sj.job_id,
              job_title: sj.job_title,
              company_name: sj.company_name,
              location: sj.location || 'Remote',
              apply_url: sj.apply_url,
              status: 'Saved',
              applied_at: sj.created_at,
              created_at: sj.created_at,
            })
          }
        }
      }

      setApplications(mergedApps)
      setLoading(false)
    }

    loadApplications()
  }, [router, supabase])

  // Update Status in 1 Click
  const handleUpdateStatus = async (appId: string, nextStatus: ApplicationStatus) => {
    // Optimistic UI update
    setApplications((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, status: nextStatus, updated_at: new Date().toISOString() } : a))
    )

    try {
      const res = await fetch('/api/applications/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appId, status: nextStatus }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Status Updated! 🎯', `Moved to ${nextStatus}.`)
      }
    } catch {
      toast.error('Network Error', 'Could not update status.')
    }
  }

  // Save Notes & Follow-up
  const handleSaveNotes = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingApp) return

    setSavingNote(true)
    try {
      const res = await fetch('/api/applications/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appId: editingApp.id,
          status: statusInput,
          notes: notesInput,
          next_follow_up: followUpInput || null,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setApplications((prev) =>
          prev.map((a) =>
            a.id === editingApp.id
              ? { ...a, status: statusInput, notes: notesInput, next_follow_up: followUpInput || null }
              : a
          )
        )
        toast.success('Notes Saved', 'Updated application notes and follow-up date.')
        setEditingApp(null)
      }
    } catch {
      toast.error('Error', 'Could not save notes.')
    } finally {
      setSavingNote(false)
    }
  }

  // Manually Add Application
  const handleManualAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim() || !newCompany.trim()) return

    setAddingApp(true)
    try {
      const res = await fetch('/api/applications/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobTitle: newTitle.trim(),
          companyName: newCompany.trim(),
          applyUrl: newUrl.trim() || 'https://jobs.hoberg.com.ng',
        }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Added to Tracker! 📋', 'New custom application logged.')
        setIsAddModalOpen(false)
        setNewTitle('')
        setNewCompany('')
        setNewUrl('')
        // Refresh
        window.location.reload()
      }
    } catch {
      toast.error('Error', 'Could not add application.')
    } finally {
      setAddingApp(false)
    }
  }

  // Filtered applications
  const filteredApps = applications.filter((app) => {
    if (activeTab === 'all') return true
    if (activeTab === 'Applied' && app.status === 'Applied') return true
    return app.status === activeTab
  })

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-[#f5f5f7]">
        <div className="w-8 h-8 border-3 border-[#e02424] border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="flex-1 bg-[#f5f5f7] py-6 sm:py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link href="/app" className="text-[12px] text-[#86868b] hover:text-[#1d1d1f]">
                ← Dashboard
              </Link>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1d1d1f]">
              Job Application Tracker
            </h1>
            <p className="text-[13px] text-[#86868b] mt-0.5">
              Keep all your job applications, interviews, and follow-ups in one calm place.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 bg-[#1d1d1f] hover:bg-black text-white font-semibold text-[13px] px-5 py-2.5 rounded-full shadow-xs cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Application</span>
          </button>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex overflow-x-auto gap-2 pb-2 mb-6 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-full text-[13px] font-semibold transition-all shrink-0 cursor-pointer ${
              activeTab === 'all'
                ? 'bg-[#1d1d1f] text-white shadow-xs'
                : 'bg-white text-[#1d1d1f] border border-gray-200 hover:bg-gray-50'
            }`}
          >
            All Applications ({applications.length})
          </button>

          {STATUS_COLUMNS.map((col) => {
            const count = applications.filter((a) => a.status === col.key).length

            return (
              <button
                key={col.key}
                type="button"
                onClick={() => setActiveTab(col.key)}
                className={`px-4 py-2 rounded-full text-[13px] font-semibold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                  activeTab === col.key
                    ? 'bg-[#e02424] text-white shadow-xs'
                    : 'bg-white text-[#1d1d1f] border border-gray-200 hover:bg-gray-50'
                }`}
              >
                <span>{col.label}</span>
                <span className="text-[11px] opacity-80">({count})</span>
              </button>
            )
          })}
        </div>

        {/* Applications List */}
        <div className="space-y-3.5">
          {filteredApps.map((app) => {
            const targetUrl = app.apply_url || 'https://jobs.hoberg.com.ng'

            return (
              <div
                key={app.id}
                className="bg-white rounded-2xl p-5 border border-black/[0.06] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    {/* Status Pill */}
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                      app.status === 'Offer'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : app.status === 'Interview'
                        ? 'bg-blue-50 text-blue-800 border-blue-200'
                        : app.status === 'Saved'
                        ? 'bg-purple-50 text-purple-800 border-purple-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}>
                    {app.status}
                    </span>

                    <span className="text-[11px] text-[#86868b]">
                      Logged {new Date(app.created_at || app.applied_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </span>

                    {app.next_follow_up && (
                      <span className="text-[11px] font-medium bg-red-50 text-red-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>Follow-up: {app.next_follow_up}</span>
                      </span>
                    )}
                  </div>

                  <h3 className="text-[16px] font-bold text-[#1d1d1f]">{app.job_title}</h3>
                  <p className="text-[13px] text-[#86868b] mt-0.5 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>{app.company_name}</span>
                    {app.location && <span>• {app.location}</span>}
                  </p>

                  {/* Notes snippet if present */}
                  {app.notes && app.notes !== app.apply_url && (
                    <p className="text-[12px] text-gray-700 bg-[#f5f5f7] p-2 rounded-xl mt-2 max-w-xl">
                      📝 {app.notes}
                    </p>
                  )}
                </div>

                {/* Right Side: Quick Status Actions & Notes */}
                <div className="flex flex-wrap sm:flex-col items-center sm:items-end gap-2 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                  {/* Status Dropdown */}
                  <div className="flex items-center gap-1.5">
                    <select
                      value={app.status === 'Applied' ? 'Applied' : app.status}
                      onChange={(e) => handleUpdateStatus(app.id, e.target.value as ApplicationStatus)}
                      className="text-[12px] font-semibold bg-[#f5f5f7] border border-[#d2d2d7] rounded-full px-3 py-1.5 focus:outline-none cursor-pointer"
                    >
                      <option value="Saved">📌 Saved</option>
                      <option value="Applied">📤 Applied</option>
                      <option value="Interview">💼 Interview</option>
                      <option value="Offer">🎉 Offer</option>
                      <option value="Closed">📁 Closed</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => {
                        setEditingApp(app)
                        setNotesInput(app.notes || '')
                        setFollowUpInput(app.next_follow_up || '')
                        setStatusInput(app.status as ApplicationStatus)
                      }}
                      className="p-1.5 text-gray-500 hover:text-black rounded-lg hover:bg-gray-100"
                      title="Add follow-up notes"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    {targetUrl && (
                      <a
                        href={targetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-[#e02424] hover:bg-red-50 rounded-lg"
                        title="Open job link"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Empty State */}
        {filteredApps.length === 0 && (
          <div className="text-center py-16 bg-white rounded-3xl p-8 border border-gray-200 mt-4">
            <h3 className="text-base font-semibold text-[#1d1d1f]">No applications in this category yet.</h3>
            <p className="text-[13px] text-[#86868b] mt-1 max-w-sm mx-auto">
              When you tap &quot;Apply&quot; on any job posting, it will automatically show up here so you never lose track.
            </p>
            <div className="mt-5">
              <Link
                href="/jobs"
                className="inline-flex items-center gap-2 bg-[#e02424] text-white font-semibold text-[13px] px-6 py-2.5 rounded-full"
              >
                Browse Open Jobs →
              </Link>
            </div>
          </div>
        )}

        {/* ─── Modal: Notes & Follow-up Editor ─── */}
        {editingApp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-gray-200 shadow-xl">
              <h3 className="font-bold text-[16px] text-[#1d1d1f] mb-1">
                Edit Application: {editingApp.job_title}
              </h3>
              <p className="text-[12px] text-[#86868b] mb-4">{editingApp.company_name}</p>

              <form onSubmit={handleSaveNotes} className="space-y-4">
                <div>
                  <label className="block text-[12px] font-semibold text-[#1d1d1f] mb-1">Stage Status</label>
                  <select
                    value={statusInput}
                    onChange={(e) => setStatusInput(e.target.value as ApplicationStatus)}
                    className="w-full text-[13px] bg-[#f5f5f7] border border-[#d2d2d7] rounded-xl px-3.5 py-2.5 focus:outline-none"
                  >
                    <option value="Saved">Saved</option>
                    <option value="Applied">Applied</option>
                    <option value="Interview">Interviewing</option>
                    <option value="Offer">Offer Received</option>
                    <option value="Closed">Closed / Archived</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-[#1d1d1f] mb-1">Next Follow-Up Date</label>
                  <input
                    type="date"
                    value={followUpInput}
                    onChange={(e) => setFollowUpInput(e.target.value)}
                    className="w-full text-[13px] bg-[#f5f5f7] border border-[#d2d2d7] rounded-xl px-3.5 py-2.5 focus:outline-none"
                  >
                  </input>
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-[#1d1d1f] mb-1">Notes / Recruiter Details</label>
                  <textarea
                    rows={3}
                    value={notesInput}
                    onChange={(e) => setNotesInput(e.target.value)}
                    placeholder="e.g. Sent CV on company portal. Interview scheduled with HR on Tuesday."
                    className="w-full text-[13px] bg-[#f5f5f7] border border-[#d2d2d7] rounded-xl p-3 focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingApp(null)}
                    className="px-4 py-2 rounded-xl text-[13px] text-[#86868b] hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingNote}
                    className="px-5 py-2 rounded-xl text-[13px] font-semibold text-white bg-[#e02424] hover:bg-[#c81e1e]"
                  >
                    {savingNote ? 'Saving...' : 'Save Notes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ─── Modal: Manual Add Application ─── */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-gray-200 shadow-xl">
              <h3 className="font-bold text-[16px] text-[#1d1d1f] mb-1">Log an Application</h3>
              <p className="text-[12px] text-[#86868b] mb-4">
                Track a job you applied to externally or on another site.
              </p>

              <form onSubmit={handleManualAdd} className="space-y-4">
                <div>
                  <label className="block text-[12px] font-semibold text-[#1d1d1f] mb-1">Job Title</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Product Manager"
                    className="w-full text-[13px] bg-[#f5f5f7] border border-[#d2d2d7] rounded-xl px-3.5 py-2.5 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-[#1d1d1f] mb-1">Company Name</label>
                  <input
                    type="text"
                    required
                    value={newCompany}
                    onChange={(e) => setNewCompany(e.target.value)}
                    placeholder="e.g. Paystack, Flutterwave, Moniepoint"
                    className="w-full text-[13px] bg-[#f5f5f7] border border-[#d2d2d7] rounded-xl px-3.5 py-2.5 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-[#1d1d1f] mb-1">Application URL (Optional)</label>
                  <input
                    type="url"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full text-[13px] bg-[#f5f5f7] border border-[#d2d2d7] rounded-xl px-3.5 py-2.5 focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-[13px] text-[#86868b] hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addingApp}
                    className="px-5 py-2 rounded-xl text-[13px] font-semibold text-white bg-[#1d1d1f] hover:bg-black"
                  >
                    {addingApp ? 'Adding...' : 'Log Application'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

