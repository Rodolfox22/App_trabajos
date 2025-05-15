let contadorLineas = 1;
let textoArchivo = "";
let textoMuestraHTML = "";
let textoResumen = "";
let horasPorFecha = {};
let horasPorFechaArray = [];

let operarioActivo = "";
let noNombreOperario = "Trabajos";

let textoAbierto = "";
let textoCompleto = "";
let archivoAgregar = "";
const claveTextoAbierto = "textoAbierto";
const claveNombreOperario = "nombreOperario";
const claveNombreArchivo = "nombreArchivo";
const trabajoCompleto = " Completo.";
const eventoMover = "Mover";
const tagResumen = "\n\nResumen:\n";

//TODO: el programa actualmente se basa en la variable textoAbierto, que se utiliza para registrar en la cache los valores utilizados, cada tabulación indica un campo cada salto de linea indica una nueva entrada, puedo mantener la logica para que me sirva este programa?
//TODO: definir por donde tengo que empezar para realizar el cambio. El cambio que quiero, es que se visualice la tabla al inicio, y cada vez que yo toque algun dato, me abra una ventana para actualizar ese dato, y me sea posible navegar por los siguientes datos sin problemas
window.onload = eventosDeInicio;

function eventosDeInicio() {
  const operario = document.getElementById("operario");
  operario.addEventListener("keydown", (event) =>
    moverAlSiguienteCampo(event, "ingresar")
  );
  operario.focus();

  document.getElementById("logo").addEventListener("click", pegarArchivos);

  document
    .getElementById("ingresar")
    .addEventListener("click", ingresarConNombre);

  document
    .getElementById("archivoInput")
    .addEventListener("keydown", (event) =>
      moverAlSiguienteCampo(event, "abrir")
    );

  document
    .getElementById("abrir")
    .addEventListener("click", ingresarConArchivo);

  document.getElementById("volver").addEventListener("click", restaurar);

  document.getElementById("nuevaLinea").addEventListener("click", agregarLinea);

  document
    .getElementById("botonLimpiar")
    .addEventListener("click", () => borrarDatos(claveTextoAbierto));

  document
    .getElementById("botonCompartir")
    .addEventListener("click", compartir);

  document
    .getElementById("botonRevisar")
    .addEventListener("click", revisarArchivo);

  document
    .getElementById("botonRevisar")
    .addEventListener("mouseover", revisarArchivo);

  document.addEventListener("keydown", (e) => {
    //console.log(e);
    if (e.altKey && e.key == "a") {
      ingresarConArchivo();
    }

    if (e.ctrlKey && e.key == "ArrowRight") {
      pegarArchivos();
    }
  });

  adquirirTextoArchivo();

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/service-worker.js")
        .then((registration) => {
          console.log("Service Worker registrado con éxito:", registration);
        })
        .catch((error) => {
          console.log("Error al registrar el Service Worker:", error);
        });
    });
  }
}

//TODO: realizar comprobación para que no se creen más de 2 lineas vacias
//TODO: para la nueva version del programa lo que quiero es que se visualice solo una linea editable y que se pueda observar en la tabla, si uno quiere editar un archivo, tiene que tocar sobre el archivo a editar y le aparece la ventana para editar. se me ocurre que puedo utilizar un link para que se pueda acomodar la ventana
//TODO: me gustaria que cada elemento de la tabla se pueda arrastrar y soltar
function crearNuevaLineaHTML(lineaActual) {
  return `
      <div id="linea${lineaActual}">
        <label for="fecha${lineaActual}">${lineaActual}. </label>
        <input type="date" id="fecha${lineaActual}" placeholder="dd-mm">
        <input type="number" id="horas${lineaActual}" placeholder="Hs">
        <input type="text" id="descripcion${lineaActual}" name="trabajos" placeholder="Breve descripción del trabajo" autocomplete="on">
        <input type="checkbox" id="checkbox${lineaActual}" class="checkbox">
        <button id="plusButton${lineaActual}" class="plusButton"> + </button>
        <button id="minusButton${lineaActual}" class="minusButton"> - </button>
      </div>
    `;
}

