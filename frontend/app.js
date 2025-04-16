// Event Management Platform - Frontend Application

// Global variables
let apiBaseUrl = 'https://2ta9m212j0.execute-api.us-east-1.amazonaws.com/dev';
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
const eventSearch = document.getElementById('event-search');
const searchBtn = document.querySelector('.search-bar button');

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    initializeNavigation();
    initializeEventListeners();
    
    // Load initial data
    fetchEvents();
    
    // Simulate user login (would be replaced with actual authentication)
    simulateLogin();
});

// Simulate user login
function simulateLogin() {
    // In a real app, this would be an actual login process
    setTimeout(() => {
        // Mock user data
        currentUser = {
            id: 'user-123',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            phone: '(555) 123-4567',
            location: 'San Francisco, CA',
            joinedDate: '2023-01-15',
            eventsAttended: 12,
            eventsCreated: 3,
            upcomingEvents: 2
        };
        
        updateProfileView();
        showNotification('Welcome back, ' + currentUser.firstName + '!', 'success');
    }, 500);
}

// Initialize navigation between views
function initializeNavigation() {
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Add animation
            const targetView = link.getAttribute('data-view');
            
            // Remove active class from all links and add to clicked link
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            // Fade out current view
            const activeView = document.querySelector('.view.active');
            activeView.style.opacity = 0;
            
            setTimeout(() => {
                // Hide all views
                views.forEach(view => {
                    view.classList.remove('active');
                });
                
                // Show and fade in target view
                const newView = document.getElementById(`${targetView}-view`);
                newView.classList.add('active');
                newView.style.opacity = 0;
                
                setTimeout(() => {
                    newView.style.opacity = 1;
                }, 50);
            }, 300);
        });
    });
    
    // Add transition style to views
    views.forEach(view => {
        view.style.transition = 'opacity 0.3s ease';
        view.style.opacity = 1;
    });
}

// Initialize all event listeners
function initializeEventListeners() {
    // Event modal
    createEventBtn.addEventListener('click', openEventModal);
    cancelEventBtn.addEventListener('click', closeEventModal);
    closeModalBtn.addEventListener('click', closeEventModal);
    eventForm.addEventListener('submit', handleEventFormSubmit);
    
    // Search functionality
    eventSearch.addEventListener('input', debounce(handleSearch, 300));
    searchBtn.addEventListener('click', () => handleSearch());
    
    // Tab navigation
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');
            
            // Update active tab button
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Fade out current tab
            const activeTab = document.querySelector('.tab-content.active');
            activeTab.style.opacity = 0;
            
            setTimeout(() => {
                // Hide all tab contents
                tabContents.forEach(content => {
                    content.classList.remove('active');
                });
                
                // Show and fade in target tab
                const newTab = document.getElementById(`${tabId}-tab`);
                newTab.classList.add('active');
                newTab.style.opacity = 0;
                
                setTimeout(() => {
                    newTab.style.opacity = 1;
                }, 50);
            }, 200);
        });
    });
    
    // Add transition style to tab contents
    tabContents.forEach(content => {
        content.style.transition = 'opacity 0.2s ease';
        content.style.opacity = 1;
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
    
    // Add tooltip for buttons
    addTooltips();
}

// Add tooltips for interactive elements
function addTooltips() {
    const createEventTooltip = document.createElement('div');
    createEventTooltip.className = 'tooltip';
    createEventTooltip.textContent = 'Create a new event';
    document.body.appendChild(createEventTooltip);
    
    createEventBtn.addEventListener('mouseover', (e) => {
        createEventTooltip.style.display = 'block';
        createEventTooltip.style.top = (e.pageY - 40) + 'px';
        createEventTooltip.style.left = (e.pageX - 60) + 'px';
    });
    
    createEventBtn.addEventListener('mouseout', () => {
        createEventTooltip.style.display = 'none';
    });
}

// Search functionality with debounce
function debounce(func, wait) {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func.apply(context, args);
        }, wait);
    };
}

