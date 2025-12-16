// admin.js - Dashboard de Administración CA~Boutique (versión corregida)

// ============================================
// CONFIGURACIÓN
// ============================================
const CONFIG = {
    // Contraseña de administración (CÁMBIALA)
    ADMIN_PASSWORD: "2024",
    
    // Configuración de Cloudinary (REEMPLAZA CON TUS DATOS)
    CLOUDINARY: {
        cloudName: "tu-cloud-name",      // Tu cloud name de Cloudinary
        uploadPreset: "ca_boutique_preset" // Tu upload preset sin firmar
    },
    
    // URL de tus productos actuales
    PRODUCTS_URL: "../js/products.js",
    
    // Tiempo de sesión (24 horas en milisegundos)
    SESSION_DURATION: 24 * 60 * 60 * 1000
};

// ============================================
// ESTADO DE LA APLICACIÓN
// ============================================
const AppState = {
    user: null,
    products: [],
    sessionActive: false,
    uploadQueue: []
};

// ============================================
// FUNCIONES DE VERIFICACIÓN Y UTILIDADES
// ============================================
function isStorageAvailable() {
    try {
        const testKey = '__storage_test__';
        localStorage.setItem(testKey, testKey);
        localStorage.removeItem(testKey);
        return true;
    } catch (e) {
        return false;
    }
}

function showLoading(show) {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = show ? 'flex' : 'none';
    }
}

function showError(message) {
    console.error('❌ Error:', message);
    
    // Mostrar error en UI si existe el elemento
    const loginError = document.getElementById('loginError');
    if (loginError) {
        loginError.textContent = message;
        loginError.style.display = 'flex';
    } else {
        // Fallback con alert
        alert(`❌ Error: ${message}`);
    }
    
    logActivity(`Error: ${message}`);
}

function showSuccess(message) {
    console.log(`✅ ${message}`);
    
    // Mostrar éxito en UI si existe el elemento
    const successMessage = document.getElementById('successMessage');
    if (successMessage) {
        successMessage.textContent = message;
        successMessage.style.display = 'flex';
        setTimeout(() => {
            successMessage.style.display = 'none';
        }, 3000);
    }
    
    logActivity(`Éxito: ${message}`);
}

function logActivity(activity) {
    const activityList = document.getElementById('activityList');
    if (!activityList) return;
    
    const now = new Date();
    const timeString = now.toLocaleTimeString('es-MX', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    const activityItem = document.createElement('div');
    activityItem.className = 'activity-item';
    activityItem.innerHTML = `
        <i class="fas fa-user-circle"></i>
        <div class="activity-content">
            <p><strong>Administrador</strong> ${activity}</p>
            <small>${timeString}</small>
        </div>
    `;
    
    // Agregar al inicio de la lista
    activityList.insertBefore(activityItem, activityList.firstChild);
    
    // Limitar a 10 actividades
    if (activityList.children.length > 10) {
        activityList.removeChild(activityList.lastChild);
    }
}

// ============================================
// SISTEMA DE AUTENTICACIÓN
// ============================================
function checkExistingSession() {
    if (!isStorageAvailable()) {
        console.warn('Almacenamiento local no disponible. Sesión no puede mantenerse.');
        showLogin();
        return;
    }
    
    try {
        const savedSession = localStorage.getItem('ca_boutique_session');
        const loginTime = localStorage.getItem('ca_boutique_login_time');
        
        if (savedSession && loginTime) {
            const timeElapsed = Date.now() - parseInt(loginTime);
            
            if (timeElapsed < CONFIG.SESSION_DURATION) {
                // Sesión válida, mostrar dashboard
                AppState.sessionActive = true;
                showDashboard();
                updateLastAccess();
            } else {
                // Sesión expirada
                localStorage.removeItem('ca_boutique_session');
                localStorage.removeItem('ca_boutique_login_time');
                showLogin();
            }
        } else {
            showLogin();
        }
    } catch (error) {
        console.error('Error al verificar sesión:', error);
        showLogin();
    }
}

function authenticate(password) {
    // En una app real, aquí habría validación con servidor
    // Por simplicidad, comparamos con contraseña configurada
    if (password === CONFIG.ADMIN_PASSWORD) {
        if (isStorageAvailable()) {
            // Guardar sesión
            localStorage.setItem('ca_boutique_session', 'active');
            localStorage.setItem('ca_boutique_login_time', Date.now().toString());
        }
        
        AppState.sessionActive = true;
        showDashboard();
        updateLastAccess();
        logActivity('Inicio de sesión exitoso');
        
        return true;
    }
    
    return false;
}

function logout() {
    if (isStorageAvailable()) {
        localStorage.removeItem('ca_boutique_session');
        localStorage.removeItem('ca_boutique_login_time');
    }
    AppState.sessionActive = false;
    showLogin();
    logActivity('Sesión cerrada');
}

function updateLastAccess() {
    const now = new Date();
    const formattedDate = now.toLocaleDateString('es-MX', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    const lastAccessElement = document.getElementById('lastAccess');
    const lastUpdateTimeElement = document.getElementById('lastUpdateTime');
    
    if (lastAccessElement) lastAccessElement.textContent = formattedDate;
    if (lastUpdateTimeElement) lastUpdateTimeElement.textContent = formattedDate;
}

// ============================================
// INICIALIZACIÓN
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🛡️  Dashboard CA~Boutique inicializando...');
    
    try {
        // 1. Configurar elementos del DOM PRIMERO
        setupDOMReferences();
        
        // 2. Verificar sesión existente DESPUÉS
        checkExistingSession();
        
        // 3. Configurar event listeners
        setupEventListeners();
        
        // 4. Actualizar información del dashboard
        updateDashboardInfo();
        
        // 5. Configurar año actual
        const currentYearElement = document.getElementById('currentYear');
        if (currentYearElement) {
            currentYearElement.textContent = new Date().getFullYear().toString();
        }
        
    } catch (error) {
        console.error('Error al inicializar dashboard:', error);
        showError('Error al cargar el dashboard. Recarga la página.');
    }
});

