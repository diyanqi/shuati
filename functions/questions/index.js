import { getSupabaseClient, createResponse, createErrorResponse, createPaginationResponse, parsePagination, handleCORS } from '../lib/database.js';
import { validateQuestion } from '../lib/validators.js';

export async function onRequest({ request, env }) {
  const corsResponse = await handleCORS(request);
  if (corsResponse) return corsResponse;

  try {
    const supabase = getSupabaseClient(env);
    const url = new URL(request.url);
    const searchParams = url.searchParams;

    if (request.method === 'GET') {
      const { page, pageSize, offset } = parsePagination(searchParams);
      
      let query = supabase
        .from('questions')
        .select(`
          *,
          organizations(name),
          exams(name, exam_code)
        `, { count: 'exact' })
        .order('created_at', { ascending: false });

      // 各种筛选条件
      const examId = searchParams.get('examId');
      if (examId) {
        query = query.eq('exam_id', examId);
      }

      const organizationId = searchParams.get('organizationId');
      if (organizationId) {
        query = query.eq('organization_id', organizationId);
      }

      const subject = searchParams.get('subject');
      if (subject) {
        query = query.eq('subject', subject);
      }

      const questionType = searchParams.get('questionType');
      if (questionType) {
        query = query.eq('question_type', questionType);
      }

      const difficultyLevel = searchParams.get('difficultyLevel');
      if (difficultyLevel) {
        query = query.eq('difficulty_level', difficultyLevel);
      }

      const vocabularyLevel = searchParams.get('vocabularyLevel');
      if (vocabularyLevel) {
        query = query.eq('vocabulary_level', vocabularyLevel);
      }

      const hasAudio = searchParams.get('hasAudio');
      if (hasAudio === 'true') {
        query = query.not('audio_url', 'is', null);
      } else if (hasAudio === 'false') {
        query = query.is('audio_url', null);
      }

      const search = searchParams.get('search');
      if (search) {
        query = query.or(`question_text.ilike.%${search}%,japanese_text.ilike.%${search}%,reference_answer.ilike.%${search}%`);
      }

      // 知识点筛选
      const knowledgePoints = searchParams.get('knowledgePoints');
      if (knowledgePoints) {
        const points = knowledgePoints.split(',');
        points.forEach(point => {
          query = query.contains('knowledge_points', [point.trim()]);
        });
      }

      // 标签筛选
      const tags = searchParams.get('tags');
      if (tags) {
        const tagList = tags.split(',');
        tagList.forEach(tag => {
          query = query.contains('tags', [tag.trim()]);
        });
      }

      const { data, error, count } = await query.range(offset, offset + pageSize - 1);

      if (error) {
        throw {
          code: 'DATABASE_ERROR',
          message: '查询题目列表失败',
          details: { error: error.message }
        };
      }

      // 格式化数据
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
        // 关联数据
        organizationName: question.organizations?.name,
        examName: question.exams?.name,
        examCode: question.exams?.exam_code
      }));

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
      
      validateQuestion(body);

      const insertData = {
        organization_id: body.organizationId,
        exam_id: body.examId,
        question_code: body.questionCode || null,
        subject: body.subject,
        question_type: body.questionType,
        difficulty_level: body.difficultyLevel || null,
        question_text: body.questionText,
        japanese_text: body.japaneseText || null,
        pronunciation_guide: body.pronunciationGuide || null,
        audio_url: body.audioUrl || null,
        question_images: body.questionImages || [],
        question_attachments: body.questionAttachments || [],
        options: body.options || [],
        correct_answers: body.correctAnswers || [],
        sub_questions: body.subQuestions || [],
        reference_answer: body.referenceAnswer || null,
        answer_images: body.answerImages || [],
        knowledge_points: body.knowledgePoints || [],
        grammar_points: body.grammarPoints || [],
        vocabulary_level: body.vocabularyLevel || null,
        kanji_list: body.kanjiList || [],
        total_score: body.totalScore || 0,
        scoring_criteria: body.scoringCriteria || null,
        question_order: body.questionOrder || null,
        page_number: body.pageNumber || null,
        section_name: body.sectionName || null,
        tags: body.tags || [],
        source: body.source || null,
        copyright_info: body.copyrightInfo || null,
        similar_questions: body.similarQuestions || [],
        status: body.status || 'draft'
      };

      const { data, error } = await supabase
        .from('questions')
        .insert(insertData)
        .select(`
          *,
          organizations(name),
          exams(name, exam_code)
        `)
        .single();

      if (error) {
        throw {
          code: 'DATABASE_ERROR',
          message: '创建题目失败',
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

      return createResponse(formattedData, true, '题目创建成功', 201);
    }

    return createErrorResponse({
      code: 'METHOD_NOT_ALLOWED',
      message: '不支持的请求方法'
    }, 405);

  } catch (error) {
    console.error('Questions API Error:', error);
    return createErrorResponse(error, error.status || 500);
  }
}