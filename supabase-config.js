// ══ SUPABASE CONFIG ══
// هذا الملف لا يُرفع على GitHub — أضفه إلى .gitignore
// This file is NOT committed to GitHub — add it to .gitignore

const SUPABASE_URL      = 'https://koprvpdmdktyorzymeud.supabase.co';   // ← ضع URL مشروعك
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtvcHJ2cGRtZGt0eW9yenltZXVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3NDg5NTIsImV4cCI6MjA5NjMyNDk1Mn0.Le2ayXVsSrbt13w7nTMFTu4oWk0wlOSoeOOuSStpapA'; // ← ضع Anon Key

const db = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
window.db = db;
// ══ CONNECTION TEST ══
async function testSupabaseConnection() {
  try {
    const { data, error } = await db
      .from('products')
      .select('count')
      .limit(1);

    if (error) {
      console.error('❌ Supabase connection FAILED:', error.message);
    } else {
      console.log('✅ Supabase connected successfully');
    }
  } catch (err) {
    console.error('❌ Supabase unreachable:', err.message);
  }
}

testSupabaseConnection();