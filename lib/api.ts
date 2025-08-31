import {
  ApiResponse,
  ApiError,
  PaginatedResponse,
  Organization,
  Exam,
  ExamOverview,
  Question,
  QuestionSearchResponse,
  SystemOverview,
  OrganizationQueryParams,
  ExamQueryParams,
  QuestionQueryParams,
} from '@/types/api';

// API配置
const API_CONFIG = {
  baseURL: process.env.NODE_ENV === 'development' 
    ? 'http://localhost:8088/api' 
    : '/api',
  timeout: 30000,
};

// 通用请求函数
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_CONFIG.baseURL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error?.message || 'API request failed');
    }
    
    return data.data;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
}

// 构建查询参数
function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        value.forEach(v => searchParams.append(key, v.toString()));
      } else {
        searchParams.set(key, value.toString());
      }
    }
  });
  
  return searchParams.toString();
}

// 组织相关API
export const organizationApi = {
  // 获取组织列表
  getList: async (params: OrganizationQueryParams = {}): Promise<PaginatedResponse<Organization>> => {
    const queryString = buildQueryString(params);
    const endpoint = `/organizations${queryString ? `?${queryString}` : ''}`;
    return apiRequest<PaginatedResponse<Organization>>(endpoint);
  },

  // 获取组织详情
  getDetail: async (id: string): Promise<Organization> => {
    return apiRequest<Organization>(`/organizations/${id}`);
  },

  // 创建组织
  create: async (data: Partial<Organization>): Promise<Organization> => {
    return apiRequest<Organization>('/organizations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // 更新组织
  update: async (id: string, data: Partial<Organization>): Promise<Organization> => {
    return apiRequest<Organization>(`/organizations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // 删除组织
  delete: async (id: string): Promise<void> => {
    return apiRequest<void>(`/organizations/${id}`, {
      method: 'DELETE',
    });
  },
};

// 考试相关API
export const examApi = {
  // 获取考试列表
  getList: async (params: ExamQueryParams = {}): Promise<PaginatedResponse<Exam>> => {
    const queryString = buildQueryString(params);
    const endpoint = `/exams${queryString ? `?${queryString}` : ''}`;
    return apiRequest<PaginatedResponse<Exam>>(endpoint);
  },

  // 获取考试详情
  getDetail: async (id: string): Promise<Exam> => {
    return apiRequest<Exam>(`/exams/${id}`);
  },

  // 获取考试概览
  getOverview: async (id: string): Promise<ExamOverview> => {
    return apiRequest<ExamOverview>(`/exams/${id}/overview`);
  },

  // 创建考试
  create: async (data: Partial<Exam>): Promise<Exam> => {
    return apiRequest<Exam>('/exams', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // 更新考试
  update: async (id: string, data: Partial<Exam>): Promise<Exam> => {
    return apiRequest<Exam>(`/exams/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // 删除考试
  delete: async (id: string): Promise<void> => {
    return apiRequest<void>(`/exams/${id}`, {
      method: 'DELETE',
    });
  },
};

// 题目相关API
export const questionApi = {
  // 获取题目列表
  getList: async (params: QuestionQueryParams = {}): Promise<PaginatedResponse<Question>> => {
    const queryString = buildQueryString(params);
    const endpoint = `/questions${queryString ? `?${queryString}` : ''}`;
    return apiRequest<PaginatedResponse<Question>>(endpoint);
  },

  // 获取题目详情
  getDetail: async (id: string): Promise<Question> => {
    return apiRequest<Question>(`/questions/${id}`);
  },

  // 创建题目
  create: async (data: Partial<Question>): Promise<Question> => {
    return apiRequest<Question>('/questions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // 更新题目
  update: async (id: string, data: Partial<Question>): Promise<Question> => {
    return apiRequest<Question>(`/questions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // 删除题目
  delete: async (id: string): Promise<void> => {
    return apiRequest<void>(`/questions/${id}`, {
      method: 'DELETE',
    });
  },

  // 搜索题目
  search: async (params: { q: string } & QuestionQueryParams): Promise<QuestionSearchResponse> => {
    const queryString = buildQueryString(params);
    return apiRequest<QuestionSearchResponse>(`/search/questions?${queryString}`);
  },
};

// 统计相关API
export const statisticsApi = {
  // 获取系统概览
  getOverview: async (): Promise<SystemOverview> => {
    return apiRequest<SystemOverview>('/statistics/overview');
  },
};

// 文件上传API
export const fileApi = {
  // 上传文件
  upload: async (file: File, type: string, category: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    formData.append('category', category);

    return apiRequest('/files/upload', {
      method: 'POST',
      headers: {
        // 不要设置Content-Type，让浏览器自动设置
      },
      body: formData,
    });
  },

  // 删除文件
  delete: async (fileId: string): Promise<void> => {
    return apiRequest<void>(`/files/${fileId}`, {
      method: 'DELETE',
    });
  },
};

// 导出默认的API对象
export const api = {
  organization: organizationApi,
  exam: examApi,
  question: questionApi,
  statistics: statisticsApi,
  file: fileApi,
};

export default api;
