#!/usr/bin/env python3

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'api'))

from api.index import app, db, User, Course, Assignment, create_tables
from werkzeug.security import generate_password_hash
from datetime import datetime, timedelta

def init_database():
    """Initialize the database with sample data"""
    with app.app_context():
        # Create tables
        create_tables()
        
        # Create sample course for the admin user
        admin = User.query.filter_by(username='admin').first()
        if admin and not Course.query.filter_by(teacher_id=admin.id).first():
            sample_course = Course(
                name='Introduction to Python Programming',
                code='CS101',
                description='Learn the fundamentals of Python programming including variables, functions, loops, and data structures.',
                teacher_id=admin.id
            )
            db.session.add(sample_course)
            db.session.commit()
            
            # Create a sample assignment
            sample_assignment = Assignment(
                title='Hello World Program',
                description='Write a Python program that prints "Hello, World!" to the console.',
                course_id=sample_course.id,
                teacher_id=admin.id,
                due_date=datetime.utcnow() + timedelta(days=7),
                max_score=100,
                test_cases='[{"name": "Basic Test", "input": "", "expected": "Hello, World!"}]',
                starter_code='# Write your code here\nprint("Hello, World!")'
            )
            db.session.add(sample_assignment)
            db.session.commit()
            
            print("✅ Sample course and assignment created!")
        
        print("✅ Database initialized successfully!")

if __name__ == '__main__':
    init_database()