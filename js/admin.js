// ============================================
// SISTEMA ADMINISTRATIVO - CA~Boutique
// VERSIÓN CORREGIDA PARA CUBA
// ============================================

// CONFIGURACIÓN - ¡IMPORTANTE! Cambia estos valores
const CONFIG = {
    GITHUB_USER: 'TuUsuarioDeGitHub',      // Ej: 'carlos-pérez'
    GITHUB_REPO: 'CA-Boutique',            // Nombre exacto de tu repositorio
    ADMIN_PASSWORD: 'CAadmin2024!',        // Cambia esta contraseña
    STORAGE_KEY: 'ca_boutique_products_admin'
};

// Variables globales
let currentEditId = null;
let deleteCallback = null;
let allProducts = [];

// ===== FUNCIONES DE AUTENTICACIÓN (CORREGIDAS) =====
function loginAdmin() {
    const passwordInput = document.getElementById('adminPassword');
    const errorElement = document.getElementById('loginError');
    
    // Verificar si los elementos existen
    if (!passwordInput) {
        console.error('Error: No se encontró el elemento con id "adminPassword"');
        if (errorElement) errorElement.textContent = 'Error: Elemento no encontrado';
        return;
    }
    
    const password = passwordInput.value;
    
    if (password === CONFIG.ADMIN_PASSWORD) {
        localStorage.setItem('adminLoggedIn', 'true');
        
        // Ocultar login y mostrar panel
        const loginSection = document.getElementById('loginSection');
        const adminPanel = document.getElementById('adminPanel');
        
        if (loginSection) loginSection.style.display = 'none';
        if (adminPanel) adminPanel.style.display = 'block';
        
        // Inicializar el panel
        setTimeout(() => {
            try {
                if (typeof loadProducts === 'function') loadProducts();
                if (typeof exportToJSON === 'function') exportToJSON();
                if (typeof showNotification === 'function') {
                    showNotification('¡Bienvenido al panel administrativo!', 'success');
                }
            } catch (e) {
                console.error('Error al inicializar panel:', e);
            }
        }, 100);
        
        if (errorElement) errorElement.textContent = '';
    } else {
        if (errorElement) errorElement.textContent = '❌ Contraseña incorrecta';
    }
}

function logoutAdmin() {
    if (confirm('¿Estás seguro de que deseas salir? Los cambios no guardados se perderán.')) {
        localStorage.removeItem('adminLoggedIn');
        location.reload();
    }
}

// ===== FUNCIONES CRUD =====
function loadProducts() {
    allProducts = getProducts();
    renderProductsTable(allProducts);
    updateStats(allProducts);
    return allProducts;
}

function getProducts() {
    // Primero intentar desde localStorage
    const stored = localStorage.getItem(CONFIG.STORAGE_KEY);
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch (e) {
            console.error('Error parsing localStorage data:', e);
            return [];
        }
    } else {
        // Si no hay en localStorage, usar los de products.js
        if (window.products && Array.isArray(window.products)) {
            return [...window.products];
        }
        return [];
    }
}

function saveProducts(productsArray) {
    allProducts = productsArray;
    localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(productsArray));
    updateStats(productsArray);
    return productsArray;
}

function saveProduct() {
    const name = document.getElementById('productName')?.value.trim();
    const priceInput = document.getElementById('productPrice')?.value;
    const category = document.getElementById('productCategory')?.value;
    const image = document.getElementById('productImage')?.value.trim();
    const description = document.getElementById('productDescription')?.value.trim();
    const editId = document.getElementById('editId')?.value;

    // Validaciones
    if (!name) {
        showNotification('❌ El nombre del producto es obligatorio', 'error');
        return;
    }
    
    const price = parseFloat(priceInput);
    if (!price || isNaN(price) || price < 0) {
        showNotification('❌ El precio debe ser un número válido mayor a 0', 'error');
        return;
    }
    
    if (!category) {
        showNotification('❌ Debes seleccionar una categoría', 'error');
        return;
    }
    
    if (!image) {
        showNotification('❌ Debes seleccionar una imagen', 'error');
        return;
    }

    let products = getProducts();
    let newId = editId ? parseInt(editId) : Date.now();

    if (editId) {
        // Editar producto existente
        const index = products.findIndex(p => p.id == editId);
        if (index !== -1) {
            products[index] = {
                id: newId,
                name,
                price,
                category,
                image,
                description: description || ''
            };
            showNotification('✅ Producto actualizado correctamente', 'success');
        }
    } else {
        // Agregar nuevo producto
        const newProduct = {
            id: newId,
            name,
            price,
            category,
            image,
            description: description || ''
        };
        products.push(newProduct);
        showNotification('✅ Producto agregado correctamente', 'success');
    }

    saveProducts(products);
    renderProductsTable(products);
    clearForm();
    if (typeof exportToJSON === 'function') exportToJSON();
}

