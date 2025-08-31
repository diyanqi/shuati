# 题库数据库系统文档

## 系统概述

这是一个专为联考联盟设计的题库管理系统，基于Supabase(PostgreSQL)数据库，支持多学科题目管理，包括语文、数学、英语、物理、化学、生物、政治、历史、地理、技术和日语等科目。

## 数据库架构

### 核心表结构

#### 1. 组织表 (organizations)
存储联考联盟组织信息
```sql
- id: UUID (主键)
- organization_code: VARCHAR(50) (组织编码，唯一)
- name: VARCHAR(200) (组织名称)
- description: TEXT (组织简介)
- contact_info: JSONB (联系信息)
- region: VARCHAR(100) (所属地区)
- status: VARCHAR(20) (状态: active/inactive/suspended)
```

#### 2. 考试表 (exams)
存储考试基本信息和各科试卷
```sql
- id: UUID (主键)
- organization_id: UUID (所属组织，外键)
- exam_code: VARCHAR(50) (考试编码，唯一)
- name: VARCHAR(200) (考试名称)
- exam_type: VARCHAR(20) (考试类型: 联考/模拟考/月考等)
- grade_level: VARCHAR(20) (年级: 高一/高二/高三等)
- start_date/end_date: DATE (考试时间范围)
- chinese_pdf_url, math_pdf_url, ..., japanese_pdf_url: VARCHAR(500) (各科试卷PDF)
- additional_subjects: JSONB (扩展科目)
- exam_duration: JSONB (各科时长配置)
- total_score: JSONB (各科总分配置)
```

#### 3. 题目表 (questions)
存储题目详细信息，支持多种题型和日语特色功能
```sql
- id: UUID (主键)
- organization_id: UUID (所属组织，外键)
- exam_id: UUID (所属考试，外键)
- subject: VARCHAR(20) (学科，包含日语)
- question_type: VARCHAR(20) (题型: 单选/多选/填空/简答/翻译/语法等)
- question_text: TEXT (题目内容)
- japanese_text: TEXT (日语原文)
- pronunciation_guide: TEXT (读音标注)
- audio_url: VARCHAR(500) (音频文件，用于听力题)
- options: JSONB (选择题选项及知识点)
- knowledge_points: JSONB (知识点列表)
- grammar_points: JSONB (语法点，日语专用)
- vocabulary_level: VARCHAR(10) (JLPT等级: N1-N5)
- kanji_list: JSONB (涉及汉字列表)
- total_score: DECIMAL(5,2) (题目分值)
```

### 特色功能设计

#### 选择题知识点管理
选择题的每个选项都可以独立标注多个知识点：
```json
[
  {
    "label": "A",
    "content": "选项内容",
    "is_correct": false,
    "knowledge_points": ["知识点1", "知识点2"]
  }
]
```

#### 简答题子问题结构
支持多级子问题：
```json
[
  {
    "order": 1,
    "question": "小问题内容",
    "score": 10,
    "answer": "参考答案",
    "knowledge_points": ["知识点"]
  }
]
```

#### 日语学科专用字段
- `vocabulary_level`: JLPT词汇等级分类
- `grammar_points`: 语法点标注
- `kanji_list`: 汉字学习追踪
- `pronunciation_guide`: 读音辅助
- `audio_url`: 听力题音频支持

### 视图和统计

#### exam_overview 视图
提供考试概览，包含各科题目数量统计

#### japanese_question_statistics 视图
日语题目专用统计，包含JLPT等级分布、语法点数量等

#### question_statistics 视图
全面的题目统计分析

### 安全机制

- **行级安全策略(RLS)**: 用户只能访问自己创建的组织和相关数据
- **UUID主键**: 防止ID猜测攻击
- **数据完整性**: 外键约束保证数据一致性

### 索引优化

- 基础查询索引：组织、考试、题目的常用字段
- JSONB索引：支持知识点、选项等JSON数据查询
- 全文搜索索引：支持题目内容搜索

### 扩展性设计

1. **JSONB字段**: 支持动态数据结构，无需修改表结构
2. **additional_subjects**: 考试表可扩展新科目
3. **tags字段**: 题目可添加自定义标签
4. **模块化设计**: 三表结构清晰，易于扩展

### 使用示例

```sql
-- 查询某组织的所有考试
SELECT * FROM exam_overview WHERE organization_name = '某联考联盟';

-- 查询日语N3级别的语法题
SELECT question_text, grammar_points 
FROM questions 
WHERE subject = '日语' 
  AND vocabulary_level = 'N3' 
  AND question_type = '语法题';

-- 查询包含特定知识点的题目
SELECT id, question_text 
FROM questions 
WHERE knowledge_points @> '["函数"]'::jsonb;
```

### 技术栈

- **数据库**: Supabase (PostgreSQL)
- **认证**: Supabase Auth
- **存储**: Supabase Storage (用于PDF和音频文件)
- **实时功能**: Supabase Realtime

### 部署说明

1. 在Supabase项目中执行建表脚本
2. 配置RLS策略以符合业务需求
3. 设置Storage bucket用于文件存储
4. 配置适当的数据库备份策略

---

**创建者**: diyanqi  
**创建时间**: 2025-08-31  
**版本**: 1.0