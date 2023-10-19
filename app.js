let contadorLineas = 2;
let textoArchivo = "";
let textoMuestraHTML = "";
let textoResumen = "";
let horasPorFecha = {};
let horasPorFechaArray = [];

let operarioActivo = "";
let noNombreOperario = "Trabajos";

let textoAbierto = "";
let archivoAgregar = "";
const claveTextoAbierto = "textoAbierto";
const claveNombreOperario = "nombreOperario";
const claveNombreArchivo = "nombreArchivo";
const trabajoCompleto = " Completo.";
const eventoMover = "Mover";
const tagResumen = "\n\nResumen:\n";

function crearNuevaLineaHTML(lineaActual) {
  return `
    <div id="linea${lineaActual}">
      <label for="fecha${lineaActual}">${lineaActual}. </label>
      <input type="date" id="fecha${lineaActual}" placeholder="dd-mm"  onkeydown="moverAlSiguienteCampo(event, 'horas${lineaActual}')">
      <input type="number" id="horas${lineaActual}" placeholder="Hs"  onkeydown="moverAlSiguienteCampo(event, 'descripcion${lineaActual}')">
      <input type="text" id="descripcion${lineaActual}" name= "trabajos" placeholder="Breve descripción del trabajo" onkeydown="moverAlSiguienteCampo(event, 'plusButton${lineaActual}')" autocomplete="on">
      <input type="checkbox" id="checkbox${lineaActual}" class="checkbox" onkeydown="moverAlSiguienteCampo(event, 'plusButton${lineaActual}')">
      <button onclick="insertarLinea(${lineaActual})" id= 'plusButton${lineaActual}' class="plusButton"> + </button>
      <button onclick="eliminarLinea(${lineaActual})" class="minusButton"> - </button>
    </div>
  `;
}

function ingresarConNombre() {
  const datos = localStorage.getItem(claveTextoAbierto);
  const operarioInput = document.getElementById("operario");
  alertaNombre(operarioInput.value);
  if (datos !== "") {
    borrarDatos(claveTextoAbierto, false);
  }
}

function ingresarConArchivo() {
  const nombreOperario = localStorage
    .getItem(claveTextoAbierto)
    .split("\n")[0]
    .split("\t")[3];
  //console.log(`Nombre: ${nombreOperario}`);

  alertaNombre(nombreOperario);
}

function alertaNombre(nombreOperario) {
  if (nombreOperario !== "" && nombreOperario !== "undefined") {
    irAIngresoHoras(nombreOperario);
    return;
  }

  const textoIngresado = window.prompt("Ingresar nombre:").trim();

  if (textoIngresado !== null && textoIngresado !== "") {
    //console.log(`Nombre: ${textoIngresado}`);
    irAIngresoHoras(textoIngresado);
    return;
  }

  //console.log("El usuario canceló el ingreso.");
  return;
}

function irAIngresoHoras(nombreEstampado) {
  nombreEstampado = formatoNombre(nombreEstampado);

  localStorage.setItem(claveNombreOperario, nombreEstampado);

  window.location.href = "horas.html";
}

function inicializarPagina2() {
  insertarNombre();
  moverAlSiguienteCampo(eventoMover, "fecha1");
  insertarFecha("fecha1");
  textoAbierto = localStorage.getItem(claveTextoAbierto);

  if (textoAbierto !== "") {
    const imprimirNombreArchivo = localStorage.getItem(claveNombreArchivo);
    //console.log("Completando campos");
    insertarElementos();
    if (imprimirNombreArchivo !== null) {
      imprimirInfo(`El archivo abierto es: ${imprimirNombreArchivo}`);
    }
    return;
  }
}

