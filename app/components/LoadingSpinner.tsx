export default function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-700 rounded-full animate-spin"></div>
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-red-500 rounded-full animate-spin border-t-transparent"></div>
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Loading Python Auto Grader
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Please wait while we prepare your workspace...
          </p>
        </div>
      </div>
    </div>
  );
}