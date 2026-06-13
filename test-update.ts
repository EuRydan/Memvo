import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: events, error: fetchError } = await supabase
    .from('events')
    .select('id, name, status, active')
    .order('created_at', { ascending: false })
    .limit(1);
    
  if (fetchError) {
    console.error("Fetch Error:", fetchError);
    return;
  }
  
  console.log("Latest Event:", events[0]);
  
  if (events.length > 0) {
    const { data, error } = await supabase
      .from('events')
      .update({ active: true, status: 'published' })
      .eq('id', events[0].id)
      .select();
      
    console.log("Update Data:", data);
    console.log("Update Error:", error);
  }
}

run();
