// Add click event listener to the start button
document.addEventListener('DOMContentLoaded', function() {
    const startButton = document.getElementById('startBtn');
    
    if (startButton) {
        startButton.addEventListener('click', function() {
            // Redirect to new.html when clicked
            window.location.href = 'new.html';
        });
    }
});
