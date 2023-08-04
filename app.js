var contadorLineas = 2;
let textoArchivo = "";
var operarioActivo = "";
let noNombreOperario = "Trabajos";

function asignarNombre() {
  let nombreOperario = "";

  const operarioInput = document.getElementById("operario");

  nombreOperario = operarioInput.value.trim();
  console.log(nombreOperario);
  if (nombreOperario == "") {
    nombreOperario = noNombreOperario;
  }

  localStorage.setItem("nombreOperario", nombreOperario);

  window.location.href = "horas.html";
}

function inicializarPagina2() {
  insertarNombre();
}

function insertarNombre() {
  var nombreOperario = localStorage.getItem("nombreOperario");

  const lineaNombre = document.getElementById("nombre");

  const insertarLineaNombre = `<h2>${nombreOperario}</h2>`;

  if (nombreOperario !== noNombreOperario) {
    lineaNombre.insertAdjacentHTML("beforeend", insertarLineaNombre);
  }
  operarioActivo = nombreOperario;
}

function obtenerFechaActual() {
  const fecha = new Date();
  const dia = fecha.getDate().toString().padStart(2, "0");
  const mes = (fecha.getMonth() + 1).toString().padStart(2, "0");
  const anio = fecha.getFullYear();
  return `${dia}-${mes}-${anio}`;
}

function crearNuevaLineaHTML(lineaActual) {
  return `
    <div id="linea${lineaActual}">
      <label for="fecha${lineaActual}">${lineaActual}. </label>
      <input type="text" id="fecha${lineaActual}" placeholder="Fecha" class="labelCorto">
      <input type="text" id="horas${lineaActual}" placeholder="Horas" class="labelCorto">
      <input type="text" id="descripcion${lineaActual}" placeholder="Breve descripción del trabajo" class="labelTrabajo">
      <button onclick="insertarLinea(${lineaActual})"> + </button>
      <button onclick="eliminarLinea(${lineaActual})"> - </button>
    </div>
  `;
}

function agregarLinea() {
  const lineasDiv = document.getElementById("lineas");

  lineasDiv.insertAdjacentHTML(
    "beforeend",
    crearNuevaLineaHTML(contadorLineas)
  );

  contadorLineas++;
}

function insertarLinea(numeroLinea) {
  const lineasDiv = document.getElementById("lineas");

  const lineaActual = document.getElementById(`linea${numeroLinea}`);
  lineaActual.insertAdjacentHTML(
    "afterend",
    crearNuevaLineaHTML(contadorLineas)
  );

  contadorLineas++;
}

function eliminarLinea(numeroLinea) {
  const linea = document.getElementById(`linea${numeroLinea}`);
  linea.remove();
}

function revisarArchivo() {
  console.log(operarioActivo);
  const lineasDiv = document.getElementById("lineas");
  const lineasInputs = lineasDiv.getElementsByTagName("input");

  textoArchivo = "";
  let lineasincompletas = [];
  let fechaAnterior = "";

  for (let i = 0; i < lineasInputs.length; i += 3) {
    let fecha = lineasInputs[i].value.trim();
    const horas = lineasInputs[i + 1].value;
    const descripcion = lineasInputs[i + 2].value;

    if (fecha === "") {
      fecha = fechaAnterior;
    }

    if (horas.trim() !== "" && descripcion.trim() !== "") {
      textoArchivo += `${fecha}\t${horas}\t${descripcion}\t${operarioActivo}\n`;
    } else {
      lineasincompletas.push(lineasInputs[i].id.slice(5));
    }
    fechaAnterior = fecha;
  }

  const tooltipText =
    lineasincompletas.length > 0
      ? `Líneas incompletas: ${lineasincompletas.join(", ")}`
      : "Todas las líneas válidas";

  const tooltip = document.getElementById("tooltip");
  tooltip.innerHTML = tooltipText;
}

function generarArchivo() {
  revisarArchivo();
  descargarArchivo(textoArchivo);
}

function descargarArchivo(texto) {
  const blob = new Blob([texto], { type: "text/plain" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");

  const fechaHoy = obtenerFechaActual();

  a.href = url;
  a.download = `${operarioActivo}_${fechaHoy}.txt`;
  a.click();

  URL.revokeObjectURL(url);
}

function generarResumen() {}

function abrirExistente() {}

/*Obtiene el nombre del operario de el archivo abierto*/
function obtenerOperario() {}

function visualizarResumen() {}

function eliminarResumen() {}
