// UofL Events Demo Data
// This simulates real UofL Events API data for the GitHub Pages demo

const DEMO_EVENTS = [
    {
        eventID: "12345",
        title: "Basketball Game: Cardinals vs Wildcats",
        startDate: "2024-01-15 19:00",
        location: "KFC Yum! Center",
        url: "https://gocards.com/events"
    },
    {
        eventID: "12346", 
        title: "Engineering Career Fair",
        startDate: "2024-01-18 10:00",
        location: "Student Activities Center",
        url: "https://louisville.edu/engineering/career-fair"
    },
    {
        eventID: "12347",
        title: "Music Concert: Jazz Ensemble",
        startDate: "2024-01-20 20:00", 
        location: "Comstock Concert Hall",
        url: "https://louisville.edu/music/events"
    },
    {
        eventID: "12348",
        title: "Research Symposium",
        startDate: "2024-01-22 09:00",
        location: "Ekstrom Library",
        url: "https://louisville.edu/research/symposium"
    },
    {
        eventID: "12349",
        title: "Student Government Meeting",
        startDate: "2024-01-25 14:00",
        location: "Student Activities Center",
        url: "https://louisville.edu/sga"
    },
    {
        eventID: "12350",
        title: "Art Exhibition Opening",
        startDate: "2024-01-28 18:00",
        location: "Hite Art Institute",
        url: "https://louisville.edu/art/exhibitions"
    },
    {
        eventID: "12351",
        title: "Football Game: Cardinals vs Tigers",
        startDate: "2024-02-01 15:00",
        location: "Cardinal Stadium",
        url: "https://gocards.com/events"
    },
    {
        eventID: "12352",
        title: "Health Sciences Workshop",
        startDate: "2024-02-05 11:00",
        location: "Health Sciences Center",
        url: "https://louisville.edu/health/workshops"
    },
    {
        eventID: "12353",
        title: "Theater Production: Romeo & Juliet",
        startDate: "2024-02-08 19:30",
        location: "Thrust Theatre",
        url: "https://louisville.edu/theatre/performances"
    },
    {
        eventID: "12354",
        title: "Business Networking Event",
        startDate: "2024-02-12 17:00",
        location: "College of Business",
        url: "https://louisville.edu/business/networking"
    },
    {
        eventID: "12355",
        title: "Science Fair",
        startDate: "2024-02-15 10:00",
        location: "Natural Sciences Building",
        url: "https://louisville.edu/sciences/fair"
    },
    {
        eventID: "12356",
        title: "Cultural Festival",
        startDate: "2024-02-18 12:00",
        location: "Belknap Campus Quad",
        url: "https://louisville.edu/cultural/festival"
    },
    {
        eventID: "12357",
        title: "Graduate School Information Session",
        startDate: "2024-02-22 16:00",
        location: "Graduate School",
        url: "https://louisville.edu/graduate/info-session"
    },
    {
        eventID: "12358",
        title: "Volleyball Match: Cardinals vs Eagles",
        startDate: "2024-02-25 19:00",
        location: "L&N Federal Credit Union Arena",
        url: "https://gocards.com/events"
    },
    {
        eventID: "12359",
        title: "Library Workshop: Research Methods",
        startDate: "2024-02-28 13:00",
        location: "Ekstrom Library",
        url: "https://louisville.edu/library/workshops"
    }
];

const DEMO_SUMMARY = {
    totalEvents: 15,
    eventsByLocation: {
        "KFC Yum! Center": 1,
        "Student Activities Center": 2,
        "Comstock Concert Hall": 1,
        "Ekstrom Library": 2,
        "Hite Art Institute": 1,
        "Cardinal Stadium": 1,
        "Health Sciences Center": 1,
        "Thrust Theatre": 1,
        "College of Business": 1,
        "Natural Sciences Building": 1,
        "Belknap Campus Quad": 1,
        "Graduate School": 1,
        "L&N Federal Credit Union Arena": 1
    },
    earliestDate: "2024-01-15 19:00",
    latestDate: "2024-02-28 13:00"
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DEMO_EVENTS, DEMO_SUMMARY };
}
