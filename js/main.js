// Verificar horario de apertura en tiempo real
function checkStoreStatus() {
  const now = new Date();
  const day = now.getDay(); // 0 = Domingo, 1 = Lunes, ... 6 = Sábado
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const totalMinutes = hours * 60 + minutes;

  let isOpen = false;
  let statusText = '';
  let statusClass = '';

  // Lunes a sábado (1-6)
  if (day >= 1 && day <= 6) {
    // 9:00 AM - 12:00 PM (540 - 720 minutos)
    // 2:00 PM - 5:00 PM (840 - 1020 minutos)
    if (
      (totalMinutes >= 540 && totalMinutes <= 720) ||
      (totalMinutes >= 840 && totalMinutes <= 1020)
    ) {
      isOpen = true;
      statusText = '¡Estamos ABiertos! Horario: 9:00 AM - 12:00 PM y 2:00 PM - 5:00 PM';
      statusClass = 'status-open';
    } else {
      statusText = 'Cerrados. Horario: 9:00 AM - 12:00 PM y 2:00 PM - 5:00 PM';
      statusClass = 'status-closed';
    }
  } 
  // Domingo (0)
  else if (day === 0) {
    // 9:00 AM - 1:00 AM (del día siguiente)
    // 9:00 AM = 540 minutos
    // 1:00 AM = 60 minutos (del día siguiente)
    if (totalMinutes >= 540 || totalMinutes <= 60) {
      isOpen = true;
      statusText = '¡Estamos ABiertos! Horario: 9:00 AM - 1:00 AM';
      statusClass = 'status-open';
    } else {
      statusText = 'Cerrados. Horario: 9:00 AM - 1:00 AM';
      statusClass = 'status-closed';
    }
  }

  // Actualizar el indicador visual
  const statusBar = document.getElementById('storeStatus');
  const statusDot = document.getElementById('statusDot');
  const statusTextEl = document.getElementById('statusText');
  
  if (statusBar && statusDot && statusTextEl) {
    statusBar.className = `status-bar ${statusClass}`;
    statusTextEl.textContent = statusText;
    
    // Efecto de parpadeo suave cuando está por cerrar
    if (isOpen) {
      const closingSoon = 
        (day >= 1 && day <= 6 && 
         ((totalMinutes >= 700 && totalMinutes <= 720) || 
          (totalMinutes >= 1000 && totalMinutes <= 1020))) ||
        (day === 0 && (totalMinutes >= 1380 || totalMinutes <= 60));
      
      statusBar.style.animation = closingSoon ? 'pulse 2s infinite' : 'none';
    }
  }

  return isOpen;
}

// Mostrar productos destacados
function displayFeaturedProducts() {
  const container = document.getElementById('productosDestacados');
  if (!container) return;

  // Seleccionar 4 productos aleatorios
  const featured = products
    .sort(() => 0.5 - Math.random())
    .slice(0, 4);

  container.innerHTML = featured.map(product => `
    <div class="product-card">
      <img src="${product.image}" alt="${product.name}" class="product-img">
      <div class="product-info">
        <h3>${product.name}</h3>
        <p class="category">${getCategoryName(product.category)}</p>
        <p class="price">$${product.price.toLocaleString('es-MX')}</p>
      </div>
    </div>
  `).join('');
}

// Obtener nombre legible de categoría
function getCategoryName(categoryKey) {
  const categories = {
    hombre: 'Hombre',
    mujer: 'Mujer',
    ninos: 'Niños',
    accesorios: 'Accesorios',
    cuidado: 'Cuidado Personal',
    zapatos: 'Zapatos',
    joyeria: 'Joyería'
  };
  return categories[categoryKey] || categoryKey;
}

// Efecto de desplazamiento suave
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    document.querySelector(this.getAttribute('href')).scrollIntoView({
      behavior: 'smooth'
    });
  });
});

// Inicializar al cargar la página
document.addEventListener('DOMContentLoaded', () => {
  // Verificar horario inmediatamente
  checkStoreStatus();
  
  // Actualizar horario cada minuto
  setInterval(checkStoreStatus, 60000);
  
  // Mostrar productos destacados
  displayFeaturedProducts();
  
  // Ajustar el margen superior por el header fijo
  document.body.style.paddingTop = document.querySelector('header').offsetHeight + 'px';
});

// Animación CSS para el efecto de parpadeo
const style = document.createElement('style');
style.innerHTML = `
  @keyframes pulse {
    0% { box-shadow: 0 0 0 0 rgba(201, 167, 124, 0.7); }
    70% { box-shadow: 0 0 0 10px rgba(201, 167, 124, 0); }
    100% { box-shadow: 0 0 0 0 rgba(201, 167, 124, 0); }
  }
`;
document.head.appendChild(style);