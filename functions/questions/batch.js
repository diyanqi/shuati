import { getSupabaseClient, createResponse, createErrorResponse, handleCORS } from '../lib/database.js';

export async function onRequest({ request, env }) {
  const corsResponse = await handleCORS(request);
  if (corsResponse) return corsResponse;

  if (request.method !== 'POST') {
    return createErrorResponse({
      code: 'METHOD_NOT_ALLOWED',
      message: '不支持的请求方法'
    }, 405);
  }

  try {
    const supabase = getSupabaseClient(env);
    const body = await request.json();

    const { action, questionIds, updateData } = body;

    if (!action || !questionIds || !Array.isArray(questionIds) || questionIds.length === 0) {
      return createErrorResponse({
        code: 'VALIDATION_ERROR',
        message: '缺少必需的参数：action和questionIds'
      });
    }

    switch (action) {
      case 'delete':
        const { error: deleteError } = await supabase
          .from('questions')
          .delete()
          .in('id', questionIds);

        if (deleteError) {
          throw {
            code: 'DATABASE_ERROR',
            message: '批量删除题目失败',
            details: { error: deleteError.message }
          };
        }

        return createResponse({
          deletedCount: questionIds.length,
          deletedIds: questionIds
        }, true, `成功删除${questionIds.length}道题目`);

      case 'update':
        if (!updateData || typeof updateData !== 'object') {
          return createErrorResponse({
            code: 'VALIDATION_ERROR',
            message: '批量更新需要提供updateData'
          });
        }

        // 转换字段名
        const dbUpdateData = {};
        if (updateData.status) dbUpdateData.status = updateData.status;
        if (updateData.difficultyLevel !== undefined) dbUpdateData.difficulty_level = updateData.difficultyLevel;
        if (updateData.subject) dbUpdateData.subject = updateData.subject;
        if (updateData.tags !== undefined) dbUpdateData.tags = updateData.tags;
        if (updateData.knowledgePoints !== undefined) dbUpdateData.knowledge_points = updateData.knowledgePoints;

        const { data: updatedData, error: updateError } = await supabase
          .from('questions')
          .update(dbUpdateData)
          .in('id', questionIds)
          .select('id');

        if (updateError) {
          throw {
            code: 'DATABASE_ERROR',
            message: '批量更新题目失败',
            details: { error: updateError.message }
          };
        }

        return createResponse({
          updatedCount: updatedData.length,
          updatedIds: updatedData.map(item => item.id)
        }, true, `成功更新${updatedData.length}道题目`);

      case 'export':
        // 查询要导出的题目
        const { data: exportData, error: exportError } = await supabase
          .from('questions')
          .select(`
            *,
            organizations(name),
            exams(name, exam_code)
          `)
          .in('id', questionIds);

        if (exportError) {
          throw {
            code: 'DATABASE_ERROR',
            message: '查询导出题目失败',
            details: { error: exportError.message }
          };
        }

        // 格式化导出数据
        const formattedExportData = exportData.map(question => ({
          题目编号: question.question_code,
          学科: question.subject,
          题型: question.question_type,
          难度: question.difficulty_level,
          题目内容: question.question_text,
          日语原文: question.japanese_text,
          读音标注: question.pronunciation_guide,
          参考答案: question.reference_answer,
          知识点: question.knowledge_points?.join(', ') || '',
          语法点: question.grammar_points?.join(', ') || '',
          日语等级: question.vocabulary_level,
          汉字: question.kanji_list?.join(', ') || '',
          分值: question.total_score,
          组织名称: question.organizations?.name,
          考试名称: question.exams?.name,
          考试编号: question.exams?.exam_code,
          创建时间: question.created_at
        }));

        return createResponse({
          exportData: formattedExportData,
          exportCount: formattedExportData.length,
          exportTime: new Date().toISOString()
        }, true, `成功导出${formattedExportData.length}道题目数据`);

      default:
        return createErrorResponse({
          code: 'VALIDATION_ERROR',
          message: '不支持的批量操作类型'
        });
    }

  } catch (error) {
    console.error('Batch Questions API Error:', error);
    return createErrorResponse(error, error.status || 500);
  }
}