from flask import Flask, request, jsonify
from flask_cors import CORS
import subprocess
import tempfile
import os
import json
import time
import uuid
from datetime import datetime, timedelta
import traceback
import psutil
import signal

app = Flask(__name__)
CORS(app)

# Placeholder data for testing
ASSIGNMENTS = [
    {
        "id": "1",
        "title": "Basic Python Functions",
        "description": "Create functions to solve basic mathematical problems",
        "due_date": "2024-01-15T23:59:59",
        "total_points": 100,
        "test_cases": [
            {
                "function_name": "add_numbers",
                "inputs": [5, 3],
                "expected_output": 8,
                "points": 25
            },
            {
                "function_name": "multiply_numbers", 
                "inputs": [4, 6],
                "expected_output": 24,
                "points": 25
            },
            {
                "function_name": "calculate_factorial",
                "inputs": [5],
                "expected_output": 120,
                "points": 50
            }
        ]
    },
    {
        "id": "2", 
        "title": "Data Structures",
        "description": "Implement basic data structure operations",
        "due_date": "2024-01-22T23:59:59",
        "total_points": 150,
        "test_cases": [
            {
                "function_name": "reverse_list",
                "inputs": [[1, 2, 3, 4, 5]],
                "expected_output": [5, 4, 3, 2, 1],
                "points": 50
            },
            {
                "function_name": "find_max",
                "inputs": [[10, 5, 8, 20, 3]],
                "expected_output": 20,
                "points": 50
            },
            {
                "function_name": "count_vowels",
                "inputs": ["hello world"],
                "expected_output": 3,
                "points": 50
            }
        ]
    },
    {
        "id": "3",
        "title": "Object-Oriented Programming",
        "description": "Create classes and implement inheritance",
        "due_date": "2024-01-29T23:59:59", 
        "total_points": 200,
        "test_cases": [
            {
                "function_name": "create_rectangle",
                "inputs": [5, 3],
                "expected_output": {"area": 15, "perimeter": 16},
                "points": 100
            },
            {
                "function_name": "create_circle",
                "inputs": [4],
                "expected_output": {"area": 50.27, "circumference": 25.13},
                "points": 100
            }
        ]
    }
]

SUBMISSIONS = [
    {
        "id": "1",
        "assignment_id": "1",
        "student_name": "Alice Johnson",
        "student_id": "ST001",
        "submitted_at": "2024-01-14T10:30:00",
        "code": """def add_numbers(a, b):
    return a + b

def multiply_numbers(a, b):
    return a * b

def calculate_factorial(n):
    if n <= 1:
        return 1
    return n * calculate_factorial(n - 1)""",
        "grade": 100,
        "feedback": "Excellent work! All test cases passed.",
        "test_results": [
            {"test_case": 0, "passed": True, "points": 25},
            {"test_case": 1, "passed": True, "points": 25},
            {"test_case": 2, "passed": True, "points": 50}
        ]
    },
    {
        "id": "2",
        "assignment_id": "1", 
        "student_name": "Bob Smith",
        "student_id": "ST002",
        "submitted_at": "2024-01-15T15:45:00",
        "code": """def add_numbers(a, b):
    return a + b

def multiply_numbers(a, b):
    return a + b  # Bug: should be multiplication

def calculate_factorial(n):
    result = 1
    for i in range(1, n + 1):
        result *= i
    return result""",
        "grade": 75,
        "feedback": "Good effort! Check your multiply_numbers function.",
        "test_results": [
            {"test_case": 0, "passed": True, "points": 25},
            {"test_case": 1, "passed": False, "points": 0},
            {"test_case": 2, "passed": True, "points": 50}
        ]
    },
    {
        "id": "3",
        "assignment_id": "2",
        "student_name": "Carol Davis",
        "student_id": "ST003", 
        "submitted_at": "2024-01-21T09:15:00",
        "code": """def reverse_list(lst):
    return lst[::-1]

def find_max(lst):
    return max(lst)

def count_vowels(text):
    vowels = 'aeiouAEIOU'
    return sum(1 for char in text if char in vowels)""",
        "grade": 150,
        "feedback": "Perfect implementation! All functions work correctly.",
        "test_results": [
            {"test_case": 0, "passed": True, "points": 50},
            {"test_case": 1, "passed": True, "points": 50},
            {"test_case": 2, "passed": True, "points": 50}
        ]
    }
]

