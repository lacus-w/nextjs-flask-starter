'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { BookOpen, Calendar, Users, ArrowLeft, Plus, Clock } from 'lucide-react'

interface Assignment {
  id: string
  title: string
  description: string
  due_date: string
  total_points: number
  test_cases: any[]
}

export default function Assignments() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAssignments()
  }, [])

  const fetchAssignments = async () => {
    try {
      const response = await fetch('http://localhost:5328/api/assignments')
      const data = await response.json()
      setAssignments(data)
    } catch (error) {
      console.error('Error fetching assignments:', error)
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
            <div className="flex items-center">
              <Link 
                href="/assignments/new"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Assignment
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900">Assignments</h1>
          <p className="mt-2 text-gray-600">Manage and view all Python programming assignments</p>
        </div>

        {/* Assignments Grid */}
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {assignments.map((assignment) => (
              <div key={assignment.id} className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <BookOpen className="h-6 w-6 text-blue-600" />
                      <h3 className="ml-2 text-lg font-medium text-gray-900">
                        {assignment.title}
                      </h3>
                    </div>
                    <span className="text-sm font-medium text-blue-600">
                      {assignment.total_points} pts
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                    {assignment.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      Due: {new Date(assignment.due_date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {assignment.test_cases.length} tests
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    <Link 
                      href={`/assignments/${assignment.id}`}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center px-3 py-2 rounded-md text-sm font-medium"
                    >
                      View Details
                    </Link>
                    <Link 
                      href={`/assignments/${assignment.id}/submit`}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 text-center px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Submit
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Empty State */}
        {assignments.length === 0 && (
          <div className="px-4 py-12 sm:px-0">
            <div className="text-center">
              <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No assignments</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a new assignment.
              </p>
              <div className="mt-6">
                <Link 
                  href="/assignments/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Assignment
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}