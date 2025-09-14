#!/usr/bin/env python3
"""
Simple test script to verify the UofL Events API functionality
"""

import requests
import json
from datetime import datetime, timedelta

def test_uofl_api():
    """Test the UofL Events API directly"""
    print("🧪 Testing UofL Events API...")
    
    # Test basic API call
    api_url = "https://events.louisville.edu/api/2/events/"
    
    # Calculate date range
    today = datetime.now()
    end_date = today + timedelta(days=60)
    
    params = {
        'pp': 10,  # Small number for testing
        'days': 60,
        'start': today.strftime('%Y-%m-%d'),
        'end': end_date.strftime('%Y-%m-%d')
    }
    
    try:
        print(f"📡 Making request to: {api_url}")
        print(f"📅 Date range: {params['start']} to {params['end']}")
        
        response = requests.get(api_url, params=params, timeout=30)
        response.raise_for_status()
        
        data = response.json()
        
        print(f"✅ API Response Status: {response.status_code}")
        print(f"📊 Events returned: {len(data.get('events', []))}")
        
        if data.get('events'):
            sample_event = data['events'][0]
            print(f"📝 Sample event title: {sample_event.get('event', {}).get('title', 'N/A')}")
            print(f"📅 Sample event date: {sample_event.get('event', {}).get('start_date', 'N/A')}")
            print(f"📍 Sample event location: {sample_event.get('event', {}).get('room_number', 'N/A')}")
        
        return True
        
    except requests.exceptions.RequestException as e:
        print(f"❌ API Error: {e}")
        return False
    except json.JSONDecodeError as e:
        print(f"❌ JSON Decode Error: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected Error: {e}")
        return False

def test_local_api():
    """Test the local Flask API"""
    print("\n🏠 Testing Local Flask API...")
    
    try:
        # Test if Flask app is running
        response = requests.get('http://localhost:5000/api/summary', timeout=10)
        
        if response.status_code == 200:
            print("✅ Local API is running and responding")
            data = response.json()
            if data.get('success'):
                print("✅ API returned successful response")
                return True
            else:
                print(f"❌ API returned error: {data.get('error')}")
                return False
        else:
            print(f"❌ API returned status code: {response.status_code}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to local API. Make sure Flask app is running on port 5000")
        return False
    except Exception as e:
        print(f"❌ Error testing local API: {e}")
        return False

if __name__ == "__main__":
    print("🚀 UofL Events Data Manager - API Test Suite")
    print("=" * 50)
    
    # Test UofL API
    uofl_success = test_uofl_api()
    
    # Test local API
    local_success = test_local_api()
    
    print("\n📋 Test Results:")
    print(f"UofL API: {'✅ PASS' if uofl_success else '❌ FAIL'}")
    print(f"Local API: {'✅ PASS' if local_success else '❌ FAIL'}")
    
    if uofl_success and local_success:
        print("\n🎉 All tests passed! The application is ready to use.")
    else:
        print("\n⚠️  Some tests failed. Please check the errors above.")
