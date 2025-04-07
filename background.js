// Escucha mensajes desde otros scripts

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("[background.js] Mensaje recibido:", message);
  console.log("[background.js] Acción:", message.action);

  if (message.action === "sendElements") {

    // Verificar si 'participantes' es un array y no está vacío
    if (!Array.isArray(message.participantes)) {
      console.error("[background.js] Error: 'participantes' no es un array o está mal definido.");
      sendResponse({ success: false, error: "'participantes' no es un array válido." });
      return true;
    }

    const elementos = message.participantes;
    console.log("[background.js] Lista de alumnos recibidos:", elementos);

    // Guardar la lista de alumnos en chrome.storage.local
    chrome.storage.local
      .set({ listaAlumnos: elementos })
      .then(() => {
        console.log("[background.js] Lista de alumnos guardada:", elementos);

        // Guarda la cantidad en chrome.storage.local
        const cantidad = elementos.length;
        chrome.storage.local.set({ cantidadAlumnos: cantidad }, () => {
          if (chrome.runtime.lastError) {
            console.error("[background.js] Error al guardar 'cantidadAlumnos':", chrome.runtime.lastError);
            sendResponse({ success: false, error: chrome.runtime.lastError.message });
            return;
          }
          console.log(`[background.js] Cantidad de alumnos actualizada: ${cantidad}`);          
        });

        // Enviar la cantidad de alumnos al popup
        chrome.runtime.sendMessage(
          { action: "actualizaBotonMarcar", cantidad },
          (response) => {
            if (response && response.success) {
              console.log("[background.js] Cantidad de alumnos enviada correctamente: ", cantidad);
            } else {
              console.error(`[background.js] ${response}`);
              console.error("[background.js] Error al enviar la cantidad de alumnos.");
              sendResponse({ success: false, error: "Error al enviar la cantidad de alumnos a background:actualizaBotonMarcar" });
            }
          }
        );

        sendResponse({ success: true });
      })
      .catch((error) => {
        console.error("[background.js] Error al guardar la lista de alumnos:", error);
        sendResponse({ success: false, error: error.message });
      });

    // Indicar que la respuesta será enviada de forma asíncrona
    return true;

  } else if (message.action === "sendPendings") {

    if (!Array.isArray(message.participantes)) {
      console.error("[background.js] Error: 'participantes' no es un array o está mal definido.");
      sendResponse({ success: false, error: "'participantes' no es un array válido." });
      return true;
    }

    const elementos = message.participantes;
    console.log("[background.js] Lista de alumnos no encontrados recibidos:", elementos);

    // Actualzar la lista de alumnos no encontrados en chrome.storage.local
    chrome.storage.local
      .set({ listaAlumnos: elementos })
      .then(() => {
        console.log("[background.js] Lista de alumnos no encontrados actualizada:", elementos);

        // Actualiza la cantidad en chrome.storage.local
        const cantidad = elementos.length;
        chrome.storage.local.set({ cantidadAlumnos: cantidad }, () => {
          if (chrome.runtime.lastError) {
            console.error("[background.js] Error al guardar 'cantidadAlumnos':", chrome.runtime.lastError);
            sendResponse({ success: false, error: chrome.runtime.lastError.message });
            return;
          }
          console.log(`[background.js] Cantidad de alumnos no encontrados actualizada: ${cantidad}`);          
        });

        // Enviar la cantidad de alumnos al popup
        chrome.runtime.sendMessage(
          { action: "actualizaBotonMarcar", cantidad },
          (response) => {
            if (response && response.success) {
              console.log("[background.js] Cantidad de alumnos enviada correctamente: ", cantidad);
            } else {
              console.error("[background.js] ", response);
              console.error("[background.js] Error al enviar la cantidad de alumnos.");
              sendResponse({ success: false, error: "Error al enviar la cantidad de alumnos a background:actualizaBotonMarcar" });
            }
          }
        );

        sendResponse({ success: true });
      })
      .catch((error) => {
        console.error("[background.js] Error al guardar la lista de alumnos:", error);
        sendResponse({ success: false, error: error.message });
      });

    // Indicar que la respuesta será enviada de forma asíncrona
    return true;
  } else if (message.action === "clearElements") {

    //Borrar la lista de alumnos no encontrados    
    chrome.storage.local.set({ listaAlumnos: [] })
      .then(() => {
        console.log("[background.js] Lista de alumnos borrada.");

        // Actualizar la cantidad en chrome.storage.local
        const cantidad = 0;
        chrome.storage.local.set({ cantidadAlumnos: cantidad }, () => {
          if (chrome.runtime.lastError) {
            console.error("[background.js] Error al actualizar 'cantidadAlumnos':", chrome.runtime.lastError);
            sendResponse({ success: false, error: chrome.runtime.lastError.message });
            return;
          }
          console.log(`[background.js] Cantidad de alumnos actualizada: ${cantidad}`);          
        });

        // Enviar la cantidad de alumnos al popup
        chrome.runtime.sendMessage(
          { action: "actualizaBotonMarcar", cantidad },
          (response) => {
            if (response && response.success) {
              console.log("[background.js] Cantidad de alumnos enviada correctamente: ", cantidad);
            } else {
              console.error("[background.js] ", response);
              console.error("[background.js] Error al enviar la cantidad de alumnos.");
              sendResponse({ success: false, error: "Error al enviar la cantidad de alumnos a background:actualizaBotonMarcar" });
            }
          }
        );

        sendResponse({ success: true });
      })
      .catch((error) => {
        console.error("[background.js] Error al borrar la lista de alumnos:", error);
        sendResponse({ success: false, error: error.message });
      });

    // Indicar que la respuesta será enviada de forma asíncrona
    return true;

  } else {
    console.error("[background.js] Acción no reconocida:", message.action);
    sendResponse({ success: false, error: "Acción no reconocida." });
  }
});