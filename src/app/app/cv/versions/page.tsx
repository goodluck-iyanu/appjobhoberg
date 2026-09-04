'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { CvVersion } from '@/types'
import { useToast } from '@/components/Toast'
import {
  FileText,
  Clock,
  Download,
  ArrowLeft,
  Sparkles,
  ExternalLink,
  Trash2,
} from '@/components/icons'

export default function CvVersionsPage() {
  const router = useRouter()
  const supabase = createClient()
  const toast = useToast()

  const [loading, setLoading] = useState(true)
  const [versions, setVersions] = useState<CvVersion[]>([])
  const [selectedVersion, setSelectedVersion] = useState<CvVersion | null>(null)

  useEffect(() => {
    async function loadVersions() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login?next=/app/cv/versions')
        return
      }

      const { data } = await supabase
        .from('cv_versions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      setVersions(data || [])
      if (data && data.length > 0) {
        setSelectedVersion(data[0])
      }
      setLoading(false)
    }

    loadVersions()
  }, [router, supabase])

  const handlePrint = () => {
    window.print()
  }

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
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Link
              href="/app/cv"
              className="inline-flex items-center gap-1 text-[12px] text-[#86868b] hover:text-[#1d1d1f] mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Master CV</span>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1d1d1f]">
              CV Snapshots &amp; Tailored Versions
            </h1>
            <p className="text-[13px] text-[#86868b] mt-0.5">
              Review, export, or print your Master CV and job-tailored snapshots.
            </p>
          </div>

          {selectedVersion && (
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 bg-[#1d1d1f] hover:bg-black text-white text-[13px] font-semibold px-4 py-2 rounded-full cursor-pointer shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>
          )}
        </div>

        {versions.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl p-8 border border-gray-200">
            <p className="font-semibold text-[#1d1d1f]">No CV snapshots found yet.</p>
            <p className="text-[13px] text-[#86868b] mt-1">
              Save your Master CV or tailor a CV on any job listing to generate a snapshot.
            </p>
            <div className="mt-4">
              <Link
                href="/app/cv"
                className="inline-flex items-center gap-2 bg-[#e02424] text-white font-semibold text-[13px] px-5 py-2.5 rounded-full"
              >
                Go to Master CV →
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left sidebar: version list */}
            <div className="space-y-2">
              <p className="text-[11px] font-semibold text-[#86868b] uppercase tracking-wider px-2">
                Available Snapshots ({versions.length})
              </p>
              {versions.map((ver) => (
                <button
                  key={ver.id}
                  type="button"
                  onClick={() => setSelectedVersion(ver)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer ${
                    selectedVersion?.id === ver.id
                      ? 'bg-white border-[#e02424] shadow-sm ring-1 ring-[#e02424]/20'
                      : 'bg-white/80 border-black/[0.04] hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      ver.kind === 'master' ? 'bg-purple-50 text-purple-700' : 'bg-amber-50 text-amber-800'
                    }`}>
                      {ver.kind}
                    </span>
                    <span className="text-[11px] text-[#86868b]">
                      {new Date(ver.created_at || '').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  <p className="text-[14px] font-semibold text-[#1d1d1f] line-clamp-1">{ver.title}</p>
                </button>
              ))}
            </div>

            {/* Right: Printable CV Document Preview */}
            <div className="lg:col-span-2">
              {selectedVersion && (
                <div className="bg-white rounded-3xl p-8 sm:p-12 border border-black/[0.06] shadow-sm print:shadow-none print:border-none print:p-0">
                  {/* CV Document Header */}
                  <div className="border-b border-gray-200 pb-6 mb-6">
                    <h2 className="text-2xl font-bold text-[#1d1d1f]">
                      {selectedVersion.content.full_name || 'Candidate Name'}
                    </h2>
                    {selectedVersion.content.target_job_title && (
                      <p className="text-[15px] font-semibold text-[#e02424] mt-0.5">
                        {selectedVersion.content.target_job_title}
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-[12px] text-[#86868b]">
                      <span>{selectedVersion.content.email}</span>
                      {selectedVersion.content.phone && (
                        <>
                          <span>•</span>
                          <span>{selectedVersion.content.phone}</span>
                        </>
                      )}
                      <span>•</span>
                      <span>{selectedVersion.content.city || 'Lagos, Nigeria'}</span>
                    </div>
                  </div>

                  {/* Summary */}
                  {selectedVersion.content.summary && (
                    <div className="mb-6">
                      <h3 className="text-[13px] font-bold text-[#1d1d1f] uppercase tracking-wider mb-2 text-gray-500">
                        Professional Summary
                      </h3>
                      <p className="text-[14px] text-[#1d1d1f] leading-relaxed">
                        {selectedVersion.content.summary}
                      </p>
                    </div>
                  )}

                  {/* Skills */}
                  {selectedVersion.content.skills && selectedVersion.content.skills.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-[13px] font-bold text-[#1d1d1f] uppercase tracking-wider mb-2 text-gray-500">
                        Core Competencies &amp; Skills
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedVersion.content.skills.map((s, idx) => (
                          <span
                            key={idx}
                            className="text-[12px] font-medium bg-[#f5f5f7] text-[#1d1d1f] px-2.5 py-1 rounded-lg border border-gray-200"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Experience */}
                  {selectedVersion.content.experience && selectedVersion.content.experience.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-[13px] font-bold text-[#1d1d1f] uppercase tracking-wider mb-3 text-gray-500">
                        Work Experience
                      </h3>
                      <div className="space-y-4">
                        {selectedVersion.content.experience.map((exp: any, idx: number) => (
                          <div key={idx}>
                            <div className="flex justify-between items-baseline">
                              <p className="font-bold text-[14px] text-[#1d1d1f]">{exp.title}</p>
                              <span className="text-[11px] text-[#86868b]">
                                {exp.start_date} – {exp.end_date || 'Present'}
                              </span>
                            </div>
                            <p className="text-[13px] text-gray-600 font-medium">{exp.company}</p>
                            <p className="text-[13px] text-[#1d1d1f] mt-1 leading-relaxed">
                              {exp.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Education */}
                  {selectedVersion.content.education && selectedVersion.content.education.length > 0 && (
                    <div>
                      <h3 className="text-[13px] font-bold text-[#1d1d1f] uppercase tracking-wider mb-3 text-gray-500">
                        Education &amp; Credentials
                      </h3>
                      <div className="space-y-2">
                        {selectedVersion.content.education.map((edu: any, idx: number) => (
                          <div key={idx} className="flex justify-between items-baseline text-[13px]">
                            <div>
                              <span className="font-bold text-[#1d1d1f]">{edu.degree}</span>
                              {edu.field_of_study && <span>, {edu.field_of_study}</span>}
                              <p className="text-gray-600">{edu.institution}</p>
                            </div>
                            <span className="text-[11px] text-[#86868b]">{edu.graduation_year}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

