import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  fetchProductDetails,
  updateProduct,
} from "../../redux/slices/productSlice";
import axios from "axios";
import { FaTimes } from "react-icons/fa"; // Import the "x" icon

const EditProduct = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { selectedProduct, loading, error } = useSelector(
    (state) => state.products
  );

  const [productData, setProductData] = useState({
    name: "",
    description: "",
    price: 0,
    countInStock: 0,
    sku: "",
    category: "",
    brand: "",
    variants: [],
    tags: [],
    collections: "",
    material: "",
    gender: "",
    images: [],
  });

  const [uploading, setUploading] = useState(false); // state for image upload

  useEffect(() => {
    if (id) {
      dispatch(fetchProductDetails(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (selectedProduct) {
      setProductData({
        ...selectedProduct,
        variants: selectedProduct.variants || [],
      });
    }
  }, [selectedProduct]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProductData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const addVariant = () => {
    setProductData((prevData) => ({
      ...prevData,
      variants: [...prevData.variants, { size: "", color: "", stock: 0 }],
    }));
  };

  const removeVariant = (index) => {
    setProductData((prevData) => {
      const updatedVariants = prevData.variants.filter((_, i) => i !== index); // Remove the variant at the specified index
      return {
        ...prevData,
        variants: updatedVariants,
      };
    });
  };

  const updateVariant = (index, field, value) => {
    setProductData((prevData) => {
      // Create a deep copy of the variants array and its objects
      const updatedVariants = prevData.variants.map((variant) => ({
        ...variant, // Spread operator creates a new object for each variant
      }));

      // Update the specific variant's field
      updatedVariants[index][field] = value;

      // Return the updated state
      return {
        ...prevData,
        variants: updatedVariants,
      };
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("image", file);

    try {
      setUploading(true);
      const { data } = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Ensure altText is included in the image object
      setProductData((prevData) => ({
        ...prevData,
        images: [
          ...prevData.images,
          { url: data.imageUrl, altText: data.altText || "Product Image" }, // Default altText if not provided
        ],
      }));
      setUploading(false);
    } catch (error) {
      console.error("Error uploading image:", error);
      setUploading(false);
    }
  };

  // Function to delete an image
  const deleteImage = (index) => {
    setProductData((prevData) => {
      const updatedImages = prevData.images.filter((_, i) => i !== index); // Remove the image at the specified index
      return {
        ...prevData,
        images: updatedImages,
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(updateProduct({ id, productData }));
    navigate("/admin/products");
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="max-w-5xl mx-auto p-6 shadow-md rounded-md">
      <h2 className="text-3xl font-bold mb-6">Edit Product</h2>
      <form onSubmit={handleSubmit}>
        {/* Name */}
        <div className="mb-6">
          <label htmlFor="name" className="block font-semibold mb-2">
            Product Name
          </label>
          <input
            type="text"
            name="name"
            value={productData.name}
            onChange={handleChange}
            placeholder="Product Name"
            className="w-full border border-gray-300 rounded-md p-2"
            required
          />
        </div>

        {/* Description */}
        <div className="mb-6">
          <label htmlFor="description" className="block font-semibold mb-2">
            Product Description
          </label>
          <textarea
            name="description"
            value={productData.description}
            onChange={handleChange}
            placeholder="Product Description"
            className="w-full border border-gray-300 rounded-md p-2"
            rows={4}
            required
          />
        </div>

        {/* Price */}
        <div className="mb-6">
          <label htmlFor="price" className="block font-semibold mb-2">
            Price
          </label>
          <input
            type="number"
            name="price"
            value={productData.price}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md p-2"
            required
          />
        </div>

        {/* SKU */}
        <div className="mb-6">
          <label htmlFor="sku" className="block font-semibold mb-2">
            SKU
          </label>
          <input
            type="text"
            name="sku"
            value={productData.sku}
            onChange={handleChange}
            placeholder="SKU..."
            className="w-full border border-gray-300 rounded-md p-2"
            required
          />
        </div>

        {/* Variants */}
        <div className="mb-6">
          <label className="block font-semibold mb-2">Variants</label>
          {productData.variants.map((variant, index) => (
            <div
              key={index}
              className="mb-4 p-4 border border-gray-300 rounded-md"
            >
              <div className="grid grid-cols-3 gap-4">
                {/* Size */}
                <div>
                  <label
                    htmlFor={`size-${index}`}
                    className="block font-semibold mb-2"
                  >
                    Size
                  </label>
                  <input
                    type="text"
                    value={variant.size}
                    onChange={(e) =>
                      updateVariant(index, "size", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-md p-2"
                    required
                  />
                </div>

                {/* Color */}
                <div>
                  <label
                    htmlFor={`color-${index}`}
                    className="block font-semibold mb-2"
                  >
                    Color
                  </label>
                  <input
                    type="text"
                    value={variant.color}
                    onChange={(e) =>
                      updateVariant(index, "color", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-md p-2"
                    required
                  />
                </div>

                {/* Stock */}
                <div>
                  <label
                    htmlFor={`stock-${index}`}
                    className="block font-semibold mb-2"
                  >
                    Stock
                  </label>
                  <input
                    type="number"
                    value={variant.stock}
                    onChange={(e) =>
                      updateVariant(index, "stock", Number(e.target.value))
                    } // Convert to number
                    className="w-full border border-gray-300 rounded-md p-2"
                    required
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeVariant(index)}
                className="mt-2 text-red-500 hover:text-red-600"
              >
                Remove Variant
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addVariant}
            className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            Add Variant
          </button>
        </div>

        {/* Image Uploader */}
        <div className="mb-6">
          <label htmlFor="image" className="block font-semibold mb-2">
            Image
          </label>
          <input type="file" name="image" onChange={handleImageUpload} />
          {uploading && <p>Uploading image...</p>}
          <div className="flex gap-4 mt-4">
            {productData.images.map((image, index) => (
              <div key={index} className="relative">
                <img
                  src={image.url}
                  alt={image.altText || "Product Image"}
                  className="size-20 object-cover rounded-md shadow-md"
                />
                {/* Delete Button */}
                <button
                  type="button"
                  onClick={() => deleteImage(index)}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <FaTimes className="size-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors cursor-pointer"
        >
          Update Product
        </button>
      </form>
    </div>
  );
};

export default EditProduct;
