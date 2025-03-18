import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { removeFromFavorites } from "../redux/slices/favoritesSlice";
import { addToCart } from "../redux/slices/cartSlice";
import { FaHeart, FaTrash, FaShoppingCart } from "react-icons/fa"; // Icons for actions
import { toast } from "sonner"; // For notifications

const Favorites = () => {
  const dispatch = useDispatch();
  const favorites = useSelector((state) => state.favorites.items);
  const { user, guestId } = useSelector((state) => state.auth);

  // State to manage selected size and color for each product
  const [selectedOptions, setSelectedOptions] = useState({});

  // Handle removing a product from favorites
  const handleRemoveFromFavorites = (productId) => {
    dispatch(removeFromFavorites(productId));
    toast.success("Removed from favorites", { duration: 1000 });
  };

  // Handle adding a product to the cart
  const handleAddToCart = (product) => {
    const { size, color } = selectedOptions[product._id] || {};

    // Validate size and color selection
    if (!size || !color) {
      toast.error("Please select a size and color before adding to cart.", {
        duration: 1000,
      });
      return;
    }

    const productToAdd = {
      productId: product._id, // Use _id for consistency with backend
      quantity: 1, // Default quantity is 1
      size,
      color,
      guestId,
      userId: user?._id,
    };

    dispatch(addToCart(productToAdd));
    toast.success("Added to cart", { duration: 1000 });
  };

  // Handle changes in size and color selection
  const handleOptionChange = (productId, type, value) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [type]: value,
      },
    }));
  };

  // Helper function to extract unique sizes and colors from variants
  const extractOptionsFromVariants = (variants) => {
    const sizes = [...new Set(variants.map((v) => v.size))];
    const colors = [...new Set(variants.map((v) => v.color))];
    return { sizes, colors };
  };

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-black mb-8">Your Favorites</h1>
        {favorites.length === 0 ? (
          <p className="text-gray-600">No favorites added yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-6">
            {favorites.map((product) => {
              // Extract sizes and colors from variants
              const { sizes, colors } = extractOptionsFromVariants(
                product.variants
              );

              return (
                <div
                  key={product._id}
                  className="bg-white rounded-lg shadow-lg overflow-hidden"
                >
                  {/* Product Image */}
                  <div className="relative h-52 sm:h-64">
                    <img
                      src={product.images[0]?.url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    {/* Favorite Icon */}
                    <div className="absolute top-4 right-4">
                      <FaHeart className="text-gray-800 text-2xl" />
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="p-2 sm:p-6">
                    <h2 className="text-sm sm:text-xl font-semibold text-black mb-2">
                      {product.name}
                    </h2>
                    <p className="text-base sm:text-lg font-bold text-black mb-2 sm:mb-4">
                      ₦{product.price}
                    </p>

                    {/* Size Selection */}
                    <div className="mb-2 sm:mb-4">
                      <p className="text-gray-700">Size:</p>
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {sizes.map((size) => (
                          <button
                            key={size}
                            onClick={() =>
                              handleOptionChange(product._id, "size", size)
                            }
                            className={`px-2 sm:px-4 sm:py-2 rounded border cursor-pointer ${
                              selectedOptions[product._id]?.size === size
                                ? "bg-black text-white"
                                : "bg-gray-100"
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Color Selection */}
                    <div className="mb-2 sm:mb-4">
                      <p className="text-gray-700">Color:</p>
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {colors.map((color) => (
                          <button
                            key={color}
                            onClick={() =>
                              handleOptionChange(product._id, "color", color)
                            }
                            className={`px-1.5 sm:px-4 py-2 rounded border cursor-pointer ${
                              selectedOptions[product._id]?.color === color
                                ? "bg-black text-white"
                                : "bg-gray-100"
                            }`}
                          >
                            {color}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-2 justify-between sm:items-center">
                      <button
                        onClick={() => handleRemoveFromFavorites(product._id)}
                        className="flex items-center text-gray-600 hover:text-red-500 transition-colors"
                      >
                        <FaTrash className="mr-2" />
                        Remove
                      </button>
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="flex items-center bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                      >
                        <FaShoppingCart className="mr-2" />
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;
