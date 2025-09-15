# UofL Events Data Manager

A comprehensive web application for fetching, filtering, and analyzing University of Louisville events data from the UofL Events API.
##  Project Overview

This application addresses the UofL Integrative Design and Development Data Manager Challenge by providing a complete solution for:

- **Data Fetching**: Retrieves events from the UofL Events API with automatic pagination
- **Data Filtering**: Excludes recurring events and focuses on non-recurring events within the next 60 days
- **Data Transformation**: Converts data to a standardized format with required fields
- **Data Export**: Provides CSV and JSON export functionality
- **Data Analysis**: Generates comprehensive summary reports with visualizations
- **Search Functionality**: Enables keyword-based event search

##  Features

### Core Requirements 
-  **API Integration**: Fetches events from `https://events.louisville.edu/api/2/events/`
-  **Pagination Handling**: Automatically handles multiple pages of data
-  **Date Filtering**: Retrieves events within the next 60 days
-  **Event Filtering**: Excludes recurring/series events
-  **Data Transformation**: Keeps only required fields (ID, Title, Date, Location, URL)
-  **ISO 8601 Format**: Converts dates to YYYY-MM-DD HH:MM format
-  **CSV Export**: Downloads cleaned data as CSV file
-  **JSON Export**: Downloads data with metadata as JSON file
-  **Summary Report**: Shows total events, date range, and location counts

### Bonus Features 
-  **Data Visualization**: Interactive bar chart showing events per location
-  **Keyword Search**: Search events by title or location
-  **Responsive Design**: Mobile-first approach with modern UI
-  **Real-time Status**: Loading indicators and status messages
-  **Error Handling**: Comprehensive error handling and user feedback

### Technical Features 
-  **CORS Handling**: Graceful handling of cross-origin requests
-  **Modern JavaScript**: ES6+ features with class-based architecture
-  **Chart.js Integration**: Professional data visualization
-  **Responsive CSS**: Mobile-first design with CSS Grid and Flexbox
-  **Accessibility**: Semantic HTML and keyboard navigation support

##  Quick Start
### Option 1: Local Development

1. Open `index.html` in your web browser or use a local server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve .
   
   # Using PHP
   php -S localhost:8000
   ```

2. Navigate to `http://localhost:8000` in your browser

##  How to Use

1. **Fetch Events**: Click the "Fetch Events" button to retrieve data from the UofL API
2. **View Data**: Browse the events table with all filtered and transformed data
3. **Search Events**: Use the search box to find events by keyword
4. **Export Data**: Download data as CSV or JSON files
5. **View Reports**: Check the summary report for statistics and visualizations

## Technical Architecture

### File Structure
```
uofl-data-challenge/
├── index.html          # Main HTML structure
├── styles.css          # Responsive CSS styling
├── script.js           # JavaScript application logic
├── README.md           # Project documentation
└── data-manager-challenge.md  # Original requirements
```

### Technology Stack
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Styling**: CSS Grid, Flexbox, CSS Custom Properties
- **Visualization**: Chart.js
- **API**: UofL Events API 
- **Deployment**: GitHub Pages

### Key Components

#### EventsDataManager Class
- Handles all API interactions and data processing
- Manages state and UI updates
- Provides export and visualization functionality

#### API Integration
- Automatic pagination handling
- Date range filtering (next 60 days)
- Error handling and retry logic
- CORS-compatible implementation

#### Data Processing Pipeline
1. **Fetch**: Retrieve events from API with pagination
2. **Filter**: Remove recurring events
3. **Transform**: Convert to standardized format
4. **Display**: Show in responsive table
5. **Export**: Provide CSV/JSON download options

##  Configuration

### API Configuration
The application uses the following API endpoint:
```javascript
const apiBaseUrl = 'https://events.louisville.edu/api/2/events/';
```

### Date Range
Events are fetched for the next 60 days from the current date:
```javascript
const futureDate = new Date();
futureDate.setDate(today.getDate() + 60);
```

### Pagination
- Page size: 50 events per request
- Maximum pages: 20 (safety limit)
- Automatic detection of additional pages

##  Design Features

### Responsive Design
- **Mobile-First**: Optimized for mobile devices
- **Breakpoints**: 768px (tablet), 480px (mobile)
- **Flexible Layout**: CSS Grid and Flexbox for adaptive layouts

### Visual Design
- **Color Scheme**: red (#8B0000) with modern grays
- **Typography**: Segoe UI font family for readability
- **Components**: Card-based layout with subtle shadows
- **Animations**: Smooth transitions and hover effects

### Accessibility
- **Semantic HTML**: Proper heading hierarchy and landmarks
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader**: ARIA labels and descriptions
- **Color Contrast**: WCAG compliant color combinations

### Browser Compatibility
- **Chrome**: Full support
- **Firefox**: Full support
- **Safari**: Full support
- **Edge**: Full support
- **IE**: Not supported (uses modern JavaScript features)

##  Data Format

### Input Format (UofL API)
```json
{
  "events": [
    {
      "id": 49356427000535,
      "title": "Event Title",
      "start_date": "2025-05-20T12:00:00",
      "location_name": "Event Location",
      "url": "https://example.com/event",
      "recurring": false
    }
  ]
}
```

### Output Format
```json
{
  "metadata": {
    "totalEvents": 150,
    "exportDate": "2025-01-27T10:30:00.000Z",
    "source": "UofL Events API"
  },
  "events": [
    {
      "eventID": 49356427000535,
      "title": "Event Title",
      "startDate": "2025-05-20 12:00",
      "location": "Event Location",
      "url": "https://example.com/event"
    }
  ]
}
```

##  Challenge Requirements Compliance

###  Technical Specifications
- **Frontend**: HTML, CSS, JavaScript ✓
- **Responsive Design**: Mobile-first approach ✓
- **Code Quality**: Clean, commented code with error handling ✓
- **Git Control**: Meaningful commit messages ✓