function editProduct(id) {
    const products = getProducts();
    const product = products.find(p => p.id == id);
    
    if (product) {
        document.getElementById('productName').value = product.name;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productCategory').value = product.category;
        document.getElementById('productImage').value = product.image;
        document.getElementById('productDescription').value = product.description || '';
        document.getElementById('editId').value = product.id;
        
        document.getElementById('saveBtn').innerHTML = '<i class="fas fa-edit"></i> Actualizar Producto';
        document.getElementById('cancelBtn').style.display = 'inline-flex';
        
        // Mostrar vista previa de la imagen
        if (typeof showImagePreview === 'function') {
            showImagePreview(product.image);
        }
        
        // Scroll al formulario
        document.getElementById('productName').focus();
        document.querySelector('.admin-form').scrollIntoView({ behavior: 'smooth' });
        
        showNotification(`Editando: ${product.name}`, 'info');
    }
}

function deleteProduct(id) {
    const products = getProducts();
    const product = products.find(p => p.id == id);
    
    if (!product) return;
    
    document.getElementById('confirmMessage').textContent = 
        `¿Estás seguro de eliminar el producto "${product.name}"? Esta acción no se puede deshacer.`;
    
    deleteCallback = function() {
        const updatedProducts = products.filter(p => p.id != id);
        saveProducts(updatedProducts);
        renderProductsTable(updatedProducts);
        showNotification('✅ Producto eliminado correctamente', 'success');
        if (typeof exportToJSON === 'function') exportToJSON();
    };
    
    document.getElementById('confirmModal').style.display = 'flex';
}

function confirmAction(confirmed) {
    document.getElementById('confirmModal').style.display = 'none';
    
    if (confirmed && deleteCallback) {
        deleteCallback();
        deleteCallback = null;
    }
}

function clearForm() {
    document.getElementById('productName').value = '';
    document.getElementById('productPrice').value = '';
    document.getElementById('productCategory').value = '';
    document.getElementById('productImage').value = '';
    document.getElementById('productDescription').value = '';
    document.getElementById('editId').value = '';
    
    document.getElementById('saveBtn').innerHTML = '<i class="fas fa-save"></i> Guardar Producto';
    document.getElementById('cancelBtn').style.display = 'none';
    
    // Limpiar selector de imágenes
    const container = document.getElementById('imageSelectorContainer');
    if (container) {
        container.innerHTML = `
            <div class="placeholder-text">
                <i class="fas fa-folder-open"></i>
                <p>Selecciona una categoría y haz clic en "Cargar Imágenes"</p>
            </div>
        `;
    }
    
    // Ocultar vista previa
    document.getElementById('imagePreviewBox').style.display = 'none';
}

function cancelEdit() {
    clearForm();
    showNotification('✋ Edición cancelada', 'info');
}

// ===== SELECTOR DE IMÁGENES DESDE GITHUB =====
function onCategoryChange() {
    const category = document.getElementById('productCategory')?.value;
    const helpText = document.getElementById('imageHelpText');
    const loadBtn = document.getElementById('loadImagesBtn');
    
    if (category && helpText && loadBtn) {
        helpText.textContent = `Categoría seleccionada: ${getCategoryName(category)}`;
        loadBtn.disabled = false;
        loadBtn.innerHTML = '<i class="fas fa-sync"></i> Cargar Imágenes de esta Categoría';
    }
}

