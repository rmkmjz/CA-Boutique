// admin.js - Dashboard de Administración CA~Boutique

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
// INICIALIZACIÓN
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🛡️  Dashboard CA~Boutique inicializando...');
    
    try {
        // 1. Verificar sesión existente
        checkExistingSession();
        
        // 2. Configurar elementos del DOM
        setupDOMReferences();
        
        // 3. Configurar event listeners
        setupEventListeners();
        
        // 4. Actualizar información del dashboard
        updateDashboardInfo();
        
        // 5. Configurar año actual
        document.getElementById('currentYear').textContent = new Date().getFullYear();
        
    } catch (error) {
        console.error('Error al inicializar dashboard:', error);
        showError('Error al cargar el dashboard. Recarga la página.');
    }
});

// ============================================
// SISTEMA DE AUTENTICACIÓN
// ============================================
function checkExistingSession() {
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
}

function authenticate(password) {
    // En una app real, aquí habría validación con servidor
    // Por simplicidad, comparamos con contraseña configurada
    if (password === CONFIG.ADMIN_PASSWORD) {
        // Guardar sesión
        localStorage.setItem('ca_boutique_session', 'active');
        localStorage.setItem('ca_boutique_login_time', Date.now());
        
        AppState.sessionActive = true;
        showDashboard();
        updateLastAccess();
        logActivity('Inicio de sesión exitoso');
        
        return true;
    }
    
    return false;
}

function logout() {
    localStorage.removeItem('ca_boutique_session');
    localStorage.removeItem('ca_boutique_login_time');
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
    
    document.getElementById('lastAccess').textContent = formattedDate;
    document.getElementById('lastUpdateTime').textContent = formattedDate;
}

// ============================================
// INTERFAZ DE USUARIO
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
}

function setupEventListeners() {
    // Login
    loginBtn.addEventListener('click', handleLogin);
    adminPasswordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleLogin();
    });
    
    adminPasswordInput.addEventListener('input', updatePasswordStrength);
    
    // Logout
    logoutBtn.addEventListener('click', logout);
    
    // Navegación
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            switchSection(link.dataset.section);
        });
    });
    
    // Botones de acciones
    uploadImageBtn.addEventListener('click', () => switchSection('images'));
    refreshProductsBtn.addEventListener('click', loadProducts);
    viewSiteBtn.addEventListener('click', () => window.open('../index.html', '_blank'));
    addProductBtn.addEventListener('click', showAddProductForm);
    
    // Subida de imágenes
    selectFilesBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileSelect);
    
    // Drag & drop
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });
    
    dropArea.addEventListener('drop', handleDrop);
    
    // Modal
    copyUrlBtn.addEventListener('click', copyImageUrl);
    closeModal.addEventListener('click', () => urlModal.style.display = 'none');
}

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

// ============================================
// GESTIÓN DE LA INTERFAZ
// ============================================
function showLogin() {
    loginPanel.style.display = 'flex';
    dashboardPanel.style.display = 'none';
    adminPasswordInput.value = '';
    loginError.style.display = 'none';
}

function showDashboard() {
    loginPanel.style.display = 'none';
    dashboardPanel.style.display = 'block';
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
}

