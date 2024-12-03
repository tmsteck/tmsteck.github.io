// Initialize variables
const audioPlayer = document.getElementById('audioPlayer');
const playButton = document.getElementById('playButton');
const statusMessage = document.getElementById('status-message');
let isPlaying = false;

/**
 * Updates the button state and associated ARIA labels
 * @param {boolean} playing - Whether the audio is currently playing
 */
function updateButtonState(playing) {
    isPlaying = playing;
    playButton.textContent = isPlaying ? 'Pause Audio' : 'Play Audio';
    playButton.setAttribute('aria-label', isPlaying ? 'Pause audio' : 'Play audio');
    statusMessage.textContent = isPlaying ? 'Audio is playing' : 'Audio is paused';
}

/**
 * Toggles audio playback between play and pause states
 */
function toggleAudio() {
    if (isPlaying) {
        audioPlayer.pause();
    } else {
        // Reset audio if it has ended
        if (audioPlayer.ended) {
            audioPlayer.currentTime = 0;
        }
        audioPlayer.play().catch(error => {
            console.error('Error playing audio:', error);
            statusMessage.textContent = 'Error playing audio. Please try again.';
        });
    }
}

// Event Listeners
playButton.addEventListener('click', toggleAudio);

// Keyboard support for space and enter keys
playButton.addEventListener('keydown', (event) => {
    if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault();
        toggleAudio();
    }
});

// Audio state change listeners
audioPlayer.addEventListener('play', () => updateButtonState(true));
audioPlayer.addEventListener('pause', () => updateButtonState(false));
audioPlayer.addEventListener('ended', () => updateButtonState(false));

// Error handling
audioPlayer.addEventListener('error', () => {
    statusMessage.textContent = 'Error loading audio file';
    playButton.disabled = true;
});