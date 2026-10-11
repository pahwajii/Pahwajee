import googleReviews from '../../../google-reviews.json';
import { isStoreProduct, isGalleryOnlySlug } from './storefront';

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

let refreshPromise;

async function request(path, options = {}, retried = false) {
  const needsCredentials = path.startsWith('/auth') || path.startsWith('/admin') || options.credentials;
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: needsCredentials ? 'include' : 'omit',
    headers: {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    if (response.status === 401 && (path.startsWith('/admin') || path === '/auth/me')) {
      if (!retried) {
        refreshPromise ||= fetch(`${API_BASE}/auth/refresh`, { method: 'POST', credentials: 'include' }).finally(() => { refreshPromise = null; });
        const refreshed = await refreshPromise;
        if (refreshed.ok) return request(path, options, true);
      }
      window.dispatchEvent(new Event('pahwa-auth-expired'));
    }
    const payload = await response.json().catch(() => ({}));
    const detail = payload.detail;
    const error = new Error(typeof detail === 'string' ? detail : detail?.message || (Array.isArray(detail) ? 'Please check the customer details and cart quantities.' : 'Something went wrong. Please try again.'));
    error.status = response.status;
    error.detail = detail;
    throw error;
  }

  return response.json();
}

async function get(path) {
  if (path.startsWith('/products/') && isGalleryOnlySlug(path.slice('/products/'.length).split('?')[0])) {
    const error = new Error('Product not found');
    error.status = 404;
    throw error;
  }
  const data = await request(path);
  return /^\/products(?:\?|$)/.test(path) && Array.isArray(data) ? data.filter(isStoreProduct) : data;
}

export default {
  get,
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
  patch: (path, body) => request(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (path) => request(path, { method: 'DELETE' }),
};

export const BUSINESS = {
  name: "PAHWA JEE",
  fssaiNumber: "22718357001092",
  googleReviewUrl: googleReviews.write_review_url,
  tagline: "Meerut's Trusted Destination for Nankhatai, Rewri, Gazak, Shakes & Premium Gift Hampers",
  phones: ["6396339806", "9837566628"],
  whatsapp: "6396339806",
  address: "19 Abu Lane, Meerut, Uttar Pradesh, India",
  mapEmbed: "https://www.google.com/maps?q=19+Abu+Lane+Meerut&output=embed",
  mapLink: "https://goo.gl/maps/LitsbZD5w865XZux5?g_st=aw",
  hours: "10:00 AM – 11:00 PM (Open All Days)",
  instagram: "https://www.instagram.com/pahwajee/",
  instagramOther: "https://www.instagram.com/food_adda_pahwajee/",
  facebook: "https://www.facebook.com/p/PAHWA-JEE-REWRI-WALE-61568193482637/",
};

export function waLink(product) {
  const msg = product
    ? `Hi PAHWA JEE, I'd like to order: ${product}. Please share availability & price.`
    : `Hi PAHWA JEE, I'd like to place an order.`;
  return `https://wa.me/91${BUSINESS.whatsapp}?text=${encodeURIComponent(msg)}`;
}

export function telLink(phone) {
  return `tel:+91${phone || BUSINESS.phones[0]}`;
}
