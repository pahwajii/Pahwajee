import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
export const API = `${BACKEND_URL}/api`;

const api = axios.create({
  baseURL: API,
  withCredentials: true,
});

export default api;

export const BUSINESS = {
  name: "PAHWA JEE",
  tagline: "Meerut's Trusted Destination for Nankhatai, Rewri, Gazak, Shakes & Premium Gift Hampers",
  phones: ["6396339806", "9837566628"],
  whatsapp: "6396339806",
  address: "19 Abu Lane, Meerut, Uttar Pradesh, India",
  mapEmbed: "https://www.google.com/maps?q=19+Abu+Lane+Meerut&output=embed",
  mapLink: "https://goo.gl/maps/LitsbZD5w865XZux5?g_st=aw",
  hours: "9:00 AM – 10:30 PM (Open All Days)",
  instagram: "https://instagram.com",
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
