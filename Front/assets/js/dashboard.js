
// Fonction pour gérer l'authentification
function authenticate(endpoint, userData) {
  return fetch(`${API_URL}/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  })
  .then(response => {
    if (!response.ok) throw new Error('Erreur d\'authentification');
    return response.json();
  })
  .then(data => {
    localStorage.setItem('authToken', data.token);
    return data;
  });
}

// Fonction pour s'inscrire
function signup(username, password) {
  return authenticate('users', { username, password });
}

// Fonction pour se connecter
function login(username, password) {
  return authenticate('login', { username, password });
}

// Fonction pour se déconnecter
function logout() {
  localStorage.removeItem('authToken');
  window.location.href = '../../index.html';
}

// Fonction pour récupérer les recettes
function getRecipes(url = `${API_URL}/recipes`) {
  const token = localStorage.getItem('authToken');
  return fetch(url, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  .then(response => {
    if (!response.ok) throw new Error('Erreur de récupération des recettes');
    return response.json();
  });
}

// Fonction pour créer ou mettre à jour une recette
function saveRecipe(recipeData, id = null) {
  const token = localStorage.getItem('authToken');
  const method = id ? 'PUT' : 'POST';
  const url = id ? `${API_URL}/recipes/${id}` : `${API_URL}/recipes`;

  return fetch(url, {
    method: method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(recipeData)
  })
  .then(response => {
    if (!response.ok) throw new Error('Erreur de sauvegarde de la recette');
    return response.json();
  });
}

// Fonction pour supprimer une recette
function deleteRecipe(id) {
  const token = localStorage.getItem('authToken');
  return fetch(`${API_URL}/recipes/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  })
  .then(response => {
    if (!response.ok) throw new Error('Erreur de suppression de la recette');
    return response.json();
  });
}

// Fonction pour afficher les recettes
function displayRecipes(recipes, container) {
  container.innerHTML = '';
  recipes.forEach(recipe => {
    const recipeElement = document.createElement('div');
    recipeElement.className = 'recipe';
    recipeElement.innerHTML = `
      <h3>${recipe.title}</h3>
      <img src="${recipe.image || '/images/placeholder.jpg'}" alt="${recipe.title}">
      <p>${recipe.description || 'Pas de description disponible.'}</p>
      <p>Catégorie: ${recipe.category}</p>
      <p>Difficulté: ${recipe.difficulty}</p>
      <button onclick="editRecipe('${recipe._id}')">Modifier</button>
      <button onclick="deleteRecipe('${recipe._id}')">Supprimer</button>
    `;
    container.appendChild(recipeElement);
  });
}

// Fonction pour ouvrir le modal d'édition de recette
function openRecipeModal(recipe = null) {
  const modal = document.getElementById('recipeModal');
  const form = document.getElementById('recipeForm');
  form.reset();

  if (recipe) {
    document.getElementById('recipeId').value = recipe._id;
    document.getElementById('title').value = recipe.title;
    document.getElementById('description').value = recipe.description;
    document.getElementById('category').value = recipe.category;
    document.getElementById('difficulty').value = recipe.difficulty;
    document.getElementById('timeprepa').value = recipe.timeprepa;
    document.getElementById('timecooking').value = recipe.timecooking;
    // Remplir les ingrédients et instructions
  }

  modal.style.display = 'block';
}

// Fonction pour fermer le modal
function closeRecipeModal() {
  document.getElementById('recipeModal').style.display = 'none';
}

// Gestionnaire d'événements pour le formulaire de recette
document.getElementById('recipeForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const formData = new FormData(this);
  const recipeData = Object.fromEntries(formData.entries());
  recipeData.ingredients = formData.getAll('ingredients');
  recipeData.instructions = formData.getAll('instructions');

  saveRecipe(recipeData, recipeData.id)
    .then(() => {
      closeRecipeModal();
      getRecipes().then(recipes => displayRecipes(recipes, document.getElementById('recipesContainer')));
    })
    .catch(error => console.error('Erreur:', error));
});

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('authToken');
  if (token) {
    getRecipes().then(recipes => displayRecipes(recipes, document.getElementById('recipesContainer')));
  } else {
    document.getElementById('recipesContainer').innerHTML = '<p>Veuillez vous connecter pour voir les recettes.</p>';
  }

  // Gestionnaire pour le bouton de déconnexion
  document.getElementById('logoutButton').addEventListener('click', logout);
});
// Optionnel : Gestion de la déconnexion
function logout() {
  localStorage.removeItem('token');
  // Rediriger vers la page d'accueil ou rafraîchir la page
  window.location.href = '../../index.html';
}


// Fonction pour récupérer les informations de l'utilisateur
async function getUser() {
  const storedUsername = localStorage.getItem('username');
  if (storedUsername) {
    return { username: storedUsername };
  }

  const token = localStorage.getItem('authToken');
  if (!token) {
    return { username: 'Invité' };
  }

  try {
    const response = await fetch('http://127.0.0.1:3000/recipes/users', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) {
      throw new Error('Réponse réseau non OK');
    }
    const data = await response.json();
    
    if (data.username) {
      localStorage.setItem('username', data.username);
    }
    
    return data;
  } catch (error) {
    console.error('Erreur lors de la récupération des informations utilisateur:', error);
    return { username: 'Utilisateur' };
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const usernameSpan = document.getElementById('username');

  try {
    const user = await getUser();
    if (usernameSpan) {
      usernameSpan.textContent = user.username;
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour du nom d\'utilisateur:', error);
    if (usernameSpan) {
      usernameSpan.textContent = 'Utilisateur';
    }
  }
});