// ============================================
// GESTIÓN DE LA INTERFAZ - DOM
// ============================================
function setupDOMReferences() {
    // Elementos de login
    window.loginPanel = document.getElementById('loginPanel');
    window.dashboardPanel = document.getElementById('dashboardPanel');
    window.adminPasswordInput = document.getElementById('adminPassword');
    window.loginBtn = document.getElementById('loginBtn');
    window.loginError = document.getElementById('loginError');
    window.logoutBtn = document.getElementById('logoutBtn');
    
    // Elementos del dashboard
    window.navLinks = document.querySelectorAll('.nav-link');
    window.contentSections = document.querySelectorAll('.content-section');
    
    // Botones de acciones
    window.uploadImageBtn = document.getElementById('uploadImageBtn');
    window.refreshProductsBtn = document.getElementById('refreshProductsBtn');
    window.viewSiteBtn = document.getElementById('viewSiteBtn');
    window.addProductBtn = document.getElementById('addProductBtn');
    
    // Elementos de subida de imágenes
    window.dropArea = document.getElementById('dropArea');
    window.fileInput = document.getElementById('fileInput');
    window.selectFilesBtn = document.getElementById('selectFilesBtn');
    window.uploadProgress = document.getElementById('uploadProgress');
    window.progressFill = document.getElementById('progressFill');
    window.progressText = document.getElementById('progressText');
    window.progressPercent = document.getElementById('progressPercent');
    
    // Modal
    window.urlModal = document.getElementById('urlModal');
    window.imageUrlInput = document.getElementById('imageUrl');
    window.copyUrlBtn = document.getElementById('copyUrlBtn');
    window.modalPreview = document.getElementById('modalPreview');
    window.closeModal = document.getElementById('closeModal');
    
    // Asegurar que los elementos críticos existen
    if (!window.adminPasswordInput || !window.loginBtn) {
        throw new Error('Elementos de login no encontrados en el DOM');
    }
}

function setupEventListeners() {
    // Login
    if (loginBtn) {
        loginBtn.addEventListener('click', handleLogin);
    }
    
    if (adminPasswordInput) {
        adminPasswordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleLogin();
        });
        
        adminPasswordInput.addEventListener('input', updatePasswordStrength);
    }
    
    // Logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    
    // Navegación
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            switchSection(link.dataset.section);
        });
    });
    
    // Botones de acciones
    if (uploadImageBtn) uploadImageBtn.addEventListener('click', () => switchSection('images'));
    if (refreshProductsBtn) refreshProductsBtn.addEventListener('click', loadProducts);
    if (viewSiteBtn) viewSiteBtn.addEventListener('click', () => window.open('../index.html', '_blank'));
    if (addProductBtn) addProductBtn.addEventListener('click', showAddProductForm);
    
    // Subida de imágenes
    if (selectFilesBtn) selectFilesBtn.addEventListener('click', () => {
        if (fileInput) fileInput.click();
    });
    
    if (fileInput) fileInput.addEventListener('change', handleFileSelect);
    
    // Drag & drop
    if (dropArea) {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, preventDefaults, false);
        });
        
        dropArea.addEventListener('drop', handleDrop);
    }
    
    // Modal
    if (copyUrlBtn) copyUrlBtn.addEventListener('click', copyImageUrl);
    if (closeModal) closeModal.addEventListener('click', () => {
        if (urlModal) urlModal.style.display = 'none';
    });
    
    // Cerrar modal al hacer clic fuera del contenido
    if (urlModal) {
        urlModal.addEventListener('click', (e) => {
            if (e.target === urlModal) {
                urlModal.style.display = 'none';
            }
        });
    }
}

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

