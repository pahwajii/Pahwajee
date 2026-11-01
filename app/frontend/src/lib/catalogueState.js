// Once the API has answered, even an empty catalogue is authoritative. Keep
// that last answer through background refreshes instead of reviving the build.
export function currentCatalogue(catalog, hasLoaded, snapshot = []) {
  return hasLoaded ? catalog : { ...Object.fromEntries(snapshot.map(product => [product.slug, product])), ...catalog };
}

export const CATALOGUE_FRESH_MS = 15_000;
export const CATALOGUE_TIMEOUT_MS = 8_000;

export function notifyCatalogueChanged() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event('pahwa-catalogue-updated'));
  try {
    if (typeof BroadcastChannel === 'undefined') return;
    const channel = new BroadcastChannel('pahwa-catalogue');
    channel.postMessage('updated');
    channel.close();
  } catch { /* Same-tab updates still work where cross-tab messaging is blocked. */ }
}

// A deadline also settles when a fetch implementation fails to honour abort.
export async function withCatalogueTimeout(operation, { signal, timeoutMs = CATALOGUE_TIMEOUT_MS, setTimer = setTimeout, clearTimer = clearTimeout } = {}) {
  const controller = new AbortController();
  const abort = () => controller.abort(signal.reason);
  if (signal?.aborted) abort();
  else signal?.addEventListener('abort', abort, { once: true });
  let timer;
  const deadline = new Promise((_, reject) => {
    timer = setTimer(() => {
      const error = new Error('The shop is taking too long to respond. Please retry.');
      error.code = 'catalogue_timeout';
      controller.abort(error);
      reject(error);
    }, timeoutMs);
  });
  try { return await Promise.race([operation(controller.signal), deadline]); }
  finally { clearTimer(timer); signal?.removeEventListener('abort', abort); }
}

// Kept independent of React so freshness, races and failures are testable.
export function createCatalogueCache(load, { now = Date.now, initialCatalog = {} } = {}) {
  let state = { catalog: initialCatalog, loaded: false, status: 'loading', refreshing: false, validatedAt: null };
  let pending;
  let invalidation;
  let revision = 0;
  let validatedRevision = -1;
  let listVersion = 0;
  const productRequests = new Map();
  const listeners = new Set();
  function publish(next) { state = { ...state, ...next }; listeners.forEach(listener => listener(state)); }
  const cache = {
    getState: () => state,
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); },
    mergeProduct(product) {
      publish({ catalog: { ...state.catalog, [product.slug]: product } });
      return product;
    },
    removeProduct(slug) {
      if (!(slug in state.catalog)) return;
      const catalog = { ...state.catalog };
      delete catalog[slug];
      publish({ catalog });
    },
    loadProduct(slug, load) {
      if (productRequests.has(slug)) return productRequests.get(slug);
      const request = (async () => {
        while (true) {
          const requestedRevision = revision;
          const requestedListVersion = listVersion;
          try {
            const product = await load(slug);
            // A detail read started before an admin save must not overwrite
            // the newly validated list with its old price or availability.
            if (requestedRevision !== revision || requestedListVersion !== listVersion) {
              if (validatedRevision === revision && state.status === 'ready' && state.catalog[slug]) return state.catalog[slug];
              continue;
            }
            return cache.mergeProduct(product);
          } catch (error) {
            if (requestedRevision !== revision || requestedListVersion !== listVersion) {
              if (validatedRevision === revision && state.status === 'ready' && state.catalog[slug]) return state.catalog[slug];
              continue;
            }
            if (error.status === 404) cache.removeProduct(slug);
            throw error;
          }
        }
      })().finally(() => productRequests.delete(slug));
      productRequests.set(slug, request);
      return request;
    },
    async validateProducts(slugs, load) {
      const missing = [...new Set(slugs.filter(slug => !state.catalog[slug]))];
      try {
        await Promise.all(missing.map(slug => cache.loadProduct(slug, load).catch(error => { if (error.status !== 404) throw error; })));
      } catch (error) {
        // A saved item outside the list limit still needs a reliable answer.
        // Keep it visible and offer the ordinary catalogue retry on failure.
        publish({ status: 'error' });
        throw error;
      }
      return state.catalog;
    },
    refresh({ force = false, forInvalidation = false } = {}) {
      if (invalidation && !forInvalidation) return invalidation;
      if (pending) return pending;
      if (!force && validatedRevision === revision && state.status === 'ready' && now() - state.validatedAt < CATALOGUE_FRESH_MS) return Promise.resolve(state.catalog);
      const requestedRevision = revision;
      publish({ refreshing: true, status: state.loaded && state.status === 'ready' ? 'ready' : 'loading' });
      pending = Promise.resolve().then(load).then(products => {
        if (!Array.isArray(products)) throw new Error('The shop returned an invalid catalogue. Please retry.');
        if (requestedRevision !== revision) return state.catalog;
        const catalog = Object.fromEntries(products.map(product => [product.slug, product]));
        validatedRevision = requestedRevision;
        listVersion += 1;
        publish({ catalog, loaded: true, status: 'ready', validatedAt: now() });
        return catalog;
      }).catch(error => {
        if (requestedRevision === revision) publish({ status: 'error' });
        throw error;
      }).finally(() => { pending = null; publish({ refreshing: false }); });
      return pending;
    },
    invalidate() {
      revision += 1;
      if (invalidation) return invalidation;
      invalidation = (async () => {
        // An in-flight read may predate the admin save. Do not accept it as fresh.
        if (pending) await pending.catch(() => {});
        do {
          const requestedRevision = revision;
          try { await cache.refresh({ force: true, forInvalidation: true }); }
          catch (error) { if (requestedRevision === revision) throw error; }
        } while (validatedRevision !== revision);
        return state.catalog;
      })().finally(() => { invalidation = null; });
      return invalidation;
    },
  };
  return cache;
}

export function refreshOnReturn(refresh, browserWindow, browserDocument) {
  const onReturn = () => {
    if (browserDocument.visibilityState !== 'hidden') refresh().catch(() => {});
  };
  browserWindow.addEventListener('focus', onReturn);
  browserDocument.addEventListener('visibilitychange', onReturn);
  return () => {
    browserWindow.removeEventListener('focus', onReturn);
    browserDocument.removeEventListener('visibilitychange', onReturn);
  };
}
