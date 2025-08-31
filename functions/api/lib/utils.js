/**
 * 创建一个标准的成功JSON响应
 * @param {any} data - 响应数据
 * @param {boolean} success - 是否成功
 * @param {string} message - 响应消息
 * @param {number} status - HTTP状态码
 * @returns {Response}
 */
export function createResponse(data, success = true, message = '操作成功', status = 200) {
  const body = {
    success,
    timestamp: new Date().toISOString(),
    ...(success ? { data } : {}),
    ...(!success ? { error: data } : {}),
    message,
  };

  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

/**
 * 创建一个标准的错误JSON响应
 * @param {object} error - 错误对象 { code, message, details }
 * @param {number} status - HTTP状态码
 * @returns {Response}
 */
export function createErrorResponse(error, status = 500) {
  const errorPayload = {
    code: error.code || 'INTERNAL_ERROR',
    message: error.message || '服务器内部错误',
    details: error.details || {},
  };
  return createResponse(errorPayload, false, error.message, status);
}

/**
 * 创建分页响应体
 * @param {Array<any>} items - 数据项
 * @param {object} pagination - 分页信息
 * @returns {object}
 */
export function createPaginationResponse(items, pagination) {
  return {
    items,
    pagination,
  };
}

/**
 * 从URLSearchParams解析分页参数
 * @param {URLSearchParams} searchParams - URL查询参数
 * @returns {{page: number, pageSize: number, offset: number}}
 */
export function parsePagination(searchParams) {
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);
  const offset = (page - 1) * pageSize;
  return { page, pageSize, offset };
}

/**
 * 处理CORS预检请求
 * @param {Request} request - 请求对象
 * @returns {Response | null}
 */
export async function handleCORS(request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    });
  }
  return null;
}
