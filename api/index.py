from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
import subprocess
import tempfile
import os
import json
import traceback
from typing import Dict, Any

app = Flask(__name__)
CORS(app)

# Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///grading_system.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'your-secret-key-change-this-in-production'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)

db = SQLAlchemy(app)
jwt = JWTManager(app)

# Database Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(120), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='student')  # 'teacher' or 'student'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    assignments_created = db.relationship('Assignment', backref='creator', lazy=True, foreign_keys='Assignment.teacher_id')
    submissions = db.relationship('Submission', backref='student', lazy=True)

class Course(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    code = db.Column(db.String(20), unique=True, nullable=False)
    description = db.Column(db.Text)
    teacher_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    assignments = db.relationship('Assignment', backref='course', lazy=True)
    enrollments = db.relationship('Enrollment', backref='course', lazy=True)

class Enrollment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey('course.id'), nullable=False)
    enrolled_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    student = db.relationship('User', backref='enrollments')

class Assignment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    course_id = db.Column(db.Integer, db.ForeignKey('course.id'), nullable=False)
    teacher_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    due_date = db.Column(db.DateTime, nullable=False)
    max_score = db.Column(db.Integer, default=100)
    test_cases = db.Column(db.Text)  # JSON string of test cases
    starter_code = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)
    
    # Relationships
    submissions = db.relationship('Submission', backref='assignment', lazy=True)
    test_results = db.relationship('TestResult', backref='assignment', lazy=True)

class Submission(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    assignment_id = db.Column(db.Integer, db.ForeignKey('assignment.id'), nullable=False)
    student_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    code = db.Column(db.Text, nullable=False)
    submitted_at = db.Column(db.DateTime, default=datetime.utcnow)
    score = db.Column(db.Integer)
    feedback = db.Column(db.Text)
    status = db.Column(db.String(20), default='pending')  # 'pending', 'graded', 'error'
    
    # Relationships
    test_results = db.relationship('TestResult', backref='submission', lazy=True)

class TestResult(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    submission_id = db.Column(db.Integer, db.ForeignKey('submission.id'), nullable=False)
    assignment_id = db.Column(db.Integer, db.ForeignKey('assignment.id'), nullable=False)
    test_case_name = db.Column(db.String(100), nullable=False)
    expected_output = db.Column(db.Text)
    actual_output = db.Column(db.Text)
    passed = db.Column(db.Boolean, nullable=False)
    error_message = db.Column(db.Text)
    execution_time = db.Column(db.Float)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# Auto-grading Engine
class AutoGrader:
    @staticmethod
    def run_code(code: str, test_cases: list) -> Dict[str, Any]:
        """Execute Python code with test cases and return results"""
        results = {
            'total_tests': len(test_cases),
            'passed_tests': 0,
            'test_results': [],
            'execution_error': None,
            'score': 0
        }
        
        try:
            # Create a temporary file for the code
            with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
                f.write(code)
                temp_file = f.name
            
            for i, test_case in enumerate(test_cases):
                test_result = AutoGrader._run_single_test(temp_file, test_case, i)
                results['test_results'].append(test_result)
                if test_result['passed']:
                    results['passed_tests'] += 1
            
            # Calculate score
            if results['total_tests'] > 0:
                results['score'] = int((results['passed_tests'] / results['total_tests']) * 100)
            
        except Exception as e:
            results['execution_error'] = str(e)
        finally:
            # Clean up temporary file
            if 'temp_file' in locals():
                os.unlink(temp_file)
        
        return results
    
    @staticmethod
    def _run_single_test(file_path: str, test_case: dict, test_index: int) -> Dict[str, Any]:
        """Run a single test case"""
        result = {
            'test_name': test_case.get('name', f'Test {test_index + 1}'),
            'expected': test_case.get('expected', ''),
            'actual': '',
            'passed': False,
            'error': None,
            'execution_time': 0
        }
        
        try:
            start_time = datetime.now()
            
            # Prepare test input
            test_input = test_case.get('input', '')
            
            # Run the code with test input
            process = subprocess.run(
                ['python3', file_path],
                input=test_input,
                capture_output=True,
                text=True,
                timeout=10  # 10 second timeout
            )
            
            end_time = datetime.now()
            result['execution_time'] = (end_time - start_time).total_seconds()
            
            if process.returncode == 0:
                result['actual'] = process.stdout.strip()
                result['passed'] = result['actual'] == str(test_case.get('expected', '')).strip()
            else:
                result['error'] = process.stderr
                result['actual'] = process.stdout
                
        except subprocess.TimeoutExpired:
            result['error'] = 'Code execution timed out (10 seconds)'
        except Exception as e:
            result['error'] = str(e)
        
        return result

# API Routes

@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    
    # Validate input
    if not data.get('username') or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Missing required fields'}), 400
    
    # Check if user already exists
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username already exists'}), 400
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already exists'}), 400
    
    # Create new user
    user = User(
        username=data['username'],
        email=data['email'],
        password_hash=generate_password_hash(data['password']),
        role=data.get('role', 'student')
    )
    
    db.session.add(user)
    db.session.commit()
    
    # Create access token
    access_token = create_access_token(identity=str(user.id))
    
    return jsonify({
        'access_token': access_token,
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'role': user.role
        }
    }), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data.get('username') or not data.get('password'):
        return jsonify({'error': 'Missing username or password'}), 400
    
    user = User.query.filter_by(username=data['username']).first()
    
    if user and check_password_hash(user.password_hash, data['password']):
        access_token = create_access_token(identity=str(user.id))
        return jsonify({
            'access_token': access_token,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'role': user.role
            }
        })
    
    return jsonify({'error': 'Invalid credentials'}), 401

