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
    document.querySelector('.carousel-container').style.transform = `translateX(${newTransformValue}px)`; // Solucionado el template literal
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

    // Comprobar si es un stream m3u8
    if (Hls.isSupported() && streamUrl.endsWith('.m3u8')) {
        // Usar HLS.js para cargar el stream m3u8
        const hls = new Hls();
        
        // Manejo de la carga del stream
        hls.on(Hls.Events.MANIFEST_PARSED, function() {
            player.play(); // Comienza la reproducción solo después de que el manifiesto haya sido cargado
        });

        // Manejo de eventos de error
        hls.on(Hls.Events.ERROR, function(event, data) {
            console.error('Error de HLS.js:', data);
            alert('Error al cargar el stream de la emisora.');
        });

        // Cargar el stream m3u8
        hls.loadSource(streamUrl);
        hls.attachMedia(player); // Vincula el reproductor con el stream de HLS

        // Reinicia el reproductor cada vez que una nueva emisora es cargada
        player.load();
    } else {
        // Para otros formatos (como mp3), se usa el reproductor estándar HTML5
        source.src = streamUrl;
        player.load();
        player.play().catch((error) => {
            console.error("Error al intentar reproducir:", error);
            alert("Error al intentar reproducir el archivo de audio.");
        });
    }

    // Lista de radios en favoritos almacenada en localStorage
    const favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];

    // Actualizar el estado del botón de favoritos
    const botonFavoritos = document.querySelector('.btn-favoritos');
    if (favoritos.includes(streamUrl)) {
        botonFavoritos.classList.add('favorito'); // Aplica el color verde
    } else {
        botonFavoritos.classList.remove('favorito'); // Vuelve al color rojo
    }

    // Asignar el evento de clic para agregar o eliminar de favoritos
    botonFavoritos.onclick = function () {
        if (favoritos.includes(streamUrl)) {
            // Eliminar de favoritos
            favoritos.splice(favoritos.indexOf(streamUrl), 1);
            botonFavoritos.classList.remove('favorito');
        } else {
            // Agregar a favoritos
            favoritos.push(streamUrl);
            botonFavoritos.classList.add('favorito');
        }
        // Guardar la lista de favoritos en localStorage
        localStorage.setItem('favoritos', JSON.stringify(favoritos));
    };
}

// Función para filtrar emisoras
function filtrarEmisoras() {
    const inputSearch = document.getElementById('input-search').value.trim().toLowerCase(); // Aseguramos que el texto de búsqueda no tenga espacios y esté en minúsculas
    const emisoras = document.querySelectorAll('.carousel-item'); // Seleccionamos todos los elementos con la clase .carousel-item
    
    emisoras.forEach(emisora => {
        const onclickAttribute = emisora.querySelector('a') ? emisora.querySelector('a').getAttribute('onclick') : ''; // Asegurarnos de que el atributo existe
        
        // Usar una expresión regular para extraer el nombre de la emisora del onclick
        const match = onclickAttribute.match(/'([^']+)',\s*'([^']+)',\s*'([^']+)'/); // Mejorada para capturar correctamente el nombre
        
        if (match) {
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

// Carrusel - funcionalidad de arrastrar (drag)
const carousel = document.querySelector('.carousel');
let isDragging = false;
let startX, scrollLeft;

carousel.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.pageX - carousel.offsetLeft;
    scrollLeft = carousel.scrollLeft;
});

carousel.addEventListener('mouseleave', () => {
    isDragging = false;
});

carousel.addEventListener('mouseup', () => {
    isDragging = false;
});

carousel.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - carousel.offsetLeft;
    const walk = (x - startX) * 3; // Desplazamiento de 3x
    carousel.scrollLeft = scrollLeft - walk;
});

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

// Lista de radios en favoritos almacenada en localStorage
const favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];

// Función para cambiar la radio
function cambiarRadio(streamUrl, logoUrl, radioName) {
    // Actualiza la información del reproductor
    document.getElementById('radio-logo').src = logoUrl; // Cambia la imagen del reproductor
    document.getElementById('titulo-cancion').textContent = radioName; // Cambia el nombre de la radio

    // Obtén el reproductor de audio
    const reproductor = document.getElementById('reproductor');

    // Si es un stream en formato m3u8, usamos HLS.js
    if (Hls.isSupported() && streamUrl.endsWith('.m3u8')) {
        // Usar HLS.js para cargar el stream m3u8
        const hls = new Hls();
        
        // Manejo de la carga del stream
        hls.on(Hls.Events.MANIFEST_PARSED, function() {
            reproductor.play(); // Comienza la reproducción solo después de que el manifiesto haya sido cargado
        });

        // Manejo de eventos de error
        hls.on(Hls.Events.ERROR, function(event, data) {
            console.error('Error de HLS.js:', data);
            alert('Error al cargar el stream de la emisora.');
        });

        // Cargar el stream m3u8
        hls.loadSource(streamUrl);
        hls.attachMedia(reproductor); // Vincula el reproductor con el stream de HLS

        // Reinicia el reproductor cada vez que una nueva emisora es cargada
        reproductor.load();
    } else {
        // Para otros formatos (como mp3), se usa el reproductor estándar HTML5
        reproductor.src = streamUrl;
        reproductor.load();
        reproductor.play().catch((error) => {
            console.error("Error al intentar reproducir:", error);
            alert("Error al intentar reproducir el archivo de audio.");
        });
    }

    // Lista de radios en favoritos almacenada en localStorage
    const favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];

    // Actualizar el estado del botón de favoritos
    const botonFavoritos = document.querySelector('.btn-favoritos');
    if (favoritos.includes(streamUrl)) {
        botonFavoritos.classList.add('favorito'); // Aplica el color verde
    } else {
        botonFavoritos.classList.remove('favorito'); // Vuelve al color rojo
    }

    // Asignar el evento de clic para agregar o eliminar de favoritos
    botonFavoritos.onclick = function () {
        if (favoritos.includes(streamUrl)) {
            // Eliminar de favoritos
            favoritos.splice(favoritos.indexOf(streamUrl), 1);
            botonFavoritos.classList.remove('favorito');
        } else {
            // Agregar a favoritos
            favoritos.push(streamUrl);
            botonFavoritos.classList.add('favorito');
        }
        // Guardar la lista de favoritos en localStorage
        localStorage.setItem('favoritos', JSON.stringify(favoritos));
    };
}
