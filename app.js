let contadorLineas = 2;
let textoArchivo = "";
let textoResumen = "";
let horasPorFecha = {};
let horasPorFechaArray = [];

let operarioActivo = "";
let noNombreOperario = "Trabajos";

let textoAbierto = "";
let textoAnterior = "";
const itemTextoAbierto = "textoAbierto";
const itemNombreOperario = "nombreOperario";

//Todo: Insertar logo en la portada, insertar logo en el icono

function ingresarConNombre() {
  let nombreOperario = "";

  const operarioInput = document.getElementById("operario");

  nombreOperario = operarioInput.value.trim();
  console.log(nombreOperario);

  if (nombreOperario == "") {
    nombreOperario = noNombreOperario;
  }

  irAIngresoHoras(nombreOperario);
}

function ingresarConArchivo() {
  const nombreOperario = localStorage
    .getItem(itemTextoAbierto)
    .split("\n")[1]
    .split("\t")[3];
  console.log(nombreOperario);
  irAIngresoHoras(nombreOperario);
}

function irAIngresoHoras(nombre) {
  localStorage.setItem(itemNombreOperario, nombre);

  window.location.href = "horas.html";
}

function inicializarPagina2() {
  insertarNombre();
  moverAlSiguienteCampo("Mover", "fecha1");
  insertarFecha("fecha1");
  textoAbierto = localStorage.getItem(itemTextoAbierto);

  if (textoAbierto !== "" && textoAbierto !== textoAnterior) {
    console.log("Insertar textos");
    textoAnterior = textoAbierto;
    insertarElementos();
    return;
  }
}

function insertarNombre() {
  let nombreOperario = localStorage.getItem(itemNombreOperario);

  if (nombreOperario === "undefined") {
    nombreOperario = noNombreOperario;
  }

  const lineaNombre = document.getElementById("nombre");

  const insertarLineaNombre = `<h2>${nombreOperario}</h2>`;

  if (nombreOperario !== noNombreOperario) {
    lineaNombre.insertAdjacentHTML("beforeend", insertarLineaNombre);
  }

  operarioActivo = nombreOperario;
}

