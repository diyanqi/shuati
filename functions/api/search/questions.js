import { getSupabaseClient, createResponse, createErrorResponse, createPaginationResponse, parsePagination, handleCORS } from '../../lib/database.js';

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

    const { page, pageSize, offset } = parsePagination(searchParams);
    const searchKeyword = query.trim();

    const searchStartTime = Date.now();

    // 构建搜索查询
    let searchQuery = supabase
      .from('questions')
      .select(`
        *,
        organizations(name),
        exams(name, exam_code)
      `, { count: 'exact' })
      .eq('status', 'published');

    // 全文搜索 - 搜索题目内容、日语原文、参考答案
    searchQuery = searchQuery.or(`question_text.ilike.%${searchKeyword}%,japanese_text.ilike.%${searchKeyword}%,reference_answer.ilike.%${searchKeyword}%`);

    // 可选筛选条件
    const subject = searchParams.get('subject');
    if (subject) {
      searchQuery = searchQuery.eq('subject', subject);
    }

    const examId = searchParams.get('examId');
    if (examId) {
      searchQuery = searchQuery.eq('exam_id', examId);
    }

    const difficultyLevel = searchParams.get('difficultyLevel');
    if (difficultyLevel) {
      searchQuery = searchQuery.eq('difficulty_level', difficultyLevel);
    }

    // 按相关度排序（简单的相关度算法）
    searchQuery = searchQuery.order('created_at', { ascending: false });

    const { data, error, count } = await searchQuery.range(offset, offset + pageSize - 1);

    if (error) {
      throw {
        code: 'DATABASE_ERROR',
        message: '搜索题目失败',
        details: { error: error.message }
      };
    }

    const searchTime = (Date.now() - searchStartTime) / 1000;

    // 格式化搜索结果
    const formattedData = data.map(question => ({
      id: question.id,
      organizationId: question.organization_id,
      examId: question.exam_id,
      questionCode: question.question_code,
      subject: question.subject,
      questionType: question.question_type,
      difficultyLevel: question.difficulty_level,
      questionText: question.question_text,
      japaneseText: question.japanese_text,
      pronunciationGuide: question.pronunciation_guide,
      audioUrl: question.audio_url,
      questionImages: question.question_images || [],
      questionAttachments: question.question_attachments || [],
      options: question.options || [],
      correctAnswers: question.correct_answers || [],
      subQuestions: question.sub_questions || [],
      referenceAnswer: question.reference_answer,
      answerImages: question.answer_images || [],
      knowledgePoints: question.knowledge_points || [],
      grammarPoints: question.grammar_points || [],
      vocabularyLevel: question.vocabulary_level,
      kanjiList: question.kanji_list || [],
      totalScore: question.total_score,
      scoringCriteria: question.scoring_criteria,
      questionOrder: question.question_order,
      pageNumber: question.page_number,
      sectionName: question.section_name,
      averageScore: question.average_score,
      correctRate: question.correct_rate,
      discrimination: question.discrimination,
      tags: question.tags || [],
      source: question.source,
      copyrightInfo: question.copyright_info,
      similarQuestions: question.similar_questions || [],
      status: question.status,
      createdAt: question.created_at,
      updatedAt: question.updated_at,
      organizationName: question.organizations?.name,
      examName: question.exams?.name,
      examCode: question.exams?.exam_code
    }));

    // 生成搜索建议（简单的实现）
    const suggestions = [];
    if (count < 5) {
      // 如果结果太少，提供一些建议
      if (searchKeyword.includes('函数')) {
        suggestions.push('二次函数', '三角函数', '指数函数');
      }
      if (searchKeyword.includes('语法')) {
        suggestions.push('日语语法', '英语语法', '语法题');
      }
      if (searchKeyword.includes('物理')) {
        suggestions.push('力学', '电学', '光学');
      }
    }

    const totalPages = Math.ceil(count / pageSize);
    const pagination = {
      page,
      pageSize,
      total: count,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    };

    const searchInfo = {
      query: searchKeyword,
      totalResults: count,
      searchTime: Math.round(searchTime * 1000) / 1000, // 保留3位小数
      suggestions
    };

    const responseData = {
      items: formattedData,
      searchInfo,
      pagination
    };

    return createResponse(responseData);

  } catch (error) {
    console.error('Search Questions API Error:', error);
    return createErrorResponse(error, error.status || 500);
  }
}