// main.js - CA~Boutique
// Versión optimizada sin animación floating que causa problemas

// ============================================
// BASE DE DATOS DE PRODUCTOS (referencia)
// ============================================
// Nota: Los productos reales están en products.js

// ============================================
// FUNCIONES PRINCIPALES
// ============================================

// 1. VERIFICAR HORARIO EN TIEMPO REAL (CORREGIDO)
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
      
      // Calcular cuándo cierra
      if (totalMinutes < 720) {
        statusText += ' • Cierra a las 12:00 PM';
      } else if (totalMinutes < 840) {
        statusText += ' • Reabre a las 2:00 PM';
      } else {
        statusText += ' • Cierra a las 5:00 PM';
      }
    } else {
      statusText = 'Cerrados. Horario: 9:00 AM - 12:00 PM y 2:00 PM - 5:00 PM';
      statusClass = 'status-closed';
      
      // Calcular cuándo abre
      if (totalMinutes < 540) {
        statusText += ' • Abre a las 9:00 AM';
      } else if (totalMinutes < 840) {
        statusText += ' • Reabre a las 2:00 PM';
      } else {
        statusText += ' • Abre mañana a las 9:00 AM';
      }
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
      
      if (totalMinutes >= 540) {
        statusText += ' • Cierra a la 1:00 AM';
      }
    } else {
      statusText = 'Cerrados. Horario: 9:00 AM - 1:00 AM';
      statusClass = 'status-closed';
      statusText += ' • Abre el lunes a las 9:00 AM';
    }
  }

  // Actualizar el indicador visual
  const statusBar = document.getElementById('storeStatus');
  const statusDot = document.getElementById('statusDot');
  const statusTextEl = document.getElementById('statusText');
  
  if (statusBar && statusDot && statusTextEl) {
    // CORRECCIÓN: Remover clase "floating" y cualquier transform
    statusBar.className = `status-bar ${statusClass}`;
    statusTextEl.textContent = statusText;
    
    // Eliminar cualquier estilo inline problemático
    statusBar.style.transform = 'none';
    statusBar.style.animation = 'none';
    
    // Efecto de parpadeo suave SOLO cuando está por cerrar
    if (isOpen) {
      const closingSoon = 
        (day >= 1 && day <= 6 && 
         ((totalMinutes >= 700 && totalMinutes <= 720) || 
          (totalMinutes >= 1000 && totalMinutes <= 1020))) ||
        (day === 0 && (totalMinutes >= 1380 || totalMinutes <= 60));
      
      if (closingSoon) {
        statusBar.style.animation = 'pulse 2s infinite';
      } else {
        statusBar.style.animation = 'none';
      }
    } else {
      statusBar.style.animation = 'none';
    }
  }
  setTimeout(adjustLayoutHeights, 100);
  return isOpen;
}

// 2. MOSTRAR PRODUCTOS DESTACADOS
function displayFeaturedProducts() {
  const container = document.getElementById('productosDestacados');
  if (!container || !products) return;

  // Seleccionar 4 productos aleatorios
  const featured = [...products]
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

// 3. OBTENER NOMBRE LEGIBLE DE CATEGORÍA
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

// 4. EFECTO DE DESPLAZAMIENTO SUAVE
function initSmoothScroll() {
  // Solo inicializar en index.html
  if (window.location.pathname.includes('index.html') || 
      window.location.pathname === '/' || 
      window.location.pathname.endsWith('/CA-Boutique/')) {
    
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          const headerHeight = document.querySelector('header').offsetHeight;
          const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
          
          window.scrollTo({
            top: targetPosition - headerHeight - 10,
            behavior: 'smooth'
          });
        }
      });
    });
  }
}

// 5. AJUSTAR PADDING DEL BODY DINÁMICAMENTE
function adjustBodyPadding() {
  const header = document.querySelector('header');
  const statusBar = document.getElementById('storeStatus');
  
  if (header && statusBar) {
    const headerHeight = header.offsetHeight;
    const statusHeight = statusBar.offsetHeight;
    document.body.style.paddingTop = (headerHeight + statusHeight) + 'px';
  }
}

// 6. MENÚ MÓVIL RESPONSIVE
function initMobileMenu() {
  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('nav');
  
  if (menuToggle && nav) {
    menuToggle.addEventListener('click', () => {
      nav.classList.toggle('active');
      // Cambiar ícono
      menuToggle.innerHTML = nav.classList.contains('active') 
        ? '<i class="fas fa-times"></i>' 
        : '<i class="fas fa-bars"></i>';
    });
    
    // Cerrar menú al hacer clic en un enlace
    document.querySelectorAll('nav a').forEach(link => {
      link.addEventListener('click', () => {
        if (nav.classList.contains('active')) {
          nav.classList.remove('active');
          menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
        }
      });
    });
  }
}

// 7. OBSERVER PARA ANIMACIONES AL SCROLL
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-fade-up');
        observer.unobserve(entry.target);
      }
    });
  }, { 
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  // Observar elementos que queremos animar
  document.querySelectorAll('.categoria-card, .product-card').forEach(el => {
    el.style.opacity = '0';
    observer.observe(el);
  });
}

