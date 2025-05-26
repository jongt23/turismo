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
    if (document.getElementById('restaurantes-lista')) { // ID CORREGIDO
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
        if (document.getElementById('restaurantes-lista')) { // ID CORREGIDO
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
            } else {
                element.textContent = langData[key];
            }
        }
    });

    document.querySelectorAll('[data-lang-placeholder-key]').forEach(element => {
        const key = element.getAttribute('data-lang-placeholder-key');
        if (langData[key]) {
            element.placeholder = langData[key];
        }
    });

    // Update page title using a key from the body's data attribute
    const pageTitleKey = document.body.getAttribute('data-page-title-key');
    if (pageTitleKey && langData[pageTitleKey]) {
        document.title = langData[pageTitleKey];
    }
     // Actualizar título del encabezado - asumiendo que es el primer H1 en el encabezado
    const headerTitle = document.querySelector('header h1');
    if (headerTitle && langData.siteTitle) { // CORREGIDO: site_title a siteTitle
        headerTitle.textContent = langData.siteTitle;
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
            button.classList.add('active-lang'); // Corrected class name
        } else {
            button.classList.remove('active-lang'); // Corrected class name
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
        document.getElementById('filtro-tipo-lugar').addEventListener('change', aplicarFiltros); // ID CORREGIDO
        document.getElementById('filtro-tipo-cocina').addEventListener('change', aplicarFiltros); // ID CORREGIDO
        document.getElementById('filtro-nombre').addEventListener('input', aplicarFiltros); // NUEVO listener para búsqueda por nombre
    } catch (error) {
        console.error("Error al cargar los restaurantes:", error);
        const listaRestaurantes = document.getElementById('restaurantes-lista'); // ID CORREGIDO
        if (listaRestaurantes) {
            listaRestaurantes.innerHTML = `<p>${langData.loadError || 'Error al cargar datos. Por favor, intente más tarde.'}</p>`;
        }
    }
}

function mostrarRestaurantes(restaurantes) {
    const listaRestaurantes = document.getElementById('restaurantes-lista'); // ID CORREGIDO
    if (!listaRestaurantes) return;
    listaRestaurantes.innerHTML = ''; // Limpiar lista actual

    if (restaurantes.length === 0) {
        listaRestaurantes.innerHTML = `<p>${langData.no_results_found || 'No se encontraron restaurantes que coincidan con su búsqueda.'}</p>`;
        return;
    }

    restaurantes.forEach(r => {
        const card = document.createElement('div');
        card.className = 'card-restaurante';
        
        let mapaLink = '';
        if (r.coordenadas && r.coordenadas.lat && r.coordenadas.lon) {
            mapaLink = `<a href="https://www.google.com/maps/search/?api=1&query=${r.coordenadas.lat},${r.coordenadas.lon}" target="_blank" class="card-link map-link" data-lang-key="viewOnMap">${langData.viewOnMap || 'Ver en Mapa'}</a>`;
        }

        // Nueva estructura interna de la tarjeta
        card.innerHTML = `
            <img src="${r.foto || 'img/default.jpg'}" alt="${r.nombre[currentLang]}">
            <div class="card-content">
                <h3>${r.nombre[currentLang]}</h3>
                <p class="card-description">${r.descripcion[currentLang]}</p>
                <div class="card-details">
                    <p><strong>${langData.cardType || 'Tipo'}:</strong> ${r.tipo[currentLang]}</p>
                    <p><strong>${langData.cardCuisine || 'Cocina'}:</strong> ${r.tipo_cocina[currentLang]}</p>
                    <p><strong>${langData.cardAddress || 'Dirección'}:</strong> ${r.direccion}</p>
                    <p><strong>${langData.cardHours || 'Horario'}:</strong> ${r.horario}</p>
                    ${r.precio_rango ? `<p><strong>${langData.cardPrice || 'Precio'}:</strong> ${r.precio_rango}</p>` : ''}
                    ${r.telefono ? `<p><strong>${langData.cardPhone || 'Teléfono'}:</strong> ${r.telefono}</p>` : ''}
                </div>
                <div class="card-links">
                    ${r.sitio_web ? `<a href="${r.sitio_web}" target="_blank" class="card-link website">${langData.cardWeb || 'Sitio Web'}</a>` : ''}
                    ${mapaLink}
                </div>
            </div>
        `;
        listaRestaurantes.appendChild(card);
    });
}

function popularFiltros() {
    const filtroTipoLugar = document.getElementById('filtro-tipo-lugar'); // ID CORREGIDO
    const filtroTipoCocina = document.getElementById('filtro-tipo-cocina'); // ID CORREGIDO

    if (!filtroTipoLugar || !filtroTipoCocina || todosLosRestaurantes.length === 0) return;

    const tipos = new Set();
    const cocinas = new Set();

    todosLosRestaurantes.forEach(r => {
        tipos.add(r.tipo[currentLang]);
        cocinas.add(r.tipo_cocina[currentLang]);
    });

    const selectedTipo = filtroTipoLugar.value;
    const selectedCocina = filtroTipoCocina.value;

    filtroTipoLugar.innerHTML = `<option value="" data-lang-key="filterAll">${langData.filterAll || 'Todos'}</option>`;
    filtroTipoCocina.innerHTML = `<option value="" data-lang-key="filterAll">${langData.filterAll || 'Todos'}</option>`;

    tipos.forEach(tipo => {
        if (tipo) {
            const option = document.createElement('option');
            option.value = tipo;
            option.textContent = tipo;
            filtroTipoLugar.appendChild(option);
        }
    });

    cocinas.forEach(cocina => {
        if (cocina) {
            const option = document.createElement('option');
            option.value = cocina;
            option.textContent = cocina;
            filtroTipoCocina.appendChild(option);
        }
    });
    
    if (Array.from(filtroTipoLugar.options).some(opt => opt.value === selectedTipo)) {
        filtroTipoLugar.value = selectedTipo;
    }
    if (Array.from(filtroTipoCocina.options).some(opt => opt.value === selectedCocina)) {
        filtroTipoCocina.value = selectedCocina;
    }
    // Re-translate static options like "All"
    updateUIText(); 
}

function aplicarFiltros() {
    const tipoSeleccionado = document.getElementById('filtro-tipo-lugar').value; // ID CORREGIDO
    const cocinaSeleccionada = document.getElementById('filtro-tipo-cocina').value; // ID CORREGIDO
    const nombreQuery = document.getElementById('filtro-nombre').value.toLowerCase(); // NUEVO para búsqueda por nombre

    const restaurantesFiltrados = todosLosRestaurantes.filter(r => {
        const matchTipo = tipoSeleccionado ? r.tipo[currentLang] === tipoSeleccionado : true;
        const matchCocina = cocinaSeleccionada ? r.tipo_cocina[currentLang] === cocinaSeleccionada : true;
        const matchNombre = nombreQuery ? r.nombre[currentLang].toLowerCase().includes(nombreQuery) : true; // NUEVO para búsqueda por nombre
        return matchTipo && matchCocina && matchNombre;
    });

    mostrarRestaurantes(restaurantesFiltrados);
}

// Crear la carpeta 'images' si no existe (esto es un comentario, no se ejecuta en el navegador)
// y añadir imágenes de ejemplo como 'el_buen_sabor.jpg', 'cafe_del_parque.jpg', 'tapas_y_copas.jpg', 'placeholder.png'
