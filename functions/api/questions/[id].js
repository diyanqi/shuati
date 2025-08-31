import { getSupabaseClient, createResponse, createErrorResponse, handleCORS } from '../../lib/database.js';
import { validateQuestion } from '../../lib/validators.js';

export async function onRequest({ request, params, env }) {
  const corsResponse = await handleCORS(request);
  if (corsResponse) return corsResponse;

  try {
    const supabase = getSupabaseClient(env);
    const { id } = params;

    if (request.method === 'GET') {
      const { data, error } = await supabase
        .from('questions')
        .select(`
          *,
          organizations(name),
          exams(name, exam_code)
        `)
        .eq('id', id)
        .single();

      if (error || !data) {
        return createErrorResponse({
          code: 'NOT_FOUND',
          message: '题目不存在'
        }, 404);
      }

      const formattedData = {
        id: data.id,
        organizationId: data.organization_id,
        examId: data.exam_id,
        questionCode: data.question_code,
        subject: data.subject,
        questionType: data.question_type,
        difficultyLevel: data.difficulty_level,
        questionText: data.question_text,
        japaneseText: data.japanese_text,
        pronunciationGuide: data.pronunciation_guide,
        audioUrl: data.audio_url,
        questionImages: data.question_images || [],
        questionAttachments: data.question_attachments || [],
        options: data.options || [],
        correctAnswers: data.correct_answers || [],
        subQuestions: data.sub_questions || [],
        referenceAnswer: data.reference_answer,
        answerImages: data.answer_images || [],
        knowledgePoints: data.knowledge_points || [],
        grammarPoints: data.grammar_points || [],
        vocabularyLevel: data.vocabulary_level,
        kanjiList: data.kanji_list || [],
        totalScore: data.total_score,
        scoringCriteria: data.scoring_criteria,
        questionOrder: data.question_order,
        pageNumber: data.page_number,
        sectionName: data.section_name,
        averageScore: data.average_score,
        correctRate: data.correct_rate,
        discrimination: data.discrimination,
        tags: data.tags || [],
        source: data.source,
        copyrightInfo: data.copyright_info,
        similarQuestions: data.similar_questions || [],
        status: data.status,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        organizationName: data.organizations?.name,
        examName: data.exams?.name,
        examCode: data.exams?.exam_code
      };

      return createResponse(formattedData);
    }

    if (request.method === 'PUT' || request.method === 'PATCH') {
      const body = await request.json();
      
      if (request.method === 'PUT') {
        validateQuestion(body);
      }

      const updateData = {};
      if (body.organizationId) updateData.organization_id = body.organizationId;
      if (body.examId) updateData.exam_id = body.examId;
      if (body.questionCode !== undefined) updateData.question_code = body.questionCode;
      if (body.subject) updateData.subject = body.subject;
      if (body.questionType) updateData.question_type = body.questionType;
      if (body.difficultyLevel !== undefined) updateData.difficulty_level = body.difficultyLevel;
      if (body.questionText) updateData.question_text = body.questionText;
      if (body.japaneseText !== undefined) updateData.japanese_text = body.japaneseText;
      if (body.pronunciationGuide !== undefined) updateData.pronunciation_guide = body.pronunciationGuide;
      if (body.audioUrl !== undefined) updateData.audio_url = body.audioUrl;
      if (body.questionImages !== undefined) updateData.question_images = body.questionImages;
      if (body.questionAttachments !== undefined) updateData.question_attachments = body.questionAttachments;
      if (body.options !== undefined) updateData.options = body.options;
      if (body.correctAnswers !== undefined) updateData.correct_answers = body.correctAnswers;
      if (body.subQuestions !== undefined) updateData.sub_questions = body.subQuestions;
      if (body.referenceAnswer !== undefined) updateData.reference_answer = body.referenceAnswer;
      if (body.answerImages !== undefined) updateData.answer_images = body.answerImages;
      if (body.knowledgePoints !== undefined) updateData.knowledge_points = body.knowledgePoints;
      if (body.grammarPoints !== undefined) updateData.grammar_points = body.grammarPoints;
      if (body.vocabularyLevel !== undefined) updateData.vocabulary_level = body.vocabularyLevel;
      if (body.kanjiList !== undefined) updateData.kanji_list = body.kanjiList;
      if (body.totalScore !== undefined) updateData.total_score = body.totalScore;
      if (body.scoringCriteria !== undefined) updateData.scoring_criteria = body.scoringCriteria;
      if (body.questionOrder !== undefined) updateData.question_order = body.questionOrder;
      if (body.pageNumber !== undefined) updateData.page_number = body.pageNumber;
      if (body.sectionName !== undefined) updateData.section_name = body.sectionName;
      if (body.averageScore !== undefined) updateData.average_score = body.averageScore;
      if (body.correctRate !== undefined) updateData.correct_rate = body.correctRate;
      if (body.discrimination !== undefined) updateData.discrimination = body.discrimination;
      if (body.tags !== undefined) updateData.tags = body.tags;
      if (body.source !== undefined) updateData.source = body.source;
      if (body.copyrightInfo !== undefined) updateData.copyright_info = body.copyrightInfo;
      if (body.similarQuestions !== undefined) updateData.similar_questions = body.similarQuestions;
      if (body.status) updateData.status = body.status;

      const { data, error } = await supabase
        .from('questions')
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          organizations(name),
          exams(name, exam_code)
        `)
        .single();

      if (error) {
        throw {
          code: 'DATABASE_ERROR',
          message: '更新题目失败',
          details: { error: error.message }
        };
      }

      const formattedData = {
        id: data.id,
        organizationId: data.organization_id,
        examId: data.exam_id,
        questionCode: data.question_code,
        subject: data.subject,
        questionType: data.question_type,
        difficultyLevel: data.difficulty_level,
        questionText: data.question_text,
        japaneseText: data.japanese_text,
        pronunciationGuide: data.pronunciation_guide,
        audioUrl: data.audio_url,
        questionImages: data.question_images || [],
        questionAttachments: data.question_attachments || [],
        options: data.options || [],
        correctAnswers: data.correct_answers || [],
        subQuestions: data.sub_questions || [],
        referenceAnswer: data.reference_answer,
        answerImages: data.answer_images || [],
        knowledgePoints: data.knowledge_points || [],
        grammarPoints: data.grammar_points || [],
        vocabularyLevel: data.vocabulary_level,
        kanjiList: data.kanji_list || [],
        totalScore: data.total_score,
        scoringCriteria: data.scoring_criteria,
        questionOrder: data.question_order,
        pageNumber: data.page_number,
        sectionName: data.section_name,
        averageScore: data.average_score,
        correctRate: data.correct_rate,
        discrimination: data.discrimination,
        tags: data.tags || [],
        source: data.source,
        copyrightInfo: data.copyright_info,
        similarQuestions: data.similar_questions || [],
        status: data.status,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        organizationName: data.organizations?.name,
        examName: data.exams?.name,
        examCode: data.exams?.exam_code
      };

      return createResponse(formattedData, true, '题目更新成功');
    }

    if (request.method === 'DELETE') {
      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', id);

      if (error) {
        throw {
          code: 'DATABASE_ERROR',
          message: '删除题目失败',
          details: { error: error.message }
        };
      }

      return createResponse(null, true, '题目删除成功');
    }

    return createErrorResponse({
      code: 'METHOD_NOT_ALLOWED',
      message: '不支持的请求方法'
    }, 405);

  } catch (error) {
    console.error('Question Detail API Error:', error);
    return createErrorResponse(error, error.status || 500);
  }
}