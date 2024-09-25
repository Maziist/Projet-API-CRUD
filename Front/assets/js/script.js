// Définition de l'URL de l'API
const API_URL = 'http://127.0.0.1:3000/recipes';

// Préchargement de l'image placeholder
const placeholderImage = new Image();
placeholderImage.src = '../images/placeholder.jpg'; // Assurez-vous que ce chemin est correct

// Fonction pour récupérer les recettes
function getRecipes() {
  fetch(API_URL)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      // Traitement des données
    })
    .catch(error => {
      console.error('Erreur lors de la récupération des recettes:', error);
      displayError("Impossible de charger les recettes. Veuillez réessayer plus tard.");
    });
}



// Fonction pour créer un élément de recette
function createRecipeElement(recipe, container) {
    const recipeArticle = document.createElement('article');
    recipeArticle.classList.add('recipe');
    const titleElement = document.createElement('h3');
    titleElement.textContent = recipe.title;
    const descriptionElement = document.createElement('p');
    descriptionElement.textContent = recipe.description || 'Pas de description disponible.';
    const imageElement = document.createElement('img');
    imageElement.alt = recipe.title;
    const defaultImagePath = '/images/placeholder.jpg';
    imageElement.src = recipe.image || defaultImagePath;
    imageElement.onerror = function() {
        console.warn(`Impossible de charger l'image pour la recette : ${recipe.title}`);
        this.src = defaultImagePath;
        this.onerror = function() {
            console.error(`Impossible de charger l'image placeholder pour la recette : ${recipe.title}`);
            this.style.display = 'none';
        };
    };

    recipeArticle.appendChild(titleElement);
    recipeArticle.appendChild(imageElement);
    recipeArticle.appendChild(descriptionElement);
    container.appendChild(recipeArticle);
}

// Fonction pour afficher une erreur
function displayError(message) {
    const recipesContainer = document.getElementById('recipesContainer');
    recipesContainer.innerHTML = `<p class="error">${message}</p>`;
}

