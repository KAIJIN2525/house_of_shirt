import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import ProductGrid from "./ProductGrid";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProductDetails,
  fetchSimilarProducts,
} from "../../redux/slices/productSlice";
import { addToCart } from "../../redux/slices/cartSlice";
import {
  addToFavorites,
  removeFromFavorites,
} from "../../redux/slices/favoritesSlice"; // Import favorites actions
import { FaHeart, FaRegHeart } from "react-icons/fa"; // Import heart icons
import { fetchTags } from "../../redux/slices/categoryTagSlice";

// Map color names to valid CSS color values
const colorMap = {
  black: "#000000",
  gray: "#808080",
  white: "#FFFFFF",
  red: "#FF0000",
  blue: "#0000FF",
  navy: "#000080",
  burgundy: "#800020",
  "navy blue": "#000080",
  "tropical print": "#FFD700", // Placeholder for tropical print
  "navy palms": "#000080", // Same as navy blue
  // Add more mappings as needed
};

const ProductDetails = ({ productId }) => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { selectedProduct, loading, error, similarProducts } = useSelector(
    (state) => state.products
  );
  const { user, guestId } = useSelector((state) => state.auth);
  const favorites = useSelector((state) => state.favorites.items); // Get favorites from Redux store
  const tags = useSelector((state) => state.categoryTags.tags); // Get tags from Redux store
  const [tagNames, setTagNames] = useState([]);
  const [mainImage, setMainImage] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false); // Track if product is being added to cart

  const productFetchId = productId || id;

  // Fetch tags when the component mounts
  useEffect(() => {
    dispatch(fetchTags());
  }, [dispatch]);

  // Map tag IDs to tag names
  useEffect(() => {
    if (selectedProduct?.tags && tags.length > 0) {
      const names = selectedProduct.tags.map((tagId) => {
        const tag = tags.find((t) => t._id === tagId);
        return tag ? tag.name : "Unknown Tag";
      });
      setTagNames(names);
    }
  }, [selectedProduct, tags]);

  // Check if the current product is in favorites
  const isFavorite = favorites.some((item) => item._id === productFetchId);

  // Toggle favorite status
  const toggleFavorite = () => {
    if (isFavorite) {
      dispatch(removeFromFavorites(productFetchId)); // Remove the product from favorites
      toast.success("Removed from favorites", { duration: 1000 });
    } else {
      dispatch(addToFavorites(selectedProduct)); // Add the product to favorites
      toast.success("Added to favorites", { duration: 1000 });
    }
  };

  useEffect(() => {
    if (productFetchId) {
      dispatch(fetchProductDetails(productFetchId));
      dispatch(fetchSimilarProducts({ id: productFetchId }));
    }
  }, [dispatch, productFetchId]);

  useEffect(() => {
    if (selectedProduct?.images?.length > 0) {
      setMainImage(selectedProduct.images[0].url);
    }
  }, [selectedProduct]);

  // Extract unique sizes and colors from variants
  const sizes = [...new Set(selectedProduct?.variants?.map((v) => v.size))];
  const colors = [...new Set(selectedProduct?.variants?.map((v) => v.color))];

  // Check if the selected combination is in stock
  const isInStock = (size, color) => {
    if (!selectedProduct?.variants || !size || !color) return true; // Return true if no size or color is selected
    const variant = selectedProduct.variants.find(
      (v) => v.size === size && v.color === color
    );
    return variant ? variant.stock > 0 : false;
  };

  // Get stock status message
  const getStockStatusMessage = () => {
    if (selectedSize && selectedColor) {
      return isInStock(selectedSize, selectedColor)
        ? "In Stock"
        : "Out of Stock";
    }
    return null;
  };

  const handleQuantityChange = (action) => {
    if (action === "plus") setQuantity((prev) => prev + 1);
    if (action === "minus" && quantity > 1) setQuantity((prev) => prev - 1);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US').format(price);
  };


  const handleAddToCart = async () => {
    if (!selectedColor || !selectedSize) {
      toast.error("Please select a size and color before adding to cart.", {
        duration: 1000,
      });
      return;
    }

    // Check if the combination is out of stock
    if (!isInStock(selectedSize, selectedColor)) {
      toast.error("This combination is out of stock.", {
        duration: 1000,
      });
      return;
    }

    // Set "Adding..." state
    setIsAddingToCart(true);

    try {
      await dispatch(
        addToCart({
          productId: productFetchId,
          quantity,
          size: selectedSize,
          color: selectedColor,
          guestId,
          userId: user?._id,
        })
      );
      toast.success("Product added to cart successfully.", {
        duration: 1000,
      });
    } catch (error) {
      toast.error("Failed to add product to cart.", {
        duration: 1000,
      });
    } finally {
      setIsAddingToCart(false); // Reset "Adding..." state
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  if (!selectedProduct) {
    return <p>Product not found.</p>;
  }

  return (
    <div className="sm:p-6 p-4">
      {selectedProduct && (
        <div className="max-w-7xl sm:max-w-6xl mx-auto sm:p-8 bg-white rounded-lg">
          <div className="flex flex-col md:flex-row">
            {/* Left Thumbnail */}
            <div className="hidden md:flex flex-col space-y-4 mr-6">
              {selectedProduct.images.map((image, index) => (
                <img
                  key={index}
                  src={image.url}
                  alt={image.altText || `Thumbnail ${index}`}
                  className={`size-20 object-cover rounded-lg cursor-pointer border ${
                    mainImage === image.url ? "border-black" : "border-gray-300"
                  }`}
                  onClick={() => setMainImage(image.url)}
                />
              ))}
            </div>
            <div className="md:w-1/2">
              <div className="mb-4">
                <img
                  src={mainImage}
                  alt="Main Product"
                  className="w-full h-auto rounded-lg"
                />
              </div>
            </div>
            {/* Mobile Thumbnail */}
            <div className="flex md:hidden overflow-x-scroll hide-scrollbar space-x-4 mb-4">
              {selectedProduct.images.map((image, index) => (
                <img
                  key={index}
                  src={image.url}
                  alt={image.altText || `Thumbnail ${index}`}
                  className={`size-20 object-cover rounded-lg cursor-pointer border ${
                    mainImage === image.url ? "border-black" : "border-gray-300"
                  }`}
                  onClick={() => setMainImage(image.url)}
                />
              ))}
            </div>

            {/* Right Side */}
            <div className="md:w-1/2 md:ml-10">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl md:text-3xl font-semibold mb-2">
                  {selectedProduct.name}
                </h1>
              </div>

              <div className="flex gap-2">
                <p className="text-lg text-gray-600 mb-1 line-through">
                  {selectedProduct.originalPrice &&
                    `${selectedProduct.originalPrice}`}
                </p>
                <p className="text-xl text-gray-500 mb-2">
                  ₦{formatPrice(selectedProduct.price)}
                </p>
              </div>

              <p className="text-gray-600 mb-4">
                {selectedProduct.description}
              </p>

              <div className="mb-4">
                <p className="text-gray-700">Color:</p>
                <div className="flex gap-2 mt-2">
                  {colors.map((color) => {
                    const cssColor = colorMap[color.toLowerCase()] || color;
                    return (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`size-8 rounded-full border cursor-pointer ${
                          selectedColor === color
                            ? "border-black border-4"
                            : "border-gray-300"
                        }`}
                        style={{
                          backgroundColor: cssColor,
                          filter: "brightness(0.5)",
                        }}
                      ></button>
                    );
                  })}
                </div>
              </div>

              <div className="mb-4">
                <p className="text-gray-700">Size:</p>
                <div className="flex gap-2 mt-2">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 rounded border cursor-pointer ${
                        selectedSize === size ? "bg-black text-white" : ""
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                {/* Stock Status Message */}
                {selectedSize && selectedColor && (
                  <p
                    className={`mt-2 text-sm ${
                      isInStock(selectedSize, selectedColor)
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {getStockStatusMessage()}
                  </p>
                )}
              </div>

              <div className="mb-6">
                <p className="text-gray-700">Quantity:</p>
                <div className="flex items-center space-x-4 mt-2">
                  <button
                    onClick={() => handleQuantityChange("minus")}
                    className="px-2 py-1 bg-gray-200 rounded text-lg cursor-pointer"
                  >
                    -
                  </button>
                  <span className="text-lg">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange("plus")}
                    className="px-2 py-1 bg-gray-200 rounded text-lg cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleAddToCart}
                  disabled={
                    !isInStock(selectedSize, selectedColor) || isAddingToCart
                  }
                  className={`bg-black text-white py-2 px-6 rounded w-full mb-4 
                  ${
                    !isInStock(selectedSize, selectedColor) || isAddingToCart
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-gray-900"
                  }`}
                >
                  {isAddingToCart
                    ? "Adding..."
                    : !selectedSize || !selectedColor
                    ? "Add to Cart"
                    : !isInStock(selectedSize, selectedColor)
                    ? "Out of Stock"
                    : "Add to Cart"}
                </button>

                {/* Favorite Button */}
                <button
                  onClick={toggleFavorite}
                  className="text-gray-500 hover:text-gray-600 focus:outline-none -mt-5"
                >
                  {isFavorite ? (
                    <FaHeart size={24} /> // Solid heart for favorited
                  ) : (
                    <FaRegHeart fill="black" size={24} /> // Outline heart for not favorited
                  )}
                </button>
              </div>

              <div className="mt-10 text-gray-700">
                <h3 className="text-xl font-bold mb-4">Characteristics:</h3>
                <table className="w-full text-left text-sm text-gray-600">
                  <tbody>
                    <tr>
                      <td className="font-semibold">Brand:</td>
                      <td>{selectedProduct.brand}</td>
                    </tr>
                    <tr>
                      <td className="font-semibold">Material:</td>
                      <td>{selectedProduct.material}</td>
                    </tr>
                    <tr>
                      <td className="font-semibold">Tags:</td>
                      <td>{tagNames.join(", ")}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="mt-20">
            <h2 className="text-2xl text-center font-medium mb-4">
              You May Also Like
            </h2>
            <ProductGrid
              products={similarProducts}
              loading={loading}
              error={error}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
