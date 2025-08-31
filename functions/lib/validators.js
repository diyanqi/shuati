export function validateOrganization(data) {
  const errors = [];
  
  if (!data.organizationCode || data.organizationCode.length < 3) {
    errors.push('组织编码不能为空且长度不能少于3位');
  }
  
  if (!data.name || data.name.length < 2) {
    errors.push('组织名称不能为空且长度不能少于2位');
  }
  
  if (data.contactInfo && typeof data.contactInfo !== 'object') {
    errors.push('联系信息格式不正确');
  }
  
  if (errors.length > 0) {
    throw {
      code: 'VALIDATION_ERROR',
      message: '数据验证失败',
      details: { errors }
    };
  }
}

export function validateExam(data) {
  const errors = [];
  
  if (!data.organizationId) {
    errors.push('组织ID不能为空');
  }
  
  if (!data.examCode || data.examCode.length < 3) {
    errors.push('考试编码不能为空且长度不能少于3位');
  }
  
  if (!data.name || data.name.length < 2) {
    errors.push('考试名称不能为空且长度不能少于2位');
  }
  
  if (!data.startDate) {
    errors.push('开始日期不能为空');
  }
  
  if (!data.endDate) {
    errors.push('结束日期不能为空');
  }
  
  if (data.startDate && data.endDate && new Date(data.startDate) > new Date(data.endDate)) {
    errors.push('开始日期不能晚于结束日期');
  }
  
  if (errors.length > 0) {
    throw {
      code: 'VALIDATION_ERROR',
      message: '数据验证失败',
      details: { errors }
    };
  }
}

export function validateQuestion(data) {
  const errors = [];
  
  if (!data.organizationId) {
    errors.push('组织ID不能为空');
  }
  
  if (!data.examId) {
    errors.push('考试ID不能为空');
  }
  
  if (!data.subject) {
    errors.push('学科不能为空');
  }
  
  if (!data.questionType) {
    errors.push('题目类型不能为空');
  }
  
  if (!data.questionText || data.questionText.length < 5) {
    errors.push('题目内容不能为空且长度不能少于5个字符');
  }
  
  if (data.totalScore && (data.totalScore < 0 || data.totalScore > 1000)) {
    errors.push('题目分数必须在0-1000之间');
  }
  
  // 选择题必须有选项
  if (['单选题', '多选题'].includes(data.questionType)) {
    if (!data.options || !Array.isArray(data.options) || data.options.length < 2) {
      errors.push('选择题必须至少有2个选项');
    }
  }
  
  // 日语题目的特殊验证
  if (data.subject === '日语') {
    if (data.vocabularyLevel && !['N1', 'N2', 'N3', 'N4', 'N5', '其他'].includes(data.vocabularyLevel)) {
      errors.push('日语等级必须是N1-N5或其他');
    }
  }
  
  if (errors.length > 0) {
    throw {
      code: 'VALIDATION_ERROR',
      message: '数据验证失败',
      details: { errors }
    };
  }
}