// ============================================
// GESTIÓN DE LA INTERFAZ - VISUAL
// ============================================
function showLogin() {
    if (loginPanel) loginPanel.style.display = 'flex';
    if (dashboardPanel) dashboardPanel.style.display = 'none';
    
    if (adminPasswordInput) {
        adminPasswordInput.value = '';
        adminPasswordInput.focus();
    }
    
    if (loginError) loginError.style.display = 'none';
}

function showDashboard() {
    if (loginPanel) loginPanel.style.display = 'none';
    if (dashboardPanel) dashboardPanel.style.display = 'block';
    
    // Mostrar la primera sección por defecto
    switchSection('dashboard');
    
    loadProducts();
    updateDashboardInfo();
}

function switchSection(sectionId) {
    // Actualizar navegación
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.dataset.section === sectionId) {
            link.classList.add('active');
        }
    });
    
    // Mostrar sección correspondiente
    contentSections.forEach(section => {
        section.classList.remove('active');
        if (section.id === sectionId + 'Section') {
            section.classList.add('active');
        }
    });
    
    logActivity(`Navegó a: ${sectionId}`);
    
    // Si es la sección de imágenes, resetear el área de drop
    if (sectionId === 'images' && dropArea) {
        dropArea.classList.remove('drag-over');
    }
}

function updatePasswordStrength() {
    if (!adminPasswordInput) return;
    
    const password = adminPasswordInput.value;
    const strengthBar = document.querySelector('.strength-bar');
    
    if (!strengthBar) return;
    
    let strength = 0;
    
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    
    strengthBar.style.width = strength + '%';
    
    // Cambiar color según fuerza
    if (strength < 50) {
        strengthBar.style.background = '#f44336';
    } else if (strength < 75) {
        strengthBar.style.background = '#FF9800';
    } else {
        strengthBar.style.background = '#4CAF50';
    }
}

// ============================================
// GESTIÓN DE PRODUCTOS
// ============================================
async function loadProducts() {
    showLoading(true);
    
    try {
        // Cargar el archivo products.js
        const response = await fetch(CONFIG.PRODUCTS_URL);
        
        if (!response.ok) {
            throw new Error(`Error al cargar productos: ${response.status}`);
        }
        
        const text = await response.text();
        
        // Extraer el array de productos (esto es un hack para parsear el archivo JS)
        const productsMatch = text.match(/const products = (\[[\s\S]*?\]);/);
        
        if (productsMatch) {
            const productsStr = productsMatch[1];
            // Usar Function para evaluar de manera segura
            const getProducts = new Function('return ' + productsStr);
            AppState.products = getProducts();
            
            displayProducts(AppState.products);
            updateProductStats();
            
            logActivity('Productos cargados exitosamente');
            showSuccess('Productos actualizados');
        } else {
            throw new Error('No se encontró la estructura de productos');
        }
        
    } catch (error) {
        console.error('Error cargando productos:', error);
        showError('Error al cargar productos. Verifica la conexión.');
        AppState.products = [];
        displayProducts([]);
    } finally {
        showLoading(false);
    }
}

function displayProducts(products) {
    const container = document.getElementById('productsList');
    if (!container) return;
    
    if (products.length === 0) {
        container.innerHTML = `
            <div class="no-products">
                <i class="fas fa-box-open"></i>
                <h4>No hay productos</h4>
                <p>Agrega productos editando el archivo products.js</p>
            </div>
        `;
        return;
    }
    
    // Crear tabla de productos
    let html = `
        <div class="products-table">
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Imagen</th>
                        <th>Nombre</th>
                        <th>Categoría</th>
                        <th>Precio</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    products.forEach(product => {
        const categoryName = getCategoryName(product.category);
        const imageUrl = product.image || 'https://via.placeholder.com/50?text=Sin+imagen';
        html += `
            <tr>
                <td>${product.id}</td>
                <td><img src="${imageUrl}" alt="${product.name}" class="product-thumb"></td>
                <td><strong>${product.name}</strong></td>
                <td><span class="category-badge">${categoryName}</span></td>
                <td>$${product.price.toLocaleString('es-MX')} MXN</td>
                <td>
                    <button class="btn-small" onclick="editProduct(${product.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-small btn-danger" onclick="deleteProduct(${product.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    
    html += `
                </tbody>
            </table>
        </div>
    `;
    
    container.innerHTML = html;
}