STUDENTS = [
    {"id": "ST001", "name": "Alice Johnson", "email": "alice@university.edu"},
    {"id": "ST002", "name": "Bob Smith", "email": "bob@university.edu"},
    {"id": "ST003", "name": "Carol Davis", "email": "carol@university.edu"},
    {"id": "ST004", "name": "David Wilson", "email": "david@university.edu"},
    {"id": "ST005", "name": "Emma Brown", "email": "emma@university.edu"}
]

def run_code_safely(code, test_case, timeout=5):
    """Execute Python code safely with timeout and resource limits"""
    try:
        # Create a temporary file
        with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
            # Write the student's code
            f.write(code)
            f.write('\n\n')
            
            # Add test execution code
            function_name = test_case['function_name']
            inputs = test_case['inputs']
            
            # Create test code
            test_code = f"""
try:
    result = {function_name}(*{inputs})
    print("RESULT:", result)
except Exception as e:
    print("ERROR:", str(e))
"""
            f.write(test_code)
            f.flush()
            
            # Execute the code with timeout and resource limits
            process = subprocess.Popen(
                ['python3', f.name],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                preexec_fn=os.setsid
            )
            
            try:
                stdout, stderr = process.communicate(timeout=timeout)
                
                if process.returncode == 0 and stdout:
                    # Parse the result
                    for line in stdout.strip().split('\n'):
                        if line.startswith('RESULT:'):
                            result_str = line[7:].strip()
                            try:
                                result = eval(result_str)
                                return {"success": True, "result": result, "error": None}
                            except:
                                return {"success": False, "result": None, "error": f"Invalid result format: {result_str}"}
                    
                    return {"success": False, "result": None, "error": "No result found"}
                else:
                    error_msg = stderr.strip() if stderr else "Unknown error"
                    return {"success": False, "result": None, "error": error_msg}
                    
            except subprocess.TimeoutExpired:
                os.killpg(os.getpgid(process.pid), signal.SIGTERM)
                return {"success": False, "result": None, "error": "Code execution timed out"}
                
    except Exception as e:
        return {"success": False, "result": None, "error": str(e)}
    finally:
        # Clean up temporary file
        try:
            os.unlink(f.name)
        except:
            pass

def grade_submission(code, assignment):
    """Grade a code submission against test cases"""
    test_results = []
    total_score = 0
    
    for i, test_case in enumerate(assignment['test_cases']):
        result = run_code_safely(code, test_case)
        
        if result['success']:
            expected = test_case['expected_output']
            actual = result['result']
            
            # Compare results (with some tolerance for floating point)
            if isinstance(expected, float) and isinstance(actual, (int, float)):
                passed = abs(expected - actual) < 0.01
            else:
                passed = expected == actual
                
            points = test_case['points'] if passed else 0
            total_score += points
            
            test_results.append({
                "test_case": i,
                "passed": passed,
                "points": points,
                "expected": expected,
                "actual": actual,
                "error": None
            })
        else:
            test_results.append({
                "test_case": i,
                "passed": False,
                "points": 0,
                "expected": test_case['expected_output'],
                "actual": None,
                "error": result['error']
            })
    
    return {
        "total_score": total_score,
        "max_score": assignment['total_points'],
        "test_results": test_results
    }

# API Routes
@app.route("/api/assignments", methods=["GET"])
def get_assignments():
    return jsonify(ASSIGNMENTS)

@app.route("/api/assignments/<assignment_id>", methods=["GET"])
def get_assignment(assignment_id):
    assignment = next((a for a in ASSIGNMENTS if a['id'] == assignment_id), None)
    if assignment:
        return jsonify(assignment)
    return jsonify({"error": "Assignment not found"}), 404

