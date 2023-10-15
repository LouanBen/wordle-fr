self.addEventListener("fetch", (event) => {
    let url = new URL(event.request.url);
    let method = event.request.method;

    // Only focus on GET requests
    if (method.toLowerCase() !== "get") return;

    // Cache only icons and fonts
    if (
        url.pathname.startsWith("/icons/") ||
        url.pathname.includes("favicon") ||
        url.hostname.includes('fonts.gstatic.com')
    ) {
        event.respondWith(
            caches.open("assets").then(async (cache) => {

                // Use the cache if the request is cached
                let cacheResponse = await cache.match(event.request);
                if (cacheResponse) return cacheResponse;

                // If it's not cached we will run the fetch, cache it and return it
                // This way the next time this asset its needed it will load from the cache
                let fetchResponse = await fetch(event.request);
                cache.put(event.request, fetchResponse.clone());

                return fetchResponse;
            })
        );
    }
});