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

    // 并行查询各项统计数据
    const [
      organizationsResult,
      examsResult,
      questionsResult,
      activeExamsResult,
      recentActivitiesResult
    ] = await Promise.all([
      // 组织总数
      supabase.from('organizations').select('*', { count: 'exact', head: true }),
      
      // 考试总数
      supabase.from('exams').select('*', { count: 'exact', head: true }),
      
      // 题目总数和学科分布
      supabase.from('questions').select('subject').eq('status', 'published'),
      
      // 活跃考试数（已发布状态）
      supabase.from('exams').select('*', { count: 'exact', head: true }).eq('status', 'published'),
      
      // 最近活动（最近创建的考试）
      supabase
        .from('exams')
        .select(`
          id,
          name,
          exam_type,
          created_at,
          organizations(name)
        `)
        .order('created_at', { ascending: false })
        .limit(5)
    ]);

    // 检查错误
    if (organizationsResult.error) {
      throw {
        code: 'DATABASE_ERROR',
        message: '查询组织统计失败',
        details: { error: organizationsResult.error.message }
      };
    }

    if (examsResult.error) {
      throw {
        code: 'DATABASE_ERROR',
        message: '查询考试统计失败',
        details: { error: examsResult.error.message }
      };
    }

    if (questionsResult.error) {
      throw {
        code: 'DATABASE_ERROR',
        message: '查询题目统计失败',
        details: { error: questionsResult.error.message }
      };
    }

    if (activeExamsResult.error) {
      throw {
        code: 'DATABASE_ERROR',
        message: '查询活跃考试统计失败',
        details: { error: activeExamsResult.error.message }
      };
    }

    if (recentActivitiesResult.error) {
      throw {
        code: 'DATABASE_ERROR',
        message: '查询最近活动失败',
        details: { error: recentActivitiesResult.error.message }
      };
    }

    // 统计学科分布
    const subjectDistribution = {
      '语文': 0,
      '数学': 0,
      '英语': 0,
      '物理': 0,
      '化学': 0,
      '生物': 0,
      '政治': 0,
      '历史': 0,
      '地理': 0,
      '技术': 0,
      '日语': 0,
      '其他': 0
    };

    questionsResult.data.forEach(question => {
      const subject = question.subject;
      if (subjectDistribution.hasOwnProperty(subject)) {
        subjectDistribution[subject]++;
      } else {
        subjectDistribution['其他']++;
      }
    });

    // 格式化最近活动
    const recentActivity = recentActivitiesResult.data.map(exam => ({
      type: 'exam_created',
      title: '创建了新考试',
      description: `${exam.name} (${exam.exam_type})`,
      organizationName: exam.organizations?.name,
      timestamp: exam.created_at
    }));

    const overviewData = {
      totalOrganizations: organizationsResult.count || 0,
      totalExams: examsResult.count || 0,
      totalQuestions: questionsResult.data.length,
      activeExams: activeExamsResult.count || 0,
      subjectDistribution,
      recentActivity
    };

    return createResponse(overviewData);

  } catch (error) {
    console.error('Statistics Overview API Error:', error);
    return createErrorResponse(error, error.status || 500);
  }
}