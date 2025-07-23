'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, FileText, CheckCircle, XCircle, User, Calendar, Code } from 'lucide-react'

interface Submission {
  id: string
  assignment_id: string
  student_name: string
  student_id: string
  submitted_at: string
  code: string
  grade: number
  feedback: string
  test_results: Array<{
    test_case: number
    passed: boolean
    points: number
  }>
}

interface Assignment {
  id: string
  title: string
  total_points: number
}

export default function Submissions() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [selectedAssignment, setSelectedAssignment] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [submissionsRes, assignmentsRes] = await Promise.all([
        fetch('http://localhost:5328/api/submissions'),
        fetch('http://localhost:5328/api/assignments')
      ])
      
      const submissionsData = await submissionsRes.json()
      const assignmentsData = await assignmentsRes.json()
      
      setSubmissions(submissionsData)
      setAssignments(assignmentsData)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredSubmissions = selectedAssignment === 'all' 
    ? submissions 
    : submissions.filter(s => s.assignment_id === selectedAssignment)

  const getAssignmentTitle = (assignmentId: string) => {
    const assignment = assignments.find(a => a.id === assignmentId)
    return assignment ? assignment.title : `Assignment ${assignmentId}`
  }

  const getAssignmentMaxPoints = (assignmentId: string) => {
    const assignment = assignments.find(a => a.id === assignmentId)
    return assignment ? assignment.total_points : 100
  }

  const getGradeColor = (grade: number, maxPoints: number) => {
    const percentage = (grade / maxPoints) * 100
    if (percentage >= 90) return 'text-green-600'
    if (percentage >= 80) return 'text-blue-600'
    if (percentage >= 70) return 'text-yellow-600'
    if (percentage >= 60) return 'text-orange-600'
    return 'text-red-600'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center text-gray-700 hover:text-blue-600">
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900">Submissions</h1>
          <p className="mt-2 text-gray-600">View and manage all student submissions</p>
        </div>

        {/* Filter */}
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center space-x-4">
                <label htmlFor="assignment-filter" className="text-sm font-medium text-gray-700">
                  Filter by Assignment:
                </label>
                <select
                  id="assignment-filter"
                  value={selectedAssignment}
                  onChange={(e) => setSelectedAssignment(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Assignments</option>
                  {assignments.map((assignment) => (
                    <option key={assignment.id} value={assignment.id}>
                      {assignment.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Submissions List */}
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                {filteredSubmissions.length} Submission{filteredSubmissions.length !== 1 ? 's' : ''}
              </h2>
              
              {filteredSubmissions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="mx-auto h-12 w-12 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions found</h3>
                  <p>No submissions match the current filter.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredSubmissions.map((submission) => {
                    const maxPoints = getAssignmentMaxPoints(submission.assignment_id)
                    const passedTests = submission.test_results.filter(t => t.passed).length
                    const totalTests = submission.test_results.length
                    
                    return (
                      <div key={submission.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <User className="h-5 w-5 text-gray-400 mr-2" />
                              <h3 className="text-lg font-medium text-gray-900">
                                {submission.student_name}
                              </h3>
                              <span className="ml-2 text-sm text-gray-500">
                                ({submission.student_id})
                              </span>
                            </div>
                            
                            <div className="flex items-center mb-2">
                              <FileText className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="text-sm text-gray-600">
                                {getAssignmentTitle(submission.assignment_id)}
                              </span>
                            </div>
                            
                            <div className="flex items-center mb-4">
                              <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="text-sm text-gray-600">
                                Submitted: {new Date(submission.submitted_at).toLocaleString()}
                              </span>
                            </div>
                            
                            <div className="flex items-center space-x-4 text-sm">
                              <div className="flex items-center">
                                <span className="font-medium text-gray-700">Grade:</span>
                                <span className={`ml-1 font-bold ${getGradeColor(submission.grade, maxPoints)}`}>
                                  {submission.grade}/{maxPoints}
                                </span>
                              </div>
                              
                              <div className="flex items-center">
                                <span className="font-medium text-gray-700">Tests:</span>
                                <span className="ml-1">
                                  {passedTests}/{totalTests} passed
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2 ml-4">
                            <div className="text-right">
                              <div className={`text-2xl font-bold ${getGradeColor(submission.grade, maxPoints)}`}>
                                {Math.round((submission.grade / maxPoints) * 100)}%
                              </div>
                              <div className="flex items-center justify-end mt-1">
                                {passedTests === totalTests ? (
                                  <CheckCircle className="h-5 w-5 text-green-500" />
                                ) : (
                                  <XCircle className="h-5 w-5 text-red-500" />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Test Results Summary */}
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Test Results:</span>
                            <Link 
                              href={`/submissions/${submission.id}`}
                              className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                            >
                              <Code className="h-4 w-4 mr-1" />
                              View Details
                            </Link>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                            {submission.test_results.map((result, index) => (
                              <div 
                                key={index}
                                className={`flex items-center justify-between p-2 rounded text-sm ${
                                  result.passed 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                <span>Test {index + 1}</span>
                                <span className="font-medium">
                                  {result.points} pts
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {submission.feedback && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <span className="text-sm font-medium text-gray-700">Feedback:</span>
                            <p className="text-sm text-gray-600 mt-1">{submission.feedback}</p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}