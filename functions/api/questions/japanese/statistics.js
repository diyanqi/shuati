import { getSupabaseClient, createResponse, createErrorResponse, handleCORS } from '../../../lib/database.js';

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

    let query = supabase
      .from('questions')
      .select('*')
      .eq('subject', '日语')
      .eq('status', 'published');

    // 可选的筛选条件
    const examId = searchParams.get('examId');
    if (examId) {
      query = query.eq('exam_id', examId);
    }

    const organizationId = searchParams.get('organizationId');
    if (organizationId) {
      query = query.eq('organization_id', organizationId);
    }

    const vocabularyLevel = searchParams.get('vocabularyLevel');
    if (vocabularyLevel) {
      query = query.eq('vocabulary_level', vocabularyLevel);
    }

    const { data, error } = await query;

    if (error) {
      throw {
        code: 'DATABASE_ERROR',
        message: '查询日语题目统计失败',
        details: { error: error.message }
      };
    }

    // 统计各种分布
    const levelDistribution = {
      'N1': 0,
      'N2': 0,
      'N3': 0,
      'N4': 0,
      'N5': 0,
      '其他': 0
    };

    const typeDistribution = {};
    let audioQuestions = 0;
    let questionsWithJapaneseText = 0;
    let totalGrammarPoints = 0;
    let totalKanjiCount = 0;

    data.forEach(question => {
      // 等级分布统计
      const level = question.vocabulary_level || '其他';
      if (levelDistribution.hasOwnProperty(level)) {
        levelDistribution[level]++;
      } else {
        levelDistribution['其他']++;
      }

      // 题型分布统计
      const type = question.question_type;
      if (type) {
        if (!typeDistribution[type]) {
          typeDistribution[type] = 0;
        }
        typeDistribution[type]++;
      }

      // 音频题目统计
      if (question.audio_url) {
        audioQuestions++;
      }

      // 包含日语原文的题目
      if (question.japanese_text) {
        questionsWithJapaneseText++;
      }

      // 语法点统计
      if (question.grammar_points && Array.isArray(question.grammar_points)) {
        totalGrammarPoints += question.grammar_points.length;
      }

      // 汉字统计
      if (question.kanji_list && Array.isArray(question.kanji_list)) {
        totalKanjiCount += question.kanji_list.length;
      }
    });

    const totalQuestions = data.length;
    const averageGrammarPoints = totalQuestions > 0 ? (totalGrammarPoints / totalQuestions) : 0;
    const averageKanjiCount = totalQuestions > 0 ? (totalKanjiCount / totalQuestions) : 0;

    const statisticsData = {
      totalQuestions,
      levelDistribution,
      typeDistribution,
      audioQuestions,
      questionsWithJapaneseText,
      averageGrammarPoints: Math.round(averageGrammarPoints * 10) / 10,
      averageKanjiCount: Math.round(averageKanjiCount * 10) / 10
    };

    return createResponse(statisticsData);

  } catch (error) {
    console.error('Japanese Statistics API Error:', error);
    return createErrorResponse(error, error.status || 500);
  }
}