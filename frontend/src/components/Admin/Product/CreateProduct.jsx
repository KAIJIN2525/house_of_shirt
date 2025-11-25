import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createProduct } from "../../../redux/slices/adminProductSlice"; // Update the import path
import axios from "axios";
import { FaTimes } from "react-icons/fa"; // Import the "x" icon
import {
  fetchCategories,
  fetchTags,
} from "../../../redux/slices/categoryTagSlice";
import { toast } from "sonner";

const CreateProduct = ({ setActiveTab }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.adminProducts);
  const { categories, tags } = useSelector((state) => state.categoryTags);

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
    isPublished: true, // Default to published
    isFeatured: false, // Default to not featured
  });

  const [uploading, setUploading] = useState(false); // State for image upload

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProductData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Fetch categories and tags when the component mounts
  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchTags());
  }, [dispatch]);

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

  // handleTagClick function
  const handleTagClick = (tag) => {
    setProductData((prevData) => {
      const isTagSelected = prevData.tags.includes(tag._id); // Check if the tag ID is already selected
      const updatedTags = isTagSelected
        ? prevData.tags.filter((t) => t !== tag._id) // Remove the tag ID if already selected
        : [...prevData.tags, tag._id]; // Add the tag ID if not selected
      return {
        ...prevData,
        tags: updatedTags,
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
    dispatch(createProduct(productData))
      .unwrap()
      .then(() => {
        toast.success("Product created successfully!"); // Show success toast
        setProductData({
          // Reset form fields
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
          isPublished: true, // Reset to published
          isFeatured: false, // Reset to not featured
        });
        setActiveTab("products"); // Switch to the "Products" tab
      })
      .catch((error) => {
        console.error("Error creating product:", error);
        toast.error("Failed to create product. Please try again."); // Show error toast
      });
  };

  if (loading) return <Loader size="md" text="Loading..." />;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="max-w-5xl mx-auto p-6 shadow-md rounded-md">
      <h2 className="text-3xl font-bold mb-6">Create Product</h2>
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

        {/* Count in Stock */}
        <div className="mb-6">
          <label htmlFor="countInStock" className="block font-semibold mb-2">
            Count in Stock
          </label>
          <input
            type="number"
            name="countInStock"
            value={productData.countInStock}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md p-2"
            required
          />
        </div>

        {/* SKU */}
        <div className="mb-6">
          <label htmlFor="sku" className="block font-semibold mb-2">
            SKU{" "}
            <span className="text-gray-500 font-normal text-sm">
              (Optional - Auto-generated if left empty)
            </span>
          </label>
          <input
            type="text"
            name="sku"
            value={productData.sku}
            onChange={handleChange}
            placeholder="Leave empty to auto-generate (e.g., TW-M-001)"
            className="w-full border border-gray-300 rounded-md p-2"
          />
        </div>

        {/* Category */}
        <div className="mb-6">
          <label htmlFor="category" className="block font-semibold mb-2">
            Category
          </label>
          <select
            name="category"
            value={productData.category}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md p-2"
            required
          >
            <option value="">Select Category</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Brand */}
        <div className="mb-6">
          <label htmlFor="brand" className="block font-semibold mb-2">
            Brand
          </label>
          <input
            type="text"
            name="brand"
            value={productData.brand}
            onChange={handleChange}
            placeholder="Brand..."
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

        {/* Tags */}
        {tags.map((tag) => (
          <button
            key={tag._id}
            type="button"
            onClick={() => handleTagClick(tag)} // Pass the entire tag object
            className={`px-3 py-1 mr-2 rounded-full ${
              productData.tags.includes(tag._id) // Check if the tag ID is selected
                ? "bg-gray-800 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            {tag.name}
          </button>
        ))}

        {/* Collections */}
        <div className="mb-6">
          <label htmlFor="collections" className="block font-semibold mb-2">
            Collections
          </label>
          <input
            type="text"
            name="collections"
            value={productData.collections}
            onChange={handleChange}
            placeholder="Collections..."
            className="w-full border border-gray-300 rounded-md p-2"
            required
          />
        </div>

        {/* Material */}
        <div className="mb-6">
          <label htmlFor="material" className="block font-semibold mb-2">
            Material
          </label>
          <input
            type="text"
            name="material"
            value={productData.material}
            onChange={handleChange}
            placeholder="Material..."
            className="w-full border border-gray-300 rounded-md p-2"
            required
          />
        </div>

        {/* Gender */}
        <div className="mb-6">
          <label htmlFor="gender" className="block font-semibold mb-2">
            Gender
          </label>
          <select
            name="gender"
            value={productData.gender}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md p-2"
            required
          >
            <option value="">Select Gender</option>
            <option value="Men">Men</option>
            <option value="Women">Women</option>
            <option value="Unisex">Unisex</option>
          </select>
        </div>

        {/* Publish Status */}
        <div className="mb-6 grid grid-cols-2 gap-6">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isPublished"
              name="isPublished"
              checked={productData.isPublished}
              onChange={(e) =>
                setProductData((prev) => ({
                  ...prev,
                  isPublished: e.target.checked,
                }))
              }
              className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <label htmlFor="isPublished" className="font-semibold">
              Published{" "}
              <span className="text-sm font-normal text-gray-600">
                (Visible in store & inventory)
              </span>
            </label>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isFeatured"
              name="isFeatured"
              checked={productData.isFeatured}
              onChange={(e) =>
                setProductData((prev) => ({
                  ...prev,
                  isFeatured: e.target.checked,
                }))
              }
              className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
            />
            <label htmlFor="isFeatured" className="font-semibold">
              Featured{" "}
              <span className="text-sm font-normal text-gray-600">
                (Show in featured section)
              </span>
            </label>
          </div>
        </div>

        {/* Image Uploader */}
        <div className="mb-6">
          <label htmlFor="image" className="block font-semibold mb-2">
            Image
          </label>
          <input type="file" name="image" onChange={handleImageUpload} />
          {uploading && <Loader size="sm" text="Uploading image..." />}
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
          Create Product
        </button>
      </form>
    </div>
  );
};

export default CreateProduct;