// Agregar eventos después de crear la línea
function agregarEventos(lineaActual) {
  const plusButton = document.getElementById(`plusButton${lineaActual}`);
  plusButton.addEventListener("click", () => insertarLinea(lineaActual));

  const minusButton = document.getElementById(`minusButton${lineaActual}`);
  minusButton.addEventListener("click", () => eliminarLinea(lineaActual));

  const fecha = document.getElementById(`fecha${lineaActual}`);
  fecha.addEventListener("keydown", (event) =>
    moverAlSiguienteCampo(event, `horas${lineaActual}`)
  );

  const horas = document.getElementById(`horas${lineaActual}`);
  horas.addEventListener("keydown", (event) =>
    moverAlSiguienteCampo(event, `descripcion${lineaActual}`)
  );

  const descripcion = document.getElementById(`descripcion${lineaActual}`);
  descripcion.addEventListener("keydown", (event) =>
    moverAlSiguienteCampo(event, `plusButton${lineaActual}`)
  );

  const check = document.getElementById(`checkbox${lineaActual}`);
  check.addEventListener("keydown", (event) =>
    moverAlSiguienteCampo(event, `plusButton${lineaActual}`)
  );
}

// Eliminar eventos después de borrar la línea
function eliminarEventos(lineaActual) {
  const plusButton = document.getElementById(`plusButton${lineaActual}`);
  plusButton.removeEventListener("click", () => insertarLinea(lineaActual));

  const minusButton = document.getElementById(`minusButton${lineaActual}`);
  minusButton.removeEventListener("click", () => eliminarLinea(lineaActual));

  const fecha = document.getElementById(`fecha${lineaActual}`);
  fecha.removeEventListener("keydown", (event) =>
    moverAlSiguienteCampo(event, `horas${lineaActual}`)
  );

  const horas = document.getElementById(`horas${lineaActual}`);
  horas.removeEventListener("keydown", (event) =>
    moverAlSiguienteCampo(event, `descripcion${lineaActual}`)
  );

  const descripcion = document.getElementById(`descripcion${lineaActual}`);
  descripcion.removeEventListener("keydown", (event) =>
    moverAlSiguienteCampo(event, `plusButton${lineaActual}`)
  );

  const check = document.getElementById(`checkbox${lineaActual}`);
  check.removeEventListener("keydown", (event) =>
    moverAlSiguienteCampo(event, `plusButton${lineaActual}`)
  );
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

  const textoIngresado = consulta("Ingresar nombre:");

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

  //window.location.href = "horas.html";
  document.getElementById("portada").style.display = "none";
  document.getElementById("pagina2").style.display = "block";
  inicializarPagina2();
}

function eventosPagina2() {
  document.addEventListener("keydown", function (e) {
    if (e.altKey) {
      altMas(e.key);
    }
  });
}

function altMas(letra) {
  if (letra == "n") {
    agregarLinea();
  }
  if (letra == "l") {
    borrarDatos(claveTextoAbierto);
  }
  if (letra == "c") {
    compartir();
  }
  if (letra == "r") {
    revisarArchivo();
  }
}

function inicializarPagina2() {
  eventosPagina2();
  insertarNombre();
  agregarLinea();
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
  agregarEventos(contadorLineas);

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
  agregarEventos(contadorLineas);

  const nuevoCampoId = `fecha${contadorLineas}`;
  moverAlSiguienteCampo(eventoMover, nuevoCampoId);
  imprimirInfo(`Fue insertada la línea ${contadorLineas}`);

  contadorLineas++;
  revisarArchivo();
}

function eliminarLinea(numeroLinea) {
  const linea = document.getElementById(`linea${numeroLinea}`);
  linea.remove();
  eliminarEventos(numeroLinea);
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

      //Completo líneas editables
      generarTextoFilas(fechaFiltrada, horas, descripcion, isChecked);

      //Completo tabla de visualización
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
      ? `Líneas incompletas: ${lineasincompletas.join(", ")}`
      : "Comprobación correcta";

  const tooltip = document.getElementById("tooltip");
  tooltip.innerHTML = tooltipText;

  /*Visualizo resumen y tabla de trabajos*/
  verResumen();
  verTabla();
  //console.log(textoArchivo.length);
  if (textoArchivo != "") {
    localStorage.setItem(claveTextoAbierto, textoArchivo);
  }
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
}

//TODO: para la nueva version necesito trabajar en esta funcion, segun entindo, tengo que utilizar esta funcion para crear la tabla y otra para abrir una ventana de edicion
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

    if (siguienteCampoId == "ingresar") {
      ingresarConNombre();
    }

    if (siguienteCampoId == "abrir") {
      ingresarConArchivo();
    }
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

