document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const countryName = document.getElementById('country-name');
    const fullName = document.getElementById('full-name');
    const language = document.getElementById('language');
    const demonym = document.getElementById('demonym');
    const subregion = document.getElementById('subregion');
    const apiStatus = document.getElementById('api-status');
    const dataStatus = document.getElementById('data-status');
    const updateTime = document.getElementById('update-time');
    
    // URL exacta de la API proporcionada
    const apiUrl = 'https://restcountries.com/v3.1/alpha?codes=NLD,COL,BRA,CHN&fields=name,languages,demonyms,subregion';
    
    // Función para actualizar la hora
    function updateTimestamp() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        updateTime.textContent = `Última actualización: ${timeString}`;
    }
    
    // Función para mostrar estado
    function updateStatus(element, text, type) {
        element.textContent = text;
        element.className = 'status-value ' + type;
    }
    
    // Actualizar estado inicial
    updateStatus(apiStatus, 'Conectando...', 'loading');
    updateStatus(dataStatus, 'Esperando datos', 'loading');
    updateTimestamp();
    
    // Función para extraer y mostrar datos de Países Bajos
    function displayNetherlandsData(netherlands) {
        // 1. Nombre común
        countryName.textContent = netherlands.name.common;
        countryName.classList.add('data-loaded');
        
        // 2. Nombre oficial
        fullName.textContent = netherlands.name.official;
        fullName.classList.add('data-loaded');
        
        // 3. Idioma(s) - languages es un objeto
        const languages = Object.values(netherlands.languages);
        language.textContent = languages.join(', ');
        language.classList.add('data-loaded');
        
        // 4. Gentilicio - demonyms es un objeto anidado
        const demonymValue = netherlands.demonyms?.eng?.m || 
                            netherlands.demonyms?.eng?.f || 
                            'No disponible';
        demonym.textContent = demonymValue;
        demonym.classList.add('data-loaded');
        
        // 5. Subregión
        subregion.textContent = netherlands.subregion || 'No disponible';
        subregion.classList.add('data-loaded');
        
        // Actualizar estados
        updateStatus(dataStatus, 'Datos cargados', 'success');
        
        // Actualizar título de la página
        document.title = `${netherlands.name.common} - Información del país`;
    }
    
    // Consumir la API REST Countries con la URL exacta proporcionada
    fetch(apiUrl)
        .then(response => {
            // Actualizar estado de la API
            if (response.ok) {
                updateStatus(apiStatus, 'Conexión exitosa', 'success');
            } else {
                updateStatus(apiStatus, `Error ${response.status}`, 'error');
            }
            return response.json();
        })
        .then(data => {
            // El endpoint devuelve varios países.
            // Filtramos solo Países Bajos (NLD)
            const netherlands = data.find(
                country => country.name.common === 'Netherlands' || 
                          country.name.common === 'Países Bajos'
            );
            
            if (netherlands) {
                // Mostrar los datos de Países Bajos
                displayNetherlandsData(netherlands);
                
                // Mostrar también información sobre los otros países recibidos
                console.log('Países recibidos de la API:', data.map(c => c.name.common));
                console.log('Datos completos de Países Bajos:', netherlands);
            } else {
                // Si no encuentra exactamente "Netherlands", buscar alternativas
                const alternative = data.find(
                    country => country.name.official.includes('Netherlands') || 
                              country.name.common.includes('Netherlands') ||
                              country.name.common.includes('Países Bajos')
                );
                
                if (alternative) {
                    displayNetherlandsData(alternative);
                } else {
                    throw new Error('No se encontró Países Bajos en los datos recibidos');
                }
            }
            
            // Actualizar la hora de última actualización
            updateTimestamp();
        })
        .catch(error => {
            console.error('Error al consumir la API:', error);
            
            // Mostrar estado de error
            updateStatus(apiStatus, 'Error de conexión', 'error');
            updateStatus(dataStatus, 'Error al cargar', 'error');
            
            // Mostrar mensajes de error en la interfaz
            countryName.textContent = "Error de conexión";
            fullName.textContent = "No se pudieron cargar los datos";
            language.textContent = "---";
            demonym.textContent = "---";
            subregion.textContent = "---";
            
            // Añadir información de error al pie de página
            const errorInfo = document.createElement('div');
            errorInfo.innerHTML = `
                <div style="margin-top: 15px; padding: 15px; background-color: #fee2e2; border-radius: 8px; color: #991b1b;">
                    <p><strong>Error:</strong> ${error.message}</p>
                    <p style="font-size: 0.9rem; margin-top: 10px;">
                        Verifica tu conexión a internet o intenta recargar la página.
                    </p>
                </div>
            `;
            
            const footer = document.querySelector('.footer');
            footer.insertBefore(errorInfo, footer.firstChild);
        });
    
    // Actualizar la hora cada minuto
    setInterval(updateTimestamp, 60000);
});