@app.route('/api/courses', methods=['GET'])
@jwt_required()
def get_courses():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    
    if user.role == 'teacher':
        courses = Course.query.filter_by(teacher_id=user_id).all()
    else:
        # Get enrolled courses for students
        enrollments = Enrollment.query.filter_by(student_id=user_id).all()
        courses = [enrollment.course for enrollment in enrollments]
    
    return jsonify([{
        'id': course.id,
        'name': course.name,
        'code': course.code,
        'description': course.description,
        'created_at': course.created_at.isoformat()
    } for course in courses])

@app.route('/api/courses', methods=['POST'])
@jwt_required()
def create_course():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    
    if user.role != 'teacher':
        return jsonify({'error': 'Only teachers can create courses'}), 403
    
    data = request.get_json()
    
    course = Course(
        name=data['name'],
        code=data['code'],
        description=data.get('description', ''),
        teacher_id=user_id
    )
    
    db.session.add(course)
    db.session.commit()
    
    return jsonify({
        'id': course.id,
        'name': course.name,
        'code': course.code,
        'description': course.description
    }), 201

@app.route('/api/courses/<int:course_id>/assignments', methods=['GET'])
@jwt_required()
def get_assignments(course_id):
    assignments = Assignment.query.filter_by(course_id=course_id, is_active=True).all()
    
    return jsonify([{
        'id': assignment.id,
        'title': assignment.title,
        'description': assignment.description,
        'due_date': assignment.due_date.isoformat(),
        'max_score': assignment.max_score,
        'created_at': assignment.created_at.isoformat()
    } for assignment in assignments])

@app.route('/api/assignments', methods=['POST'])
@jwt_required()
def create_assignment():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    
    if user.role != 'teacher':
        return jsonify({'error': 'Only teachers can create assignments'}), 403
    
    data = request.get_json()
    
    assignment = Assignment(
        title=data['title'],
        description=data.get('description', ''),
        course_id=data['course_id'],
        teacher_id=user_id,
        due_date=datetime.fromisoformat(data['due_date']),
        max_score=data.get('max_score', 100),
        test_cases=json.dumps(data.get('test_cases', [])),
        starter_code=data.get('starter_code', '')
    )
    
    db.session.add(assignment)
    db.session.commit()
    
    return jsonify({
        'id': assignment.id,
        'title': assignment.title,
        'description': assignment.description,
        'due_date': assignment.due_date.isoformat(),
        'max_score': assignment.max_score
    }), 201

