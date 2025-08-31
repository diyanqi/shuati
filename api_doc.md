我将为你的题库系统设计完整的API文档，使用RESTful风格，适配Next.js静态前端和EdgeOne Functions后端。

```markdown name=API文档.md
# 题库系统 API 文档

## 概述

- **基础URL**: `https://your-domain.com/api`
- **版本**: v1
- **认证**: Bearer Token (预留，暂时可选)
- **响应格式**: JSON
- **时间格式**: ISO 8601 (YYYY-MM-DDTHH:mm:ss.sssZ)

## 通用响应格式

### 成功响应
```json
{
  "success": true,
  "data": {
    // 具体数据
  },
  "message": "操作成功",
  "timestamp": "2025-08-31T01:22:21.000Z"
}
```

### 错误响应
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "错误描述",
    "details": {}
  },
  "timestamp": "2025-08-31T01:22:21.000Z"
}
```

### 分页响应
```json
{
  "success": true,
  "data": {
    "items": [],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 100,
      "totalPages": 5,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

## 1. 组织管理 API

### 1.1 获取组织列表
```
GET /organizations
```

**查询参数:**
- `page?: number` - 页码，默认 1
- `pageSize?: number` - 每页数量，默认 20，最大 100
- `search?: string` - 搜索组织名称
- `region?: string` - 按地区筛选
- `status?: 'active' | 'inactive' | 'suspended'` - 按状态筛选

**响应:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "organizationCode": "JKLM001",
        "name": "江苏省重点中学联考联盟",
        "description": "江苏省内重点中学组成的联考组织",
        "contactInfo": {
          "email": "contact@jslk.edu.cn",
          "phone": "025-12345678",
          "address": "南京市鼓楼区教育路123号"
        },
        "region": "江苏省",
        "establishmentDate": "2020-01-15",
        "logoUrl": "https://...",
        "status": "active",
        "createdAt": "2020-01-15T08:00:00.000Z",
        "updatedAt": "2025-08-31T01:22:21.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 3,
      "totalPages": 1,
      "hasNext": false,
      "hasPrev": false
    }
  }
}
```

### 1.2 获取组织详情
```
GET /organizations/{id}
```

### 1.3 创建组织
```
POST /organizations
```

**请求体:**
```json
{
  "organizationCode": "JKLM001",
  "name": "江苏省重点中学联考联盟",
  "description": "江苏省内重点中学组成的联考组织",
  "contactInfo": {
    "email": "contact@jslk.edu.cn",
    "phone": "025-12345678",
    "address": "南京市鼓楼区教育路123号",
    "website": "https://jslk.edu.cn"
  },
  "region": "江苏省",
  "establishmentDate": "2020-01-15",
  "logoUrl": "https://..."
}
```

### 1.4 更新组织
```
PUT /organizations/{id}
PATCH /organizations/{id}
```

### 1.5 删除组织
```
DELETE /organizations/{id}
```

## 2. 考试管理 API

### 2.1 获取考试列表
```
GET /exams
```

**查询参数:**
- `page?: number`
- `pageSize?: number`
- `organizationId?: string` - 按组织筛选
- `examType?: string` - 考试类型筛选
- `gradeLevel?: string` - 年级筛选
- `startDate?: string` - 开始时间筛选 (YYYY-MM-DD)
- `endDate?: string` - 结束时间筛选 (YYYY-MM-DD)
- `status?: string` - 状态筛选
- `search?: string` - 搜索考试名称

**响应:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "organizationId": "uuid",
        "organizationName": "江苏省重点中学联考联盟",
        "examCode": "JS2024001",
        "name": "2024年高三第一次联考",
        "description": "高三年级第一次大型联考",
        "examType": "联考",
        "gradeLevel": "高三",
        "startDate": "2024-03-15",
        "endDate": "2024-03-17",
        "startTime": "08:00:00",
        "endTime": "18:00:00",
        "subjects": [
          {
            "subject": "语文",
            "pdfUrl": "https://storage.supabase.co/exams/js2024001_chinese.pdf",
            "duration": 150,
            "totalScore": 150,
            "questionCount": 25
          },
          {
            "subject": "数学",
            "pdfUrl": "https://storage.supabase.co/exams/js2024001_math.pdf",
            "duration": 120,
            "totalScore": 150,
            "questionCount": 22
          }
        ],
        "difficultyLevel": "中等",
        "status": "published",
        "totalQuestions": 47,
        "createdAt": "2024-02-01T08:00:00.000Z",
        "updatedAt": "2024-03-01T08:00:00.000Z"
      }
    ]
  }
}
```

### 2.2 获取考试详情
```
GET /exams/{id}
```

### 2.3 获取考试统计概览
```
GET /exams/{id}/overview
```

