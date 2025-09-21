import { getSupabaseClient, createResponse, createErrorResponse, createPaginationResponse, parsePagination, handleCORS } from '../../lib/database.js';
import { validateExam } from '../../lib/validators.js';

export async function onRequest({ request, env }) {
  const corsResponse = await handleCORS(request);
  if (corsResponse) return corsResponse;

  try {
    const supabase = getSupabaseClient(env);
    const url = new URL(request.url);
    const searchParams = url.searchParams;

    if (request.method === 'GET') {
      const { page = 1, pageSize = 20, offset = 0 } = parsePagination(searchParams ?? new URLSearchParams());
      
      // 构建查询，包含组织信息和题目统计
      let query = supabase
        .from('exams')
        .select(`
          *,
          organizations!inner(name),
          questions(id, subject)
        `, { count: 'exact' })
        .order('created_at', { ascending: false });

      // 各种过滤条件
      const organizationId = searchParams.get('organizationId');
      if (organizationId) {
        query = query.eq('organization_id', organizationId);
      }

      const examType = searchParams.get('examType');
      if (examType) {
        query = query.eq('exam_type', examType);
      }

      const gradeLevel = searchParams.get('gradeLevel');
      if (gradeLevel) {
        query = query.eq('grade_level', gradeLevel);
      }

      const status = searchParams.get('status');
      if (status) {
        query = query.eq('status', status);
      }

      const search = searchParams.get('search');
      if (search) {
        query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,exam_code.ilike.%${search}%`);
      }

      const startDate = searchParams.get('startDate');
      const endDate = searchParams.get('endDate');
      if (startDate) {
        query = query.gte('start_date', startDate);
      }
      if (endDate) {
        query = query.lte('end_date', endDate);
      }

      const { data, error, count } = await query.range(offset, offset + pageSize - 1);

      if (error) {
        throw {
          code: 'DATABASE_ERROR',
          message: '查询考试列表失败',
          details: { error: error.message }
        };
      }

      // 格式化数据
      const formattedData = data.map(exam => {
        // 统计各科目题目数量
        const subjectCounts = {};
        const subjects = ['语文', '数学', '英语', '物理', '化学', '生物', '政治', '历史', '地理', '技术', '日语'];
        
        subjects.forEach(subject => {
          subjectCounts[subject] = exam.questions?.filter(q => q.subject === subject).length || 0;
        });

        // 构建科目信息
        const subjectsInfo = [];
        if (exam.chinese_pdf_url) {
          subjectsInfo.push({
            subject: '语文',
            pdfUrl: exam.chinese_pdf_url,
            duration: exam.exam_duration?.语文 || null,
            totalScore: exam.total_score?.语文 || null,
            questionCount: subjectCounts['语文']
          });
        }
        if (exam.math_pdf_url) {
          subjectsInfo.push({
            subject: '数学',
            pdfUrl: exam.math_pdf_url,
            duration: exam.exam_duration?.数学 || null,
            totalScore: exam.total_score?.数学 || null,
            questionCount: subjectCounts['数学']
          });
        }
        if (exam.english_pdf_url) {
          subjectsInfo.push({
            subject: '英语',
            pdfUrl: exam.english_pdf_url,
            duration: exam.exam_duration?.英语 || null,
            totalScore: exam.total_score?.英语 || null,
            questionCount: subjectCounts['英语']
          });
        }
        if (exam.physics_pdf_url) {
          subjectsInfo.push({
            subject: '物理',
            pdfUrl: exam.physics_pdf_url,
            duration: exam.exam_duration?.物理 || null,
            totalScore: exam.total_score?.物理 || null,
            questionCount: subjectCounts['物理']
          });
        }
        if (exam.chemistry_pdf_url) {
          subjectsInfo.push({
            subject: '化学',
            pdfUrl: exam.chemistry_pdf_url,
            duration: exam.exam_duration?.化学 || null,
            totalScore: exam.total_score?.化学 || null,
            questionCount: subjectCounts['化学']
          });
        }
        if (exam.biology_pdf_url) {
          subjectsInfo.push({
            subject: '生物',
            pdfUrl: exam.biology_pdf_url,
            duration: exam.exam_duration?.生物 || null,
            totalScore: exam.total_score?.生物 || null,
            questionCount: subjectCounts['生物']
          });
        }
        if (exam.politics_pdf_url) {
          subjectsInfo.push({
            subject: '政治',
            pdfUrl: exam.politics_pdf_url,
            duration: exam.exam_duration?.政治 || null,
            totalScore: exam.total_score?.政治 || null,
            questionCount: subjectCounts['政治']
          });
        }
        if (exam.history_pdf_url) {
          subjectsInfo.push({
            subject: '历史',
            pdfUrl: exam.history_pdf_url,
            duration: exam.exam_duration?.历史 || null,
            totalScore: exam.total_score?.历史 || null,
            questionCount: subjectCounts['历史']
          });
        }
        if (exam.geography_pdf_url) {
          subjectsInfo.push({
            subject: '地理',
            pdfUrl: exam.geography_pdf_url,
            duration: exam.exam_duration?.地理 || null,
            totalScore: exam.total_score?.地理 || null,
            questionCount: subjectCounts['地理']
          });
        }
        if (exam.technology_pdf_url) {
          subjectsInfo.push({
            subject: '技术',
            pdfUrl: exam.technology_pdf_url,
            duration: exam.exam_duration?.技术 || null,
            totalScore: exam.total_score?.技术 || null,
            questionCount: subjectCounts['技术']
          });
        }
        if (exam.japanese_pdf_url) {
          subjectsInfo.push({
            subject: '日语',
            pdfUrl: exam.japanese_pdf_url,
            duration: exam.exam_duration?.日语 || null,
            totalScore: exam.total_score?.日语 || null,
            questionCount: subjectCounts['日语']
          });
        }

        return {
          id: exam.id,
          organizationId: exam.organization_id,
          organizationName: exam.organizations.name,
          examCode: exam.exam_code,
          name: exam.name,
          description: exam.description,
          examType: exam.exam_type,
          gradeLevel: exam.grade_level,
          startDate: exam.start_date,
          endDate: exam.end_date,
          startTime: exam.start_time,
          endTime: exam.end_time,
          subjects: subjectsInfo,
          difficultyLevel: exam.difficulty_level,
          status: exam.status,
          totalQuestions: exam.questions?.length || 0,
          createdAt: exam.created_at,
          updatedAt: exam.updated_at
        };
      });

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
      
      validateExam(body);

      const insertData = {
        organization_id: body.organizationId,
        exam_code: body.examCode,
        name: body.name,
        description: body.description || null,
        exam_type: body.examType || '联考',
        grade_level: body.gradeLevel || null,
        start_date: body.startDate,
        end_date: body.endDate,
        start_time: body.startTime || null,
        end_time: body.endTime || null,
        difficulty_level: body.difficultyLevel || null,
        status: body.status || 'draft'
      };

      // 处理各科PDF URL
      if (body.chinesePdfUrl) insertData.chinese_pdf_url = body.chinesePdfUrl;
      if (body.mathPdfUrl) insertData.math_pdf_url = body.mathPdfUrl;
      if (body.englishPdfUrl) insertData.english_pdf_url = body.englishPdfUrl;
      if (body.physicsPdfUrl) insertData.physics_pdf_url = body.physicsPdfUrl;
      if (body.chemistryPdfUrl) insertData.chemistry_pdf_url = body.chemistryPdfUrl;
      if (body.biologyPdfUrl) insertData.biology_pdf_url = body.biologyPdfUrl;
      if (body.politicsPdfUrl) insertData.politics_pdf_url = body.politicsPdfUrl;
      if (body.historyPdfUrl) insertData.history_pdf_url = body.historyPdfUrl;
      if (body.geographyPdfUrl) insertData.geography_pdf_url = body.geographyPdfUrl;
      if (body.technologyPdfUrl) insertData.technology_pdf_url = body.technologyPdfUrl;
      if (body.japanesePdfUrl) insertData.japanese_pdf_url = body.japanesePdfUrl;

      // 处理JSONB字段
      if (body.additionalSubjects) insertData.additional_subjects = body.additionalSubjects;
      if (body.examDuration) insertData.exam_duration = body.examDuration;
      if (body.totalScore) insertData.total_score = body.totalScore;

      const { data, error } = await supabase
        .from('exams')
        .insert(insertData)
        .select(`
          *,
          organizations(name)
        `)
        .single();

      if (error) {
        throw {
          code: 'DATABASE_ERROR',
          message: '创建考试失败',
          details: { error: error.message }
        };
      }

      const formattedData = {
        id: data.id,
        organizationId: data.organization_id,
        organizationName: data.organizations.name,
        examCode: data.exam_code,
        name: data.name,
        description: data.description,
        examType: data.exam_type,
        gradeLevel: data.grade_level,
        startDate: data.start_date,
        endDate: data.end_date,
        startTime: data.start_time,
        endTime: data.end_time,
        subjects: [],
        difficultyLevel: data.difficulty_level,
        status: data.status,
        totalQuestions: 0,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      return createResponse(formattedData, true, '考试创建成功', 201);
    }

    return createErrorResponse({
      code: 'METHOD_NOT_ALLOWED',
      message: '不支持的请求方法'
    }, 405);

  } catch (error) {
    console.error('Exams API Error:', error);
    return createErrorResponse(error, error.status || 500);
  }
}