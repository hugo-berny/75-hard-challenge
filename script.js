// ─────────────────────────────────────────
// 1. ESTADO GLOBAL
// Aquí vivimos qué día está seleccionado
// ─────────────────────────────────────────

let diaActual = null; // Empieza sin ningún día seleccionado


// ─────────────────────────────────────────
// 2. CUANDO HACES CLIC EN UN DÍA DEL CALENDARIO
// ─────────────────────────────────────────

// Agarramos TODOS los botones de día de una vez
const botonesDia = document.querySelectorAll('.day');

// A cada botón le ponemos un "oído" que escucha clics
botonesDia.forEach(function(boton) {
  boton.addEventListener('click', function() {

    // Quitamos la clase "selected" a todos los botones
    botonesDia.forEach(function(b) { b.classList.remove('selected'); });

    // Se la ponemos solo al que se acaba de clickear
    boton.classList.add('selected');

    // Guardamos qué día es (el número del atributo data-day)
    diaActual = boton.getAttribute('data-day');

    // Mostramos el número en el título "Día: "
    document.querySelector('.actual-day h2').textContent = 'Día: ' + diaActual;

    // Cargamos los checkboxes de ese día
    cargarDia(diaActual);
  });
});


// ─────────────────────────────────────────
// 3. CARGAR EL ESTADO DE LOS CHECKBOXES DE UN DÍA
// ─────────────────────────────────────────

function cargarDia(dia) {
  // Leemos lo que hay guardado en localStorage para ese día
  // Si no hay nada guardado, usamos un objeto vacío {}
  const clave = 'dia-' + dia;
  const guardado = localStorage.getItem(clave);
  const estado = guardado ? JSON.parse(guardado) : {};

  // Agarramos todos los checkboxes
  const checkboxes = document.querySelectorAll('input[type="checkbox"]');

  checkboxes.forEach(function(checkbox) {
    const user = checkbox.getAttribute('data-user'); // "clau" o "hugo"
    const task = checkbox.getAttribute('data-task'); // "workout", "pasos", etc.

    // Si existe info guardada para este usuario y esta tarea, la aplicamos
    if (estado[user] && estado[user][task]) {
      checkbox.checked = true;
    } else {
      checkbox.checked = false; // Si no hay info, lo dejamos desmarcado
    }
  });

  // Actualizamos las barras de progreso de todos los días
  actualizarTodasLasBarras();
}


// ─────────────────────────────────────────
// 4. GUARDAR CUANDO SE MARCA O DESMARCA UN CHECKBOX
// ─────────────────────────────────────────

const checkboxes = document.querySelectorAll('input[type="checkbox"]');

checkboxes.forEach(function(checkbox) {
  checkbox.addEventListener('change', function() {

    // Si no hay ningún día seleccionado, no hacemos nada
    if (!diaActual) {
      alert('Primero selecciona un día del calendario');
      checkbox.checked = false; // Revertimos el clic
      return;
    }

    const clave = 'dia-' + diaActual;
    const guardado = localStorage.getItem(clave);
    const estado = guardado ? JSON.parse(guardado) : {};

    const user = checkbox.getAttribute('data-user');
    const task = checkbox.getAttribute('data-task');

    // Si no existe la sección del usuario, la creamos
    if (!estado[user]) { estado[user] = {}; }

    // Guardamos true o false según si está marcado o no
    estado[user][task] = checkbox.checked;

    // Escribimos de vuelta en localStorage
    localStorage.setItem(clave, JSON.stringify(estado));

    // Actualizamos la barra del día actual
    actualizarBarra(diaActual);
  });
});


// ─────────────────────────────────────────
// 5. CALCULAR Y DIBUJAR LA BARRA DE PROGRESO
// ─────────────────────────────────────────

function actualizarBarra(dia) {
  const clave = 'dia-' + dia;
  const guardado = localStorage.getItem(clave);
  const estado = guardado ? JSON.parse(guardado) : {};

  // Contamos cuántas tareas hay en total (5 Clau + 5 Hugo = 10)
  const totalTareas = 10;
  let completadas = 0;

  // Recorremos cada usuario y cada tarea y contamos los true
  for (const user in estado) {
    for (const task in estado[user]) {
      if (estado[user][task] === true) {
        completadas++;
      }
    }
  }

  // Calculamos el porcentaje
  const porcentaje = (completadas / totalTareas) * 100;

  // Encontramos el botón del día correspondiente
  const boton = document.querySelector('.day[data-day="' + dia + '"]');
  if (boton) {
    // Dentro del botón buscamos el div progress-fill y le cambiamos el ancho
    const barra = boton.querySelector('.progress-fill');
    barra.style.width = porcentaje + '%';
  }
}

function actualizarTodasLasBarras() {
  // Recorremos los 75 días y actualizamos cada barra
  for (let i = 1; i <= 75; i++) {
    actualizarBarra(i);
  }
}


// ─────────────────────────────────────────
// 6. AL CARGAR LA PÁGINA, DIBUJAR TODAS LAS BARRAS
// ─────────────────────────────────────────

// Esto se ejecuta una sola vez cuando la página abre
actualizarTodasLasBarras();