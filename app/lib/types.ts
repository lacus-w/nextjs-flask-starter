export interface User {
  id: number;
  username: string;
  email: string;
  role: 'teacher' | 'student';
}

export interface Course {
  id: number;
  name: string;
  code: string;
  description: string;
  created_at: string;
}

export interface Assignment {
  id: number;
  title: string;
  description: string;
  due_date: string;
  max_score: number;
  starter_code?: string;
  test_cases?: TestCase[];
  created_at: string;
}

export interface TestCase {
  name: string;
  input: string;
  expected: string;
}

export interface Submission {
  id: number;
  student_id: number;
  student_name: string;
  submitted_at: string;
  score: number | null;
  status: 'pending' | 'graded' | 'error';
  code?: string;
  feedback?: GradingResult;
  test_results?: TestResult[];
}

export interface TestResult {
  test_name: string;
  expected: string;
  actual: string;
  passed: boolean;
  error: string | null;
  execution_time: number;
}

export interface GradingResult {
  total_tests: number;
  passed_tests: number;
  test_results: TestResult[];
  execution_error: string | null;
  score: number;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}