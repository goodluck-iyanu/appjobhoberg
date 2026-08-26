'use client'

import { useState, useEffect } from 'react'
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
} from '@/components/icons'

export default function ProfilePage() {
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Profile fields
  const [displayName, setDisplayName] = useState('')
  const [country, setCountry] = useState('')
  const [careerField, setCareerField] = useState('Engineering')
  const [currentRole, setCurrentRole] = useState('')
  const [experienceLevel, setExperienceLevel] = useState('Mid-Level')
  const [skills, setSkills] = useState('')
  const [preferredRoles, setPreferredRoles] = useState('')
  const [linkedinUrl, setLinkedinUrl] = useState('')
  const [portfolioUrl, setPortfolioUrl] = useState('')

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
        setDisplayName(profile.display_name || user.user_metadata?.full_name || '')
        setCountry(profile.country || '')
        setCareerField(profile.career_field || 'Engineering')
        setCurrentRole(profile.current_role || '')
        setExperienceLevel(profile.experience_level || 'Mid-Level')
        setSkills(profile.skills ? profile.skills.join(', ') : '')
        setPreferredRoles(profile.preferred_roles || '')
        setLinkedinUrl(profile.linkedin_url || '')
        setPortfolioUrl(profile.portfolio_url || '')
      } else {
        setDisplayName(user.user_metadata?.full_name || '')
      }

      setLoading(false)
    }

    loadProfile()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMsg(null)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setMsg({ type: 'error', text: 'You must be logged in to save.' })
        setSaving(false)
        return
      }

      const skillsArray = skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)

      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        display_name: displayName,
        country,
        career_field: careerField,
        current_job_title: currentRole,
        experience_level: experienceLevel,
        skills: skillsArray,
        preferred_roles: preferredRoles,
        linkedin_url: linkedinUrl,
        portfolio_url: portfolioUrl,
        updated_at: new Date().toISOString(),
      })

      if (error) {
        setMsg({ type: 'error', text: error.message })
      } else {
        setMsg({ type: 'success', text: 'Profile updated successfully!' })
      }
    } catch {
      setMsg({ type: 'error', text: 'Failed to update profile.' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex-1 bg-[#f5f5f7] py-16 flex items-center justify-center">
        <p className="text-[#86868b] text-[15px]">Loading profile...</p>
      </div>
    )
  }

  return (
    <div className="flex-1 bg-[#f5f5f7] py-10 sm:py-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center text-[13px] font-medium text-[#86868b] hover:text-[#1d1d1f] mb-6 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          Back to Dashboard
        </Link>

        <div className="bg-white border border-[#d2d2d7]/70 rounded-3xl p-6 sm:p-10 shadow-sm">
          <div className="mb-8">
            <h1 className="text-[24px] sm:text-[30px] font-bold text-[#1d1d1f] tracking-tight">
              Edit Career Profile
            </h1>
            <p className="text-[14px] text-[#86868b] mt-1">
              Customize your details to receive tailored remote job recommendations.
            </p>
          </div>

          {msg && (
            <div
              className={`mb-6 p-4 rounded-xl text-[14px] flex items-center gap-2.5 ${
                msg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {msg.type === 'success' ? (
                <CheckCircle className="w-5 h-5 shrink-0 text-emerald-600" />
              ) : (
                <span className="text-base">⚠️</span>
              )}
              <span>{msg.text}</span>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-6">
            {/* Personal Info */}
            <div>
              <h2 className="text-[14px] font-bold uppercase tracking-wider text-[#86868b] mb-4">
                Personal Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold text-[#1d1d1f] mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Alex Johnson"
                    className="w-full bg-[#f5f5f7] border border-[#d2d2d7]/60 rounded-xl px-3.5 py-2.5 text-[15px] outline-none focus:bg-white focus:ring-2 focus:ring-[#e02424]/20 focus:border-[#e02424]"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-[#1d1d1f] mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="e.g. Nigeria, United Kingdom, USA"
                    className="w-full bg-[#f5f5f7] border border-[#d2d2d7]/60 rounded-xl px-3.5 py-2.5 text-[15px] outline-none focus:bg-white focus:ring-2 focus:ring-[#e02424]/20 focus:border-[#e02424]"
                  />
                </div>
              </div>
            </div>

            <hr className="border-[#d2d2d7]/40" />

            {/* Career Info */}
            <div>
              <h2 className="text-[14px] font-bold uppercase tracking-wider text-[#86868b] mb-4">
                Career &amp; Role Details
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[13px] font-semibold text-[#1d1d1f] mb-1">
                      Career Field
                    </label>
                    <select
                      value={careerField}
                      onChange={(e) => setCareerField(e.target.value)}
                      className="w-full bg-[#f5f5f7] border border-[#d2d2d7]/60 rounded-xl px-3.5 py-2.5 text-[15px] outline-none focus:bg-white focus:ring-2 focus:ring-[#e02424]/20 focus:border-[#e02424]"
                    >
                      <option value="Customer Support">Customer Support</option>
                      <option value="Admin & Virtual Assistant">Admin &amp; Virtual Assistant</option>
                      <option value="Writing & Content">Writing &amp; Content</option>
                      <option value="Marketing & Sales">Marketing &amp; Sales</option>
                      <option value="Finance & Accounting">Finance &amp; Accounting</option>
                      <option value="Engineering & Tech">Engineering &amp; Tech</option>
                      <option value="Design & Creative">Design &amp; Creative</option>
                      <option value="Product & Management">Product &amp; Management</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[13px] font-semibold text-[#1d1d1f] mb-1">
                      Experience Level
                    </label>
                    <select
                      value={experienceLevel}
                      onChange={(e) => setExperienceLevel(e.target.value)}
                      className="w-full bg-[#f5f5f7] border border-[#d2d2d7]/60 rounded-xl px-3.5 py-2.5 text-[15px] outline-none focus:bg-white focus:ring-2 focus:ring-[#e02424]/20 focus:border-[#e02424]"
                    >
                      <option value="Entry-Level">Entry-Level</option>
                      <option value="Junior">Junior (1-2 years)</option>
                      <option value="Mid-Level">Mid-Level (3-5 years)</option>
                      <option value="Senior">Senior (5+ years)</option>
                      <option value="Lead / Executive">Lead / Executive</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-[#1d1d1f] mb-1">
                    Current Job Title
                  </label>
                  <input
                    type="text"
                    value={currentRole}
                    onChange={(e) => setCurrentRole(e.target.value)}
                    placeholder="e.g. Customer Support Specialist, Virtual Assistant, Frontend Dev"
                    className="w-full bg-[#f5f5f7] border border-[#d2d2d7]/60 rounded-xl px-3.5 py-2.5 text-[15px] outline-none focus:bg-white focus:ring-2 focus:ring-[#e02424]/20 focus:border-[#e02424]"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-[#1d1d1f] mb-1">
                    Key Skills (comma separated)
                  </label>
                  <input
                    type="text"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    placeholder="e.g. Zendesk, Google Docs, Excel, React, SEO, Copywriting"
                    className="w-full bg-[#f5f5f7] border border-[#d2d2d7]/60 rounded-xl px-3.5 py-2.5 text-[15px] outline-none focus:bg-white focus:ring-2 focus:ring-[#e02424]/20 focus:border-[#e02424]"
                  />
                </div>
              </div>
            </div>

            <hr className="border-[#d2d2d7]/40" />

            {/* Links */}
            <div>
              <h2 className="text-[14px] font-bold uppercase tracking-wider text-[#86868b] mb-4">
                Professional Links
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-[13px] font-semibold text-[#1d1d1f] mb-1">
                    LinkedIn Profile URL
                  </label>
                  <input
                    type="url"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="https://linkedin.com/in/yourname"
                    className="w-full bg-[#f5f5f7] border border-[#d2d2d7]/60 rounded-xl px-3.5 py-2.5 text-[15px] outline-none focus:bg-white focus:ring-2 focus:ring-[#e02424]/20 focus:border-[#e02424]"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-[#1d1d1f] mb-1">
                    Portfolio / Website URL
                  </label>
                  <input
                    type="url"
                    value={portfolioUrl}
                    onChange={(e) => setPortfolioUrl(e.target.value)}
                    placeholder="https://yourportfolio.com"
                    className="w-full bg-[#f5f5f7] border border-[#d2d2d7]/60 rounded-xl px-3.5 py-2.5 text-[15px] outline-none focus:bg-white focus:ring-2 focus:ring-[#e02424]/20 focus:border-[#e02424]"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-[#e02424] hover:bg-[#c81e1e] text-white font-semibold text-[15px] py-3.5 rounded-full transition-colors shadow-sm disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving changes...' : 'Save Profile'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

