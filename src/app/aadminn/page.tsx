'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import {
  ShieldCheck,
  CheckCircle,
  Clock,
  Briefcase,
  Globe,
  ExternalLink,
  Search,
  Crown,
  Users,
  RefreshCw,
  Trash2,
  UserCheck,
  UserX,
  Eye,
  EyeOff,
  Lock,
  Mail,
  AlertCircle,
  FileText,
  DollarSign,
  Building2,
  ArrowRight,
  X,
  Linkedin,
  Twitter,
  MessageCircle,
  Github,
  Activity,
  History,
} from '@/components/icons'
import { useToast } from '@/components/Toast'

interface UserProfile {
  id: string
  full_name?: string
  display_name?: string
  email?: string
  country?: string
  city?: string
  career_field?: string
  desired_roles?: string
  user_status?: string
  education_level?: string
  institution?: string
  graduation_year?: string
  experience_years?: string
  experience_summary?: string
  skills?: string[] | string
  resume_url?: string
  linkedin_url?: string
  twitter_url?: string
  whatsapp_number?: string
  github_url?: string
  portfolio_url?: string
  job_type_preference?: string
  expected_salary?: string
  review_status?: 'draft' | 'under_review' | 'approved' | 'rejected'
  review_notes?: string
  is_premium?: boolean
  premium_tier?: string
  last_login_at?: string
  last_logout_at?: string
  created_at?: string
  submitted_at?: string
  reviewed_at?: string
}

interface AuthLog {
  id: string
  user_id: string
  user_email: string
  user_name?: string
  event_type: 'login' | 'logout'
  ip_address?: string
  user_agent?: string
  created_at: string
}

interface Metrics {
  totalUsers: number
  underReview: number
  approved: number
  draft: number
  rejected: number
  premiumUsers: number
  freeUsers: number
  estimatedRevenue: number
  totalAuthLogs?: number
}

function formatServerTimestamp(isoString?: string | null) {
  if (!isoString) return 'Never'
  try {
    const d = new Date(isoString)
    if (isNaN(d.getTime())) return 'Invalid date'
    return (
      new Intl.DateTimeFormat('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
        timeZone: 'Africa/Lagos',
      }).format(d) + ' (WAT)'
    )
  } catch {
    return isoString
  }
}

