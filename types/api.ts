// API响应的基础类型
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details: any;
  };
  timestamp: string;
}

// 分页信息
export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: Pagination;
}

// 组织相关类型
export interface Organization {
  id: string;
  organizationCode: string;
  name: string;
  description?: string;
  contactInfo?: {
    email?: string;
    phone?: string;
    address?: string;
    website?: string;
  };
  region?: string;
  establishmentDate?: string;
  logoUrl?: string;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  updatedAt: string;
}

// 考试相关类型
export interface ExamSubject {
  subject: string;
  pdfUrl?: string;
  duration: number;
  totalScore: number;
  questionCount: number;
}

export interface Exam {
  id: string;
  organizationId: string;
  organizationName: string;
  examCode: string;
  name: string;
  description?: string;
  examType: string;
  gradeLevel: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  subjects: ExamSubject[];
  difficultyLevel: string;
  status: 'draft' | 'published' | 'archived';
  totalQuestions: number;
  createdAt: string;
  updatedAt: string;
}

export interface ExamOverview {
  id: string;
  examCode: string;
  examName: string;
  organizationName: string;
  startDate: string;
  endDate: string;
  gradeLevel: string;
  examType: string;
  totalQuestions: number;
  subjectStatistics: Record<string, number>;
  difficultyDistribution: Record<string, number>;
  typeDistribution: Record<string, number>;
}

// 题目相关类型
export interface QuestionOption {
  label: string;
  content: string;
  isCorrect: boolean;
  knowledgePoints?: string[];
}

export interface Question {
  id: string;
  organizationId: string;
  examId: string;
  questionCode: string;
  subject: string;
  questionType: string;
  difficultyLevel: string;
  questionText: string;
  japaneseText?: string;
  pronunciationGuide?: string;
  audioUrl?: string;
  questionImages: string[];
  questionAttachments: string[];
  options: QuestionOption[];
  correctAnswers: string[];
  subQuestions: Question[];
  referenceAnswer?: string;
  answerImages: string[];
  knowledgePoints: string[];
  grammarPoints: string[];
  vocabularyLevel?: string;
  kanjiList: string[];
  totalScore: number;
  scoringCriteria?: string;
  questionOrder: number;
  pageNumber: number;
  sectionName?: string;
  averageScore?: number;
  correctRate?: number;
  discrimination?: number;
  tags: string[];
  source?: string;
  copyrightInfo?: string;
  similarQuestions: string[];
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
}

// 搜索相关类型
export interface SearchInfo {
  query: string;
  totalResults: number;
  searchTime: number;
  suggestions: string[];
}

export interface QuestionSearchResponse {
  items: Question[];
  searchInfo: SearchInfo;
  pagination: Pagination;
}

// 统计相关类型
export interface SystemOverview {
  totalOrganizations: number;
  totalExams: number;
  totalQuestions: number;
  activeExams: number;
  subjectDistribution: Record<string, number>;
  recentActivity: {
    type: string;
    title: string;
    description: string;
    timestamp: string;
  }[];
}

// 查询参数类型
export interface OrganizationQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  region?: string;
  status?: 'active' | 'inactive' | 'suspended';
}

export interface ExamQueryParams {
  page?: number;
  pageSize?: number;
  organizationId?: string;
  examType?: string;
  gradeLevel?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  search?: string;
}

export interface QuestionQueryParams {
  page?: number;
  pageSize?: number;
  examId?: string;
  organizationId?: string;
  subject?: string;
  questionType?: string;
  difficultyLevel?: string;
  vocabularyLevel?: string;
  search?: string;
  hasAudio?: boolean;
  tags?: string[];
  knowledgePoints?: string[];
}