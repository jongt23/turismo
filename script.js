// Script para futuras funcionalidades interactivas

console.log("Página de turismo cargada.");

document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.getElementById('mobile-menu');
    const navList = document.querySelector('.navbar'); // Se cambió a .navbar para que coincida con el CSS

    if (menuToggle && navList) {
        menuToggle.addEventListener('click', () => {
            navList.classList.toggle('active');
            // Opcional: Animación del botón hamburguesa
            menuToggle.classList.toggle('is-active'); 
        });
    }

    // Cargar restaurantes en la página de rutas gastronómicas
    if (document.getElementById('lista-restaurantes')) {
        cargarRestaurantes();
    }
});

async function cargarRestaurantes() {
    try {
        const response = await fetch('restaurantes.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const restaurantes = await response.json();
        mostrarRestaurantes(restaurantes);
    } catch (error) {
        console.error("No se pudieron cargar los restaurantes:", error);
        const listaRestaurantesDiv = document.getElementById('lista-restaurantes');
        if (listaRestaurantesDiv) {
            listaRestaurantesDiv.innerHTML = "<p>Lo sentimos, no se pudieron cargar los restaurantes en este momento.</p>";
        }
    }
}

function mostrarRestaurantes(restaurantes) {
    const listaRestaurantesDiv = document.getElementById('lista-restaurantes');
    if (!listaRestaurantesDiv) return;

    listaRestaurantesDiv.innerHTML = ''; // Limpiar contenido anterior

    restaurantes.forEach(restaurante => {
        const card = document.createElement('div');
        card.classList.add('restaurant-card');

        let fotoHtml = '<img src="images/placeholder.png" alt="Imagen no disponible">'; // Placeholder por defecto
        if (restaurante.foto) {
            fotoHtml = `<img src="${restaurante.foto}" alt="${restaurante.nombre}">`;
        }

        let webHtml = '';
        if (restaurante.web) {
            webHtml = `<p><strong>Web:</strong> <a href="${restaurante.web}" target="_blank">${restaurante.web}</a></p>`;
        }
        
        let telefonoHtml = '';
        if (restaurante.telefono) {
            telefonoHtml = `<p><strong>Teléfono:</strong> ${restaurante.telefono}</p>`;
        }

        card.innerHTML = `
            ${fotoHtml}
            <h3>${restaurante.nombre}</h3>
            <p><strong>Tipo:</strong> ${restaurante.tipo}</p>
            <p><strong>Cocina:</strong> ${restaurante.tipo_cocina || 'No especificada'}</p>
            <p><strong>Dirección:</strong> ${restaurante.direccion}</p>
            <p><strong>Horario:</strong> ${restaurante.horario}</p>
            <p class="price"><strong>Precio:</strong> ${restaurante.precio}</p>
            <p>${restaurante.descripcion}</p>
            ${webHtml}
            ${telefonoHtml}
        `;
        // Podríamos añadir aquí un enlace a un mapa si tenemos coordenadas:
        // if (restaurante.coordenadas && restaurante.coordenadas.latitud && restaurante.coordenadas.longitud) {
        //     card.innerHTML += `<p><a href="https://www.google.com/maps?q=${restaurante.coordenadas.latitud},${restaurante.coordenadas.longitud}" target="_blank">Ver en mapa</a></p>`;
        // }

        listaRestaurantesDiv.appendChild(card);
    });
}

// Crear la carpeta 'images' si no existe (esto es un comentario, no se ejecuta en el navegador)
// y añadir imágenes de ejemplo como 'el_buen_sabor.jpg', 'cafe_del_parque.jpg', 'tapas_y_copas.jpg', 'placeholder.png'
