import React from 'react';

const ProductCard = ({ product }) => {
  if (!product) return null;
  
  return (
    <div className="product-card">
      <img src={product.image || 'https://via.placeholder.com/150'} alt={product.name} />
      <h3>{product.name}</h3>
      <p>{product.description}</p>
      <div className="product-meta">
        <span className="price">${product.price}</span>
        <button className="add-to-cart">Add to Cart</button>
      </div>
    </div>
  );
};

export default ProductCard;
