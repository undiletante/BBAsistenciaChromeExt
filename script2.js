/********************************************************
 * Script para marcar la asistencia de los alumnos
 * en la plataforma de Cibertec.
 * Este script se ejecuta en el contexto de la
 * pestaña activa de Chrome.
 ********************************************************/

// TODO: verificar si el contenedor es correcto

// Función para buscar un nombre en una lista de participantes
function buscarNombreEnLista(nombre, lista) {
  return lista.some(
    (participante) => participante.toUpperCase() === nombre.toUpperCase()
  );
}

// Función para eliminar un nombre de la lista de participantes
function eliminarNombreDeLista(nombre, lista) {
  return lista.filter(participante => participante.toUpperCase() !== nombre.toUpperCase());
}

// Crea una ventana modal.
// Recibe un array de participantes y lo añade a un textarea [modal]
function crearModal(participantes) {
  // Crear estilos para la ventana modal
  const style = document.createElement("style");
  style.id = "temp_estilo";
  style.innerHTML = `
  .modal {
      display: none;
      position: fixed;
      z-index: 1;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      overflow: auto;
      background-color: rgba(0, 0, 0, 0.4);
      padding-top: 60px;
  }

  .modal-content {
      background-color: #fefefe;
      margin: 5% auto;
      padding: 20px;
      border: 1px solid #888;
      width: 80%;
  }

  .close {
      color: #aaa;
      float: right;
      font-size: 28px;
      font-weight: bold;
  }

  .close:hover,
  .close:focus {
      color: black;
      text-decoration: none;
      cursor: pointer;
  }

  textarea {
      width: 100%;
      height: 200px;
      margin-bottom: 10px;
  }

  .button-container {
      display: flex;
      justify-content: space-between;
      margin-top: 20px;
  }

  .button-container button {
      padding: 10px 20px;
      font-size: 16px;
      border: none;
      border-radius: 5px;
      cursor: pointer;
  }

  .button-container button:hover {
      opacity: 0.9;
  }

  .button-container button:first-child {
      background-color: #007bff; /* Azul para el botón "Copiar al portapapeles" */
      color: white;
  }

  .button-container button:last-child {
      background-color: #dc3545; /* Rojo para el botón "Cerrar" */
      color: white;
  }

  /* Estilo específico para el botón clearButton */
  .button-container button:nth-child(2) {
      background-color: #ffc107; /* Amarillo para el botón "Borrar lista" */
      color: black;
      font-weight: bold;
  }

  .button-container button:nth-child(2):hover {
      background-color: #e0a800; /* Un tono más oscuro al pasar el mouse */
  }
`;
  document.head.appendChild(style);

  // Crear la ventana modal
  const modal = document.createElement("div");
  modal.id = "temp_myModal";
  modal.className = "modal";

  const modalContent = document.createElement("div");
  modalContent.className = "modal-content";

  const closeButton = document.createElement("span");
  closeButton.className = "close";
  closeButton.innerHTML = "&times;";
  modalContent.appendChild(closeButton);

  const heading = document.createElement("h2");
  heading.innerText = `Lista de alumnos no encontrados (${participantes.length})`;
  modalContent.appendChild(heading);

  const textArea = document.createElement("textarea");
  textArea.id = "lista";
  textArea.readOnly = true;
  modalContent.appendChild(textArea);

  // Crear contenedor para los botones
  const buttonContainer = document.createElement("div");
  buttonContainer.className = "button-container";

  const copyButton = document.createElement("button");
  copyButton.innerText = "Copiar al portapapeles";
  buttonContainer.appendChild(copyButton);

  const clearButton = document.createElement("button");
  clearButton.innerText = "Borrar lista";
  buttonContainer.appendChild(clearButton);

  const closeModalButton = document.createElement("button");
  closeModalButton.innerText = "Cerrar";
  buttonContainer.appendChild(closeModalButton);

  modalContent.appendChild(buttonContainer);
  modal.appendChild(modalContent);
  document.body.appendChild(modal);

  // Función para cerrar el modal
  closeButton.onclick = function () {
    modal.style.display = "none";
    removeModal();
  };

  // Función para cerrar el modal (botón en el contenedor)
  closeModalButton.onclick = function () {
    modal.style.display = "none";
    removeModal();
  };

  // Función para copiar la lista al portapapeles
  copyButton.onclick = function () {
    textArea.select();
    document.execCommand("copy");
    alert("Lista copiada al portapapeles!");
  };

  // Función para borrar la lista
  clearButton.onclick = function () {
    textArea.select();

    // Actualiza los datos con un mensaje al background script    
    const participantes = [];
    chrome.runtime.sendMessage({ action: "sendElements", participantes }, (response) => {
      if (response && response.success) {
        heading.innerText = `Lista de alumnos no encontrados`;
        console.log("Lista de alumnos no encontrados eliminada correctamente.");
      } else {
        console.error(response);
        console.error("Error al eliminar la lista de alumnos no encontrados.");
      }
    });

    // Limpiar el textarea
    textArea.value = ""; 
  };

  // Cerrar el modal si alguien hace clic fuera de él
  window.onclick = function (event) {
    if (event.target === modal) {
      modal.style.display = "none";
      removeModal();
    }
  };

  // Agregar la lista de participantes al textarea
  textArea.value = participantes.join("\n");

  // Función para eliminar el modal y el estilo al cerrar
  function removeModal() {
    modal.remove();
    style.remove();
  }

  return modal;
}

