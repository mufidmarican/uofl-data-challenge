# UofL Integrative Design and Development - Data Manager Challenge
# Overview
The IT Innovation team is building a data pipeline that consumes campus events from the UofL Events API (powered by Localist). Your task is to fetch, filter, and transform the event data so it can be used in downstream applications.

API Base URL: https://events.louisville.edu/api/2/events/

Refer to the Localist API documentation for details on usage and query parameters: https://developer.localist.com/doc/api#event-list

# Challenge:
1. Fetch events from the API
    Retrieve all events occurring within the next 60 days from today.
    Handle pagination to ensure no events are missed.

2. Filter events
    Include only non-recurring events (exclude recurring/series events).

3. Transform the data
    Keep only the following fields:
        Event ID
        Name/Title
        Start Date/Time
        Location Name (or "TBD" if missing)
        Event URL
    Ensure Date/Time is in ISO 8601 format (YYYY-MM-DD HH:MM).

4. Produce useful output
    Save the cleaned dataset as CSV or JSON.
    Create a summary report showing:
        Total number of events retrieved.
        A count of events per location.
        The earliest and latest event dates in the dataset.

5. (Optional Bonus)
    Create a simple visualization (e.g., bar chart of events per location).
    Add a keyword search function for events (e.g., “AI”, “Music”).

# Time:
The deadline for submitting this challenge is Thursday 09/11/2025 by 11:59pm.

# Technical Specifications

**Optional Front End Requirements**
- HTML, CSS, JavaScript and / or Python.
- ReactJS, NextJS, Langchain
- Responsive mobile-first design

**Back End Requirements**
- NodeJS or Python Frameworks
- JSON Data Storage File type
- REST API

**Code Quality**
- Clean, readable code with meaningful variable names.
- Commented code for complex logic
- Proper Error Handling and Logging
- Git version control with meaningful commit messages.

# Deliverables
1. *Source Code*
    - Complete Project Files
    - README.md with setup and other important instructions
    - Package Requirements file (package.json, requirements.txt, ...)
2. *Documentation*
    - Provide a brief explanation of your approach in the README.md
    - Provide Instructions to run the Code Base in the README.md
    - Provide a List of Features in the README.md
3. *Demo*
    - Application should build and run locally
    - If your project includes a front end, please upload it to Github and publish it with Github Pages which will provide a link you could share to us that will render the project on Github's servers.

# Sample Data 
```json
{
    "data": [
        {
            "eventID": 49356427000535,
            "title": "Compassionate Caregiving: Self-Care",
            "startDate": "2025-05-20T12:00:00",
            "location": "The Center at Kentucky Highlands (London)",
            "url": "https://centers.louisville.edu/form/clinical-trials-day-registration",
            // ...
        },
        {
            "eventID": 49222825520117,
            "title": "School of Dentistry Impressions Day - DMD Program Open House",
            "startDate": "2025-05-30T09:00:00",
            "location": "School of Dentistry",
            "url": "https://forms.office.com/r/eWj9tU0mej?origin=lprLink",
            // ...
        }
    ]
} 
```

# Evaluation Criteria

**Technical Skills**
    - Code quality and organization
    - Proper use of HTML, CSS, Javascript or Python
    - Implementation of the required steps of the Challenge
**User Experience**
    - Design and usability
    - Responsive mobile-first approach
    - Clear user-flows and error feedback
**Innovation and Bonus Features**
    - Creative solutions to problem solving
    - Additional features or styling beyond bare requirements
    - Use of modern frameworks and solutions
    - AI / ML integration attempts
**Documentation and Communication**
    - Clear README and setup instructions
    - Code comments and other documentation
    - Git commit history with meaningful commit messages
    - Explanation of design decisions

# Submission Instructions

1. Provide a Github Repository for your project
2. Include all source code and documentation within the repository
3. Ensure the application can be run locally with the provided instructions
4. If your project includes a front end, publish the application onto Github pages which will provide a link you can share to us to see the front end render.
5. Email the link to the repository itself, as well as the Github pages link to the Senior Director for IT Innovation at the Integrative Design and Development team.