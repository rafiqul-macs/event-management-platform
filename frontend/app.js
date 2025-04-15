// Event Management Platform - Frontend Application

// Global variables
let apiBaseUrl = 'https://your-api-gateway-url-here/dev'; // Replace with your actual API Gateway URL
let currentUser = null;
let events = [];
let userEvents = [];

// DOM Elements
const navLinks = document.querySelectorAll('nav a');
const views = document.querySelectorAll('.view');
const eventsList = document.getElementById('events-list');
const eventModal = document.getElementById('event-modal');
const eventForm = document.getElementById('event-form');
const createEventBtn = document.getElementById('create-event-btn');
const cancelEventBtn = document.getElementById('cancel-event-btn');
const closeModalBtn = document.querySelector('.close');
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const reportTypeSelect = document.getElementById('report-type');
const reportParamGroups = document.querySelectorAll('.report-param-group');
const generateReportBtn = document.getElementById('generate-report-btn');
const reportResults = document.getElementById('report-results');

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    initializeNavigation();
    initializeEventListeners();
    
    // Load initial data
    fetchEvents();
    
    // Mock user data (replace with actual authentication)
    currentUser = {
        id: 'user-123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '(555) 123-4567',
        location: 'San Francisco, CA',
        joinedDate: '2023-01-15'
    };
    
    updateProfileView();
});

// Initialize navigation between views
function initializeNavigation() {
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remove active class from all links and add to clicked link
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            // Show corresponding view
            const viewId = link.getAttribute('data-view');
            views.forEach(view => {
                view.classList.remove('active');
                if (view.id === `${viewId}-view`) {
                    view.classList.add('active');
                }
            });
        });
    });
}

// Initialize all event listeners
function initializeEventListeners() {
    // Event modal
    createEventBtn.addEventListener('click', openEventModal);
    cancelEventBtn.addEventListener('click', closeEventModal);
    closeModalBtn.addEventListener('click', closeEventModal);
    eventForm.addEventListener('submit', handleEventFormSubmit);
    
    // Tab navigation
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');
            
            // Update active tab button
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Show corresponding tab content
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === `${tabId}-tab`) {
                    content.classList.add('active');
                }
            });
        });
    });
    
    // Report type change
    reportTypeSelect.addEventListener('change', updateReportParameters);
    
    // Generate report
    generateReportBtn.addEventListener('click', generateReport);
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === eventModal) {
            closeEventModal();
        }
    });
}

// Fetch events from API
async function fetchEvents() {
    try {
        // For demo purposes, we're using mock data
        // In production, uncomment the fetch call to the actual API
        
        /*
        const response = await fetch(`${apiBaseUrl}/events`);
        if (!response.ok) {
            throw new Error('Failed to fetch events');
        }
        events = await response.json();
        */
        
        // Mock data for demonstration
        events = [
            {
                id: 'event-1',
                name: 'Tech Conference 2023',
                eventDate: '2023-11-15',
                location: 'San Francisco, CA',
                description: 'Join us for the latest in tech innovations and networking opportunities.',
                imageUrl: 'https://via.placeholder.com/300x200',
                capacity: 500,
                organizerId: 'user-456',
                eventType: 'conference'
            },
            {
                id: 'event-2',
                name: 'Design Workshop',
                eventDate: '2023-12-05',
                location: 'New York, NY',
                description: 'Learn the latest design trends and tools in this hands-on workshop.',
                imageUrl: 'https://via.placeholder.com/300x200',
                capacity: 50,
                organizerId: 'user-123',
                eventType: 'workshop'
            },
            {
                id: 'event-3',
                name: 'Marketing Summit',
                eventDate: '2024-01-20',
                location: 'Chicago, IL',
                description: 'Discover innovative marketing strategies for the digital age.',
                imageUrl: 'https://via.placeholder.com/300x200',
                capacity: 200,
                organizerId: 'user-789',
                eventType: 'conference'
            }
        ];
        
        renderEvents();
        
        // Also fetch user events (events the user has registered for or created)
        fetchUserEvents();
        
    } catch (error) {
        console.error('Error fetching events:', error);
        showNotification('Failed to load events. Please try again.', 'error');
    }
}