// Fonction pour charger les recettes dans la liste d'administration
function loadRecipes() {
    fetch(API_URL)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(recipes => {
            const recipeList = document.getElementById('recipeList');
            recipeList.innerHTML = '';
            recipes.forEach(recipe => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <h3 class="recipe-title" onclick="showFullRecipe('${recipe._id}')">${recipe.title}</h3>
                    <p>Catégorie: ${recipe.category}</p>
                    <button class="edit" onclick="editRecipe('${recipe._id}')">Modifier</button>
                    <button class="delete" onclick="deleteRecipe('${recipe._id}')">Supprimer</button>
                `;
                recipeList.appendChild(li);
            });
        })
        .catch(error => {
            console.error('Error:', error);
            displayError("Impossible de charger les recettes. Veuillez réessayer plus tard.");
        });
}

// Fonction pour éditer une recette
function editRecipe(id) {
  fetch(`${API_URL}/${id}`)
      .then(response => {
          if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
      })
      .then(recipe => {
          openModal();
          document.getElementById('recipeId').value = recipe._id;
          document.getElementById('title').value = recipe.title;
          document.getElementById('timeprepa').value = recipe.timeprepa;
          document.getElementById('timecooking').value = recipe.timecooking;
          document.getElementById('difficulty').value = recipe.difficulty;
          document.getElementById('category').value = recipe.category;
          
          populateList('ingredientsList', recipe.ingredients);
          populateList('instructionsList', recipe.instructions);
      })
      .catch(error => console.error('Error:', error));
}


// Fonction pour supprimer une recette
function deleteRecipe(id) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette recette ?')) {
        fetch(`${API_URL}/${id}`, { method: 'DELETE' })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                showNotification('Recette supprimée avec succès!');
                loadRecipes();
            })
            .catch(error => console.error('Error:', error));
    }
}

// Fonction pour ouvrir et fermer la modale
function openModal() {
    document.getElementById('recipeModal').style.display = 'block';
    document.getElementById('recipeForm').reset();
    document.getElementById('recipeId').value = '';
}

function closeModal() {
    document.getElementById('recipeModal').style.display = 'none';
}

function addLine(listId) {
    const list = document.getElementById(listId);
    const newLine = list.children[0].cloneNode(true);
    newLine.querySelector('input').value = '';  
    if (!newLine.querySelector('.remove-line')) {
        const removeButton = document.createElement('button');
        removeButton.textContent = '-';
        removeButton.type = 'button';
        removeButton.className = 'remove-line';
        removeButton.onclick = function() { removeLine(this); };
        newLine.appendChild(removeButton);
    }
    list.appendChild(newLine);
}

function removeLine(button) {
    const lineToRemove = button.parentElement;
    const list = lineToRemove.parentElement;
    if (list.children.length > 1) {
        list.removeChild(lineToRemove);
    } else {
        showNotification("Vous ne pouvez pas supprimer la dernière ligne.");
    }
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('recipeForm').addEventListener('submit', function(e) {
        e.preventDefault();      
        const formData = new FormData(this);
        const recipeData = {
            title: formData.get('title'),
            ingredients: formData.getAll('ingredients[]').filter(item => item.trim() !== ''),
            instructions: formData.getAll('instructions[]').filter(item => item.trim() !== ''),
            timeprepa: formData.get('timeprepa'),
            timecooking: formData.get('timecooking'),
            difficulty: formData.get('difficulty'),
            category: formData.get('category')
        };
        const imageFile = document.getElementById('image').files[0];
        const recipeId = formData.get('recipeId');
        const method = recipeId ? 'PUT' : 'POST';
        const url = recipeId ? `${API_URL}/${recipeId}` : API_URL;

        sendRecipeWithImage(url, method, recipeData, imageFile)
            .then(() => {
                closeModal();
                loadRecipes();
            })
            .catch(error => {
                console.error('Error:', error);
                showNotification('Erreur lors de la sauvegarde de la recette');
            });
    });

    window.onclick = function(event) {
        if (event.target == document.getElementById('recipeModal')) {
            closeModal();
        }
    }
});

function sendRecipeWithImage(url, method, recipeData, imageFile) {
    if (imageFile) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = function(e) {
                recipeData.image = e.target.result;
                sendRequest(url, method, recipeData).then(resolve).catch(reject);
            };
            reader.onerror = reject;
            reader.readAsDataURL(imageFile);
        });
    } else {
        return sendRequest(url, method, recipeData);
    }
}

function sendRequest(url, method, data) {
    return fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    });
}

function populateList(listId, items) {
    const list = document.getElementById(listId);
    list.innerHTML = '';
    items.forEach(item => {
        const div = document.createElement('div');
        div.className = `${listId === 'ingredientsList' ? 'ingredient' : 'instruction'}-line`;
        div.innerHTML = `
            <input type="text" name="${listId === 'ingredientsList' ? 'ingredients' : 'instructions'}[]" value="${item}" required>
            <button type="button" class="add-line" onclick="addLine('${listId}')">+</button>
            <button type="button" class="remove-line" onclick="removeLine(this)">-</button>
        `;
        list.appendChild(div);
    });
}

// Écouteurs d'événements
document.addEventListener('DOMContentLoaded', () => {
    getRecipes();
    loadRecipes();
});

//Seach-bar
function searchRecipes() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    
    fetch(API_URL)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(recipes => {
            const searchResults = recipes.filter(recipes => 
                recipes.title.toLowerCase().includes(searchTerm) ||
                // recipes.ingredients.some(ingredient => ingredient.toLowerCase().includes(searchTerm)) ||
                recipes.category.toLowerCase().includes(searchTerm) ||
                recipes.difficulty.toLowerCase().includes(searchTerm) ||
                recipes.timeprepa.toLowerCase().includes(searchTerm) 
                // recipes.timecooking.toLowerCase().includes(searchTerm) ||
                // recipes.instructions.some(instruction => instruction.toLowerCase().includes(searchTerm))

            );
            displaySearchResults(searchResults);
        })
        .catch(error => {
            console.error('Error:', error);
            displaySearchResults([]);
        });
}
// Affichage des résultats de la recherche
function displaySearchResults(results) {
    const searchResultsContainer = document.getElementById('searchResults');
    searchResultsContainer.innerHTML = '';
  
    if (results.length === 0) {
      searchResultsContainer.innerHTML = '<p>Aucun résultat trouvé.</p>';
    } else {
      results.forEach(recipe => {
        
        const recipeElement = document.createElement('div');
        recipeElement.className = 'recipe-result';
        recipeElement.innerHTML = `
          <h3>${recipe.title}</h3>
          <p>Catégorie: ${recipe.category || 'Non spécifiée'}</p>
          <p>Difficulté: ${recipe.difficulty || 'Non spécifiée'}</p>
          <p>Temps de préparation: ${recipe.timeprepa || 'Non spécifié'}</p>
        `;
        recipeElement.addEventListener('click', function() {
          fullRecipeDetails(recipe);
        });
        searchResultsContainer.appendChild(recipeElement);
      });
    }
    openSearchModal();
  }
  // Fonction hypothétique pour obtenir les détails complets d'une recette
  function getFullRecipeDetails(recipeId) {
    return fetch(`/api/recipes/${recipeId}`)
      .then(response => response.json())
      .then(data => {
        console.log("Détails complets de la recette:", data);  // Pour le débogage
        return data;
      });
  }
  
  // Ouvrerture du détail de la recette
  function openRecipeDetails(recipe) {
    console.log("Détails de la recette reçus:", recipe);  // Pour le débogage
  
    // Fermer la modal de recherche
    closeSearchModal();
  
    // Créer une nouvelle modal pour les détails de la recette
    const detailModal = document.createElement('div');
    detailModal.className = 'modal';
    detailModal.innerHTML = `
      <div class="modal-content">
        <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
        <h2>${recipe.title || 'Titre non spécifié'}</h2>
        <img src="${recipe.image || '../images/placeholder.jpg'}" alt="${recipe.title || 'Recette'}" style="max-width: 300px;">
        <p><strong>Catégorie:</strong> ${recipe.category || 'Non spécifiée'}</p>
        <p><strong>Difficulté:</strong> ${recipe.difficulty || 'Non spécifiée'}</p>
        <p><strong>Temps de préparation:</strong> ${recipe.timeprepa || 'Non spécifié'}</p>
        <p><strong>Temps de cuisson:</strong> ${recipe.timecooking || 'Non spécifié'}</p>
        <h3>Ingrédients:</h3>
        ${renderIngredients(recipe.ingredients)}
        <h3>Instructions:</h3>
        ${renderInstructions(recipe.instructions)}
      </div>
    `;
  
    // Ajouter la modal à la page
    document.body.appendChild(detailModal);
  
    // Afficher la modal
    detailModal.style.display = 'block';
  }
  
  function renderIngredients(ingredients) {
    if (!ingredients || ingredients.length === 0) {
      return '<p>Ingrédients non spécifiés</p>';
    }
    return `
      <ul>
        ${ingredients.map(ingredient => `<li>${ingredient}</li>`).join('')}
      </ul>
    `;
  }
  
  function renderInstructions(instructions) {
    if (!instructions || instructions.length === 0) {
      return '<p>Instructions non spécifiées</p>';
    }
    return `
      <ol>
        ${instructions.map(instruction => `<li>${instruction}</li>`).join('')}
      </ol>
    `;
  }
  
function openSearchModal() {
    document.getElementById('searchResultModal').style.display = 'block';
}

function closeSearchModal() {
    document.getElementById('searchResultModal').style.display = 'none';
}

// Event listeners pour le formulaire de recherche
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');

    searchInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            searchRecipes();
        }
    });

    searchButton.addEventListener('click', searchRecipes);
});
// Affichage complet des recettes
function showFullRecipe(id) {
    fetch(`${API_URL}/${id}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(recipe => {
            const content = document.getElementById('fullRecipeContent');
            content.innerHTML = `
                <h2>${recipe.title}</h2>
                <img src="${recipe.image || '../images/placeholder.jpg'}" alt="${recipe.title}" style="max-width: 300px;">
                <p><strong>Catégorie:</strong> ${recipe.category}</p>
                <p><strong>Difficulté:</strong> ${recipe.difficulty}</p>
                <p><strong>Temps de préparation:</strong> ${recipe.timeprepa}</p>
                <p><strong>Temps de cuisson:</strong> ${recipe.timecooking}</p>
                <h3>Ingrédients:</h3>
                <ul>
                    ${recipe.ingredients.map(ingredient => `<li>${ingredient}</li>`).join('')}
                </ul>
                <h3>Instructions:</h3>
                <ol>
                    ${recipe.instructions.map(instruction => `<li>${instruction}</li>`).join('')}
                </ol>
            `;
            openFullRecipeModal();
        })
        .catch(error => console.error('Error:', error));
}

function openFullRecipeModal() {
    document.getElementById('fullRecipeModal').style.display = 'block';
}

function closeFullRecipeModal() {
    document.getElementById('fullRecipeModal').style.display = 'none';
}
function fullRecipeDetails(recipe) {
    console.log("Affichage des détails complets de la recette:", recipe);
  
    const content = document.getElementById('fullRecipeContent');
    console.log(recipe);
    
    content.innerHTML = `
      <h2>${recipe.title}</h2>
      <img src="${recipe.image || '../images/placeholder.jpg'}" alt="${recipe.title}" style="max-width: 300px;">
      <p><strong>Catégorie:</strong> ${recipe.category || 'Non spécifiée'}</p>
      <p><strong>Difficulté:</strong> ${recipe.difficulty || 'Non spécifiée'}</p>
      <p><strong>Temps de préparation:</strong> ${recipe.timeprepa || 'Non spécifié'}</p>
      <p><strong>Temps de cuisson:</strong> ${recipe.timecooking || 'Non spécifié'}</p>
      <h3>Ingrédients:</h3>
      <ul>
        ${Array.isArray(recipe.ingredients) ? recipe.ingredients.map(ingredient => `<li>${ingredient}</li>`).join('') : '<li>Non spécifiés</li>'}
      </ul>
      <h3>Instructions:</h3>
      <ol>
        ${Array.isArray(recipe.instructions) ? recipe.instructions.map(instruction => `<li>${instruction}</li>`).join('') : '<li>Non spécifiées</li>'}
      </ol>
    `;
  
    // Assurez-vous que l'élément avec l'ID 'fullRecipeContent' existe dans votre HTML
    const fullRecipeModal = document.getElementById('fullRecipeModal');
    if (fullRecipeModal) {
      fullRecipeModal.style.display = 'block';
    } else {
      console.error("L'élément 'fullRecipeModal' n'a pas été trouvé dans le DOM");
    }
  }
  
  //Notification
  function showNotification(message, type = 'info') {
    // Créer un élément de notification
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.classList.add('fixed', 'top-4', 'right-4', 'p-4', 'rounded', 'text-white', 'z-50');

    // Ajouter une classe basée sur le type de notification
    if (type === 'success') {
        notification.classList.add('bg-green-500');
    } else if (type === 'error') {
        notification.classList.add('bg-red-500');
    } else {
        notification.classList.add('bg-blue-500');
    }

    // Ajouter la notification au body
    document.body.appendChild(notification);

    // Supprimer la notification après 3 secondes
    setTimeout(() => {
        notification.remove();
    }, 3000);
}
  // Inscription Connexion
  function openModalIC(modalId) {
    document.getElementById(modalId).style.display = "block";
}

function closeModalIC(modalId) {
    document.getElementById(modalId).style.display = "none";
}

function switchModal(closeModalId, openModalId) {
    closeModalIC(closeModalId);
    setTimeout(() => openModalIC(openModalId), 300); // 300ms delay
}

window.onclick = function(event) {
    if (event.target.className === 'modalIC') {
        event.target.style.display = "none";
    }
}

  
  // Gestion du formulaire d'inscription
  document.getElementById('inscriptionForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const username = this.username.value;
    const password = this.password.value;
    
    fetch('http://127.0.0.1:3000/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log('Success:', data);
      showNotification('Inscription réussie !');
      closeModal('inscriptionModal');
      this.reset(); // Réinitialise le formulaire
    })
    .catch((error) => {
      console.error('Error:', error);
      showNotification('Erreur lors de l\'inscription: ' + error.message);
    });
  });
  
  
  // Gestion du formulaire de connexion
  document.getElementById('connexionForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const username = this.username.value;
    const password = this.password.value;
    
    fetch('http://127.0.0.1:3000/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    })
    .then(response => response.json())
    .then(data => {
      console.log('Success:', data);
      if (data.token) {
        localStorage.setItem('token', data.token);
        showNotification('Connexion réussie !');
        closeModal('connexionModal');
        this.reset(); 
       
        window.location.href ='../../pages/dashboard.html';
      } else {
        showNotification(data.message || 'Erreur de connexion');
      }
    })
    .catch((error) => {
      console.error('Error:', error);
      showNotification('Erreur de connexion');
    });
  });
  
  // Fermeture des modals en cliquant en dehors
  window.onclick = function(event) {
    if (event.target.className === 'modal') {
      event.target.style.display = "none";
    }
  }
  
  