**响应:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "examCode": "JS2024001",
    "examName": "2024年高三第一次联考",
    "organizationName": "江苏省重点中学联考联盟",
    "startDate": "2024-03-15",
    "endDate": "2024-03-17",
    "gradeLevel": "高三",
    "examType": "联考",
    "totalQuestions": 47,
    "subjectStatistics": {
      "语文": 5,
      "数学": 8,
      "英语": 6,
      "物理": 7,
      "化学": 6,
      "生物": 5,
      "政治": 4,
      "历史": 3,
      "地理": 2,
      "技术": 1,
      "日语": 0
    },
    "difficultyDistribution": {
      "容易": 15,
      "中等": 20,
      "困难": 10,
      "极难": 2
    },
    "typeDistribution": {
      "单选题": 20,
      "多选题": 8,
      "填空题": 10,
      "简答题": 6,
      "计算题": 3
    }
  }
}
```

### 2.4 创建考试
```
POST /exams
```

### 2.5 更新考试
```
PUT /exams/{id}
PATCH /exams/{id}
```

### 2.6 删除考试
```
DELETE /exams/{id}
```

## 3. 题目管理 API

### 3.1 获取题目列表
```
GET /questions
```

**查询参数:**
- `page?: number`
- `pageSize?: number`
- `examId?: string` - 按考试筛选
- `organizationId?: string` - 按组织筛选
- `subject?: string` - 按学科筛选
- `questionType?: string` - 按题型筛选
- `difficultyLevel?: string` - 按难度筛选
- `vocabularyLevel?: string` - 按日语等级筛选 (N1-N5)
- `search?: string` - 搜索题目内容
- `hasAudio?: boolean` - 是否包含音频
- `tags?: string[]` - 按标签筛选
- `knowledgePoints?: string[]` - 按知识点筛选

**响应:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "organizationId": "uuid",
        "examId": "uuid",
        "questionCode": "JS2024001-M001",
        "subject": "数学",
        "questionType": "单选题",
        "difficultyLevel": "中等",
        "questionText": "函数f(x) = 2x² - 4x + 1在区间[0,3]上的最小值是",
        "japaneseText": null,
        "pronunciationGuide": null,
        "audioUrl": null,
        "questionImages": [],
        "questionAttachments": [],
        "options": [
          {
            "label": "A",
            "content": "-1",
            "isCorrect": true,
            "knowledgePoints": ["二次函数", "函数最值"]
          }
        ],
        "correctAnswers": [],
        "subQuestions": [],
        "referenceAnswer": "通过配方法求解...",
        "answerImages": [],
        "knowledgePoints": ["二次函数", "函数最值", "配方法"],
        "grammarPoints": [],
        "vocabularyLevel": null,
        "kanjiList": [],
        "totalScore": 5.0,
        "scoringCriteria": null,
        "questionOrder": 1,
        "pageNumber": 1,
        "sectionName": "选择题",
        "averageScore": 3.2,
        "correctRate": 0.64,
        "discrimination": 0.45,
        "tags": ["重点题目", "高频考点"],
        "source": "2024年江苏联考",
        "copyrightInfo": null,
        "similarQuestions": [],
        "status": "published",
        "createdAt": "2024-02-01T08:00:00.000Z",
        "updatedAt": "2024-03-01T08:00:00.000Z"
      }
    ]
  }
}
```

### 3.2 获取题目详情
```
GET /questions/{id}
```

### 3.3 获取日语题目统计
```
GET /questions/japanese/statistics
```

**查询参数:**
- `examId?: string`
- `organizationId?: string`
- `vocabularyLevel?: string`

**响应:**
```json
{
  "success": true,
  "data": {
    "totalQuestions": 15,
    "levelDistribution": {
      "N1": 2,
      "N2": 3,
      "N3": 5,
      "N4": 4,
      "N5": 1
    },
    "typeDistribution": {
      "单选题": 8,
      "听力题": 4,
      "翻译题": 2,
      "语法题": 1
    },
    "audioQuestions": 4,
    "questionsWithJapaneseText": 12,
    "averageGrammarPoints": 2.3,
    "averageKanjiCount": 3.7
  }
}
```

### 3.4 创建题目
```
POST /questions
```

**请求体示例 (选择题):**
```json
{
  "organizationId": "uuid",
  "examId": "uuid",
  "questionCode": "JS2024001-M002",
  "subject": "数学",
  "questionType": "单选题",
  "difficultyLevel": "中等",
  "questionText": "题目内容...",
  "questionImages": ["https://..."],
  "options": [
    {
      "label": "A",
      "content": "选项A",
      "isCorrect": true,
      "knowledgePoints": ["知识点1", "知识点2"]
    }
  ],
  "knowledgePoints": ["综合知识点"],
  "totalScore": 5.0,
  "questionOrder": 2,
  "tags": ["标签1", "标签2"]
}
```

