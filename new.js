// Function to handle form submission and create trip plan
function createTripPlan(event) {
    if (event) {
        event.preventDefault();
    }

    // Get all form values
    // const mainContact = document.getElementById('mainContact').value;
    // const currentLocation = document.getElementById('currentLocation').value;
    // const budget = document.getElementById('budget').value;
    // const duration = document.getElementById('duration').value;
    // const destinations = document.getElementById('destinations').value;
    // const startDate = document.getElementById('startDate').value;
    // const weather = document.getElementById('weather').value;
    // const food = document.getElementById('food').value;
    // const accommodation = document.getElementById('accommodation').value;
    // const specialRequests = document.getElementById('specialRequests').value;

    // Get group members
    const membersList = document.getElementById('membersList');
    const members = Array.from(membersList.getElementsByTagName('input'))
        .map(input => input.value)
        .filter(value => value.trim() !== '');
    const tripData = {
        basicInfo: {
            mainContact: document.getElementById('mainContact').value,
            currentLocation: document.getElementById('currentLocation').value,
            // members: document.getElementById('membersList').value.split(',').map(m => m.trim()),
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

    sessionStorage.setItem('TripPlan', JSON.stringify(tripData));

  

    // Open new window and write the tr
    createCompleteTripPlan()
}



// Function to handle form submission and create trip plan
function createCompleteTripPlan() {
    // Get form inputs

    const basicTripPlan = JSON.parse(sessionStorage.getItem('TripPlan'));


    const mainContact = basicTripPlan.basicInfo.mainContact
    const currentLocation = basicTripPlan.basicInfo.currentLocation
    const budget = basicTripPlan.tripDetails.budget
    const duration = basicTripPlan.tripDetails.duration
    const destinations = basicTripPlan.tripDetails.destinations
    const startDate = basicTripPlan.tripDetails.startDate
    const weather = basicTripPlan.tripDetails.weather
    const food = basicTripPlan.preferences.food

    const accommodation = basicTripPlan.preferences.accommodation
    const specialRequests = basicTripPlan.preferences.specialRequests


    // Get group members
    // const membersList = document.getElementById('membersList');
    // const members = Array.from(membersList.getElementsByTagName('input'))
    //     .map(input => input.value)
    //     .filter(value => value.trim() !== '');

    // Create trip plan object
    const tripPlan = {
        mainContact: mainContact,
        currentLocation: currentLocation,
        destinations: destinations,
        startDate: startDate,
        duration: parseInt(duration),
        // numTravelers: members.length + 1,
        budget: parseFloat(budget),
        weather: weather,
        food: food,
        accommodation: accommodation,
        specialRequests: specialRequests,
        // members: members,
        activities: [],
        totalCost: 0
    };

    
    // Basic budget allocation
    const dailyBudget = tripPlan.budget / tripPlan.duration;
    
    // Generate activities for each day
    for (let day = 1; day <= tripPlan.duration; day++) {
        const activities = generateActivities(destinations, weather, day);
        tripPlan.activities.push({
            day: day,
            morning: activities.morning,
            afternoon: activities.afternoon,
            evening: activities.evening,
            estimatedCost: dailyBudget
        });
        tripPlan.totalCost += dailyBudget;
    }

    // Store trip plan in session storage
    sessionStorage.setItem('finalTripPlan', JSON.stringify(tripPlan));

    // Redirect to trip display page
    window.location.href = 'backwebb.html';
}



// Helper function to generate activities based on destination and weather
function generateActivities(destination, weather, day) {
    const activities = {
        'kuala lumpur': {
            sunny: {
                morning: ['Visit KLCC Park', 'Explore Batu Caves', 'Morning Market Tour'],
                afternoon: ['Shopping at Pavilion', 'Visit KL Tower', 'Cultural Museum Tour'],
                evening: ['Dinner at Jalan Alor', 'Rooftop Bar Visit', 'Night Market Experience']
            },
            rainy: {
                morning: ['Indoor Shopping', 'Museum Visit', 'Art Gallery Tour'],
                afternoon: ['Spa Treatment', 'Cultural Show', 'Craft Workshop'],
                evening: ['Local Food Tour', 'Cinema Experience', 'Live Music Show']
            }
        },
        'penang': {
            sunny: {
                morning: ['Visit Kek Lok Si Temple', 'Penang Hill', 'Street Art Tour'],
                afternoon: ['Visit Fort Cornwallis', 'Tropical Spice Garden', 'Heritage Walk'],
                evening: ['Gurney Drive Food Court', 'Night Market', 'Beach Walk']
            },
            rainy: {
                morning: ['Penang Museum', 'Art Gallery', 'Cooking Class'],
                afternoon: ['Shopping Mall Visit', 'Tea House Experience', 'Local Crafts'],
                evening: ['Indoor Food Court', 'Cultural Show', 'Local Cafe']
            }
        }
    };

    const defaultActivities = {
        morning: `Explore ${destination} - Day ${day} Morning`,
        afternoon: `Local Activities - Day ${day} Afternoon`,
        evening: `Dinner and Entertainment - Day ${day} Evening`
    };

    const destinationActivities = activities[destination.toLowerCase()];
    if (destinationActivities && destinationActivities[weather.toLowerCase()]) {
        const dayActivities = destinationActivities[weather.toLowerCase()];
        return {
            morning: dayActivities.morning[day % dayActivities.morning.length],
            afternoon: dayActivities.afternoon[day % dayActivities.afternoon.length],
            evening: dayActivities.evening[day % dayActivities.evening.length]
        };
    }

    return defaultActivities;
}

// Add event listener when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const tripForm = document.getElementById('tripForm');
    if (tripForm) {
        tripForm.addEventListener('submit', createTripPlan);
    }
});

class TripPlanner {
    constructor() {
        this.trips = [];
    }

    addTrip(tripPlan) {
        const trip = {
            id: Date.now(),
            ...tripPlan
        };
        this.trips.push(trip);
        return trip.id;
    }

    getTripDetails(tripId) {
        const trip = this.trips.find(t => t.id === tripId);
        if (!trip) throw new Error('Trip not found');
        return trip;
    }

    getAllTrips() {
        return this.trips;
    }
}

// Function to show different pages
window.showPage = function(pageNum) {
    document.getElementById('page1').style.display = pageNum === 1 ? 'block' : 'none';
    document.getElementById('page2').style.display = pageNum === 2 ? 'block' : 'none';
}

// Add member functionality
const addMemberBtn = document.querySelector('.add-member-btn');
if (addMemberBtn) {
    addMemberBtn.addEventListener('click', function() {
        const membersList = document.getElementById('membersList');
        const memberDiv = document.createElement('div');
        memberDiv.className = 'member-input-group';
        memberDiv.innerHTML = `
            <input type="text" placeholder="Member name" required>
            <button type="button" class="remove-member-btn" onclick="this.parentElement.remove()">×</button>
        `;
        membersList.appendChild(memberDiv);
    });
}

// Handle form submission
const submitBtn = document.querySelector('.submit-btn');
if (submitBtn) {
    submitBtn.addEventListener('click', function(e) {
        e.preventDefault();
        createTripPlan(e);
        return false;
    });
}
