// Audio elements
const audioElements = {
    alexa: document.getElementById('alexaSound'),
    setInput: document.getElementById('setInputSound'),
    fireStick: document.getElementById('fireStickSound'),
    tvOff: document.getElementById('tvOffSound'),
    channelUp: document.getElementById('channelUpSound'),
    channelDown: document.getElementById('channelDownSound'),
    volumeUp: document.getElementById('volumeUpSound'),
    volumeUpFive: document.getElementById('volumeUpFiveSound'),
    volumeDown: document.getElementById('volumeDownSound'),
    volumeDownFive: document.getElementById('volumeDownFiveSound'),
    tvOn: document.getElementById('tvOnSound')
};

// Button elements
const alexaButton = document.getElementById('alexaButton');
const cableButton = document.getElementById('cableButton');
const fireStickButton = document.getElementById('fireStickButton');
const tvOffButton = document.getElementById('tvOffButton');
const channelUpButton = document.getElementById('channelUpButton');
const channelDownButton = document.getElementById('channelDownButton');
const volumeUpButton = document.getElementById('volumeUpButton');
const volumeDownButton = document.getElementById('volumeDownButton');
const tvOnButton = document.getElementById('tvOnButton');
const raiseFiveButton = document.getElementById('raiseFiveButton');
const volumeDownFiveButton = document.getElementById('volumeDownFiveButton');

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
        statusMessage.textContent = 'Error playing audio';
    });
    
    // Update status message
    statusMessage.textContent = message;
}

// Button click handlers
const buttonActions = [
    { button: alexaButton, audio: audioElements.alexa, message: 'Calling Alexa' },
    { button: cableButton, audio: audioElements.setInput, message: 'Switching to cable' },
    { button: fireStickButton, audio: audioElements.fireStick, message: 'Turning on Fire Stick' },
    { button: tvOffButton, audio: audioElements.tvOff, message: 'Turning off TV' },
    { button: channelUpButton, audio: audioElements.channelUp, message: 'Channel Up' },
    { button: channelDownButton, audio: audioElements.channelDown, message: 'Channel Down' },
    { button: volumeUpButton, audio: audioElements.volumeUpFive, message: 'Volume Up' },
    { button: raiseFiveButton, audio: audioElements.volumeUpFive, message: 'Volume Up 5' },
    { button: volumeDownFiveButton, audio: audioElements.volumeDownFive, message: 'Volume Down 5' },
    { button: volumeDownButton, audio: audioElements.volumeDown, message: 'Volume Down' },
    { button: tvOnButton, audio: audioElements.tvOn, message: 'Turning on TV' }
];

// Add click handlers to all buttons
buttonActions.forEach(({ button, audio, message }) => {
    button.addEventListener('click', () => {
        playAndShowMessage(audio, message);
    });
});

// Error handling for audio
Object.values(audioElements).forEach(audio => {
    audio.addEventListener('error', () => {
        console.error('Error loading audio file');
        statusMessage.textContent = 'Error loading sound effect';
    });
});