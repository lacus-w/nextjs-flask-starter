'use client';

import { motion } from 'framer-motion';
import { Course, Assignment } from '../lib/types';
import { ArrowLeft } from 'lucide-react';

interface AssignmentEditorProps {
  course: Course;
  assignment: Assignment | null;
  onBack: () => void;
  onSave: () => void;
}

export default function AssignmentEditor({
  course,
  assignment,
  onBack,
  onSave
}: AssignmentEditorProps) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center space-x-4 mb-8">
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
            {assignment ? 'Edit Assignment' : 'Create Assignment'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {course.name} • {course.code}
          </p>
        </div>
      </div>

      <div className="card p-8">
        <div className="text-center py-16">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Assignment Editor Coming Soon
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            This feature will allow teachers to create and edit assignments with test cases.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="btn-primary"
          >
            Go Back
          </motion.button>
        </div>
      </div>
    </div>
  );
}