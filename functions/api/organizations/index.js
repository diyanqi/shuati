import { getSupabaseClient } from '../lib/supabase.js';
import { createResponse, createErrorResponse, createPaginationResponse, parsePagination, handleCORS } from '../lib/utils.js';
// import { validateOrganization } from '../../lib/validators.js'; // 暂时注释掉，因为文件不存在

export async function onRequest(context) {
  const { request, env } = context;
  
  const corsResponse = await handleCORS(request);
  if (corsResponse) return corsResponse;

  try {
    // --- 调试信息: 检查环境变量 ---
    console.log('[DEBUG] Supabase URL Loaded:', !!env.SUPABASE_URL);
    console.log('[DEBUG] Supabase Anon Key Loaded:', !!env.SUPABASE_ANON_KEY);

    const supabase = getSupabaseClient(env);
    const url = new URL(request.url);
    const searchParams = url.searchParams;

    if (request.method === 'GET') {
      // 解析分页参数
      const { page, pageSize, offset } = parsePagination(searchParams);
      
      // --- 调试信息: 打印查询参数 ---
      const search = searchParams.get('search');
      const region = searchParams.get('region');
      const status = searchParams.get('status');
      console.log(`[DEBUG] Query Params: page=${page}, pageSize=${pageSize}, search=${search}, region=${region}, status=${status}`);

      // 构建查询
      let query = supabase
        .from('organizations')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      // 搜索过滤
      if (search) {
        query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
      }

      // 地区过滤
      if (region) {
        query = query.eq('region', region);
      }

      // 状态过滤
      if (status) {
        query = query.eq('status', status);
      }

      // 执行查询
      const { data, error, count } = await query.range(offset, offset + pageSize - 1);

      // --- 调试信息: 打印查询结果 ---
      console.log(`[DEBUG] Supabase query returned count: ${count}`);
      if (error) {
        console.error('[DEBUG] Supabase query error:', JSON.stringify(error, null, 2));
      }

      if (error) {
        throw {
          code: 'DATABASE_ERROR',
          message: `查询组织列表失败: ${error.message}`,
          details: { 
            hint: error.hint,
            code: error.code,
            details: error.details,
          }
        };
      }

      // 格式化数据
      const formattedData = data.map(org => ({
        id: org.id,
        organizationCode: org.organization_code,
        name: org.name,
        description: org.description,
        contactInfo: org.contact_info || {},
        region: org.region,
        establishmentDate: org.establishment_date,
        logoUrl: org.logo_url,
        status: org.status,
        createdAt: org.created_at,
        updatedAt: org.updated_at
      }));

      // 构建分页信息
      const totalPages = Math.ceil(count / pageSize);
      const pagination = {
        page,
        pageSize,
        total: count,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      };

      return createResponse(createPaginationResponse(formattedData, pagination));
    }

    if (request.method === 'POST') {
      const body = await request.json();
      
      // 验证数据 - 暂时注释
      // validateOrganization(body);

      // 插入数据
      const { data, error } = await supabase
        .from('organizations')
        .insert({
          organization_code: body.organizationCode,
          name: body.name,
          description: body.description || null,
          contact_info: body.contactInfo || {},
          region: body.region || null,
          establishment_date: body.establishmentDate || null,
          logo_url: body.logoUrl || null,
          status: body.status || 'active'
        })
        .select()
        .single();

      if (error) {
        console.error('[DEBUG] Supabase insert error:', JSON.stringify(error, null, 2));
        throw {
          code: 'DATABASE_ERROR',
          message: `创建组织失败: ${error.message}`,
          details: { 
            hint: error.hint,
            code: error.code,
            details: error.details,
          }
        };
      }

      // 格式化返回数据
      const formattedData = {
        id: data.id,
        organizationCode: data.organization_code,
        name: data.name,
        description: data.description,
        contactInfo: data.contact_info || {},
        region: data.region,
        establishmentDate: data.establishment_date,
        logoUrl: data.logo_url,
        status: data.status,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      return createResponse(formattedData, true, '组织创建成功', 201);
    }

    return createErrorResponse({
      code: 'METHOD_NOT_ALLOWED',
      message: '不支持的请求方法'
    }, 405);

  } catch (error) {
    console.error('Organizations API Error:', error);
    return createErrorResponse(error, error.status || 500);
  }
}