/********************************************************
 * Este script se ejecuta en el contexto del popup de
 *  la extensión de Chrome.
 *
 * Recepciona datos desde otros scripts y actualiza el
 * botón de marcar asistencia
 *  Actualiza el botón del popup
 ********************************************************/

// Función para obtener el ID de la pestaña activa
async function getActiveTabId() {
  let tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  return tabs.length ? tabs[0].id : null;
}

//  --------------------------------------------------
// RUTINA
//  --------------------------------------------------


document.addEventListener("DOMContentLoaded", async () => {
  // Recupera la cantidad de alumnos desde chrome.storage.local
  // y actualiza el texto del botón de marcar asistencia
  chrome.storage.local.get("cantidadAlumnos", (result) => {
    const cantidad = result.cantidadAlumnos || 0;
    const botonMarcar = document.getElementById("script2");
    if (botonMarcar && cantidad > 0) {
      botonMarcar.textContent = `Marcar asistencia (${cantidad})`;
    } else {
      botonMarcar.textContent = `Marcar asistencia`;
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
      console.error("[popup.js] No se encontró una pestaña activa.");
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
      console.error("[popup.js] No se encontró una pestaña activa.");
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

// Escucha mensajes enviados desde otros scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "actualizaBotonMarcar") {
    // Recupera la cantidad de alumnos
    const cantidad = message.cantidad || [];
    console.log("[popup.js] Cantidad de alumnos recibidos:", cantidad);

    // Actualizar el boton de marcar asistencia con la cantidad de alumnos
    const botonMarcar = document.getElementById("script2");
    if (botonMarcar) {
      botonMarcar.textContent = "Marcar asistencia";
      botonMarcar.textContent += cantidad > 0 ? ` (${cantidad})` : "";
    }
    sendResponse({ success: true });
  }
});