function handleSearch() {
    const searchTerm = eventSearch.value.toLowerCase();
    
    if (searchTerm.trim() === '') {
        renderEvents(events);
        return;
    }
    
    const filteredEvents = events.filter(event => 
        event.name.toLowerCase().includes(searchTerm) ||
        event.location.toLowerCase().includes(searchTerm) ||
        event.description.toLowerCase().includes(searchTerm) ||
        event.eventType.toLowerCase().includes(searchTerm)
    );
    
    renderEvents(filteredEvents);
    
    // Provide feedback about search results
    if (filteredEvents.length === 0) {
        eventsList.innerHTML = `<p class="no-results">No events found matching "${searchTerm}". Try a different search term.</p>`;
    }
}

// Fetch events from API
async function fetchEvents() {
    try {
        // Loading indicator
        eventsList.innerHTML = '<div class="loading">Loading events...</div>';
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // For demo purposes, we're using mock data
        // In production, uncomment the fetch call to the actual API
        
        
        const response = await fetch(`${apiBaseUrl}/events`);
        if (!response.ok) {
            throw new Error('Failed to fetch events');
        }
        events = await response.json();
        
        
        // Mock data for demonstration
        events = [
            {
                id: 'event-1',
                name: 'Tech Conference 2023',
                eventDate: '2023-11-15',
                eventTime: '09:00',
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
                eventTime: '13:30',
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
                eventTime: '10:00',
                location: 'Chicago, IL',
                description: 'Discover innovative marketing strategies for the digital age.',
                imageUrl: 'https://via.placeholder.com/300x200',
                capacity: 200,
                organizerId: 'user-789',
                eventType: 'conference'
            },
            {
                id: 'event-4',
                name: 'Startup Networking',
                eventDate: '2023-12-12',
                eventTime: '18:00',
                location: 'Austin, TX',
                description: 'Connect with other entrepreneurs and investors in this casual networking event.',
                imageUrl: 'https://via.placeholder.com/300x200',
                capacity: 100,
                organizerId: 'user-456',
                eventType: 'networking'
            },
            {
                id: 'event-5',
                name: 'AI and Machine Learning Seminar',
                eventDate: '2024-02-08',
                eventTime: '14:00',
                location: 'Seattle, WA',
                description: 'Explore the latest advancements in AI and machine learning technologies.',
                imageUrl: 'https://via.placeholder.com/300x200',
                capacity: 150,
                organizerId: 'user-789',
                eventType: 'seminar'
            }
        ];
        
        renderEvents(events);
        
        // Also fetch user events (events the user has registered for or created)
        fetchUserEvents();
        
        // Update event selector in reports
        updateEventSelector();
        
    } catch (error) {
        console.error('Error fetching events:', error);
        eventsList.innerHTML = '<p class="error">Failed to load events. Please try again.</p>';
        showNotification('Failed to load events. Please try again.', 'error');
    }
}

// Update event selector in reports view
function updateEventSelector() {
    const eventSelector = document.getElementById('event-selector');
    eventSelector.innerHTML = '<option value="">-- Select an event --</option>';
    
    events.forEach(event => {
        const option = document.createElement('option');
        option.value = event.id;
        option.textContent = event.name;
        eventSelector.appendChild(option);
    });
}

// Fetch events specific to the current user
async function fetchUserEvents() {
    if (!currentUser) return;
    
    try {
        // For demo purposes, we're using mock data
        // In production, uncomment the fetch calls to the actual API
        
        
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
                },
                {
                    id: 'event-3',
                    name: 'Marketing Summit',
                    eventDate: '2024-01-20',
                    location: 'Chicago, IL',
                    imageUrl: 'https://via.placeholder.com/300x200',
                    registrationStatus: 'pending'
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
function renderEvents(eventsToRender = events) {
    if (!eventsToRender || !eventsToRender.length) {
        eventsList.innerHTML = '<p>No events found.</p>';
        return;
    }
    
    // Sort events by date
    eventsToRender = [...eventsToRender].sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate));
    
    eventsList.innerHTML = eventsToRender.map(event => `
        <div class="card event-card" data-id="${event.id}">
            <div class="card-image" style="background-image: url('${event.imageUrl}')">
                <div class="event-type-badge">${event.eventType}</div>
            </div>
            <div class="card-content">
                <h3>${event.name}</h3>
                <p class="event-date">
                    <i class="icon-calendar"></i>
                    ${formatDate(event.eventDate)}
                    ${event.eventTime ? ' at ' + formatTime(event.eventTime) : ''}
                </p>
                <p class="event-location">
                    <i class="icon-location"></i>
                    ${event.location}
                </p>
                <p class="event-description">${event.description}</p>
                <div class="capacity-indicator">
                    <div class="capacity-label">Capacity: ${event.capacity}</div>
                    <div class="capacity-bar">
                        <div class="capacity-fill" style="width: ${Math.min((event.registrationCount || 0) / event.capacity * 100, 100)}%"></div>
                    </div>
                </div>
                <button class="btn btn-secondary" onclick="registerForEvent('${event.id}')">
                    ${isRegistered(event.id) ? 'View Registration' : 'Register'}
                </button>
            </div>
        </div>
    `).join('');
    
    // Add animations
    const cards = document.querySelectorAll('.event-card');
    cards.forEach((card, index) => {
        card.style.opacity = 0;
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        
        setTimeout(() => {
            card.style.opacity = 1;
            card.style.transform = 'translateY(0)';
        }, 100 * index);
    });
}

