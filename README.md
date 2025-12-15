# CA~Boutique - Sitio Web Estático

Sitio web para boutique de ropa y accesorios. Totalmente estático, compatible con GitHub Pages.

## Características
- ✅ Indicador en tiempo real de horario de apertura/cierre
- ✅ Catálogo organizado por categorías (hombre, mujer, niños, etc.)
- ✅ Diseño elegante y responsivo para móviles
- ✅ Productos destacados con imágenes y precios
- ✅ Información de contacto completa

## Horarios configurados
- Lunes a sábado: 9:00 AM - 12:00 PM y 2:00 PM - 5:00 PM
- Domingo: 9:00 AM - 1:00 AM

## Cómo implementar en GitHub Pages
1. Crea un nuevo repositorio en GitHub (público)
2. Sube todos los archivos de este proyecto
3. Ve a Settings > Pages
4. Selecciona la rama `main` y la carpeta `/root`
5. Haz clic en Save
6. Espera 1-2 minutos y accede a tu sitio: `https://tu-usuario.github.io/nombre-repositorio`

## Personalización
- **Logo**: Reemplaza `img/logo.png` con tu logo real
- **Imágenes de productos**: 
  - Crea una carpeta `img/products/`
  - Añade tus imágenes y actualiza las rutas en `js/products.js`
- **Colores**: Modifica las variables CSS en `:root` de `css/style.css`
- **Horario**: Ajusta la lógica en `js/main.js` (función `checkStoreStatus`)

## Notas importantes
- Todas las imágenes de ejemplo usan URLs de Unsplash (gratis para uso comercial)
- No requiere backend ni base de datos
- Totalmente gratis en GitHub Pages
- Para añadir más productos, edita el array `products` en `js/products.js`

## Capturas de pantalla
[Incluir capturas cuando esté en producción]

¡Listo para impresionar a tus clientes!