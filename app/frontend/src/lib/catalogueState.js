// Once the API has answered, even an empty catalogue is authoritative. Keep
// that last answer through background refreshes instead of reviving the build.
export function currentCatalogue(catalog, hasLoaded, snapshot = []) {
  return hasLoaded ? catalog : { ...Object.fromEntries(snapshot.map(product => [product.slug, product])), ...catalog };
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
