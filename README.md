# Python Auto-Grader

A modern web application for automatically grading Python programming assignments. Built with Next.js frontend and Flask backend, featuring real-time code execution, automated testing, and comprehensive analytics.

## Features

### 🎯 Core Functionality
- **Automated Code Grading**: Execute and test Python code submissions safely
- **Real-time Testing**: Students can test their code before submission
- **Assignment Management**: Create and manage programming assignments with test cases
- **Submission Tracking**: View and analyze all student submissions
- **Analytics Dashboard**: Comprehensive insights into class performance

### 🎨 Modern UI/UX
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Clean Interface**: Modern, intuitive design with Tailwind CSS
- **Interactive Dashboard**: Real-time analytics and performance metrics
- **Code Editor**: Built-in code editor with syntax highlighting
- **Progress Tracking**: Visual feedback on test results and grades

### 🔒 Security Features
- **Safe Code Execution**: Sandboxed Python execution with timeouts
- **Resource Limits**: Memory and CPU usage restrictions
- **Input Validation**: Comprehensive validation of all inputs
- **Error Handling**: Graceful error handling and user feedback

## Technology Stack

### Frontend (Next.js)
- **Framework**: Next.js 13 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Charts**: Recharts
- **State Management**: React Hooks

### Backend (Flask)
- **Framework**: Flask
- **Language**: Python 3
- **CORS**: Flask-CORS
- **Code Execution**: Subprocess with security controls
- **Process Management**: psutil for resource monitoring

## Installation

### Prerequisites
- Node.js 18+ and pnpm
- Python 3.8+
- pip

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd python-autograder
   ```

2. **Install dependencies**
   ```bash
   # Install Node.js dependencies
   pnpm install
   
   # Install Python dependencies
   pip install -r requirements.txt
   ```

3. **Start the development servers**
   ```bash
   # Start both frontend and backend
   pnpm run dev
   
   # Or start them separately:
   # Frontend: pnpm run next-dev
   # Backend: pnpm run flask-dev
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5328

## Usage

### For Instructors

#### Creating Assignments
1. Navigate to the Assignments page
2. Click "New Assignment"
3. Define assignment details and test cases
4. Set due dates and point values

#### Viewing Submissions
1. Go to the Submissions page
2. Filter by assignment or student
3. Review grades and detailed test results
4. Export data for gradebook integration

#### Analytics Dashboard
- Monitor class performance
- View grade distributions
- Track submission patterns
- Identify struggling students

### For Students

#### Submitting Assignments
1. Browse available assignments
2. Click on an assignment to view details
3. Use the code editor to write solutions
4. Test code with "Run Tests" button
5. Submit when satisfied with results

#### Testing Code
- Real-time feedback on test cases
- See expected vs actual outputs
- Debug errors before submission
- Track progress with visual indicators

## API Endpoints

### Assignments
- `GET /api/assignments` - List all assignments
- `GET /api/assignments/{id}` - Get assignment details
- `POST /api/assignments` - Create new assignment (future)

### Submissions
- `GET /api/submissions` - List all submissions
- `GET /api/submissions/{id}` - Get submission details
- `POST /api/submissions` - Submit assignment solution

### Testing
- `POST /api/test-code` - Test code against specific test case

### Analytics
- `GET /api/analytics` - Get comprehensive analytics data

### Students
- `GET /api/students` - List all students

## Sample Data

The application comes with placeholder data including:

### Assignments
1. **Basic Python Functions** - Mathematical operations and recursion
2. **Data Structures** - List operations and string manipulation
3. **Object-Oriented Programming** - Classes and inheritance

### Students
- Sample student profiles with IDs and contact information

### Submissions
- Example submissions with various grades and test results

## Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
FLASK_DEBUG=1
FLASK_ENV=development
```

### Security Settings
- Code execution timeout: 5 seconds
- Memory limits enforced via psutil
- Process isolation with subprocess

## Development

### Project Structure
```
├── app/                    # Next.js app directory
│   ├── assignments/        # Assignment pages
│   ├── submissions/        # Submission pages
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Dashboard
├── api/                   # Flask backend
│   └── index.py          # Main API file
├── public/               # Static assets
├── requirements.txt      # Python dependencies
├── package.json         # Node.js dependencies
└── tailwind.config.js   # Tailwind configuration
```

### Adding New Features

#### New Assignment Types
1. Extend the assignment schema in `api/index.py`
2. Update the frontend components
3. Add new test case types

#### Additional Analytics
1. Add new endpoints in Flask backend
2. Create corresponding frontend components
3. Update the dashboard with new metrics

## Security Considerations

### Code Execution Safety
- All student code runs in isolated subprocesses
- Strict timeout limits prevent infinite loops
- Resource usage monitoring prevents system overload
- File system access restrictions

### Input Validation
- All API inputs are validated
- SQL injection prevention (when database is added)
- XSS protection with proper escaping

## Future Enhancements

### Planned Features
- **Database Integration**: PostgreSQL for persistent data
- **User Authentication**: Login system for students and instructors
- **Plagiarism Detection**: Code similarity analysis
- **Advanced Analytics**: ML-powered insights
- **Export Features**: CSV/PDF report generation
- **Real-time Notifications**: WebSocket integration
- **Code Review Tools**: Inline commenting and feedback

### Scalability Improvements
- **Docker Containerization**: Easy deployment and scaling
- **Queue System**: Background job processing
- **Caching Layer**: Redis for improved performance
- **Load Balancing**: Multiple backend instances

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For questions or issues:
1. Check the documentation
2. Search existing issues
3. Create a new issue with detailed information
4. Contact the development team

---

Built with ❤️ for education and learning.
