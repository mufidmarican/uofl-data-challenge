"""
UofL Data Manager Challenge - Backend API
Fetches, filters, and transforms event data from UofL Events API
"""

import requests
import json
import csv
from datetime import datetime, timedelta
from flask import Flask, jsonify, render_template, request
from flask_cors import CORS
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Configuration
API_BASE_URL = "https://events.louisville.edu/api/2/events/"
DAYS_AHEAD = 60

class EventDataManager:
    """Manages fetching, filtering, and transforming event data"""
    
    def __init__(self):
        self.events = []
        self.filtered_events = []
    
    def fetch_events(self):
        """Fetch all events from the API with pagination handling"""
        logger.info("Starting to fetch events from UofL API...")
        
        # Calculate date range (next 60 days)
        today = datetime.now()
        end_date = today + timedelta(days=DAYS_AHEAD)
        
        params = {
            'pp': 50,  # Results per page
            'days': DAYS_AHEAD,
            'start': today.strftime('%Y-%m-%d'),
            'end': end_date.strftime('%Y-%m-%d')
        }
        
        page = 1
        all_events = []
        
        while True:
            params['page'] = page
            logger.info(f"Fetching page {page}...")
            
            try:
                response = requests.get(API_BASE_URL, params=params, timeout=30)
                response.raise_for_status()
                data = response.json()
                
                if not data.get('events'):
                    break
                    
                all_events.extend(data['events'])
                logger.info(f"Retrieved {len(data['events'])} events from page {page}")
                
                # Check if we've reached the last page
                if len(data['events']) < params['pp']:
                    break
                    
                page += 1
                
            except requests.exceptions.RequestException as e:
                logger.error(f"Error fetching page {page}: {e}")
                break
        
        self.events = all_events
        logger.info(f"Total events fetched: {len(self.events)}")
        return self.events
    
    def filter_events(self):
        """Filter events to include only non-recurring events"""
        logger.info("Filtering events...")
        
        filtered = []
        for event in self.events:
            # Exclude recurring/series events
            if not event.get('recurring', False) and not event.get('series', False):
                filtered.append(event)
        
        self.filtered_events = filtered
        logger.info(f"Filtered events: {len(self.filtered_events)} (removed {len(self.events) - len(self.filtered_events)} recurring events)")
        return self.filtered_events
    
    def transform_events(self):
        """Transform events to include only required fields"""
        logger.info("Transforming event data...")
        
        transformed = []
        for event in self.filtered_events:
            # Extract and format start date from event_instances
            start_date = None
            event_instances = event.get('event', {}).get('event_instances', [])
            if event_instances and len(event_instances) > 0:
                start_date = event_instances[0].get('event_instance', {}).get('start')
            
            formatted_date = None
            if start_date:
                # Convert to ISO 8601 format (YYYY-MM-DD HH:MM)
                try:
                    # Handle timezone info and convert to local time
                    if start_date.endswith('Z'):
                        start_date = start_date[:-1] + '+00:00'
                    elif '+' not in start_date and '-' in start_date[-6:]:
                        # Already has timezone
                        pass
                    else:
                        # Add timezone if missing
                        start_date += '-04:00'  # Default to Eastern time
                    
                    dt = datetime.fromisoformat(start_date)
                    formatted_date = dt.strftime('%Y-%m-%d %H:%M')
                except Exception as e:
                    logger.warning(f"Date parsing error for {start_date}: {e}")
                    formatted_date = start_date
            
            # Extract location name or set to "TBD"
            location = event.get('event', {}).get('room_number') or \
                      event.get('event', {}).get('location_name') or \
                      event.get('event', {}).get('location') or \
                      event.get('event', {}).get('venue', {}).get('name') or "TBD"
            
            transformed_event = {
                'eventID': event.get('event', {}).get('id'),
                'title': event.get('event', {}).get('title'),
                'startDate': formatted_date,
                'location': location,
                'url': event.get('event', {}).get('url')
            }
            
            # Only include events with valid data
            if transformed_event['eventID'] and transformed_event['title']:
                transformed.append(transformed_event)
        
        logger.info(f"Transformed {len(transformed)} events")
        return transformed
    
    def generate_summary(self, events):
        """Generate summary statistics"""
        if not events:
            return {
                'total_events': 0,
                'events_by_location': {},
                'earliest_date': None,
                'latest_date': None
            }
        
        # Count events by location
        location_counts = {}
        dates = []
        
        for event in events:
            location = event.get('location', 'TBD')
            location_counts[location] = location_counts.get(location, 0) + 1
            
            if event.get('startDate'):
                dates.append(event['startDate'])
        
        # Find earliest and latest dates
        earliest_date = min(dates) if dates else None
        latest_date = max(dates) if dates else None
        
        return {
            'total_events': len(events),
            'events_by_location': location_counts,
            'earliest_date': earliest_date,
            'latest_date': latest_date
        }
    
    def save_to_json(self, events, filename='events_data.json'):
        """Save events to JSON file"""
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(events, f, indent=2, ensure_ascii=False)
        logger.info(f"Events saved to {filename}")
    
    def save_to_csv(self, events, filename='events_data.csv'):
        """Save events to CSV file"""
        if not events:
            return
            
        with open(filename, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=['eventID', 'title', 'startDate', 'location', 'url'])
            writer.writeheader()
            writer.writerows(events)
        logger.info(f"Events saved to {filename}")

# Initialize data manager
data_manager = EventDataManager()

@app.route('/')
def index():
    """Serve the main frontend page"""
    return render_template('index.html')

@app.route('/api/events', methods=['GET'])
def get_events():
    """API endpoint to get all events"""
    try:
        # Fetch fresh data
        events = data_manager.fetch_events()
        filtered_events = data_manager.filter_events()
        transformed_events = data_manager.transform_events()
        
        # Save to files
        data_manager.save_to_json(transformed_events)
        data_manager.save_to_csv(transformed_events)
        
        return jsonify({
            'success': True,
            'data': transformed_events,
            'summary': data_manager.generate_summary(transformed_events)
        })
    except Exception as e:
        logger.error(f"Error in get_events: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/events/search', methods=['GET'])
def search_events():
    """API endpoint to search events by keyword"""
    try:
        keyword = request.args.get('q', '').lower()
        if not keyword:
            return jsonify({'success': False, 'error': 'No search keyword provided'}), 400
        
        # Get current events
        events = data_manager.fetch_events()
        filtered_events = data_manager.filter_events()
        transformed_events = data_manager.transform_events()
        
        # Filter by keyword
        search_results = []
        for event in transformed_events:
            if (keyword in event.get('title', '').lower() or 
                keyword in event.get('location', '').lower()):
                search_results.append(event)
        
        return jsonify({
            'success': True,
            'data': search_results,
            'keyword': keyword,
            'count': len(search_results)
        })
    except Exception as e:
        logger.error(f"Error in search_events: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/summary', methods=['GET'])
def get_summary():
    """API endpoint to get summary statistics"""
    try:
        events = data_manager.fetch_events()
        filtered_events = data_manager.filter_events()
        transformed_events = data_manager.transform_events()
        
        summary = data_manager.generate_summary(transformed_events)
        return jsonify({'success': True, 'summary': summary})
    except Exception as e:
        logger.error(f"Error in get_summary: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
