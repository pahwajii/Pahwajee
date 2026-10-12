import { useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { SeoCollectorContext } from '../context/PageData';
import { metadata, serializeJson } from '../lib/seo';

export default function SEO(props) {
  const { pathname } = useLocation();
  const collector = useContext(SeoCollectorContext);
  const meta = metadata({...props, path: pathname});
  if (collector) collector.current = meta;
  const serialized = serializeJson(meta);
  useEffect(() => {
    const data = JSON.parse(serialized);
    document.title = data.title;
    function update(key, value, attr = 'name') {
      let tag = document.head.querySelector(`meta[${attr}="${key}"]`);
      if (!tag) { tag = document.createElement('meta'); tag.setAttribute(attr, key); document.head.appendChild(tag); }
      tag.content = value;
    }
    update('description', data.description);
    update('robots', data.robots);
    for (const [key, value] of Object.entries({title: data.title, description: data.description, url: data.url, image: data.image, 'image:alt': data.title, type: data.type || 'website', site_name: 'PAHWA JEE', locale: 'en_IN'})) update(`og:${key}`, value, 'property');
    for (const [key, value] of Object.entries({card: 'summary_large_image', title: data.title, description: data.description, image: data.image})) update(`twitter:${key}`, value);
    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
    canonical.href = data.url;
    document.getElementById('jsonld-schema')?.remove();
    if (data.schema) {
      const script = document.createElement('script');
      script.id = 'jsonld-schema'; script.type = 'application/ld+json'; script.textContent = serializeJson(data.schema);
      document.head.appendChild(script);
    }
  }, [serialized]);
  return null;
}
