// UofL Events Data Manager - Frontend JavaScript

class EventsManager {
    constructor() {
        this.events = [];
        this.summary = null;
        this.chart = null;
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        document.getElementById('fetchEvents').addEventListener('click', () => this.fetchEvents());
        document.getElementById('showSummary').addEventListener('click', () => this.showSummary());
        document.getElementById('searchBtn').addEventListener('click', () => this.searchEvents());
        document.getElementById('exportJson').addEventListener('click', () => this.exportData('json'));
        document.getElementById('exportCsv').addEventListener('click', () => this.exportData('csv'));
        
        // Search on Enter key
        document.getElementById('searchInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.searchEvents();
            }
        });
    }

    async fetchEvents() {
        this.showLoading(true);
        this.hideError();
        
        try {
            const response = await fetch('/api/events');
            const data = await response.json();
            
            if (data.success) {
                this.events = data.data;
                this.summary = data.summary;
                this.displayEvents(this.events);
                this.showSummary();
                this.showSuccess(`Successfully fetched ${this.events.length} events!`);
            } else {
                this.showError(data.error || 'Failed to fetch events');
            }
        } catch (error) {
            this.showError('Network error: ' + error.message);
        } finally {
            this.showLoading(false);
        }
    }

    async searchEvents() {
        const keyword = document.getElementById('searchInput').value.trim();
        if (!keyword) {
            this.showError('Please enter a search keyword');
            return;
        }

        this.showLoading(true);
        this.hideError();
        
        try {
            const response = await fetch(`/api/events/search?q=${encodeURIComponent(keyword)}`);
            const data = await response.json();
            
            if (data.success) {
                this.displayEvents(data.data);
                this.showSuccess(`Found ${data.count} events matching "${keyword}"`);
            } else {
                this.showError(data.error || 'Search failed');
            }
        } catch (error) {
            this.showError('Search error: ' + error.message);
        } finally {
            this.showLoading(false);
        }
    }

    async showSummary() {
        if (!this.summary) {
            try {
                const response = await fetch('/api/summary');
                const data = await response.json();
                
                if (data.success) {
                    this.summary = data.summary;
                } else {
                    this.showError('Failed to load summary');
                    return;
                }
            } catch (error) {
                this.showError('Error loading summary: ' + error.message);
                return;
            }
        }

        this.displaySummary();
    }

    displayEvents(events) {
        const eventsSection = document.getElementById('eventsSection');
        const eventsGrid = document.getElementById('eventsGrid');
        const eventsCount = document.getElementById('eventsCount');
        
        eventsCount.textContent = `${events.length} events found`;
        
        if (events.length === 0) {
            eventsGrid.innerHTML = '<p class="no-events">No events found matching your criteria.</p>';
        } else {
            eventsGrid.innerHTML = events.map(event => this.createEventCard(event)).join('');
        }
        
        eventsSection.style.display = 'block';
    }

    createEventCard(event) {
        const startDate = event.startDate ? new Date(event.startDate).toLocaleString() : 'TBD';
        const location = event.location || 'TBD';
        const url = event.url || '#';
        
        return `
            <div class="event-card">
                <div class="event-title">${this.escapeHtml(event.title)}</div>
                <div class="event-date">${startDate}</div>
                <div class="event-location">${this.escapeHtml(location)}</div>
                <a href="${url}" target="_blank" class="event-url">View Event</a>
            </div>
        `;
    }

    displaySummary() {
        const summarySection = document.getElementById('summarySection');
        
        // Update summary cards
        document.getElementById('totalEvents').textContent = this.summary.total_events;
        document.getElementById('earliestDate').textContent = this.summary.earliest_date || 'N/A';
        document.getElementById('latestDate').textContent = this.summary.latest_date || 'N/A';
        
        // Create location chart
        this.createLocationChart();
        
        summarySection.style.display = 'block';
    }

    createLocationChart() {
        const ctx = document.getElementById('locationChart').getContext('2d');
        
        // Destroy existing chart if it exists
        if (this.chart) {
            this.chart.destroy();
        }
        
        const locationData = this.summary.events_by_location;
        const locations = Object.keys(locationData);
        const counts = Object.values(locationData);
        
        // Sort by count (descending) and limit to top 10
        const sortedData = locations.map((location, index) => ({
            location,
            count: counts[index]
        })).sort((a, b) => b.count - a.count).slice(0, 10);
        
        this.chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: sortedData.map(item => item.location.length > 20 ? 
                    item.location.substring(0, 20) + '...' : item.location),
                datasets: [{
                    label: 'Number of Events',
                    data: sortedData.map(item => item.count),
                    backgroundColor: [
                        '#AD0000', '#8B0000', '#DC143C', '#B22222',
                        '#000000', '#333333', '#666666', '#999999',
                        '#CCCCCC', '#E0E0E0'
                    ],
                    borderColor: '#fff',
                    borderWidth: 2,
                    borderRadius: 8,
                    borderSkipped: false,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            title: function(context) {
                                const index = context[0].dataIndex;
                                return sortedData[index].location;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    },
                    x: {
                        ticks: {
                            maxRotation: 45,
                            minRotation: 0
                        }
                    }
                }
            }
        });
    }

    exportData(format) {
        if (this.events.length === 0) {
            this.showError('No events to export. Please fetch events first.');
            return;
        }

        let data, filename, mimeType;
        
        if (format === 'json') {
            data = JSON.stringify(this.events, null, 2);
            filename = 'uofl_events.json';
            mimeType = 'application/json';
        } else if (format === 'csv') {
            const headers = ['eventID', 'title', 'startDate', 'location', 'url'];
            const csvContent = [
                headers.join(','),
                ...this.events.map(event => 
                    headers.map(header => `"${(event[header] || '').toString().replace(/"/g, '""')}"`).join(',')
                )
            ].join('\n');
            data = csvContent;
            filename = 'uofl_events.csv';
            mimeType = 'text/csv';
        }

        const blob = new Blob([data], { type: mimeType });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        this.showSuccess(`Data exported as ${filename}`);
    }

    showLoading(show) {
        document.getElementById('loading').style.display = show ? 'block' : 'none';
    }

    showError(message) {
        const errorSection = document.getElementById('errorSection');
        const errorMessage = document.getElementById('errorMessage');
        errorMessage.textContent = message;
        errorSection.style.display = 'block';
        
        // Auto-hide error after 5 seconds
        setTimeout(() => this.hideError(), 5000);
    }

    hideError() {
        document.getElementById('errorSection').style.display = 'none';
    }

    showSuccess(message) {
        // Create a temporary success message
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            z-index: 1000;
            font-weight: 600;
        `;
        successDiv.textContent = message;
        document.body.appendChild(successDiv);
        
        // Remove after 3 seconds
        setTimeout(() => {
            if (successDiv.parentNode) {
                successDiv.parentNode.removeChild(successDiv);
            }
        }, 3000);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new EventsManager();
});