function getCategoryName(categoryKey) {
    const categories = {
        'hombre': 'Hombre',
        'mujer': 'Mujer',
        'ninos': 'Niños',
        'accesorios': 'Accesorios',
        'cuidado': 'Cuidado Personal',
        'zapatos': 'Zapatos',
        'joyeria': 'Joyería'
    };
    return categories[categoryKey] || categoryKey;
}

function updateProductStats() {
    const totalProductsElement = document.getElementById('totalProducts');
    const totalImagesElement = document.getElementById('totalImages');
    
    if (totalProductsElement) {
        totalProductsElement.textContent = AppState.products.length.toString();
    }
    
    if (totalImagesElement) {
        // Contar productos con imágenes válidas
        const productsWithImages = AppState.products.filter(p => p.image && p.image.trim() !== '').length;
        totalImagesElement.textContent = productsWithImages.toString();
    }
}

// ============================================
// SUBIDA DE IMÁGENES A CLOUDINARY
// ============================================
function handleFileSelect(e) {
    const files = e.target.files;
    processFiles(files);
}

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    processFiles(files);
}

function processFiles(files) {
    if (files.length === 0) return;
    
    // Limpiar cola anterior
    AppState.uploadQueue = [];
    
    // Limitar a 5 archivos máximo
    const fileList = Array.from(files).slice(0, 5);
    
    // Mostrar vista previa del primer archivo
    showImagePreview(fileList[0]);
    
    // Preparar para subida
    AppState.uploadQueue = fileList;
}

function showImagePreview(file) {
    // Resetear estado previo
    if (uploadProgress) uploadProgress.style.display = 'none';
    
    try {
        const reader = new FileReader();
        reader.onload = function(e) {
            // Mostrar preview en modal
            if (modalPreview) {
                modalPreview.src = e.target.result;
                
                // Mostrar controles de subida
                const uploadControls = document.getElementById('uploadControls');
                if (uploadControls) uploadControls.style.display = 'block';
            }
        };
        reader.readAsDataURL(file);
        
    } catch (error) {
        console.error('Error al mostrar vista previa:', error);
        showError('No se pudo mostrar la vista previa de la imagen');
    }
}

