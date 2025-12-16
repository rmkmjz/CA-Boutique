// ============================================
// SISTEMA ADMINISTRATIVO - CA~Boutique
// ============================================

// Clave para almacenamiento local
const STORAGE_KEY = 'ca_boutique_products_admin';
let currentEditId = null;
let deleteCallback = null;

// ===== FUNCIONES DE AUTENTICACIÓN =====
function loginAdmin() {
    const password = document.getElementById('password').value;
    const ADMIN_PASSWORD = "CAadmin2024!"; // Cambia esta contraseña
    
    if (password === ADMIN_PASSWORD) {
        localStorage.setItem('adminLoggedIn', 'true');
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('adminPanel').style.display = 'block';
        loadProducts();
        showNotification('¡Bienvenido al panel administrativo!', 'success');
    } else {
        document.getElementById('loginError').textContent = 'Contraseña incorrecta';
    }
}

function logoutAdmin() {
    localStorage.removeItem('adminLoggedIn');
    location.reload();
}

// ===== FUNCIONES CRUD =====
function loadProducts() {
    let products = getProducts();
    renderProductsTable(products);
    updateStats(products);
}

function getProducts() {
    // Primero intentar desde localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        return JSON.parse(stored);
    } else {
        // Si no hay en localStorage, usar los de products.js
        return [...products]; // Copia del array original
    }
}

function saveProducts(productsArray) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(productsArray));
    updateStats(productsArray);
}

function saveProduct() {
    const name = document.getElementById('productName').value.trim();
    const price = parseFloat(document.getElementById('productPrice').value);
    const category = document.getElementById('productCategory').value;
    const image = document.getElementById('productImage').value.trim();
    const description = document.getElementById('productDescription').value.trim();
    const editId = document.getElementById('editId').value;

    // Validaciones
    if (!name || !price || !category || !image) {
        showNotification('Por favor completa todos los campos obligatorios (*)', 'error');
        return;
    }

    if (isNaN(price) || price < 0) {
        showNotification('El precio debe ser un número válido', 'error');
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
            showNotification('Producto actualizado correctamente', 'success');
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
        showNotification('Producto agregado correctamente', 'success');
    }

    saveProducts(products);
    renderProductsTable(products);
    clearForm();
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
        
        // Scroll al formulario
        document.getElementById('productName').focus();
        document.querySelector('.admin-form').scrollIntoView({ behavior: 'smooth' });
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
        showNotification('Producto eliminado correctamente', 'success');
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
}

function cancelEdit() {
    clearForm();
    showNotification('Edición cancelada', 'info');
}

// ===== RENDERIZADO DE TABLA =====
function renderProductsTable(productsArray) {
    const tbody = document.getElementById('productsList');
    const emptyState = document.getElementById('emptyState');
    
    if (productsArray.length === 0) {
        tbody.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    
    // Ordenar por ID (más nuevos primero)
    productsArray.sort((a, b) => b.id - a.id);
    
    tbody.innerHTML = productsArray.map(product => `
        <tr>
            <td><span class="product-id">${product.id}</span></td>
            <td>
                <img src="${product.image}" alt="${product.name}" 
                     class="product-img-small"
                     onerror="this.src='https://via.placeholder.com/50x50/e9ecef/6c757d?text=IMG'">
            </td>
            <td>
                <div class="product-name">${product.name}</div>
                ${product.description ? `<small class="text-muted">${product.description}</small>` : ''}
            </td>
            <td><strong>$${product.price.toLocaleString('es-MX')}</strong></td>
            <td>
                <span class="product-category">${getCategoryName(product.category)}</span>
            </td>
            <td>
                <div class="product-actions">
                    <button class="btn-action btn-edit" onclick="editProduct(${product.id})">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn-action btn-delete" onclick="deleteProduct(${product.id})">
                        <i class="fas fa-trash"></i> Eliminar
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
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const categoryFilter = document.getElementById('categoryFilter').value;
    const products = getProducts();
    
    const filtered = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm) ||
                            (product.description && product.description.toLowerCase().includes(searchTerm));
        const matchesCategory = !categoryFilter || product.category === categoryFilter;
        
        return matchesSearch && matchesCategory;
    });
    
    renderProductsTable(filtered);
}

// ===== ESTADÍSTICAS =====
function updateStats(products) {
    const totalProducts = products.length;
    const totalValue = products.reduce((sum, p) => sum + p.price, 0);
    const categories = new Set(products.map(p => p.category)).size;
    
    document.getElementById('totalProducts').textContent = totalProducts;
    document.getElementById('totalCategories').textContent = categories;
    document.getElementById('totalValue').textContent = totalValue.toLocaleString('es-MX');
}

// ===== EXPORTACIÓN =====
function exportToJSON() {
    const products = getProducts();
    const jsonString = JSON.stringify(products, null, 2);
    
    // Formatear para products.js
    const code = `// Base de datos de productos - CA~Boutique
// Generado automáticamente el ${new Date().toLocaleDateString()}
// ¡NO MODIFICAR MANUALMENTE! Usar el panel administrativo

const products = ${jsonString};`;
    
    document.getElementById('jsonOutput').textContent = code;
    showNotification('Código generado. ¡Copia y pega en products.js!', 'success');
}

function copyCode() {
    const codeElement = document.getElementById('jsonOutput');
    const code = codeElement.textContent;
    
    navigator.clipboard.writeText(code).then(() => {
        showNotification('¡Código copiado al portapapeles!', 'success');
    }).catch(err => {
        console.error('Error al copiar:', err);
        showNotification('Error al copiar. Copia manualmente.', 'error');
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
    
    showNotification('Archivo JSON descargado', 'success');
}

function importFromProductsJS() {
    if (!confirm('¿Importar productos desde products.js? Esto reemplazará los productos actuales.')) {
        return;
    }
    
    // products.js ya está cargado como variable global 'products'
    if (window.products && Array.isArray(window.products)) {
        saveProducts([...window.products]);
        loadProducts();
        showNotification('Productos importados correctamente', 'success');
    } else {
        showNotification('No se encontraron productos en products.js', 'error');
    }
}

function previewProducts() {
    const products = getProducts();
    if (products.length === 0) {
        showNotification('No hay productos para previsualizar', 'info');
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
    
    alert(preview);
}

// ===== UTILIDADES =====
function showNotification(message, type = 'info') {
    // Crear notificación temporal
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Estilos para la notificación
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 3000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Remover después de 3 segundos
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
    
    // Animaciones CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', function() {
    // Verificar si hay productos en localStorage, si no, importar de products.js
    if (!localStorage.getItem(STORAGE_KEY) && window.products && window.products.length > 0) {
        saveProducts([...window.products]);
    }
    
    // Permitir Enter en el campo de contraseña
    document.getElementById('password')?.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            loginAdmin();
        }
    });
    
    // Cargar productos si ya está logueado
    if (localStorage.getItem('adminLoggedIn') === 'true') {
        loadProducts();
        exportToJSON(); // Generar código inicial
    }
});

// ===== ACCESO RÁPIDO DESDE CONSOLA (para desarrollo) =====
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.adminDebug = {
        showProducts: () => console.table(getProducts()),
        clearStorage: () => {
            localStorage.removeItem(STORAGE_KEY);
            console.log('Storage limpiado');
            loadProducts();
        },
        exportData: exportToJSON,
        importData: importFromProductsJS
    };
      }
