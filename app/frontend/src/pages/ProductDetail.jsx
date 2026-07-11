import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../lib/api';

export default function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    if (slug) api.get(`/products/${slug}`).then(setProduct);
  }, [slug]);

  if (!product) return <div className="section-y container-x">Loading...</div>;

  return (
    <div className="section-y container-x noise-bg">
      <div className="grid md:grid-cols-2 gap-8">
        <img src={product.image} alt={product.name} className="w-full rounded-lg" />
        <div>
          <h1 className="text-3xl font-serif font-bold mb-4">{product.name}</h1>
          <p className="text-secondary text-xl mb-4">{product.price}</p>
          <p className="mb-6">{product.description}</p>
          <a href="tel:+916396339806" className="btn-primary">Call to Order</a>
        </div>
      </div>
    </div>
  );
}