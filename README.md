# TurboShop Marketplace Frontend - React + TypeScript + Vite + Tailwind

SPA en React + TypeScript (Vite) + Tailwind para explorar repuestos de diferentes proveedores. Incluye búsqueda, filtros, paginación y actualizaciones en tiempo real vía Server-Sent Events (SSE) unidireccional cuando cambian precios/stock o aparecen nuevas ofertas.

## ⚙️ Requisitos previos
- Node.js
- Yarn

## 🛠️ Instalación y ejecución local
1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/juanmoyalagos/TurboShop-Prueba-Tecnica-Frontend.git
   cd TurboShop-Prueba-Tecnica-Frontend
   ```
2. **Instalar dependencias**
   ```bash
   yarn install
   ```
3. **Configurar variables de entorno**  
   Crea un `.env` en la raíz con:
   ```
   VITE_API_URL=http://localhost:3000
   ```
4. **Levantar en desarrollo**
   ```bash
   yarn dev
   ```
## 📡 SSE y datos en tiempo real
- Se conecta a `VITE_API_URL/sse/events` para recibir cambios de precio/stock y nuevas ofertas sin recargar la página.
- Al recibir eventos `catalog:update_batch` con `offer_created` se hace `refetch` automático de la lista.

## 🧭 Estructura y páginas principales
- Home: vista inicial de bienvenida al marketplace.
- RepuestosPage: listado con búsqueda, filtros y paginación.
  - Búsqueda por nombre y SKU.
  - Filtros por marca, modelo y año de vehículo.
  - Paginación.
- RepuestosDetail: detalle por SKU con ofertas por proveedor.