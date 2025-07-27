'use client';

import { motion } from 'framer-motion';
import { Course, Assignment } from '../lib/types';
import { 
  Plus, 
  FileCode, 
  Calendar, 
  Clock, 
  ArrowLeft,
  Edit,
  Users
} from 'lucide-react';
import { format } from 'date-fns';

interface AssignmentListProps {
  course: Course;
  assignments: Assignment[];
  onAssignmentSelect: (assignment: Assignment) => void;
  onCreateAssignment: () => void;
  onEditAssignment: (assignment: Assignment) => void;
  onBack: () => void;
  isTeacher: boolean;
}

export default function AssignmentList({
  course,
  assignments,
  onAssignmentSelect,
  onCreateAssignment,
  onEditAssignment,
  onBack,
  isTeacher
}: AssignmentListProps) {
  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft size={20} />
          </motion.button>
          
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {course.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {course.code} • {assignments.length} assignments
            </p>
          </div>
        </div>
        
        {isTeacher && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onCreateAssignment}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Create Assignment</span>
          </motion.button>
        )}
      </div>

      {/* Assignments */}
      {assignments.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileCode size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No assignments yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {isTeacher 
              ? 'Create your first assignment to get started' 
              : 'No assignments have been posted yet'
            }
          </p>
          {isTeacher && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onCreateAssignment}
              className="btn-primary"
            >
              Create First Assignment
            </motion.button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {assignments.map((assignment, index) => (
            <motion.div
              key={assignment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              className="card p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => onAssignmentSelect(assignment)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl">
                    <FileCode size={24} className="text-white" />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {assignment.title}
                    </h3>
                    
                    {assignment.description && (
                      <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                        {assignment.description}
                      </p>
                    )}
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Calendar size={16} />
                        <span>Due {format(new Date(assignment.due_date), 'MMM d, yyyy')}</span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <Clock size={16} />
                        <span>{format(new Date(assignment.due_date), 'h:mm a')}</span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <Users size={16} />
                        <span>{assignment.max_score} points</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {isTeacher && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditAssignment(assignment);
                    }}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Edit size={18} />
                  </motion.button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}