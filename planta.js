
import { Usuario, Cultivo, RegistroHumedad } from './clases.js';

const BACKEND_URL = 'http://localhost:3000';

let usuarios = [];
let cultivosRegistrados = [];
let mediciones = [];
let tiposCultivos = []; 

let usuarioActual = null; 


const bienvenidaUsuarioSpan = document.getElementById('bienvenida-usuario');
const logoutBtn = document.getElementById('logout-btn');
const menuBtns = document.querySelectorAll('.menu-btn');
const contenidoSecciones = document.querySelectorAll('.contenido-seccion');
const resumenCultivosDiv = document.getElementById('resumen-cultivos'); 

const formRegistroCultivo = document.getElementById('form-registro-cultivo');
const buscarCultivoInput = document.getElementById('buscar-cultivo'); 
const sugerenciasCultivoDiv = document.getElementById('sugerencias-cultivo'); 
const tipoCultivoHiddenInput = document.getElementById('tipo-cultivo'); 
const nombreCultivoInput = document.getElementById('nombre-cultivo');
const hectareasCultivoInput = document.getElementById('hectareas-cultivo');
const ubicacionCultivoInput = document.getElementById('ubicacion-cultivo');

const listaCultivosDiv = document.getElementById('lista-cultivos');
const formHumedadManual = document.getElementById('formHumedadManual');
const selectCultivoHumedad = document.getElementById('select-cultivo-humedad');
const valorHumedadInput = document.getElementById('valor-humedad');

const selectCultivoHistorial = document.getElementById('select-cultivo-historial');
const historialHumedadDiv = document.getElementById('historial-humedad');


const mensajeHumedadRegistroDiv = document.createElement('div');
mensajeHumedadRegistroDiv.id = 'mensaje-humedad-registro';
mensajeHumedadRegistroDiv.style.cssText = 'padding: 10px; margin-top: 10px; border-radius: 5px; font-weight: bold; text-align: center;';



async function cargarDatosDesdeBackend() {
    try {
        const response = await fetch(`${BACKEND_URL}/api/data`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
        }
        const data = await response.json();

        usuarios = (data.usuarios || []).map(u => Usuario.fromJSON(u));
        cultivosRegistrados = (data.cultivos_registrados || []).map(c => Cultivo.fromJSON(c));
        mediciones = (data.mediciones || []).map(m => RegistroHumedad.fromJSON(m));
        tiposCultivos = data.tipos_cultivos || []; 

        console.log('Datos cargados del backend:', { usuarios, cultivosRegistrados, mediciones, tiposCultivos });

        inicializarUI();
        mostrarSeccion('bienvenida');
    } catch (error) {
        console.error('Error al cargar datos desde el backend:', error);
        alert('No se pudieron cargar los datos de la aplicación. Por favor, asegúrate de que el servidor backend esté corriendo.');
    }
}