function updatePasswordStrength() {
    const password = adminPasswordInput.value;
    const strengthBar = document.querySelector('.strength-bar');
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
        html += `
            <tr>
                <td>${product.id}</td>
                <td><img src="${product.image}" alt="${product.name}" class="product-thumb"></td>
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
    document.getElementById('totalProducts').textContent = AppState.products.length;
    document.getElementById('totalImages').textContent = AppState.products.length; // Asumimos una imagen por producto
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
    
    // Limitar a 5 archivos máximo
    const fileList = Array.from(files).slice(0, 5);
    
    // Mostrar vista previa
    showImagePreview(fileList[0]);
    
    // Preparar para subida
    AppState.uploadQueue = fileList;
    showUploadControls();
}

function showImagePreview(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        // Mostrar preview en modal
        modalPreview.src = e.target.result;
        
        // Mostrar controles de subida
        document.getElementById('uploadControls').style.display = 'block';
    };
    reader.readAsDataURL(file);
}

function showUploadControls() {
    // Mostrar botón de subida
    const uploadBtn = document.getElementById('uploadBtn');
    uploadBtn.textContent = `Subir ${AppState.uploadQueue.length} imagen(es)`;
    uploadBtn.onclick = uploadToCloudinary;
    
    // Mostrar controles
    document.getElementById('uploadControls').style.display = 'block';
}

async function uploadToCloudinary() {
    if (AppState.uploadQueue.length === 0) return;
    
    showLoading(true);
    uploadProgress.style.display = 'block';
    progressFill.style.width = '0%';
    progressPercent.textContent = '0%';
    progressText.textContent = 'Preparando...';
    
    try {
        const file = AppState.uploadQueue[0]; // Subir solo el primero por ahora
        
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CONFIG.CLOUDINARY.uploadPreset);
        
        // Mostrar progreso
        progressText.textContent = 'Subiendo a Cloudinary...';
        
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${CONFIG.CLOUDINARY.cloudName}/image/upload`,
            {
                method: 'POST',
                body: formData
            }
        );
        
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Actualizar progreso
        progressFill.style.width = '100%';
        progressPercent.textContent = '100%';
        progressText.textContent = '¡Subida completada!';
        
        // Mostrar URL en modal
        showImageUrl(data.secure_url);
        
        logActivity(`Imagen subida: ${file.name}`);
        
    } catch (error) {
        console.error('Error subiendo imagen:', error);
        showError(`Error al subir imagen: ${error.message}`);
    } finally {
        showLoading(false);
        setTimeout(() => {
            uploadProgress.style.display = 'none';
        }, 2000);
    }
}

function showImageUrl(url) {
    imageUrlInput.value = url;
    urlModal.style.display = 'flex';
}

function copyImageUrl() {
    imageUrlInput.select();
    imageUrlInput.setSelectionRange(0, 99999); // Para móviles
    
    navigator.clipboard.writeText(imageUrlInput.value)
        .then(() => {
            copyUrlBtn.innerHTML = '<i class="fas fa-check"></i> ¡Copiado!';
            copyUrlBtn.style.background = '#4CAF50';
            
            setTimeout(() => {
                copyUrlBtn.innerHTML = '<i class="fas fa-copy"></i> Copiar';
                copyUrlBtn.style.background = '';
            }, 2000);
        })
        .catch(err => {
            console.error('Error copiando URL:', err);
            showError('No se pudo copiar la URL');
        });
}

// ============================================
// FUNCIONES UTILITARIAS
// ============================================
function showLoading(show) {
    const loadingOverlay = document.getElementById('loadingOverlay');
    loadingOverlay.style.display = show ? 'flex' : 'none';
}

function showError(message) {
    // En una implementación real, mostrarías un modal o toast
    alert(`❌ Error: ${message}`);
    logActivity(`Error: ${message}`);
}

function showSuccess(message) {
    // En una implementación real, mostrarías un modal o toast
    console.log(`✅ ${message}`);
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

function updateDashboardInfo() {
    // Actualizar información del sistema
    const now = new Date();
    document.getElementById('lastUpdate').textContent = 'Hoy';
    
    // Aquí podrías cargar estadísticas reales
    document.getElementById('siteVisits').textContent = '0';
}

// ============================================
// MANEJADORES DE EVENTOS
// ============================================
function handleLogin() {
    const password = adminPasswordInput.value.trim();
    
    if (!password) {
        loginError.textContent = 'Por favor ingresa la contraseña';
        loginError.style.display = 'flex';
        return;
    }
    
    if (authenticate(password)) {
        loginError.style.display = 'none';
    } else {
        loginError.textContent = 'Contraseña incorrecta. Intenta de nuevo.';
        loginError.style.display = 'flex';
        adminPasswordInput.focus();
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

// ============================================
// INICIALIZACIÓN FINAL
// ============================================
// Configurar Chart.js (ejemplo básico)
if (typeof Chart !== 'undefined') {
    // Gráfico de tráfico
    const trafficCtx = document.getElementById('trafficChart');
    if (trafficCtx) {
        new Chart(trafficCtx.getContext('2d'), {
            type: 'line',
            data: {
                labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
                datasets: [{
                    label: 'Visitas',
                    data: [65, 59, 80, 81, 56, 55, 40],
                    borderColor: '#c9a77c',
                    backgroundColor: 'rgba(201, 167, 124, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false }
                }
            }
        });
    }
    
    // Gráfico de categorías
    const categoryCtx = document.getElementById('categoryChart');
    if (categoryCtx) {
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
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }
}

console.log('✅ Dashboard CA~Boutique cargado correctamente');
