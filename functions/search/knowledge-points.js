import { getSupabaseClient, createResponse, createErrorResponse, handleCORS } from '../lib/database.js';

export async function onRequest({ request, env }) {
  const corsResponse = await handleCORS(request);
  if (corsResponse) return corsResponse;

  if (request.method !== 'GET') {
    return createErrorResponse({
      code: 'METHOD_NOT_ALLOWED',
      message: '不支持的请求方法'
    }, 405);
  }

  try {
    const supabase = getSupabaseClient(env);
    const url = new URL(request.url);
    const searchParams = url.searchParams;

    const query = searchParams.get('q');
    if (!query || query.trim().length === 0) {
      return createErrorResponse({
        code: 'VALIDATION_ERROR',
        message: '搜索关键词不能为空'
      });
    }

    const searchKeyword = query.trim();
    
    // 可选的学科筛选
    const subject = searchParams.get('subject');

    // 查询包含相关知识点的题目
    let searchQuery = supabase
      .from('questions')
      .select('knowledge_points, subject')
      .eq('status', 'published')
      .not('knowledge_points', 'is', null);

    if (subject) {
      searchQuery = searchQuery.eq('subject', subject);
    }

    const { data, error } = await searchQuery;

    if (error) {
      throw {
        code: 'DATABASE_ERROR',
        message: '查询知识点失败',
        details: { error: error.message }
      };
    }

    // 统计知识点
    const knowledgePointStats = {};
    const subjectStats = {};

    data.forEach(question => {
      const points = question.knowledge_points;
      const questionSubject = question.subject;

      if (Array.isArray(points)) {
        points.forEach(point => {
          if (point && point.includes(searchKeyword)) {
            if (!knowledgePointStats[point]) {
              knowledgePointStats[point] = {
                name: point,
                count: 0,
                subjects: new Set(),
                relatedPoints: new Set()
              };
            }
            knowledgePointStats[point].count++;
            knowledgePointStats[point].subjects.add(questionSubject);
            
            // 添加相关知识点
            points.forEach(relatedPoint => {
              if (relatedPoint !== point) {
                knowledgePointStats[point].relatedPoints.add(relatedPoint);
              }
            });
          }
        });
      }
    });

    // 转换结果格式
    const knowledgePoints = Object.values(knowledgePointStats)
      .map(stats => ({
        name: stats.name,
        count: stats.count,
        subjects: Array.from(stats.subjects),
        relatedPoints: Array.from(stats.relatedPoints).slice(0, 5) // 限制相关知识点数量
      }))
      .sort((a, b) => b.count - a.count) // 按出现次数排序
      .slice(0, 20); // 限制返回数量

    return createResponse({
      knowledgePoints
    });

  } catch (error) {
    console.error('Knowledge Points Search API Error:', error);
    return createErrorResponse(error, error.status || 500);
  }
}