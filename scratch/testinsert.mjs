import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function test() {
  const { data, error } = await supabase.from('jobs').insert({title: 'Test', company_name: 'Test', location: 'Test', description: 'Test', apply_url: 'Test'}).select()
  console.log("Insert result:", { data, error })
}

test()

