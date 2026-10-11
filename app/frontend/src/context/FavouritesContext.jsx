import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { FAVOURITES_KEY, favouriteKey, restoreFavourites, toggleFavourite } from '../lib/favourites';
const Context = createContext(null);
export function FavouritesProvider({children}) {
  const [items, setItems] = useState([]);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const [message, setMessage] = useState('');
  const current = useRef([]);
  function update(next) { current.current = next; setItems(next); }
  useEffect(() => {
    try { update(restoreFavourites(localStorage.getItem(FAVOURITES_KEY))); }
    catch { setStorageError(true); }
    setReady(true);
    function sync(event) {
      if (event.key !== FAVOURITES_KEY && event.key !== null) return;
      try {
        if (event.storageArea !== localStorage) return;
        update(restoreFavourites(event.newValue));
      } catch { setStorageError(true); }
    }
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);
  function toggle(item, name) {
    if (!ready) return;
    const saved = current.current.some(entry => favouriteKey(entry) === favouriteKey(item));
    const next = toggleFavourite(current.current, item);
    update(next);
    try { localStorage.setItem(FAVOURITES_KEY, JSON.stringify(next)); setStorageError(false); }
    catch { setStorageError(true); }
    setMessage(name + (saved ? ' removed from favourites.' : ' saved to favourites.'));
  }
  return <Context.Provider value={{items, ready, storageError, toggle, isSaved: item => items.some(entry => favouriteKey(entry) === favouriteKey(item))}}>
    {children}<p role="status" aria-live="polite" className="sr-only">{message}</p>
  </Context.Provider>;
}
export const useFavourites = () => useContext(Context);
