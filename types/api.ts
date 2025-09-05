// API Types based on the API documentation

export interface ContactInfo {
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
}

export interface Organization {
  id: string;
  organizationCode: string;
  name: string;
  description?: string;
  contactInfo?: ContactInfo;
  region?: string;
  establishmentDate?: string;
  logoUrl?: string;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  updatedAt: string;
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
  status: string;
  totalQuestions: number;
  createdAt: string;
  updatedAt: string;
}

export interface ExamSubject {
  subject: string;
  pdfUrl?: string;
  duration: number;
  totalScore: number;
  questionCount: number;
}

export interface Question {
  id: string;
  organizationId: string;
  examId?: string;
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
  sectionName: string;
  averageScore?: number;
  correctRate?: number;
  discrimination?: number;
  tags: string[];
  source?: string;
  copyrightInfo?: string;
  similarQuestions: string[];
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuestionOption {
  label: string;
  content: string;
  isCorrect: boolean;
  knowledgePoints: string[];
}

export interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

export interface PaginatedApiResponse<T> {
  success: boolean;
  data: {
    items: T[];
    pagination: PaginationInfo;
  };
  message?: string;
  timestamp: string;
}

// Additional API types
export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationInfo;
}

export interface ExamOverview {
  totalExams: number;
  activeExams: number;
  completedExams: number;
  averageScore: number;
}

export interface QuestionSearchResponse {
  items: Question[];
  totalCount: number;
  searchTime: number;
}

export interface SystemOverview {
  totalOrganizations: number;
  totalExams: number;
  totalQuestions: number;
  totalUsers: number;
}

// Query parameter types
export interface OrganizationQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  region?: string;
}

export interface ExamQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  organizationId?: string;
  status?: string;
  examType?: string;
  gradeLevel?: string;
}

export interface QuestionQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  organizationId?: string;
  examId?: string;
  subject?: string;
  difficultyLevel?: string;
  status?: string;
  questionType?: string;
}
