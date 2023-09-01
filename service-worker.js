// service-worker.js

const CACHE_NAME = "trabajos-JLC-v1";
const urlsToCache = [
  "/",
  "/index.html",
  "/horas.html",
  "/styles.css",
  "/app.js",
  "/logo.png",
  "/icono.png",
  // Agrega aquí otros archivos que desees cachear
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Si el recurso está en caché, devuélvelo desde la caché.
      if (response) {
        return response;
      }

      // Si el recurso no está en caché, realiza una solicitud a la red
      // y guárdalo en la caché para futuros accesos.
      return fetch(event.request)
        .then((networkResponse) => {
          // Comprueba si la respuesta de la red es válida antes de guardarla en caché.
          if (
            !networkResponse ||
            networkResponse.status !== 200 ||
            networkResponse.type !== "basic"
          ) {
            return networkResponse;
          }

          const clonedResponse = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clonedResponse);
          });

          return networkResponse;
        })
        .catch((error) => {
          // Manejo de errores de red aquí, si es necesario.
        });
    })
  );
});
