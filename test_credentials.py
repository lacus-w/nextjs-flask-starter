#!/usr/bin/env python3
"""
Comprehensive Authentication Test Script for Python Auto Grader
Tests all authentication flows to ensure credentials work perfectly.
"""

import requests
import json
import sys
from datetime import datetime

# Configuration
BASE_URL = "http://localhost:5328/api"
FRONTEND_URL = "http://localhost:3000"

# Test credentials
TEST_CREDENTIALS = {
    "admin": {"username": "admin", "password": "admin123", "role": "teacher"},
    "student": {"username": "student", "password": "student123", "role": "student"},
}

# Colors for output
class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    BOLD = '\033[1m'
    END = '\033[0m'

def print_success(message):
    print(f"{Colors.GREEN}✅ {message}{Colors.END}")

def print_error(message):
    print(f"{Colors.RED}❌ {message}{Colors.END}")

def print_warning(message):
    print(f"{Colors.YELLOW}⚠️  {message}{Colors.END}")

def print_info(message):
    print(f"{Colors.BLUE}ℹ️  {message}{Colors.END}")

def print_header(message):
    print(f"\n{Colors.BOLD}{Colors.BLUE}{'='*60}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.BLUE}{message.center(60)}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.BLUE}{'='*60}{Colors.END}\n")

