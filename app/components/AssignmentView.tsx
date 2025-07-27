'use client';

import { motion } from 'framer-motion';
import { Assignment } from '../lib/types';
import { ArrowLeft, Play } from 'lucide-react';

interface AssignmentViewProps {
  assignment: Assignment;
  onBack: () => void;
  onViewSubmission: (submissionId: number) => void;
  isTeacher: boolean;
}

export default function AssignmentView({
  assignment,
  onBack,
  onViewSubmission,
  isTeacher
}: AssignmentViewProps) {
  return (
    <div className="max-w-6xl mx-auto">
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
            {assignment.title}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Due: {new Date(assignment.due_date).toLocaleDateString()} • {assignment.max_score} points
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Assignment Details */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Assignment Details
          </h2>
          <div className="prose dark:prose-invert">
            <p>{assignment.description || 'No description provided.'}</p>
          </div>
        </div>

        {/* Code Editor / Submission Area */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            {isTeacher ? 'Submissions' : 'Submit Your Solution'}
          </h2>
          
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Play size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {isTeacher ? 'View Submissions' : 'Code Editor Coming Soon'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {isTeacher 
                ? 'See all student submissions and grades'
                : 'Submit your Python code solution here'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}