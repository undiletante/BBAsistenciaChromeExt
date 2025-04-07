// Escucha mensajes desde otros scripts

function actualizaCantidadAlumnos(cantidad) {
  // Actualizar la cantidad en chrome.storage.local
  chrome.storage.local.set({ cantidadAlumnos: cantidad }, () => {
    if (chrome.runtime.lastError) {
      console.warn("[background.js] No se pudo actualizar 'cantidadAlumnos': ",chrome.runtime.lastError);
      //sendResponse({success: false, error: chrome.runtime.lastError.message});
      return;
    }
    console.log(`[background.js] Cantidad de alumnos actualizada: ${cantidad}`);
  });

  // Enviar la cantidad de alumnos al popup
  chrome.runtime.sendMessage(
    { action: "actualizaBotonMarcar", cantidad },
    (response) => {
      if (chrome.runtime.lastError) {
        console.warn("[background.js] No se pudo enviar el mensaje al popup:", chrome.runtime.lastError.message);
        return; // Salir del callback si ocurre un error
      }

      if (response && response.success) {
        console.log("[background.js] Se envió cantidad de alumnos al popup: ", cantidad);
      } else {
        console.warn("[background.js] Response: ", response);
        console.warn("[background.js] No se puede enviar la cantidad de alumnos al popup.");
        //sendResponse({ success: false, error: "Error al enviar la cantidad de alumnos a background:actualizaBotonMarcar" });
      }
    }
  );
}


//  --------------------------------------------------
// RUTINA
//  --------------------------------------------------


// Escucha mensajes enviados desde otros scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("[background.js] Mensaje recibido: ", message);
  console.log("[background.js] Acción: ", message.action);

  if (message.action === "sendElements") {
    // Verificar si 'participantes' es un array y no está vacío
    if (!Array.isArray(message.participantes)) {
      console.error("[background.js] Error: 'participantes' no es un array o está mal definido.");
      sendResponse({success: false, error: "'participantes' no es un array válido."});
      return true;
    }

    const elementos = message.participantes;
    console.log("[background.js] Lista de alumnos recibidos:", elementos);

    // Guardar la lista de alumnos en chrome.storage.local
    chrome.storage.local
      .set({ listaAlumnos: elementos })
      .then(() => {
        console.log("[background.js] Lista de alumnos guardada:", elementos);
        actualizaCantidadAlumnos(elementos.length);
        sendResponse({ success: true });
      })
      .catch((error) => {
        console.error("[background.js] Error al guardar la lista de alumnos:", error);
        sendResponse({ success: false, error: error.message });
      });

    // Indicar que la respuesta será enviada de forma asíncrona
    return true;
  } else {
    console.error("[background.js] Acción no reconocida:", message.action);
    sendResponse({ success: false, error: "Acción no reconocida." });
  }
});
