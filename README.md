# UofL Events Manager

A comprehensive web application for fetching, filtering, and managing University of Louisville events data from the UofL Events API. This project provides a clean, responsive interface for viewing events, generating reports, and exporting data.

## 🚀 Features

### Core Functionality
- **Event Fetching**: Automatically retrieves all events from the UofL Events API for the next 60 days
- **Smart Filtering**: Excludes recurring/series events to show only unique events
- **Data Transformation**: Converts event data to a clean, standardized format
- **Real-time Search**: Search events by title or location with instant results
- **Data Export**: Export events data as CSV or JSON files

### Dashboard Features
- **Statistics Overview**: Total events, locations count, earliest/latest event dates
- **Interactive Charts**: Bar chart visualization of events by location
- **Responsive Design**: Mobile-first design that works on all devices
- **Pagination**: Efficient browsing through large event datasets
- **Real-time Updates**: Refresh data from the API with one click

### Technical Features
- **REST API**: Clean API endpoints for data access and manipulation
- **Error Handling**: Comprehensive error handling and user feedback
- **Data Validation**: Ensures data integrity and proper formatting
- **Logging**: Detailed logging for debugging and monitoring

## 🛠️ Tech Stack

### Backend
- **Python 3.8+**: Core programming language
- **Flask**: Lightweight web framework for API development
- **Pandas**: Data manipulation and analysis
- **Requests**: HTTP library for API calls
- **Gunicorn**: WSGI server for production deployment

### Frontend
- **HTML5**: Semantic markup structure
- **CSS3**: Modern styling with Flexbox and Grid
- **Vanilla JavaScript**: No frameworks, pure JavaScript for maximum compatibility
- **Chart.js**: Interactive data visualization
- **Font Awesome**: Icon library for enhanced UI

### Data Storage
- **JSON Files**: Lightweight data storage
- **CSV Export**: Spreadsheet-compatible data export

## 📋 Requirements Met

### Challenge Requirements ✅
1. **Fetch Events**: Retrieves all events within next 60 days with pagination
2. **Filter Events**: Excludes recurring/series events
3. **Transform Data**: Keeps only required fields in ISO 8601 format
4. **Useful Output**: Saves as CSV/JSON with comprehensive summary reports
5. **Bonus Features**: 
   - Interactive bar chart visualization
   - Keyword search functionality
   - Responsive mobile-first design

### Technical Specifications ✅
- **Backend**: Python with Flask framework
- **Data Storage**: JSON file format
- **REST API**: Complete API implementation
- **Code Quality**: Clean, commented code with proper error handling
- **Git Integration**: Ready for version control

## 🚀 Quick Start

### Prerequisites
- Python 3.8 or higher
- pip (Python package installer)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd uofl-data-challenge
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the application**
   ```bash
   python app.py
   ```

4. **Access the application**
   - Open your browser and go to `http://localhost:5000`
   - The application will automatically fetch and display events

### Alternative: Using Virtual Environment (Recommended)

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the application
python app.py
```

## 📖 API Endpoints

### Events Data
- `GET /api/events` - Get all filtered events
- `GET /api/events/summary` - Get events summary statistics
- `GET /api/events/search?q=keyword` - Search events by keyword
- `GET /api/events/refresh` - Refresh data from UofL API

### Data Export
- `GET /api/events/export/csv` - Export events as CSV
- `GET /api/events/export/json` - Export events as JSON

### Web Interface
- `GET /` - Main dashboard interface

## 🎯 Usage Guide

### Dashboard Overview
1. **Statistics Cards**: View total events, locations, and date ranges
2. **Search Bar**: Search events by title or location
3. **Action Buttons**: 
   - Refresh data from API
   - Export data as CSV or JSON
4. **Events List**: Browse through paginated events
5. **Location Chart**: Visualize event distribution by location

### Searching Events
- Type keywords in the search box
- Press Enter or click Search
- Use Clear button to reset search
- Search works on both event titles and locations

### Data Export
- Click "Export CSV" to download events as spreadsheet
- Click "Export JSON" to download events as JSON file
- Files are generated in the application directory

## 📊 Data Format

### Event Object Structure
```json
{
    "eventID": 49356427000535,
    "title": "Compassionate Caregiving: Self-Care",
    "startDate": "2025-05-20 12:00",
    "location": "The Center at Kentucky Highlands (London)",
    "url": "https://centers.louisville.edu/form/clinical-trials-day-registration"
}
```

### Summary Report Structure
```json
{
    "total_events": 150,
    "events_by_location": {
        "Student Center": 45,
        "Library": 32,
        "TBD": 28
    },
    "earliest_date": "2025-01-15 09:00",
    "latest_date": "2025-03-15 17:00"
}
```

## 🔧 Configuration

### Environment Variables
The application can be configured using environment variables:

- `FLASK_ENV`: Set to 'production' for production deployment
- `PORT`: Port number for the application (default: 5000)

### API Configuration
- **Base URL**: `https://events.louisville.edu/api/2/events/`
- **Date Range**: Next 60 days from current date
- **Pagination**: 100 events per page
- **Timeout**: 30 seconds for API requests

## 🚀 Deployment

### Local Development
```bash
python app.py
```

### Production Deployment
```bash
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

### GitHub Pages Deployment
1. Push code to GitHub repository
2. Enable GitHub Pages in repository settings
3. Set source to main branch
4. Access via GitHub Pages URL

## 📁 Project Structure

```
uofl-data-challenge/
├── app.py                 # Main Flask application
├── requirements.txt       # Python dependencies
├── README.md             # Project documentation
├── templates/
│   └── index.html        # Main dashboard template
├── static/
│   ├── style.css         # CSS styles
│   └── script.js         # Frontend JavaScript
├── uofl_events.csv       # Generated CSV export
├── uofl_events.json      # Generated JSON export
└── .gitignore            # Git ignore file
```

## 🐛 Troubleshooting

### Common Issues

1. **API Connection Errors**
   - Check internet connection
   - Verify UofL Events API is accessible
   - Check firewall settings

2. **Data Not Loading**
   - Refresh the page
   - Check browser console for errors
   - Verify backend is running

3. **Export Issues**
   - Ensure write permissions in application directory
   - Check available disk space

### Debug Mode
Run with debug logging:
```bash
export FLASK_DEBUG=1
python app.py
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is created for the UofL Integrative Design and Development Data Manager Challenge.

## 👥 Team

Developed for the University of Louisville IT Innovation team as part of the Data Manager Challenge.

## 📞 Support

For questions or issues, please contact the development team or create an issue in the repository.

---

**Note**: This application is designed to work with the UofL Events API and may require updates if the API structure changes.
