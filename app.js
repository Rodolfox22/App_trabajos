var contadorLineas = 2;
let textoArchivo = "";
let textoResumen = "";
let horasPorFecha = {};

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
  insertarFecha("fecha1");
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
      <input type="date" id="fecha${lineaActual}" placeholder="dd-mm" class="labelCorto" onkeydown="moverAlSiguienteCampo(event, 'horas${lineaActual}')">
      <input type="number" id="horas${lineaActual}" placeholder="Hs" class="labelCorto" onkeydown="moverAlSiguienteCampo(event, 'descripcion${lineaActual}')">
      <input type="text" id="descripcion${lineaActual}" name= "trabajos" placeholder="Breve descripción del trabajo" class="labelTrabajo" onkeydown="moverAlSiguienteCampo(event, 'plusButton${lineaActual}')" autocomplete="on">
      <button onclick="insertarLinea(${lineaActual})" id= 'plusButton${lineaActual}' class="plusButton"> + </button>
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

//Todo: trabajar para abstraer funcion
function revisarArchivo() {
  console.log("Revisando archivo");
  const lineasDiv = document.getElementById("lineas");
  const lineasInputs = lineasDiv.getElementsByTagName("input");

  textoArchivo = "";
  textoResumen = "";
  horasPorFecha = {};

  let lineasincompletas = [];
  let fechaAnterior = "";

  for (let i = 0; i < lineasInputs.length; i += 3) {
    let fecha = lineasInputs[i].value.trim();
    const horas = lineasInputs[i + 1].value;
    const descripcion = lineasInputs[i + 2].value;

    const fechaFiltrada = procesarFecha(fecha, fechaAnterior);

    /*Comprovacion */
    if (horas.trim() !== "" || descripcion.trim() !== "") {
      generarTextoFilas(fechaFiltrada, horas, descripcion);
    } else {
      lineasincompletas.push(lineasInputs[i].id.slice(5));
    }
    actualizarResumen(fechaFiltrada, horas);
    fechaAnterior = fecha;
  }

  /*Visualizar en consola el textoResumen*/
  const horasPorFechaArray = Object.entries(horasPorFecha).map(
    ([fecha, horas]) => `${fecha}: ${horas}`
  );

  textoResumen =
    "<li>" + horasPorFechaArray.join(" hs.</li>\n<li>") + " hs.</li>";
    
    /*Burbuja de comprobacion */
    const tooltipText =
    lineasincompletas.length > 0
    ? `Líneas incompletas: ${lineasincompletas.join(", ")}`
    : "Serán guardadas todas las líneas";

  const tooltip = document.getElementById("tooltip");
  tooltip.innerHTML = tooltipText;
  
  /*Visualizo resumen */
  const spanResumen = document.getElementById("resumen");
  textoResumen = "Resumen:\n" + textoResumen;
  spanResumen.innerHTML = textoResumen;
  
  textoResumen = "\nResumen:\n" + horasPorFechaArray.join(" hs.\n") + "hs.";
  console.log(textoResumen);
}

function generarTextoFilas(columna1, columna2, columna3) {
  var operario = operarioActivo;

  if (operarioActivo === noNombreOperario) {
    operario = "";
  }

  textoArchivo += `${columna1}\t${columna2}\t${columna3}\t${operario}\n`;
}

function actualizarResumen(fechaResumen, horasResumen) {
  let horasS = parseFloat(horasResumen);
  if (isNaN(horasS) || horasS == 0) {
    console.log("Horas en 0");
    return;
  }

  if (horasPorFecha[fechaResumen]) {
    horasPorFecha[fechaResumen] += horasS;
  } else {
    horasPorFecha[fechaResumen] = horasS;
  }
}

function generarArchivo() {
  revisarArchivo();
  generarResumen();
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

function generarResumen() {
  textoArchivo += "\n" + textoResumen;
}

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

function procesarFecha(fechaActual = "", fechaAnterior = "") {
  if (fechaActual === "") {
    fechaActual = fechaAnterior;
  }

  const fechaFormateada = new Date(fechaActual).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
  });
  return fechaFormateada;
}

function insertarFecha(elemento, fechaActual = "") {
  const campoFecha = document.getElementById(elemento);
  console.log("Insertar fecha");

  if (fechaActual === "") {
    console.log("Nueva fecha");
    fechaActual = new Date();
  }

  const dia = fechaActual.getDate().toString().padStart(2, "0");
  const mes = (fechaActual.getMonth() + 1).toString().padStart(2, "0");
  const anio = fechaActual.getFullYear();
  fechaActual = `${anio}-${mes}-${dia}`;

  const fechaInicial = fechaActual;
  campoFecha.value = fechaInicial;
}

// Todo: resolver problemas de esta funcion para ajustar la altura del cuadro de entrada en función del contenido
/*function ajustarAlturaInput(input) {
  input.style.height = "auto";
  input.style.height = input.scrollHeight + "px";
  console.log(input.scrollHeight);
}

// Escucha el evento de entrada en los cuadros de entrada de texto
document.addEventListener("input", function (event) {
  if (
    event.target.tagName.toLowerCase() === "input" &&
    event.target.type === "text"
  ) {
    ajustarAlturaInput(event.target);
  }
});*/
