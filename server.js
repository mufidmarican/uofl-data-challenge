const express = require('express');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const moment = require('moment');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Configuration
const API_BASE_URL = 'https://events.louisville.edu/api/2/events/';
const DAYS_AHEAD = 60;

class EventDataManager {
    constructor() {
        this.events = [];
        this.filteredEvents = [];
    }

    async fetchEvents() {
        console.log('Starting to fetch events from UofL API...');
        
        // Calculate date range (next 60 days)
        const today = moment();
        const endDate = today.clone().add(DAYS_AHEAD, 'days');
        
        const params = {
            pp: 50, // Results per page
            days: DAYS_AHEAD,
            start: today.format('YYYY-MM-DD'),
            end: endDate.format('YYYY-MM-DD')
        };
        
        let page = 1;
        let allEvents = [];
        
        while (true) {
            params.page = page;
            console.log(`Fetching page ${page}...`);
            
            try {
                const response = await axios.get(API_BASE_URL, { 
                    params, 
                    timeout: 30000 
                });
                
                const data = response.data;
                
                if (!data.events || data.events.length === 0) {
                    break;
                }
                
                allEvents = allEvents.concat(data.events);
                console.log(`Retrieved ${data.events.length} events from page ${page}`);
                
                // Check if we've reached the last page
                if (data.events.length < params.pp) {
                    break;
                }
                
                page++;
                
            } catch (error) {
                console.error(`Error fetching page ${page}:`, error.message);
                break;
            }
        }
        
        this.events = allEvents;
        console.log(`Total events fetched: ${this.events.length}`);
        return this.events;
    }

    filterEvents() {
        console.log('Filtering events...');
        
        const filtered = this.events.filter(event => {
            // Exclude recurring/series events
            return !event.recurring && !event.series;
        });
        
        this.filteredEvents = filtered;
        console.log(`Filtered events: ${this.filteredEvents.length} (removed ${this.events.length - this.filteredEvents.length} recurring events)`);
        return this.filteredEvents;
    }

    transformEvents() {
        console.log('Transforming event data...');
        
        const transformed = [];
        
        for (const event of this.filteredEvents) {
            // Extract and format start date from event_instances
            let startDate = null;
            const eventInstances = event.event?.event_instances || [];
            
            if (eventInstances.length > 0) {
                startDate = eventInstances[0].event_instance?.start;
            }
            
            let formattedDate = null;
            if (startDate) {
                try {
                    // Convert to ISO 8601 format (YYYY-MM-DD HH:MM)
                    const momentDate = moment(startDate);
                    formattedDate = momentDate.format('YYYY-MM-DD HH:mm');
                } catch (error) {
                    console.warn(`Date parsing error for ${startDate}:`, error.message);
                    formattedDate = startDate;
                }
            }
            
            // Extract location name or set to "TBD"
            const location = event.event?.room_number || 
                           event.event?.location_name || 
                           event.event?.location || 
                           event.event?.venue?.name || 
                           'TBD';
            
            const transformedEvent = {
                eventID: event.event?.id,
                title: event.event?.title,
                startDate: formattedDate,
                location: location,
                url: event.event?.url
            };
            
            // Only include events with valid data
            if (transformedEvent.eventID && transformedEvent.title) {
                transformed.push(transformedEvent);
            }
        }
        
        console.log(`Transformed ${transformed.length} events`);
        return transformed;
    }

    generateSummary(events) {
        if (!events || events.length === 0) {
            return {
                total_events: 0,
                events_by_location: {},
                earliest_date: null,
                latest_date: null
            };
        }
        
        // Count events by location
        const locationCounts = {};
        const dates = [];
        
        for (const event of events) {
            const location = event.location || 'TBD';
            locationCounts[location] = (locationCounts[location] || 0) + 1;
            
            if (event.startDate) {
                dates.push(event.startDate);
            }
        }
        
        // Find earliest and latest dates
        const earliestDate = dates.length > 0 ? dates.sort()[0] : null;
        const latestDate = dates.length > 0 ? dates.sort().reverse()[0] : null;
        
        return {
            total_events: events.length,
            events_by_location: locationCounts,
            earliest_date: earliestDate,
            latest_date: latestDate
        };
    }

    async saveToJson(events, filename = 'events_data.json') {
        try {
            await fs.writeFile(filename, JSON.stringify(events, null, 2), 'utf8');
            console.log(`Events saved to ${filename}`);
        } catch (error) {
            console.error(`Error saving to ${filename}:`, error.message);
        }
    }

    async saveToCsv(events, filename = 'events_data.csv') {
        if (!events || events.length === 0) {
            return;
        }
        
        try {
            const headers = ['eventID', 'title', 'startDate', 'location', 'url'];
            const csvContent = [
                headers.join(','),
                ...events.map(event => 
                    headers.map(header => 
                        `"${(event[header] || '').toString().replace(/"/g, '""')}"`
                    ).join(',')
                )
            ].join('\n');
            
            await fs.writeFile(filename, csvContent, 'utf8');
            console.log(`Events saved to ${filename}`);
        } catch (error) {
            console.error(`Error saving to ${filename}:`, error.message);
        }
    }
}

// Initialize data manager
const dataManager = new EventDataManager();

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/events', async (req, res) => {
    try {
        // Fetch fresh data
        await dataManager.fetchEvents();
        dataManager.filterEvents();
        const transformedEvents = dataManager.transformEvents();
        
        // Save to files
        await dataManager.saveToJson(transformedEvents);
        await dataManager.saveToCsv(transformedEvents);
        
        res.json({
            success: true,
            data: transformedEvents,
            summary: dataManager.generateSummary(transformedEvents)
        });
    } catch (error) {
        console.error('Error in get_events:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.get('/api/events/search', async (req, res) => {
    try {
        const keyword = req.query.q?.toLowerCase();
        if (!keyword) {
            return res.status(400).json({
                success: false,
                error: 'No search keyword provided'
            });
        }
        
        // Get current events
        await dataManager.fetchEvents();
        dataManager.filterEvents();
        const transformedEvents = dataManager.transformEvents();
        
        // Filter by keyword
        const searchResults = transformedEvents.filter(event => 
            event.title?.toLowerCase().includes(keyword) || 
            event.location?.toLowerCase().includes(keyword)
        );
        
        res.json({
            success: true,
            data: searchResults,
            keyword: keyword,
            count: searchResults.length
        });
    } catch (error) {
        console.error('Error in search_events:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.get('/api/summary', async (req, res) => {
    try {
        await dataManager.fetchEvents();
        dataManager.filterEvents();
        const transformedEvents = dataManager.transformEvents();
        
        const summary = dataManager.generateSummary(transformedEvents);
        res.json({
            success: true,
            summary: summary
        });
    } catch (error) {
        console.error('Error in get_summary:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 UofL Events Data Manager running on port ${PORT}`);
    console.log(`📊 Visit: http://localhost:${PORT}`);
});

module.exports = app;
