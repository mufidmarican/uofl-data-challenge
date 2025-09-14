// UofL Events Manager - Frontend JavaScript
class EventsManager {
    constructor() {
        this.events = [];
        this.filteredEvents = [];
        this.currentPage = 1;
        this.eventsPerPage = 10;
        this.chart = null;
        
        this.initializeEventListeners();
        this.loadInitialData();
    }
    
    initializeEventListeners() {
        // Search functionality
        document.getElementById('searchBtn').addEventListener('click', () => this.searchEvents());
        document.getElementById('searchInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.searchEvents();
            }
        });
        document.getElementById('clearSearchBtn').addEventListener('click', () => this.clearSearch());
        
        // Action buttons
        document.getElementById('refreshBtn').addEventListener('click', () => this.refreshData());
        document.getElementById('exportCsvBtn').addEventListener('click', () => this.exportCsv());
        document.getElementById('exportJsonBtn').addEventListener('click', () => this.exportJson());
        
        // Pagination
        document.getElementById('prevPage').addEventListener('click', () => this.previousPage());
        document.getElementById('nextPage').addEventListener('click', () => this.nextPage());
    }
    
    async loadInitialData() {
        try {
            this.showLoading(true);
            await this.fetchEvents();
            await this.fetchSummary();
            this.displayEvents();
            this.updatePagination();
        } catch (error) {
            this.showToast('Error loading data: ' + error.message, 'error');
        } finally {
            this.showLoading(false);
        }
    }
    
    async fetchEvents() {
        try {
            const response = await fetch('/api/events');
            const data = await response.json();
            
            if (data.success) {
                this.events = data.data;
                this.filteredEvents = [...this.events];
                return data.data;
            } else {
                throw new Error(data.error || 'Failed to fetch events');
            }
        } catch (error) {
            console.error('Error fetching events:', error);
            throw error;
        }
    }
    
    async fetchSummary() {
        try {
            const response = await fetch('/api/events/summary');
            const data = await response.json();
            
            if (data.success) {
                this.updateSummaryStats(data.summary);
                this.updateLocationChart(data.summary.events_by_location);
            }
        } catch (error) {
            console.error('Error fetching summary:', error);
        }
    }
    
    async searchEvents() {
        const keyword = document.getElementById('searchInput').value.trim();
        
        if (!keyword) {
            this.clearSearch();
            return;
        }
        
        try {
            this.showLoading(true);
            const response = await fetch(`/api/events/search?q=${encodeURIComponent(keyword)}`);
            const data = await response.json();
            
            if (data.success) {
                this.filteredEvents = data.data;
                this.currentPage = 1;
                this.displayEvents();
                this.updatePagination();
                this.showToast(`Found ${data.count} events matching "${keyword}"`, 'info');
            } else {
                throw new Error(data.error || 'Search failed');
            }
        } catch (error) {
            this.showToast('Search error: ' + error.message, 'error');
        } finally {
            this.showLoading(false);
        }
    }
    
    clearSearch() {
        document.getElementById('searchInput').value = '';
        this.filteredEvents = [...this.events];
        this.currentPage = 1;
        this.displayEvents();
        this.updatePagination();
        this.showToast('Search cleared', 'info');
    }
    
    async refreshData() {
        try {
            this.showLoading(true);
            const response = await fetch('/api/events/refresh');
            const data = await response.json();
            
            if (data.success) {
                await this.fetchEvents();
                await this.fetchSummary();
                this.displayEvents();
                this.updatePagination();
                this.showToast(`Refreshed ${data.count} events`, 'success');
            } else {
                throw new Error(data.error || 'Refresh failed');
            }
        } catch (error) {
            this.showToast('Refresh error: ' + error.message, 'error');
        } finally {
            this.showLoading(false);
        }
    }
    
    async exportCsv() {
        try {
            const response = await fetch('/api/events/export/csv');
            const data = await response.json();
            
            if (data.success) {
                this.showToast('CSV file generated successfully', 'success');
                // In a real application, you would trigger a download
                console.log('CSV file:', data.filename);
            } else {
                throw new Error(data.error || 'CSV export failed');
            }
        } catch (error) {
            this.showToast('CSV export error: ' + error.message, 'error');
        }
    }
    
    async exportJson() {
        try {
            const response = await fetch('/api/events/export/json');
            const data = await response.json();
            
            if (data.success) {
                this.showToast('JSON file generated successfully', 'success');
                // In a real application, you would trigger a download
                console.log('JSON file:', data.filename);
            } else {
                throw new Error(data.error || 'JSON export failed');
            }
        } catch (error) {
            this.showToast('JSON export error: ' + error.message, 'error');
        }
    }
    
    displayEvents() {
        const eventsList = document.getElementById('eventsList');
        const noEventsMessage = document.getElementById('noEventsMessage');
        
        if (this.filteredEvents.length === 0) {
            eventsList.innerHTML = '';
            noEventsMessage.style.display = 'block';
            return;
        }
        
        noEventsMessage.style.display = 'none';
        
        const startIndex = (this.currentPage - 1) * this.eventsPerPage;
        const endIndex = startIndex + this.eventsPerPage;
        const pageEvents = this.filteredEvents.slice(startIndex, endIndex);
        
        eventsList.innerHTML = pageEvents.map(event => this.createEventCard(event)).join('');
    }
    
    createEventCard(event) {
        const startDate = new Date(event.startDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        return `
            <div class="event-card">
                <div class="event-title">${this.escapeHtml(event.title)}</div>
                <div class="event-details">
                    <div class="event-detail">
                        <i class="fas fa-calendar"></i>
                        <span>${startDate}</span>
                    </div>
                    <div class="event-detail">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${this.escapeHtml(event.location)}</span>
                    </div>
                    <div class="event-detail">
                        <i class="fas fa-hashtag"></i>
                        <span>ID: ${event.eventID}</span>
                    </div>
                </div>
                ${event.url ? `<a href="${event.url}" target="_blank" class="event-url">
                    <i class="fas fa-external-link-alt"></i>
                    View Event Details
                </a>` : ''}
            </div>
        `;
    }
    
    updateSummaryStats(summary) {
        document.getElementById('totalEvents').textContent = summary.total_events;
        document.getElementById('totalLocations').textContent = Object.keys(summary.events_by_location).length;
        document.getElementById('earliestDate').textContent = summary.earliest_date ? 
            new Date(summary.earliest_date).toLocaleDateString() : 'N/A';
        document.getElementById('latestDate').textContent = summary.latest_date ? 
            new Date(summary.latest_date).toLocaleDateString() : 'N/A';
    }
    
    updateLocationChart(locationData) {
        const ctx = document.getElementById('locationChart').getContext('2d');
        
        if (this.chart) {
            this.chart.destroy();
        }
        
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
                    backgroundColor: 'rgba(102, 126, 234, 0.8)',
                    borderColor: 'rgba(102, 126, 234, 1)',
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
                            minRotation: 45
                        }
                    }
                }
            }
        });
    }
    
    updatePagination() {
        const totalPages = Math.ceil(this.filteredEvents.length / this.eventsPerPage);
        const pagination = document.getElementById('pagination');
        const pageInfo = document.getElementById('pageInfo');
        const prevBtn = document.getElementById('prevPage');
        const nextBtn = document.getElementById('nextPage');
        
        if (totalPages <= 1) {
            pagination.style.display = 'none';
            return;
        }
        
        pagination.style.display = 'flex';
        pageInfo.textContent = `Page ${this.currentPage} of ${totalPages}`;
        
        prevBtn.disabled = this.currentPage === 1;
        nextBtn.disabled = this.currentPage === totalPages;
    }
    
    previousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.displayEvents();
            this.updatePagination();
        }
    }
    
    nextPage() {
        const totalPages = Math.ceil(this.filteredEvents.length / this.eventsPerPage);
        if (this.currentPage < totalPages) {
            this.currentPage++;
            this.displayEvents();
            this.updatePagination();
        }
    }
    
    showLoading(show) {
        const loadingIndicator = document.getElementById('loadingIndicator');
        loadingIndicator.style.display = show ? 'block' : 'none';
    }
    
    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast ${type} show`;
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new EventsManager();
});
