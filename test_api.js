const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testAPI() {
    console.log('🧪 Testing UofL Events Data Manager API...\n');
    
    try {
        // Test 1: Get all events
        console.log('1️⃣ Testing GET /api/events...');
        const eventsResponse = await axios.get(`${BASE_URL}/api/events`);
        console.log(`✅ Success: Retrieved ${eventsResponse.data.data.length} events`);
        console.log(`📊 Summary: ${eventsResponse.data.summary.total_events} total events\n`);
        
        // Test 2: Search events
        console.log('2️⃣ Testing GET /api/events/search?q=music...');
        const searchResponse = await axios.get(`${BASE_URL}/api/events/search?q=music`);
        console.log(`✅ Success: Found ${searchResponse.data.count} events matching "music"`);
        if (searchResponse.data.data.length > 0) {
            console.log(`📝 First result: ${searchResponse.data.data[0].title}\n`);
        }
        
        // Test 3: Get summary
        console.log('3️⃣ Testing GET /api/summary...');
        const summaryResponse = await axios.get(`${BASE_URL}/api/summary`);
        console.log(`✅ Success: Summary generated`);
        console.log(`📈 Total events: ${summaryResponse.data.summary.total_events}`);
        console.log(`📍 Locations: ${Object.keys(summaryResponse.data.summary.events_by_location).length}`);
        console.log(`📅 Date range: ${summaryResponse.data.summary.earliest_date} to ${summaryResponse.data.summary.latest_date}\n`);
        
        console.log('🎉 All API tests passed successfully!');
        
    } catch (error) {
        console.error('❌ API test failed:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
    }
}

// Run tests
testAPI();
