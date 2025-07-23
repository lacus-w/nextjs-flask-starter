'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { BookOpen, Calendar, Clock, ArrowLeft, Play, CheckCircle, XCircle } from 'lucide-react'

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

export default function AssignmentDetail() {
  const params = useParams()
  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [loading, setLoading] = useState(true)

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
    } catch (error) {
      console.error('Error fetching assignment:', error)
    } finally {
      setLoading(false)
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/assignments" className="flex items-center text-gray-700 hover:text-blue-600">
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Assignments
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href={`/assignments/${assignment.id}/submit`}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center"
              >
                <Play className="h-4 w-4 mr-2" />
                Submit Solution
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Assignment Header */}
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <BookOpen className="h-8 w-8 text-blue-600" />
                  <h1 className="ml-3 text-3xl font-bold text-gray-900">
                    {assignment.title}
                  </h1>
                </div>
                <span className="text-lg font-medium text-blue-600">
                  {assignment.total_points} points
                </span>
              </div>
              
              <p className="text-gray-600 mb-6">
                {assignment.description}
              </p>
              
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Due: {new Date(assignment.due_date).toLocaleDateString()}
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {assignment.test_cases.length} test cases
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Test Cases */}
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Test Cases</h2>
              
              <div className="space-y-6">
                {assignment.test_cases.map((testCase, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        Test Case {index + 1}: {testCase.function_name}()
                      </h3>
                      <span className="text-sm font-medium text-blue-600">
                        {testCase.points} points
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Input:</h4>
                        <div className="bg-gray-100 rounded-md p-3">
                          <code className="text-sm text-gray-900">
                            {testCase.function_name}({testCase.inputs.map(input => 
                              typeof input === 'string' ? `"${input}"` : JSON.stringify(input)
                            ).join(', ')})
                          </code>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Expected Output:</h4>
                        <div className="bg-gray-100 rounded-md p-3">
                          <code className="text-sm text-gray-900">
                            {typeof testCase.expected_output === 'string' 
                              ? `"${testCase.expected_output}"` 
                              : JSON.stringify(testCase.expected_output)}
                          </code>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Requirements */}
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Requirements</h2>
              <div className="prose text-gray-600">
                <ul className="list-disc list-inside space-y-2">
                  <li>Implement all required functions according to the test cases</li>
                  <li>Your code should handle edge cases appropriately</li>
                  <li>Follow Python best practices and naming conventions</li>
                  <li>Ensure your functions return the correct data types</li>
                  <li>Test your code thoroughly before submission</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Submission Button */}
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center">
            <Link 
              href={`/assignments/${assignment.id}/submit`}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <Play className="h-5 w-5 mr-2" />
              Submit Your Solution
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}