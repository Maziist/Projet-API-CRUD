const carousel = document.querySelector('.carousel');
const slides = document.querySelectorAll('.slide');

// Duplique les slides pour donner l'effet de continuité
carousel.innerHTML += carousel.innerHTML;

let currentIndex = 0;
const slideWidth = slides[0].offsetWidth; // Largeur d'une slide
const totalSlides = slides.length;

// Fonction de défilement
function moveCarousel() {
    currentIndex++;

    // Applique la translation
    carousel.style.transform = `translateX(-${currentIndex * slideWidth}px)`;

    // Réinitialise la position du carrousel pour l'effet "infini"
    if (currentIndex >= totalSlides / 2) {
        setTimeout(() => {
            carousel.style.transition = 'none'; // Désactive la transition
            currentIndex = 0; // Remet à zéro
            carousel.style.transform = `translateX(0)`; // Retourne au début
        }, 500); // Temps de la transition avant le "reset"
    } else {
        carousel.style.transition = 'transform 0.5s linear'; // Transition fluide
    }
}

// Démarre le carrousel toutes les 2 secondes
setInterval(moveCarousel, 2000);