// Check if user is registered for an event
function isRegistered(eventId) {
    return userEvents.registered && userEvents.registered.some(e => e.id === eventId);
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
                            <div class="badge badge-${event.registrationStatus === 'confirmed' ? 'success' : 'warning'}">
                                ${event.registrationStatus}
                            </div>
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
                            <div class="badge badge-primary">${event.registrationCount || 0} Registrations</div>
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
    
    // Add animations
    const cards = document.querySelectorAll('#registered-tab .event-card, #created-tab .event-card');
    cards.forEach((card, index) => {
        card.style.opacity = 0;
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        
        setTimeout(() => {
            card.style.opacity = 1;
            card.style.transform = 'translateY(0)';
        }, 100 * index);
    });
}

// Update profile view with user data
function updateProfileView() {
    if (!currentUser) {
        // Show loading or placeholder state
        document.getElementById('profile-name').textContent = 'Guest User';
        document.getElementById('profile-email').textContent = 'Please log in';
        document.getElementById('profile-full-name').textContent = 'Not logged in';
        document.getElementById('profile-email-display').textContent = 'N/A';
        document.getElementById('profile-phone').textContent = 'N/A';
        document.getElementById('profile-location').textContent = 'N/A';
        document.getElementById('profile-joined').textContent = 'N/A';
        
        // Hide edit button for guests
        document.getElementById('edit-profile-btn').style.display = 'none';
        return;
    }
    
    // Show edit button for logged in users
    document.getElementById('edit-profile-btn').style.display = 'inline-block';
    
    // Update profile information
    document.getElementById('profile-name').textContent = `${currentUser.firstName} ${currentUser.lastName}`;
    document.getElementById('profile-email').textContent = currentUser.email;
    document.getElementById('profile-full-name').textContent = `${currentUser.firstName} ${currentUser.lastName}`;
    document.getElementById('profile-email-display').textContent = currentUser.email;
    document.getElementById('profile-phone').textContent = currentUser.phone || 'Not provided';
    document.getElementById('profile-location').textContent = currentUser.location || 'Not provided';
    document.getElementById('profile-joined').textContent = formatDate(currentUser.joinedDate);
    
    // Update profile image if available
    if (currentUser.profileImage) {
        document.querySelector('.profile-image').style.backgroundImage = `url('${currentUser.profileImage}')`;
    }
    
    // Update activity stats
    document.getElementById('profile-events-attended').textContent = currentUser.eventsAttended || 0;
    document.getElementById('profile-events-created').textContent = currentUser.eventsCreated || 0;
    document.getElementById('profile-upcoming-events').textContent = currentUser.upcomingEvents || 0;
    
    // Add animation
    const profileCard = document.querySelector('.profile-card');
    profileCard.style.opacity = 0;
    profileCard.style.transform = 'translateY(20px)';
    profileCard.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    
    setTimeout(() => {
        profileCard.style.opacity = 1;
        profileCard.style.transform = 'translateY(0)';
    }, 100);
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
        
        // Set default values for new event
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        document.getElementById('event-date').value = tomorrow.toISOString().split('T')[0];
        document.getElementById('event-time').value = '12:00';
        document.getElementById('event-capacity').value = '50';
    }
    
    // Display modal with animation
    eventModal.style.display = 'block';
    const modalContent = document.querySelector('.modal-content');
    modalContent.style.opacity = 0;
    modalContent.style.transform = 'translateY(-20px)';
    
    setTimeout(() => {
        modalContent.style.opacity = 1;
        modalContent.style.transform = 'translateY(0)';
    }, 50);
}

