/********************************************************
 * Script para marcar la asistencia de los alumnos
 * en la plataforma Blackboard.
 * Este script se ejecuta en el contexto de la
 * pestaña activa de Chrome.
 ********************************************************/

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
  heading.innerText = "Lista de Alumnos Pendientes";
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

try {
  // Recupera la lista de alumnos pendientes desde el almacenamiento local
  chrome.storage.local
    .get("listaAlumnos")
    .then((data) => {
      let participantes = data.listaAlumnos || [];
      let mensaje = participantes.length > 0 ? participantes.join("\n") : "No hay elementos guardados.";

      alert(`Lista de alumnos: ${mensaje}`);
      console.log("Lista de alumnos:", participantes);

      // TODO: Lógica para marcar la asistencia en la plataforma deseada.
      // Cuando se realice el proceso más de una vez, solo se debe marcar asistencia a los alumnos que no tienen asistencia marcada.
      // Se debe conservar la lista de alumnos pendientes


      // Enviar la lista de alumnos pendientes al background script
      chrome.runtime.sendMessage(
        { action: "sendPendings", participantes },
        (response) => {
          if (response && response.success) {
            console.log("Lista de alumnos pendientes enviada correctamente.");
          } else {
            console.error(response);
            console.error("Error al enviar la lista de alumnos pendientes.");
          }
        }
      );

      // Si hay alumnos pendientes mostrar un modal
      if (participantes.length > 0) {
        const modal = crearModal(participantes);
        showModal(modal);
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
