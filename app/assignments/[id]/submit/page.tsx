'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Play, Send, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

interface Assignment {
  id: string
  title: string
  description: string
  due_date: string
  total_points: number
  test_cases: Array<{
    function_name: string
    inputs: any[]
    expected_output: any
    points: number
  }>
}

interface TestResult {
  test_case: number
  passed: boolean
  points: number
  expected: any
  actual: any
  error: string | null
}

export default function SubmitAssignment() {
  const params = useParams()
  const router = useRouter()
  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [code, setCode] = useState('')
  const [studentName, setStudentName] = useState('')
  const [studentId, setStudentId] = useState('')
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [loading, setLoading] = useState(true)
  const [testing, setTesting] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchAssignment(params.id as string)
    }
  }, [params.id])

  const fetchAssignment = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:5328/api/assignments/${id}`)
      const data = await response.json()
      setAssignment(data)
      
      // Initialize code template
      const template = data.test_cases.map((tc: any) => 
        `def ${tc.function_name}(${tc.inputs.map((_: any, i: number) => `param${i + 1}`).join(', ')}):\n    # TODO: Implement this function\n    pass\n`
      ).join('\n')
      setCode(template)
    } catch (error) {
      console.error('Error fetching assignment:', error)
    } finally {
      setLoading(false)
    }
  }

  const runTests = async () => {
    if (!assignment) return
    
    setTesting(true)
    const results: TestResult[] = []
    
    for (let i = 0; i < assignment.test_cases.length; i++) {
      const testCase = assignment.test_cases[i]
      try {
        const response = await fetch('http://localhost:5328/api/test-code', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            code: code,
            test_case: testCase
          })
        })
        
        const result = await response.json()
        
        if (result.success) {
          const expected = testCase.expected_output
          const actual = result.result
          
          let passed = false
          if (typeof expected === 'number' && typeof actual === 'number') {
            passed = Math.abs(expected - actual) < 0.01
          } else {
            passed = JSON.stringify(expected) === JSON.stringify(actual)
          }
          
          results.push({
            test_case: i,
            passed: passed,
            points: passed ? testCase.points : 0,
            expected: expected,
            actual: actual,
            error: null
          })
        } else {
          results.push({
            test_case: i,
            passed: false,
            points: 0,
            expected: testCase.expected_output,
            actual: null,
            error: result.error
          })
        }
      } catch (error) {
        results.push({
          test_case: i,
          passed: false,
          points: 0,
          expected: testCase.expected_output,
          actual: null,
          error: 'Network error'
        })
      }
    }
    
    setTestResults(results)
    setTesting(false)
  }

  const submitAssignment = async () => {
    if (!assignment || !studentName || !studentId) return
    
    setSubmitting(true)
    
    try {
      const response = await fetch('http://localhost:5328/api/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assignment_id: assignment.id,
          student_name: studentName,
          student_id: studentId,
          code: code
        })
      })
      
      if (response.ok) {
        setSubmitted(true)
        setTimeout(() => {
          router.push('/submissions')
        }, 2000)
      }
    } catch (error) {
      console.error('Error submitting assignment:', error)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!assignment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Assignment not found</h1>
          <Link href="/assignments" className="mt-4 text-blue-600 hover:text-blue-800">
            Back to assignments
          </Link>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Assignment Submitted!</h1>
          <p className="text-gray-600">Your submission has been received and graded automatically.</p>
          <p className="text-sm text-gray-500 mt-2">Redirecting to submissions...</p>
        </div>
      </div>
    )
  }

  const totalScore = testResults.reduce((sum, result) => sum + result.points, 0)
  const maxScore = assignment.total_points

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href={`/assignments/${assignment.id}`} className="flex items-center text-gray-700 hover:text-blue-600">
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Assignment
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={runTests}
                disabled={testing}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center"
              >
                <Play className="h-4 w-4 mr-2" />
                {testing ? 'Testing...' : 'Run Tests'}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900">Submit: {assignment.title}</h1>
          <p className="mt-2 text-gray-600">Write your Python code and test it before submitting</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Code Editor */}
          <div className="px-4 sm:px-0">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Your Code</h2>
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full h-96 p-4 border border-gray-300 rounded-md font-mono text-sm resize-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Write your Python code here..."
                />
              </div>
            </div>
          </div>

          {/* Test Results */}
          <div className="px-4 sm:px-0">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-medium text-gray-900">Test Results</h2>
                  {testResults.length > 0 && (
                    <span className="text-sm font-medium text-blue-600">
                      Score: {totalScore}/{maxScore}
                    </span>
                  )}
                </div>
                
                {testResults.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <AlertCircle className="mx-auto h-8 w-8 mb-2" />
                    <p>Run tests to see results</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {testResults.map((result, index) => (
                      <div key={index} className={`border rounded-lg p-4 ${result.passed ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            {result.passed ? (
                              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-500 mr-2" />
                            )}
                            <span className="font-medium">Test {index + 1}</span>
                          </div>
                          <span className="text-sm font-medium">
                            {result.points}/{assignment.test_cases[index].points} pts
                          </span>
                        </div>
                        
                        <div className="text-sm space-y-1">
                          <div><strong>Expected:</strong> {JSON.stringify(result.expected)}</div>
                          <div><strong>Actual:</strong> {result.actual !== null ? JSON.stringify(result.actual) : 'N/A'}</div>
                          {result.error && (
                            <div className="text-red-600"><strong>Error:</strong> {result.error}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Submission Form */}
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Submit Assignment</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label htmlFor="studentName" className="block text-sm font-medium text-gray-700 mb-1">
                    Student Name
                  </label>
                  <input
                    type="text"
                    id="studentName"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div>
                  <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 mb-1">
                    Student ID
                  </label>
                  <input
                    type="text"
                    id="studentId"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your student ID"
                  />
                </div>
              </div>
              
              <button
                onClick={submitAssignment}
                disabled={submitting || !studentName || !studentId || !code.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-3 rounded-md font-medium flex items-center justify-center"
              >
                <Send className="h-5 w-5 mr-2" />
                {submitting ? 'Submitting...' : 'Submit Assignment'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}