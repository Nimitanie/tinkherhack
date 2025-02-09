document.addEventListener('DOMContentLoaded', function() {
    // System Status Manager
    const SystemStatus = {
        isInitialized: false,
        lastError: null,
        pageLoadTime: Date.now(),
        
        initialize() {
            try {
                // Check browser compatibility
                const requiredFeatures = ['localStorage', 'sessionStorage', 'Promise', 'Map'];
                const missingFeatures = requiredFeatures.filter(feature => !(feature in window));
                
                if (missingFeatures.length > 0) {
                    throw new Error(`Missing required features: ${missingFeatures.join(', ')}`);
                }

                this.isInitialized = true;
                return true;
            } catch (error) {
                this.lastError = error;
                return false;
            }
        },

        checkPageTimeout() {
            const MAX_PAGE_TIME = 30 * 60 * 1000; // 30 minutes
            return (Date.now() - this.pageLoadTime) > MAX_PAGE_TIME;
        }
    };

    // Enhanced Form Validator
    class FormValidator {
        static validateField(field, value, rules = {}) {
            if (!value && rules.required) {
                throw new Error(`${field} is required`);
            }

            if (value) {
                if (rules.minLength && value.length < rules.minLength) {
                    throw new Error(`${field} must be at least ${rules.minLength} characters`);
                }

                if (rules.maxLength && value.length > rules.maxLength) {
                    throw new Error(`${field} cannot exceed ${rules.maxLength} characters`);
                }

                if (rules.pattern && !rules.pattern.test(value)) {
                    throw new Error(`${field} format is invalid`);
                }

                if (rules.custom && typeof rules.custom === 'function') {
                    const customError = rules.custom(value);
                    if (customError) {
                        throw new Error(customError);
                    }
                }
            }

            return this.sanitize(value);
        }

        static sanitize(value) {
            if (!value) return '';
            return String(value)
                .trim()
                .replace(/[<>]/g, '')
                .replace(/&/g, '&amp;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#x27;')
                .replace(/\//g, '&#x2F;');
        }
    }

    // Page Navigation Manager
    class NavigationManager {
        static PAGES = {
            NEW: 'new',
            TRIP_PLANNER: 'tripplanner',
            BACK_WEB: 'backweb'
        };

        static navigate(page, data = {}) {
            try {
                const queryParams = new URLSearchParams();
                Object.entries(data).forEach(([key, value]) => {
                    if (value) {
                        queryParams.append(key, typeof value === 'object' ? 
                            JSON.stringify(value) : String(value));
                    }
                });

                // Add security token and timestamp
                queryParams.append('_token', btoa(Date.now().toString()));
                queryParams.append('_t', Date.now());

                // Determine the correct page to navigate to
                let targetPage = `${page}.html`;
                if (page === NavigationManager.PAGES.TRIP_PLANNER) {
                    targetPage = 'backweb.html'; // Redirect to backweb.html instead
                }

                window.location.href = `${targetPage}?${queryParams.toString()}`;
            } catch (error) {
                console.error('Navigation error:', error);
                alert('Failed to navigate. Please try again.');
            }
        }

        static validateCurrentPage() {
            const currentPage = document.body.dataset.page;
            if (!currentPage || !Object.values(this.PAGES).includes(currentPage)) {
                throw new Error('Invalid page configuration');
            }
            return currentPage;
        }
    }

    // Form Data Manager
    class FormDataManager {
        constructor(formId) {
            this.form = document.getElementById(formId);
            if (!this.form) {
                throw new Error(`Form with ID "${formId}" not found`);
            }
        }

        getFieldValue(fieldId) {
            const field = document.getElementById(fieldId);
            return field ? field.value : null;
        }

        setFieldValue(fieldId, value) {
            const field = document.getElementById(fieldId);
            if (field) {
                field.value = value;
            }
        }

        validateForm() {
            const errors = [];
            const data = {};

            // Validate each required field
            const requiredFields = this.form.querySelectorAll('[required]');
            requiredFields.forEach(field => {
                try {
                    const value = FormValidator.validateField(
                        field.name || field.id,
                        field.value,
                        {
                            required: true,
                            minLength: 2,
                            maxLength: 100
                        }
                    );
                    data[field.id] = value;
                } catch (error) {
                    errors.push(error.message);
                }
            });

            return { isValid: errors.length === 0, errors, data };
        }
    }

    // Enhanced error handling utility
    class ErrorHandler {
        static displayError(error, type = 'alert') {
            const errorMessage = error?.message || 'An unexpected error occurred';
            console.error(`${type.toUpperCase()}:`, error);
            
            switch(type) {
                case 'form':
                    // Display in form error container
                    const errorContainer = document.getElementById('formErrors');
                    if (errorContainer) {
                        errorContainer.innerHTML = `<div class="error-message">${errorMessage}</div>`;
                        errorContainer.style.display = 'block';
                        // Auto-hide after 5 seconds
                        setTimeout(() => {
                            errorContainer.style.display = 'none';
                        }, 5000);
                    } else {
                        alert(errorMessage);
                    }
                    break;
                    
                case 'toast':
                    // Show toast notification if available
                    if (typeof showToast === 'function') {
                        showToast(errorMessage, 'error');
                    } else {
                        alert(errorMessage);
                    }
                    break;
                    
                default:
                    alert(errorMessage);
            }
        }

        static clearErrors() {
            const errorContainer = document.getElementById('formErrors');
            if (errorContainer) {
                errorContainer.style.display = 'none';
                errorContainer.innerHTML = '';
            }
        }
    }

    // Initialize system
    if (!SystemStatus.initialize()) {
        alert('System initialization failed. Please refresh the page.');
        return;
    }

    // Add event listener when document is loaded
    const tripForm = document.querySelector('#tripForm');
    const planTripBtn = document.getElementById('planTripBtn');

    if (tripForm && planTripBtn) {
        tripForm.addEventListener('submit', handleTripSubmission);
    }

    // Remove any direct button click listeners and keep the form submission handler
    function handleTripSubmission(e) {
        e.preventDefault();
        ErrorHandler.clearErrors();

        try {
            const formManager = new FormDataManager('tripForm');
            const { isValid, errors, data } = formManager.validateForm();

            if (!isValid) {
                throw new Error(errors.join('\n'));
            }

            // Collect all form data
            const tripData = {
                basicInfo: {
                    mainContact: document.getElementById('mainContact').value,
                    email: document.getElementById('email').value,
                    phone: document.getElementById('phone').value,
                    members: document.getElementById('members').value.split(',').map(m => m.trim()),
                },
                tripDetails: {
                    budget: document.getElementById('budget').value,
                    duration: document.getElementById('duration').value,
                    destinations: document.getElementById('destinations').value,
                    startDate: document.getElementById('startDate').value,
                    weather: document.getElementById('weather').value,
                },
                preferences: {
                    accommodation: document.querySelector('input[name="accommodation"]:checked')?.value || '',
                    food: document.querySelector('input[name="food"]:checked')?.value || '',
                    activities: Array.from(document.querySelectorAll('input[name="activities"]:checked')).map(cb => cb.value),
                }
            };

            // Save to sessionStorage
            sessionStorage.setItem('tripData', JSON.stringify(tripData));

            // Check if destination is abroad
            if (isAbroadDestination(tripData.tripDetails.destinations)) {
                window.location.href = 'what.html';
            } else {
                // Insert data into backwebb.html
                window.location.href = 'backwebb.html';
            }

        } catch (error) {
            ErrorHandler.displayError(error, 'form');
        }
    }

    function isAbroadDestination(destination) {
        const domesticLocations = [
            'kuala lumpur', 'penang', 'malacca', 'johor bahru', 
            'ipoh', 'kuching', 'kota kinabalu', 'langkawi', 
            'cameron highlands'
        ];
        return !domesticLocations.includes(destination.toLowerCase());
    }

    function processDomesticTrip(data) {
        try {
            sessionStorage.setItem('tripData', JSON.stringify({
                data,
                timestamp: Date.now()
            }));
            window.location.href = 'domestic-plan.html';
        } catch (error) {
            ErrorHandler.displayError('Failed to process domestic trip data');
        }
    }

    function showPage(pageNum) {
        document.getElementById('page1').style.display = pageNum === 1 ? 'block' : 'none';
        document.getElementById('page2').style.display = pageNum === 2 ? 'block' : 'none';
    }

    // Initialize page-specific functionality
    try {
        const currentPage = NavigationManager.validateCurrentPage();

        switch (currentPage) {
            case NavigationManager.PAGES.NEW:
                const planMyTripButton = document.getElementById('planMyTripButton');
                if (planMyTripButton) {
                    planMyTripButton.addEventListener('click', handleTripSubmission);
                }
                break;

            case NavigationManager.PAGES.TRIP_PLANNER:
                initializeBackwebPage();
                break;
        }

        // Check for page timeout
        if (SystemStatus.checkPageTimeout()) {
            alert('Your session has expired. Please refresh the page.');
            sessionStorage.clear();
            window.location.reload();
        }

    } catch (error) {
        console.error('Initialization error:', error);
        alert('Failed to initialize page. Please refresh.');
    }

    // Add this to handle data insertion in backwebb.html
    if (document.body.dataset.page === 'backwebb') {
        window.addEventListener('DOMContentLoaded', () => {
            try {
                const tripData = JSON.parse(sessionStorage.getItem('tripData'));
                if (!tripData) {
                    throw new Error('No trip data found');
                }

                // Update trip details section
                document.getElementById('tripDestination').textContent = tripData.tripDetails.destinations;
                document.getElementById('tripDuration').textContent = `${tripData.tripDetails.duration} Days`;
                document.getElementById('tripDate').textContent = new Date(tripData.tripDetails.startDate).toLocaleDateString();
                document.getElementById('tripDeparture').textContent = 'From Main Location'; // Update as needed

                // Update itinerary
                const itineraryContainer = document.getElementById('itineraryContainer');
                if (itineraryContainer) {
                    const duration = parseInt(tripData.tripDetails.duration);
                    let itineraryHTML = '';

                    for (let day = 1; day <= duration; day++) {
                        itineraryHTML += `
                            <div class="day-plan">
                                <h3>Day ${day}</h3>
                                <div class="schedule">
                                    <div class="time-slot">
                                        <span class="time">MORNING (06:00 - 09:00)</span>
                                        <p class="description">Activity based on ${tripData.preferences.activities[0] || 'default'} preference</p>
                                    </div>
                                    <div class="time-slot">
                                        <span class="time">AFTERNOON (15:00 - 17:00)</span>
                                        <p class="description">Activity based on ${tripData.preferences.activities[1] || 'default'} preference</p>
                                    </div>
                                </div>
                            </div>
                        `;
                    }

                    itineraryContainer.innerHTML = itineraryHTML;
                }

                // Update additional details
                if (tripData.basicInfo) {
                    document.getElementById('groupSize').textContent = tripData.basicInfo.members.length + 1;
                    document.getElementById('mainContact').textContent = tripData.basicInfo.mainContact;
                }

                // Update budget information if available
                if (document.getElementById('budgetDisplay')) {
                    document.getElementById('budgetDisplay').textContent = `$${tripData.tripDetails.budget}`;
                }

            } catch (error) {
                console.error('Error loading trip data:', error);
                ErrorHandler.displayError('Failed to load trip details. Please try again.');
            }
        });
    }
});

// Update the generateAndDisplayPlan function to handle errors
function generateAndDisplayPlan(tripData) {
    try {
        const planner = new TripPlanner(tripData);
        const tripPlan = planner.generatePlan();
        displayPlan(tripPlan);
    } catch (error) {
        console.error('Error generating plan:', error);
        alert('There was an error generating your trip plan. Please try again.');
    }
}

// Separate display logic for better error handling
function displayPlan(tripPlan) {
    try {
        // Create a container for the plan
        const planContainer = document.createElement('div');
        planContainer.classList.add('trip-plan');
        
        // Generate the plan display HTML
        planContainer.innerHTML = `
            <h2>Your Trip Plan</h2>
            
            <h3>Trip Summary</h3>
            <p>Group Size: ${tripPlan.tripSummary.totalMembers || 'N/A'} people</p>
            <p>Duration: ${tripPlan.tripSummary.duration || 'N/A'}</p>
            <p>Start Date: ${tripPlan.tripSummary.startDate || 'N/A'}</p>
            <p>Total Budget: ${tripPlan.tripSummary.totalBudget || 'N/A'}</p>
            
            <!-- ... rest of the display HTML ... -->
        `;

        // Style the container
        planContainer.style.cssText = `
            max-width: 800px;
            margin: 20px auto;
            padding: 20px;
            background-color: #f9f9f9;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        `;

        // Clear any existing plan and add the new one
        const existingPlan = document.querySelector('.trip-plan');
        if (existingPlan) {
            existingPlan.remove();
        }
        document.body.appendChild(planContainer);
    } catch (error) {
        console.error('Error displaying plan:', error);
        alert('There was an error displaying your trip plan. Please try again.');
    }
}

class TripPlanDisplay {
    static createPlanHTML(tripData) {
        return `
            <div class="trip-plan">
                <h2>Your Trip Plan</h2>
                <div class="plan-details">
                    <div class="section">
                        <h3>Trip Summary</h3>
                        <p><strong>Start Location:</strong> ${tripData.startLocation || 'Not specified'}</p>
                        <p><strong>Destination:</strong> ${tripData.destination || 'Not specified'}</p>
                        <p><strong>Transport Mode:</strong> ${tripData.transportMode || 'Not specified'}</p>
                        <p><strong>Departure Time:</strong> ${tripData.departureTime || 'Not specified'}</p>
                    </div>
                    
                    <div class="section">
                        <h3>Additional Details</h3>
                        <p><strong>Budget:</strong> ${tripData.budget || 'Not specified'}</p>
                        <p><strong>Duration:</strong> ${tripData.duration || 'Not specified'} days</p>
                        <p><strong>Members:</strong> ${tripData.members?.length || 1}</p>
                    </div>
                </div>
            </div>
        `;
    }
}

// Add initialization for backweb.html
function initializeBackwebPage() {
    try {
        const savedData = JSON.parse(sessionStorage.getItem('tripData') || '{}');
        if (savedData.data) {
            const planContainer = document.getElementById('tripPlanContainer');
            if (planContainer) {
                planContainer.innerHTML = TripPlanDisplay.createPlanHTML(savedData.data);
                planContainer.style.display = 'block';
            }
        }
    } catch (error) {
        console.error('Error initializing backweb page:', error);
        alert('Failed to load trip plan. Please try again.');
    }
}

// Add member management functionality
let memberCount = 0;

function addMember() {
    memberCount++;
    const memberDiv = document.createElement('div');
    memberDiv.innerHTML = `
        <div class="grid-2">
            <div class="input-group">
                <input type="text" placeholder="Member Name" name="member_name_${memberCount}" required>
            </div>
            <div class="input-group">
                <input type="number" placeholder="Age" name="member_age_${memberCount}" required min="0" max="120">
            </div>
        </div>
    `;
    document.getElementById('membersList').appendChild(memberDiv);
}

// Initialize the first member field
document.addEventListener('DOMContentLoaded', function() {
    addMember();
    document.querySelector('.add-member-btn').addEventListener('click', addMember);
});

document.getElementById('tripForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Gather form data including new fields
    const tripData = {
        mainContact: document.getElementById('mainContact').value,
        currentLocation: document.getElementById('currentLocation').value,
        destination: document.getElementById('destinations').value,
        startDate: document.getElementById('startDate').value,
        duration: parseInt(document.getElementById('duration').value),
        budget: parseInt(document.getElementById('budget').value),
        weather: document.getElementById('weather').value,
        food: document.getElementById('food').value,
        accommodation: document.getElementById('accommodation').value,
        specialRequests: document.getElementById('specialRequests').value,
        members: getMembersData()
    };

    // Generate and display the trip plan
    generateTripPlan(tripData);
});

