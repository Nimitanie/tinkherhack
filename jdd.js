class TripPlanner {
    constructor(tripData) {
        this.tripData = tripData;
        this.plan = {};
    }

    generatePlan() {
        this.plan = {
            tripSummary: this.generateSummary(),
            dailySchedule: this.generateDailySchedule(),
            budgetBreakdown: this.generateBudgetBreakdown(),
            accommodationPlan: this.generateAccommodationPlan(),
            groupArrangements: this.generateGroupArrangements()
        };
        return this.plan;
    }

    generateSummary() {
        return {
            totalMembers: this.tripData.members.length + 1,
            mainContact: this.tripData.mainContact,
            duration: this.tripData.duration + ' days',
            destinations: this.tripData.destinations,
            startDate: new Date(this.tripData.startDate).toLocaleDateString(),
            totalBudget: `$${this.tripData.budget}`
        };
    }

    generateDailySchedule() {
        const schedule = [];
        const destinations = this.tripData.destinations.split(',').map(d => d.trim());
        const daysPerDestination = Math.floor(this.tripData.duration / destinations.length);

        let currentDay = 1;
        for (const destination of destinations) {
            for (let i = 0; i < daysPerDestination; i++) {
                schedule.push({
                    day: currentDay,
                    destination: destination,
                    activities: this.generateDailyActivities(this.tripData.weather),
                    meals: this.generateMealPlan(this.tripData.food)
                });
                currentDay++;
            }
        }

        return schedule;
    }

    generateDailyActivities(weatherPreference) {
        const activities = {
            sunny: ['Sightseeing', 'Beach visit', 'Outdoor sports', 'Walking tour'],
            rainy: ['Museum visit', 'Indoor shopping', 'Cultural shows', 'Local workshops'],
            moderate: ['City exploration', 'Park visits', 'Historical sites', 'Local markets']
        };

        const selectedActivities = activities[weatherPreference] || activities.moderate;
        return {
            morning: selectedActivities[Math.floor(Math.random() * selectedActivities.length)],
            afternoon: selectedActivities[Math.floor(Math.random() * selectedActivities.length)],
            evening: 'Group dinner and social time'
        };
    }

    generateMealPlan(foodPreference) {
        return {
            breakfast: `${foodPreference} breakfast options at accommodation`,
            lunch: `Local ${foodPreference} restaurants`,
            dinner: `Group dinner at recommended ${foodPreference} restaurant`
        };
    }

    generateBudgetBreakdown() {
        const totalBudget = parseInt(this.tripData.budget);
        const numberOfPeople = this.tripData.members.length + 1;
        const duration = parseInt(this.tripData.duration);

        const perPersonPerDay = totalBudget / (numberOfPeople * duration);

        return {
            perPersonDaily: Math.round(perPersonPerDay),
            suggestedAllocation: {
                accommodation: Math.round(totalBudget * 0.4),
                food: Math.round(totalBudget * 0.25),
                activities: Math.round(totalBudget * 0.20),
                transportation: Math.round(totalBudget * 0.10),
                emergency: Math.round(totalBudget * 0.05)
            }
        };
    }

    generateAccommodationPlan() {
        const accommodationType = this.tripData.accommodation;
        const suggestions = {
            hotel: {
                type: 'Hotel',
                roomArrangement: 'Double rooms',
                amenities: ['Daily housekeeping', 'Room service', 'Wi-Fi', 'Breakfast included']
            },
            hostel: {
                type: 'Hostel', 
                roomArrangement: 'Shared dormitory',
                amenities: ['Common kitchen', 'Lounge area', 'Wi-Fi', 'Lockers']
            },
            apartment: {
                type: 'Vacation Rental',
                roomArrangement: 'Multi-bedroom apartment', 
                amenities: ['Full kitchen', 'Living space', 'Wi-Fi', 'Laundry facilities']
            }
        };

        return suggestions[accommodationType] || suggestions.hotel;
    }

    generateGroupArrangements() {
        return {
            groupLeader: this.tripData.mainContact,
            members: this.tripData.members,
            suggestedGroups: this.createSubgroups()
        };
    }

    createSubgroups() {
        const allMembers = [this.tripData.mainContact, ...this.tripData.members];
        const subgroups = [];
        const groupSize = 4;

        for (let i = 0; i < allMembers.length; i += groupSize) {
            subgroups.push({
                groupNumber: Math.floor(i / groupSize) + 1,
                members: allMembers.slice(i, i + groupSize)
            });
        }

        return subgroups;
    }
}

function createTripPlan(event) {
    if (event) {
        event.preventDefault();
    }

    // Get form values
    const tripData = {
        mainContact: document.getElementById('mainContact').value,
        currentLocation: document.getElementById('currentLocation').value,
        budget: document.getElementById('budget').value,
        duration: document.getElementById('duration').value,
        destinations: document.getElementById('destinations').value,
        startDate: document.getElementById('startDate').value,
        weather: document.getElementById('weather').value,
        food: document.getElementById('food').value,
        accommodation: document.getElementById('accommodation').value,
        specialRequests: document.getElementById('specialRequests').value,
        members: Array.from(document.getElementById('membersList').getElementsByTagName('input'))
            .map(input => input.value)
            .filter(value => value.trim() !== '')
    };

    // Generate trip plan
    const planner = new TripPlanner(tripData);
    const plan = planner.generatePlan();

    // Create schedule option tool
    const scheduleSelect = document.createElement('select');
    scheduleSelect.id = 'scheduleSelect';
    scheduleSelect.style.margin = '20px 0';
    scheduleSelect.style.padding = '10px';
    scheduleSelect.style.width = '100%';

    // Add options for each day
    plan.dailySchedule.forEach((day, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `Day ${day.day} - ${day.destination}`;
        scheduleSelect.appendChild(option);
    });

    // Create schedule details div
    const scheduleDetails = document.createElement('div');
    scheduleDetails.id = 'scheduleDetails';
    scheduleDetails.style.padding = '20px';
    scheduleDetails.style.backgroundColor = '#f8f9fa';
    scheduleDetails.style.borderRadius = '10px';
    scheduleDetails.style.marginTop = '10px';

    // Add schedule selector and details to the page
    const container = document.querySelector('.container');
    container.appendChild(scheduleSelect);
    container.appendChild(scheduleDetails);

    // Function to update schedule details
    function updateScheduleDetails() {
        const selectedDay = plan.dailySchedule[scheduleSelect.value];
        scheduleDetails.innerHTML = `
            <h3>Schedule for Day ${selectedDay.day}</h3>
            <p><strong>Destination:</strong> ${selectedDay.destination}</p>
            <p><strong>Morning:</strong> ${selectedDay.activities.morning}</p>
            <p><strong>Afternoon:</strong> ${selectedDay.activities.afternoon}</p>
            <p><strong>Evening:</strong> ${selectedDay.activities.evening}</p>
            <h4>Meals</h4>
            <p><strong>Breakfast:</strong> ${selectedDay.meals.breakfast}</p>
            <p><strong>Lunch:</strong> ${selectedDay.meals.lunch}</p>
            <p><strong>Dinner:</strong> ${selectedDay.meals.dinner}</p>
        `;
    }

    // Add event listener to schedule select
    scheduleSelect.addEventListener('change', updateScheduleDetails);

    // Show initial schedule
    updateScheduleDetails();
}