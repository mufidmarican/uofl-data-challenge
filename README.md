# UofL Events Data Manager

A comprehensive data pipeline application that fetches, filters, and transforms event data from the University of Louisville Events API. Built with Python Flask backend and responsive HTML/CSS/JavaScript frontend.

## 🚀 Features

### Core Functionality
- **Data Fetching**: Retrieves all events from UofL Events API for the next 60 days
- **Pagination Handling**: Automatically handles API pagination to ensure no events are missed
- **Data Filtering**: Excludes recurring/series events, keeping only standalone events
- **Data Transformation**: Converts data to standardized format with required fields only
- **Multiple Export Formats**: Export data as JSON or CSV files

### Frontend Features
- **Responsive Design**: Mobile-first approach with beautiful, modern UI
- **Real-time Data Visualization**: Interactive bar chart showing events by location
- **Search Functionality**: Keyword search across event titles and locations
- **Summary Statistics**: Total events, date ranges, and location breakdowns
- **Export Capabilities**: Download data directly from the browser

### API Endpoints
- `GET /api/events` - Fetch and return all filtered events
- `GET /api/events/search?q=keyword` - Search events by keyword
- `GET /api/summary` - Get summary statistics

## 🛠️ Technical Stack

### Backend
- **Python 3.7+**
- **Flask** - Web framework
- **Flask-CORS** - Cross-origin resource sharing
- **Requests** - HTTP library for API calls

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with gradients and animations
- **Vanilla JavaScript** - No frameworks, pure JS for performance
- **Chart.js** - Data visualization library

### Data Storage
- **JSON Files** - Local data storage
- **CSV Files** - Tabular data export

## 📋 Requirements

- Python 3.7 or higher
- pip (Python package installer)
- Modern web browser (Chrome, Firefox, Safari, Edge)

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd uofl-data-challenge
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Run the Application
```bash
python app.py
```

The application will start on `http://localhost:5000`

### 4. Access the Web Interface
Open your browser and navigate to `http://localhost:5000`

## 📖 Usage Guide

### Web Interface
1. **Fetch Events**: Click "Fetch Events" to retrieve data from the UofL API
2. **View Summary**: Click "Show Summary" to see statistics and location chart
3. **Search Events**: Use the search box to find events by keyword
4. **Export Data**: Use "Export JSON" or "Export CSV" buttons to download data

### API Usage
```bash
# Get all events
curl http://localhost:5000/api/events

# Search events
curl "http://localhost:5000/api/events/search?q=music"

# Get summary statistics
curl http://localhost:5000/api/summary
```

## 📊 Data Structure

### Input Data (from UofL API)
The application fetches data from: `https://events.louisville.edu/api/2/events/`

### Output Data Format
```json
{
  "eventID": 49356427000535,
  "title": "Compassionate Caregiving: Self-Care",
  "startDate": "2025-05-20 12:00",
  "location": "The Center at Kentucky Highlands (London)",
  "url": "https://centers.louisville.edu/form/clinical-trials-day-registration"
}
```

### Summary Statistics
```json
{
  "total_events": 150,
  "events_by_location": {
    "Student Center": 25,
    "Library": 18,
    "TBD": 12
  },
  "earliest_date": "2025-01-15 09:00",
  "latest_date": "2025-03-15 17:00"
}
```

## 🔧 Configuration

### Environment Variables
- `FLASK_ENV` - Set to `development` for debug mode
- `FLASK_DEBUG` - Set to `True` for auto-reload

### API Configuration
- `DAYS_AHEAD` - Number of days to fetch events for (default: 60)
- `API_BASE_URL` - UofL Events API base URL

## 📁 Project Structure

```
uofl-data-challenge/
├── app.py                 # Main Flask application
├── requirements.txt       # Python dependencies
├── README.md             # Project documentation
├── templates/
│   └── index.html        # Main HTML template
├── static/
│   ├── style.css         # CSS styles
│   └── script.js         # Frontend JavaScript
├── events_data.json      # Generated JSON data (after running)
└── events_data.csv       # Generated CSV data (after running)
```

## 🎯 Challenge Requirements Met

### ✅ Core Requirements
- [x] Fetch events from UofL Events API
- [x] Handle pagination to retrieve all events
- [x] Filter out recurring/series events
- [x] Transform data to include only required fields
- [x] Save data as both JSON and CSV
- [x] Generate summary report with statistics

### ✅ Technical Specifications
- [x] Python backend with Flask framework
- [x] JSON data storage
- [x] REST API endpoints
- [x] HTML, CSS, JavaScript frontend
- [x] Responsive mobile-first design
- [x] Clean, commented code
- [x] Proper error handling and logging
- [x] Git version control ready

### ✅ Bonus Features
- [x] Data visualization (bar chart of events by location)
- [x] Keyword search functionality
- [x] Modern, beautiful UI design
- [x] Export functionality
- [x] Real-time data fetching

## 🐛 Error Handling

The application includes comprehensive error handling for:
- Network connectivity issues
- API rate limiting
- Invalid data formats
- Missing required fields
- File I/O operations

## 🚀 Deployment

### Local Development
```bash
python app.py
```

### Production Deployment
For production deployment, consider using:
- **Gunicorn** as WSGI server
- **Nginx** as reverse proxy
- **Docker** for containerization

### GitHub Pages
The frontend can be deployed to GitHub Pages by:
1. Pushing the repository to GitHub
2. Enabling GitHub Pages in repository settings
3. Setting source to main branch

## 📝 API Documentation

### Endpoints

#### GET /api/events
Fetches all events from the UofL API and returns filtered, transformed data.

**Response:**
```json
{
  "success": true,
  "data": [...],
  "summary": {...}
}
```

#### GET /api/events/search?q={keyword}
Searches events by keyword in title or location.

**Parameters:**
- `q` (string): Search keyword

**Response:**
```json
{
  "success": true,
  "data": [...],
  "keyword": "music",
  "count": 5
}
```

#### GET /api/summary
Returns summary statistics for all events.

**Response:**
```json
{
  "success": true,
  "summary": {
    "total_events": 150,
    "events_by_location": {...},
    "earliest_date": "...",
    "latest_date": "..."
  }
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is created for the UofL Integrative Design and Development Data Manager Challenge.

## 👨‍💻 Author

Created for the University of Louisville IT Innovation team challenge.

## 📞 Support

For questions or issues, please refer to the challenge documentation or contact the development team.

---

**Note**: This application is designed to work with the UofL Events API and may require updates if the API structure changes.
