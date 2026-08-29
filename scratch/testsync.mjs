import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function runSync() {
  console.log("Starting Sync test...");

  // 1. Wipe old jobs
  console.log("Wiping old jobs...");
  const { error: deleteError } = await supabase
    .from('jobs')
    .delete()
    .neq('source', 'internal')
  if (deleteError) {
    console.error("Delete Error:", deleteError);
  } else {
    console.log("Wipe success.");
  }

  // 2. Try inserting one job
  console.log("Inserting one dummy job...");
  const { data, error: insertError } = await supabase.from('jobs').insert([{
    title: 'Dummy Job',
    company_name: 'Dummy Co',
    location: 'Remote',
    employment_type: 'Full-time',
    is_remote: true,
    description: 'Test',
    apply_url: 'https://test.com',
    status: 'open',
    source: 'Test',
    created_at: new Date().toISOString()
  }]).select('id')

  if (insertError) {
    console.error("Insert Error:", insertError);
  } else {
    console.log("Insert success. ID:", data[0].id);
  }
}

runSync()

