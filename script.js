let currentAudio = null;

// Retrieve user name from sessionStorage
const userName = sessionStorage.getItem('userName') || '';

let userChoices = []; // Array to store user choices for tracking


// To display choices at the end of the story
console.log("Path taken:", userChoices.join(" -> "));


// Function to load the story based on the given path
function loadStory(path) {
    fetch('stories.json?t=' + new Date().getTime())
        .then(response => response.json())
        .then(data => {
            const story = getStoryByPath(data, path); // Get story based on path

            if (story) {
				
				// Add the current path to userChoices for tracking
				userChoices.push(path);
				
                // Display story text, including user's name if available
                document.getElementById('story-content').innerHTML = `<h2>${userName ? userName + ',' : ''} ${story.text}</h2>`;
                
                const optionsContainer = document.getElementById('story-options');
                optionsContainer.innerHTML = '';  // Clear previous options

                // Display options as buttons
                if (story.options) {
					
                    Object.keys(story.options).forEach(optionKey => {
                        let button = document.createElement('button');
                        button.classList.add('button');
                        button.innerText = story.options[optionKey];
                        button.onclick = () => loadStory(optionKey);
                        optionsContainer.appendChild(button);
                    });
                } else {
                    // End of the story: show thank-you message
                    document.getElementById('story-content').innerHTML += "<p><h2>Thank you for reading the story.</h2></p>";
					displayChoicesSummary();
                    document.getElementById('stop-button').innerText = "Exit Story";
                }

                // Set background image and play music as before (if included in JSON)
                if (story.backgroundImage) {
                    document.body.style.backgroundImage = `url('${story.backgroundImage}')`;
                    document.body.style.backgroundSize = 'cover';
                }
                if (story.music) {
                    if (currentAudio) currentAudio.pause(); // Stop current music
                    currentAudio = new Audio(story.music);
                    currentAudio.loop = true;
                    currentAudio.play();
                }
            } else {
                document.getElementById('story-content').innerHTML = `<h2>Story not found. Please start again.</h2>`;
            }
        })
        .catch(error => console.error('Error loading story:', error));
}

// Navigate to help page
function goToHelp() {
    window.location.href = 'help.html';
}



function getStoryByPath(data, path) {
    const levels = path.split('.');
    let story = data;
    for (let level of levels) {
        if (story && story[level]) {
            story = story[level];
        } else {
            return null;
        }
    }
    return story;
}

function stopStory() {
    // Redirect to the goodbye page
    window.location.href = 'goodbye.html';
}

// Initial load
document.addEventListener("DOMContentLoaded", () => {
    loadStory('start');  // Ensure this matches the root of your story structure
});

// Function to display a summary of the choices at the end of the story
function displayChoicesSummary() {
    const summaryContainer = document.createElement('div');
    summaryContainer.id = 'choices-summary';

    // Add summary header
    summaryContainer.innerHTML = "<h3>Your Path:</h3>";

    // Display each choice made by the user
    userChoices.forEach((choice, index) => {
        const choiceText = document.createElement('p');
        choiceText.innerText = `${index + 1}. ${choice}`;
        summaryContainer.appendChild(choiceText);
    });

    // Append summary to story content
    document.getElementById('story-content').appendChild(summaryContainer);
}

function startStory() {
    const nameInput = document.getElementById('name-input');
    const userName = nameInput.value.trim();
    const validationError = document.getElementById('validation-error');

    // Clear previous validation messages
    validationError.textContent = '';

    // Perform syntactic and semantic validation
    if (!isValidName(userName)) {
        validationError.textContent = 'Please enter a valid name (letters only, 2-50 characters, no special characters).';
        return;
    }
    if (!isAcceptableName(userName)) {
        validationError.textContent = 'Please enter a unique name (avoid common placeholders like "Name").';
        return;
    }

    // Store valid name in session storage and proceed
    sessionStorage.setItem('userName', userName);
    window.location.href = 'story.html?t=' + new Date().getTime() + '&name=' + encodeURIComponent(userName);
}

// Syntactic validation: Letters only, 2-50 characters, allows spaces but no special characters
function isValidName(name) {
    const namePattern = /^[A-Za-z\s]{2,50}$/;
    return namePattern.test(name);
}

// Semantic validation: Avoid placeholder names, avoid all spaces or nonsense patterns
function isAcceptableName(name) {
    const placeholders = ["name", "your name", "enter name"];
    const lowerName = name.toLowerCase();

    // Check for common placeholder names and excess spaces
    return !placeholders.includes(lowerName) && lowerName.replace(/\s+/g, '').length > 1;
}
