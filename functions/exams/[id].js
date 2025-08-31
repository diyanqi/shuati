import { getSupabaseClient, createResponse, createErrorResponse, handleCORS } from '../lib/database.js';
import { validateExam } from '../lib/validators.js';

export async function onRequest({ request, params, env }) {
  const corsResponse = await handleCORS(request);
  if (corsResponse) return corsResponse;

  try {
    const supabase = getSupabaseClient(env);
    const { id } = params;

    if (request.method === 'GET') {
      const { data, error } = await supabase
        .from('exams')
        .select(`
          *,
          organizations(name),
          questions(id, subject)
        `)
        .eq('id', id)
        .single();

      if (error || !data) {
        return createErrorResponse({
          code: 'NOT_FOUND',
          message: '考试不存在'
        }, 404);
      }

      // 统计各科目题目数量
      const subjectCounts = {};
      const subjects = ['语文', '数学', '英语', '物理', '化学', '生物', '政治', '历史', '地理', '技术', '日语'];
      
      subjects.forEach(subject => {
        subjectCounts[subject] = data.questions?.filter(q => q.subject === subject).length || 0;
      });

      // 构建科目信息
      const subjectsInfo = [];
      const subjectUrls = {
        '语文': data.chinese_pdf_url,
        '数学': data.math_pdf_url,
        '英语': data.english_pdf_url,
        '物理': data.physics_pdf_url,
        '化学': data.chemistry_pdf_url,
        '生物': data.biology_pdf_url,
        '政治': data.politics_pdf_url,
        '历史': data.history_pdf_url,
        '地理': data.geography_pdf_url,
        '技术': data.technology_pdf_url,
        '日语': data.japanese_pdf_url
      };

      subjects.forEach(subject => {
        if (subjectUrls[subject]) {
          subjectsInfo.push({
            subject,
            pdfUrl: subjectUrls[subject],
            duration: data.exam_duration?.[subject] || null,
            totalScore: data.total_score?.[subject] || null,
            questionCount: subjectCounts[subject]
          });
        }
      });

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
        subjects: subjectsInfo,
        additionalSubjects: data.additional_subjects || {},
        examDuration: data.exam_duration || {},
        totalScore: data.total_score || {},
        difficultyLevel: data.difficulty_level,
        status: data.status,
        totalQuestions: data.questions?.length || 0,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      return createResponse(formattedData);
    }

    if (request.method === 'PUT' || request.method === 'PATCH') {
      const body = await request.json();
      
      if (request.method === 'PUT') {
        validateExam(body);
      }

      const updateData = {};
      if (body.organizationId) updateData.organization_id = body.organizationId;
      if (body.examCode) updateData.exam_code = body.examCode;
      if (body.name) updateData.name = body.name;
      if (body.description !== undefined) updateData.description = body.description;
      if (body.examType) updateData.exam_type = body.examType;
      if (body.gradeLevel !== undefined) updateData.grade_level = body.gradeLevel;
      if (body.startDate) updateData.start_date = body.startDate;
      if (body.endDate) updateData.end_date = body.endDate;
      if (body.startTime !== undefined) updateData.start_time = body.startTime;
      if (body.endTime !== undefined) updateData.end_time = body.endTime;
      if (body.difficultyLevel !== undefined) updateData.difficulty_level = body.difficultyLevel;
      if (body.status) updateData.status = body.status;

      // PDF URLs
      if (body.chinesePdfUrl !== undefined) updateData.chinese_pdf_url = body.chinesePdfUrl;
      if (body.mathPdfUrl !== undefined) updateData.math_pdf_url = body.mathPdfUrl;
      if (body.englishPdfUrl !== undefined) updateData.english_pdf_url = body.englishPdfUrl;
      if (body.physicsPdfUrl !== undefined) updateData.physics_pdf_url = body.physicsPdfUrl;
      if (body.chemistryPdfUrl !== undefined) updateData.chemistry_pdf_url = body.chemistryPdfUrl;
      if (body.biologyPdfUrl !== undefined) updateData.biology_pdf_url = body.biologyPdfUrl;
      if (body.politicsPdfUrl !== undefined) updateData.politics_pdf_url = body.politicsPdfUrl;
      if (body.historyPdfUrl !== undefined) updateData.history_pdf_url = body.historyPdfUrl;
      if (body.geographyPdfUrl !== undefined) updateData.geography_pdf_url = body.geographyPdfUrl;
      if (body.technologyPdfUrl !== undefined) updateData.technology_pdf_url = body.technologyPdfUrl;
      if (body.japanesePdfUrl !== undefined) updateData.japanese_pdf_url = body.japanesePdfUrl;

      // JSONB fields
      if (body.additionalSubjects !== undefined) updateData.additional_subjects = body.additionalSubjects;
      if (body.examDuration !== undefined) updateData.exam_duration = body.examDuration;
      if (body.totalScore !== undefined) updateData.total_score = body.totalScore;

      const { data, error } = await supabase
        .from('exams')
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          organizations(name),
          questions(id, subject)
        `)
        .single();

      if (error) {
        throw {
          code: 'DATABASE_ERROR',
          message: '更新考试失败',
          details: { error: error.message }
        };
      }

      // 格式化返回数据（同GET方法）
      const subjectCounts = {};
      const subjects = ['语文', '数学', '英语', '物理', '化学', '生物', '政治', '历史', '地理', '技术', '日语'];
      
      subjects.forEach(subject => {
        subjectCounts[subject] = data.questions?.filter(q => q.subject === subject).length || 0;
      });

      const subjectsInfo = [];
      const subjectUrls = {
        '语文': data.chinese_pdf_url,
        '数学': data.math_pdf_url,
        '英语': data.english_pdf_url,
        '物理': data.physics_pdf_url,
        '化学': data.chemistry_pdf_url,
        '生物': data.biology_pdf_url,
        '政治': data.politics_pdf_url,
        '历史': data.history_pdf_url,
        '地理': data.geography_pdf_url,
        '技术': data.technology_pdf_url,
        '日语': data.japanese_pdf_url
      };

      subjects.forEach(subject => {
        if (subjectUrls[subject]) {
          subjectsInfo.push({
            subject,
            pdfUrl: subjectUrls[subject],
            duration: data.exam_duration?.[subject] || null,
            totalScore: data.total_score?.[subject] || null,
            questionCount: subjectCounts[subject]
          });
        }
      });

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
        subjects: subjectsInfo,
        additionalSubjects: data.additional_subjects || {},
        examDuration: data.exam_duration || {},
        totalScore: data.total_score || {},
        difficultyLevel: data.difficulty_level,
        status: data.status,
        totalQuestions: data.questions?.length || 0,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      return createResponse(formattedData, true, '考试更新成功');
    }

    if (request.method === 'DELETE') {
      // 检查是否有关联的题目
      const { count } = await supabase
        .from('questions')
        .select('*', { count: 'exact', head: true })
        .eq('exam_id', id);

      if (count > 0) {
        return createErrorResponse({
          code: 'CONFLICT',
          message: '无法删除考试，存在关联的题目'
        }, 409);
      }

      const { error } = await supabase
        .from('exams')
        .delete()
        .eq('id', id);

      if (error) {
        throw {
          code: 'DATABASE_ERROR',
          message: '删除考试失败',
          details: { error: error.message }
        };
      }

      return createResponse(null, true, '考试删除成功');
    }

    return createErrorResponse({
      code: 'METHOD_NOT_ALLOWED',
      message: '不支持的请求方法'
    }, 405);

  } catch (error) {
    console.error('Exam Detail API Error:', error);
    return createErrorResponse(error, error.status || 500);
  }
}