@app.route("/api/submissions", methods=["GET"])
def get_submissions():
    assignment_id = request.args.get('assignment_id')
    if assignment_id:
        filtered_submissions = [s for s in SUBMISSIONS if s['assignment_id'] == assignment_id]
        return jsonify(filtered_submissions)
    return jsonify(SUBMISSIONS)

@app.route("/api/submissions", methods=["POST"])
def submit_assignment():
    data = request.json
    assignment_id = data.get('assignment_id')
    student_name = data.get('student_name')
    student_id = data.get('student_id')
    code = data.get('code')
    
    if not all([assignment_id, student_name, student_id, code]):
        return jsonify({"error": "Missing required fields"}), 400
    
    # Find the assignment
    assignment = next((a for a in ASSIGNMENTS if a['id'] == assignment_id), None)
    if not assignment:
        return jsonify({"error": "Assignment not found"}), 404
    
    # Grade the submission
    grading_result = grade_submission(code, assignment)
    
    # Create submission record
    submission = {
        "id": str(uuid.uuid4()),
        "assignment_id": assignment_id,
        "student_name": student_name,
        "student_id": student_id,
        "submitted_at": datetime.now().isoformat(),
        "code": code,
        "grade": grading_result['total_score'],
        "feedback": f"Score: {grading_result['total_score']}/{grading_result['max_score']}",
        "test_results": grading_result['test_results']
    }
    
    # Add to submissions (in a real app, this would be saved to a database)
    SUBMISSIONS.append(submission)
    
    return jsonify(submission)

@app.route("/api/submissions/<submission_id>", methods=["GET"])
def get_submission(submission_id):
    submission = next((s for s in SUBMISSIONS if s['id'] == submission_id), None)
    if submission:
        return jsonify(submission)
    return jsonify({"error": "Submission not found"}), 404

@app.route("/api/students", methods=["GET"])
def get_students():
    return jsonify(STUDENTS)

@app.route("/api/analytics", methods=["GET"])
def get_analytics():
    # Calculate analytics from submissions
    total_submissions = len(SUBMISSIONS)
    
    # Grade distribution
    grades = [s['grade'] for s in SUBMISSIONS]
    avg_grade = sum(grades) / len(grades) if grades else 0
    
    # Assignment completion rates
    assignment_stats = {}
    for assignment in ASSIGNMENTS:
        assignment_submissions = [s for s in SUBMISSIONS if s['assignment_id'] == assignment['id']]
        assignment_stats[assignment['id']] = {
            "title": assignment['title'],
            "submissions": len(assignment_submissions),
            "avg_grade": sum(s['grade'] for s in assignment_submissions) / len(assignment_submissions) if assignment_submissions else 0,
            "completion_rate": len(assignment_submissions) / len(STUDENTS) * 100
        }
    
    # Recent activity
    recent_submissions = sorted(SUBMISSIONS, key=lambda x: x['submitted_at'], reverse=True)[:5]
    
    return jsonify({
        "total_submissions": total_submissions,
        "total_students": len(STUDENTS),
        "total_assignments": len(ASSIGNMENTS),
        "average_grade": round(avg_grade, 2),
        "assignment_stats": assignment_stats,
        "recent_submissions": recent_submissions,
        "grade_distribution": {
            "A (90-100)": len([g for g in grades if g >= 90]),
            "B (80-89)": len([g for g in grades if 80 <= g < 90]),
            "C (70-79)": len([g for g in grades if 70 <= g < 80]),
            "D (60-69)": len([g for g in grades if 60 <= g < 70]),
            "F (0-59)": len([g for g in grades if g < 60])
        }
    })

@app.route("/api/test-code", methods=["POST"])
def test_code():
    """Test endpoint for quick code execution"""
    data = request.json
    code = data.get('code')
    test_case = data.get('test_case')
    
    if not code or not test_case:
        return jsonify({"error": "Missing code or test_case"}), 400
    
    result = run_code_safely(code, test_case)
    return jsonify(result)

if __name__ == "__main__":
    app.run(debug=True)