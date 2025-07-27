'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Course } from '../lib/types';
import { api } from '../lib/api';
import toast from 'react-hot-toast';
import { 
  Plus, 
  BookOpen, 
  Calendar, 
  Users, 
  Search,
  Filter,
  RefreshCw
} from 'lucide-react';

interface CourseListProps {
  courses: Course[];
  onCourseSelect: (course: Course) => void;
  onRefresh: () => void;
  isTeacher: boolean;
}

export default function CourseList({ 
  courses, 
  onCourseSelect, 
  onRefresh, 
  isTeacher 
}: CourseListProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
  });

  const filteredCourses = courses.filter(course =>
    course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.createCourse(formData);
      toast.success('Course created successfully!');
      setShowCreateModal(false);
      setFormData({ name: '', code: '', description: '' });
      onRefresh();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            My Courses
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {isTeacher ? 'Manage your courses and assignments' : 'Your enrolled courses'}
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onRefresh}
            className="p-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Refresh"
          >
            <RefreshCw size={20} />
          </motion.button>
          
          {isTeacher && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateModal(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus size={20} />
              <span>Create Course</span>
            </motion.button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4 mb-8">
        <div className="flex-1 relative">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
          />
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="btn-secondary flex items-center space-x-2"
        >
          <Filter size={20} />
          <span>Filter</span>
        </motion.button>
      </div>

      {/* Courses Grid */}
      {filteredCourses.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {courses.length === 0 ? 'No courses found' : 'No matching courses'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {courses.length === 0 
              ? isTeacher 
                ? 'Create your first course to get started' 
                : 'You are not enrolled in any courses yet'
              : 'Try adjusting your search terms'
            }
          </p>
          {isTeacher && courses.length === 0 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
            >
              Create Your First Course
            </motion.button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              whileHover={{ y: -4 }}
              className="card card-hover cursor-pointer p-6"
              onClick={() => onCourseSelect(course)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl">
                  <BookOpen size={24} className="text-white" />
                </div>
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                  {course.code}
                </span>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                {course.name}
              </h3>
              
              {course.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                  {course.description}
                </p>
              )}
              
              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-1">
                  <Calendar size={16} />
                  <span>
                    {new Date(course.created_at).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <Users size={16} />
                  <span>0 students</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Course Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md"
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Create New Course
            </h2>
            
            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Course Name
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="e.g., Introduction to Python"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Course Code
                </label>
                <input
                  type="text"
                  name="code"
                  required
                  value={formData.code}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="e.g., CS101"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="input resize-none"
                  placeholder="Brief description of the course..."
                />
              </div>
              
              <div className="flex items-center space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex-1 flex items-center justify-center space-x-2"
                >
                  {loading && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  )}
                  <span>Create Course</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}