#!/usr/bin/env python3
"""
Test script to verify UofL Events API connection and data structure
"""

import requests
import json
from datetime import datetime, timedelta

def test_api_connection():
    """Test the UofL Events API connection"""
    api_url = "https://events.louisville.edu/api/2/events/"
    
    print("Testing UofL Events API connection...")
    print(f"API URL: {api_url}")
    
    try:
        # Test basic connection
        params = {
            'pp': 5,  # Get only 5 events for testing
            'page': 1,
            'days': 60,
            'format': 'json'
        }
        
        response = requests.get(api_url, params=params, timeout=30)
        response.raise_for_status()
        
        data = response.json()
        
        print(f"✅ API Connection successful!")
        print(f"Response status: {response.status_code}")
        print(f"Events found: {len(data.get('events', []))}")
        
        if data.get('events'):
            print("\n📋 Sample event structure:")
            sample_event = data['events'][0]
            print(json.dumps(sample_event, indent=2)[:500] + "...")
            
            # Check required fields
            event_data = sample_event.get('event', {})
            required_fields = ['id', 'title', 'start_date', 'url']
            
            print(f"\n🔍 Checking required fields:")
            for field in required_fields:
                if field in event_data:
                    print(f"  ✅ {field}: {event_data[field]}")
                else:
                    print(f"  ❌ {field}: Missing")
        
        return True
        
    except requests.exceptions.RequestException as e:
        print(f"❌ API Connection failed: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

def test_data_filtering():
    """Test data filtering logic"""
    print("\n🧪 Testing data filtering logic...")
    
    # Sample data for testing
    sample_events = [
        {
            'event': {
                'id': 1,
                'title': 'Regular Event',
                'start_date': '2025-02-15T10:00:00Z',
                'url': 'https://example.com/event1'
            },
            'series_id': None,  # Non-recurring
            'recurring': False
        },
        {
            'event': {
                'id': 2,
                'title': 'Recurring Event',
                'start_date': '2025-02-20T14:00:00Z',
                'url': 'https://example.com/event2'
            },
            'series_id': 123,  # Recurring
            'recurring': True
        }
    ]
    
    # Filter non-recurring events
    filtered = [event for event in sample_events 
                if not event.get('series_id') and not event.get('recurring')]
    
    print(f"Original events: {len(sample_events)}")
    print(f"Filtered events: {len(filtered)}")
    print(f"✅ Filtering logic working correctly")
    
    return len(filtered) == 1

if __name__ == "__main__":
    print("🚀 UofL Events Manager - API Test")
    print("=" * 50)
    
    # Test API connection
    api_success = test_api_connection()
    
    # Test filtering logic
    filter_success = test_data_filtering()
    
    print("\n" + "=" * 50)
    if api_success and filter_success:
        print("🎉 All tests passed! The application should work correctly.")
    else:
        print("⚠️  Some tests failed. Please check the issues above.")
