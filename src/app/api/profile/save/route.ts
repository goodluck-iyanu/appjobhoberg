import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'You must be signed in to save profile changes.' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const {
      fullName,
      country,
      city,
      careerField,
      desiredRoles,
      userStatus,
      educationLevel,
      institution,
      graduationYear,
      experienceYears,
      experienceSummary,
      skills,
      resumeUrl,
      linkedinUrl,
      twitterUrl,
      whatsappNumber,
      githubUrl,
      portfolioUrl,
      jobTypePreference,
      expectedSalary,
      reviewStatus,
      targetStatus,
    } = body

    const adminSupabase = createAdminClient()
    const nextReviewStatus = targetStatus || reviewStatus || 'draft'
    const skillsArray = Array.isArray(skills)
      ? skills
      : typeof skills === 'string'
      ? skills.split(',').map((s: string) => s.trim()).filter(Boolean)
      : []

    const payload: Record<string, any> = {
      id: user.id,
      email: user.email,
      full_name: fullName || user.user_metadata?.full_name || user.email?.split('@')[0],
      display_name: fullName || user.user_metadata?.full_name || user.email?.split('@')[0],
      country: country || 'Nigeria',
      city: city || 'Lagos',
      career_field: careerField,
      desired_roles: desiredRoles,
      user_status: userStatus || 'professional',
      education_level: educationLevel,
      institution,
      graduation_year: graduationYear,
      experience_years: experienceYears,
      experience_summary: experienceSummary,
      skills: skillsArray,
      resume_url: resumeUrl,
      linkedin_url: linkedinUrl,
      twitter_url: twitterUrl,
      whatsapp_number: whatsappNumber,
      github_url: githubUrl,
      portfolio_url: portfolioUrl,
      job_type_preference: jobTypePreference,
      expected_salary: expectedSalary,
      review_status: nextReviewStatus,
      updated_at: new Date().toISOString(),
    }

    if (targetStatus === 'under_review') {
      payload.submitted_at = new Date().toISOString()
    }

    // Upsert into Supabase profiles using admin client
    let { data, error } = await adminSupabase
      .from('profiles')
      .upsert(payload)
      .select()
      .single()

    if (error && error.message?.includes('full_name')) {
      delete payload.full_name
      const retry = await adminSupabase.from('profiles').upsert(payload).select().single()
      data = retry.data
      error = retry.error
    }

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      profile: data,
      reviewStatus: nextReviewStatus,
    })
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to save profile' },
      { status: 500 }
    )
  }
}
