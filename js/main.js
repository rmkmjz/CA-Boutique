// Base de funciones mejoradas para CA~Boutique

// === FUNCIONES PRINCIPALES ===

// 1. Verificar horario en tiempo real con animaciones
function checkStoreStatus() {
  const now = new Date();
  const day = now.getDay();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const totalMinutes = hours * 60 + minutes;

  let isOpen = false;
  let statusText = '';
  let statusClass = '';
  let nextChange = '';

  // Horarios actualizados
  const schedule = {
    weekdays: {
      open1: 540,  // 9:00
      close1: 720, // 12:00
      open2: 840,  // 14:00
      close2: 1020 // 17:00
    },
    sunday: {
      open: 540,   // 9:00
      close: 60    // 1:00 AM (día siguiente)
    }
  };

  // Lunes a sábado (1-6)
  if (day >= 1 && day <= 6) {
    if ((totalMinutes >= schedule.weekdays.open1 && totalMinutes <= schedule.weekdays.close1) ||
        (totalMinutes >= schedule.weekdays.open2 && totalMinutes <= schedule.weekdays.close2)) {
      isOpen = true;
      statusText = '¡Estamos ABiertos! Horario: 9:00 AM - 12:00 PM y 2:00 PM - 5:00 PM';
      statusClass = 'status-open';
      
      // Calcular cuándo cierra
      if (totalMinutes < schedule.weekdays.close1) {
        nextChange = `Cierra a las 12:00 PM`;
      } else if (totalMinutes < schedule.weekdays.open2) {
        nextChange = `Reabre a las 2:00 PM`;
      } else {
        nextChange = `Cierra a las 5:00 PM`;
      }
    } else {
      statusText = 'Cerrados. Horario: 9:00 AM - 12:00 PM y 2:00 PM - 5:00 PM';
      statusClass = 'status-closed';
      
      // Calcular cuándo abre
      if (totalMinutes < schedule.weekdays.open1) {
        nextChange = `Abre a las 9:00 AM`;
      } else if (totalMinutes < schedule.weekdays.open2) {
        nextChange = `Reabre a las 2:00 PM`;
      } else {
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        nextChange = `Abre mañana a las 9:00 AM`;
      }
    }
  } 
  // Domingo (0)
  else if (day === 0) {
    if (totalMinutes >= schedule.sunday.open || totalMinutes <= schedule.sunday.close) {
      isOpen = true;
      statusText = '¡Estamos ABiertos! Horario: 9:00 AM - 1:00 AM';
      statusClass = 'status-open';
      
      if (totalMinutes >= schedule.sunday.open) {
        nextChange = `Cierra a la 1:00 AM`;
      }
    } else {
      statusText = 'Cerrados. Horario: 9:00 AM - 1:00 AM';
      statusClass = 'status-closed';
      nextChange = `Abre el lunes a las 9:00 AM`;
    }
  }

  // Actualizar UI
  const statusBar = document.getElementById('storeStatus');
  const statusDot = document.getElementById('statusDot');
  const statusTextEl = document.getElementById('statusText');
  
  if (statusBar && statusDot && statusTextEl) {
    // Animación de cambio de estado
    statusBar.style.opacity = '0.7';
    statusBar.style.transform = 'translateY(-5px)';
    
    setTimeout(() => {
      statusBar.className = `status-bar ${statusClass} floating`;
      statusTextEl.textContent = `${statusText} • ${nextChange}`;
      statusBar.style.opacity = '1';
      statusBar.style.transform = 'translateY(0)';
    }, 300);

    // Efecto especial cuando está por cerrar
    if (isOpen) {
      const closingSoon = 
        (day >= 1 && day <= 6 && 
         ((totalMinutes >= schedule.weekdays.close1 - 30 && totalMinutes <= schedule.weekdays.close1) || 
          (totalMinutes >= schedule.weekdays.close2 - 30 && totalMinutes <= schedule.weekdays.close2))) ||
        (day === 0 && totalMinutes >= schedule.sunday.close - 60);
      
      if (closingSoon) {
        statusBar.classList.add('glowing');
      } else {
        statusBar.classList.remove('glowing');
      }
    }
  }

  return { isOpen, nextChange };
}

// 2. Mostrar productos destacados con efectos
function displayFeaturedProducts() {
  const container = document.getElementById('productosDestacados');
  if (!container) return;

  // Seleccionar productos destacados (los primeros 4 con mejor categoría)
  const featured = [...products]
    .sort((a, b) => {
      // Priorizar ciertas categorías
      const priority = { 'accesorios': 3, 'joyeria': 2, 'zapatos': 1 };
      const priorityA = priority[a.category] || 0;
      const priorityB = priority[b.category] || 0;
      return priorityB - priorityA || b.price - a.price;
    })
    .slice(0, 4);

  container.innerHTML = featured.map((product, index) => `
    <div class="product-card" style="animation-delay: ${index * 0.1}s">
      <div class="product-img-container">
        <img src="${product.image}" alt="${product.name}" class="product-img">
        <div class="product-badge">Destacado</div>
      </div>
      <div class="product-info">
        <h3>${product.name}</h3>
        <p class="category">${getCategoryName(product.category)}</p>
        <p class="price">${product.price.toLocaleString('es-MX')}</p>
      </div>
    </div>
  `).join('');

  // Añadir observador para animaciones al scroll
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animation = 'fadeInUp 0.8s ease-out forwards';
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.product-card').forEach(card => {
    card.style.opacity = '0';
    observer.observe(card);
  });
}

