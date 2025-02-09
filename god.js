// Trip Planning Handler
class TripHandler {
    constructor() {
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        document.addEventListener('DOMContentLoaded', () => {
            // Form submission handler
            const newTripForm = document.getElementById('newTripForm');
            if (newTripForm) {
                newTripForm.addEventListener('submit', (e) => this.handleNewTripSubmission(e));
            }

            // Dynamic budget calculation
            const budgetInputs = document.querySelectorAll('.budget-input');
            budgetInputs.forEach(input => {
                input.addEventListener('input', () => this.updateTotalBudget());
            });

            // Date validation
            const startDate = document.getElementById('startDate');
            const endDate = document.getElementById('endDate');
            if (startDate && endDate) {
                startDate.addEventListener('change', () => this.validateDates());
                endDate.addEventListener('change', () => this.validateDates());
            }
        });
    }

    handleNewTripSubmission(e) {
        e.preventDefault();
        
        const tripData = {
            title: document.getElementById('tripTitle').value,
            destination: document.getElementById('destination').value,
            startDate: document.getElementById('startDate').value,
            endDate: document.getElementById('endDate').value,
            travelers: document.getElementById('travelers').value,
            accommodation: {
                type: document.getElementById('accommodationType').value,
                cost: parseFloat(document.getElementById('accommodationCost').value) || 0
            },
            transportation: {
                mode: document.getElementById('transportMode').value,
                cost: parseFloat(document.getElementById('transportCost').value) || 0
            },
            activities: this.getActivitiesList(),
            budget: {
                accommodation: parseFloat(document.getElementById('accommodationCost').value) || 0,
                transportation: parseFloat(document.getElementById('transportCost').value) || 0,
                activities: parseFloat(document.getElementById('activitiesCost').value) || 0,
                food: parseFloat(document.getElementById('foodCost').value) || 0,
                miscellaneous: parseFloat(document.getElementById('miscCost').value) || 0,
                total: this.calculateTotalBudget()
            },
            notes: document.getElementById('tripNotes').value
        };

        this.saveTrip(tripData);
        this.showSuccessMessage();
        this.redirectToTripsList();
    }

    getActivitiesList() {
        const activitiesList = document.getElementById('activitiesList');
        const activities = [];
        
        if (activitiesList) {
            const activityInputs = activitiesList.getElementsByClassName('activity-input');
            for (let input of activityInputs) {
                if (input.value.trim()) {
                    activities.push({
                        name: input.value,
                        date: input.getAttribute('data-date') || '',
                        cost: parseFloat(input.getAttribute('data-cost')) || 0
                    });
                }
            }
        }
        return activities;
    }

    calculateTotalBudget() {
        const budgetInputs = document.querySelectorAll('.budget-input');
        let total = 0;
        budgetInputs.forEach(input => {
            total += parseFloat(input.value) || 0;
        });
        return total;
    }

    updateTotalBudget() {
        const total = this.calculateTotalBudget();
        const totalDisplay = document.getElementById('totalBudget');
        if (totalDisplay) {
            totalDisplay.textContent = `Total Budget: $${total.toFixed(2)}`;
        }
    }

    validateDates() {
        const startDate = document.getElementById('startDate');
        const endDate = document.getElementById('endDate');
        
        if (startDate && endDate && startDate.value && endDate.value) {
            const start = new Date(startDate.value);
            const end = new Date(endDate.value);
            
            if (end < start) {
                alert('End date cannot be before start date');
                endDate.value = '';
            }
        }
    }

    saveTrip(tripData) {
        // Get existing trips from localStorage
        let trips = JSON.parse(localStorage.getItem('trips') || '[]');
        
        // Add new trip with unique ID
        tripData.id = Date.now();
        tripData.createdAt = new Date().toISOString();
        trips.push(tripData);
        
        // Save back to localStorage
        localStorage.setItem('trips', JSON.stringify(trips));
    }

    showSuccessMessage() {
        const messageContainer = document.getElementById('messageContainer');
        if (messageContainer) {
            messageContainer.innerHTML = `
                <div class="alert alert-success">
                    Trip successfully planned! Redirecting to trips list...
                </div>
            `;
        }
    }

    redirectToTripsList() {
        setTimeout(() => {
            window.location.href = 'trips.html';
        }, 2000);
    }

    // Helper method to add new activity input field
    addActivityField() {
        const activitiesList = document.getElementById('activitiesList');
        if (activitiesList) {
            const newActivity = document.createElement('div');
            newActivity.className = 'activity-item';
            newActivity.innerHTML = `
                <input type="text" class="activity-input" placeholder="Enter activity">
                <input type="date" class="activity-date">
                <input type="number" class="activity-cost budget-input" placeholder="Cost">
                <button type="button" onclick="this.parentElement.remove()">Remove</button>
            `;
            activitiesList.appendChild(newActivity);
        }
    }
}

// Initialize the trip handler
const tripHandler = new TripHandler();

// Expose method to add activity fields
function addNewActivity() {
    tripHandler.addActivityField();
}
