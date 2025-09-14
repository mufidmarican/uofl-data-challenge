from flask import Flask, jsonify, render_template, request
import requests
import pandas as pd
from datetime import datetime, timedelta
import json
import os
from typing import List, Dict, Any
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

class UofLEventsManager:
    """Manages fetching, filtering, and transforming UofL events data"""
    
    def __init__(self):
        self.api_base_url = "https://events.louisville.edu/api/2/events/"
        self.events_data = []
        self.filtered_events = []
        
    def fetch_events(self) -> List[Dict[str, Any]]:
        """Fetch all events from the UofL API with pagination"""
        all_events = []
        page = 1
        per_page = 100
        
        # Calculate date range for next 60 days
        today = datetime.now()
        end_date = today + timedelta(days=60)
        
        logger.info(f"Fetching events from {today.strftime('%Y-%m-%d')} to {end_date.strftime('%Y-%m-%d')}")
        
        while True:
            try:
                # API parameters
                params = {
                    'pp': per_page,
                    'page': page,
                    'days': 60,  # Next 60 days
                    'format': 'json'
                }
                
                response = requests.get(self.api_base_url, params=params, timeout=30)
                response.raise_for_status()
                
                data = response.json()
                
                if not data.get('events'):
                    break
                    
                events = data['events']
                all_events.extend(events)
                
                logger.info(f"Fetched page {page}: {len(events)} events")
                
                # Check if we have more pages
                if len(events) < per_page:
                    break
                    
                page += 1
                
            except requests.exceptions.RequestException as e:
                logger.error(f"Error fetching events from API: {e}")
                break
            except Exception as e:
                logger.error(f"Unexpected error: {e}")
                break
        
        logger.info(f"Total events fetched: {len(all_events)}")
        self.events_data = all_events
        return all_events
    
    def filter_events(self) -> List[Dict[str, Any]]:
        """Filter events to include only non-recurring events"""
        if not self.events_data:
            self.fetch_events()
        
        filtered = []
        for event in self.events_data:
            # Check if event is not recurring (no series_id or recurring pattern)
            if not event.get('series_id') and not event.get('recurring'):
                filtered.append(event)
        
        logger.info(f"Filtered events (non-recurring): {len(filtered)}")
        self.filtered_events = filtered
        return filtered
    
    def transform_events(self) -> List[Dict[str, Any]]:
        """Transform events to include only required fields in proper format"""
        if not self.filtered_events:
            self.filter_events()
        
        transformed = []
        for event in self.filtered_events:
            try:
                # Parse and format start date
                start_date_str = event.get('event', {}).get('start_date')
                if start_date_str:
                    # Parse the date and format to ISO 8601
                    start_date = datetime.fromisoformat(start_date_str.replace('Z', '+00:00'))
                    formatted_date = start_date.strftime('%Y-%m-%d %H:%M')
                else:
                    formatted_date = "TBD"
                
                # Extract location name or set to "TBD"
                location = event.get('event', {}).get('room', {}).get('name', 'TBD')
                if not location or location.strip() == '':
                    location = "TBD"
                
                transformed_event = {
                    'eventID': event.get('event', {}).get('id'),
                    'title': event.get('event', {}).get('title', 'Untitled Event'),
                    'startDate': formatted_date,
                    'location': location,
                    'url': event.get('event', {}).get('url', '')
                }
                
                transformed.append(transformed_event)
                
            except Exception as e:
                logger.error(f"Error transforming event {event.get('event', {}).get('id')}: {e}")
                continue
        
        logger.info(f"Transformed events: {len(transformed)}")
        return transformed
    
    def generate_summary_report(self, events: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Generate summary report with statistics"""
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
            
            # Parse dates for min/max calculation
            start_date_str = event.get('startDate')
            if start_date_str and start_date_str != 'TBD':
                try:
                    date_obj = datetime.strptime(start_date_str, '%Y-%m-%d %H:%M')
                    dates.append(date_obj)
                except ValueError:
                    continue
        
        # Find earliest and latest dates
        earliest_date = min(dates).strftime('%Y-%m-%d %H:%M') if dates else None
        latest_date = max(dates).strftime('%Y-%m-%d %H:%M') if dates else None
        
        return {
            'total_events': len(events),
            'events_by_location': location_counts,
            'earliest_date': earliest_date,
            'latest_date': latest_date
        }
    
    def save_to_csv(self, events: List[Dict[str, Any]], filename: str = 'uofl_events.csv'):
        """Save events to CSV file"""
        df = pd.DataFrame(events)
        df.to_csv(filename, index=False)
        logger.info(f"Events saved to {filename}")
        return filename
    
    def save_to_json(self, events: List[Dict[str, Any]], filename: str = 'uofl_events.json'):
        """Save events to JSON file"""
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(events, f, indent=2, ensure_ascii=False)
        logger.info(f"Events saved to {filename}")
        return filename

# Initialize the events manager
events_manager = UofLEventsManager()

@app.route('/')
def index():
    """Serve the main dashboard page"""
    return render_template('index.html')

@app.route('/api/events')
def get_events():
    """API endpoint to get all events"""
    try:
        events = events_manager.transform_events()
        return jsonify({
            'success': True,
            'data': events,
            'count': len(events)
        })
    except Exception as e:
        logger.error(f"Error in get_events: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/events/summary')
def get_events_summary():
    """API endpoint to get events summary"""
    try:
        events = events_manager.transform_events()
        summary = events_manager.generate_summary_report(events)
        return jsonify({
            'success': True,
            'summary': summary
        })
    except Exception as e:
        logger.error(f"Error in get_events_summary: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/events/search')
def search_events():
    """API endpoint to search events by keyword"""
    try:
        keyword = request.args.get('q', '').lower()
        if not keyword:
            return jsonify({
                'success': False,
                'error': 'Search keyword required'
            }), 400
        
        events = events_manager.transform_events()
        filtered_events = [
            event for event in events
            if keyword in event.get('title', '').lower() or 
               keyword in event.get('location', '').lower()
        ]
        
        return jsonify({
            'success': True,
            'data': filtered_events,
            'count': len(filtered_events),
            'keyword': keyword
        })
    except Exception as e:
        logger.error(f"Error in search_events: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/events/refresh')
def refresh_events():
    """API endpoint to refresh events data from the API"""
    try:
        events_manager.fetch_events()
        events = events_manager.transform_events()
        
        # Save to files
        events_manager.save_to_csv(events)
        events_manager.save_to_json(events)
        
        return jsonify({
            'success': True,
            'message': f'Refreshed {len(events)} events',
            'count': len(events)
        })
    except Exception as e:
        logger.error(f"Error in refresh_events: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/events/export/csv')
def export_csv():
    """API endpoint to export events as CSV"""
    try:
        events = events_manager.transform_events()
        filename = events_manager.save_to_csv(events)
        return jsonify({
            'success': True,
            'filename': filename,
            'message': 'CSV file generated successfully'
        })
    except Exception as e:
        logger.error(f"Error in export_csv: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/events/export/json')
def export_json():
    """API endpoint to export events as JSON"""
    try:
        events = events_manager.transform_events()
        filename = events_manager.save_to_json(events)
        return jsonify({
            'success': True,
            'filename': filename,
            'message': 'JSON file generated successfully'
        })
    except Exception as e:
        logger.error(f"Error in export_json: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    # Initialize data on startup
    try:
        logger.info("Initializing UofL Events Manager...")
        events_manager.fetch_events()
        events = events_manager.transform_events()
        events_manager.save_to_csv(events)
        events_manager.save_to_json(events)
        logger.info("Initialization complete!")
    except Exception as e:
        logger.error(f"Error during initialization: {e}")
    
    app.run(debug=True, host='0.0.0.0', port=5000)
