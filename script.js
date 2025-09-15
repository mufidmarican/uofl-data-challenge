
class EventsDataManager {
    constructor() {
        this.apiBaseUrl = 'https://events.louisville.edu/api/2/events/';
        this.eventsData = [];
        this.filteredEvents = [];
        this.currentPage = 1;
        this.totalPages = 1;
        this.isLoading = false;
        
        this.initializeEventListeners();
    }

   
    initializeEventListeners() {
        document.getElementById('fetchBtn').addEventListener('click', () => this.fetchEvents());
        document.getElementById('exportCsvBtn').addEventListener('click', () => this.exportToCSV());
        document.getElementById('exportJsonBtn').addEventListener('click', () => this.exportToJSON());
        document.getElementById('generateReportBtn').addEventListener('click', () => this.generateSummaryReport());
        document.getElementById('searchBtn').addEventListener('click', () => this.searchEvents());
        document.getElementById('searchInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.searchEvents();
            }
        });
        
        
        document.getElementById('tableViewBtn').addEventListener('click', () => this.switchView('table'));
        document.getElementById('cardViewBtn').addEventListener('click', () => this.switchView('card'));
        document.getElementById('timelineViewBtn').addEventListener('click', () => this.switchView('timeline'));
    }

   
    showLoading(message = 'Loading...') {
        this.isLoading = true;
        const loadingEl = document.getElementById('loadingIndicator');
        const messageEl = loadingEl.querySelector('p');
        messageEl.textContent = message;
        loadingEl.classList.remove('hidden');
    }

   
    hideLoading() {
        this.isLoading = false;
        document.getElementById('loadingIndicator').classList.add('hidden');
    }

    
    showStatus(message, type = 'info') {
        const statusEl = document.getElementById('statusMessage');
        statusEl.textContent = message;
        statusEl.className = `status-message ${type}`;
        statusEl.classList.remove('hidden');
        
        
        setTimeout(() => {
            statusEl.classList.add('hidden');
        }, 5000);
    }

   
    getDateRange() {
        const today = new Date();
        const futureDate = new Date();
        futureDate.setDate(today.getDate() + 60);
        
        
        const formatDate = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };
        
        return {
            start: formatDate(today),
            end: formatDate(futureDate)
        };
    }


    async fetchEvents() {
        if (this.isLoading) return;
        
        this.showLoading('Fetching events from UofL API...');
        this.eventsData = [];
        this.currentPage = 1;
        
        try {
            const dateRange = this.getDateRange();
            let allEvents = [];
            let hasMorePages = true;
            
            while (hasMorePages) {
                const url = `${this.apiBaseUrl}?pp=50&page=${this.currentPage}&start=${dateRange.start}&end=${dateRange.end}`;
                
                this.showLoading(`Fetching page ${this.currentPage}...`);
                
                const response = await fetch(url);
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                
                if (data.events && data.events.length > 0) {
                    
                    const events = data.events.map(item => item.event);
                    allEvents = allEvents.concat(events);
                    this.currentPage++;
                    
                    
                    hasMorePages = data.events.length === 50; 
                } else {
                    hasMorePages = false;
                }
                
                
                if (this.currentPage > 20) {
                    console.warn('Reached maximum page limit (20)');
                    break;
                }
            }
            
            
            this.eventsData = this.filterAndTransformEvents(allEvents);
            this.filteredEvents = [...this.eventsData];
            
            this.hideLoading();
            this.showStatus(`Successfully fetched ${this.eventsData.length} events!`, 'success');
            
          
            this.enableButtons();
            this.displayEvents();
            this.generateSummaryReport();
            
        } catch (error) {
            this.hideLoading();
            console.error('Error fetching events:', error);
            this.showStatus(`Error fetching events: ${error.message}`, 'error');
        }
    }

    
    filterAndTransformEvents(events) {
        const transformedEvents = [];
        
        events.forEach(event => {
            
            let startDate = 'TBD';
            
            if (event.event_instances && event.event_instances.length > 0) {
                const eventInstance = event.event_instances[0].event_instance;
                startDate = eventInstance.start;
            } else if (event.first_date) {
                startDate = event.first_date;
            }
            
           
            transformedEvents.push({
                eventID: event.id, 
                title: event.title || 'Untitled Event',
                startDate: this.formatDateTime(startDate),
                location: event.location_name || 'TBD',
                url: event.url || '#'
            });
        });
        
        return transformedEvents.sort((a, b) => {
            const dateA = this.parseDateString(a.startDate);
            const dateB = this.parseDateString(b.startDate);
            if (!dateA || !dateB) return 0;
            return dateA - dateB;
        });
    }

    // Format date/time to ISO 8601 format (YYYY-MM-DD HH:MM)
    formatDateTime(dateString) {
        if (!dateString) return 'TBD';
        
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'TBD';
            
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            
            return `${year}-${month}-${day} ${hours}:${minutes}`;
        } catch (error) {
            console.warn('Error formatting date:', dateString, error);
            return 'TBD';
        }
    }

    
    parseDateString(dateString) {
        if (!dateString || dateString === 'TBD') return null;
        
        try {
            
            if (dateString.includes('T')) {
                return new Date(dateString);
            } else {
                
                const [datePart, timePart] = dateString.split(' ');
                return new Date(`${datePart}T${timePart}:00`);
            }
        } catch (error) {
            console.warn('Error parsing date:', dateString, error);
            return null;
        }
    }


    enableButtons() {
        document.getElementById('exportCsvBtn').disabled = false;
        document.getElementById('exportJsonBtn').disabled = false;
        document.getElementById('generateReportBtn').disabled = false;
        document.getElementById('searchInput').disabled = false;
        document.getElementById('searchBtn').disabled = false;
    }


    displayEvents() {
        const tableBody = document.getElementById('eventsTableBody');
        const eventsSection = document.getElementById('eventsSection');
        
        if (this.filteredEvents.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" class="text-center">No events found</td></tr>';
        } else {
            tableBody.innerHTML = this.filteredEvents.map(event => `
                <tr>
                    <td>${event.eventID}</td>
                    <td>${this.escapeHtml(event.title)}</td>
                    <td>${event.startDate}</td>
                    <td>${this.escapeHtml(event.location)}</td>
                    <td><a href="${event.url}" target="_blank" rel="noopener noreferrer">View Event</a></td>
                </tr>
            `).join('');
        }
        
        eventsSection.classList.remove('hidden');
        this.displayCardView();
        this.displayTimelineView();
    }


    switchView(viewType) {

        document.querySelectorAll('.view-controls .btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById(`${viewType}ViewBtn`).classList.add('active');
        

        document.querySelectorAll('.view-container').forEach(container => container.classList.add('hidden'));
        document.getElementById(`${viewType}View`).classList.remove('hidden');
    }


    displayCardView() {
        const cardContainer = document.getElementById('eventsCardContainer');
        
        if (this.filteredEvents.length === 0) {
            cardContainer.innerHTML = '<div class="text-center">No events found</div>';
            return;
        }
        
        cardContainer.innerHTML = this.filteredEvents.map(event => `
            <div class="event-card">
                <div class="event-card-header">
                    <div class="event-id">ID: ${event.eventID}</div>
                </div>
                <div class="event-title">${this.escapeHtml(event.title)}</div>
                <div class="event-details">
                    <div class="event-detail">
                        <i>📅</i>
                        <span>${event.startDate}</span>
                    </div>
                    <div class="event-detail">
                        <i>📍</i>
                        <span>${this.escapeHtml(event.location)}</span>
                    </div>
                </div>
                <div class="event-url">
                    <a href="${event.url}" target="_blank" rel="noopener noreferrer">
                        View Event Details →
                    </a>
                </div>
            </div>
        `).join('');
    }

   
    displayTimelineView() {
        const timelineContainer = document.getElementById('timelineContainer');
        
        if (this.filteredEvents.length === 0) {
            timelineContainer.innerHTML = '<div class="text-center">No events found</div>';
            return;
        }
        
    
        const eventsByDate = {};
        this.filteredEvents.forEach(event => {
            const date = event.startDate.split(' ')[0]; 
            if (!eventsByDate[date]) {
                eventsByDate[date] = [];
            }
            eventsByDate[date].push(event);
        });
        
      
        const sortedDates = Object.keys(eventsByDate).sort();
        
        timelineContainer.innerHTML = sortedDates.map(date => `
            <div class="timeline-item">
                <div class="timeline-date">${this.formatDateForDisplay(date)}</div>
                <div class="timeline-events">
                    ${eventsByDate[date].map(event => `
                        <div class="timeline-event">
                            <div class="timeline-event-title">${this.escapeHtml(event.title)}</div>
                            <div class="timeline-event-meta">
                                <span>🕒 ${event.startDate.split(' ')[1]}</span>
                                <span>📍 ${this.escapeHtml(event.location)}</span>
                                <span>🔗 <a href="${event.url}" target="_blank" rel="noopener noreferrer">View</a></span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }

    
    formatDateForDisplay(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    }

   
    searchEvents() {
        const searchTerm = document.getElementById('searchInput').value.trim().toLowerCase();
        const searchResults = document.getElementById('searchResults');
        const searchTableBody = document.getElementById('searchTableBody');
        
        if (!searchTerm) {
            this.showStatus('Please enter a search term', 'error');
            return;
        }
        
        const filteredResults = this.eventsData.filter(event => 
            event.title.toLowerCase().includes(searchTerm) ||
            event.location.toLowerCase().includes(searchTerm)
        );
        
        if (filteredResults.length === 0) {
            searchTableBody.innerHTML = '<tr><td colspan="5" class="text-center">No events found matching your search</td></tr>';
        } else {
            searchTableBody.innerHTML = filteredResults.map(event => `
                <tr>
                    <td>${event.eventID}</td>
                    <td>${this.escapeHtml(event.title)}</td>
                    <td>${event.startDate}</td>
                    <td>${this.escapeHtml(event.location)}</td>
                    <td><a href="${event.url}" target="_blank" rel="noopener noreferrer">View Event</a></td>
                </tr>
            `).join('');
        }
        
        searchResults.classList.remove('hidden');
        this.showStatus(`Found ${filteredResults.length} events matching "${searchTerm}"`, 'success');
    }

    // Generate summary report
    generateSummaryReport() {
        if (this.eventsData.length === 0) return;
        
        const summaryReport = document.getElementById('summaryReport');
        const totalEvents = this.eventsData.length;
        
   
        const dates = this.eventsData.map(event => this.parseDateString(event.startDate)).filter(date => date !== null);
        const earliestDate = dates.length > 0 ? new Date(Math.min(...dates)) : null;
        const latestDate = dates.length > 0 ? new Date(Math.max(...dates)) : null;
        
       
        const locationCounts = {};
        this.eventsData.forEach(event => {
            const location = event.location || 'TBD';
            locationCounts[location] = (locationCounts[location] || 0) + 1;
        });
        
      
        document.getElementById('totalEvents').textContent = totalEvents;
        document.getElementById('earliestEvent').textContent = earliestDate ? 
            this.formatDateTime(earliestDate.toISOString()) : 'N/A';
        document.getElementById('latestEvent').textContent = latestDate ? 
            this.formatDateTime(latestDate.toISOString()) : 'N/A';
        
    
        this.createLocationChart(locationCounts);
        this.createDatesChart();
        this.createHoursChart();
        this.createWeekdayChart();
        
        summaryReport.classList.remove('hidden');
    }


    createLocationChart(locationCounts) {
        const ctx = document.getElementById('locationsChartCanvas').getContext('2d');
        
        
        if (this.locationChart) {
            this.locationChart.destroy();
        }
        
        const locations = Object.keys(locationCounts);
        const counts = Object.values(locationCounts);
        
        
        const sortedData = locations.map((location, index) => ({
            location,
            count: counts[index]
        })).sort((a, b) => b.count - a.count).slice(0, 10);
        
        this.locationChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: sortedData.map(item => item.location),
                datasets: [{
                    label: 'Number of Events',
                    data: sortedData.map(item => item.count),
                    backgroundColor: 'rgba(139, 0, 0, 0.8)',
                    borderColor: 'rgba(139, 0, 0, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
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

  
    createDatesChart() {
        const ctx = document.getElementById('datesChartCanvas').getContext('2d');
        
   
        if (this.datesChart) {
            this.datesChart.destroy();
        }
        
      
        const dateCounts = {};
        this.eventsData.forEach(event => {
            const date = event.startDate.split(' ')[0];
            dateCounts[date] = (dateCounts[date] || 0) + 1;
        });
        
        const sortedDates = Object.keys(dateCounts).sort();
        const counts = sortedDates.map(date => dateCounts[date]);
        
        this.datesChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: sortedDates.map(date => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
                datasets: [{
                    label: 'Events per Day',
                    data: counts,
                    borderColor: 'rgba(139, 0, 0, 1)',
                    backgroundColor: 'rgba(139, 0, 0, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
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
                            maxRotation: 45
                        }
                    }
                }
            }
        });
    }


    createHoursChart() {
        const ctx = document.getElementById('hoursChartCanvas').getContext('2d');
        
  
        if (this.hoursChart) {
            this.hoursChart.destroy();
        }
        
     
        const hourCounts = {};
        this.eventsData.forEach(event => {
            const time = event.startDate.split(' ')[1];
            if (time && time !== 'TBD') {
                const hour = parseInt(time.split(':')[0]);
                hourCounts[hour] = (hourCounts[hour] || 0) + 1;
            }
        });
        
        const hours = Array.from({length: 24}, (_, i) => i);
        const counts = hours.map(hour => hourCounts[hour] || 0);
        
        this.hoursChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: hours.map(hour => `${hour}:00`),
                datasets: [{
                    label: 'Events per Hour',
                    data: counts,
                    backgroundColor: 'rgba(220, 20, 60, 0.8)',
                    borderColor: 'rgba(220, 20, 60, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
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
                            maxRotation: 45
                        }
                    }
                }
            }
        });
    }

   
    createWeekdayChart() {
        const ctx = document.getElementById('weekdayChartCanvas').getContext('2d');
        
    
        if (this.weekdayChart) {
            this.weekdayChart.destroy();
        }
        
     
        const weekdayCounts = {};
        const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        
        this.eventsData.forEach(event => {
            const date = this.parseDateString(event.startDate);
            if (date) {
                const weekday = weekdays[date.getDay()];
                weekdayCounts[weekday] = (weekdayCounts[weekday] || 0) + 1;
            }
        });
        
        const counts = weekdays.map(day => weekdayCounts[day] || 0);
        
        this.weekdayChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: weekdays,
                datasets: [{
                    data: counts,
                    backgroundColor: [
                        'rgba(139, 0, 0, 0.8)',
                        'rgba(220, 20, 60, 0.8)',
                        'rgba(178, 34, 34, 0.8)',
                        'rgba(205, 92, 92, 0.8)',
                        'rgba(255, 99, 71, 0.8)',
                        'rgba(255, 127, 80, 0.8)',
                        'rgba(255, 160, 122, 0.8)'
                    ],
                    borderColor: [
                        'rgba(139, 0, 0, 1)',
                        'rgba(220, 20, 60, 1)',
                        'rgba(178, 34, 34, 1)',
                        'rgba(205, 92, 92, 1)',
                        'rgba(255, 99, 71, 1)',
                        'rgba(255, 127, 80, 1)',
                        'rgba(255, 160, 122, 1)'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true
                        }
                    }
                }
            }
        });
    }

 
    exportToCSV() {
        if (this.eventsData.length === 0) {
            this.showStatus('No data to export', 'error');
            return;
        }
        
        const headers = ['Event ID', 'Title', 'Start Date/Time', 'Location', 'Event URL'];
        const csvContent = [
            headers.join(','),
            ...this.eventsData.map(event => [
                event.eventID,
                `"${event.title.replace(/"/g, '""')}"`,
                event.startDate,
                `"${event.location.replace(/"/g, '""')}"`,
                event.url
            ].join(','))
        ].join('\n');
        
        this.downloadFile(csvContent, 'uofl_events_data.csv', 'text/csv');
        this.showStatus('CSV file downloaded successfully!', 'success');
    }

   
    exportToJSON() {
        if (this.eventsData.length === 0) {
            this.showStatus('No data to export', 'error');
            return;
        }
        
        const jsonData = {
            metadata: {
                totalEvents: this.eventsData.length,
                exportDate: new Date().toISOString(),
                source: 'UofL Events API'
            },
            events: this.eventsData
        };
        
        const jsonContent = JSON.stringify(jsonData, null, 2);
        this.downloadFile(jsonContent, 'uofl_events_data.json', 'application/json');
        this.showStatus('JSON file downloaded successfully!', 'success');
    }

  
    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

 
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}


document.addEventListener('DOMContentLoaded', () => {
    new EventsDataManager();
});


window.addEventListener('error', (event) => {
    if (event.message.includes('CORS') || event.message.includes('fetch')) {
        console.error('CORS or fetch error:', event.message);
        
    }
});
