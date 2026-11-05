import { createContext, useContext, useEffect, useState } from 'react';
import api from '../lib/api';
import {
  DEFAULT_PROMO,
  PROMO_STORAGE_DISMISS_KEY,
  isPromoActive,
  isProductEligible,
  calculatePromoDiscount,
} from '../lib/promo';

const PromoContext = createContext(null);

export function PromoProvider({ children, initialPromo }) {
  const [promo, setPromo] = useState(initialPromo || DEFAULT_PROMO);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && sessionStorage.getItem(PROMO_STORAGE_DISMISS_KEY) === 'true') {
        setDismissed(true);
      }
    } catch {
      // Storage access can be restricted
    }

    let active = true;
    api.get('/promo-banner')
      .then((data) => {
        if (active && data && typeof data === 'object') {
          setPromo(data);
        }
      })
      .catch(() => {
        // Fall back gracefully to DEFAULT_PROMO
      });

    return () => { active = false; };
  }, []);

  function dismissBanner() {
    setDismissed(true);
    try {
      sessionStorage.setItem(PROMO_STORAGE_DISMISS_KEY, 'true');
    } catch {
      // Still works in-memory
    }
  }

  const active = isPromoActive(promo);
  const bannerVisible = active && !dismissed;

  const isEligibleForDiscount = (product) => isProductEligible(product, promo);
  const calculateDiscount = (items) => calculatePromoDiscount(items, promo);

  return (
    <PromoContext.Provider value={{
      promo,
      setPromo,
      isPromoActive: active,
      bannerVisible,
      dismissBanner,
      isEligibleForDiscount,
      calculateDiscount,
    }}>
      {children}
    </PromoContext.Provider>
  );
}

export function usePromo() {
  const ctx = useContext(PromoContext);
  if (!ctx) {
    const active = isPromoActive(DEFAULT_PROMO);
    return {
      promo: DEFAULT_PROMO,
      setPromo: () => {},
      isPromoActive: active,
      bannerVisible: active,
      dismissBanner: () => {},
      isEligibleForDiscount: (p) => isProductEligible(p, DEFAULT_PROMO),
      calculateDiscount: (items) => calculatePromoDiscount(items, DEFAULT_PROMO),
    };
  }
  return ctx;
}