// 3. Obtener nombre legible de categoría
function getCategoryName(categoryKey) {
  const categories = {
    hombre: 'Ropa Hombre',
    mujer: 'Ropa Mujer',
    ninos: 'Ropa Niños',
    accesorios: 'Accesorios',
    cuidado: 'Cuidado Personal',
    zapatos: 'Calzado',
    joyeria: 'Joyería'
  };
  return categories[categoryKey] || categoryKey;
}

// 4. Efecto de desplazamiento suave mejorado
function initSmoothScroll() {
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
          top: targetPosition - headerHeight - 20,
          behavior: 'smooth'
        });
      }
    });
  });
}

// 5. Efecto de scroll en el header
function initScrollHeader() {
  const header = document.querySelector('header');
  let lastScroll = 0;
  
  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    // Efecto de sombra y padding al hacer scroll
    if (currentScroll > 100) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    
    // Ocultar/mostrar header al hacer scroll
    if (currentScroll > lastScroll && currentScroll > 200) {
      header.style.transform = 'translateY(-100%)';
    } else {
      header.style.transform = 'translateY(0)';
    }
    
    lastScroll = currentScroll;
  });
}

// 6. Menú móvil
function initMobileMenu() {
  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('nav');
  
  if (menuToggle && nav) {
    menuToggle.addEventListener('click', () => {
      nav.classList.toggle('active');
      menuToggle.innerHTML = nav.classList.contains('active') ? 
        '<i class="fas fa-times"></i>' : 
        '<i class="fas fa-bars"></i>';
    });
    
    // Cerrar menú al hacer clic en enlace
    document.querySelectorAll('nav a').forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('active');
        menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
      });
    });
  }
}

// 7. Animación de aparición de elementos
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  // Observar elementos que queremos animar
  document.querySelectorAll('.categoria-card, .info-contacto > div').forEach(el => {
    observer.observe(el);
  });
}

// 8. Preloader (opcional)
function initPreloader() {
  const preloader = document.createElement('div');
  preloader.id = 'preloader';
  preloader.innerHTML = `
    <div class="preloader-content">
      <div class="spinner"></div>
      <p>Cargando elegancia...</p>
    </div>
  `;
  document.body.appendChild(preloader);
  
  // Estilos para preloader
  const style = document.createElement('style');
  style.innerHTML = `
    #preloader {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: var(--light);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
      transition: opacity 0.5s ease;
    }
    .preloader-content {
      text-align: center;
    }
    .spinner {
      width: 60px;
      height: 60px;
      border: 4px solid var(--light-gray);
      border-top-color: var(--accent);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    #preloader p {
      color: var(--primary);
      font-size: 1.2rem;
      font-weight: 300;
    }
  `;
  document.head.appendChild(style);
  
  // Remover preloader cuando cargue la página
  window.addEventListener('load', () => {
    setTimeout(() => {
      preloader.style.opacity = '0';
      setTimeout(() => {
        preloader.remove();
      }, 500);
    }, 1000);
  });
}

// === INICIALIZACIÓN ===
document.addEventListener('DOMContentLoaded', () => {
  console.log('✨ CA~Boutique - Inicializando...');
  
  // Inicializar componentes
  checkStoreStatus();
  displayFeaturedProducts();
  initSmoothScroll();
  initScrollHeader();
  initMobileMenu();
  initScrollAnimations();
  initPreloader();
  
  // Actualizar horario cada minuto
  setInterval(checkStoreStatus, 60000);
  
  // Ajustar padding para header fijo
  const header = document.querySelector('header');
  if (header) {
    document.body.style.paddingTop = header.offsetHeight + 'px';
  }
  
  // Añadir año actual al footer
  const footerYear = document.querySelector('footer p:first-child');
  if (footerYear) {
    const year = new Date().getFullYear();
    footerYear.innerHTML = footerYear.innerHTML.replace('2025', year);
  }
});

// === ANIMACIONES CSS GLOBALES ===
const globalStyles = document.createElement('style');
globalStyles.innerHTML = `
  .animate-in {
    animation: fadeInUp 0.8s ease-out forwards;
  }
  
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .product-card {
    opacity: 0;
  }
  
  .categoria-card,
  .info-contacto > div {
    opacity: 0;
  }
  
  header {
    transition: transform 0.4s ease, background-color 0.4s ease, padding 0.4s ease;
  }
`;
document.head.appendChild(globalStyles);

// === CONSOLA PERSONALIZADA ===
console.log('%c✨ CA~Boutique ✨', 'font-size: 24px; color: #D4AF37; font-weight: bold;');
console.log('%cSitio profesional de moda y accesorios', 'color: #8B735B; font-size: 14px;');