function insertarNombre() {
  let nombreOperario = formatoNombre(localStorage.getItem(claveNombreOperario));

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

function formatoNombre(nombreInsertado) {
  //console.log("Formatear nombre");
  const nombreFiltrado = nombreInsertado.split(" ")[0].trim();

  return (
    nombreFiltrado.charAt(0).toUpperCase() +
    nombreFiltrado.slice(1).toLowerCase()
  );
}

function agregarLinea() {
  const lineasDiv = document.getElementById("lineas");

  lineasDiv.insertAdjacentHTML(
    "beforeend",
    crearNuevaLineaHTML(contadorLineas)
  );

  const nuevoCampoId = `fecha${contadorLineas}`;
  moverAlSiguienteCampo(eventoMover, nuevoCampoId);
  imprimirInfo(`Fue agregada la línea ${contadorLineas}`);

  contadorLineas++;
  revisarArchivo();
}

function insertarLinea(numeroLinea) {
  const lineaActual = document.getElementById(`linea${numeroLinea}`);
  lineaActual.insertAdjacentHTML(
    "afterend",
    crearNuevaLineaHTML(contadorLineas)
  );

  const nuevoCampoId = `fecha${contadorLineas}`;
  moverAlSiguienteCampo(eventoMover, nuevoCampoId);
  imprimirInfo(`Fue insertada la línea ${contadorLineas}`);

  contadorLineas++;
  revisarArchivo();
}

function eliminarLinea(numeroLinea) {
  const linea = document.getElementById(`linea${numeroLinea}`);
  linea.remove();

  moverAlSiguienteCampo(eventoMover, "nuevaLinea");
  imprimirInfo(`La linea ${numeroLinea} fue eliminada`);
}

function revisarArchivo() {
  //console.log("Revisando archivo");
  const lineasDiv = document.getElementById("lineas");
  const lineasInputs = lineasDiv.getElementsByTagName("input");

  textoArchivo = "";
  textoMuestraHTML = "";
  textoResumen = "";
  horasPorFecha = {};

  let lineasincompletas = [];
  let fechaAnterior = "";
  const largoLineas = lineasInputs.length;

  for (let i = 0; i < largoLineas; i += 4) {
    let fecha = lineasInputs[i].value.trim();
    const horas = lineasInputs[i + 1].value.trim();
    const descripcion = lineasInputs[i + 2].value.trim();
    const isChecked = lineasInputs[i + 3].checked;

    if (fecha === "") {
      fecha = fechaAnterior;
    }

    const fechaFiltrada = procesarFecha(fecha);

    /*Comprovacion */
    if (horas !== "" || descripcion !== "") {
      if (i) {
        textoArchivo += "\n";
      }

      generarTextoFilas(fechaFiltrada, horas, descripcion, isChecked);
      generarTextoHTML(fechaFiltrada, horas, descripcion, isChecked);
    } else {
      lineasincompletas.push(lineasInputs[i].id.slice(5));
    }
    actualizarResumen(fechaFiltrada, horas);
    fechaAnterior = fecha;
  }

  /*Generar resumen de horas*/
  horasPorFechaArray = Object.entries(horasPorFecha).map(
    ([fecha, horas]) => `${fecha}: ${horas} hs.`
  );

  /*Burbuja de comprobacion */
  const tooltipText =
    lineasincompletas.length > 0
      ? `Completar líneas: ${lineasincompletas.join(", ")}`
      : "Serán guardadas todas las líneas";

  const tooltip = document.getElementById("tooltip");
  tooltip.innerHTML = tooltipText;

  /*Visualizo resumen y tabla de trabajos*/
  verResumen();
  verTabla();

  //console.log(textoResumen);
  localStorage.setItem(claveTextoAbierto, textoArchivo);
}

function generarTextoFilas(columna1, columna2, columna3, terminado) {
  let operario = operarioActivo;
  let completo = "";
  let parametro2 = parseFloat(columna2).toLocaleString("es-ES").toString();

  if (parametro2 === "NaN") {
    parametro2 = "";
    //console.log(parametro2);
  }

  if (operarioActivo === noNombreOperario) {
    operario = "";
  }

  if (terminado) {
    completo = trabajoCompleto;
    //console.log("Trabajo completo");
  }

  textoArchivo += `${columna1}\t${parametro2}\t${columna3}${completo}\t${operario}`;
}

function generarTextoHTML(columna1, columna2, columna3, terminado) {
  let completo = "";

  if (operarioActivo === noNombreOperario) {
    operario = "";
  }

  if (terminado) {
    completo = trabajoCompleto;
  }

  textoMuestraHTML += `<tr>   <td>${columna1}</td>   <td>${columna2}</td>   <td class="descripcionTabla">${columna3} ${completo}</td>   </tr>`;
}

function actualizarResumen(fechaResumen, horasResumen) {
  let horasS = parseFloat(horasResumen);
  if (isNaN(horasS) || horasS == 0) {
    //console.log("Campo de horas en 0");
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
  agregarResumen();
  descargarArchivo();
}

function descargarArchivo() {
  const blob = new Blob([textoArchivo], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const fechaHoy = obtenerFechaActual();

  a.href = url;
  a.download = `${operarioActivo} ${fechaHoy}.txt`;
  a.click();

  URL.revokeObjectURL(url);
  imprimirInfo("Archivo guardado en memoria");
  borrarDatos(claveTextoAbierto);
}

function verTabla() {
  const copiar =
    '<div class="divCopiar"><a onclick="copiartexto()">[Copiar]</a></div>';
  const encabezadoTrabajos =
    "<table><thead>   <tr>   <th>Fecha</th>   <th>Hs</th>   <th>Descripcion</th>   </tr>   </thead>   <tbody>";
  const pieTrabajos = "</tbody></table>";

  let textoTablaHTML = "";
  textoTablaHTML += encabezadoTrabajos;
  textoTablaHTML += textoMuestraHTML;
  textoTablaHTML += pieTrabajos;
  textoTablaHTML += copiar;

  const spanTabla = document.getElementById("tabla");
  spanTabla.innerHTML = textoTablaHTML;
}

function verResumen() {
  const encabezadoResumen = "<strong>Resumen:</strong><li>";
  const pieResumen = "</li>";
  let textoResumenHTML = "";

  textoResumenHTML = encabezadoResumen;
  textoResumenHTML += horasPorFechaArray.join("</li><li>");
  textoResumenHTML += pieResumen;

  const spanResumen = document.getElementById("resumen");
  spanResumen.innerHTML = textoResumenHTML;
}

function agregarResumen() {
  textoArchivo += tagResumen + horasPorFechaArray.join("\n");
}

function adquirirTextoArchivo() {
  const fileInput = document.getElementById("archivoInput");

  fileInput.addEventListener("change", function (event) {
    let file = event.target.files[0];
    let reader = new FileReader();
    let nombreArchivo = "Continua edición actual";

    if (file) {
      nombreArchivo = file.name;
    }

    reader.onload = function (event) {
      let fileContent = event.target.result.trim();
      localStorage.setItem(claveTextoAbierto, fileContent);
    };

    reader.readAsText(file);
    localStorage.setItem(claveNombreArchivo, nombreArchivo);
  });

  const fileAgregado = document.getElementById("archivoAgregar");

  fileAgregado.addEventListener("change", function (event) {
    let file = event.target.files[0];
    let reader = new FileReader();
    let nombreArchivo = "Continua edición actual";

    if (file) {
      nombreArchivo += file.name;
    }

    reader.onload = function (event) {
      archivoAgregar += event.target.result.split("\n\n")[0] + "\n";
      localStorage.setItem(claveTextoAbierto, archivoAgregar);
    };

    reader.readAsText(file);
  });
}

function insertarElementos() {
  const seccion = textoAbierto.split(tagResumen);
  const lineasAInsertar = seccion[0].split("\n");
  for (let index = 0; index < lineasAInsertar.length; index++) {
    const largoElemento = lineasAInsertar[index].length;
    const elemento = lineasAInsertar[index].split("\t");
    let fecha = elemento[0];
    const horas = elemento[1];
    const descripcion = elemento[2];

    if (largoElemento) {
      insertarFecha(`fecha${contadorLineas - 1}`, fecha);
      insertarNumero(`horas${contadorLineas - 1}`, horas);
      insertarTexto(`descripcion${contadorLineas - 1}`, descripcion);

      agregarLinea();
    }
  }
}

function insertarTexto(elemento, texto) {
  const campoInput = document.getElementById(elemento);

  if (texto === undefined) {
    return;
  }

  if (texto.endsWith(trabajoCompleto)) {
    const checkbox = document.getElementById(`checkbox${contadorLineas - 1}`);
    checkbox.checked = true;
    const indiceCompleto = texto.indexOf(trabajoCompleto);
    texto = texto.slice(0, indiceCompleto).trim();
  }

  campoInput.value = texto;
}

function insertarNumero(elemento, numero) {
  const campoInput = document.getElementById(elemento);
  if (numero === undefined) {
    return;
  }
  numero = numero.replace(",", ".");
  const numeroIngresado = parseFloat(numero);

  campoInput.value = isNaN(numeroIngresado) ? null : numeroIngresado;
}

function compartir() {
  revisarArchivo();
  agregarResumen();
  compartirPor();
}

function compartirPor() {
  // Crea un Blob con el contenido
  const blob = new Blob([textoArchivo], { type: "text/plain" });
  const fechaHoy = obtenerFechaActual();

  // Crea un objeto File a partir del Blob
  const archivo = new File([blob], `${operarioActivo} ${fechaHoy}.txt`, {
    type: "text/plain",
  });

  // Verifica si el navegador soporta la API de Web Share
  if (navigator.share) {
    navigator
      .share({
        files: [archivo],
      })
      .then(() => {
        //console.log("Archivo compartido exitosamente.");
        imprimirInfo("Archivo compartido exitosamente.");
      })
      .catch((error) => {
        console.error("Error al compartir el archivo: ", error);
        imprimirInfo(`Error al compartir el archivo: ${error}`);
        return;
      });
  } else {
    //console.log("La API de Web Share no está soportada en este navegador.");
    imprimirInfo("La API de Web Share no está soportada en este navegador.");
    return;
  }
  borrarDatos(claveTextoAbierto);
}

function moverAlSiguienteCampo(evento, siguienteCampoId) {
  if (evento.key === "Enter") {
    evento.preventDefault();
    document.getElementById(siguienteCampoId).focus();
  }

  if (evento === eventoMover) {
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

function obtenerFechaActual(idioma = "es-ES") {
  const fecha = new Date();
  const dia = fecha.getDate().toString().padStart(2, "0");
  const mes = (fecha.getMonth() + 1).toString().padStart(2, "0");
  const anio = fecha.getFullYear();

  if (idioma == "es-ES") {
    return `${dia}-${mes}-${anio}`;
  }

  if (idioma == "en-EN") {
    return `${anio}-${mes}-${dia}`;
  }
}

function imprimirInfo(texto) {
  //console.log(`Imprimir texto: ${texto}`);
  const spanInfo = document.getElementById("info");
  spanInfo.innerHTML = texto;
}

function copiartexto() {
  let textoACopiar = textoArchivo; // Tu variable con el texto

  // Usar la API Clipboard para copiar el contenido
  navigator.clipboard
    .writeText(textoACopiar)
    .then(function () {
      // Mostrar mensaje de éxito
      //alert("Texto copiado: " + textoACopiar);
      imprimirInfo("Texto copiado");
    })
    .catch(function (err) {
      // Mostrar mensaje de error si no se pudo copiar
      console.error("Error al copiar el texto:", err);
      imprimirInfo(`Error al copiar el texto: ${err}`);
    });
}

function borrarDatos(dato, recargar = true) {
  const borrando = confirm("¿Desea borrar los datos guardados?");
  if (borrando) {
    localStorage.setItem(dato, "");
    alert("Datos borrados con éxito.");
    if (recargar) {
      window.location.href = window.location.href;
      return;
    }
    console.log("No se recargó la pagina");
  }
}
