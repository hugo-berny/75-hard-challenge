// ─────────────────────────────────────────
// CONFIGURACIÓN SUPABASE
// (pon tus credenciales reales aquí)
// ─────────────────────────────────────────
const SUPABASE_URL = 'https://lhwzmttuaslussdyfyer.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_uGTZBerchs2GYIvhDhC4fw_fIl7-JND';

async function supabaseQuery(method, path, body = null) {
  const options = {
    method,
    headers: {
      'Content-Type':  'application/json',
      'apikey':        SUPABASE_ANON_KEY,
      'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
      'Prefer':        method === 'POST' ? 'resolution=merge-duplicates' : '',
    },
  };
  if (body) options.body = JSON.stringify(body);
  const res = await fetch(SUPABASE_URL + '/rest/v1/' + path, options);
  if (!res.ok) {
    const err = await res.text();
    console.error('Supabase error:', err);
    return null;
  }
  return res.status === 204 ? null : await res.json();
}


// ─────────────────────────────────────────
// 1. ESTADO GLOBAL
// ─────────────────────────────────────────
let diaActual = null;


// ─────────────────────────────────────────
// 2. CLIC EN UN DÍA DEL CALENDARIO
// ─────────────────────────────────────────
const botonesDia = document.querySelectorAll('.day');

botonesDia.forEach(function(boton) {
  boton.addEventListener('click', async function() {
    botonesDia.forEach(function(b) { b.classList.remove('selected'); });
    boton.classList.add('selected');
    diaActual = boton.getAttribute('data-day');
    document.querySelector('.actual-day h2').textContent = 'Día: ' + diaActual;
    await cargarDia(diaActual);
  });
});


// ─────────────────────────────────────────
// 3. CARGAR CHECKBOXES DE UN DÍA DESDE SUPABASE
// ─────────────────────────────────────────
async function cargarDia(dia) {
  const filas = await supabaseQuery(
    'GET',
    'progreso?dia=eq.' + dia + '&select=usuario,tarea,completada'
  );

  const mapa = {};
  if (filas) {
    filas.forEach(function(fila) {
      mapa[fila.usuario + '-' + fila.tarea] = fila.completada;
    });
  }

  const checkboxes = document.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach(function(checkbox) {
    const key = checkbox.getAttribute('data-user') + '-' + checkbox.getAttribute('data-task');
    checkbox.checked = mapa[key] === true;
  });

  // El DOM ya refleja el día cargado, actualizamos su barra
  actualizarBarraDesdeDOM(diaActual);
}


// ─────────────────────────────────────────
// 4. GUARDAR AL MARCAR / DESMARCAR UN CHECKBOX
// ─────────────────────────────────────────
const checkboxes = document.querySelectorAll('input[type="checkbox"]');

checkboxes.forEach(function(checkbox) {
  checkbox.addEventListener('change', async function() {
    if (!diaActual) {
      alert('Primero selecciona un día del calendario');
      checkbox.checked = false;
      return;
    }

    const usuario = checkbox.getAttribute('data-user');
    const tarea   = checkbox.getAttribute('data-task');
    const valor   = checkbox.checked;

    await supabaseQuery('POST', 'progreso', {
      dia:        parseInt(diaActual),
      usuario:    usuario,
      tarea:      tarea,
      completada: valor,
    });

    // DOM ya actualizado por el evento, solo pintamos la barra
    actualizarBarraDesdeDOM(diaActual);
  });
});


// ─────────────────────────────────────────
// 5. FUNCIONES DE BARRA DE PROGRESO
// ─────────────────────────────────────────

// Pinta la barra de UN día en el calendario dado un número de completadas
function pintarBarra(dia, completadas) {
  const porcentaje = (completadas / 10) * 100;
  const boton = document.querySelector('.day[data-day="' + dia + '""]');
  if (boton) {
    boton.querySelector('.progress-fill').style.width = porcentaje + '%';
  }
}

// Cuenta los checkboxes marcados en el DOM y pinta la barra del día activo
// Válido porque el DOM siempre refleja el día que está cargado
function actualizarBarraDesdeDOM(dia) {
  const completadas = [...document.querySelectorAll('input[type="checkbox"]')]
    .filter(function(cb) { return cb.checked; }).length;
  pintarBarra(dia, completadas);
}

// Carga TODOS los días desde Supabase y pinta sus barras
// Se llama una sola vez al abrir la página
async function cargarTodasLasBarras() {
  const filas = await supabaseQuery('GET', 'progreso?completada=eq.true&select=dia');
  if (!filas) return;

  // Contamos cuántas tareas completadas tiene cada día
  const conteo = {};
  filas.forEach(function(f) {
    conteo[f.dia] = (conteo[f.dia] || 0) + 1;
  });

  // Pintamos todos los 75 días con sus datos reales
  for (let i = 1; i <= 75; i++) {
    pintarBarra(i, conteo[i] || 0);
  }
}


// ─────────────────────────────────────────
// 6. INICIO — dibuja todas las barras al abrir la página
// ─────────────────────────────────────────
cargarTodasLasBarras();