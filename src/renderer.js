const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'data', 'favorites.json');

function searchRecipes() {
    const query = document.getElementById('search-input').value;
    fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${query}`)
        .then(response => response.json())
        .then(data => displayRecipes(data.meals))
        .catch(error => console.error('Error fetching data:', error));
}

function displayRecipes(meals) {
    const recipesDiv = document.getElementById('recipes');
    recipesDiv.innerHTML = '';

    if (meals) {
        meals.forEach(meal => {
            const recipeDiv = document.createElement('div');
            recipeDiv.className = 'recipe';

            recipeDiv.innerHTML = `
                <div>
                    <h3>${meal.strMeal}</h3>
                    <button onclick="viewRecipe('${meal.idMeal}')">View</button>
                </div>
                <button onclick="addToFavorites('${meal.idMeal}')">Add to Favorites</button>
            `;

            recipesDiv.appendChild(recipeDiv);
        });
    } else {
        recipesDiv.innerHTML = '<p>No recipes found.</p>';
    }
}

function viewRecipe(id) {
    fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`)
        .then(response => response.json())
        .then(data => {
            const meal = data.meals[0];
            const ingredients = getIngredients(meal);
            const instructions = meal.strInstructions;
            const sourceUrl = meal.strSource;
            const videoUrl = meal.strYoutube; // assuming video URL is in the strYoutube field

            // Display recipe details in a modal or new section
            const recipeDetailsDiv = document.createElement('div');
            recipeDetailsDiv.className = 'recipe-details';
            recipeDetailsDiv.innerHTML = `
                <h3>${meal.strMeal}</h3>
                <p><strong>Origin:</strong> ${meal.strArea}</p>
                <p><strong>Ingredients:</strong></p>
                <pre>${ingredients}</pre>
                <p><strong>Instructions:</strong></p>
                <p>${instructions}</p>
                <a href="${sourceUrl}" target="_blank">Source</a>
                <button onclick="openVideo('${videoUrl}')">Click for Video</button>
                <button onclick="closeRecipeDetails()">Close</button>
            `;

            document.body.appendChild(recipeDetailsDiv);
        })
        .catch(error => console.error('Error fetching data:', error));
}

function getIngredients(meal) {
    let ingredients = '';
    for (let i = 1; i <= 20; i++) {
        if (meal[`strIngredient${i}`]) {
            ingredients += `${meal[`strIngredient${i}`]} - ${meal[`strMeasure${i}`]}\n`;
        } else {
            break;
        }
    }
    return ingredients;
}

function addToFavorites(id) {
    fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`)
        .then(response => response.json())
        .then(data => {
            const meal = data.meals[0];
            const favorites = getFavorites();
            if (!favorites.some(fav => fav.idMeal === meal.idMeal)) {
                favorites.push(meal);
                saveFavorites(favorites);
                alert('Added to favorites!');
            } else {
                alert('Already in favorites!');
            }
        })
        .catch(error => console.error('Error fetching data:', error));
}

function getFavorites() {
    if (fs.existsSync(dataPath)) {
        const data = fs.readFileSync(dataPath);
        return JSON.parse(data);
    }
    return [];
}

function saveFavorites(favorites) {
    fs.writeFileSync(dataPath, JSON.stringify(favorites, null, 2));
}

function navigateToFavorites() {
    window.location.href = 'favorites.html';
}

function navigateToHome() {
    window.location.href = 'index.html';
}

function displayFavorites() {
    const favoritesDiv = document.getElementById('favorites');
    const favorites = getFavorites();
    favoritesDiv.innerHTML = '';

    favorites.forEach(meal => {
        const recipeDiv = document.createElement('div');
        recipeDiv.className = 'recipe';

        recipeDiv.innerHTML = `
            <div>
                <h3>${meal.strMeal}</h3>
                <button onclick="viewRecipe('${meal.idMeal}')">View</button>
            </div>
            <button onclick="removeFromFavorites('${meal.idMeal}')">Remove</button>
        `;

        favoritesDiv.appendChild(recipeDiv);
    });
}

function removeFromFavorites(id) {
    let favorites = getFavorites();
    favorites = favorites.filter(meal => meal.idMeal !== id);
    saveFavorites(favorites);
    displayFavorites();
    alert('Removed from favorites!');
}

function openVideo(url) {
    window.open(url, '_blank');
}

function closeRecipeDetails() {
    const recipeDetailsDiv = document.querySelector('.recipe-details');
    if (recipeDetailsDiv) {
        recipeDetailsDiv.remove();
    }
}

// Ensure the correct page functions are called when loaded
if (window.location.pathname.endsWith('favorites.html')) {
    displayFavorites();
}