async function guardarNuevoCultivo(nuevoCultivoData) {
    try {
        const response = await fetch(`${BACKEND_URL}/api/cultivos_registrados`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(nuevoCultivoData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
        }

        const result = await response.json();
        console.log('Cultivo guardado exitosamente:', result.cultivo);

        cultivosRegistrados.push(Cultivo.fromJSON(result.cultivo));
        return true;
    } catch (error) {
        console.error('Error al guardar el nuevo cultivo:', error);
        alert('No se pudo registrar el cultivo. Asegúrate de que el servidor esté funcionando.');
        return false;
    }
}

async function guardarNuevaMedicion(nuevaMedicionData) {
    try {
        const response = await fetch(`${BACKEND_URL}/api/mediciones`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(nuevaMedicionData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
        }

        const result = await response.json();
        console.log('Medición guardada exitosamente:', result.registro);

        mediciones.push(RegistroHumedad.fromJSON(result.registro));
        return true;
    } catch (error) {
        console.error('Error al guardar la nueva medición:', error);
        alert('No se pudo registrar la medición. Asegúrate de que el servidor esté funcionando.');
        return false;
    }
}



function verificarSesion() {
    const loggedInUserString = sessionStorage.getItem('loggedInUser');
    if (loggedInUserString) {
        usuarioActual = Usuario.fromJSON(JSON.parse(loggedInUserString));
        if (bienvenidaUsuarioSpan) {
            bienvenidaUsuarioSpan.textContent = usuarioActual.username;
        }
        console.log('Usuario logeado:', usuarioActual.username);
    } else {
        alert('No has iniciado sesión. Redirigiendo al login.');
        window.location.href = 'index.html';
    }
}

function cerrarSesion() {
    sessionStorage.removeItem('loggedInUser');
    alert('Sesión cerrada. ¡Hasta pronto!');
    window.location.href = 'index.html';
}

function inicializarUI() {
    console.log('UI inicializada con datos del backend.');
    llenarSelectCultivos(selectCultivoHumedad);
    llenarSelectCultivos(selectCultivoHistorial);
    mostrarCultivosDelUsuarioActual();
    setupAutocomplete();
    mostrarResumenCultivos();


    if (formHumedadManual && !document.getElementById('mensaje-humedad-registro')) {
        formHumedadManual.appendChild(mensajeHumedadRegistroDiv);
    }
}

function llenarSelectCultivos(selectElement) {
    if (!selectElement) return;
    selectElement.innerHTML = '<option value="">Seleccione cultivo</option>';
    const cultivosDelUsuario = cultivosRegistrados.filter(c => c.usuarioId === usuarioActual.id);
    cultivosDelUsuario.forEach(cultivo => {
        const option = document.createElement('option');
        option.value = cultivo.id;
        option.textContent = `${cultivo.nombre} (${cultivo.tipo}) - ${cultivo.ubicacion}`;
        selectElement.appendChild(option);
    });
}

function mostrarSeccion(idSeccion) {
    contenidoSecciones.forEach(seccion => {
        seccion.classList.add('hidden');
    });
    document.getElementById(idSeccion).classList.remove('hidden');

    if (idSeccion === 'ver-cultivos') {
        mostrarCultivosDelUsuarioActual();
        llenarSelectCultivos(selectCultivoHumedad);
        llenarSelectCultivos(selectCultivoHistorial);
        historialHumedadDiv.innerHTML = '';
        selectCultivoHistorial.value = '';
    } else if (idSeccion === 'bienvenida') {
        mostrarResumenCultivos();
    }
}

function mostrarCultivosDelUsuarioActual() {
    if (!listaCultivosDiv) return;
    listaCultivosDiv.innerHTML = '';
    const cultivosDelUsuario = cultivosRegistrados.filter(c => c.usuarioId === usuarioActual.id);

    if (cultivosDelUsuario.length === 0) {
        listaCultivosDiv.innerHTML = '<p>No tienes cultivos registrados aún.</p>';
        return;
    }

    cultivosDelUsuario.forEach(cultivo => {
        const cultivoDiv = document.createElement('div');
        cultivoDiv.classList.add('cultivo-card');
        cultivoDiv.innerHTML = `
            <h4>${cultivo.nombre} (${cultivo.tipo})</h4>
            <p><strong>Ubicación:</strong> ${cultivo.ubicacion}</p>
            <p><strong>Hectáreas:</strong> ${cultivo.hectareas}</p>
            <p><strong>Registrado:</strong> ${cultivo.fechaRegistro}</p>
            <p>${cultivo.obtenerDescripcion()}</p>
        `;
        listaCultivosDiv.appendChild(cultivoDiv);
    });
}

function mostrarHistorialHumedad(cultivoId) {
    if (!historialHumedadDiv) return;
    historialHumedadDiv.innerHTML = '';

    const historial = mediciones.filter(m => m.cultivoId == cultivoId)
                                  .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    if (historial.length === 0) {
        historialHumedadDiv.innerHTML = '<p>No hay historial de humedad para este cultivo.</p>';
        return;
    }

    const ul = document.createElement('ul');
    historial.forEach(registro => {
        const li = document.createElement('li');
        li.textContent = `Fecha: ${registro.fecha}, Humedad: ${registro.humedad}%, Observación: ${registro.observacion}`;
        ul.appendChild(li);
    });
    historialHumedadDiv.appendChild(ul);
}

function mostrarResumenCultivos() {
    if (!resumenCultivosDiv) return;
    resumenCultivosDiv.innerHTML = '';

    const cultivosDelUsuario = cultivosRegistrados.filter(c => c.usuarioId === usuarioActual.id);

    if (cultivosDelUsuario.length === 0) {
        resumenCultivosDiv.innerHTML = '<p>Aún no tienes cultivos registrados. ¡Anímate a registrar uno!</p>';
        return;
    }

    const ul = document.createElement('ul');
    ul.innerHTML = '<strong>Tus Cultivos Registrados:</strong>';
    cultivosDelUsuario.forEach(cultivo => {
        const li = document.createElement('li');
        li.textContent = `${cultivo.nombre} (${cultivo.tipo}) - Ubicación: ${cultivo.ubicacion}`;
        ul.appendChild(li);
    });
    resumenCultivosDiv.appendChild(ul);
}


function setupAutocomplete() {
  const inputBusqueda = document.getElementById('buscar-cultivo');
  const contenedorSugerencias = document.getElementById('sugerencias-cultivo');
  const inputOculto = document.getElementById('tipo-cultivo');

  if (!inputBusqueda || !contenedorSugerencias || !inputOculto) {
    console.error("Elementos de autocompletado no encontrados");
    return;
  }

  inputBusqueda.addEventListener('input', function() {
    const termino = this.value.trim().toLowerCase();
    contenedorSugerencias.innerHTML = '';
    inputOculto.value = '';
    
    if (termino.length < 2) {
      contenedorSugerencias.style.display = 'none';
      return;
    }

    const resultados = tiposCultivos
      .filter(cultivo => cultivo.nombre && cultivo.nombre.toLowerCase().includes(termino))
      .slice(0, 5);

    mostrarResultadosAutocomplete(resultados, contenedorSugerencias, inputBusqueda, inputOculto);
  });

  document.addEventListener('click', (e) => {
    if (!inputBusqueda.contains(e.target) && !contenedorSugerencias.contains(e.target)) {
      contenedorSugerencias.style.display = 'none';
    }
  });
}

function mostrarResultadosAutocomplete(resultados, contenedor, inputBusqueda, inputOculto) {
  contenedor.innerHTML = '';
  
  if (resultados.length > 0) {
    resultados.forEach(cultivo => {
      const elemento = document.createElement('div');
      elemento.className = 'sugerencia-item';
      const humedadInfo = (cultivo.humedad_min !== undefined && cultivo.humedad_max !== undefined) ?
                          `<small>Humedad ideal: ${cultivo.humedad_min}%-${cultivo.humedad_max}%</small>` : '';
      elemento.innerHTML = `
        <strong>${cultivo.nombre}</strong>
        ${humedadInfo}
      `;
      
      elemento.addEventListener('click', () => {
        inputBusqueda.value = cultivo.nombre;
        inputOculto.value = cultivo.nombre;
        contenedor.style.display = 'none';
      });
      
      contenedor.appendChild(elemento);
    });
    contenedor.style.display = 'block';
  } else {
    contenedor.style.display = 'none';
  }
}


async function handleHumedadManualSubmit(event) {
    event.preventDefault(); 

    const cultivoId = selectCultivoHumedad.value;
    const humedad = parseFloat(valorHumedadInput.value);

    if (!cultivoId) {
        alert('Por favor, selecciona un cultivo.');
        return;
    }
    if (isNaN(humedad) || humedad < 0 || humedad > 100) {
        alert('Por favor, ingresa un valor de humedad válido (entre 0 y 100).');
        return;
    }

    const cultivoSeleccionado = cultivosRegistrados.find(c => c.id == cultivoId);
    let mensajeHumedadObservacion = ""; 

    if (cultivoSeleccionado) {
        const tipoCultivoInfo = tiposCultivos.find(tc => tc.nombre === cultivoSeleccionado.tipo);

        if (tipoCultivoInfo && tipoCultivoInfo.humedad_min !== undefined && tipoCultivoInfo.humedad_max !== undefined) {
            if (humedad >= tipoCultivoInfo.humedad_min && humedad <= tipoCultivoInfo.humedad_max) {
                mensajeHumedadObservacion = `Adecuado (${tipoCultivoInfo.humedad_min}%-${tipoCultivoInfo.humedad_max}%)`;
            } else if (humedad < tipoCultivoInfo.humedad_min) {
                mensajeHumedadObservacion = `Por debajo de lo ideal (${tipoCultivoInfo.humedad_min}%-${tipoCultivoInfo.humedad_max}%)`;
            } else { 
                mensajeHumedadObservacion = `Por encima de lo ideal (${tipoCultivoInfo.humedad_min}%-${tipoCultivoInfo.humedad_max}%)`;
            }
        } else {
            mensajeHumedadObservacion = `No hay datos de humedad ideal para ${cultivoSeleccionado.tipo}`;
        }
    } else {
        mensajeHumedadObservacion = `Cultivo no encontrado`;
    }

    const nuevaMedicionData = {
        cultivoId: parseInt(cultivoId),
        fecha: new Date().toISOString().split('T')[0],
        humedad: humedad,
        observacion: mensajeHumedadObservacion
    };

    const exito = await guardarNuevaMedicion(nuevaMedicionData);
    if (exito) {
        alert(`Medición registrada exitosamente: ${mensajeHumedadObservacion}`);
        formHumedadManual.reset(); 
        mostrarHistorialHumedad(cultivoId); 
        
       
        mensajeHumedadRegistroDiv.textContent = `Medición registrada: ${mensajeHumedadObservacion}`;
        mensajeHumedadRegistroDiv.style.backgroundColor = '#d4edda'; 
        mensajeHumedadRegistroDiv.style.color = '#155724'; 
        setTimeout(() => {
            mensajeHumedadRegistroDiv.textContent = '';
            mensajeHumedadRegistroDiv.style.backgroundColor = '';
            mensajeHumedadRegistroDiv.style.color = '';
        }, 5000); 

    } else {
         mensajeHumedadRegistroDiv.textContent = 'Error al registrar la medición.';
         mensajeHumedadRegistroDiv.style.backgroundColor = '#f8d7da'; 
         mensajeHumedadRegistroDiv.style.color = '#721c24'; 
         setTimeout(() => {
            mensajeHumedadRegistroDiv.textContent = '';
            mensajeHumedadRegistroDiv.style.backgroundColor = '';
            mensajeHumedadRegistroDiv.style.color = '';
        }, 5000);
    }
    
    return false; 
}



document.addEventListener('DOMContentLoaded', () => {
    verificarSesion();
    cargarDatosDesdeBackend();

    if (logoutBtn) {
        logoutBtn.addEventListener('click', cerrarSesion);
    }

    menuBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            mostrarSeccion(btn.dataset.section);
        });
    });

    if (formRegistroCultivo) {
        formRegistroCultivo.addEventListener('submit', async (event) => {
            event.preventDefault();

            if (!tipoCultivoHiddenInput.value) {
                alert('Por favor, selecciona un tipo de cultivo de la lista sugerida.');
                return;
            }

            const nuevoCultivoData = {
                usuarioId: usuarioActual.id,
                tipo: tipoCultivoHiddenInput.value,
                nombre: nombreCultivoInput.value,
                hectareas: parseFloat(hectareasCultivoInput.value),
                ubicacion: ubicacionCultivoInput.value,
                fechaRegistro: new Date().toISOString().split('T')[0]
            };

            const exito = await guardarNuevoCultivo(nuevoCultivoData);
            if (exito) {
                alert('Cultivo registrado con éxito!');
                formRegistroCultivo.reset();
                tipoCultivoHiddenInput.value = '';
                sugerenciasCultivoDiv.innerHTML = '';
                sugerenciasCultivoDiv.style.display = 'none';
                mostrarCultivosDelUsuarioActual();
                llenarSelectCultivos(selectCultivoHumedad);
                llenarSelectCultivos(selectCultivoHistorial);
                mostrarResumenCultivos();
            }
        });
    }

    if (formHumedadManual) {
        formHumedadManual.addEventListener('submit', handleHumedadManualSubmit);
    }

    if (selectCultivoHistorial) {
        selectCultivoHistorial.addEventListener('change', () => {
            const selectedCultivoId = selectCultivoHistorial.value;
            if (selectedCultivoId) {
                mostrarHistorialHumedad(selectedCultivoId);
            } else {
                historialHumedadDiv.innerHTML = '';
            }
        });
    }
});