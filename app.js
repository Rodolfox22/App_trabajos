var contadorLineas = 2;
let textoArchivo = "";
var operarioActivo = "";
let noNombreOperario = "Trabajos";

/*Todo: Insertar logo en la portada, insertar logo en el icono */
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
  moverAlSiguienteCampo("Mover", "fecha1");
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
      <input type="text" id="fecha${lineaActual}" placeholder="Fecha" class="labelCorto" onkeydown="moverAlSiguienteCampo(event, 'horas${lineaActual}')">
      <input type="text" id="horas${lineaActual}" placeholder="Horas" class="labelCorto" onkeydown="moverAlSiguienteCampo(event, 'descripcion${lineaActual}')">
      <input type="text" id="descripcion${lineaActual}" placeholder="Breve descripción del trabajo" class="labelTrabajo" onkeydown="moverAlSiguienteCampo(event, 'plusButton${lineaActual}')">
      <button onclick="insertarLinea(${lineaActual})" id= plusButton${lineaActual} class="plusButton"> + </button>
      <button onclick="eliminarLinea(${lineaActual})" class="minusButton"> - </button>
    </div>
  `;
}

function agregarLinea() {
  const lineasDiv = document.getElementById("lineas");

  lineasDiv.insertAdjacentHTML(
    "beforeend",
    crearNuevaLineaHTML(contadorLineas)
  );

  const nuevoCampoId = `fecha${contadorLineas}`;
  moverAlSiguienteCampo("Mover", nuevoCampoId);

  contadorLineas++;
}

function insertarLinea(numeroLinea) {
  const lineasDiv = document.getElementById("lineas");

  const lineaActual = document.getElementById(`linea${numeroLinea}`);
  lineaActual.insertAdjacentHTML(
    "afterend",
    crearNuevaLineaHTML(contadorLineas)
  );

  const nuevoCampoId = `fecha${contadorLineas}`;
  moverAlSiguienteCampo("Mover", nuevoCampoId);

  contadorLineas++;
}

function eliminarLinea(numeroLinea) {
  const linea = document.getElementById(`linea${numeroLinea}`);
  linea.remove();

  moverAlSiguienteCampo("Mover", "nuevaLinea");
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

    /*Comprovacion */
    if (horas.trim() !== "" && descripcion.trim() !== "") {
      generarTextoArchivo(fecha, horas, descripcion);
    } else {
      lineasincompletas.push(lineasInputs[i].id.slice(5));
    }

    fechaAnterior = fecha;
  }

  /*Burbuja de comprobacion */
  const tooltipText =
    lineasincompletas.length > 0
      ? `Líneas incompletas: ${lineasincompletas.join(", ")}`
      : "Todas las líneas válidas";

  const tooltip = document.getElementById("tooltip");
  tooltip.innerHTML = tooltipText;
}

function generarTextoArchivo(columna1, columna2, columna3) {
  var operario = operarioActivo;

  if (operarioActivo === noNombreOperario) {
    operario = "";
  }

  textoArchivo += `${columna1}\t${columna2}\t${columna3}\t${operario}\n`;
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

function abrirArchivo() {}

function insertarElementos() {}

/*Obtiene el nombre del operario de el archivo abierto*/
function obtenerOperario() {}

function visualizarResumen() {}

function eliminarResumen() {}

function compartir() {}

function sumarHoras() {}

function completarSiguienteFecha() {}

/*Cuando ingreso el texto me tiene que ubicar sobre el boton siguiente para ingresar*/
function seleccionarBoton() {}

function alertaIncompletas() {}

function guardarEnCache() {}

function alertaActualizo() {}

function compartirWhatsApp() {
  const enlaceWpp = `https://api.whatsapp.com/send?text=${encodeUIRComponent(
    textoArchivo
  )}`;
  windows.open(enlaceWpp, "_blank");
}

function moverAlSiguienteCampo(event, siguienteCampoId) {
  if (event.key === "Enter") {
    event.preventDefault();
    document.getElementById(siguienteCampoId).focus();
  }

  if (event === "Mover") {
    document.getElementById(siguienteCampoId).focus();
  }
}