function crearNuevaLineaHTML(lineaActual) {
  return `
    <div id="linea${lineaActual}">
      <label for="fecha${lineaActual}">${lineaActual}. </label>
      <input type="date" id="fecha${lineaActual}" placeholder="dd-mm" class="labelCorto" onkeydown="moverAlSiguienteCampo(event, 'horas${lineaActual}')">
      <input type="number" id="horas${lineaActual}" placeholder="Hs" class="labelCorto" onkeydown="moverAlSiguienteCampo(event, 'descripcion${lineaActual}')">
      <input type="text" id="descripcion${lineaActual}" name= "trabajos" placeholder="Breve descripción del trabajo" class="labelTrabajo" onkeydown="moverAlSiguienteCampo(event, 'plusButton${lineaActual}')" autocomplete="on">
      <input type="checkbox" id="checkbox${lineaActual}" class="checkbox">
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

function revisarArchivo() {
  console.log("Revisando archivo");
  const lineasDiv = document.getElementById("lineas");
  const lineasInputs = lineasDiv.getElementsByTagName("input");

  textoArchivo = "";
  textoResumen = "";
  horasPorFecha = {};

  let lineasincompletas = [];
  let fechaAnterior = "";

  for (let i = 0; i < lineasInputs.length; i += 4) {
    let fecha = lineasInputs[i].value.trim();
    const horas = lineasInputs[i + 1].value;
    const descripcion = lineasInputs[i + 2].value;

    /*const checkboxId = `checkbox${i / 3 + 1}`;

    const checkbox = document.getElementById(checkboxId);*/
    const isChecked = lineasInputs[i + 3].checked;

    if (fecha === "") {
      fecha = fechaAnterior;
    }
    const fechaFiltrada = procesarFecha(fecha);

    /*Comprovacion */
    if (horas.trim() !== "" || descripcion.trim() !== "") {
      generarTextoFilas(fechaFiltrada, horas, descripcion, isChecked);
    } else {
      lineasincompletas.push(lineasInputs[i].id.slice(5));
    }
    actualizarResumen(fechaFiltrada, horas);
    fechaAnterior = fecha;
  }

  /*Visualizar en consola el textoResumen*/
  horasPorFechaArray = Object.entries(horasPorFecha).map(
    ([fecha, horas]) => `${fecha}: ${horas} hs.`
  );

  /*Burbuja de comprobacion */
  const tooltipText =
    lineasincompletas.length > 0
      ? `Líneas incompletas: ${lineasincompletas.join(", ")}`
      : "Serán guardadas todas las líneas";

  const tooltip = document.getElementById("tooltip");
  tooltip.innerHTML = tooltipText;

  /*Visualizo resumen */
  verResumen();

  console.log(textoResumen);
}

function generarTextoFilas(columna1, columna2, columna3, terminado) {
  let operario = operarioActivo;
  let completo = "";

  if (operarioActivo === noNombreOperario) {
    operario = "";
  }

  if (terminado) {
    completo = " Completo.";
    console.log("Trabajo completo");
  }

  textoArchivo += `${columna1}\t${columna2}\t${columna3}.${completo}\t${operario}\n`;
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
  verResumen("imprimir");
  descargarArchivo(textoArchivo);
}

function descargarArchivo(texto) {
  const blob = new Blob([texto], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const fechaHoy = obtenerFechaActual("es-ES");

  a.href = url;
  a.download = `${operarioActivo}_${fechaHoy}.txt`;
  a.click();

  URL.revokeObjectURL(url);
}

function verResumen(ver = "") {
  if (ver === "") {
    textoResumen =
      "Resumen:\n<li>" + horasPorFechaArray.join("</li>\n<li>") + "</li>";
    const spanResumen = document.getElementById("resumen");
    spanResumen.innerHTML = textoResumen;

    textoResumen = "\nResumen:\n" + horasPorFechaArray.join("\n");
    return;
  }

  textoArchivo += "\n" + textoResumen;
}

function adquirirTextoArchivo() {
  const fileInput = document.getElementById("archivoInput");
  //console.log("Abriendo archivos");

  fileInput.addEventListener("change", function (event) {
    var file = event.target.files[0];
    var reader = new FileReader();

    reader.onload = function (event) {
      var fileContent = event.target.result;
      localStorage.setItem(itemTextoAbierto, fileContent);
      /*console.log("Archivo cargado:");
      console.log(fileContent);*/
    };

    reader.readAsText(file);
  });
}

function insertarElementos() {
  const seccion = textoAbierto.split("\n\n");
  const linea = seccion[0].split("\n");
  for (let index = 0; index < linea.length; index++) {
    const elemento = linea[index].split("\t");
    let fecha = elemento[0];
    const horas = elemento[1];
    const descripcion = elemento[2];

    insertarFecha(`fecha${contadorLineas - 1}`, fecha);
    console.log("Fecha insertada")
    insertarTexto(`horas${contadorLineas - 1}`, horas);
    console.log("Hora insertada")
    insertarTexto(`descripcion${contadorLineas - 1}`, descripcion);
    console.log("Descripcion insertada")

    agregarLinea();
  }
}

function insertarTexto(elemento, texto) {
  const campoInput = document.getElementById(elemento);
  if (texto.endsWith(" Completo.")) {
    const checkbox = document.getElementById(`checkbox${contadorLineas - 1}`);
    checkbox.checked = true;
    const indiceCompleto = texto.indexOf(" Completo.");
    texto = texto.slice(0, indiceCompleto).trim();
  }
  campoInput.value = texto;
}

function compartir() {}

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

function procesarFecha(fechaActual) {
  //yyyy-mm-dd
  const dia = fechaActual.slice(8);
  const mes = fechaActual.slice(5, 7);
  const fechaFormateada = dia + "-" + mes;

  return fechaFormateada;
}

function insertarFecha(elemento, fechaActual = "") {
  const campoFecha = document.getElementById(elemento);
  //console.log("Insertar fecha");

  if (fechaActual === "") {
    //console.log("Nueva fecha");
    fechaActual = obtenerFechaActual("en-EN");
  } else {
    const anioNuevo = new Date();
    //dd-mm
    const dia = fechaActual.slice(0, 2);
    const mes = fechaActual.slice(3);
    const anio = anioNuevo.getFullYear();
    fechaActual = `${anio}-${mes}-${dia}`;
  }

  campoFecha.value = fechaActual;
}

function obtenerFechaActual(idioma) {
  const fecha = new Date();
  const dia = fecha.getDate().toString().padStart(2, "0");
  const mes = (fecha.getMonth() + 1).toString().padStart(2, "0");
  const anio = fecha.getFullYear();
  if (idioma == "es-ES") {
    return `${dia}-${mes}-${anio}`;
  }
  if (idioma == "en-EN") {
    console.log(`${anio}-${mes}-${dia}`)
    return `${anio}-${mes}-${dia}`;
  }
}

// Todo: resolver problemas de esta funcion para ajustar la altura del cuadro de entrada en función del contenido o agregar un tooltip para que se visualice cuando hago clik en el campo
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