**请求体示例 (日语题):**
```json
{
  "organizationId": "uuid",
  "examId": "uuid",
  "questionCode": "JS2024001-J003",
  "subject": "日语",
  "questionType": "听力题",
  "difficultyLevel": "中等",
  "questionText": "听音频，选择正确答案",
  "japaneseText": "田中さんは何時に学校に来ますか。",
  "pronunciationGuide": "たなかさん は なんじ に がっこう に きますか。",
  "audioUrl": "https://storage.../audio.mp3",
  "options": [...],
  "grammarPoints": ["疑问词", "时间表达"],
  "vocabularyLevel": "N4",
  "kanjiList": ["田中", "学校"],
  "knowledgePoints": ["日语听力", "时间表达"],
  "totalScore": 4.0
}
```

### 3.5 更新题目
```
PUT /questions/{id}
PATCH /questions/{id}
```

### 3.6 删除题目
```
DELETE /questions/{id}
```

### 3.7 批量操作题目
```
POST /questions/batch
```

**请求体:**
```json
{
  "action": "delete" | "update" | "export",
  "questionIds": ["uuid1", "uuid2"],
  "updateData": {} // 当action为update时
}
```

## 4. 搜索 API

### 4.1 全文搜索题目
```
GET /search/questions
```

**查询参数:**
- `q: string` - 搜索关键词 (必需)
- `page?: number`
- `pageSize?: number`
- `subject?: string` - 学科筛选
- `examId?: string` - 考试筛选
- `difficultyLevel?: string` - 难度筛选

**响应:**
```json
{
  "success": true,
  "data": {
    "items": [...], // 题目列表，格式同上
    "searchInfo": {
      "query": "二次函数",
      "totalResults": 15,
      "searchTime": 0.045,
      "suggestions": ["二次函数最值", "二次函数图像"]
    },
    "pagination": {...}
  }
}
```

### 4.2 知识点搜索
```
GET /search/knowledge-points
```

**查询参数:**
- `q: string` - 搜索关键词
- `subject?: string` - 学科筛选

**响应:**
```json
{
  "success": true,
  "data": {
    "knowledgePoints": [
      {
        "name": "二次函数",
        "count": 25,
        "subjects": ["数学"],
        "relatedPoints": ["函数最值", "配方法"]
      }
    ]
  }
}
```

## 5. 统计分析 API

### 5.1 获取系统概览统计
```
GET /statistics/overview
```

**响应:**
```json
{
  "success": true,
  "data": {
    "totalOrganizations": 3,
    "totalExams": 15,
    "totalQuestions": 450,
    "activeExams": 8,
    "subjectDistribution": {
      "语文": 85,
      "数学": 95,
      "英语": 80,
      "物理": 65,
      "化学": 55,
      "日语": 70
    },
    "recentActivity": [
      {
        "type": "exam_created",
        "title": "创建了新考试",
        "description": "2024年高三模拟考",
        "timestamp": "2025-08-30T10:30:00.000Z"
      }
    ]
  }
}
```

### 5.2 获取考试统计
```
GET /statistics/exams
```

### 5.3 获取题目统计
```
GET /statistics/questions
```

## 6. 文件管理 API

### 6.1 上传文件
```
POST /files/upload
```

**请求:** `multipart/form-data`
- `file: File` - 上传的文件
- `type: string` - 文件类型 (pdf, image, audio)
- `category: string` - 分类 (exam_paper, question_image, audio)

**响应:**
```json
{
  "success": true,
  "data": {
    "fileId": "uuid",
    "filename": "original_name.pdf",
    "url": "https://storage.../file.pdf",
    "size": 1024000,
    "mimeType": "application/pdf",
    "uploadedAt": "2025-08-31T01:22:21.000Z"
  }
}
```

### 6.2 删除文件
```
DELETE /files/{fileId}
```

## 7. 导出 API

### 7.1 导出题目
```
POST /export/questions
```

**请求体:**
```json
{
  "format": "excel" | "word" | "pdf",
  "questionIds": ["uuid1", "uuid2"],
  "includeAnswers": true,
  "includeStatistics": false
}
```

**响应:**
```json
{
  "success": true,
  "data": {
    "downloadUrl": "https://storage.../export_file.xlsx",
    "filename": "questions_export_20250831.xlsx",
    "expiresAt": "2025-09-01T01:22:21.000Z"
  }
}
```

## 错误代码

| 代码 | HTTP状态 | 描述 |
|------|----------|------|
| `INVALID_REQUEST` | 400 | 请求参数无效 |
| `UNAUTHORIZED` | 401 | 未授权访问 |
| `FORBIDDEN` | 403 | 权限不足 |
| `NOT_FOUND` | 404 | 资源不存在 |
| `CONFLICT` | 409 | 资源冲突 |
| `VALIDATION_ERROR` | 422 | 数据验证失败 |
| `RATE_LIMIT` | 429 | 请求频率超限 |
| `INTERNAL_ERROR` | 500 | 服务器内部错误 |

## 认证 (预留)

### Bearer Token
```
Authorization: Bearer <token>
```

### API Key (备选)
```
X-API-Key: <api_key>
```

## 版本控制

API版本通过URL路径指定：
- `/v1/organizations`
- `/v2/organizations` (未来版本)

或通过请求头：
```
Accept: application/vnd.api+json; version=1
```
