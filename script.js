// Variables globales para gestionar el carrusel y el reproductor
let slideIndex = 0;
const carouselItems = document.querySelectorAll('.carousel-item');
const totalSlides = carouselItems.length;
const searchInput = document.getElementById('search-input');
const searchResults = document.getElementById('search-results');

// Función para mover las imágenes del carrusel
function moveSlide(step) {
    slideIndex += step;
    if (slideIndex < 0) {
        slideIndex = totalSlides - 1; // Vuelve al final si está en el primer elemento
    } else if (slideIndex >= totalSlides) {
        slideIndex = 0; // Vuelve al principio si está en el último elemento
    }
    updateCarouselPosition();
}

function updateCarouselPosition() {
    const newTransformValue = -slideIndex * (carouselItems[0].offsetWidth + 10); // Ajuste por el margen
    document.querySelector('.carousel-container').style.transform = `translateX(${newTransformValue}px)`;
}

// Función para cambiar la emisora en el reproductor
function cambiarRadio(streamUrl, logoUrl, radioName) {
    const player = document.getElementById('reproductor');
    const source = document.getElementById('radio-source');
    const logo = document.getElementById('radio-logo');
    const title = document.getElementById('titulo-cancion');
    const artist = document.getElementById('artista-cancion');

    // Cambiar el logo y nombre de la radio
    logo.src = logoUrl;
    title.textContent = radioName;
    artist.textContent = 'No disponible';

    // Detener y ocultar el reproductor actual si está en reproducción
    if (!player.paused) {
        player.pause();
        player.currentTime = 0; // Reiniciar el reproductor de audio
    }

    // Cambiar la fuente del reproductor
    source.src = streamUrl;
    player.load();
    player.play();
}

function filtrarEmisoras() {
    const inputSearch = document.getElementById('input-search').value.trim().toLowerCase(); // Aseguramos que el texto de búsqueda no tenga espacios y esté en minúsculas
    const emisoras = document.querySelectorAll('.carousel-item'); // Seleccionamos todos los elementos con la clase .carousel-item
    
    emisoras.forEach(emisora => {
        // Obtener el atributo onclick del enlace dentro del .carousel-item
        const onclickAttribute = emisora.querySelector('a').getAttribute('onclick');
        
        // Usar una expresión regular para extraer el nombre de la emisora del onclick
        const match = onclickAttribute.match(/'([^']+)',\s*'([^']+)',\s*'([^']+)'/); // Mejorada para capturar correctamente el nombre
        
        if (match) {
            // El tercer grupo de la expresión regular es el nombre de la emisora
            const nombreEmisora = match[3].trim().toLowerCase(); // Limpiamos espacios y convertimos a minúsculas
            
            // Verificamos si el nombre de la emisora incluye el texto de búsqueda
            if (nombreEmisora.includes(inputSearch)) {
                emisora.style.display = ''; // Mostrar el item si el nombre contiene el texto de búsqueda
            } else {
                emisora.style.display = 'none'; // Ocultar el item si no contiene el texto de búsqueda
            }
        }
    });
}


const carousel = document.querySelector('.carousel');
let isDragging = false;
let startX, scrollLeft;

// Inicia el evento táctil
carousel.addEventListener('touchstart', (e) => {
    isDragging = true;
    startX = e.touches[0].pageX - carousel.offsetLeft;
    scrollLeft = carousel.scrollLeft;
});

// Maneja el movimiento táctil
carousel.addEventListener('touchmove', (e) => {
    if (!isDragging) return; // Solo se ejecuta si estás arrastrando
    e.preventDefault(); // Evita el comportamiento predeterminado
    const x = e.touches[0].pageX - carousel.offsetLeft;
    const walk = (x - startX) * 2; // Ajusta la sensibilidad
    carousel.scrollLeft = scrollLeft - walk;
});

// Finaliza el evento táctil
carousel.addEventListener('touchend', () => {
    isDragging = false;
});

