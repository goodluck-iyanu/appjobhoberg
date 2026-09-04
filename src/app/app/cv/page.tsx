'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { UserProfile, ExperienceItem, EducationItem } from '@/types'
import { calculateProfileStrength } from '@/utils/matching'
import { useToast } from '@/components/Toast'
import {
  FileText,
  UploadCloud,
  CheckCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Plus,
  Trash2,
  Edit3,
  MapPin,
  ExternalLink,
  Crown,
} from '@/components/icons'

import { Suspense } from 'react'

function MasterCvContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tailorForJobId = searchParams.get('tailorFor')

  const supabase = createClient()
  const toast = useToast()
  const [isPending, startTransition] = useTransition()

  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [isConfirmed, setIsConfirmed] = useState(false)
  const [targetJob, setTargetJob] = useState<any>(null)
  const [cvVersions, setCvVersions] = useState<any[]>([])
  const [balances, setBalances] = useState({ tailor: 0, rewrite: 0, ats: 0 })

  // Form State
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('Lagos')
  const [openToRelocate, setOpenToRelocate] = useState(false)
  const [remoteFromNigeria, setRemoteFromNigeria] = useState(true)
  const [seniority, setSeniority] = useState<'nysc' | 'intern' | 'entry' | 'mid' | 'senior'>('mid')
  const [nyscStatus, setNyscStatus] = useState<'completed' | 'serving' | 'exempted' | 'student'>('completed')
  
  // Target roles
  const [targetRoles, setTargetRoles] = useState<string[]>(['Frontend Developer'])
  const [newRoleInput, setNewRoleInput] = useState('')

  // Skills
  const [skills, setSkills] = useState<string[]>(['React', 'TypeScript', 'Tailwind CSS', 'Communication'])
  const [newSkillInput, setNewSkillInput] = useState('')

  // Work Experience
  const [experience, setExperience] = useState<ExperienceItem[]>([
    {
      company: 'Current Company / Freelance',
      title: 'Software Developer',
      start_date: '2023',
      end_date: 'Present',
      is_current: true,
      description: 'Built and optimized responsive web applications and integrated backend REST APIs.',
    },
  ])

  // Education
  const [education, setEducation] = useState<EducationItem[]>([
    {
      institution: 'University of Lagos',
      degree: "Bachelor's Degree",
      field_of_study: 'Computer Science',
      graduation_year: '2023',
    },
  ])

  // Links
  const [linkedinUrl, setLinkedinUrl] = useState('')
  const [githubUrl, setGithubUrl] = useState('')
  const [portfolioUrl, setPortfolioUrl] = useState('')

  // Profile Strength
  const profileMock: Partial<UserProfile> = {
    full_name: fullName,
    phone,
    city,
    target_roles: targetRoles,
    skills,
    experience,
    education,
    links: { linkedin: linkedinUrl, github: githubUrl, portfolio: portfolioUrl },
  }
  const strength = calculateProfileStrength(profileMock)

  // Load existing profile
  useEffect(() => {
    async function loadData() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login?next=/app/cv')
        return
      }

      setEmail(user.email || '')

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

      if (profile) {
        setFullName(profile.full_name || user.user_metadata?.full_name || '')
        setPhone(profile.phone || '')
        setCity(profile.city || 'Lagos')
        setOpenToRelocate(profile.open_to_relocate || false)
        setRemoteFromNigeria(profile.remote_from_nigeria !== false)
        setSeniority(profile.seniority || 'mid')
        setNyscStatus(profile.nysc_status || 'completed')
        if (profile.target_roles?.length) setTargetRoles(profile.target_roles)
        if (profile.skills?.length) setSkills(profile.skills)
        if (profile.experience?.length) setExperience(profile.experience)
        if (profile.education?.length) setEducation(profile.education)
        if (profile.links) {
          setLinkedinUrl(profile.links.linkedin || '')
          setGithubUrl(profile.links.github || '')
          setPortfolioUrl(profile.links.portfolio || '')
        }
        if (profile.profile_strength && profile.profile_strength > 25) {
          setIsConfirmed(true)
        }
      }

      // Fetch CV Versions
      const { data: versions } = await supabase
        .from('cv_versions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      setCvVersions(versions || [])

      // Fetch Balances
      const { data: ledger } = await supabase
        .from('credit_ledger')
        .select('kind, delta')
        .eq('user_id', user.id)

      if (ledger) {
        let tailor = 0
        let rewrite = 0
        let ats = 0
        for (const row of ledger) {
          if (row.kind.startsWith('tailor')) tailor += row.delta
          if (row.kind.startsWith('rewrite')) rewrite += row.delta
          if (row.kind === 'ats_check') ats += row.delta
        }
        setBalances({ tailor, rewrite, ats })
      }

      // If tailoring for a specific job, fetch the target job
      if (tailorForJobId) {
        const { data: jobData } = await supabase
          .from('jobs')
          .select('id, title, company_name, requirements')
          .eq('id', tailorForJobId)
          .maybeSingle()
        if (jobData) setTargetJob(jobData)
      }

      setLoading(false)
    }

    loadData()
  }, [router, supabase, tailorForJobId])

  // File Upload & Parse
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/cv/parse', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()

      if (data.success && data.draft) {
        const d = data.draft
        if (d.full_name) setFullName(d.full_name)
        if (d.phone) setPhone(d.phone)
        if (d.city) setCity(d.city)
        if (d.target_roles?.length) setTargetRoles(d.target_roles)
        if (d.skills?.length) setSkills(d.skills)
        if (d.experience?.length) setExperience(d.experience)
        if (d.education?.length) setEducation(d.education)
        if (d.nysc_status) setNyscStatus(d.nysc_status)
        if (d.seniority) setSeniority(d.seniority)
        if (d.links?.linkedin) setLinkedinUrl(d.links.linkedin)
        if (d.links?.github) setGithubUrl(d.links.github)
        if (d.links?.portfolio) setPortfolioUrl(d.links.portfolio)

        setIsConfirmed(true)
        toast.success('CV Parsed! 📄', 'Review your extracted details below and tap "Save Master CV".')
      } else {
        toast.error('Parse Notice', data.error || 'Could not parse document. You can fill in the fields directly.')
        setIsConfirmed(true)
      }
    } catch {
      toast.error('Upload Error', 'Failed to upload document. Please fill details manually.')
      setIsConfirmed(true)
    } finally {
      setUploading(false)
    }
  }

  // Add Target Role
  const handleAddRole = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newRoleInput.trim()) return
    if (targetRoles.length >= 4) {
      toast.error('Limit', 'Max 4 target roles.')
      return
    }
    setTargetRoles([...targetRoles, newRoleInput.trim()])
    setNewRoleInput('')
  }

  // Add Skill
  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSkillInput.trim()) return
    if (!skills.includes(newSkillInput.trim())) {
      setSkills([...skills, newSkillInput.trim()])
    }
    setNewSkillInput('')
  }

  // Save Master Profile
  const handleSaveMasterProfile = async () => {
    setSaving(true)
    try {
      const payload = {
        full_name: fullName,
        phone,
        city,
        country: 'Nigeria',
        open_to_relocate: openToRelocate,
        remote_from_nigeria: remoteFromNigeria,
        seniority,
        nysc_status: nyscStatus,
        target_roles: targetRoles,
        skills,
        experience,
        education,
        links: {
          linkedin: linkedinUrl,
          github: githubUrl,
          portfolio: portfolioUrl,
        },
        profile_strength: strength.score,
      }

      const res = await fetch('/api/profile/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()

      if (data.success) {
        toast.success('Master Profile Saved! 🚀', 'Your CV is stored permanently. You never need to upload it again.')
        startTransition(() => {
          router.push('/app')
        })
      } else {
        toast.error('Save Error', data.error || 'Could not save profile.')
      }
    } catch {
      toast.error('Network Error', 'Please check your connection.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-[#f5f5f7]">
        <div className="w-8 h-8 border-3 border-[#e02424] border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="flex-1 bg-[#f5f5f7] py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/app"
            className="inline-flex items-center gap-1 text-[12px] text-[#86868b] hover:text-[#1d1d1f] mb-3"
          >
            <span>← Seeker Dashboard</span>
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1d1d1f]">
                Master CV &amp; Seeker Profile
              </h1>
              <p className="text-[13px] text-[#86868b] mt-1">
                Edit once. Matches, applications, and tailored CVs draw from this single source of truth.
              </p>
            </div>

            {/* Profile Strength Badge */}
            <div className="bg-white rounded-2xl p-3 border border-black/[0.06] shadow-2xs flex items-center gap-3">
              <div className="relative w-11 h-11 flex items-center justify-center bg-gray-50 rounded-full font-bold text-[13px] text-[#1d1d1f]">
                {strength.score}%
              </div>
              <div>
                <p className="text-[11px] text-[#86868b] font-medium uppercase tracking-wider">Profile Strength</p>
                <p className="text-[13px] font-semibold text-[#1d1d1f]">{strength.label}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tailor for specific job notice if active */}
        {targetJob && (
          <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 font-bold text-[14px]">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Tailoring CV for {targetJob.title} at {targetJob.company_name}</span>
              </div>
              <p className="text-[12px] mt-1 text-amber-800">
                Ensure your target role and key skills match this job before generating a snapshot.
              </p>
            </div>
          </div>
        )}

        {/* 1-Time Upload Dropzone (if not confirmed or user wants to re-upload) */}
        {!isConfirmed && (
          <div className="bg-white rounded-3xl p-8 sm:p-12 border-2 border-dashed border-[#d2d2d7] text-center shadow-xs mb-8">
            <div className="w-14 h-14 bg-red-50 text-[#e02424] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <UploadCloud className="w-7 h-7" />
            </div>
            <h2 className="text-lg font-bold text-[#1d1d1f]">Upload your CV (PDF or DOCX)</h2>
            <p className="text-[13px] text-[#86868b] max-w-md mx-auto mt-1">
              We extract only what is on the document in 5 seconds. Nothing is saved until you review and confirm.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <label className="inline-flex items-center justify-center gap-2 bg-[#e02424] hover:bg-[#c81e1e] text-white font-semibold text-[14px] px-6 py-3 rounded-full cursor-pointer shadow-sm transition-all">
                <FileText className="w-4 h-4" />
                <span>{uploading ? 'Reading Document...' : 'Choose PDF / DOCX File'}</span>
                <input
                  type="file"
                  accept=".pdf,.docx,.doc,.txt"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={() => setIsConfirmed(true)}
                className="text-[13px] font-semibold text-[#86868b] hover:text-[#1d1d1f] px-4 py-3"
              >
                Or fill details manually →
              </button>
            </div>

            <p className="text-[11px] text-[#86868b] mt-4">
              🔒 Stored securely in private storage. Never shared without your explicit application.
            </p>
          </div>
        )}

        {/* Master Profile Editor Form */}
        <div className="space-y-6">
          {/* Section 1: Personal & Contact */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-black/[0.06] shadow-xs space-y-4">
            <h3 className="font-bold text-[16px] text-[#1d1d1f] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#e02424]"></span>
              <span>1. Contact &amp; Location</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-semibold text-[#1d1d1f] mb-1">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Babatunde Adeleke"
                  className="w-full text-[13px] bg-[#f5f5f7] border border-[#d2d2d7] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#1d1d1f]"
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#1d1d1f] mb-1">Phone Number (WhatsApp)</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 08012345678"
                  className="w-full text-[13px] bg-[#f5f5f7] border border-[#d2d2d7] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#1d1d1f]"
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#1d1d1f] mb-1">Current Nigerian City</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full text-[13px] bg-[#f5f5f7] border border-[#d2d2d7] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#1d1d1f]"
                >
                  <option value="Lagos">Lagos (Ikeja, Lekki, Yaba, VI)</option>
                  <option value="Abuja">Abuja (FCT)</option>
                  <option value="Port Harcourt">Port Harcourt (Rivers)</option>
                  <option value="Ibadan">Ibadan (Oyo)</option>
                  <option value="Enugu">Enugu</option>
                  <option value="Benin City">Benin City (Edo)</option>
                  <option value="Abeokuta">Abeokuta (Ogun)</option>
                  <option value="Remote Nigeria">Other State / Remote Nigeria</option>
                </select>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#1d1d1f] mb-1">NYSC Status</label>
                <select
                  value={nyscStatus}
                  onChange={(e) => setNyscStatus(e.target.value as any)}
                  className="w-full text-[13px] bg-[#f5f5f7] border border-[#d2d2d7] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#1d1d1f]"
                >
                  <option value="completed">Completed NYSC (Discharged)</option>
                  <option value="serving">Currently Serving (Looking for PPA)</option>
                  <option value="exempted">Exempted</option>
                  <option value="student">Undergraduate / Student</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap gap-4 text-[13px]">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={remoteFromNigeria}
                  onChange={(e) => setRemoteFromNigeria(e.target.checked)}
                  className="w-4 h-4 rounded text-[#e02424]"
                />
                <span className="text-[#1d1d1f]">Available for Remote jobs from Nigeria</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={openToRelocate}
                  onChange={(e) => setOpenToRelocate(e.target.checked)}
                  className="w-4 h-4 rounded text-[#e02424]"
                />
                <span className="text-[#1d1d1f]">Open to relocate to other states</span>
              </label>
            </div>
          </div>

          {/* Section 2: Target Roles & Seniority */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-black/[0.06] shadow-xs space-y-4">
            <h3 className="font-bold text-[16px] text-[#1d1d1f] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              <span>2. Target Roles &amp; Seniority</span>
            </h3>

            <div>
              <label className="block text-[12px] font-semibold text-[#1d1d1f] mb-1.5">
                Target Roles (1–3 job titles that you want matched)
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {targetRoles.map((role) => (
                  <span
                    key={role}
                    className="inline-flex items-center gap-1.5 text-[13px] font-medium bg-red-50 text-[#e02424] border border-red-200 px-3 py-1 rounded-full"
                  >
                    <span>{role}</span>
                    <button
                      type="button"
                      onClick={() => setTargetRoles(targetRoles.filter((r) => r !== role))}
                      className="text-red-400 hover:text-red-700"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              <form onSubmit={handleAddRole} className="flex gap-2">
                <input
                  type="text"
                  value={newRoleInput}
                  onChange={(e) => setNewRoleInput(e.target.value)}
                  placeholder="Add target title (e.g. Frontend Developer, Customer Success Specialist)..."
                  className="flex-1 text-[13px] bg-[#f5f5f7] border border-[#d2d2d7] rounded-xl px-3.5 py-2 focus:outline-none focus:border-[#1d1d1f]"
                />
                <button
                  type="submit"
                  className="bg-[#1d1d1f] hover:bg-black text-white text-[13px] font-semibold px-4 py-2 rounded-xl"
                >
                  Add Role
                </button>
              </form>
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-[#1d1d1f] mb-1.5">Career Seniority</label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {(['nysc', 'intern', 'entry', 'mid', 'senior'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setSeniority(lvl)}
                    className={`py-2 px-3 text-[12px] font-semibold rounded-xl border transition-all ${
                      seniority === lvl
                        ? 'bg-[#1d1d1f] text-white border-[#1d1d1f]'
                        : 'bg-[#f5f5f7] text-[#1d1d1f] border-transparent hover:border-[#d2d2d7]'
                    }`}
                  >
                    {lvl.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 3: Skills */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-black/[0.06] shadow-xs space-y-4">
            <h3 className="font-bold text-[16px] text-[#1d1d1f] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              <span>3. Key Skills &amp; Competencies</span>
            </h3>

            <div className="flex flex-wrap gap-2 mb-3">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 text-[12px] font-medium bg-[#f5f5f7] text-[#1d1d1f] border border-[#d2d2d7] px-3 py-1 rounded-full"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => setSkills(skills.filter((s) => s !== skill))}
                    className="text-gray-400 hover:text-gray-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <form onSubmit={handleAddSkill} className="flex gap-2">
              <input
                type="text"
                value={newSkillInput}
                onChange={(e) => setNewSkillInput(e.target.value)}
                placeholder="Add skill (e.g. React, SQL, Excel, Zendesk, Figma)..."
                className="flex-1 text-[13px] bg-[#f5f5f7] border border-[#d2d2d7] rounded-xl px-3.5 py-2 focus:outline-none focus:border-[#1d1d1f]"
              />
              <button
                type="submit"
                className="bg-[#1d1d1f] hover:bg-black text-white text-[13px] font-semibold px-4 py-2 rounded-xl"
              >
                Add Skill
              </button>
            </form>
          </div>

          {/* Section 4: Links */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-black/[0.06] shadow-xs space-y-4">
            <h3 className="font-bold text-[16px] text-[#1d1d1f] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-600"></span>
              <span>4. Professional Links</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[12px] font-semibold text-[#1d1d1f] mb-1">LinkedIn Profile</label>
                <input
                  type="url"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/..."
                  className="w-full text-[13px] bg-[#f5f5f7] border border-[#d2d2d7] rounded-xl px-3 py-2 focus:outline-none focus:border-[#1d1d1f]"
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#1d1d1f] mb-1">GitHub / Code</label>
                <input
                  type="url"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/..."
                  className="w-full text-[13px] bg-[#f5f5f7] border border-[#d2d2d7] rounded-xl px-3 py-2 focus:outline-none focus:border-[#1d1d1f]"
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#1d1d1f] mb-1">Portfolio / Drive</label>
                <input
                  type="url"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  placeholder="https://myportfolio.com"
                  className="w-full text-[13px] bg-[#f5f5f7] border border-[#d2d2d7] rounded-xl px-3 py-2 focus:outline-none focus:border-[#1d1d1f]"
                />
              </div>
            </div>
          </div>

          {/* Save & Confirm Action Banner */}
          <div className="p-6 rounded-3xl bg-white border border-black/[0.06] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-bold text-[15px] text-[#1d1d1f]">Ready to save your Master CV?</p>
              <p className="text-[13px] text-[#86868b] mt-0.5">
                We store your profile once so you never have to re-upload. You can update this anytime.
              </p>
            </div>

            <button
              type="button"
              onClick={handleSaveMasterProfile}
              disabled={saving || isPending}
              className="w-full sm:w-auto bg-[#e02424] hover:bg-[#c81e1e] active:scale-[0.98] text-white font-semibold text-[14px] px-8 py-3.5 rounded-full transition-all shadow-sm cursor-pointer disabled:opacity-60 shrink-0"
            >
              {saving ? 'Saving Master CV...' : 'Save Master Profile ✨'}
            </button>
          </div>

          {/* Versions List */}
          <div className="mt-12 bg-white rounded-3xl p-6 sm:p-8 border border-black/[0.06] shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="font-bold text-[18px] text-[#1d1d1f] flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <span>Generated CV Versions</span>
              </h3>
              
              <div className="flex flex-wrap items-center gap-2">
                <Link 
                  href={balances.tailor > 0 ? '/jobs' : '/pricing'} 
                  className="px-3 py-1.5 text-[12px] font-semibold bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  Tailor for a Job ({balances.tailor})
                </Link>
                <Link 
                  href={balances.rewrite > 0 ? '#' : '/pricing'} 
                  className="px-3 py-1.5 text-[12px] font-semibold bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors"
                >
                  Rewrite CV ({balances.rewrite})
                </Link>
                <button 
                  onClick={() => balances.ats > 0 ? alert('ATS Check Panel would open here.') : window.location.href = '/pricing'}
                  className="px-3 py-1.5 text-[12px] font-semibold bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors cursor-pointer"
                >
                  ATS Check ({balances.ats})
                </button>
              </div>
            </div>
            
            <div className="space-y-4">
              {/* Master CV */}
              {isConfirmed && (
                <div className="p-4 border border-black/[0.06] rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gray-50/50">
                  <div>
                    <p className="font-bold text-[14px] text-[#1d1d1f]">Master CV</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[12px] font-medium px-2 py-0.5 rounded bg-gray-200 text-gray-700">
                        master
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button className="flex-1 sm:flex-none px-4 py-2 text-[13px] font-semibold bg-white border border-gray-200 hover:bg-gray-50 text-[#1d1d1f] rounded-xl transition-colors">
                      Preview
                    </button>
                    <button className="flex-1 sm:flex-none px-4 py-2 text-[13px] font-semibold bg-[#1d1d1f] hover:bg-black text-white rounded-xl transition-colors">
                      Download PDF
                    </button>
                  </div>
                </div>
              )}
                {cvVersions.map((version) => (
                  <div key={version.id} className="p-4 border border-black/[0.06] rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <p className="font-bold text-[14px] text-[#1d1d1f]">{version.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[12px] font-medium px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 capitalize">
                          {version.kind}
                        </span>
                        <span className="text-[12px] text-[#86868b]">
                          {new Date(version.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button className="flex-1 sm:flex-none px-4 py-2 text-[13px] font-semibold bg-[#f5f5f7] hover:bg-[#ebebf0] text-[#1d1d1f] rounded-xl transition-colors">
                        Preview
                      </button>
                      <button className="flex-1 sm:flex-none px-4 py-2 text-[13px] font-semibold bg-[#1d1d1f] hover:bg-black text-white rounded-xl transition-colors">
                        Download PDF
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
        </div>
      </div>
    </div>
  )
}

export default function MasterCvPage() {
  return (
    <Suspense fallback={<div className="flex-1 bg-[#0f0f11] text-white flex items-center justify-center min-h-screen">Loading Profile Builder...</div>}>
      <MasterCvContent />
    </Suspense>
  )
}
