import { getSupabaseClient, createResponse, createErrorResponse, handleCORS } from '../lib/database.js';
import { validateOrganization } from '../lib/validators.js';

export async function onRequest({ request, params, env }) {
  const corsResponse = await handleCORS(request);
  if (corsResponse) return corsResponse;

  try {
    const supabase = getSupabaseClient(env);
    const { id } = params;

    if (request.method === 'GET') {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        return createErrorResponse({
          code: 'NOT_FOUND',
          message: '组织不存在'
        }, 404);
      }

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

      return createResponse(formattedData);
    }

    if (request.method === 'PUT' || request.method === 'PATCH') {
      const body = await request.json();
      
      // 验证数据
      if (request.method === 'PUT') {
        validateOrganization(body);
      }

      const updateData = {};
      if (body.organizationCode) updateData.organization_code = body.organizationCode;
      if (body.name) updateData.name = body.name;
      if (body.description !== undefined) updateData.description = body.description;
      if (body.contactInfo) updateData.contact_info = body.contactInfo;
      if (body.region !== undefined) updateData.region = body.region;
      if (body.establishmentDate !== undefined) updateData.establishment_date = body.establishmentDate;
      if (body.logoUrl !== undefined) updateData.logo_url = body.logoUrl;
      if (body.status) updateData.status = body.status;

      const { data, error } = await supabase
        .from('organizations')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw {
          code: 'DATABASE_ERROR',
          message: '更新组织失败',
          details: { error: error.message }
        };
      }

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

      return createResponse(formattedData, true, '组织更新成功');
    }

    if (request.method === 'DELETE') {
      // 检查是否有关联的考试
      const { count } = await supabase
        .from('exams')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', id);

      if (count > 0) {
        return createErrorResponse({
          code: 'CONFLICT',
          message: '无法删除组织，存在关联的考试'
        }, 409);
      }

      const { error } = await supabase
        .from('organizations')
        .delete()
        .eq('id', id);

      if (error) {
        throw {
          code: 'DATABASE_ERROR',
          message: '删除组织失败',
          details: { error: error.message }
        };
      }

      return createResponse(null, true, '组织删除成功');
    }

    return createErrorResponse({
      code: 'METHOD_NOT_ALLOWED',
      message: '不支持的请求方法'
    }, 405);

  } catch (error) {
    console.error('Organization Detail API Error:', error);
    return createErrorResponse(error, error.status || 500);
  }
}