// Fetch events specific to the current user
async function fetchUserEvents() {
    if (!currentUser) return;
    
    try {
        // For demo purposes, we're using mock data
        // In production, uncomment the fetch calls to the actual API
        
        /*
        // Fetch events the user has registered for
        const registeredResponse = await fetch(`${apiBaseUrl}/users/${currentUser.id}/registrations`);
        if (!registeredResponse.ok) {
            throw new Error('Failed to fetch registrations');
        }
        const registeredEvents = await registeredResponse.json();
        
        // Fetch events the user has created
        const createdResponse = await fetch(`${apiBaseUrl}/events?organizerId=${currentUser.id}`);
        if (!createdResponse.ok) {
            throw new Error('Failed to fetch created events');
        }
        const createdEvents = await createdResponse.json();
        
        userEvents = {
            registered: registeredEvents,
            created: createdEvents
        };
        */
        
        // Mock data for demonstration
        userEvents = {
            registered: [
                {
                    id: 'event-1',
                    name: 'Tech Conference 2023',
                    eventDate: '2023-11-15',
                    location: 'San Francisco, CA',
                    imageUrl: 'https://via.placeholder.com/300x200',
                    registrationStatus: 'confirmed'
                }
            ],
            created: [
                {
                    id: 'event-2',
                    name: 'Design Workshop',
                    eventDate: '2023-12-05',
                    location: 'New York, NY',
                    imageUrl: 'https://via.placeholder.com/300x200',
                    registrationCount: 15
                }
            ]
        };
        
        renderUserEvents();
        
    } catch (error) {
        console.error('Error fetching user events:', error);
        showNotification('Failed to load your events. Please try again.', 'error');
    }
}

// Render events list
function renderEvents() {
    if (!events.length) {
        eventsList.innerHTML = '<p>No events found.</p>';
        return;
    }
    
    eventsList.innerHTML = events.map(event => `
        <div class="card event-card">
            <div class="card-image" style="background-image: url('${event.imageUrl}')"></div>
            <div class="card-content">
                <h3>${event.name}</h3>
                <p class="event-date">${formatDate(event.eventDate)}</p>
                <p class="event-location">${event.location}</p>
                <p class="event-description">${event.description}</p>
                <button class="btn btn-secondary" onclick="registerForEvent('${event.id}')">Register</button>
            </div>
        </div>
    `).join('');
}

