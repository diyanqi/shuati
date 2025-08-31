import { createClient } from '@supabase/supabase-js';

/**
 * 获取 Supabase 客户端实例
 * @param {object} env - Pages 函数的环境变量
 * @returns {import('@supabase/supabase-js').SupabaseClient}
 */
export function getSupabaseClient(env) {
  // 确保只创建一个实例
  if (!global.supabase) {
    if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
      throw new Error('Supabase URL or Anon Key is not defined in environment variables.');
    }
    global.supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
      auth: {
        persistSession: false,
      },
    });
  }
  return global.supabase;
}
