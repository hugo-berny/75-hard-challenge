const SUPABASE_URL = 'https://TU_PROYECTO.supabase.co';
const SUPABASE_ANON_KEY = 'TU_ANON_KEY_AQUI';

async function supabaseQuery(method, path, body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
      'Prefer': method === 'POST' ? 'resolution=merge-duplicates' : '',
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
  boton.addEventListener('click', async function() {

    // Quitamos la clase "selected" a todos los botones
    botonesDia.forEach(function(b) { b.classList.remove('selected'); });

    // Se la ponemos solo al que se acaba de clickear
    boton.classList.add('selected');

    // Guardamos qué día es (el número del atributo data-day)
    diaActual = boton.getAttribute('data-day');

    // Mostramos el número en el título "Día: "
    document.querySelector('.actual-day h2').textContent = 'Día: ' + diaActual;

    // Cargamos los checkboxes de ese día
    await cargarDia(diaActual);
  });
});


// ─────────────────────────────────────────
// 3. CARGAR EL ESTADO DE LOS CHECKBOXES DE UN DÍA
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

  actualizarTodasLasBarras();
}


// ─────────────────────────────────────────
// 4. GUARDAR CUANDO SE MARCA O DESMARCA UN CHECKBOX
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

  actualizarBarra(diaActual);
});
});


async function cargarTodasLasBarras() {
  const filas = await supabaseQuery('GET', 'progreso?completada=eq.true&select=dia');
  if (!filas) return;

  const conteo = {};
  filas.forEach(function(f) {
    conteo[f.dia] = (conteo[f.dia] || 0) + 1;
  });

  for (let i = 1; i <= 75; i++) {
    const completadas = conteo[i] || 0;
    const porcentaje  = (completadas / 10) * 100;
    const boton = document.querySelector('.day[data-day="' + i + '"]');
    if (boton) {
      boton.querySelector('.progress-fill').style.width = porcentaje + '%';
    }
  }
}

function actualizarBarra(dia) {
  let completadas = 0;
  document.querySelectorAll('input[type="checkbox"]').forEach(function(cb) {
    if (cb.checked) completadas++;
  });
  const porcentaje = (completadas / 10) * 100;
  const boton = document.querySelector('.day[data-day="' + dia + '"]');
  if (boton) {
    boton.querySelector('.progress-fill').style.width = porcentaje + '%';
  }
}

function actualizarTodasLasBarras() {
  if (diaActual) actualizarBarra(diaActual);
}

cargarTodasLasBarras();