async function loadImagesForCategory() {
    const category = document.getElementById('productCategory')?.value;
    if (!category) {
        showNotification('❌ Primero selecciona una categoría', 'error');
        return;
    }
    
    const container = document.getElementById('imageSelectorContainer');
    const loadBtn = document.getElementById('loadImagesBtn');
    
    if (!container || !loadBtn) return;
    
    // Mostrar estado de carga
    container.innerHTML = `
        <div class="placeholder-text">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Cargando imágenes de GitHub...</p>
        </div>
    `;
    
    loadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Cargando...';
    loadBtn.disabled = true;
    
    try {
        const path = `img/productos/${category}`;
        const apiUrl = `https://api.github.com/repos/${CONFIG.GITHUB_USER}/${CONFIG.GITHUB_REPO}/contents/${path}`;
        
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error(`La carpeta "${path}" no existe en GitHub. ¡Créala primero!`);
            }
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const files = await response.json();
        
        // Filtrar solo imágenes
        const imageFiles = files.filter(file => 
            file.type === 'file' && /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file.name)
        );
        
        if (imageFiles.length === 0) {
            container.innerHTML = `
                <div class="placeholder-text">
                    <i class="fas fa-folder-open"></i>
                    <p>No hay imágenes en la carpeta "${category}"</p>
                    <small>Sube imágenes a: <code>${path}/</code> en GitHub</small>
                </div>
            `;
            showNotification(`⚠️ No hay imágenes en la carpeta "${category}"`, 'warning');
        } else {
            // Mostrar las imágenes
            displayImageGrid(imageFiles, category);
            showNotification(`✅ Se cargaron ${imageFiles.length} imágenes`, 'success');
        }
        
    } catch (error) {
        console.error('Error cargando imágenes:', error);
        container.innerHTML = `
            <div class="placeholder-text">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Error al cargar imágenes</p>
                <small>${error.message}</small>
                <br>
                <small>Verifica: 1) Usuario/Repo correcto, 2) Carpeta existe</small>
            </div>
        `;
        showNotification(`❌ ${error.message}`, 'error');
    } finally {
        loadBtn.innerHTML = '<i class="fas fa-sync"></i> Volver a cargar imágenes';
        loadBtn.disabled = false;
    }
}

