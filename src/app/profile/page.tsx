'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import {
  ArrowLeft,
  CheckCircle,
  Building2,
  Globe,
  Briefcase,
  FileText,
  Save,
  ShieldCheck,
  Sparkles,
  Clock,
  ExternalLink,
  Crown,
} from '@/components/icons'

export default function ProfilePage() {
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Profile fields
  const [fullName, setFullName] = useState('')
  const [country, setCountry] = useState('')
  const [city, setCity] = useState('')
  const [careerField, setCareerField] = useState('Customer Support')
  const [desiredRoles, setDesiredRoles] = useState('')
  const [userStatus, setUserStatus] = useState<'student' | 'graduate' | 'professional'>('professional')
  const [educationLevel, setEducationLevel] = useState('Bachelor\'s Degree')
  const [institution, setInstitution] = useState('')
  const [graduationYear, setGraduationYear] = useState('')
  const [experienceYears, setExperienceYears] = useState('1-2 years')
  const [experienceSummary, setExperienceSummary] = useState('')
  const [skills, setSkills] = useState('')
  const [resumeUrl, setResumeUrl] = useState('')
  const [linkedinUrl, setLinkedinUrl] = useState('')
  const [githubUrl, setGithubUrl] = useState('')
  const [portfolioUrl, setPortfolioUrl] = useState('')
  const [jobTypePreference, setJobTypePreference] = useState('Full-time Remote')
  const [expectedSalary, setExpectedSalary] = useState('')
  
  // Review Status
  const [reviewStatus, setReviewStatus] = useState<'draft' | 'under_review' | 'approved' | 'rejected'>('draft')
  const [reviewNotes, setReviewNotes] = useState<string | null>(null)

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        window.location.href = '/login'
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profile) {
        setFullName(profile.full_name || profile.display_name || user.user_metadata?.full_name || '')
        setCountry(profile.country || '')
        setCity(profile.city || '')
        setCareerField(profile.career_field || 'Customer Support')
        setDesiredRoles(profile.desired_roles || profile.preferred_roles || '')
        setUserStatus(profile.user_status || 'professional')
        setEducationLevel(profile.education_level || 'Bachelor\'s Degree')
        setInstitution(profile.institution || '')
        setGraduationYear(profile.graduation_year || '')
        setExperienceYears(profile.experience_years || profile.experience_level || '1-2 years')
        setExperienceSummary(profile.experience_summary || profile.current_job_title || '')
        setSkills(
          Array.isArray(profile.skills)
            ? profile.skills.join(', ')
            : profile.skills || ''
        )
        setResumeUrl(profile.resume_url || '')
        setLinkedinUrl(profile.linkedin_url || '')
        setGithubUrl(profile.github_url || '')
        setPortfolioUrl(profile.portfolio_url || '')
        setJobTypePreference(profile.job_type_preference || 'Full-time Remote')
        setExpectedSalary(profile.expected_salary || '')
        setReviewStatus(profile.review_status || 'draft')
        setReviewNotes(profile.review_notes || null)
      } else {
        setFullName(user.user_metadata?.full_name || '')
      }

      setLoading(false)
    }

    loadProfile()
  }, [])

  // Dynamic Profile Completion Calculation
  const completionPercentage = useMemo(() => {
    const checks = [
      Boolean(fullName.trim()),
      Boolean(country.trim()),
      Boolean(city.trim()),
      Boolean(careerField.trim()),
      Boolean(desiredRoles.trim()),
      Boolean(userStatus),
      Boolean(institution.trim() || educationLevel),
      Boolean(skills.trim()),
      Boolean(resumeUrl.trim()),
      Boolean(linkedinUrl.trim() || portfolioUrl.trim() || githubUrl.trim()),
    ]
    const filledCount = checks.filter(Boolean).length
    return Math.round((filledCount / checks.length) * 100)
  }, [
    fullName,
    country,
    city,
    careerField,
    desiredRoles,
    userStatus,
    institution,
    educationLevel,
    skills,
    resumeUrl,
    linkedinUrl,
    portfolioUrl,
    githubUrl,
  ])

  const saveProfileData = async (targetStatus?: 'draft' | 'under_review') => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('You must be signed in to update your profile.')
    }

    const skillsArray = skills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)

    const nextStatus = targetStatus || reviewStatus

    const updatePayload: Record<string, any> = {
      id: user.id,
      full_name: fullName,
      display_name: fullName,
      country,
      city,
      career_field: careerField,
      desired_roles: desiredRoles,
      user_status: userStatus,
      education_level: educationLevel,
      institution,
      graduation_year: graduationYear,
      experience_years: experienceYears,
      experience_summary: experienceSummary,
      skills: skillsArray,
      resume_url: resumeUrl,
      linkedin_url: linkedinUrl,
      github_url: githubUrl,
      portfolio_url: portfolioUrl,
      job_type_preference: jobTypePreference,
      expected_salary: expectedSalary,
      review_status: nextStatus,
      updated_at: new Date().toISOString(),
    }

    if (targetStatus === 'under_review') {
      updatePayload.submitted_at = new Date().toISOString()
    }

    let { error } = await supabase.from('profiles').upsert(updatePayload)

    // Fallback: If 'full_name' or other specific column is not yet in Supabase schema cache
    if (error && error.message?.includes('full_name')) {
      delete updatePayload.full_name
      const retryResult = await supabase.from('profiles').upsert(updatePayload)
      error = retryResult.error
    }

    if (error) {
      throw error
    }

    if (targetStatus) {
      setReviewStatus(targetStatus)
    }
  }

  const handleSaveDraft = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMsg(null)

    try {
      await saveProfileData()
      setMsg({ type: 'success', text: 'Profile changes saved successfully!' })
    } catch (err: any) {
      setMsg({ type: 'error', text: err?.message || 'Failed to save changes.' })
    } finally {
      setSaving(false)
    }
  }

  const handleSubmitForReview = async () => {
    if (!fullName.trim() || !country.trim() || !careerField || !skills.trim() || !resumeUrl.trim()) {
      setMsg({
        type: 'error',
        text: 'Please complete all required fields (Full Name, Country, Career, Skills, and CV Link) before submitting for review.',
      })
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    setSubmitting(true)
    setMsg(null)

    try {
      await saveProfileData('under_review')
      setMsg({
        type: 'success',
        text: '🎉 Profile submitted for review! Our team will review your application usually within 24 hours.',
      })
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err: any) {
      setMsg({ type: 'error', text: err?.message || 'Failed to submit profile for review.' })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex-1 bg-[#f5f5f7] py-24 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#e02424] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-[#86868b] text-[15px] font-medium">Loading career profile...</p>
      </div>
    )
  }

  return (
    <div className="flex-1 bg-[#f5f5f7] py-10 sm:py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Top Back Link */}
        <Link
          href="/dashboard"
          className="inline-flex items-center text-[13px] font-medium text-[#86868b] hover:text-[#1d1d1f] mb-6 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          Back to Dashboard
        </Link>

        {/* Status Banners */}
        {reviewStatus === 'under_review' && (
          <div className="mb-8 p-6 bg-amber-50/90 border border-amber-200 rounded-3xl shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-200/80 text-amber-900 text-[11px] font-bold uppercase tracking-wider mb-1.5">
                  🟡 Profile Under Review
                </div>
                <h2 className="text-[17px] font-bold text-amber-950">
                  Our team is reviewing your professional profile
                </h2>
                <p className="text-[14px] text-amber-800/90 mt-1 leading-relaxed">
                  Usually reviewed <strong className="text-amber-950">within 24 hours</strong>. Once approved, you will have immediate full access to apply for all verified remote job listings on Hoberg Jobs.
                </p>
              </div>
            </div>
          </div>
        )}

        {reviewStatus === 'approved' && (
          <div className="mb-8 p-6 bg-emerald-50/90 border border-emerald-200 rounded-3xl shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-200/80 text-emerald-900 text-[11px] font-bold uppercase tracking-wider mb-1.5">
                  🟢 Verified &amp; Approved
                </div>
                <h2 className="text-[17px] font-bold text-emerald-950">
                  You are approved to apply for remote opportunities
                </h2>
                <p className="text-[14px] text-emerald-800/90 mt-1 leading-relaxed">
                  Your profile has been verified by Hoberg Digital Agency. You have unlocked 1-click external application access to all current and upcoming remote positions.
                </p>
                <div className="mt-3">
                  <Link
                    href="/jobs"
                    className="inline-flex items-center gap-1.5 text-[13px] font-bold text-emerald-900 hover:underline"
                  >
                    <span>Browse remote opportunities now</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {reviewStatus === 'rejected' && (
          <div className="mb-8 p-6 bg-red-50 border border-red-200 rounded-3xl shadow-sm">
            <div className="flex items-start gap-4">
              <span className="text-2xl">⚠️</span>
              <div>
                <h2 className="text-[17px] font-bold text-red-900">
                  Profile Update Requested
                </h2>
                <p className="text-[14px] text-red-700 mt-1 leading-relaxed">
                  {reviewNotes || 'Please ensure your CV link is publicly accessible and your skills reflect your chosen career path.'}
                </p>
                <p className="text-[13px] text-red-600 font-medium mt-2">
                  Update the fields below and re-submit your profile for fast review.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Card */}
        <div className="bg-white border border-[#d2d2d7]/70 rounded-3xl p-6 sm:p-10 shadow-sm">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-6 mb-8">
            <div>
              <h1 className="text-[24px] sm:text-[28px] font-bold text-[#1d1d1f] tracking-tight">
                Professional Career Profile
              </h1>
              <p className="text-[14px] text-[#86868b] mt-1">
                Complete your details to unlock verified remote job applications.
              </p>
            </div>

            {/* Completion Pill */}
            <div className="shrink-0">
              <div className="text-right">
                <span className="text-[13px] font-semibold text-[#86868b]">
                  Profile Completion
                </span>
                <div className="text-2xl font-bold text-[#1d1d1f]">
                  {completionPercentage}%
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Progress Bar */}
          <div className="w-full bg-[#f5f5f7] h-2.5 rounded-full overflow-hidden mb-8 border border-gray-100">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                completionPercentage >= 80
                  ? 'bg-emerald-500'
                  : completionPercentage >= 50
                  ? 'bg-amber-500'
                  : 'bg-[#e02424]'
              }`}
              style={{ width: `${completionPercentage}%` }}
            />
          </div>

          {/* Feedback Message */}
          {msg && (
            <div
              className={`mb-8 p-4 rounded-2xl text-[14px] flex items-start gap-3 ${
                msg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {msg.type === 'success' ? (
                <CheckCircle className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" />
              ) : (
                <span className="text-base shrink-0">⚠️</span>
              )}
              <span className="leading-relaxed">{msg.text}</span>
            </div>
          )}

          <form onSubmit={handleSaveDraft} className="space-y-8">
            {/* 1. Personal & Location */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-full bg-red-50 text-[#e02424] flex items-center justify-center text-xs font-bold">
                  1
                </div>
                <h2 className="text-[15px] font-bold uppercase tracking-wider text-[#1d1d1f]">
                  Personal &amp; Location Details
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-[13px] font-semibold text-[#1d1d1f] mb-1.5">
                    Full Legal Name <span className="text-[#e02424]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Alex Johnson"
                    className="w-full bg-[#f5f5f7] border border-[#d2d2d7]/60 rounded-xl px-3.5 py-2.5 text-[15px] outline-none focus:bg-white focus:ring-2 focus:ring-[#e02424]/20 focus:border-[#e02424] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-[#1d1d1f] mb-1.5">
                    Country of Residence <span className="text-[#e02424]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="e.g. Nigeria, United Kingdom, USA"
                    className="w-full bg-[#f5f5f7] border border-[#d2d2d7]/60 rounded-xl px-3.5 py-2.5 text-[15px] outline-none focus:bg-white focus:ring-2 focus:ring-[#e02424]/20 focus:border-[#e02424] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-[#1d1d1f] mb-1.5">
                    City / State <span className="text-[#e02424]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Lagos, Abuja, London"
                    className="w-full bg-[#f5f5f7] border border-[#d2d2d7]/60 rounded-xl px-3.5 py-2.5 text-[15px] outline-none focus:bg-white focus:ring-2 focus:ring-[#e02424]/20 focus:border-[#e02424] transition-all"
                  />
                </div>
              </div>
            </div>

            <hr className="border-[#d2d2d7]/40" />

            {/* 2. Career Identity & Status */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-full bg-red-50 text-[#e02424] flex items-center justify-center text-xs font-bold">
                  2
                </div>
                <h2 className="text-[15px] font-bold uppercase tracking-wider text-[#1d1d1f]">
                  Career Identity &amp; Role Preferences
                </h2>
              </div>

              <div className="space-y-4">
                {/* Status Toggle */}
                <div>
                  <label className="block text-[13px] font-semibold text-[#1d1d1f] mb-2">
                    Current Professional Status <span className="text-[#e02424]">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {[
                      { id: 'student', label: '🎓 Student' },
                      { id: 'graduate', label: '🎓 Recent Graduate' },
                      { id: 'professional', label: '💼 Working Professional' },
                    ].map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setUserStatus(st.id as any)}
                        className={`py-2.5 px-3 rounded-xl border text-[13px] font-semibold transition-all cursor-pointer text-center ${
                          userStatus === st.id
                            ? 'bg-[#1d1d1f] text-white border-[#1d1d1f] shadow-sm'
                            : 'bg-[#f5f5f7] hover:bg-gray-100 text-[#1d1d1f] border-[#d2d2d7]/60'
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[13px] font-semibold text-[#1d1d1f] mb-1.5">
                      Primary Career Field <span className="text-[#e02424]">*</span>
                    </label>
                    <select
                      value={careerField}
                      onChange={(e) => setCareerField(e.target.value)}
                      className="w-full bg-[#f5f5f7] border border-[#d2d2d7]/60 rounded-xl px-3.5 py-2.5 text-[15px] outline-none focus:bg-white focus:ring-2 focus:ring-[#e02424]/20 focus:border-[#e02424] transition-all"
                    >
                      <option value="Customer Support">Customer Support &amp; Client Relations</option>
                      <option value="Admin & Virtual Assistant">Virtual Assistant &amp; Administration</option>
                      <option value="Writing & Content">Writing, Copywriting &amp; SEO</option>
                      <option value="Marketing & Sales">Marketing, Social Media &amp; Sales</option>
                      <option value="Finance & Accounting">Finance &amp; Accounting</option>
                      <option value="Engineering & Tech">Software Engineering &amp; Tech</option>
                      <option value="Design & Creative">Design, UI/UX &amp; Creative</option>
                      <option value="Product & Management">Product &amp; Operations Management</option>
                      <option value="Other">Other Remote Field</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[13px] font-semibold text-[#1d1d1f] mb-1.5">
                      Years of Experience <span className="text-[#e02424]">*</span>
                    </label>
                    <select
                      value={experienceYears}
                      onChange={(e) => setExperienceYears(e.target.value)}
                      className="w-full bg-[#f5f5f7] border border-[#d2d2d7]/60 rounded-xl px-3.5 py-2.5 text-[15px] outline-none focus:bg-white focus:ring-2 focus:ring-[#e02424]/20 focus:border-[#e02424] transition-all"
                    >
                      <option value="Entry-Level">Entry-Level (0 - 1 year)</option>
                      <option value="1-2 years">Junior (1 - 2 years)</option>
                      <option value="3-5 years">Mid-Level (3 - 5 years)</option>
                      <option value="5+ years">Senior (5+ years)</option>
                      <option value="Lead / Executive">Lead / Manager / Executive</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-[#1d1d1f] mb-1.5">
                    Desired Job Titles / Roles <span className="text-[#e02424]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={desiredRoles}
                    onChange={(e) => setDesiredRoles(e.target.value)}
                    placeholder="e.g. Remote Customer Support Specialist, Virtual Executive Assistant"
                    className="w-full bg-[#f5f5f7] border border-[#d2d2d7]/60 rounded-xl px-3.5 py-2.5 text-[15px] outline-none focus:bg-white focus:ring-2 focus:ring-[#e02424]/20 focus:border-[#e02424] transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[13px] font-semibold text-[#1d1d1f] mb-1.5">
                      Preferred Job Type
                    </label>
                    <select
                      value={jobTypePreference}
                      onChange={(e) => setJobTypePreference(e.target.value)}
                      className="w-full bg-[#f5f5f7] border border-[#d2d2d7]/60 rounded-xl px-3.5 py-2.5 text-[15px] outline-none focus:bg-white focus:ring-2 focus:ring-[#e02424]/20 focus:border-[#e02424] transition-all"
                    >
                      <option value="Full-time Remote">Full-time Remote</option>
                      <option value="Part-time Remote">Part-time Remote</option>
                      <option value="Contract / Freelance">Contract / Freelance</option>
                      <option value="Any Remote">Any Remote Work</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[13px] font-semibold text-[#1d1d1f] mb-1.5">
                      Expected Monthly Salary
                    </label>
                    <input
                      type="text"
                      value={expectedSalary}
                      onChange={(e) => setExpectedSalary(e.target.value)}
                      placeholder="e.g. $1,500 - $2,500 or ₦400,000 - ₦800,000"
                      className="w-full bg-[#f5f5f7] border border-[#d2d2d7]/60 rounded-xl px-3.5 py-2.5 text-[15px] outline-none focus:bg-white focus:ring-2 focus:ring-[#e02424]/20 focus:border-[#e02424] transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-[#d2d2d7]/40" />

            {/* 3. Education & Summary */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-full bg-red-50 text-[#e02424] flex items-center justify-center text-xs font-bold">
                  3
                </div>
                <h2 className="text-[15px] font-bold uppercase tracking-wider text-[#1d1d1f]">
                  Education &amp; Experience Summary
                </h2>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[13px] font-semibold text-[#1d1d1f] mb-1.5">
                      Education Level
                    </label>
                    <select
                      value={educationLevel}
                      onChange={(e) => setEducationLevel(e.target.value)}
                      className="w-full bg-[#f5f5f7] border border-[#d2d2d7]/60 rounded-xl px-3.5 py-2.5 text-[15px] outline-none focus:bg-white focus:ring-2 focus:ring-[#e02424]/20 focus:border-[#e02424] transition-all"
                    >
                      <option value="Bachelor's Degree">Bachelor&apos;s Degree</option>
                      <option value="Master's / Postgraduate">Master&apos;s / Postgraduate</option>
                      <option value="Diploma / HND / OND">Diploma / HND / OND</option>
                      <option value="High School / Secondary">High School / Secondary</option>
                      <option value="Self-Taught / Certified">Self-Taught / Professional Cert</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[13px] font-semibold text-[#1d1d1f] mb-1.5">
                      School / Institution
                    </label>
                    <input
                      type="text"
                      value={institution}
                      onChange={(e) => setInstitution(e.target.value)}
                      placeholder="e.g. University of Lagos"
                      className="w-full bg-[#f5f5f7] border border-[#d2d2d7]/60 rounded-xl px-3.5 py-2.5 text-[15px] outline-none focus:bg-white focus:ring-2 focus:ring-[#e02424]/20 focus:border-[#e02424] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[13px] font-semibold text-[#1d1d1f] mb-1.5">
                      Graduation Year
                    </label>
                    <input
                      type="text"
                      value={graduationYear}
                      onChange={(e) => setGraduationYear(e.target.value)}
                      placeholder="e.g. 2024"
                      className="w-full bg-[#f5f5f7] border border-[#d2d2d7]/60 rounded-xl px-3.5 py-2.5 text-[15px] outline-none focus:bg-white focus:ring-2 focus:ring-[#e02424]/20 focus:border-[#e02424] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-[#1d1d1f] mb-1.5">
                    Professional Summary / Experience Highlights
                  </label>
                  <textarea
                    rows={3}
                    value={experienceSummary}
                    onChange={(e) => setExperienceSummary(e.target.value)}
                    placeholder="Briefly describe your career background, past responsibilities, or proudest accomplishments..."
                    className="w-full bg-[#f5f5f7] border border-[#d2d2d7]/60 rounded-xl p-3 text-[14px] outline-none focus:bg-white focus:ring-2 focus:ring-[#e02424]/20 focus:border-[#e02424] transition-all"
                  />
                </div>
              </div>
            </div>

            <hr className="border-[#d2d2d7]/40" />

            {/* 4. Skills & Verification Artifacts */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-full bg-red-50 text-[#e02424] flex items-center justify-center text-xs font-bold">
                  4
                </div>
                <h2 className="text-[15px] font-bold uppercase tracking-wider text-[#1d1d1f]">
                  Skills, CV &amp; Online Portfolio
                </h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[13px] font-semibold text-[#1d1d1f] mb-1.5">
                    Key Professional Skills (comma separated) <span className="text-[#e02424]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    placeholder="e.g. Zendesk, Google Docs, Customer Service, Excel, Copywriting, React"
                    className="w-full bg-[#f5f5f7] border border-[#d2d2d7]/60 rounded-xl px-3.5 py-2.5 text-[15px] outline-none focus:bg-white focus:ring-2 focus:ring-[#e02424]/20 focus:border-[#e02424] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-[#1d1d1f] mb-1.5">
                    CV / Resume Link (Google Drive, Dropbox, PDF URL) <span className="text-[#e02424]">*</span>
                  </label>
                  <input
                    type="url"
                    required
                    value={resumeUrl}
                    onChange={(e) => setResumeUrl(e.target.value)}
                    placeholder="https://drive.google.com/file/d/.../view"
                    className="w-full bg-[#f5f5f7] border border-[#d2d2d7]/60 rounded-xl px-3.5 py-2.5 text-[15px] outline-none focus:bg-white focus:ring-2 focus:ring-[#e02424]/20 focus:border-[#e02424] transition-all"
                  />
                  <p className="text-[11px] text-[#86868b] mt-1">
                    Tip: Ensure link sharing permission is set to &quot;Anyone with the link can view&quot;.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[13px] font-semibold text-[#1d1d1f] mb-1.5">
                      LinkedIn Profile URL
                    </label>
                    <input
                      type="url"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      placeholder="https://linkedin.com/in/yourname"
                      className="w-full bg-[#f5f5f7] border border-[#d2d2d7]/60 rounded-xl px-3.5 py-2.5 text-[15px] outline-none focus:bg-white focus:ring-2 focus:ring-[#e02424]/20 focus:border-[#e02424] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[13px] font-semibold text-[#1d1d1f] mb-1.5">
                      Portfolio / Personal Website URL
                    </label>
                    <input
                      type="url"
                      value={portfolioUrl}
                      onChange={(e) => setPortfolioUrl(e.target.value)}
                      placeholder="https://yourportfolio.com"
                      className="w-full bg-[#f5f5f7] border border-[#d2d2d7]/60 rounded-xl px-3.5 py-2.5 text-[15px] outline-none focus:bg-white focus:ring-2 focus:ring-[#e02424]/20 focus:border-[#e02424] transition-all"
                    />
                  </div>
                </div>

                {careerField.includes('Engineering') || careerField.includes('Tech') ? (
                  <div>
                    <label className="block text-[13px] font-semibold text-[#1d1d1f] mb-1.5">
                      GitHub Profile URL (Recommended for Tech)
                    </label>
                    <input
                      type="url"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      placeholder="https://github.com/yourusername"
                      className="w-full bg-[#f5f5f7] border border-[#d2d2d7]/60 rounded-xl px-3.5 py-2.5 text-[15px] outline-none focus:bg-white focus:ring-2 focus:ring-[#e02424]/20 focus:border-[#e02424] transition-all"
                    />
                  </div>
                ) : null}
              </div>
            </div>

            {/* Pre-Submission Live Checklist */}
            <div className="bg-[#f5f5f7] border border-[#d2d2d7]/60 rounded-2xl p-5">
              <h3 className="text-[13px] font-bold uppercase tracking-wider text-[#1d1d1f] mb-3">
                Review Readiness Checklist
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[13px]">
                <div className="flex items-center gap-2">
                  {fullName.trim() ? (
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <span className="w-4 h-4 rounded-full border border-gray-300 inline-block shrink-0" />
                  )}
                  <span className={fullName.trim() ? 'text-[#1d1d1f] font-medium' : 'text-[#86868b]'}>
                    Legal Name completed
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {country.trim() && city.trim() ? (
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <span className="w-4 h-4 rounded-full border border-gray-300 inline-block shrink-0" />
                  )}
                  <span className={country.trim() && city.trim() ? 'text-[#1d1d1f] font-medium' : 'text-[#86868b]'}>
                    Country &amp; City filled
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {careerField ? (
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <span className="w-4 h-4 rounded-full border border-gray-300 inline-block shrink-0" />
                  )}
                  <span className={careerField ? 'text-[#1d1d1f] font-medium' : 'text-[#86868b]'}>
                    Career field selected
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {skills.trim() ? (
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <span className="w-4 h-4 rounded-full border border-gray-300 inline-block shrink-0" />
                  )}
                  <span className={skills.trim() ? 'text-[#1d1d1f] font-medium' : 'text-[#86868b]'}>
                    Key skills specified
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {resumeUrl.trim() ? (
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <span className="w-4 h-4 rounded-full border border-gray-300 inline-block shrink-0" />
                  )}
                  <span className={resumeUrl.trim() ? 'text-[#1d1d1f] font-medium' : 'text-[#86868b]'}>
                    CV / Resume link provided
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {linkedinUrl.trim() || portfolioUrl.trim() || githubUrl.trim() ? (
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <span className="text-amber-500 text-xs shrink-0 font-bold">⚠️</span>
                  )}
                  <span
                    className={
                      linkedinUrl.trim() || portfolioUrl.trim() || githubUrl.trim()
                        ? 'text-[#1d1d1f] font-medium'
                        : 'text-amber-700 font-medium'
                    }
                  >
                    {linkedinUrl.trim() || portfolioUrl.trim() || githubUrl.trim()
                      ? 'Portfolio / Links added'
                      : 'Portfolio recommended'}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={handleSubmitForReview}
                disabled={submitting || saving || reviewStatus === 'approved'}
                className="w-full sm:flex-1 bg-[#e02424] hover:bg-[#c81e1e] active:bg-[#991b1b] text-white font-bold text-[15px] py-4 rounded-full transition-all shadow-sm disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-5 h-5" />
                <span>
                  {submitting
                    ? 'Submitting...'
                    : reviewStatus === 'approved'
                    ? 'Profile Approved & Verified'
                    : reviewStatus === 'under_review'
                    ? 'Re-submit for Hoberg Review'
                    : 'Submit for Hoberg Review'}
                </span>
              </button>

              <button
                type="submit"
                disabled={saving || submitting}
                className="w-full sm:w-auto bg-[#f5f5f7] hover:bg-gray-200 text-[#1d1d1f] font-semibold text-[14px] px-6 py-4 rounded-full border border-[#d2d2d7] transition-colors disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Draft'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
