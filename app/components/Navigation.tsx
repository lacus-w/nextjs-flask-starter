'use client';

import { motion } from 'framer-motion';
import { useAuth } from '../lib/auth';
import { User, Course, Assignment } from '../lib/types';
import { LogOut, Code, ChevronRight, Settings, Bell } from 'lucide-react';

interface NavigationProps {
  user: User;
  currentView: string;
  selectedCourse: Course | null;
  selectedAssignment: Assignment | null;
}

export default function Navigation({ 
  user, 
  currentView, 
  selectedCourse, 
  selectedAssignment 
}: NavigationProps) {
  const { logout } = useAuth();

  const getBreadcrumb = () => {
    const items: { label: string; current: boolean }[] = [];
    
    items.push({ label: 'Courses', current: currentView === 'courses' });
    
    if (selectedCourse) {
      items.push({ 
        label: selectedCourse.name, 
        current: currentView === 'assignments' 
      });
    }
    
    if (selectedAssignment) {
      items.push({ 
        label: selectedAssignment.title, 
        current: ['assignment-view', 'assignment-editor', 'submission-view'].includes(currentView)
      });
    }
    
    return items;
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left section - Logo and breadcrumb */}
          <div className="flex items-center space-x-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2"
            >
              <div className="p-2 bg-red-500 rounded-xl">
                <Code size={20} className="text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900 dark:text-white">
                Python Grader
              </span>
            </motion.div>
            
            {/* Breadcrumb */}
            <div className="hidden md:flex items-center space-x-2 text-sm">
              {getBreadcrumb().map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  {index > 0 && (
                    <ChevronRight size={16} className="text-gray-400" />
                  )}
                  <span 
                    className={`px-3 py-1 rounded-full transition-colors ${
                      item.current 
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 font-medium' 
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right section - User info and actions */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <Bell size={20} />
            </motion.button>

            {/* Settings */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <Settings size={20} />
            </motion.button>

            {/* User info */}
            <div className="flex items-center space-x-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {user.username}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                  {user.role}
                </p>
              </div>
              
              {/* Avatar */}
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                {user.username.charAt(0).toUpperCase()}
              </div>
            </div>

            {/* Logout */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={logout}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Logout"
            >
              <LogOut size={20} />
            </motion.button>
          </div>
        </div>
      </div>
    </nav>
  );
}