function displayImageGrid(imageFiles, category) {
    const container = document.getElementById('imageSelectorContainer');
    if (!container) return;
    
    container.innerHTML = `
        <div class="image-selector">
            <h5 style="margin-top:0; color:#495057;">
                <i class="fas fa-images"></i> ${imageFiles.length} imágenes en "${getCategoryName(category)}"
            </h5>
            <div class="image-grid">
                ${imageFiles.map(file => `
                    <div class="image-item" onclick="selectImage('${file.path}')" 
                         title="${file.name} (${(file.size/1024).toFixed(1)} KB)">
                        <img src="${file.download_url || `https://raw.githubusercontent.com/${CONFIG.GITHUB_USER}/${CONFIG.GITHUB_REPO}/main/${file.path}`}" 
                             alt="${file.name}"
                             onerror="this.onerror=null; this.src='data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2280%22 height=%2280%22 viewBox=%220 0 80 80%22><rect width=%2280%22 height=%2280%22 fill=%22%23eee%22/><text x=%2250%25%22 y=%2250%25%22 font-family=%22Arial%22 font-size=%2210%22 fill=%22%23666%22 text-anchor=%22middle%22 dy=%22.3em%22>Error</text></svg>';">
                        <div class="image-name">${file.name}</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function selectImage(imagePath) {
    // Actualizar campo de imagen
    document.getElementById('productImage').value = imagePath;
    
    // Mostrar vista previa
    showImagePreview(imagePath);
    
    // Resaltar la imagen seleccionada
    const items = document.querySelectorAll('.image-item');
    items.forEach(item => item.classList.remove('selected'));
    
    event.currentTarget.classList.add('selected');
    
    showNotification(`✅ Imagen seleccionada: ${imagePath.split('/').pop()}`, 'success');
}

function showImagePreview(imagePath) {
    const previewBox = document.getElementById('imagePreviewBox');
    const previewImg = document.getElementById('imagePreview');
    const pathText = document.getElementById('imagePathText');
    
    if (!previewBox || !previewImg || !pathText) return;
    
    if (imagePath) {
        // Usar raw.githubusercontent para la vista previa
        const rawUrl = `https://raw.githubusercontent.com/${CONFIG.GITHUB_USER}/${CONFIG.GITHUB_REPO}/main/${imagePath}`;
        
        previewImg.src = rawUrl;
        previewImg.onerror = function() {
            // Usar un placeholder SVG en lugar de externo
            this.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 150 150"><rect width="150" height="150" fill="%23f0f0f0"/><text x="50%" y="50%" font-family="Arial" font-size="14" fill="%23999" text-anchor="middle" dy=".3em">Imagen no encontrada</text></svg>';
        };
        
        pathText.textContent = imagePath;
        previewBox.style.display = 'block';
    } else {
        previewBox.style.display = 'none';
    }
}

// ===== RENDERIZADO DE TABLA =====
function renderProductsTable(productsArray) {
    const tbody = document.getElementById('productsList');
    const emptyState = document.getElementById('emptyState');
    
    if (!tbody || !emptyState) return;
    
    if (!productsArray || productsArray.length === 0) {
        tbody.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    
    // Ordenar por ID (más nuevos primero)
    const sortedProducts = [...productsArray].sort((a, b) => b.id - a.id);
    
    tbody.innerHTML = sortedProducts.map(product => `
        <tr>
            <td><span class="product-id">#${product.id}</span></td>
            <td>
                <img src="${product.image.startsWith('http') ? product.image : `https://raw.githubusercontent.com/${CONFIG.GITHUB_USER}/${CONFIG.GITHUB_REPO}/main/${product.image}`}" 
                     alt="${product.name}" 
                     class="product-img-small"
                     onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2250%22 height=%2250%22 viewBox=%220 0 50 50%22><rect width=%2250%22 height=%2250%22 fill=%22%23eee%22/><text x=%2250%25%22 y=%2250%25%22 font-family=%22Arial%22 font-size=%228%22 fill=%22%23666%22 text-anchor=%22middle%22 dy=%22.3em%22>IMG</text></svg>';">
            </td>
            <td>
                <div class="product-name">${product.name}</div>
                ${product.description ? `<p class="product-description">${product.description}</p>` : ''}
            </td>
            <td><strong>$${product.price.toLocaleString('es-MX')}</strong></td>
            <td>
                <span class="product-category">${getCategoryName(product.category)}</span>
            </td>
            <td>
                <div class="product-actions">
                    <button class="btn-action btn-edit" onclick="editProduct(${product.id})" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-action btn-delete" onclick="deleteProduct(${product.id})" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
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

function filterProducts() {
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase();
    const categoryFilter = document.getElementById('categoryFilter')?.value;
    const products = getProducts();
    
    const filtered = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm || '') ||
                            (product.description && product.description.toLowerCase().includes(searchTerm || ''));
        const matchesCategory = !categoryFilter || product.category === categoryFilter;
        
        return matchesSearch && matchesCategory;
    });
    
    renderProductsTable(filtered);
}

// ===== ESTADÍSTICAS =====
function updateStats(products) {
    if (!products) products = getProducts();
    
    const totalProducts = products.length;
    const totalValue = products.reduce((sum, p) => sum + (p.price || 0), 0);
    const categories = new Set(products.map(p => p.category)).size;
    
    const totalProductsEl = document.getElementById('totalProducts');
    const totalCategoriesEl = document.getElementById('totalCategories');
    const totalValueEl = document.getElementById('totalValue');
    
    if (totalProductsEl) totalProductsEl.textContent = totalProducts;
    if (totalCategoriesEl) totalCategoriesEl.textContent = categories;
    if (totalValueEl) totalValueEl.textContent = totalValue.toLocaleString('es-MX');
}

// ===== EXPORTACIÓN =====
function exportToJSON() {
    const products = getProducts();
    
    // Crear array con formato para products.js
    const formattedProducts = products.map(p => ({
        id: p.id,
        name: p.name,
        price: p.price,
        category: p.category,
        image: p.image,
        description: p.description || undefined
    })).filter(p => p.description === undefined ? delete p.description : true);
    
    const jsonString = JSON.stringify(formattedProducts, null, 2);
    
    // Formatear para products.js
    const code = `// ============================================
// BASE DE DATOS DE PRODUCTOS - CA~Boutique
// ============================================
// ¡NO MODIFICAR MANUALMENTE!
// Usar el panel administrativo: /admin.html
// Generado automáticamente el ${new Date().toLocaleString('es-MX')}
// Total: ${products.length} productos, $${products.reduce((sum, p) => sum + p.price, 0).toLocaleString('es-MX')} MXN

const products = ${jsonString};`;
    
    const jsonOutput = document.getElementById('jsonOutput');
    const copyBtn = document.getElementById('copyBtn');
    
    if (jsonOutput) jsonOutput.textContent = code;
    if (copyBtn) {
        copyBtn.innerHTML = '<i class="far fa-copy"></i> Copiar Código';
        copyBtn.classList.remove('copied');
    }
    
    return code;
}

function copyCode() {
    const code = document.getElementById('jsonOutput')?.textContent;
    const copyBtn = document.getElementById('copyBtn');
    
    if (!code) {
        showNotification('❌ No hay código para copiar', 'error');
        return;
    }
    
    navigator.clipboard.writeText(code).then(() => {
        if (copyBtn) {
            copyBtn.innerHTML = '<i class="fas fa-check"></i> ¡Copiado!';
            copyBtn.classList.add('copied');
        }
        showNotification('✅ Código copiado al portapapeles', 'success');
        
        // Restaurar después de 3 segundos
        setTimeout(() => {
            if (copyBtn) {
                copyBtn.innerHTML = '<i class="far fa-copy"></i> Copiar Código';
                copyBtn.classList.remove('copied');
            }
        }, 3000);
    }).catch(err => {
        console.error('Error al copiar:', err);
        showNotification('❌ Error al copiar. Copia manualmente.', 'error');
    });
}

function downloadJSON() {
    const products = getProducts();
    const dataStr = JSON.stringify(products, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `ca-boutique-products-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showNotification('✅ Archivo JSON descargado', 'success');
}

function importFromProductsJS() {
    if (!confirm('⚠️ ¿Importar productos desde products.js?\n\nEsto reemplazará TODOS los productos actuales en el panel.\nLos productos NO guardados se perderán.')) {
        return;
    }
    
    // products.js ya está cargado como variable global 'products'
    if (window.products && Array.isArray(window.products)) {
        // Asegurarse de que todos los productos tengan ID
        const productsWithId = window.products.map((p, index) => ({
            ...p,
            id: p.id || Date.now() + index
        }));
        
        saveProducts([...productsWithId]);
        loadProducts();
        showNotification(`✅ Se importaron ${productsWithId.length} productos desde products.js`, 'success');
        exportToJSON();
    } else {
        showNotification('❌ No se encontraron productos en products.js', 'error');
    }
}

function previewProducts() {
    const products = getProducts();
    if (products.length === 0) {
        showNotification('ℹ️ No hay productos para previsualizar', 'info');
        return;
    }
    
    let preview = '=== VISTA PREVIA DE PRODUCTOS ===\n\n';
    products.forEach((p, i) => {
        preview += `${i+1}. ${p.name}\n`;
        preview += `   Precio: $${p.price.toLocaleString('es-MX')}\n`;
        preview += `   Categoría: ${getCategoryName(p.category)}\n`;
        preview += `   Imagen: ${p.image}\n`;
        if (p.description) preview += `   Descripción: ${p.description}\n`;
        preview += '\n';
    });
    
    preview += `\n=== TOTAL: ${products.length} productos ===\n`;
    preview += `Valor total: $${products.reduce((sum, p) => sum + p.price, 0).toLocaleString('es-MX')} MXN`;
    
    alert(preview);
}

// ===== UTILIDADES =====
function showNotification(message, type = 'info') {
    // Eliminar notificaciones anteriores
    const oldNotifications = document.querySelectorAll('.notification');
    oldNotifications.forEach(n => n.remove());
    
    // Crear notificación
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    const icon = type === 'success' ? 'fa-check-circle' : 
                 type === 'error' ? 'fa-exclamation-circle' : 
                 type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle';
    
    notification.innerHTML = `
        <i class="fas ${icon}"></i>
        <span>${message}</span>
    `;
    
    // Estilos
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#28a745' : 
                    type === 'error' ? '#dc3545' : 
                    type === 'warning' ? '#ffc107' : '#17a2b8'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 3000;
        animation: slideInRight 0.3s ease;
        max-width: 400px;
    `;
    
    document.body.appendChild(notification);
    
    // Remover después de 4 segundos
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 4000);
}

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', function() {
    // Añadir estilos para animaciones de notificaciones
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
    
    // Verificar si ya está logueado
    if (localStorage.getItem('adminLoggedIn') === 'true') {
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('adminPanel').style.display = 'block';
        
        // Inicializar el panel
        setTimeout(() => {
            loadProducts();
            exportToJSON();
        }, 100);
    }
    
    // Inicializar ayuda del selector de imágenes
    if (typeof onCategoryChange === 'function') {
        onCategoryChange();
    }
    
    // Mostrar advertencia si CONFIG no está configurado
    if (CONFIG.GITHUB_USER === 'TuUsuarioDeGitHub') {
        console.warn('⚠️ CONFIGURACIÓN REQUERIDA: Cambia CONFIG.GITHUB_USER en admin.js');
        if (typeof showNotification === 'function') {
            showNotification('⚠️ Configura tu usuario de GitHub en admin.js', 'warning');
        }
    }
});
