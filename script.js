// Get references to DOM elements
const searchBtn = document.getElementById("searchBtn");        // Search button
const voiceBtn = document.getElementById("voiceBtn");          // Voice search button
const searchInput = document.getElementById("searchInput");    // Text input for search
const recipeContainer = document.getElementById("recipeContainer"); // Container to display recipes

// Add event listener: when search button is clicked, call searchRecipes function
searchBtn.addEventListener("click", searchRecipes);

// Add event listener: when voice button is clicked, start voice recognition
voiceBtn.addEventListener("click", startVoiceSearch);

// Function to search for recipes using TheMealDB API
function searchRecipes() {
  const query = searchInput.value.trim(); // Get input value, remove extra spaces
  if (query) {
    // If input is not empty, make API call
    fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`)
      .then(response => response.json())      // Parse JSON response
      .then(data => displayRecipes(data.meals)) // Pass meal data to display function
      .catch(err => console.error("Error fetching recipes:", err)); // Handle errors
  }
}

// Function to display recipes on the page
function displayRecipes(meals) {
  recipeContainer.innerHTML = ""; // Clear any previous results

  if (!meals) {
    // If no meals found, show message
    recipeContainer.innerHTML = "<p>No recipes found.</p>";
    return;
  }

  // Loop through each meal returned from API
  meals.forEach(meal => {
    const ingredients = [];
    // Build list of ingredients + measures (up to 20 possible in API)
    for (let i = 1; i <= 20; i++) {
      const ingredient = meal[`strIngredient${i}`];
      const measure = meal[`strMeasure${i}`];
      if (ingredient) {
        // Add ingredient + measure to array if ingredient exists
        ingredients.push(`${ingredient} - ${measure}`);
      }
    }

    // Create recipe card element
    const card = document.createElement("div");
    card.className = "recipe-card";

    // Build HTML for the card
    card.innerHTML = `
      <h2>${meal.strMeal}</h2>
      <img src="${meal.strMealThumb}" alt="${meal.strMeal}" />
      <h3>Ingredients:</h3>
      <ul>${ingredients.map(i => `<li>${i}</li>`).join("")}</ul>
      <h3>Instructions:</h3>
      <p>${meal.strInstructions.slice(0, 300)}...</p> 
      <!-- Show first 300 characters of instructions -->
    `;

    // Add card to the container
    recipeContainer.appendChild(card);
  });
}

// Function to handle voice search using speech recognition
function startVoiceSearch() {
  // Check if browser supports webkitSpeechRecognition
  if (!('webkitSpeechRecognition' in window)) {
    alert("Voice search not supported in this browser.");
    return;
  }

  // Create speech recognition instance
  const recognition = new webkitSpeechRecognition();
  recognition.lang = 'en-US'; // Set language
  recognition.start(); // Start listening

  // When speech is recognized
  recognition.onresult = function(event) {
    const transcript = event.results[0][0].transcript; // Get spoken text
    searchInput.value = transcript; // Put text in input field
    searchRecipes(); // Perform search with spoken text
  };

  // Handle errors in speech recognition
  recognition.onerror = function(event) {
    console.error("Speech recognition error", event);
  };
}