// 8. AJUSTAR LAYOUT AL REDIMENSIONAR VENTANA
function handleResize() {
  adjustBodyPadding();
  checkStoreStatus();
}

// ============================================
// INICIALIZACIÓN PRINCIPAL
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  console.log('✨ CA~Boutique - Inicializando...');
  
  try {
    // 1. Verificar horario inmediatamente
    checkStoreStatus();
    
    // 2. Mostrar productos destacados (solo si estamos en index.html)
    if (document.getElementById('productosDestacados')) {
      displayFeaturedProducts();
    }
    
    // 3. Inicializar componentes
    initSmoothScroll();
    adjustBodyPadding();
    initMobileMenu();
    initScrollAnimations();
    
    // 4. Actualizar horario cada minuto
    setInterval(checkStoreStatus, 60000);
    
    // 5. Manejar redimensionamiento de ventana
    window.addEventListener('resize', handleResize);
    
    // 6. Ajustar el año en el footer
    const currentYear = document.querySelector('#currentYear');
    if (currentYear) {
      currentYear.textContent = new Date().getFullYear();
    }
    
    // 7. Agregar íconos FontAwesome si no están cargados
    if (!document.querySelector('.fa')) {
      const faLink = document.createElement('link');
      faLink.rel = 'stylesheet';
      faLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css';
      document.head.appendChild(faLink);
    }
    
  } catch (error) {
    console.error('Error durante la inicialización:', error);
  }
});

// ============================================
// ANIMACIONES CSS GLOBALES
// ============================================
const globalStyles = document.createElement('style');
globalStyles.innerHTML = `
  /* Animación fade-up para elementos al scroll */
  .animate-fade-up {
    animation: fadeInUp 0.8s ease-out forwards;
  }
  
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  /* Animación pulse para estado "por cerrar" */
  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.8; }
    100% { opacity: 1; }
  }
  
  /* Prevenir animaciones problemáticas en elementos fijos */
  .status-bar {
    animation: none !important;
    transform: none !important;
  }
  
  /* Estilos para mensajes de consola */
  @media (max-width: 768px) {
    .status-bar {
      font-size: 0.8rem !important;
    }
  }
`;
document.head.appendChild(globalStyles);

// ============================================
// MANEJADOR DE ERRORES GLOBAL
// ============================================
window.addEventListener('error', (event) => {
  console.error('Error global:', event.error);
  
  // Intentar recuperar el estado del sitio
  const statusBar = document.getElementById('storeStatus');
  if (statusBar) {
    statusBar.className = 'status-bar';
    statusBar.innerHTML = '<span class="status-dot"></span><span class="status-text">Horario: Lunes a sábado 9-12 y 2-5, Domingo 9-1</span>';
  }
});

// ============================================
// POLYFILLS PARA COMPATIBILIDAD
// ============================================
// IntersectionObserver polyfill para navegadores antiguos
if (!window.IntersectionObserver) {
  console.warn('IntersectionObserver no soportado, desactivando animaciones scroll');
  
  // Fallback: mostrar todo inmediatamente
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.categoria-card, .product-card').forEach(el => {
      el.style.opacity = '1';
    });
  });
}

// ============================================
// LOGO PERSONALIZADO EN CONSOLA
// ============================================
console.log('%c✨ CA~Boutique ✨', 'font-size: 16px; color: #c9a77c; font-weight: bold;');
console.log('%cModa y elegancia para toda la familia', 'color: #8c7b6b;');
console.log('%cHorario: Lunes a sábado 9-12 y 2-5, Domingo 9-1', 'color: #2d2d2d;');

// ============================================
// FUNCIONES DE DEPURACIÓN (solo desarrollo)
// ============================================
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  window.debugLayout = function() {
    const header = document.querySelector('header');
    const statusBar = document.getElementById('storeStatus');
    
    if (header && statusBar) {
      console.log('🔍 DEPURACIÓN DE LAYOUT:');
      console.log('- Status-bar height:', statusBar.offsetHeight, 'px');
      console.log('- Header height:', header.offsetHeight, 'px');
      console.log('- Body padding-top:', document.body.style.paddingTop);
      console.log('- Header top:', header.style.top);
      console.log('- Status-bar z-index:', window.getComputedStyle(statusBar).zIndex);
      console.log('- Header z-index:', window.getComputedStyle(header).zIndex);
    }
  };
  
  // Ejecutar depuración después de 1 segundo
  setTimeout(window.debugLayout, 1000);
}
function adjustLayoutHeights() {
  const statusBar = document.getElementById('storeStatus');
  const header = document.querySelector('header');
  
  if (statusBar && header) {
    const statusHeight = statusBar.offsetHeight;
    const headerHeight = header.offsetHeight;
    
    // Ajustar posición del header
    header.style.top = `${statusHeight}px`;
    
    // Ajustar padding del body
    document.body.style.paddingTop = `${statusHeight + headerHeight}px`;
  }
}

// Llamar al cargar y cuando cambie el tamaño de ventana
document.addEventListener('DOMContentLoaded', () => {
  adjustLayoutHeights();
  window.addEventListener('resize', adjustLayoutHeights);
});
