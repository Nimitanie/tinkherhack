document.addEventListener('DOMContentLoaded', function() {
    // Retrieve the trip data
    const tripData = JSON.parse(localStorage.getItem('tripData'));
    
    if (tripData) {
        // Generate and display the plan using the existing TripPlanner class
        generateAndDisplayPlan(tripData);
        // Clear the stored data (optional)
        localStorage.removeItem('tripData');
    } else {
        document.body.innerHTML = '<h2>No trip data found. Please <a href="new.html">create a new trip</a>.</h2>';
    }
}); 