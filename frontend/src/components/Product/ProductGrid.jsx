import React from "react";
import { Link } from "react-router-dom";
import Loader from "../Common/Loader";

const ProductGrid = ({ products, loading, error }) => {
  if (loading) {
    return (
      <Loader size="lg" text="Loading products..." className="min-h-[400px]" />
    );
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US").format(price);
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 lg:gap-6">
      {products.map((product, index) => (
        <Link to={`/product/${product._id}`} key={index} className="block">
          <div className="bg-white p-2 sm:p-4 rounded">
            <div className="w-full h-60 lg:h-80 mb-4">
              <img
                src={product.images[0].url}
                alt={product.images[0].altText || product.name}
                className="w-full h-full object-cover rounded"
              />
            </div>
            <h3 className="text-sm mb-2">{product.name}</h3>
            <p className="text-gray-700 font-medium text-base tracking-tighter">
              ₦{formatPrice(product.price)}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default ProductGrid;
