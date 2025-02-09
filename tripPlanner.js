function planTrip() {
    // Get input values
    const startLocation = document.getElementById('startLocation').value;
    const destination = document.getElementById('destination').value;
    const transportMode = document.getElementById('transportMode').value;
    const departureTime = document.getElementById('departureTime').value;

    // Validate inputs
    if (!startLocation || !destination) {
        alert('Please fill in both start location and destination');
        return;
    }

    // Show all sections
    document.querySelector('.trip-summary').style.display = 'block';
    document.querySelector('.route-details').style.display = 'block';
    document.querySelector('.weather-info').style.display = 'block';
    document.querySelector('.additional-info').style.display = 'block';

    // Update trip summary
    document.getElementById('summary-start').textContent = startLocation;
    document.getElementById('summary-destination').textContent = destination;
    document.getElementById('summary-mode').textContent = transportMode.charAt(0).toUpperCase() + transportMode.slice(1);
    document.getElementById('summary-departure').textContent = formatDateTime(departureTime);
    
    // Mock data for demonstration
    const mockTripData = {
        duration: '1 hour 30 minutes',
        distance: '45 kilometers',
        steps: [
            'Head north on Main St',
            'Turn right onto Oak Ave',
            'Continue onto Highway 101',
            'Take exit 25 towards Downtown',
            'Arrive at destination'
        ],
        weather: {
            temperature: '22°C',
            condition: 'Partly Cloudy',
            precipitation: '10%'
        },
        alerts: {
            traffic: 'Minor delays on Highway 101',
            transit: 'All services running normally'
        }
    };

    // Update duration and distance
    document.getElementById('summary-duration').textContent = mockTripData.duration;
    document.getElementById('summary-distance').textContent = mockTripData.distance;

    // Update route steps
    const routeSteps = document.getElementById('route-steps');
    routeSteps.innerHTML = '';
    mockTripData.steps.forEach(step => {
        const li = document.createElement('li');
        li.textContent = step;
        routeSteps.appendChild(li);
    });

    // Update weather information
    const weatherDetails = document.getElementById('weather-details');
    weatherDetails.innerHTML = `
        <p><strong>Temperature:</strong> ${mockTripData.weather.temperature}</p>
        <p><strong>Condition:</strong> ${mockTripData.weather.condition}</p>
        <p><strong>Precipitation Chance:</strong> ${mockTripData.weather.precipitation}</p>
    `;

    // Update additional information
    document.getElementById('traffic-alerts').innerHTML = `
        <p><strong>Traffic Alert:</strong> ${mockTripData.alerts.traffic}</p>
    `;
    document.getElementById('transit-updates').innerHTML = `
        <p><strong>Transit Update:</strong> ${mockTripData.alerts.transit}</p>
    `;
}

function formatDateTime(dateTimeString) {
    if (!dateTimeString) return 'Not specified';
    const dateTime = new Date(dateTimeString);
    return dateTime.toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
} 