// Función para mostrar el modal.
// Recibe el modal como parámetro.
function showModal(modal) {
  modal.style.display = "block";
}


//  --------------------------------------------------
// RUTINA
//  --------------------------------------------------


try {
  // Recupera la lista de alumnos no encontrados desde el almacenamiento local
  chrome.storage.local
    .get("listaAlumnos")
    .then((data) => {
      let participantes = data.listaAlumnos || [];
      const cantidadInicial = participantes.length; 
      let mensaje = (participantes.length > 0) ? participantes.join("\n") : "No hay elementos guardados.";

      console.log("Lista de alumnos no encontrados:", mensaje);

      // Si la lista de alumnos está vacía, mostrar un mensaje y salir
      if (participantes.length === 0) {
        console.error("No se reconoce la página como el control de asistencia. No hay lista de alumnos.");
        alert("No se reconoce la página como el control de asistencia (no hay lista de alumnos)!");
        return;
      }

      // Seleccionar todas las filas que contienen los datos de los alumnos
      const filas = document.querySelectorAll("#cphSite_gvAsistencia > tbody > tr");
      console.log(filas.length);
      filas.forEach((fila) => {
        const columnas = fila.querySelectorAll(":scope > td");

        // Extraer nombres y apellidos
        let nombre = "";
        if (columnas.length > 5) {
          const apellidoPaterno = columnas[2].textContent.trim();
          const apellidoMaterno = columnas[3].textContent.trim();
          const nombres = columnas[4].textContent.trim();
          nombre = `${nombres} ${apellidoPaterno} ${apellidoMaterno}`.replace(/\s+/g, " ").trim();
        }

        const botonesAsistencia = columnas[0].querySelectorAll('input[type="radio"]'); // A T F N
        // Marca la asistencia si nombre está en la lista de participantes
        if (buscarNombreEnLista(nombre, participantes)) {
          botonesAsistencia[0].checked = true;
          participantes = eliminarNombreDeLista(nombre, participantes);
        }
        // Si la asistencia no tiene estado o es NINGUNO se marca FALTA
        else {
          if (
            botonesAsistencia[3].checked === true ||
            (botonesAsistencia[0].checked === false &&
              botonesAsistencia[1].checked === false &&
              botonesAsistencia[2].checked === false &&
              botonesAsistencia[3].checked === false)
          ) {
            botonesAsistencia[2].checked = true; // Marca la asistencia como FALTA
          }
        }
      });

      // Enviar la lista de alumnos no encontrados al background script
      chrome.runtime.sendMessage(
        { action: "sendElements", participantes },
        (response) => {
          if (response && response.success) {
            console.log("Lista de alumnos no encontrados enviada correctamente.");
          } else {
            console.error(response);
            console.error("Error al enviar la lista de alumnos no encontrados.");
          }
        }
      );

      // Si hay alumnos no encontrados mostrar un modal
      if (participantes.length > 0) {
        const modal = crearModal(participantes);
        showModal(modal);
      } 
      // Si no hay alumnos no encontrados, mostrar un mensaje      
      else if (cantidadInicial > 0) {
        alert("Asistencia completa.");
      }
    })
    .catch((error) => {
      console.error(`Error al obtener la lista de alumnos: ${error}`);
      alert(
        "Ocurrió un error al obtener la lista de alumnos. Revisa la consola para más detalles."
      );
    });
} catch (error) {
  console.error(`Error inesperado: ${error}`);
  alert("Ocurrió un error inesperado. Revisa la consola para más detalles.");
}
