// Script para futuras funcionalidades interactivas

console.log("Página de turismo cargada.");

let todosLosRestaurantes = [];
let currentLang = 'es'; // Default language
let langData = {};

document.addEventListener('DOMContentLoaded', () => {
    // Initialize language and then load content
    initLanguageSelector();
    setLanguage(getPreferredLanguage());

    // Código existente para el menú hamburguesa
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
        cargarYPrepararRestaurantes();
    }
});

function getPreferredLanguage() {
    const savedLang = localStorage.getItem('preferredLang');
    if (savedLang) {
        return savedLang;
    }
    // Fallback a idioma del navegador o por defecto
    const browserLang = navigator.language.split('-')[0];
    if (['es', 'en', 'fr'].includes(browserLang)) {
        return browserLang;
    }
    return 'es'; // Idioma por defecto
}

async function setLanguage(lang) {
    if (!['es', 'en', 'fr'].includes(lang)) {
        console.error("Unsupported language:", lang);
        return;
    }
    currentLang = lang;
    document.documentElement.lang = currentLang; // Update HTML lang attribute
    localStorage.setItem('preferredLang', lang);
    try {
        const response = await fetch(`lang/${currentLang}.json`);
        if (!response.ok) {
            throw new Error(`Error al cargar el archivo de idioma: ${response.statusText}`);
        }
        langData = await response.json();
        updateUIText();
        updateActiveLangButton();

        // Recargar contenido específico del restaurante si estamos en la página de rutas gastronómicas
        if (document.getElementById('lista-restaurantes')) {
            // Necesitamos re-filtrar y mostrar restaurantes con el nuevo idioma
            if (todosLosRestaurantes.length > 0) {
                popularFiltros(); // Repoblar filtros con texto traducido
                aplicarFiltros(); // Re-aplicar filtros que también volverán a mostrar restaurantes
            } else {
                cargarYPrepararRestaurantes(); // Si los restaurantes no se han cargado aún
            }
        }
    } catch (error) {
        console.error("Error loading language data:", error);
    }
}

function updateUIText() {
    document.querySelectorAll('[data-lang-key]').forEach(element => {
        const key = element.getAttribute('data-lang-key');
        if (langData[key]) {
            if (element.tagName === 'INPUT' && element.type === 'submit') {
                element.value = langData[key];
            } else if (element.tagName === 'OPTION' && element.value === '') { // For "All" option in selects
                 element.textContent = langData[key];
            }
            else {
                element.textContent = langData[key];
            }
        }
    });
    // Update page title using a key from the body's data attribute
    const pageTitleKey = document.body.getAttribute('data-page-title-key');
    if (pageTitleKey && langData[pageTitleKey]) {
        document.title = langData[pageTitleKey];
    }
     // Actualizar título del encabezado - asumiendo que es el primer H1 en el encabezado
    const headerTitle = document.querySelector('header h1');
    if (headerTitle && langData.site_title) { // Asumiendo 'site_title' es la clave para el encabezado principal
        headerTitle.textContent = langData.site_title;
    }
}

function initLanguageSelector() {
    const langButtons = document.querySelectorAll('.language-selector button');
    langButtons.forEach(button => {
        button.addEventListener('click', () => {
            const lang = button.getAttribute('data-lang');
            setLanguage(lang);
        });
    });
}

