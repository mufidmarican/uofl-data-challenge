#!/usr/bin/env python3
"""
Startup script for UofL Events Manager
"""

import os
import sys
import subprocess

def check_dependencies():
    """Check if all required dependencies are installed"""
    try:
        import flask
        import requests
        import pandas
        print("✅ All dependencies are installed")
        return True
    except ImportError as e:
        print(f"❌ Missing dependency: {e}")
        print("Please run: pip install -r requirements.txt")
        return False

def main():
    """Main startup function"""
    print("🚀 Starting UofL Events Manager...")
    print("=" * 50)
    
    # Check dependencies
    if not check_dependencies():
        sys.exit(1)
    
    # Start the Flask application
    try:
        print("🌐 Starting web server...")
        print("📱 Open your browser and go to: http://localhost:5000")
        print("⏹️  Press Ctrl+C to stop the server")
        print("=" * 50)
        
        # Import and run the app
        from app import app
        app.run(debug=True, host='0.0.0.0', port=5000)
        
    except KeyboardInterrupt:
        print("\n👋 Server stopped by user")
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