@app.route('/api/assignments/<int:assignment_id>', methods=['GET'])
@jwt_required()
def get_assignment(assignment_id):
    assignment = Assignment.query.get_or_404(assignment_id)
    
    return jsonify({
        'id': assignment.id,
        'title': assignment.title,
        'description': assignment.description,
        'due_date': assignment.due_date.isoformat(),
        'max_score': assignment.max_score,
        'starter_code': assignment.starter_code,
        'test_cases': json.loads(assignment.test_cases) if assignment.test_cases else []
    })

@app.route('/api/submissions', methods=['POST'])
@jwt_required()
def submit_assignment():
    user_id = int(get_jwt_identity())
    data = request.get_json()
    
    # Create submission
    submission = Submission(
        assignment_id=data['assignment_id'],
        student_id=user_id,
        code=data['code'],
        status='pending'
    )
    
    db.session.add(submission)
    db.session.commit()
    
    # Get assignment and test cases
    assignment = Assignment.query.get(data['assignment_id'])
    test_cases = json.loads(assignment.test_cases) if assignment.test_cases else []
    
    # Run auto-grading
    grading_results = AutoGrader.run_code(data['code'], test_cases)
    
    # Update submission with results
    submission.score = grading_results['score']
    submission.status = 'graded' if not grading_results['execution_error'] else 'error'
    submission.feedback = json.dumps(grading_results)
    
    # Save test results
    for test_result in grading_results['test_results']:
        test_record = TestResult(
            submission_id=submission.id,
            assignment_id=assignment.id,
            test_case_name=test_result['test_name'],
            expected_output=test_result['expected'],
            actual_output=test_result['actual'],
            passed=test_result['passed'],
            error_message=test_result.get('error'),
            execution_time=test_result['execution_time']
        )
        db.session.add(test_record)
    
    db.session.commit()
    
    return jsonify({
        'submission_id': submission.id,
        'score': submission.score,
        'status': submission.status,
        'results': grading_results
    })

@app.route('/api/assignments/<int:assignment_id>/submissions', methods=['GET'])
@jwt_required()
def get_submissions(assignment_id):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    
    if user.role == 'teacher':
        # Teachers can see all submissions
        submissions = Submission.query.filter_by(assignment_id=assignment_id).all()
    else:
        # Students can only see their own submissions
        submissions = Submission.query.filter_by(assignment_id=assignment_id, student_id=user_id).all()
    
    return jsonify([{
        'id': submission.id,
        'student_id': submission.student_id,
        'student_name': submission.student.username,
        'submitted_at': submission.submitted_at.isoformat(),
        'score': submission.score,
        'status': submission.status
    } for submission in submissions])

@app.route('/api/submissions/<int:submission_id>', methods=['GET'])
@jwt_required()
def get_submission_details(submission_id):
    submission = Submission.query.get_or_404(submission_id)
    
    return jsonify({
        'id': submission.id,
        'code': submission.code,
        'score': submission.score,
        'status': submission.status,
        'submitted_at': submission.submitted_at.isoformat(),
        'feedback': json.loads(submission.feedback) if submission.feedback else None,
        'test_results': [{
            'test_name': result.test_case_name,
            'expected': result.expected_output,
            'actual': result.actual_output,
            'passed': result.passed,
            'error': result.error_message,
            'execution_time': result.execution_time
        } for result in submission.test_results]
    })

# Initialize database
def create_tables():
    db.create_all()
    
    # Create default admin user if it doesn't exist
    if not User.query.filter_by(username='admin').first():
        admin = User(
            username='admin',
            email='admin@example.com',
            password_hash=generate_password_hash('admin123'),
            role='teacher'
        )
        db.session.add(admin)
        db.session.commit()

# Health check endpoint
@app.route('/api/health')
def health_check():
    return jsonify({'status': 'healthy', 'timestamp': datetime.utcnow().isoformat()})

# Initialize database on startup
with app.app_context():
    create_tables()

if __name__ == '__main__':
    app.run(debug=True)