async function uploadToCloudinary() {
    if (AppState.uploadQueue.length === 0) {
        showError('No hay imágenes seleccionadas para subir');
        return;
    }
    
    showLoading(true);
    
    if (uploadProgress) {
        uploadProgress.style.display = 'block';
        if (progressFill) progressFill.style.width = '0%';
        if (progressPercent) progressPercent.textContent = '0%';
        if (progressText) progressText.textContent = 'Preparando...';
    }
    
    try {
        const file = AppState.uploadQueue[0]; // Subir solo el primero por ahora
        
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CONFIG.CLOUDINARY.uploadPreset);
        
        // Mostrar progreso
        if (progressText) progressText.textContent = 'Subiendo a Cloudinary...';
        
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${CONFIG.CLOUDINARY.cloudName}/image/upload`,
            {
                method: 'POST',
                body: formData
            }
        );
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(`Error ${response.status}: ${errorData?.error?.message || response.statusText}`);
        }
        
        const data = await response.json();
        
        // Actualizar progreso
        if (progressFill) progressFill.style.width = '100%';
        if (progressPercent) progressPercent.textContent = '100%';
        if (progressText) progressText.textContent = '¡Subida completada!';
        
        // Mostrar URL en modal
        showImageUrl(data.secure_url);
        
        logActivity(`Imagen subida: ${file.name}`);
        showSuccess('¡Imagen subida correctamente!');
        
        // Limpiar input de archivos
        if (fileInput) fileInput.value = '';
        
    } catch (error) {
        console.error('Error subiendo imagen:', error);
        showError(`Error al subir imagen: ${error.message}`);
    } finally {
        showLoading(false);
        // Ocultar barra de progreso después de 2 segundos
        if (uploadProgress) {
            setTimeout(() => {
                uploadProgress.style.display = 'none';
            }, 2000);
        }
    }
}

function showImageUrl(url) {
    if (imageUrlInput) imageUrlInput.value = url;
    if (urlModal) urlModal.style.display = 'flex';
}

async function copyImageUrl() {
    if (!imageUrlInput || !copyUrlBtn) return;
    
    try {
        await navigator.clipboard.writeText(imageUrlInput.value);
        copyUrlBtn.innerHTML = '<i class="fas fa-check"></i> ¡Copiado!';
        copyUrlBtn.style.background = '#4CAF50';
        
        setTimeout(() => {
            if (copyUrlBtn) {
                copyUrlBtn.innerHTML = '<i class="fas fa-copy"></i> Copiar';
                copyUrlBtn.style.background = '';
            }
        }, 2000);
        
        logActivity('URL de imagen copiada al portapapeles');
        showSuccess('URL copiada al portapapeles');
    } catch (err) {
        console.error('Error copiando URL:', err);
        showError('No se pudo copiar la URL. Intenta seleccionar y copiar manualmente.');
    }
}

// ============================================
// FUNCIONES DE LA INTERFAZ DE USUARIO
// ============================================
function updateDashboardInfo() {
    // Actualizar información del sistema
    const now = new Date();
    const lastUpdateElement = document.getElementById('lastUpdate');
    
    if (lastUpdateElement) {
        lastUpdateElement.textContent = 'Hoy';
    }
    
    // Aquí podrías cargar estadísticas reales
    const siteVisitsElement = document.getElementById('siteVisits');
    if (siteVisitsElement) {
        siteVisitsElement.textContent = '0';
    }
    
    // Cargar gráficos si Chart.js está disponible
    loadCharts();
}

function loadCharts() {
    // Verificar si Chart.js está disponible
    if (typeof Chart === 'undefined') {
        console.warn('Chart.js no está cargado. Los gráficos no se mostrarán.');
        return;
    }
    
    // Gráfico de tráfico
    const trafficCtx = document.getElementById('trafficChart');
    if (trafficCtx && trafficCtx.getContext) {
        try {
            new Chart(trafficCtx.getContext('2d'), {
                type: 'line',
                data: {
                    labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
                    datasets: [{
                        label: 'Visitas',
                        data: [65, 59, 80, 81, 56, 55, 40],
                        borderColor: '#c9a77c',
                        backgroundColor: 'rgba(201, 167, 124, 0.1)',
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Error al crear gráfico de tráfico:', error);
        }
    }
    
    // Gráfico de categorías
    const categoryCtx = document.getElementById('categoryChart');
    if (categoryCtx && categoryCtx.getContext) {
        try {
            new Chart(categoryCtx.getContext('2d'), {
                type: 'doughnut',
                data: {
                    labels: ['Hombre', 'Mujer', 'Niños', 'Accesorios'],
                    datasets: [{
                        data: [30, 25, 20, 25],
                        backgroundColor: [
                            '#c9a77c',
                            '#8c7b6b',
                            '#b89a6a',
                            '#d8c4a8'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Error al crear gráfico de categorías:', error);
        }
    }
}

// ============================================
// MANEJADORES DE EVENTOS
// ============================================
function handleLogin() {
    if (!adminPasswordInput) {
        showError('Elemento de contraseña no disponible');
        return;
    }
    
    const password = adminPasswordInput.value.trim();
    
    if (!password) {
        showError('Por favor ingresa la contraseña');
        return;
    }
    
    if (authenticate(password)) {
        if (loginError) loginError.style.display = 'none';
    } else {
        showError('Contraseña incorrecta. Intenta de nuevo.');
        if (adminPasswordInput) adminPasswordInput.focus();
    }
}

// ============================================
// FUNCIONES GLOBALES PARA BOTONES
// ============================================
window.editProduct = function(productId) {
    alert(`Editar producto ${productId} - Esta función está en desarrollo`);
    logActivity(`Intentó editar producto ID: ${productId}`);
};

window.deleteProduct = function(productId) {
    if (confirm(`¿Estás seguro de eliminar el producto ${productId}?`)) {
        alert(`Producto ${productId} eliminado (simulado)`);
        logActivity(`Eliminó producto ID: ${productId}`);
    }
};

window.showAddProductForm = function() {
    alert('Formulario para agregar producto - En desarrollo');
    logActivity('Intentó agregar nuevo producto');
};

window.uploadToCloudinary = uploadToCloudinary;

// ============================================
// INICIALIZACIÓN FINAL
// ============================================
console.log('✅ Dashboard CA~Boutique cargado correctamente');