// Render user events (registered and created)
function renderUserEvents() {
    // Render registered events
    const registeredTab = document.getElementById('registered-tab');
    if (!userEvents.registered || !userEvents.registered.length) {
        registeredTab.innerHTML = '<p>You haven\'t registered for any events yet.</p>';
    } else {
        registeredTab.innerHTML = `
            <div class="cards-grid">
                ${userEvents.registered.map(event => `
                    <div class="card event-card">
                        <div class="card-image" style="background-image: url('${event.imageUrl}')"></div>
                        <div class="card-content">
                            <h3>${event.name}</h3>
                            <p class="event-date">${formatDate(event.eventDate)}</p>
                            <p class="event-location">${event.location}</p>
                            <div class="badge badge-success">${event.registrationStatus}</div>
                            <button class="btn btn-secondary" onclick="viewEventDetails('${event.id}')">View Details</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    // Render created events
    const createdTab = document.getElementById('created-tab');
    if (!userEvents.created || !userEvents.created.length) {
        createdTab.innerHTML = '<p>You haven\'t created any events yet.</p>';
    } else {
        createdTab.innerHTML = `
            <div class="cards-grid">
                ${userEvents.created.map(event => `
                    <div class="card event-card">
                        <div class="card-image" style="background-image: url('${event.imageUrl}')"></div>
                        <div class="card-content">
                            <h3>${event.name}</h3>
                            <p class="event-date">${formatDate(event.eventDate)}</p>
                            <p class="event-location">${event.location}</p>
                            <div class="badge badge-primary">${event.registrationCount} Registrations</div>
                            <div class="event-actions">
                                <button class="btn btn-secondary" onclick="editEvent('${event.id}')">Edit</button>
                                <button class="btn btn-danger" onclick="cancelEvent('${event.id}')">Cancel</button>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
}

// Update profile view with user data
function updateProfileView() {
    if (!currentUser) return;
    
    document.getElementById('profile-name').textContent = `${currentUser.firstName} ${currentUser.lastName}`;
    document.getElementById('profile-email').textContent = currentUser.email;
    document.getElementById('profile-full-name').textContent = `${currentUser.firstName} ${currentUser.lastName}`;
    document.getElementById('profile-email-display').textContent = currentUser.email;
    document.getElementById('profile-phone').textContent = currentUser.phone || 'Not provided';
    document.getElementById('profile-location').textContent = currentUser.location || 'Not provided';
    document.getElementById('profile-joined').textContent = formatDate(currentUser.joinedDate);
}

// Open event creation/edit modal
function openEventModal(event = null) {
    document.getElementById('modal-title').textContent = event ? 'Edit Event' : 'Create New Event';
    
    if (event) {
        // Populate form with event data for editing
        document.getElementById('event-name').value = event.name;
        document.getElementById('event-date').value = event.eventDate;
        document.getElementById('event-time').value = event.eventTime || '12:00';
        document.getElementById('event-location').value = event.location;
        document.getElementById('event-type').value = event.eventType;
        document.getElementById('event-capacity').value = event.capacity;
        document.getElementById('event-description').value = event.description;
        
        // Store event ID for updating
        eventForm.dataset.eventId = event.id;
    } else {
        // Reset form for creating new event
        eventForm.reset();
        delete eventForm.dataset.eventId;
    }
    
    eventModal.style.display = 'block';
}

// Close event modal
function closeEventModal() {
    eventModal.style.display = 'none';
    eventForm.reset();
}

// Handle event form submission
async function handleEventFormSubmit(e) {
    e.preventDefault();
    
    const eventData = {
        name: document.getElementById('event-name').value,
        eventDate: document.getElementById('event-date').value,
        eventTime: document.getElementById('event-time').value,
        location: document.getElementById('event-location').value,
        eventType: document.getElementById('event-type').value,
        capacity: parseInt(document.getElementById('event-capacity').value),
        description: document.getElementById('event-description').value,
        organizerId: currentUser.id
    };
    
    // Handle image upload (in a real app, you would upload to S3)
    const imageFile = document.getElementById('event-image').files[0];
    if (imageFile) {
        // For demo purposes, we're not actually uploading
        console.log('Would upload file:', imageFile.name);
        eventData.imageUrl = 'https://via.placeholder.com/300x200';
    } else {
        eventData.imageUrl = 'https://via.placeholder.com/300x200';
    }
    
    try {
        const isEditing = eventForm.dataset.eventId;
        
        if (isEditing) {
            // Update existing event
            eventData.id = eventForm.dataset.eventId;
            
            // In production, uncomment to make the actual API call
            /*
            const response = await fetch(`${apiBaseUrl}/events/${eventData.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(eventData)
            });
            
            if (!response.ok) {
                throw new Error('Failed to update event');
            }
            const updatedEvent = await response.json();
            */
            
            // For demo, just update the local data
            const eventIndex = events.findIndex(e => e.id === eventData.id);
            if (eventIndex !== -1) {
                events[eventIndex] = eventData;
            }
            
            const createdIndex = userEvents.created.findIndex(e => e.id === eventData.id);
            if (createdIndex !== -1) {
                userEvents.created[createdIndex] = {
                    ...eventData,
                    registrationCount: userEvents.created[createdIndex].registrationCount
                };
            }
            
            showNotification('Event updated successfully!', 'success');
        } else {
            // Create new event
            // In production, uncomment to make the actual API call
            /*
            const response = await fetch(`${apiBaseUrl}/events`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(eventData)
            });
            
            if (!response.ok) {
                throw new Error('Failed to create event');
            }
            const newEvent = await response.json();
            */
            
            // For demo, create a mock event with an ID
            const newEvent = {
                ...eventData,
                id: `event-${Date.now()}`
            };
            
            events.push(newEvent);
            userEvents.created.push({
                ...newEvent,
                registrationCount: 0
            });
            
            showNotification('Event created successfully!', 'success');
        }
        
        // Update the UI
        renderEvents();
        renderUserEvents();
        closeEventModal();
        
    } catch (error) {
        console.error('Error saving event:', error);
        showNotification('Failed to save event. Please try again.', 'error');
    }
}

// Register for an event
function registerForEvent(eventId) {
    const event = events.find(e => e.id === eventId);
    if (!event) {
        showNotification('Event not found', 'error');
        return;
    }
    
    // For demo purposes, we're just adding to local data
    // In production, you would make an API call
    
    // Check if already registered
    if (userEvents.registered.some(e => e.id === eventId)) {
        showNotification('You are already registered for this event', 'info');
        return;
    }
    
    userEvents.registered.push({
        ...event,
        registrationStatus: 'confirmed'
    });
    
    renderUserEvents();
    showNotification(`Registered for ${event.name} successfully!`, 'success');
    
    // Switch to my events view
    document.querySelector('a[data-view="my-events"]').click();
}

// View event details
function viewEventDetails(eventId) {
    const event = events.find(e => e.id === eventId) || 
                  userEvents.registered.find(e => e.id === eventId) ||
                  userEvents.created.find(e => e.id === eventId);
    
    if (!event) {
        showNotification('Event not found', 'error');
        return;
    }
    
    // In a real app, you might open a detailed view or modal
    console.log('View event details for:', event);
    alert(`Event Details: ${event.name}\nDate: ${formatDate(event.eventDate)}\nLocation: ${event.location}\n\nDescription: ${event.description || 'No description available'}`);
}

// Edit an event
function editEvent(eventId) {
    const event = events.find(e => e.id === eventId) || 
                 userEvents.created.find(e => e.id === eventId);
    
    if (!event) {
        showNotification('Event not found', 'error');
        return;
    }
    
    openEventModal(event);
}

// Cancel an event
function cancelEvent(eventId) {
    const event = events.find(e => e.id === eventId) || 
                 userEvents.created.find(e => e.id === eventId);
    
    if (!event) {
        showNotification('Event not found', 'error');
        return;
    }
    
    if (confirm(`Are you sure you want to cancel "${event.name}"? This action cannot be undone.`)) {
        // In production, you would make an API call to cancel the event
        /*
        fetch(`${apiBaseUrl}/events/${eventId}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to cancel event');
            }
            // Update local data and UI
        })
        .catch(error => {
            console.error('Error cancelling event:', error);
            showNotification('Failed to cancel event. Please try again.', 'error');
        });
        */
        
        // For demo, just update local data
        events = events.filter(e => e.id !== eventId);
        userEvents.created = userEvents.created.filter(e => e.id !== eventId);
        
        renderEvents();
        renderUserEvents();
        showNotification('Event cancelled successfully', 'success');
    }
}

// Update report parameters based on selected report type
function updateReportParameters() {
    const reportType = reportTypeSelect.value;
    
    // Hide all parameter groups first
    reportParamGroups.forEach(group => {
        group.style.display = 'none';
    });
    
    // Show the appropriate parameter group
    if (reportType === 'event-attendance') {
        document.getElementById('event-attendance-params').style.display = 'block';
    } else if (reportType === 'monthly-summary') {
        document.getElementById('monthly-summary-params').style.display = 'block';
    }
}

// Generate report
function generateReport() {
    const reportType = reportTypeSelect.value;
    let reportData = null;
    
    // Get parameters based on report type
    switch (reportType) {
        case 'event-attendance':
            const eventId = document.getElementById('event-selector').value;
            if (!eventId) {
                showNotification('Please select an event', 'error');
                return;
            }
            
            const event = events.find(e => e.id === eventId);
            if (!event) {
                showNotification('Event not found', 'error');
                return;
            }
            
            // Generate mock report data
            reportData = {
                title: `Attendance Report: ${event.name}`,
                generatedAt: new Date().toISOString(),
                statistics: {
                    totalRegistrations: 45,
                    checkedIn: 38,
                    noShows: 7,
                    checkInRate: '84.44%'
                },
                details: {
                    eventName: event.name,
                    eventDate: formatDate(event.eventDate),
                    location: event.location
                }
            };
            break;
            
        case 'monthly-summary':
            const year = document.getElementById('report-year').value;
            const month = document.getElementById('report-month').value;
            const monthName = new Date(year, month - 1, 1).toLocaleString('default', { month: 'long' });
            
            // Generate mock report data
            reportData = {
                title: `Monthly Summary: ${monthName} ${year}`,
                generatedAt: new Date().toISOString(),
                statistics: {
                    totalEvents: 8,
                    totalRegistrations: 256,
                    averageAttendance: 32
                },
                details: {
                    period: `${monthName} ${year}`,
                    topEvent: 'Tech Conference 2023',
                    topAttendance: 120
                }
            };
            break;
            
        case 'user-activity':
            // Generate mock report data for current user
            reportData = {
                title: `User Activity Report: ${currentUser.firstName} ${currentUser.lastName}`,
                generatedAt: new Date().toISOString(),
                statistics: {
                    totalRegistrations: userEvents.registered.length,
                    eventsCreated: userEvents.created.length,
                    upcomingEvents: 2
                },
                details: {
                    user: `${currentUser.firstName} ${currentUser.lastName}`,
                    email: currentUser.email,
                    joinedDate: formatDate(currentUser.joinedDate)
                }
            };
            break;
            
        default:
            showNotification('Invalid report type', 'error');
            return;
    }
    
    // Display the report
    displayReport(reportData);
}

// Display generated report
function displayReport(reportData) {
    if (!reportData) return;
    
    // Show report container
    reportResults.style.display = 'block';
    
    // Update report content
    document.getElementById('report-title').textContent = reportData.title;
    document.getElementById('report-date').textContent = formatDate(reportData.generatedAt);
    
    // Update statistics
    if (reportData.statistics.totalRegistrations !== undefined) {
        document.getElementById('stat-registrations').textContent = reportData.statistics.totalRegistrations;
    }
    
    if (reportData.statistics.checkedIn !== undefined) {
        document.getElementById('stat-checkins').textContent = reportData.statistics.checkedIn;
    }
    
    if (reportData.statistics.noShows !== undefined) {
        document.getElementById('stat-noshows').textContent = reportData.statistics.noShows;
    }
    
    if (reportData.statistics.checkInRate !== undefined) {
        document.getElementById('stat-rate').textContent = reportData.statistics.checkInRate;
    }
    
    // Generate details HTML based on report type
    let detailsHtml = '<table class="report-details-table">';
    
    for (const [key, value] of Object.entries(reportData.details)) {
        const formattedKey = key.replace(/([A-Z])/g, ' $1')
                                .replace(/^./, str => str.toUpperCase());
        
        detailsHtml += `
            <tr>
                <td>${formattedKey}</td>
                <td>${value}</td>
            </tr>
        `;
    }
    
    detailsHtml += '</table>';
    
    document.getElementById('report-details').innerHTML = detailsHtml;
    
    // Scroll to the report
    reportResults.scrollIntoView({ behavior: 'smooth' });
}

// Utility function to format dates
function formatDate(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Show notification
function showNotification(message, type = 'info') {
    // In a real app, you would have a proper notification system
    // For demo, we're just using alert
    alert(message);
}

// Make functions available globally for HTML onclick handlers
window.registerForEvent = registerForEvent;
window.viewEventDetails = viewEventDetails;
window.editEvent = editEvent;
window.cancelEvent = cancelEvent;