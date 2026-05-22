# 75 Hard Challenge Tracker

Este es un tablero interactivo para dar seguimiento al reto **75 Hard**. Permite visualizar el progreso diario, marcar tareas completadas y ver la fecha real correspondiente a cada día del reto.

## Estructura del Proyecto

- **`index.html`**: Define la interfaz de usuario. Contiene el calendario de 75 días, los encabezados de progreso y las listas de tareas personalizadas para Clau y Hugo.
- **`styles.css`**: Contiene el diseño visual y la responsividad. Asegura que el tablero se vea bien tanto en computadoras como en dispositivos móviles. Incluye estilos para las barras de progreso y los estados de selección.
- **`script.js`**: El motor del sitio. 
    - Gestiona la interactividad (clics en el calendario y checkboxes).
    - Calcula las fechas reales basadas en el inicio del reto (11 de mayo de 2026).
    - Sincroniza los datos en tiempo real con la base de datos.
    - Selecciona automáticamente el día actual del reto al abrir la aplicación.

## Workflow

1.  **Hospedaje**: La aplicación está desplegada en **Netlify**, lo que permite acceder a ella desde cualquier navegador.
2.  **Persistencia**: Todos los datos de progreso se guardan en **Supabase**. Esto garantiza que la información no se pierda al cerrar el navegador o cambiar de dispositivo.
3.  **Sincronización**: Al seleccionar un día, el sistema consulta a Supabase el estado de las tareas de ese día específico y actualiza la interfaz automáticamente.

---
*Día 1 del reto: Lunes, 11 de mayo de 2026.*
