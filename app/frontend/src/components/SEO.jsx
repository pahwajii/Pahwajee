import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function SEO({ title, description, schema, canonical }) {
  const location = useLocation();

  useEffect(() => {
    const defaultTitle = "PAHWAJEE Meerut | Sweets, Nankhatai, Rewri, Gajak & Bakery";
    const defaultDesc = "Discover PAHWAJEE in Meerut, Abu Lane. Home to legendary Desi Ghee Nankhatai, Punjabi Rewri, Premium Gazak, fresh bakery, customized cakes, sweets, and gift hampers.";
    const domain = "https://pahwajee.com"; // Adjust when a real domain is set

    // Update document title
    document.title = title || defaultTitle;

    // Update meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      document.head.appendChild(metaDesc);
    }
    metaDesc.content = description || defaultDesc;

    // Update canonical link
    let linkCanonical = document.querySelector('link[rel="canonical"]');
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.rel = 'canonical';
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.href = canonical || `${domain}${location.pathname}`;

    // Update Open Graph tags
    const updateMetaTag = (property, attrName, value) => {
      let element = document.querySelector(`meta[${attrName}="${property}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attrName, property);
        document.head.appendChild(element);
      }
      element.content = value;
    };

    updateMetaTag('og:title', 'property', title || "PAHWAJEE Meerut");
    updateMetaTag('og:description', 'property', description || defaultDesc);
    updateMetaTag('og:url', 'property', canonical || `${domain}${location.pathname}`);
    updateMetaTag('og:type', 'property', 'website');
    updateMetaTag('og:image', 'property', `${domain}/gallery/2.jpeg`); // Default share image
    updateMetaTag('twitter:card', 'name', 'summary_large_image');
    updateMetaTag('twitter:title', 'name', title || "PAHWAJEE Meerut");
    updateMetaTag('twitter:description', 'name', description || defaultDesc);

    // Inject JSON-LD Schema
    const existingScript = document.getElementById('jsonld-schema');
    if (existingScript) {
      existingScript.remove();
    }
    if (schema) {
      const script = document.createElement('script');
      script.id = 'jsonld-schema';
      script.type = 'application/ld+json';
      script.innerHTML = JSON.stringify(schema);
      document.head.appendChild(script);
    }

    return () => {
      const scriptToClean = document.getElementById('jsonld-schema');
      if (scriptToClean) {
        scriptToClean.remove();
      }
    };
  }, [title, description, schema, canonical, location.pathname]);

  return null;
}
