const API_BASE = import.meta.env.VITE_API_BASE || '/api';

async function request(path, options = {}) {
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
    throw new Error(`API ${response.status}: ${path}`);
  }

  return response.json();
}

export default {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (path) => request(path, { method: 'DELETE' }),
};

export const BUSINESS = {
  name: "PAHWA JEE",
  tagline: "Meerut's Trusted Destination for Nankhatai, Rewri, Gazak, Shakes & Premium Gift Hampers",
  phones: ["6396339806", "9837566628"],
  whatsapp: "6396339806",
  address: "19 Abu Lane, Meerut, Uttar Pradesh, India",
  mapEmbed: "https://www.google.com/maps?q=19+Abu+Lane+Meerut&output=embed",
  mapLink: "https://goo.gl/maps/LitsbZD5w865XZux5?g_st=aw",
  hours: "9:00 AM – 10:30 PM (Open All Days)",
  instagram: "https://www.instagram.com/pahwajee/",
  instagramOther: "https://www.instagram.com/food_adda_pahwajee/",
  facebook: "https://facebook.com",
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
