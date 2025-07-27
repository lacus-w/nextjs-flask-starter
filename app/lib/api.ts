import { User, Course, Assignment, Submission, TestCase } from './types';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:5328/api';

class ApiClient {
  private token: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Auth endpoints
  async register(userData: {
    username: string;
    email: string;
    password: string;
    role?: 'teacher' | 'student';
  }) {
    const response = await this.request<{
      success: boolean;
      access_token: string;
      user: User;
    }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    this.setToken(response.access_token);
    return response;
  }

  async login(credentials: { username: string; password: string }) {
    const response = await this.request<{
      success: boolean;
      access_token: string;
      user: User;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    this.setToken(response.access_token);
    return response;
  }

  // Course endpoints
  async getCourses(): Promise<Course[]> {
    const response = await this.request<{
      success: boolean;
      courses: Course[];
    }>('/courses');
    return response.courses;
  }

  async createCourse(courseData: {
    name: string;
    code: string;
    description?: string;
  }): Promise<Course> {
    return this.request<Course>('/courses', {
      method: 'POST',
      body: JSON.stringify(courseData),
    });
  }

  // Assignment endpoints
  async getAssignments(courseId: number): Promise<Assignment[]> {
    return this.request<Assignment[]>(`/courses/${courseId}/assignments`);
  }

  async getAssignment(assignmentId: number): Promise<Assignment> {
    return this.request<Assignment>(`/assignments/${assignmentId}`);
  }

  async createAssignment(assignmentData: {
    title: string;
    description?: string;
    course_id: number;
    due_date: string;
    max_score?: number;
    test_cases?: TestCase[];
    starter_code?: string;
  }): Promise<Assignment> {
    return this.request<Assignment>('/assignments', {
      method: 'POST',
      body: JSON.stringify(assignmentData),
    });
  }

  // Submission endpoints
  async submitAssignment(submissionData: {
    assignment_id: number;
    code: string;
  }) {
    return this.request('/submissions', {
      method: 'POST',
      body: JSON.stringify(submissionData),
    });
  }

  async getSubmissions(assignmentId: number): Promise<Submission[]> {
    return this.request<Submission[]>(`/assignments/${assignmentId}/submissions`);
  }

  async getSubmissionDetails(submissionId: number): Promise<Submission> {
    return this.request<Submission>(`/submissions/${submissionId}`);
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }
}

export const api = new ApiClient();