function getMembersData() {
    const members = [];
    const memberInputs = document.getElementById('membersList').getElementsByTagName('input');
    
    for (let i = 0; i < memberInputs.length; i += 2) {
        members.push({
            name: memberInputs[i].value,
            age: memberInputs[i + 1].value
        });
    }
    return members;
}

// Update the generateTripPlan function to include new information
function generateTripPlan(tripData) {
    // Calculate daily budget
    const dailyBudget = Math.floor(tripData.budget / tripData.duration);
    const accommodationBudget = Math.floor(tripData.budget * 0.4);
    const foodBudget = Math.floor(tripData.budget * 0.2);
    const activitiesBudget = Math.floor(tripData.budget * 0.3);
    const emergencyFund = Math.floor(tripData.budget * 0.1);

    // Generate daily activities
    const dailyPlans = generateDailyPlans(tripData);

    const tripPlanHTML = `
        <div class="card-header">Your Trip Plan to ${tripData.destination}</div>
        <div class="card-content">
            <div class="trip-summary">
                <h3>Trip Summary</h3>
                <p><strong>Main Contact:</strong> ${tripData.mainContact}</p>
                <p><strong>From:</strong> ${tripData.currentLocation}</p>
                <p><strong>To:</strong> ${tripData.destination}</p>
                <p><strong>Duration:</strong> ${tripData.duration} days</p>
                <p><strong>Start Date:</strong> ${new Date(tripData.startDate).toLocaleDateString()}</p>
                <p><strong>Weather Preference:</strong> ${tripData.weather}</p>
                <p><strong>Food Preference:</strong> ${tripData.food}</p>
            </div>

            <div class="members-section">
                <h3>Group Members</h3>
                <ul>
                    ${tripData.members.map(member => 
                        `<li>${member.name} (Age: ${member.age})</li>`
                    ).join('')}
                </ul>
            </div>

            <div class="budget-section">
                <h3>Budget Breakdown</h3>
                <div class="budget-item">
                    <span>Daily Budget:</span>
                    <span>$${dailyBudget}</span>
                </div>
                <div class="budget-item">
                    <span>Accommodation:</span>
                    <span>$${accommodationBudget}</span>
                </div>
                <div class="budget-item">
                    <span>Food:</span>
                    <span>$${foodBudget}</span>
                </div>
                <div class="budget-item">
                    <span>Activities:</span>
                    <span>$${activitiesBudget}</span>
                </div>
                <div class="budget-item">
                    <span>Emergency Fund:</span>
                    <span>$${emergencyFund}</span>
                </div>
            </div>

            <div class="daily-plans">
                <h3>Daily Itinerary</h3>
                ${dailyPlans}
            </div>

            <div class="recommendations">
                <h3>Travel Tips</h3>
                <ul>
                    <li>Remember to book your ${tripData.accommodation} in advance</li>
                    <li>Check the weather forecast before your trip</li>
                    <li>Keep emergency contacts handy</li>
                    <li>Make copies of important documents</li>
                </ul>
            </div>
        </div>
    `;

    // Display the trip plan
    const outputDiv = document.getElementById('tripPlanOutput');
    outputDiv.innerHTML = tripPlanHTML;
    outputDiv.classList.remove('hidden');
    outputDiv.scrollIntoView({ behavior: 'smooth' });
}

function generateDailyPlans(tripData) {
    let plansHTML = '';
    
    // Sample activities for different times of day
    const morningActivities = ['Breakfast at local cafe', 'City tour', 'Museum visit', 'Hiking'];
    const afternoonActivities = ['Lunch at restaurant', 'Shopping', 'Beach time', 'Cultural site visit'];
    const eveningActivities = ['Dinner experience', 'Night market visit', 'Cultural show', 'City lights tour'];

    for (let day = 1; day <= tripData.duration; day++) {
        plansHTML += `
            <div class="day-plan">
                <h3>Day ${day}</h3>
                <div class="activity-item">
                    <span class="activity-time">Morning:</span>
                    <span>${morningActivities[Math.floor(Math.random() * morningActivities.length)]}</span>
                </div>
                <div class="activity-item">
                    <span class="activity-time">Afternoon:</span>
                    <span>${afternoonActivities[Math.floor(Math.random() * afternoonActivities.length)]}</span>
                </div>
                <div class="activity-item">
                    <span class="activity-time">Evening:</span>
                    <span>${eveningActivities[Math.floor(Math.random() * eveningActivities.length)]}</span>
                </div>
            </div>
        `;
    }

    return plansHTML;
} 