function copiartexto(textoACopiar = "") {
  if (textoACopiar === "") {
    textoACopiar = textoArchivo; // Tu variable con el texto
  }

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

//TODO: revisar si esta es la forma correcta de ingresar datos predeterminados, creo que js tiene una forma mejor de cargar los datos por defecto
//TODO: mejorar funcion para que sea mas correcta
function borrarDatos(dato = "sesion", recargar = true) {
  let borrando = true;

  if (dato != "sesion") {
    borrando = confirmacion("¿Desea borrar los datos guardados?");
  }

  if (borrando) {
    localStorage.setItem(dato, "");
    if (dato != "sesion") {
      mensaje("Datos borrados con éxito.");
    }
    if (recargar) {
      window.location.href = window.location.href;
      return;
    }
    console.log("No se recargó la pagina");
  }
}

function pegarArchivos() {
  //console.log("Ver recuadro");
  /*const pass = consulta("Ingrese contraseña: ");
  if (pass != "Polos") {
    mensaje("Contraseña incorrecta");
    return;
  }
  mensaje("Contraseña correcta, bienvenido admin");*/

  const cuentas = { archivosError: 0, archivosOk: 0 };
  document.getElementById("operarios").style.display = "none";
  document.getElementById("archivo").style.display = "none";
  document.getElementById("unir").style.display = "grid";
  document.getElementById("logo").removeEventListener("click", pegarArchivos);
  const volver = document.getElementById("volver");
  volver.focus();

  document.addEventListener("keydown", (e) => {
    if (e.key == "Enter") {
      volver.focus();
    }
  });

  const fileDropArea = document.getElementById("fileDropArea");
  const fileList = document.getElementById("files");

  // Agrega un manejador de eventos para evitar que el navegador abra los archivos al arrastrarlos
  fileDropArea.addEventListener("dragover", (e) => {
    e.preventDefault();
  });

  // Agrega un manejador de eventos para manejar el evento "drop"
  fileDropArea.addEventListener("drop", (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    document.getElementById("h2Drop").style.display = "flex";
    document.getElementById("fileDropArea").style.display = "none";

    // Recorre los archivos y muestra sus nombres en la lista
    for (const file of files) {
      const listItem = document.createElement("li");
      listItem.textContent = file.name;
      fileList.appendChild(listItem);

      const reader = new FileReader();

      reader.onload = function (e) {
        const contenido = e.target.result;
        //console.log("Trabajos:", contenido.split(tagResumen)[0]);
        const filtrado = contenido.split(tagResumen);
        if (filtrado.length == 2) {
          console.log("Correcto!");
          textoCompleto += filtrado[0] + "\n";
        } else {
          console.log("Que pato");
        }
        console.log(textoCompleto);
        // Aquí puedes hacer lo que quieras con el contenido del archivo
        //Copiar contenido del archivo
      };

      reader.readAsText(file);
    }
  });
}

function restaurar() {
  console.log("Restaurar");
  copiarTodo(textoCompleto);
  textoCompleto = "";
  borrarDatos();
}

function copiarTodo(textoACopiar) {
  // Usar la API Clipboard para copiar el contenido
  navigator.clipboard
    .writeText(textoACopiar)
    .then(function () {
      // Mostrar mensaje de éxito
      mensaje("Texto copiado correctamente");
    })
    .catch(function (err) {
      // Mostrar mensaje de error si no se pudo copiar
      console.error("Error al copiar el texto:", err);
    });
}

//TODO: analizar la forma de agregar un archivo externo para facilitar la lectura del programa
function mensaje(textoMensaje) {
  //TODO: mostrar la ventana de información para indicar un mensaje
  //TODO: agregar evntos para que si hace click fuera de la ventana pueda salir
  //TODO: investigar si es posible desactibar los eventos, para que una vez que salga de la ventana, no puedan utilizarse mas esos eventos inicializados
  alert(textoMensaje);
}

function confirmacion(textoConfirm) {
  //TODO: utilizando la misma ventana, preguntamos al usuario
  return confirm(textoConfirm);
}

function consulta(textoConsulta, pass = false) {
  //TODO: como se ingresan valores predeterminados a una funcion en js?, es correcto lo que estoy haciendo de ingresar el valor predeterminado en la parte de variables? que forma es la correcta de ingresar valores?
  //TODO: utiliza la ventana para el ingreso de datos
  return prompt(textoConsulta).trim();
}

function abrirVentana(modo) {
  //TODO: activación de la ventana
  //TODO: logica para la creacion de botones
}

function comprobarPass(params) {
  //TODO: es necesario que yo utilice una cuncion solo para este uso?
}
