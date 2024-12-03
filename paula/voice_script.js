// Audio elements
const channelUpSound = document.getElementById('channelUpSound');
const channelDownSound = document.getElementById('channelDownSound');
const volumeUpSound = document.getElementById('volumeUpSound');
const volumeDownSound = document.getElementById('volumeDownSound');
const powerSound = document.getElementById('powerSound');

// Buttons
const channelUpButton = document.getElementById('channelUp');
const channelDownButton = document.getElementById('channelDown');
const volumeUpButton = document.getElementById('volumeUp');
const volumeDownButton = document.getElementById('volumeDown');
const powerButton = document.getElementById('powerButton');

// Status message
const statusMessage = document.getElementById('status-message');

/**
 * Plays the specified audio element and shows a message
 * @param {HTMLAudioElement} audio - The audio element to play
 * @param {string} message - The message to display
 */
function playAndShowMessage(audio, message) {
    // Reset and play audio
    audio.currentTime = 0;
    audio.play().catch(error => {
        console.error('Error playing audio:', error);
    });
    
    // Update status message
    statusMessage.textContent = message;
}

// Button click handlers
channelUpButton.addEventListener('click', () => {
    playAndShowMessage(channelUpSound, 'Changing to next channel');
});

channelDownButton.addEventListener('click', () => {
    playAndShowMessage(channelDownSound, 'Changing to previous channel');
});

volumeUpButton.addEventListener('click', () => {
    playAndShowMessage(volumeUpSound, 'Increasing volume');
});

volumeDownButton.addEventListener('click', () => {
    playAndShowMessage(volumeDownSound, 'Decreasing volume');
});

powerButton.addEventListener('click', () => {
    playAndShowMessage(powerSound, 'Power button pressed');
});

// Keyboard support
document.addEventListener('keydown', (event) => {
    switch(event.key) {
        case 'ArrowUp':
            event.preventDefault();
            channelUpButton.click();
            break;
        case 'ArrowDown':
            event.preventDefault();
            channelDownButton.click();
            break;
        case 'ArrowRight':
            event.preventDefault();
            volumeUpButton.click();
            break;
        case 'ArrowLeft':
            event.preventDefault();
            volumeDownButton.click();
            break;
        case 'Enter':
            event.preventDefault();
            powerButton.click();
            break;
    }
});

// Error handling for audio
[channelUpSound, channelDownSound, volumeUpSound, volumeDownSound, powerSound].forEach(audio => {
    audio.addEventListener('error', () => {
        console.error('Error loading audio file');
        statusMessage.textContent = 'Error loading sound effect';
    });
});