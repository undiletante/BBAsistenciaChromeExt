// Escucha mensajes desde otros scripts

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Mensaje recibido:", message);
  console.log("Acción:", message.action);

  if (message.action === "sendElements") {

    // Verificar si 'participantes' es un array y no está vacío
    if (!Array.isArray(message.participantes)) {
      console.error("Error: 'participantes' no es un array o está mal definido.");
      sendResponse({ success: false, error: "'participantes' no es un array válido." });
      return true;
    }

    const elementos = message.participantes;
    console.log("Lista de alumnos recibidos:", elementos);

    // Guardar la lista de alumnos en chrome.storage.local
    chrome.storage.local
      .set({ listaAlumnos: elementos })
      .then(() => {
        console.log("Lista de alumnos guardada:", elementos);

        // Guarda la cantidad en chrome.storage.local
        const cantidad = elementos.length;
        chrome.storage.local.set({ cantidadAlumnos: cantidad }, () => {
          if (chrome.runtime.lastError) {
            console.error("Error al guardar 'cantidadAlumnos':", chrome.runtime.lastError);
            sendResponse({ success: false, error: chrome.runtime.lastError.message });
            return;
          }
          console.log(`Cantidad de alumnos actualizada: ${cantidad}`);          
        });

        // Enviar la cantidad de alumnos al popup
        chrome.runtime.sendMessage(
          { action: "actualizaBotonMarcar", cantidad },
          (response) => {
            if (response && response.success) {
              console.log("Cantidad de alumnos enviada correctamente: ", cantidad);
            } else {
              console.error(response);
              console.error("Error al enviar la cantidad de alumnos.");
            }
          }
        );

        sendResponse({ success: true });
      })
      .catch((error) => {
        console.error("Error al guardar la lista de alumnos:", error);
        sendResponse({ success: false, error: error.message });
      });

    // Indicar que la respuesta será enviada de forma asíncrona
    return true;

  } else if (message.action === "sendPendings") {

    if (!Array.isArray(message.participantes)) {
      console.error("Error: 'participantes' no es un array o está mal definido.");
      sendResponse({ success: false, error: "'participantes' no es un array válido." });
      return true;
    }

    const elementos = message.participantes;
    console.log("Lista de alumnos pendientes recibidos:", elementos);

    // Actualzar la lista de alumnos pendientes en chrome.storage.local
    chrome.storage.local
      .set({ listaAlumnos: elementos })
      .then(() => {
        console.log("Lista de alumnos pendientes actualizada:", elementos);

        // Actualiza la cantidad en chrome.storage.local
        const cantidad = elementos.length;
        chrome.storage.local.set({ cantidadAlumnos: cantidad }, () => {
          if (chrome.runtime.lastError) {
            console.error("Error al guardar 'cantidadAlumnos':", chrome.runtime.lastError);
            sendResponse({ success: false, error: chrome.runtime.lastError.message });
            return;
          }
          console.log(`Cantidad de alumnos pendientes actualizada: ${cantidad}`);          
        });

        // Enviar la cantidad de alumnos al popup
        chrome.runtime.sendMessage(
          { action: "actualizaBotonMarcar", cantidad },
          (response) => {
            if (response && response.success) {
              console.log("Cantidad de alumnos enviada correctamente: ", cantidad);
            } else {
              console.error(response);
              console.error("Error al enviar la cantidad de alumnos.");
            }
          }
        );

        sendResponse({ success: true });
      })
      .catch((error) => {
        console.error("Error al guardar la lista de alumnos:", error);
        sendResponse({ success: false, error: error.message });
      });

    // Indicar que la respuesta será enviada de forma asíncrona
    return true;
  } else {
    console.error("Acción no reconocida:", message.action);
    sendResponse({ success: false, error: "Acción no reconocida." });
  }
});