export default function AdminPortalPage() {
  const toast = useToast()
  // Auth state
  const [authChecking, setAuthChecking] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)

  // Dashboard state
  const [users, setUsers] = useState<UserProfile[]>([])
  const [authLogs, setAuthLogs] = useState<AuthLog[]>([])
  const [applications, setApplications] = useState<any[]>([])
  const [metrics, setMetrics] = useState<Metrics>({
    totalUsers: 0,
    underReview: 0,
    approved: 0,
    draft: 0,
    rejected: 0,
    premiumUsers: 0,
    freeUsers: 0,
    estimatedRevenue: 0,
    totalAuthLogs: 0,
  })
  const [dataLoading, setDataLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterTab, setFilterTab] = useState<'all' | 'under_review' | 'approved' | 'draft' | 'premium' | 'logs'>('all')
  const [autoSync, setAutoSync] = useState(true)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)
  const [dashboardError, setDashboardError] = useState<string | null>(null)

  // Modals
  const [inspectUser, setInspectUser] = useState<UserProfile | null>(null)
  const [rejectModalUser, setRejectModalUser] = useState<UserProfile | null>(null)
  const [rejectNotes, setRejectNotes] = useState('')
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<UserProfile | null>(null)

  // Check auth on load
  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/auth')
      const data = await res.json()
      if (data.authenticated) {
        setAuthenticated(true)
      } else {
        setAuthenticated(false)
      }
    } catch {
      setAuthenticated(false)
    } finally {
      setAuthChecking(false)
    }
  }, [])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  // Fetch users, metrics & security audit logs
  const fetchDashboardData = useCallback(async (silent = false) => {
    if (!silent) setDataLoading(true)
    try {
      const res = await fetch('/api/admin/users')
      const data = await res.json()
      if (data.success) {
        setUsers(data.users || [])
        setAuthLogs(data.authLogs || [])
        setApplications(data.applications || [])
        setMetrics(data.metrics)
        if (data.authLogsError || data.applicationsError) {
          setDashboardError(`Table Notice: ${data.authLogsError || ''} ${data.applicationsError || ''}. Please ensure RLS policies allow admin read.`)
        }
      } else {
        setDashboardError(data.error || 'Failed to load candidates from database.')
      }
    } catch {
      if (!silent) setDashboardError('Failed to connect to admin API.')
    } finally {
      if (!silent) setDataLoading(false)
    }
  }, [])

  useEffect(() => {
    if (authenticated) {
      fetchDashboardData()
    }
  }, [authenticated, fetchDashboardData])

  // Auto-sync polling every 8 seconds
  useEffect(() => {
    if (!authenticated || !autoSync) return
    const interval = setInterval(() => {
      fetchDashboardData(true)
    }, 8000)
    return () => clearInterval(interval)
  }, [authenticated, autoSync, fetchDashboardData])

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginLoading(true)
    setLoginError(null)

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      })
      const data = await res.json()

      if (data.success) {
        setAuthenticated(true)
        toast.success('Admin Authenticated 🔐', 'Welcome to Hoberg Admin Command Center.')
        fetchDashboardData()
      } else {
        setLoginError(data.error || 'Invalid credentials')
        toast.error('Login Failed', data.error || 'Invalid admin credentials')
      }
    } catch {
      setLoginError('Authentication service unreachable.')
      toast.error('Network Error', 'Authentication service unreachable.')
    } finally {
      setLoginLoading(false)
    }
  }

  // Handle Logout
  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    setAuthenticated(false)
    setLoginPassword('')
    toast.info('Admin Signed Out', 'You have been logged out of the admin center.')
  }

  // Perform Admin Action (Approve, Reject, Toggle Premium, Delete)
  const performAction = async (
    userId: string,
    action: 'approve' | 'reject' | 'toggle_premium' | 'delete',
    payload?: { reviewNotes?: string; isPremium?: boolean }
  ) => {
    setActionLoadingId(userId)
    try {
      const res = await fetch('/api/admin/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          action,
          reviewNotes: payload?.reviewNotes,
          isPremium: payload?.isPremium,
        }),
      })
      const data = await res.json()

      if (data.success) {
        // Refresh dataset
        await fetchDashboardData(true)

        // Close or update any active modal
        if (inspectUser?.id === userId) {
          const updatedUser = users.find((u) => u.id === userId)
          if (updatedUser && action !== 'delete') {
            setInspectUser({
              ...updatedUser,
              review_status: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : updatedUser.review_status,
              is_premium: action === 'toggle_premium' ? !payload?.isPremium : updatedUser.is_premium,
            })
          } else {
            setInspectUser(null)
          }
        }
        if (action === 'approve') {
          toast.success('Account Approved! 🟢', 'Candidate can now apply for jobs immediately.')
        } else if (action === 'reject') {
          toast.warning('Account Rejected', 'Candidate status updated.')
        } else if (action === 'toggle_premium') {
          toast.success('Membership Updated', 'Candidate premium access toggled.')
        } else if (action === 'delete') {
          toast.info('Candidate Removed', 'User profile deleted from platform.')
        }
      } else {
        toast.error('Action Failed', data.error || 'Action could not be completed.')
      }
    } catch {
      toast.error('Network Error', 'Network error executing admin action.')
    } finally {
      setActionLoadingId(null)
    }
  }

  // Filtered users list
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // Tab filter
      if (filterTab === 'under_review' && u.review_status !== 'under_review') return false
      if (filterTab === 'approved' && u.review_status !== 'approved') return false
      if (filterTab === 'draft' && u.review_status !== 'draft' && u.review_status) return false
      if (filterTab === 'premium' && !u.is_premium) return false

      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase()
        const name = (u.full_name || u.display_name || '').toLowerCase()
        const email = (u.email || '').toLowerCase()
        const country = (u.country || '').toLowerCase()
        const city = (u.city || '').toLowerCase()
        const career = (u.career_field || '').toLowerCase()
        const skillsText = Array.isArray(u.skills) ? u.skills.join(' ').toLowerCase() : (u.skills || '').toLowerCase()

        return (
          name.includes(query) ||
          email.includes(query) ||
          country.includes(query) ||
          city.includes(query) ||
          career.includes(query) ||
          skillsText.includes(query)
        )
      }

      return true
    })
  }, [users, filterTab, searchTerm])

  // Filtered auth logs
  const filteredLogs = useMemo(() => {
    if (!searchTerm.trim()) return authLogs
    const q = searchTerm.toLowerCase()
    return authLogs.filter(
      (l) =>
        (l.user_email || '').toLowerCase().includes(q) ||
        (l.user_name || '').toLowerCase().includes(q) ||
        (l.ip_address || '').toLowerCase().includes(q) ||
        (l.user_agent || '').toLowerCase().includes(q) ||
        (l.event_type || '').toLowerCase().includes(q)
    )
  }, [authLogs, searchTerm])

  // Candidate specific logs for modal
  const candidateLogs = useMemo(() => {
    if (!inspectUser) return []
    const targetId = inspectUser.id
    const targetEmail = (inspectUser.email || '').toLowerCase().trim()
    return authLogs.filter((l) => {
      if (l.user_id && targetId && l.user_id === targetId) return true
      if (l.user_email && targetEmail && l.user_email.toLowerCase().trim() === targetEmail) return true
      return false
    })
  }, [authLogs, inspectUser])

  // Candidate specific applications for modal
  const candidateApplications = useMemo(() => {
    if (!inspectUser) return []
    return applications.filter((app) => app.user_id === inspectUser.id)
  }, [applications, inspectUser])

  if (authChecking) {
    return (
      <div className="flex-1 bg-[#121214] text-white py-32 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#e02424] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-400 text-[14px]">Verifying secure session...</p>
      </div>
    )
  }

  // ----------------------------------------------------
  // 1. UNPROTECTED / LOGIN GATE SCREEN
  // ----------------------------------------------------
  if (!authenticated) {
    return (
      <div className="flex-1 bg-[#0f0f11] text-white flex items-center justify-center px-4 py-16 sm:py-24">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-950/40 border border-red-500/30 rounded-3xl mb-4 text-[#e02424] shadow-lg shadow-red-950/20">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Hoberg Command Center
            </h1>
            <p className="text-gray-400 text-[14px] mt-2">
              Authorized administrator access only.
            </p>
          </div>

          {/* Login Card */}
          <div className="bg-[#18181b] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl">
            {loginError && (
              <div className="mb-5 p-3.5 bg-red-950/50 border border-red-800 text-red-300 text-[13px] rounded-2xl flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-[13px] font-semibold text-gray-300 mb-1.5">
                  Admin Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="info@hoberg.com.ng"
                    className="w-full bg-[#27272a] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-[14px] text-white placeholder-gray-500 outline-none focus:border-[#e02424] focus:ring-1 focus:ring-[#e02424] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-300 mb-1.5">
                  Admin Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-[#27272a] border border-white/10 rounded-xl pl-10 pr-10 py-3 text-[14px] text-white placeholder-gray-500 outline-none focus:border-[#e02424] focus:ring-1 focus:ring-[#e02424] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full bg-[#e02424] hover:bg-[#c81e1e] text-white font-bold text-[15px] py-3.5 rounded-full transition-all shadow-md disabled:opacity-60 mt-3 cursor-pointer"
              >
                {loginLoading ? 'Authenticating...' : 'Sign In to Portal'}
              </button>
            </form>
          </div>

          <div className="text-center mt-6">
            <Link
              href="/"
              className="text-[13px] text-gray-500 hover:text-gray-300 transition-colors"
            >
              &larr; Return to main platform
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // ----------------------------------------------------
  // 2. AUTHENTICATED REAL-TIME ADMIN DASHBOARD
  // ----------------------------------------------------
  return (
    <div className="flex-1 bg-[#0f0f11] text-white min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Command Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-8 border-b border-white/10 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <span className="font-black text-2xl tracking-tight">
                <span className="text-[#e02424]">Hoberg</span>
                <span className="text-white ml-1.5">Admin</span>
              </span>
              <span className="inline-flex items-center gap-1.5 bg-red-950/60 border border-red-700/50 text-[#e02424] text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                COMMAND PORTAL
              </span>
            </div>
            <p className="text-gray-400 text-[13px] mt-1">
              Live Candidate Verification &bull; Security Audit &bull; Revenue Analytics
            </p>
          </div>

          {/* Sync & Logout Actions */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Auto-Sync Toggle */}
            <button
              onClick={() => setAutoSync(!autoSync)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[12px] font-semibold transition-all cursor-pointer ${
                autoSync
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400'
                  : 'bg-gray-800 border-gray-700 text-gray-400'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${autoSync ? 'bg-emerald-400 animate-pulse' : 'bg-gray-500'}`} />
              <span>{autoSync ? 'Live Sync Active' : 'Live Sync Paused'}</span>
            </button>

            {/* Manual Refresh */}
            <button
              onClick={() => fetchDashboardData()}
              disabled={dataLoading}
              className="inline-flex items-center gap-1.5 bg-[#27272a] hover:bg-[#3f3f46] text-gray-200 border border-white/10 px-3.5 py-2 rounded-xl text-[13px] font-semibold transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${dataLoading ? 'animate-spin text-[#e02424]' : ''}`} />
              <span>Refresh</span>
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/40 px-3.5 py-2 rounded-xl text-[13px] font-semibold transition-colors cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Sync / Database Alert if error occurs */}
        {dashboardError && (
          <div className="mb-6 p-4 bg-red-950/60 border border-red-800 rounded-2xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-red-200 text-sm">Database Sync Note:</h4>
              <p className="text-red-300 text-xs mt-0.5">{dashboardError}</p>
              <p className="text-gray-400 text-xs mt-2">
                Make sure you have run the Supabase RLS policy query in your Supabase SQL editor so the admin dashboard can read candidates and security logs.
              </p>
            </div>
          </div>
        )}

        {/* 5 Real-Time KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {/* Total Candidates */}
          <div
            onClick={() => setFilterTab('all')}
            className={`bg-[#18181b] border rounded-2xl p-5 shadow-sm cursor-pointer transition-all ${
              filterTab === 'all' ? 'border-blue-400 bg-blue-950/20' : 'border-white/10 hover:border-blue-400'
            }`}
          >
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-[12px] uppercase font-bold tracking-wider">Total Users</span>
              <Users className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-3xl font-black text-white">{metrics.totalUsers}</div>
            <p className="text-[11px] text-gray-400 mt-1">{metrics.approved} approved candidates</p>
          </div>

          {/* Pending Reviews */}
          <div
            onClick={() => setFilterTab('under_review')}
            className={`bg-[#18181b] border rounded-2xl p-5 shadow-sm cursor-pointer transition-all ${
              filterTab === 'under_review' ? 'border-amber-400 bg-amber-950/20' : 'border-amber-500/30 hover:border-amber-400'
            }`}
          >
            <div className="flex items-center justify-between text-amber-400 mb-2">
              <span className="text-[12px] uppercase font-bold tracking-wider">Needs Review</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl font-black text-amber-400">{metrics.underReview}</div>
            <p className="text-[11px] text-amber-300/80 mt-1">🟡 Click to review applications</p>
          </div>

          {/* Approved */}
          <div
            onClick={() => setFilterTab('approved')}
            className={`bg-[#18181b] border rounded-2xl p-5 shadow-sm cursor-pointer transition-all ${
              filterTab === 'approved' ? 'border-emerald-400 bg-emerald-950/20' : 'border-emerald-500/30 hover:border-emerald-400'
            }`}
          >
            <div className="flex items-center justify-between text-emerald-400 mb-2">
              <span className="text-[12px] uppercase font-bold tracking-wider">Approved</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-black text-emerald-400">{metrics.approved}</div>
            <p className="text-[11px] text-emerald-300/80 mt-1">🟢 Active job seekers</p>
          </div>

          {/* Free vs Premium */}
          <div
            onClick={() => setFilterTab('premium')}
            className={`bg-[#18181b] border rounded-2xl p-5 shadow-sm cursor-pointer transition-all ${
              filterTab === 'premium' ? 'border-amber-400 bg-amber-950/20' : 'border-white/10 hover:border-amber-400'
            }`}
          >
            <div className="flex items-center justify-between text-amber-300 mb-2">
              <span className="text-[12px] uppercase font-bold tracking-wider">Premium Members</span>
              <Crown className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl font-black text-amber-300">{metrics.premiumUsers}</div>
            <p className="text-[11px] text-gray-400 mt-1">{metrics.freeUsers} on free tier</p>
          </div>

          {/* Security & Audit Events */}
          <div
            onClick={() => setFilterTab('logs')}
            className={`bg-[#18181b] border rounded-2xl p-5 shadow-sm cursor-pointer transition-all ${
              filterTab === 'logs' ? 'border-red-400 bg-red-950/30' : 'border-white/10 hover:border-red-400'
            }`}
          >
            <div className="flex items-center justify-between text-[#e02424] mb-2">
              <span className="text-[12px] uppercase font-bold tracking-wider">Auth Events</span>
              <Lock className="w-4 h-4 text-[#e02424]" />
            </div>
            <div className="text-3xl font-black text-white">
              {authLogs.length}
            </div>
            <p className="text-[11px] text-gray-400 mt-1">🔐 Login &amp; Logout logs</p>
          </div>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="bg-[#18181b] border border-white/10 rounded-3xl p-4 sm:p-6 mb-6 shadow-sm">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
              {[
                { id: 'all', label: `All Users (${users.length})` },
                { id: 'under_review', label: `🟡 Under Review (${metrics.underReview})` },
                { id: 'approved', label: `🟢 Approved (${metrics.approved})` },
                { id: 'draft', label: `⚪ Incomplete / Draft (${metrics.draft})` },
                { id: 'premium', label: `👑 Premium (${metrics.premiumUsers})` },
                { id: 'logs', label: `🔐 Login/Logout Audit (${authLogs.length})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilterTab(tab.id as any)}
                  className={`px-4 py-2 rounded-xl text-[13px] font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    filterTab === tab.id
                      ? 'bg-[#e02424] text-white shadow-md'
                      : 'bg-[#27272a] hover:bg-[#3f3f46] text-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative min-w-[260px] sm:min-w-[320px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={filterTab === 'logs' ? 'Search email, IP, event...' : 'Search name, email, skills...'}
                className="w-full bg-[#27272a] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-[13px] text-white placeholder-gray-500 outline-none focus:border-[#e02424] transition-all"
              />
            </div>
          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* VIEW 1: SECURITY & AUTHENTICATION AUDIT LOGS */}
        {/* ---------------------------------------------------- */}
        {filterTab === 'logs' ? (
          <div className="bg-[#18181b] border border-white/10 rounded-3xl overflow-hidden shadow-xl">
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-white">User Authentication &amp; Activity Log</h3>
                <p className="text-xs text-gray-400 mt-0.5">Live tracking of all login and logout events with IP and device footprints</p>
              </div>
              <span className="bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 text-[11px] font-bold px-3 py-1 rounded-full">
                🟢 Live Audit Active
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-[#27272a]/60 text-[12px] font-bold uppercase tracking-wider text-gray-400">
                    <th className="py-4 px-5">Event</th>
                    <th className="py-4 px-5">User Account</th>
                    <th className="py-4 px-5">IP Address</th>
                    <th className="py-4 px-5">Browser &amp; Device</th>
                    <th className="py-4 px-5 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-[13px]">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-16 text-center text-gray-500">
                        No authentication logs recorded yet. Events will appear here in real-time as users log in and sign out.
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log, idx) => (
                      <tr key={log.id || idx} className="hover:bg-white/[0.02] transition-colors">
                        {/* Event */}
                        <td className="py-3.5 px-5">
                          {log.event_type === 'login' ? (
                            <span className="inline-flex items-center gap-1.5 bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              LOGGED IN
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 bg-gray-800 border border-gray-700 text-gray-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                              <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                              LOGGED OUT
                            </span>
                          )}
                        </td>

                        {/* User Account */}
                        <td className="py-3.5 px-5">
                          <div className="font-semibold text-white">{log.user_name || 'Job Seeker'}</div>
                          <div className="text-xs text-gray-400">{log.user_email}</div>
                        </td>

                        {/* IP Address */}
                        <td className="py-3.5 px-5 font-mono text-xs text-gray-300">
                          {log.ip_address || 'Direct'}
                        </td>

                        {/* Browser & Device */}
                        <td className="py-3.5 px-5 text-xs text-gray-400 max-w-xs truncate">
                          {log.user_agent || 'Web Browser'}
                        </td>

                        {/* Timestamp */}
                        <td className="py-3.5 px-5 text-right text-xs text-gray-400 whitespace-nowrap">
                          {formatServerTimestamp(log.created_at)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* ---------------------------------------------------- */
          /* VIEW 2: CANDIDATES MANAGEMENT TABLE */
          /* ---------------------------------------------------- */
          <div className="bg-[#18181b] border border-white/10 rounded-3xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-[#27272a]/60 text-[12px] font-bold uppercase tracking-wider text-gray-400">
                    <th className="py-4 px-5">Candidate</th>
                    <th className="py-4 px-5">Career &amp; Location</th>
                    <th className="py-4 px-5">Review Status</th>
                    <th className="py-4 px-5">Tier</th>
                    <th className="py-4 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-[14px]">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-16 text-center text-gray-500">
                        No candidates found matching the current filter or search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const candidateName = u.full_name || u.display_name || 'Job Seeker'
                      const candidateEmail = u.email || 'Google User'
                      const status = u.review_status || 'draft'
                      const isLoading = actionLoadingId === u.id

                      return (
                        <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                          {/* Candidate */}
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-2xl bg-[#27272a] border border-white/10 flex items-center justify-center font-bold text-gray-300 shrink-0">
                                {candidateName.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <button
                                  onClick={() => setInspectUser(u)}
                                  className="font-bold text-white hover:text-[#e02424] transition-colors text-left block cursor-pointer"
                                >
                                  {candidateName}
                                </button>
                                <span className="text-[12px] text-gray-400 block">{candidateEmail}</span>
                              </div>
                            </div>
                          </td>

                          {/* Career & Location */}
                          <td className="py-4 px-5">
                            <div className="font-medium text-gray-200">{u.career_field || 'Not specified'}</div>
                            <div className="text-[12px] text-gray-400">
                              {[u.city, u.country].filter(Boolean).join(', ') || 'Remote'}
                            </div>
                          </td>

                          {/* Review Status Badge */}
                          <td className="py-4 px-5">
                            {status === 'approved' ? (
                              <span className="inline-flex items-center gap-1 bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 text-[12px] font-bold px-2.5 py-1 rounded-full">
                                <CheckCircle className="w-3.5 h-3.5" />
                                Approved
                              </span>
                            ) : status === 'under_review' ? (
                              <span className="inline-flex items-center gap-1 bg-amber-950/60 border border-amber-500/40 text-amber-400 text-[12px] font-bold px-2.5 py-1 rounded-full animate-pulse">
                                <Clock className="w-3.5 h-3.5" />
                                Under Review
                              </span>
                            ) : status === 'rejected' ? (
                              <span className="inline-flex items-center gap-1 bg-red-950/60 border border-red-500/40 text-red-400 text-[12px] font-bold px-2.5 py-1 rounded-full">
                                <AlertCircle className="w-3.5 h-3.5" />
                                Rejected
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 bg-gray-800 text-gray-400 text-[12px] font-medium px-2.5 py-1 rounded-full">
                                Draft
                              </span>
                            )}
                          </td>

                          {/* Membership Tier */}
                          <td className="py-4 px-5">
                            {u.is_premium ? (
                              <span className="inline-flex items-center gap-1 bg-amber-400/20 text-amber-300 text-[12px] font-bold px-2.5 py-1 rounded-full border border-amber-400/30">
                                <Crown className="w-3 h-3" />
                                Pro Founding
                              </span>
                            ) : (
                              <span className="text-[12px] text-gray-400">Free Tier</span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {/* Inspect */}
                              <button
                                onClick={() => setInspectUser(u)}
                                className="bg-[#27272a] hover:bg-[#3f3f46] text-gray-200 p-2 rounded-xl text-[12px] font-semibold transition-colors cursor-pointer"
                                title="Inspect Full Profile"
                              >
                                Inspect
                              </button>

                              {/* 1-Click Approve */}
                              {status !== 'approved' && (
                                <button
                                  onClick={() => performAction(u.id, 'approve')}
                                  disabled={isLoading}
                                  className="bg-emerald-600 hover:bg-emerald-500 text-white p-2 rounded-xl text-[12px] font-bold transition-colors cursor-pointer"
                                  title="Approve Candidate"
                                >
                                  <UserCheck className="w-4 h-4" />
                                </button>
                              )}

                              {/* Reject / Request Changes */}
                              {status !== 'rejected' && (
                                <button
                                  onClick={() => {
                                    setRejectModalUser(u)
                                    setRejectNotes(u.review_notes || '')
                                  }}
                                  disabled={isLoading}
                                  className="bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 border border-amber-500/40 p-2 rounded-xl text-[12px] font-semibold transition-colors cursor-pointer"
                                  title="Reject or Request Changes"
                                >
                                  <UserX className="w-4 h-4" />
                                </button>
                              )}

                              {/* Delete User */}
                              <button
                                onClick={() => setDeleteConfirmUser(u)}
                                disabled={isLoading}
                                className="bg-red-950/40 hover:bg-red-900 text-red-400 p-2 rounded-xl text-[12px] transition-colors cursor-pointer"
                                title="Delete User"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ---------------------------------------------------- */}
      {/* CANDIDATE DETAIL INSPECTION MODAL */}
      {/* ---------------------------------------------------- */}
      {inspectUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#18181b] border border-white/10 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div>
                <span className="text-[12px] uppercase font-bold text-gray-400 tracking-wider">Candidate Profile Review</span>
                <h2 className="text-xl font-bold text-white mt-0.5">
                  {inspectUser.full_name || inspectUser.display_name || 'Job Seeker'}
                </h2>
              </div>
              <button
                onClick={() => setInspectUser(null)}
                className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1 text-[14px]">
              {/* Review Status Banner */}
              <div className="p-4 rounded-2xl bg-[#27272a] border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-[12px] text-gray-400 block">Current Status</span>
                  <span className="font-bold text-[15px] uppercase tracking-wide text-white">
                    {inspectUser.review_status === 'approved'
                      ? '🟢 Approved'
                      : inspectUser.review_status === 'under_review'
                      ? '🟡 Under Review'
                      : inspectUser.review_status === 'rejected'
                      ? '🔴 Changes Requested'
                      : '⚪ Draft'}
                  </span>
                </div>
                <div>
                  <span className="text-[12px] text-gray-400 block">Membership</span>
                  <span className="font-bold text-[14px] text-amber-300">
                    {inspectUser.is_premium ? '👑 Pro Founding' : 'Free Account'}
                  </span>
                </div>
              </div>

              {/* Personal & Career */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-[12px] text-gray-400 block">Email Address</span>
                  <span className="font-semibold text-white">{inspectUser.email || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[12px] text-gray-400 block">Location</span>
                  <span className="font-semibold text-white">
                    {[inspectUser.city, inspectUser.country].filter(Boolean).join(', ') || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-[12px] text-gray-400 block">Career Field</span>
                  <span className="font-semibold text-white">{inspectUser.career_field || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[12px] text-gray-400 block">Desired Roles</span>
                  <span className="font-semibold text-white">{inspectUser.desired_roles || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[12px] text-gray-400 block">Status &amp; Experience</span>
                  <span className="font-semibold text-white">
                    {inspectUser.user_status || 'Professional'} &bull; {inspectUser.experience_years || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-[12px] text-gray-400 block">Salary Expectation</span>
                  <span className="font-semibold text-white">{inspectUser.expected_salary || 'N/A'}</span>
                </div>
              </div>

              {/* Education & Summary */}
              <div className="p-4 rounded-2xl bg-[#27272a] border border-white/10 space-y-3">
                <div>
                  <span className="text-[12px] text-gray-400 block">Education</span>
                  <p className="font-medium text-white">
                    {inspectUser.education_level || 'N/A'} &bull; {inspectUser.institution || 'Institution not specified'} ({inspectUser.graduation_year || 'N/A'})
                  </p>
                </div>
                {inspectUser.experience_summary && (
                  <div>
                    <span className="text-[12px] text-gray-400 block">Experience Highlights</span>
                    <p className="text-gray-300 text-[13px] leading-relaxed whitespace-pre-line mt-1">
                      {inspectUser.experience_summary}
                    </p>
                  </div>
                )}
              </div>

              {/* Skills */}
              <div>
                <span className="text-[12px] text-gray-400 block mb-2">Key Skills</span>
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(inspectUser.skills) ? (
                    inspectUser.skills.map((s, idx) => (
                      <span key={idx} className="bg-red-950/40 border border-red-500/30 text-red-200 text-xs px-3 py-1 rounded-full">
                        {s}
                      </span>
                    ))
                  ) : inspectUser.skills ? (
                    inspectUser.skills.split(',').map((s, idx) => (
                      <span key={idx} className="bg-red-950/40 border border-red-500/30 text-red-200 text-xs px-3 py-1 rounded-full">
                        {s.trim()}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500 text-xs">No skills added</span>
                  )}
                </div>
              </div>

              {/* CV / Resume Link */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-red-950/40 to-[#27272a] border border-red-500/30 flex items-center justify-between gap-4">
                <div>
                  <span className="text-[12px] text-gray-400 block">CV / Resume Document</span>
                  <p className="text-xs text-gray-300 truncate max-w-sm">
                    {inspectUser.resume_url || 'No CV link uploaded'}
                  </p>
                </div>
                {inspectUser.resume_url ? (
                  <a
                    href={inspectUser.resume_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 bg-[#e02424] hover:bg-[#c81e1e] text-white text-[13px] font-bold px-4 py-2 rounded-xl transition-colors shrink-0 cursor-pointer shadow-sm"
                  >
                    <span>View CV</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <span className="text-xs text-gray-500">Not provided</span>
                )}
              </div>

              {/* External Links */}
              <div className="flex flex-wrap gap-3 text-[13px]">
                {inspectUser.linkedin_url && (
                  <a
                    href={inspectUser.linkedin_url.startsWith('http') ? inspectUser.linkedin_url : `https://${inspectUser.linkedin_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#27272a] hover:bg-[#3f3f46] text-blue-400 px-3.5 py-1.5 rounded-xl border border-white/10 inline-flex items-center gap-1.5"
                  >
                    <Linkedin className="w-3.5 h-3.5" />
                    <span>LinkedIn</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {inspectUser.twitter_url && (
                  <a
                    href={
                      inspectUser.twitter_url.startsWith('http')
                        ? inspectUser.twitter_url
                        : inspectUser.twitter_url.startsWith('@')
                        ? `https://x.com/${inspectUser.twitter_url.substring(1)}`
                        : `https://x.com/${inspectUser.twitter_url}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#27272a] hover:bg-[#3f3f46] text-gray-300 px-3.5 py-1.5 rounded-xl border border-white/10 inline-flex items-center gap-1.5"
                  >
                    <Twitter className="w-3.5 h-3.5" />
                    <span>Twitter / X</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {inspectUser.whatsapp_number && (
                  <a
                    href={`https://wa.me/${inspectUser.whatsapp_number.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#27272a] hover:bg-[#3f3f46] text-emerald-400 px-3.5 py-1.5 rounded-xl border border-white/10 inline-flex items-center gap-1.5"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {inspectUser.portfolio_url && (
                  <a
                    href={inspectUser.portfolio_url.startsWith('http') ? inspectUser.portfolio_url : `https://${inspectUser.portfolio_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#27272a] hover:bg-[#3f3f46] text-emerald-400 px-3.5 py-1.5 rounded-xl border border-white/10 inline-flex items-center gap-1.5"
                  >
                    <span>Portfolio</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {inspectUser.github_url && (
                  <a
                    href={inspectUser.github_url.startsWith('http') ? inspectUser.github_url : `https://${inspectUser.github_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#27272a] hover:bg-[#3f3f46] text-purple-400 px-3.5 py-1.5 rounded-xl border border-white/10 inline-flex items-center gap-1.5"
                  >
                    <Github className="w-3.5 h-3.5" />
                    <span>GitHub</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              {/* Candidate Specific Applications History */}
              <div className="p-5 rounded-2xl bg-[#202023] border border-white/10 space-y-3.5 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-[#e02424]" />
                    <span className="text-[13px] font-bold text-white uppercase tracking-wider">
                      User Login &amp; Logout History ({candidateLogs.length})
                    </span>
                  </div>
                  <span className="text-[11px] font-medium text-gray-400">
                    Real-time Security Footprint
                  </span>
                </div>

                {/* Quick Status Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                  <div className="p-2.5 rounded-xl bg-[#27272a] border border-white/5">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">Last Sign In</span>
                    <span className="text-[12px] font-semibold text-emerald-400 block truncate">
                      {formatServerTimestamp(
                        inspectUser.last_login_at ||
                          candidateLogs.find((l) => l.event_type === 'login')?.created_at
                      )}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#27272a] border border-white/5">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">Last Sign Out</span>
                    <span className="text-[12px] font-semibold text-gray-300 block truncate">
                      {formatServerTimestamp(
                        inspectUser.last_logout_at ||
                          candidateLogs.find((l) => l.event_type === 'logout')?.created_at
                      )}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#27272a] border border-white/5 col-span-2 sm:col-span-1">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">Total Recorded</span>
                    <span className="text-[12px] font-bold text-white block">
                      {candidateLogs.length} Events
                    </span>
                  </div>
                </div>

                {/* Detailed Event Log List */}
                {candidateLogs.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1 text-xs divide-y divide-white/5">
                    {candidateLogs.map((clog, idx) => (
                      <div key={clog.id || idx} className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                              clog.event_type === 'login'
                                ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-500/40'
                                : 'bg-gray-800 text-gray-300 border border-gray-700'
                            }`}
                          >
                            {clog.event_type === 'login' ? '🟢 LOGGED IN' : '⚪ LOGGED OUT'}
                          </span>

                          <span className="text-gray-300 font-mono text-[11px] bg-black/30 px-2 py-0.5 rounded border border-white/5">
                            {clog.ip_address || 'Direct IP'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3 text-gray-400 text-[11px]">
                          <span className="truncate max-w-[140px] text-gray-400" title={clog.user_agent}>
                            {clog.user_agent?.includes('iPhone')
                              ? '📱 iPhone Safari'
                              : clog.user_agent?.includes('Android')
                              ? '📱 Android Chrome'
                              : clog.user_agent?.includes('Mac')
                              ? '💻 Mac Desktop'
                              : clog.user_agent?.includes('Windows')
                              ? '💻 Windows PC'
                              : '🌐 Web Browser'}
                          </span>
                          <span className="text-gray-400 whitespace-nowrap">
                            {formatServerTimestamp(clog.created_at)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 py-1">
                    No login/logout history recorded yet for this candidate. Future logins and logouts will automatically be captured here.
                  </p>
                )}
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="p-6 border-t border-white/10 bg-[#27272a]/60 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    performAction(inspectUser.id, 'toggle_premium', { isPremium: inspectUser.is_premium })
                  }
                  className="bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/40 px-3.5 py-2 rounded-xl text-[13px] font-semibold transition-colors cursor-pointer"
                >
                  {inspectUser.is_premium ? 'Revoke Premium' : 'Grant Pro Member'}
                </button>

                <button
                  onClick={() => {
                    setDeleteConfirmUser(inspectUser)
                    setInspectUser(null)
                  }}
                  className="bg-red-950/60 hover:bg-red-900 text-red-300 border border-red-800/60 px-3.5 py-2 rounded-xl text-[13px] font-semibold transition-colors cursor-pointer"
                >
                  Delete User
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setRejectModalUser(inspectUser)
                    setRejectNotes(inspectUser.review_notes || '')
                    setInspectUser(null)
                  }}
                  className="bg-gray-800 hover:bg-gray-700 text-gray-200 px-4 py-2 rounded-xl text-[13px] font-semibold transition-colors cursor-pointer"
                >
                  Request Changes
                </button>

                <button
                  onClick={() => performAction(inspectUser.id, 'approve')}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-2 rounded-xl text-[13px] transition-colors cursor-pointer shadow-sm"
                >
                  Approve Account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* REJECT / REQUEST CHANGES MODAL */}
      {/* ---------------------------------------------------- */}
      {rejectModalUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#18181b] border border-white/10 rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1">
              Request Changes / Reject Application
            </h3>
            <p className="text-gray-400 text-[13px] mb-4">
              Enter the feedback or instructions for{' '}
              <strong className="text-white">
                {rejectModalUser.full_name || rejectModalUser.display_name || 'candidate'}
              </strong>
              .
            </p>

            <textarea
              rows={4}
              value={rejectNotes}
              onChange={(e) => setRejectNotes(e.target.value)}
              placeholder="e.g. Please update your CV link sharing permissions to public, or provide more detail on your recent responsibilities."
              className="w-full bg-[#27272a] border border-white/10 rounded-2xl p-3.5 text-[13px] text-white placeholder-gray-500 outline-none focus:border-amber-400 transition-all mb-4"
            />

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setRejectModalUser(null)}
                className="px-4 py-2 rounded-xl text-[13px] font-semibold text-gray-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  performAction(rejectModalUser.id, 'reject', { reviewNotes: rejectNotes })
                }
                className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-5 py-2.5 rounded-xl text-[13px] transition-colors cursor-pointer"
              >
                Submit Feedback
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* DELETE CONFIRMATION MODAL */}
      {/* ---------------------------------------------------- */}
      {deleteConfirmUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#18181b] border border-red-500/30 rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-red-950/60 text-[#e02424] flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Delete Candidate Profile</h3>
            <p className="text-gray-400 text-[13px] mb-6 leading-relaxed">
              Are you sure you want to delete the profile for{' '}
              <strong className="text-white">
                {deleteConfirmUser.full_name || deleteConfirmUser.display_name || deleteConfirmUser.email}
              </strong>
              ? This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmUser(null)}
                className="px-4 py-2 rounded-xl text-[13px] font-semibold text-gray-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => performAction(deleteConfirmUser.id, 'delete')}
                className="bg-[#e02424] hover:bg-[#c81e1e] text-white font-bold px-5 py-2.5 rounded-xl text-[13px] transition-colors cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