// Close event modal
function closeEventModal() {
    const modalContent = document.querySelector('.modal-content');
    modalContent.style.opacity = 0;
    modalContent.style.transform = 'translateY(-20px)';
    
    setTimeout(() => {
        eventModal.style.display = 'none';
        eventForm.reset();
    }, 300);
}

// Handle event form submission
async function handleEventFormSubmit(e) {
    e.preventDefault();
    
    // Basic validation
    const eventName = document.getElementById('event-name').value.trim();
    if (!eventName) {
        showValidationError('event-name', 'Event name is required');
        return;
    }
    
    const eventDate = document.getElementById('event-date').value;
    if (!eventDate) {
        showValidationError('event-date', 'Event date is required');
        return;
    }
    
    const eventTime = document.getElementById('event-time').value;
    if (!eventTime) {
        showValidationError('event-time', 'Event time is required');
        return;
    }
    
    const eventLocation = document.getElementById('event-location').value.trim();
    if (!eventLocation) {
        showValidationError('event-location', 'Event location is required');
        return;
    }
    
    const eventType = document.getElementById('event-type').value;
    if (!eventType) {
        showValidationError('event-type', 'Event type is required');
        return;
    }
    
    const capacity = parseInt(document.getElementById('event-capacity').value);
    if (isNaN(capacity) || capacity < 1) {
        showValidationError('event-capacity', 'Valid capacity is required (minimum 1)');
        return;
    }
    
    const description = document.getElementById('event-description').value.trim();
    if (!description) {
        showValidationError('event-description', 'Event description is required');
        return;
    }
    
    // Prepare event data
    const eventData = {
        name: eventName,
        eventDate: eventDate,
        eventTime: eventTime,
        location: eventLocation,
        eventType: eventType,
        capacity: capacity,
        description: description,
        organizerId: currentUser.id
    };
    
    // Handle image upload (in a real app, you would upload to S3)
    const imageFile = document.getElementById('event-image').files[0];
    if (imageFile) {
        // For demo purposes, we're not actually uploading
        console.log('Would upload file:', imageFile.name);
        eventData.imageUrl = URL.createObjectURL(imageFile);
    } else {
        eventData.imageUrl = 'https://via.placeholder.com/300x200';
    }
    
    try {
        // Show loading state
        const submitBtn = eventForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Saving...';
        
        const isEditing = eventForm.dataset.eventId;
        
        if (isEditing) {
            // Update existing event
            eventData.id = eventForm.dataset.eventId;
        
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
            
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 800));
            
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
            const createdEvent = await response.json();
            
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 800));
            
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
            
            // Update user stats
            if (currentUser) {
                currentUser.eventsCreated = (currentUser.eventsCreated || 0) + 1;
            }
            
            showNotification('Event created successfully!', 'success');
        }
        
        // Update the UI
        renderEvents(events);
        renderUserEvents();
        updateProfileView(); // Update profile to reflect new event count
        updateEventSelector(); // Update report event selector
        closeEventModal();
        
    } catch (error) {
        console.error('Error saving event:', error);
        showNotification('Failed to save event. Please try again.', 'error');
    } finally {
        // Reset button state
        const submitBtn = eventForm.querySelector('button[type="submit"]');
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

// Show validation error
function showValidationError(inputId, message) {
    const input = document.getElementById(inputId);
    input.classList.add('error');
    
    // Create or update error message
    let errorMsg = input.nextElementSibling;
    if (!errorMsg || !errorMsg.classList.contains('error-message')) {
        errorMsg = document.createElement('div');
        errorMsg.className = 'error-message';
        input.parentNode.insertBefore(errorMsg, input.nextSibling);
    }
    
    errorMsg.textContent = message;
    
    // Clear error after 3 seconds
    setTimeout(() => {
        input.classList.remove('error');
        if (errorMsg) {
            errorMsg.remove();
        }
    }, 3000);
    
    // Focus the input
    input.focus();
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
        // Show registration details
        viewEventDetails(eventId);
        return;
    }
    
    // Show registration confirmation
    if (confirm(`Would you like to register for "${event.name}"?`)) {
        // Simulate API call
        setTimeout(() => {
            userEvents.registered.push({
                ...event,
                registrationStatus: 'confirmed'
            });
            
            // Update registration count for the event
            const targetEvent = events.find(e => e.id === eventId);
            if (targetEvent) {
                targetEvent.registrationCount = (targetEvent.registrationCount || 0) + 1;
            }
            
            // Update user stats
            if (currentUser) {
                currentUser.upcomingEvents = (currentUser.upcomingEvents || 0) + 1;
            }
            
            renderEvents(events);
            renderUserEvents();
            updateProfileView();
            
            showNotification(`Registered for ${event.name} successfully!`, 'success');
            
            // Switch to my events view with animation
            document.querySelector('a[data-view="my-events"]').click();
        }, 800);
    }
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
    
    // Create and show a detailed modal
    const detailsModal = document.createElement('div');
    detailsModal.className = 'modal event-details-modal';
    detailsModal.style.display = 'block';
    
    const formattedDate = formatDate(event.eventDate);
    const formattedTime = event.eventTime ? formatTime(event.eventTime) : 'Time not specified';
    
    detailsModal.innerHTML = `
        <div class="modal-content event-details-content">
            <span class="close">&times;</span>
            <div class="event-details-header">
                <h2>${event.name}</h2>
                <div class="event-type-badge large">${event.eventType}</div>
            </div>
            
            <div class="event-details-image" style="background-image: url('${event.imageUrl}')"></div>
            
            <div class="event-details-info">
                <div class="detail-item">
                    <div class="detail-icon">📅</div>
                    <div class="detail-content">
                        <div class="detail-label">Date</div>
                        <div class="detail-value">${formattedDate}</div>
                    </div>
                </div>
                
                <div class="detail-item">
                    <div class="detail-icon">⏰</div>
                    <div class="detail-content">
                        <div class="detail-label">Time</div>
                        <div class="detail-value">${formattedTime}</div>
                    </div>
                </div>
                
                <div class="detail-item">
                    <div class="detail-icon">📍</div>
                    <div class="detail-content">
                        <div class="detail-label">Location</div>
                        <div class="detail-value">${event.location}</div>
                    </div>
                </div>
                
                ${event.registrationStatus ? `
                <div class="detail-item">
                    <div class="detail-icon">🎟️</div>
                    <div class="detail-content">
                        <div class="detail-label">Registration Status</div>
                        <div class="detail-value">
                            <span class="badge badge-${event.registrationStatus === 'confirmed' ? 'success' : 'warning'}">
                                ${event.registrationStatus}
                            </span>
                        </div>
                    </div>
                </div>
                ` : ''}
                
                ${event.capacity ? `
                <div class="detail-item">
                    <div class="detail-icon">👥</div>
                    <div class="detail-content">
                        <div class="detail-label">Capacity</div>
                        <div class="detail-value">${event.capacity}</div>
                    </div>
                </div>
                ` : ''}
            </div>
            
            <div class="event-details-description">
                <h3>Description</h3>
                <p>${event.description}</p>
            </div>
            
            <div class="modal-actions">
                ${!event.registrationStatus ? `
                    <button class="btn btn-primary" onclick="registerForEvent('${event.id}')">Register Now</button>
                ` : ''}
                <button class="btn btn-secondary close-details">Close</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(detailsModal);
    
    // Add animation
    const modalContent = detailsModal.querySelector('.modal-content');
    modalContent.style.opacity = 0;
    modalContent.style.transform = 'translateY(-20px)';
    
    setTimeout(() => {
        modalContent.style.opacity = 1;
        modalContent.style.transform = 'translateY(0)';
    }, 50);
    
    // Add close handlers
    const closeBtn = detailsModal.querySelector('.close');
    const closeDetailsBtn = detailsModal.querySelector('.close-details');
    
    function closeDetailsModal() {
        modalContent.style.opacity = 0;
        modalContent.style.transform = 'translateY(-20px)';
        
        setTimeout(() => {
            detailsModal.remove();
        }, 300);
    }
    
    closeBtn.addEventListener('click', closeDetailsModal);
    closeDetailsBtn.addEventListener('click', closeDetailsModal);
    
    // Close when clicking outside the modal
    detailsModal.addEventListener('click', (e) => {
        if (e.target === detailsModal) {
            closeDetailsModal();
        }
    });
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
    
    // Show confirmation dialog
    const confirmDialog = document.createElement('div');
    confirmDialog.className = 'modal confirm-dialog';
    confirmDialog.style.display = 'block';
    
    confirmDialog.innerHTML = `
        <div class="modal-content confirm-content">
            <h2>Cancel Event</h2>
            <p>Are you sure you want to cancel "${event.name}"?</p>
            <p class="warning">This action cannot be undone!</p>
            <div class="confirm-actions">
                <button class="btn btn-secondary" id="cancel-no">No, Keep Event</button>
                <button class="btn btn-danger" id="cancel-yes">Yes, Cancel Event</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(confirmDialog);
    
    // Add animation
    const modalContent = confirmDialog.querySelector('.modal-content');
    modalContent.style.opacity = 0;
    modalContent.style.transform = 'translateY(-20px)';
    
    setTimeout(() => {
        modalContent.style.opacity = 1;
        modalContent.style.transform = 'translateY(0)';
    }, 50);
    
    // Add button handlers
    document.getElementById('cancel-no').addEventListener('click', () => {
        modalContent.style.opacity = 0;
        modalContent.style.transform = 'translateY(-20px)';
        
        setTimeout(() => {
            confirmDialog.remove();
        }, 300);
    });
    
    document.getElementById('cancel-yes').addEventListener('click', async () => {        
        try {
            const response = await fetch(`${apiBaseUrl}/events/${eventId}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                throw new Error('Failed to cancel event');
            }
            
            // Update local data and UI
        } catch (error) {
            console.error('Error cancelling event:', error);
            showNotification('Failed to cancel event. Please try again.', 'error');
            return;
        }
        
        // Show loading state
        const yesBtn = document.getElementById('cancel-yes');
        yesBtn.textContent = 'Cancelling...';
        yesBtn.disabled = true;
        
        // Simulate API request
        setTimeout(() => {
            // For demo, just update local data
            events = events.filter(e => e.id !== eventId);
            userEvents.created = userEvents.created.filter(e => e.id !== eventId);
            
            // Update user stats
            if (currentUser) {
                currentUser.eventsCreated = Math.max(0, (currentUser.eventsCreated || 0) - 1);
            }
            
            // Update UI
            renderEvents(events);
            renderUserEvents();
            updateProfileView();
            updateEventSelector();
            
            // Remove the dialog
            confirmDialog.remove();
            
            showNotification('Event cancelled successfully', 'success');
        }, 800);
    });
}

// Update report parameters based on selected report type
function updateReportParameters() {
    const reportType = reportTypeSelect.value;
    
    // Hide all parameter groups first
    reportParamGroups.forEach(group => {
        group.style.display = 'none';
    });
    
    // Show the appropriate parameter group with animation
    if (reportType === 'event-attendance') {
        const paramGroup = document.getElementById('event-attendance-params');
        paramGroup.style.display = 'block';
        paramGroup.style.opacity = 0;
        
        setTimeout(() => {
            paramGroup.style.opacity = 1;
        }, 50);
    } else if (reportType === 'monthly-summary') {
        const paramGroup = document.getElementById('monthly-summary-params');
        paramGroup.style.display = 'block';
        paramGroup.style.opacity = 0;
        
        setTimeout(() => {
            paramGroup.style.opacity = 1;
        }, 50);
    }
}

// Generate report
function generateReport() {
    const reportType = reportTypeSelect.value;
    let reportData = null;
    
    // Show loading indicator
    reportResults.innerHTML = '<div class="loading">Generating report...</div>';
    reportResults.style.display = 'block';
    
    // Get parameters based on report type
    switch (reportType) {
        case 'event-attendance':
            const eventId = document.getElementById('event-selector').value;
            if (!eventId) {
                showNotification('Please select an event', 'error');
                reportResults.style.display = 'none';
                return;
            }
            
            const event = events.find(e => e.id === eventId);
            if (!event) {
                showNotification('Event not found', 'error');
                reportResults.style.display = 'none';
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
                    location: event.location,
                    organizerName: 'John Doe'
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
                    topAttendance: 120,
                    eventsCreated: 3
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
                    upcomingEvents: currentUser.upcomingEvents || 0
                },
                details: {
                    user: `${currentUser.firstName} ${currentUser.lastName}`,
                    email: currentUser.email,
                    joinedDate: formatDate(currentUser.joinedDate),
                    accountStatus: 'Active'
                }
            };
            break;
            
        default:
            showNotification('Invalid report type', 'error');
            reportResults.style.display = 'none';
            return;
    }
    
    // Simulate API delay
    setTimeout(() => {
        // Display the report
        displayReport(reportData);
    }, 1000);
}

// Display generated report
function displayReport(reportData) {
    if (!reportData) return;
    
    // Prepare report container
    reportResults.style.opacity = 0;
    reportResults.style.display = 'block';
    
    // Update report content
    reportResults.innerHTML = `
        <h3 id="report-title">${reportData.title}</h3>
        <p id="report-generated">Generated: <span id="report-date">${formatDate(reportData.generatedAt)} ${new Date(reportData.generatedAt).toLocaleTimeString()}</span></p>
        
        <div class="report-statistics">
            ${Object.entries(reportData.statistics).map(([key, value]) => `
                <div class="stat-box">
                    <h4>${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</h4>
                    <div class="stat-value">${value}</div>
                </div>
            `).join('')}
        </div>
        
        <div id="report-details">
            <h3>Details</h3>
            <table class="report-details-table">
                ${Object.entries(reportData.details).map(([key, value]) => `
                    <tr>
                        <td>${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</td>
                        <td>${value}</td>
                    </tr>
                `).join('')}
            </table>
        </div>
        
        <div class="report-actions">
            <button class="btn btn-secondary" id="download-report-btn">Download PDF</button>
            <button class="btn btn-secondary" id="share-report-btn">Share Report</button>
        </div>
    `;
    
    // Add smooth animation
    setTimeout(() => {
        reportResults.style.opacity = 1;
        reportResults.scrollIntoView({ behavior: 'smooth' });
    }, 50);
    
    // Add button event listeners
    document.getElementById('download-report-btn').addEventListener('click', () => {
        showNotification('Report download started...', 'success');
    });
    
    document.getElementById('share-report-btn').addEventListener('click', () => {
        showNotification('Report shared successfully!', 'success');
    });
}

// Format time for display
function formatTime(timeString) {
    if (!timeString) return '';
    
    try {
        const [hours, minutes] = timeString.split(':');
        const date = new Date();
        date.setHours(parseInt(hours));
        date.setMinutes(parseInt(minutes));
        
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
        console.error('Error formatting time:', error);
        return timeString;
    }
}

// Utility function to format dates
function formatDate(dateString) {
    if (!dateString) return '';
    
    try {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    } catch (error) {
        console.error('Error formatting date:', error);
        return dateString;
    }
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    // Add icon based on type
    let icon = '💬';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '❌';
    if (type === 'warning') icon = '⚠️';
    
    notification.innerHTML = `
        <div class="notification-icon">${icon}</div>
        <div class="notification-message">${message}</div>
        <div class="notification-close">×</div>
    `;
    
    // Add to container (create if doesn't exist)
    let container = document.querySelector('.notification-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'notification-container';
        document.body.appendChild(container);
    }
    
    container.appendChild(notification);
    
    // Add animation
    notification.style.opacity = 0;
    notification.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        notification.style.opacity = 1;
        notification.style.transform = 'translateY(0)';
    }, 10);
    
    // Add close event
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.style.opacity = 0;
        notification.style.transform = 'translateY(-20px)';
        
        setTimeout(() => {
            notification.remove();
        }, 300);
    });
    
    // Auto-remove after delay
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.opacity = 0;
            notification.style.transform = 'translateY(-20px)';
            
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 300);
        }
    }, 5000);
}

// Make functions available globally for HTML onclick handlers
window.registerForEvent = registerForEvent;
window.viewEventDetails = viewEventDetails;
window.editEvent = editEvent;
window.cancelEvent = cancelEvent;

// Profile editing functionality
const editProfileBtn = document.getElementById('edit-profile-btn');
const editProfileModal = document.getElementById('edit-profile-modal');
const profileForm = document.getElementById('profile-form');
const cancelProfileBtn = document.getElementById('cancel-profile-btn');
const closeProfileModalBtn = editProfileModal.querySelector('.close');

// Initialize profile editing
editProfileBtn.addEventListener('click', openProfileModal);
cancelProfileBtn.addEventListener('click', closeProfileModal);
closeProfileModalBtn.addEventListener('click', closeProfileModal);
profileForm.addEventListener('submit', handleProfileFormSubmit);

// Open profile edit modal
function openProfileModal() {
    if (!currentUser) return;
    
    // Populate form with current user data
    document.getElementById('edit-first-name').value = currentUser.firstName || '';
    document.getElementById('edit-last-name').value = currentUser.lastName || '';
    document.getElementById('edit-email').value = currentUser.email || '';
    document.getElementById('edit-phone').value = currentUser.phone || '';
    document.getElementById('edit-location').value = currentUser.location || '';
    
    // Display modal with animation
    editProfileModal.style.display = 'block';
    const modalContent = editProfileModal.querySelector('.modal-content');
    modalContent.style.opacity = 0;
    modalContent.style.transform = 'translateY(-20px)';
    
    setTimeout(() => {
        modalContent.style.opacity = 1;
        modalContent.style.transform = 'translateY(0)';
    }, 50);
}

// Close profile edit modal
function closeProfileModal() {
    const modalContent = editProfileModal.querySelector('.modal-content');
    modalContent.style.opacity = 0;
    modalContent.style.transform = 'translateY(-20px)';
    
    setTimeout(() => {
        editProfileModal.style.display = 'none';
        profileForm.reset();
    }, 300);
}

// Handle profile form submission
async function handleProfileFormSubmit(e) {
    e.preventDefault();
    
    // Basic validation
    const firstName = document.getElementById('edit-first-name').value.trim();
    if (!firstName) {
        showValidationError('edit-first-name', 'First name is required');
        return;
    }
    
    const lastName = document.getElementById('edit-last-name').value.trim();
    if (!lastName) {
        showValidationError('edit-last-name', 'Last name is required');
        return;
    }
    
    const email = document.getElementById('edit-email').value.trim();
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
        showValidationError('edit-email', 'Valid email is required');
        return;
    }
    
    // Prepare updated user data
    const updatedUserData = {
        ...currentUser,
        firstName: firstName,
        lastName: lastName,
        email: email,
        phone: document.getElementById('edit-phone').value.trim(),
        location: document.getElementById('edit-location').value.trim()
    };
    
    // Handle profile image upload
    const imageFile = document.getElementById('edit-profile-image').files[0];
    if (imageFile) {
        // For demo purposes, we're not actually uploading
        console.log('Would upload file:', imageFile.name);
        updatedUserData.profileImage = URL.createObjectURL(imageFile);
    }
    
    try {
        // Show loading state
        const submitBtn = profileForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Saving...';
        
        // In production, make API call to update user
        const response = await fetch(`${apiBaseUrl}/users/${currentUser.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedUserData)
        });
        
        if (!response.ok) {
            throw new Error('Failed to update profile');
        }
        
        const updatedUser = await response.json();
        
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Update current user data
        currentUser = updatedUserData;
        
        // Update profile view
        updateProfileView();
        
        // Close modal
        closeProfileModal();
        
        // Show success notification
        showNotification('Profile updated successfully!', 'success');
        
    } catch (error) {
        console.error('Error updating profile:', error);
        showNotification('Failed to update profile. Please try again.', 'error');
    } finally {
        // Reset button state
        const submitBtn = profileForm.querySelector('button[type="submit"]');
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}