import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function test() {
  const { data } = await supabase.from('jobs').select('id, title, created_at').order('created_at', { ascending: false }).limit(5)
  console.log(JSON.stringify(data, null, 2))
}

test()

