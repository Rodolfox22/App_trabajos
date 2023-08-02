let contadorLineas = 2;

const nuevaLineaHTML = `
<div id="linea${contadorLineas}">
<label for="fecha${contadorLineas}"> Fecha:</label>
<input type="text" id="fecha${contadorLineas}" placeholder="DD/MM/AAAA">
    <label for="horas${contadorLineas}">Horas:</label>
    <input type="text" id="horas${contadorLineas}" placeholder="Ej: 8">
    <label for="descripcion${contadorLineas}">Descripción:</label>
    <input type="text" id="descripcion${contadorLineas}" placeholder="Breve descripción del trabajo">
    <button onclick="eliminarLinea(${contadorLineas})">Eliminar</button>
    <button onclick="insertarLinea(${contadorLineas})">Nueva Línea</button>
    </div>
    `;

let textoArchivo = "";

function agregarLinea() {
  const lineasDiv = document.getElementById("lineas");

  lineasDiv.insertAdjacentHTML("beforeend", nuevaLineaHTML);

  contadorLineas++;
}

function eliminarLinea(numeroLinea) {
  const linea = document.getElementById(`linea${numeroLinea}`);
  linea.remove();
}

function insertarLinea(numeroLinea) {
  const lineasDiv = document.getElementById("lineas");

  const lineaActual = document.getElementById(`linea${numeroLinea}`);
  lineaActual.insertAdjacentHTML("afterend", nuevaLineaHTML);

  contadorLineas++;
}

//Todo: se puede mejorar la logica de esta funcion
function revisarArchivo() {
  const lineasDiv = document.getElementById("lineas");
  const lineasInputs = lineasDiv.getElementsByTagName("input");

  textoArchivo = "";
  let lineasIgnoradas = [];

  for (let i = 0; i < lineasInputs.length; i += 3) {
    const fecha = lineasInputs[i].value.trim();
    const horas = lineasInputs[i + 1].value;
    const descripcion = lineasInputs[i + 2].value;

    if (horas.trim() !== "" && descripcion.trim() !== "") {
      textoArchivo += `${fecha}\t${horas}\t${descripcion}\n`;
    } else {
      const numeroLinea = i / 3 + 1;
      lineasIgnoradas.push(numeroLinea);
    }
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
  a.href = url;
  a.download = "trabajos.txt";
  a.click();

  URL.revokeObjectURL(url);
}
