import { getSupabaseClient, createResponse, createErrorResponse, handleCORS } from '../../lib/database.js';

export async function onRequest({ request, params, env }) {
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
    const { id } = params;

    // 获取考试基本信息
    const { data: examData, error: examError } = await supabase
      .from('exams')
      .select(`
        *,
        organizations(name)
      `)
      .eq('id', id)
      .single();

    if (examError || !examData) {
      return createErrorResponse({
        code: 'NOT_FOUND',
        message: '考试不存在'
      }, 404);
    }

    // 获取题目统计信息
    const { data: questionsData, error: questionsError } = await supabase
      .from('questions')
      .select('subject, question_type, difficulty_level')
      .eq('exam_id', id)
      .eq('status', 'published');

    if (questionsError) {
      throw {
        code: 'DATABASE_ERROR',
        message: '查询题目统计失败',
        details: { error: questionsError.message }
      };
    }

    // 统计各科题目数量
    const subjectStatistics = {
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
      '日语': 0
    };

    // 统计难度分布
    const difficultyDistribution = {
      '容易': 0,
      '中等': 0,
      '困难': 0,
      '极难': 0
    };

    // 统计题型分布
    const typeDistribution = {};

    questionsData.forEach(question => {
      // 科目统计
      if (subjectStatistics.hasOwnProperty(question.subject)) {
        subjectStatistics[question.subject]++;
      }

      // 难度统计
      if (question.difficulty_level && difficultyDistribution.hasOwnProperty(question.difficulty_level)) {
        difficultyDistribution[question.difficulty_level]++;
      }

      // 题型统计
      if (question.question_type) {
        if (!typeDistribution[question.question_type]) {
          typeDistribution[question.question_type] = 0;
        }
        typeDistribution[question.question_type]++;
      }
    });

    const overviewData = {
      id: examData.id,
      examCode: examData.exam_code,
      examName: examData.name,
      organizationName: examData.organizations.name,
      startDate: examData.start_date,
      endDate: examData.end_date,
      gradeLevel: examData.grade_level,
      examType: examData.exam_type,
      totalQuestions: questionsData.length,
      subjectStatistics,
      difficultyDistribution,
      typeDistribution
    };

    return createResponse(overviewData);

  } catch (error) {
    console.error('Exam Overview API Error:', error);
    return createErrorResponse(error, error.status || 500);
  }
}