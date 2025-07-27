'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../lib/auth';
import { api } from '../lib/api';
import { Course, Assignment } from '../lib/types';
import Navigation from './Navigation';
import CourseList from './CourseList';
import AssignmentList from './AssignmentList';
import AssignmentEditor from './AssignmentEditor';
import AssignmentView from './AssignmentView';
import SubmissionView from './SubmissionView';
import toast from 'react-hot-toast';

type ViewType = 'courses' | 'assignments' | 'assignment-editor' | 'assignment-view' | 'submission-view';

export default function Dashboard() {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<ViewType>('courses');
  const [courses, setCourses] = useState<Course[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const coursesData = await api.getCourses();
      setCourses(coursesData);
    } catch (error: any) {
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const loadAssignments = async (courseId: number) => {
    try {
      const assignmentsData = await api.getAssignments(courseId);
      setAssignments(assignmentsData);
    } catch (error: any) {
      toast.error('Failed to load assignments');
    }
  };

  const handleCourseSelect = (course: Course) => {
    setSelectedCourse(course);
    setCurrentView('assignments');
    loadAssignments(course.id);
  };

  const handleAssignmentSelect = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setCurrentView('assignment-view');
  };

  const handleCreateAssignment = () => {
    setCurrentView('assignment-editor');
    setSelectedAssignment(null);
  };

  const handleEditAssignment = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setCurrentView('assignment-editor');
  };

  const handleViewSubmission = (submissionId: number) => {
    setSelectedSubmissionId(submissionId);
    setCurrentView('submission-view');
  };

  const handleBackToCourses = () => {
    setCurrentView('courses');
    setSelectedCourse(null);
    setAssignments([]);
  };

  const handleBackToAssignments = () => {
    setCurrentView('assignments');
    setSelectedAssignment(null);
    setSelectedSubmissionId(null);
  };

  const renderContent = () => {
    switch (currentView) {
      case 'courses':
        return (
          <CourseList
            courses={courses}
            onCourseSelect={handleCourseSelect}
            onRefresh={loadCourses}
            isTeacher={user?.role === 'teacher'}
          />
        );
      
      case 'assignments':
        return (
          <AssignmentList
            course={selectedCourse!}
            assignments={assignments}
            onAssignmentSelect={handleAssignmentSelect}
            onCreateAssignment={handleCreateAssignment}
            onEditAssignment={handleEditAssignment}
            onBack={handleBackToCourses}
            isTeacher={user?.role === 'teacher'}
          />
        );
      
      case 'assignment-editor':
        return (
          <AssignmentEditor
            course={selectedCourse!}
            assignment={selectedAssignment}
            onBack={handleBackToAssignments}
            onSave={() => {
              loadAssignments(selectedCourse!.id);
              handleBackToAssignments();
            }}
          />
        );
      
      case 'assignment-view':
        return (
          <AssignmentView
            assignment={selectedAssignment!}
            onBack={handleBackToAssignments}
            onViewSubmission={handleViewSubmission}
            isTeacher={user?.role === 'teacher'}
          />
        );
      
      case 'submission-view':
        return (
          <SubmissionView
            submissionId={selectedSubmissionId!}
            onBack={handleBackToAssignments}
          />
        );
      
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation
        user={user!}
        currentView={currentView}
        selectedCourse={selectedCourse}
        selectedAssignment={selectedAssignment}
      />
      
      <main className="pt-16">
        <motion.div
          key={currentView}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="container mx-auto px-4 py-8"
        >
          {renderContent()}
        </motion.div>
      </main>
    </div>
  );
}