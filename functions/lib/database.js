import { createClient } from '@supabase/supabase-js';

let supabaseClient = null;

export function getSupabaseClient(env) {
  if (!supabaseClient) {
    supabaseClient = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
  }
  return supabaseClient;
}

export function createResponse(data, success = true, message = '', status = 200) {
  const response = {
    success,
    timestamp: new Date().toISOString()
  };

  if (success) {
    response.data = data;
    if (message) response.message = message;
  } else {
    response.error = {
      code: data.code || 'UNKNOWN_ERROR',
      message: data.message || message,
      details: data.details || {}
    };
  }

  return new Response(JSON.stringify(response), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key'
    }
  });
}

export function createErrorResponse(error, status = 400) {
  return createResponse({
    code: error.code || 'VALIDATION_ERROR',
    message: error.message || '请求处理失败',
    details: error.details || {}
  }, false, '', status);
}

export function createPaginationResponse(items, pagination) {
  return {
    items,
    pagination
  };
}

export function parsePagination(searchParams) {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '20')));
  const offset = (page - 1) * pageSize;
  
  return { page, pageSize, offset };
}

export async function handleCORS(request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
        'Access-Control-Max-Age': '86400'
      }
    });
  }
  return null;
}