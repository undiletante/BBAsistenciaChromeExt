/********************************************************
 * Script para recolectar la lista de alumnos,
 * crear un modal con la lista de alumnos
 * enviar la lista al background script.
 * Este script se ejecuta en el contexto de la
 * pestaña activa de Chrome.
 ********************************************************/

// Función para esperar un tiempo (simula el tiempo de carga dinámica)
// const esperar = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
function esperar(ms) {
  return new Promise(function (resolve) {
    setTimeout(resolve, ms);
  });
}

// Recolecta la lista de alumnos de forma asincrona, desplazando el contenedor hasta el final [array]
async function recolectarParticipantes() {
  await esperar(1000); // Espera 1 segundo para asegurarse de que la página esté completamente cargada
  const contenedor = document.querySelector(".md-virtual-repeat-scroller"); // Selecciona el div desplazable
  if (!contenedor) {
    console.error("No se encontró el contenedor desplazable.");
    return [];
  }

  const participantes = new Set(); // Usamos un Set para evitar duplicados

  // Bucle para desplazar el contenedor
  while (
    contenedor.scrollTop + contenedor.clientHeight <
    contenedor.scrollHeight
  ) {
    // Recolecta los elementos visibles
    const elementosVisibles = Array.from(
      document.querySelectorAll(
        ".participant-list-item.participant-list-participant"
      )
    ).map((elemento) => elemento.innerText.split("\n")[0]);

    // Agrega los elementos al Set
    elementosVisibles.forEach((participante) =>
      participantes.add(participante)
    );

    // Desplaza el contenedor hacia abajo
    contenedor.scrollTop += 100; // Ajusta el valor según el tamaño del desplazamiento
    console.log(`Desplazamiento actual: ${contenedor.scrollTop}`);

    // Espera un tiempo para permitir que se carguen los nuevos elementos
    await esperar(300); // Ajusta el tiempo según la velocidad de carga de la página
  }

  // Recolecta los elementos visibles al final del desplazamiento
  const elementosFinales = Array.from(
    document.querySelectorAll(
      ".participant-list-item.participant-list-participant"
    )
  ).map((elemento) => elemento.innerText.split("\n")[0]);
  elementosFinales.forEach((participante) => participantes.add(participante));

  console.log("Participantes recolectados:", Array.from(participantes));
  return Array.from(participantes); // Devuelve un array con los participantes únicos
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
            background-color: #007bff; /* Azul para el botón "Copiar lista" */
            color: white;
        }

        .button-container button:last-child {
            background-color: #dc3545; /* Rojo para el botón "Cerrar" */
            color: white;
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
  heading.innerText = "Lista de Participantes";
  modalContent.appendChild(heading);

  const textArea = document.createElement("textarea");
  textArea.id = "lista";
  textArea.readOnly = true;
  modalContent.appendChild(textArea);

  // Crear contenedor para los botones
  const buttonContainer = document.createElement("div");
  buttonContainer.className = "button-container";

  const copyButton = document.createElement("button");
  copyButton.innerText = "Copiar lista";
  buttonContainer.appendChild(copyButton);

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

// Abrir el panel lateral
// Verificar si la variable 'sidePanel' existe
if (typeof sidePanel === "undefined" || sidePanel === null) {
  sidePanel = null; // Si no existe, inicializarla como null
}
sidePanelOpen = document.querySelector("#side-panel-open");
if (sidePanelOpen) {
  sidePanel = sidePanelOpen;
  sidePanel.click();

  // Verificar si la variable 'sidePanel' existe
  if (typeof participantsPanel === "undefined" || participantsPanel === null) {
    participantsPanel = null; // Si no existe, inicializarla como null
  }
  const panelElement = document.querySelector("#panel-control-participants");
  if (panelElement) {
    participantsPanel = panelElement;
    participantsPanel.click();

    // Recupera la lista de alumnos, la envía al background script 'sendElements' y muestra el modal
    recolectarParticipantes().then((participantes) => {
      // Enviar la lista de alumnos al background script
      chrome.runtime.sendMessage(
        { action: "sendElements", participantes },
        (response) => {
          if (response && response.success) {
            console.log("Lista de alumnos enviada correctamente.");
          } else {
            console.error(response);
            console.error("Error al enviar la lista de alumnos.");
          }
        }
      );

      // Crea ventana modal y añade la lista de alumnos dentro de un textarea
      const modal = crearModal(participantes);
      showModal(modal);
    });
  } else {
    participantsPanel = null;
    console.error("Error: no se encontró el panel de participantes.");
    alert("Error: no se encontró el panel de participantes!");
  }
} else {
  sidePanel = null;
  console.error("Error: no se encontró el panel lateral.");
  alert("Error: no se encontró el panel lateral!");
}
