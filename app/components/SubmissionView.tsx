'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, FileText } from 'lucide-react';

interface SubmissionViewProps {
  submissionId: number;
  onBack: () => void;
}

export default function SubmissionView({
  submissionId,
  onBack
}: SubmissionViewProps) {
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
            Submission #{submissionId}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            View submission details and test results
          </p>
        </div>
      </div>

      <div className="card p-8">
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Submission Viewer Coming Soon
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            This will show code, test results, and grading feedback.
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