function updateActiveLangButton() {
    const langButtons = document.querySelectorAll('.language-selector button');
    langButtons.forEach(button => {
        if (button.getAttribute('data-lang') === currentLang) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
}


async function cargarYPrepararRestaurantes() {
    try {
        const response = await fetch('restaurantes.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        todosLosRestaurantes = await response.json();
        popularFiltros();
        mostrarRestaurantes(todosLosRestaurantes); // Mostrar todos inicialmente

        // Añadir event listeners a los filtros
        document.getElementById('filtro-tipo').addEventListener('change', aplicarFiltros);
        document.getElementById('filtro-cocina').addEventListener('change', aplicarFiltros);
    } catch (error) {
        console.error("Error al cargar los restaurantes:", error);
        const listaRestaurantes = document.getElementById('lista-restaurantes');
        if (listaRestaurantes) {
            listaRestaurantes.innerHTML = '<p>Error al cargar datos. Por favor, intente más tarde.</p>';
        }
    }
}

function mostrarRestaurantes(restaurantes) {
    const listaRestaurantes = document.getElementById('lista-restaurantes');
    if (!listaRestaurantes) return;
    listaRestaurantes.innerHTML = ''; // Limpiar lista actual

    if (restaurantes.length === 0) {
        listaRestaurantes.innerHTML = `<p>${langData.no_results_found || 'No se encontraron restaurantes que coincidan con su búsqueda.'}</p>`;
        return;
    }

    restaurantes.forEach(r => {
        const card = document.createElement('div');
        card.className = 'card-restaurante';
        card.innerHTML = `
            <img src="${r.foto_path || 'img/default.jpg'}" alt="${r.nombre[currentLang]}">
            <h3>${r.nombre[currentLang]}</h3>
            <p><strong>${langData.card_label_type || 'Tipo'}:</strong> ${r.tipo[currentLang]}</p>
            <p><strong>${langData.card_label_cuisine || 'Cocina'}:</strong> ${r.tipo_cocina[currentLang]}</p>
            <p><strong>${langData.card_label_address || 'Dirección'}:</strong> ${r.direccion}</p>
            <p><strong>${langData.card_label_hours || 'Horario'}:</strong> ${r.horario}</p>
            <p><strong>${langData.card_label_price || 'Precio'}:</strong> ${r.precio_rango}</p>
            <p>${r.descripcion[currentLang]}</p>
            ${r.sitio_web ? `<a href="${r.sitio_web}" target="_blank">${langData.card_link_website || 'Sitio Web'}</a>` : ''}
            ${r.telefono ? `<p><strong>${langData.card_label_phone || 'Teléfono'}:</strong> ${r.telefono}</p>` : ''}
        `;
        listaRestaurantes.appendChild(card);
    });
}

function popularFiltros() {
    const filtroTipo = document.getElementById('filtro-tipo');
    const filtroCocina = document.getElementById('filtro-cocina');

    if (!filtroTipo || !filtroCocina || todosLosRestaurantes.length === 0) return;

    const tipos = new Set();
    const cocinas = new Set();

    todosLosRestaurantes.forEach(r => {
        tipos.add(r.tipo[currentLang]); // Usar idioma actual para opciones de filtro
        cocinas.add(r.tipo_cocina[currentLang]); // Usar idioma actual para opciones de filtro
    });

    // Guardar valor seleccionado antes de limpiar
    const selectedTipo = filtroTipo.value;
    const selectedCocina = filtroCocina.value;

    // Limpiar opciones existentes (excepto la primera "Todos")
    filtroTipo.innerHTML = `<option value="">${langData.filter_all || 'Todos'}</option>`;
    filtroCocina.innerHTML = `<option value="">${langData.filter_all || 'Todos'}</option>`;

    tipos.forEach(tipo => {
        if (tipo) { // Asegurarse de que el tipo no sea undefined o null
            const option = document.createElement('option');
            option.value = tipo; // Almacenar el valor traducido para filtrado
            option.textContent = tipo;
            filtroTipo.appendChild(option);
        }
    });

    cocinas.forEach(cocina => {
        if (cocina) { // Asegurarse de que la cocina no sea undefined o null
            const option = document.createElement('option');
            option.value = cocina; // Almacenar el valor traducido para filtrado
            option.textContent = cocina;
            filtroCocina.appendChild(option);
        }
    });
    
    // Restaurar valor seleccionado si es posible
    if (Array.from(filtroTipo.options).some(opt => opt.value === selectedTipo)) {
        filtroTipo.value = selectedTipo;
    }
    if (Array.from(filtroCocina.options).some(opt => opt.value === selectedCocina)) {
        filtroCocina.value = selectedCocina;
    }
}

function aplicarFiltros() {
    const tipoSeleccionado = document.getElementById('filtro-tipo').value;
    const cocinaSeleccionada = document.getElementById('filtro-cocina').value;

    const restaurantesFiltrados = todosLosRestaurantes.filter(r => {
        const matchTipo = tipoSeleccionado ? r.tipo[currentLang] === tipoSeleccionado : true;
        const matchCocina = cocinaSeleccionada ? r.tipo_cocina[currentLang] === cocinaSeleccionada : true;
        return matchTipo && matchCocina;
    });

    mostrarRestaurantes(restaurantesFiltrados);
}

// Crear la carpeta 'images' si no existe (esto es un comentario, no se ejecuta en el navegador)
// y añadir imágenes de ejemplo como 'el_buen_sabor.jpg', 'cafe_del_parque.jpg', 'tapas_y_copas.jpg', 'placeholder.png'
