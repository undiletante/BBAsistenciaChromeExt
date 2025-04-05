/********************************************************
 * Este script se ejecuta en el contexto del popup de
 *  la extensión de Chrome.
 *
 * Recepciona datos desde otros scripts y actualiza el
 * botón de marcar asistencia
 *  Actualiza el botón del popup
 ********************************************************/

document.addEventListener("DOMContentLoaded", () => {
  // Recupera la cantidad de alumnos desde chrome.storage.local
  // y actualiza el texto del botón de marcar asistencia
  chrome.storage.local.get("cantidadAlumnos", (result) => {
    const cantidad = result.cantidadAlumnos || -1; // Si no hay datos, usa -1
    const botonMarcar = document.getElementById("script2");
    if (botonMarcar && cantidad !== -1) {
      botonMarcar.textContent = `Marcar asistencia (${cantidad})`;
    } else {
      botonMarcar.textContent = `Marcar asistencia`;
      // Eliminar los datos de cantidadAlumnos después de recuperarlos
      chrome.storage.local
        .remove("cantidadAlumnos")
        .then(() => {
          console.log("'cantidadAlumnos' se eliminó del almacenamiento local.");
        })
        .catch((error) => {
          console.error(`Error al eliminar 'cantidadAlumnos': ${error}`);
        });
    }
  });

  // Obtener los botones y agregar los eventos click
  const botonRecolectar = document.getElementById("script1");
  botonRecolectar.addEventListener("click", async () => {
    let tabId = await getActiveTabId();
    if (tabId) {
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ["script1.js"],
      });
    } else {
      console.error("No se encontró una pestaña activa.");
      alert("No se encontró una pestaña activa.");
    }
  });

  const botonMarcar = document.getElementById("script2");
  botonMarcar.addEventListener("click", async () => {
    let tabId = await getActiveTabId();
    if (tabId) {
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ["script2.js"],
      });
    } else {
      console.error("No se encontró una pestaña activa.");
      alert("No se encontró una pestaña activa.");
    }
  });

  // Tooltip de Bootstrap
  const tooltipTriggerList = [].slice.call(
    document.querySelectorAll('[data-bs-toggle="tooltip"]')
  );
  tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });
});

// Función para obtener el ID de la pestaña activa
async function getActiveTabId() {
  let tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  return tabs.length ? tabs[0].id : null;
}

// Escucha mensajes enviados desde otros scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "actualizaBotonMarcar") {
    // Recupera la cantidad de alumnos
    const cantidad = message.cantidad || [];
    console.log("Cantidad de alumnos recibidos:", cantidad);

    // Actualizar el boton de marcar asistencia con la cantidad de alumnos
    const botonMarcar = document.getElementById("script2");
    if (botonMarcar) {
      botonMarcar.textContent = "Marcar asistencia";
      botonMarcar.textContent += (cantidad > 0) ? ` (${cantidad})` : "";
    }
    sendResponse({ success: true });
  }
});
