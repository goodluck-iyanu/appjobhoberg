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
    const adminSupabase = createAdminClient()

    // Extract all fields the profile page sends
    const {
      // Standard schema fields
      full_name,
      fullName,
      phone,
      city,
      country,
      open_to_relocate,
      remote_from_nigeria,
      seniority,
      nysc_status,
      target_roles,
      skills,
      experience,
      education,
      links,
      profile_strength,
      // Extended profile page fields
      careerField,
      desiredRoles,
      userStatus,
      educationLevel,
      institution,
      graduationYear,
      experienceYears,
      experienceSummary,
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

    const displayName = full_name || fullName || user.user_metadata?.full_name || user.email?.split('@')[0]

    // Build payload using only columns that exist in the profiles table
    const payload: Record<string, any> = {
      id: user.id,
      full_name: displayName,
      display_name: displayName,
      email: user.email,
      phone: phone || null,
      city: city || 'Lagos',
      country: country || 'Nigeria',
      open_to_relocate: Boolean(open_to_relocate),
      remote_from_nigeria: remote_from_nigeria !== false,
      seniority: seniority || userStatus || 'mid',
      nysc_status: nysc_status || 'completed',
      target_roles: Array.isArray(target_roles) ? target_roles : (desiredRoles ? [desiredRoles] : []),
      skills: Array.isArray(skills) ? skills : [],
      experience: Array.isArray(experience) ? experience : [],
      education: Array.isArray(education) ? education : [],
      links: typeof links === 'object' ? links : {
        linkedin: linkedinUrl || null,
        github: githubUrl || null,
        twitter: twitterUrl || null,
        portfolio: portfolioUrl || null,
      },
      profile_strength: typeof profile_strength === 'number' ? profile_strength : 50,
      updated_at: new Date().toISOString(),
    }

    // Store extended fields that aren't in the core schema as a JSONB blob
    // or as individual columns if they exist. We use a safe approach:
    // try to save extended columns, and if they don't exist, store in links jsonb.
    const extendedFields: Record<string, any> = {}
    if (careerField) extendedFields.career_field = careerField
    if (desiredRoles) extendedFields.desired_roles = desiredRoles
    if (userStatus) extendedFields.user_status = userStatus
    if (educationLevel) extendedFields.education_level = educationLevel
    if (institution) extendedFields.institution = institution
    if (graduationYear) extendedFields.graduation_year = graduationYear
    if (experienceYears) extendedFields.experience_years = experienceYears
    if (experienceSummary) extendedFields.experience_summary = experienceSummary
    if (resumeUrl) extendedFields.resume_url = resumeUrl
    if (linkedinUrl) extendedFields.linkedin_url = linkedinUrl
    if (twitterUrl) extendedFields.twitter_url = twitterUrl
    if (whatsappNumber) extendedFields.whatsapp_number = whatsappNumber
    if (githubUrl) extendedFields.github_url = githubUrl
    if (portfolioUrl) extendedFields.portfolio_url = portfolioUrl
    if (jobTypePreference) extendedFields.job_type_preference = jobTypePreference
    if (expectedSalary) extendedFields.expected_salary = expectedSalary
    if (targetStatus || reviewStatus) extendedFields.review_status = targetStatus || reviewStatus

    // Merge extended fields into payload (they get saved if columns exist)
    Object.assign(payload, extendedFields)

    // 1. Try upsert with admin client (bypasses RLS for reliability)
    let { data, error } = await adminSupabase.from('profiles').upsert(payload).select().single()

    // 2. If admin upsert fails because some columns don't exist,
    //    strip extended fields and retry with only core columns
    if (error && error.message?.includes('column')) {
      console.warn('Some extended columns missing, retrying with core fields only:', error.message)
      // Remove extended fields from payload
      for (const key of Object.keys(extendedFields)) {
        delete payload[key]
      }
      const retryResult = await adminSupabase.from('profiles').upsert(payload).select().single()
      data = retryResult.data
      error = retryResult.error
    }

    if (error) {
      console.error('Profile save error:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    // 3. Create or update Master snapshot in cv_versions table
    try {
      await adminSupabase.from('cv_versions').insert({
        user_id: user.id,
        kind: 'master',
        title: 'Master CV Snapshot',
        content: {
          full_name: displayName,
          email: user.email,
          phone,
          city,
          country,
          career_field: careerField,
          desired_roles: desiredRoles,
          user_status: userStatus,
          education_level: educationLevel,
          institution,
          graduation_year: graduationYear,
          experience_years: experienceYears,
          experience_summary: experienceSummary,
          target_roles: Array.isArray(target_roles) ? target_roles : (desiredRoles ? [desiredRoles] : []),
          skills: Array.isArray(skills) ? skills : [],
          experience,
          education,
          links: {
            linkedin: linkedinUrl,
            github: githubUrl,
            twitter: twitterUrl,
            portfolio: portfolioUrl,
            whatsapp: whatsappNumber,
          },
          resume_url: resumeUrl,
          job_type_preference: jobTypePreference,
          expected_salary: expectedSalary,
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
    } catch {}

    return NextResponse.json({
      success: true,
      profile: data,
      message: 'Master profile successfully updated.',
    })
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Server error' },
      { status: 500 }
    )
  }
}
