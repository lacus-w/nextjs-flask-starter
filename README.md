# Python Auto Grader

A modern assignment auto-grading system for Python programming courses, built with Next.js and Flask. Features a beautiful Apple Music-inspired UI design with comprehensive functionality for both teachers and students.

## 🚀 Features

### For Teachers
- **Course Management**: Create and manage multiple courses
- **Assignment Creation**: Design assignments with custom test cases
- **Automated Grading**: Real-time code execution and testing
- **Student Progress**: Track submissions and performance
- **Test Case Management**: Define input/output test cases for assignments

### For Students
- **Course Enrollment**: Join courses and view assignments
- **Code Submission**: Submit Python solutions with instant feedback
- **Real-time Results**: See test results and scores immediately
- **Progress Tracking**: Monitor your performance across assignments

### Technical Features
- **Secure Code Execution**: Sandboxed Python code execution with timeouts
- **Modern UI**: Apple Music-inspired design with smooth animations
- **Real-time Feedback**: Instant grading and detailed test results
- **Responsive Design**: Works perfectly on desktop and mobile devices
- **Dark Mode Support**: Automatic dark/light theme switching

## 🛠️ Tech Stack

### Frontend
- **Next.js 13** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **Lucide React** - Beautiful icons
- **React Hot Toast** - Elegant notifications

### Backend
- **Flask** - Python web framework
- **SQLAlchemy** - Database ORM
- **Flask-JWT-Extended** - JWT authentication
- **SQLite** - Database (easily replaceable with PostgreSQL/MySQL)
- **bcrypt** - Password hashing

## 📦 Installation

### Prerequisites
- Node.js 16+ and pnpm
- Python 3.8+
- Git

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd python-auto-grader
   ```

2. **Install frontend dependencies**
   ```bash
   pnpm install
   ```

3. **Install backend dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Initialize the database**
   ```bash
   python init_db.py
   ```

5. **Start the development servers**
   ```bash
   # Start both frontend and backend
   pnpm run dev
   
   # Or start them separately:
   # Frontend (in one terminal)
   pnpm run next-dev
   
   # Backend (in another terminal)
   pnpm run flask-dev
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5328

## 🔐 Default Credentials

The system comes with a default teacher account:
- **Username**: admin
- **Password**: admin123
- **Role**: Teacher

Students can register for new accounts through the registration form.

## 🏗️ Project Structure

```
python-auto-grader/
├── api/                    # Flask backend
│   └── index.py           # Main Flask application
├── app/                   # Next.js frontend
│   ├── components/        # React components
│   ├── lib/              # Utilities and API client
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Main page
├── public/               # Static assets
├── init_db.py           # Database initialization script
├── requirements.txt     # Python dependencies
├── package.json         # Node.js dependencies
└── README.md           # This file
```

## 🎨 UI Design

The application features a modern design inspired by Apple Music:

- **Clean Typography**: Inter font for excellent readability
- **Smooth Animations**: Framer Motion for delightful interactions
- **Glass Morphism**: Subtle transparency effects
- **Consistent Spacing**: Carefully crafted spacing system
- **Color Palette**: Red accent colors with neutral grays
- **Dark Mode**: Automatic theme switching based on system preference

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Courses
- `GET /api/courses` - List user's courses
- `POST /api/courses` - Create new course (teachers only)

### Assignments
- `GET /api/courses/{id}/assignments` - List course assignments
- `POST /api/assignments` - Create assignment (teachers only)
- `GET /api/assignments/{id}` - Get assignment details

### Submissions
- `POST /api/submissions` - Submit assignment solution
- `GET /api/assignments/{id}/submissions` - List submissions
- `GET /api/submissions/{id}` - Get submission details

## 🧪 Auto-Grading System

The auto-grading engine:

1. **Receives** student code submission
2. **Creates** temporary Python file
3. **Executes** code with test case inputs
4. **Compares** output with expected results
5. **Calculates** score based on passed tests
6. **Returns** detailed feedback and results

### Security Features
- **Sandboxed Execution**: Code runs in isolated environment
- **Timeout Protection**: 10-second execution limit
- **Input Validation**: Sanitized test inputs
- **Error Handling**: Graceful error reporting

## 🚀 Deployment

### Production Setup

1. **Environment Variables**
   ```bash
   export FLASK_ENV=production
   export JWT_SECRET_KEY=your-secure-secret-key
   export DATABASE_URL=your-database-url
   ```

2. **Database Migration**
   ```bash
   # For production, consider using PostgreSQL
   pip install psycopg2-binary
   # Update DATABASE_URL in api/index.py
   ```

3. **Build Frontend**
   ```bash
   pnpm run build
   ```

4. **Deploy**
   - Frontend: Deploy to Vercel, Netlify, or similar
   - Backend: Deploy to Heroku, Railway, or similar
   - Database: Use managed PostgreSQL service

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Inspired by Apple Music's beautiful design system
- Built with modern web technologies for optimal performance
- Designed for educational use in Python programming courses

---

**Happy Coding! 🐍✨**
