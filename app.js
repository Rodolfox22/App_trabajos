var contadorLineas = 2;
let textoArchivo = "";
var operarioActivo = "";
let noNombreOperario = "Trabajos";

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
  let lineasIgnoradas = [];
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
      /*const numeroLinea = i / 3 + 1;*/
      const elementoId = lineasInputs[i].id; // Obtener el id del elemento actual
      const numeroLinea = elementoId.slice(5);
      lineasIgnoradas.push(numeroLinea);
    }
    fechaAnterior = fecha;
  }

  const tooltipText =
    lineasIgnoradas.length > 0
      ? `Líneas ignoradas: ${lineasIgnoradas.join(", ")}`
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
  /*localStorage.setItem("contadorLineas", "2");*/
}

function insertarNombre() {
  var nombreOperario = localStorage.getItem("nombreOperario");
  console.log(nombreOperario);

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