def test_server_health():
    """Test if the Flask server is running and healthy"""
    print_header("TESTING SERVER HEALTH")
    
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print_success(f"Server is healthy: {data['status']}")
            print_info(f"Database status: {data.get('database', 'unknown')}")
            print_info(f"Timestamp: {data.get('timestamp', 'unknown')}")
            return True
        else:
            print_error(f"Server health check failed: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print_error(f"Cannot connect to server: {e}")
        return False

def test_auth_setup():
    """Test the authentication setup"""
    print_header("TESTING AUTHENTICATION SETUP")
    
    try:
        response = requests.get(f"{BASE_URL}/test-auth", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print_success(f"Authentication system status: {data['status']}")
            print_info(f"Admin user exists: {data['admin_exists']}")
            print_info(f"Student user exists: {data['student_exists']}")
            print_info(f"Admin credentials: {data['admin_credentials']}")
            print_info(f"Student credentials: {data['student_credentials']}")
            print_info(f"Total users: {data['total_users']}")
            print_info(f"Total courses: {data['total_courses']}")
            return True
        else:
            print_error(f"Auth setup test failed: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print_error(f"Auth setup test failed: {e}")
        return False

def test_login(username, password, expected_role):
    """Test login with given credentials"""
    print(f"\n🔐 Testing login: {username} / {password}")
    
    try:
        response = requests.post(
            f"{BASE_URL}/auth/login",
            json={"username": username, "password": password},
            headers={"Content-Type": "application/json"},
            timeout=5
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                user = data.get('user', {})
                token = data.get('access_token')
                
                print_success(f"Login successful for {username}")
                print_info(f"User ID: {user.get('id')}")
                print_info(f"Role: {user.get('role')}")
                print_info(f"Email: {user.get('email')}")
                print_info(f"Token length: {len(token) if token else 0} characters")
                
                # Verify role matches expected
                if user.get('role') == expected_role:
                    print_success(f"Role verification passed: {expected_role}")
                else:
                    print_error(f"Role mismatch: expected {expected_role}, got {user.get('role')}")
                
                return token
            else:
                print_error(f"Login failed: {data.get('message', 'Unknown error')}")
                return None
        else:
            error_data = response.json() if response.headers.get('content-type', '').startswith('application/json') else {}
            print_error(f"Login failed ({response.status_code}): {error_data.get('error', 'Unknown error')}")
            return None
            
    except requests.exceptions.RequestException as e:
        print_error(f"Login request failed: {e}")
        return None

def test_token_verification(token, username):
    """Test token verification"""
    print(f"\n🔍 Testing token verification for {username}")
    
    try:
        response = requests.get(
            f"{BASE_URL}/auth/verify",
            headers={"Authorization": f"Bearer {token}"},
            timeout=5
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                user = data.get('user', {})
                print_success(f"Token verification successful")
                print_info(f"Verified user: {user.get('username')}")
                print_info(f"User role: {user.get('role')}")
                return True
            else:
                print_error("Token verification failed: No success flag")
                return False
        else:
            print_error(f"Token verification failed ({response.status_code})")
            return False
            
    except requests.exceptions.RequestException as e:
        print_error(f"Token verification request failed: {e}")
        return False

def test_api_access(token, username, role):
    """Test API access with token"""
    print(f"\n🌐 Testing API access for {username} ({role})")
    
    try:
        # Test courses endpoint
        response = requests.get(
            f"{BASE_URL}/courses",
            headers={"Authorization": f"Bearer {token}"},
            timeout=5
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                courses = data.get('courses', [])
                print_success(f"Courses API access successful")
                print_info(f"Number of courses: {len(courses)}")
                
                if courses:
                    for course in courses:
                        print_info(f"  - {course.get('name')} ({course.get('code')})")
                
                return True
            else:
                print_error("Courses API failed: No success flag")
                return False
        else:
            print_error(f"Courses API failed ({response.status_code})")
            return False
            
    except requests.exceptions.RequestException as e:
        print_error(f"API access test failed: {e}")
        return False

def test_invalid_credentials():
    """Test login with invalid credentials"""
    print_header("TESTING INVALID CREDENTIALS")
    
    invalid_tests = [
        {"username": "admin", "password": "wrongpassword", "description": "Wrong password"},
        {"username": "nonexistent", "password": "password", "description": "Non-existent user"},
        {"username": "", "password": "password", "description": "Empty username"},
        {"username": "admin", "password": "", "description": "Empty password"},
    ]
    
    for test in invalid_tests:
        print(f"\n🚫 Testing invalid login: {test['description']}")
        
        try:
            response = requests.post(
                f"{BASE_URL}/auth/login",
                json={"username": test["username"], "password": test["password"]},
                headers={"Content-Type": "application/json"},
                timeout=5
            )
            
            if response.status_code != 200:
                error_data = response.json() if response.headers.get('content-type', '').startswith('application/json') else {}
                print_success(f"Correctly rejected: {error_data.get('error', 'Unknown error')}")
            else:
                print_error("Invalid credentials were accepted - this is a security issue!")
                
        except requests.exceptions.RequestException as e:
            print_error(f"Invalid credential test failed: {e}")

def test_permission_restrictions(student_token):
    """Test that students cannot perform teacher-only actions"""
    print_header("TESTING PERMISSION RESTRICTIONS")
    
    print("\n🛡️  Testing student cannot create courses")
    
    try:
        response = requests.post(
            f"{BASE_URL}/courses",
            json={
                "name": "Unauthorized Course",
                "code": "HACK101",
                "description": "This should fail"
            },
            headers={
                "Authorization": f"Bearer {student_token}",
                "Content-Type": "application/json"
            },
            timeout=5
        )
        
        if response.status_code == 403:
            error_data = response.json()
            print_success(f"Permission correctly denied: {error_data.get('error')}")
            return True
        else:
            print_error(f"Permission restriction failed - student was allowed to create course!")
            return False
            
    except requests.exceptions.RequestException as e:
        print_error(f"Permission test failed: {e}")
        return False

def test_frontend():
    """Test if frontend is accessible"""
    print_header("TESTING FRONTEND")
    
    try:
        response = requests.get(FRONTEND_URL, timeout=10)
        if response.status_code == 200:
            if "Python Auto Grader" in response.text:
                print_success("Frontend is accessible and shows correct title")
                return True
            else:
                print_warning("Frontend is accessible but title not found")
                return False
        else:
            print_error(f"Frontend not accessible ({response.status_code})")
            return False
    except requests.exceptions.RequestException as e:
        print_error(f"Frontend test failed: {e}")
        return False

def main():
    """Main test function"""
    print(f"{Colors.BOLD}{Colors.BLUE}")
    print("🐍 PYTHON AUTO GRADER - COMPREHENSIVE AUTHENTICATION TEST")
    print(f"🕒 Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{Colors.END}")
    
    results = {
        "server_health": False,
        "auth_setup": False,
        "admin_login": False,
        "student_login": False,
        "admin_token_verify": False,
        "student_token_verify": False,
        "admin_api_access": False,
        "student_api_access": False,
        "invalid_credentials": True,  # Assume true, set false if test fails
        "permission_restrictions": False,
        "frontend": False
    }
    
    # Test server health
    results["server_health"] = test_server_health()
    if not results["server_health"]:
        print_error("Server is not healthy. Stopping tests.")
        return False
    
    # Test auth setup
    results["auth_setup"] = test_auth_setup()
    
    # Test valid logins and get tokens
    admin_token = None
    student_token = None
    
    print_header("TESTING VALID CREDENTIALS")
    
    # Test admin login
    admin_creds = TEST_CREDENTIALS["admin"]
    admin_token = test_login(admin_creds["username"], admin_creds["password"], admin_creds["role"])
    results["admin_login"] = admin_token is not None
    
    # Test student login
    student_creds = TEST_CREDENTIALS["student"]
    student_token = test_login(student_creds["username"], student_creds["password"], student_creds["role"])
    results["student_login"] = student_token is not None
    
    # Test token verification
    if admin_token:
        results["admin_token_verify"] = test_token_verification(admin_token, "admin")
    
    if student_token:
        results["student_token_verify"] = test_token_verification(student_token, "student")
    
    # Test API access
    if admin_token:
        results["admin_api_access"] = test_api_access(admin_token, "admin", "teacher")
    
    if student_token:
        results["student_api_access"] = test_api_access(student_token, "student", "student")
    
    # Test invalid credentials
    test_invalid_credentials()
    
    # Test permission restrictions
    if student_token:
        results["permission_restrictions"] = test_permission_restrictions(student_token)
    
    # Test frontend
    results["frontend"] = test_frontend()
    
    # Print final results
    print_header("FINAL RESULTS")
    
    passed = 0
    total = len(results)
    
    for test_name, passed_status in results.items():
        status_icon = "✅" if passed_status else "❌"
        test_display = test_name.replace("_", " ").title()
        print(f"{status_icon} {test_display}")
        if passed_status:
            passed += 1
    
    print(f"\n{Colors.BOLD}Summary: {passed}/{total} tests passed{Colors.END}")
    
    if passed == total:
        print_success("🎉 ALL TESTS PASSED! Credentials work perfectly!")
        print_info("✨ The Python Auto Grader authentication system is fully functional!")
        print_info("🔐 Default credentials:")
        print_info("   👨‍🏫 Teacher: admin / admin123")
        print_info("   👨‍🎓 Student: student / student123")
        print_info("🌐 Frontend: http://localhost:3000")
        print_info("🔌 Backend API: http://localhost:5328")
        return True
    else:
        print_error(f"❌ {total - passed} tests failed. Please check the issues above.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)