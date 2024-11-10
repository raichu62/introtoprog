function loadStory(path) {
    // Add a timestamp to JSON request to avoid caching
    fetch('stories.json?t=' + new Date().getTime())
        .then(response => response.json())
        .then(data => {
            console.log("Loaded JSON data:", data);  // Check if JSON is loaded properly
            const story = getStoryByPath(data, path);  // Get story based on the path

            console.log("Fetched story:", story);  // Check what story is fetched

            if (story) {
                document.getElementById('story-content').innerHTML = `<h2>${story.text}</h2>`;
                const optionsContainer = document.getElementById('story-options');
                optionsContainer.innerHTML = '';  // Clear previous options

                // Render the options as buttons
                if (story.options) {
                    Object.keys(story.options).forEach(optionKey => {
                        let button = document.createElement('button');
                        button.classList.add('button');
                        button.innerText = story.options[optionKey];
                        // Adjust path to load correctly
                        button.onclick = () => loadStory(optionKey);  // Directly use optionKey
                        optionsContainer.appendChild(button);
                    });
                } else {
                    // End of the story
                    let button = document.createElement('button');
                    button.classList.add('button');
                    button.innerText = 'Restart Story';
                    button.onclick = () => window.location.href = 'index.html';
                    optionsContainer.appendChild(button);
                }
            } else {
                document.getElementById('story-content').innerHTML = `<h2>Story not found. Please start again.</h2>`;
            }
        })
        .catch(error => console.error('Error loading story:', error));
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
