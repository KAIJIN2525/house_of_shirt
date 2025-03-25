import React, { useEffect, useState } from "react";
import { LuLoader, LuUpload, LuX } from "react-icons/lu";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCategories,
  fetchTags,
  createCategory,
  deleteCategory,
  createTag,
  deleteTag,
  updateCategory,
  updateTag,
} from "../../../redux/slices/categoryTagSlice"; // Ensure all actions are imported
import axios from "axios";
import { FaEdit, FaTrash } from "react-icons/fa";

const CategoriesTag = () => {
  const dispatch = useDispatch();
  const { categories, tags, loading, error } = useSelector(
    (state) => state.categoryTags
  );
  const [uploading, setUploading] = useState(false); // State for image upload

  const [categoryData, setCategoryData] = useState({
    name: "",
    description: "",
    image: {
      url: "",
      altText: "",
    },
  });

  const [tagData, setTagData] = useState({
    name: "",
  });

  const [editingCategory, setEditingCategory] = useState(null);
  const [editingTag, setEditingTag] = useState(null);

  // Fetch categories and tags when the component mounts
  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchTags());
  }, [dispatch]);

  // Handle category creation
  const handleCreateCategory = (e) => {
    e.preventDefault();
    dispatch(createCategory(categoryData))
      .unwrap()
      .then((response) => {
        console.log("Category created:", response);
        setCategoryData({
          name: "",
          description: "",
          image: "", // Reset image URL
        });
      })
      .catch((error) => {
        console.error("Error creating category:", error);
      });
  };

  // Handle tag creation
  const handleCreateTag = (e) => {
    e.preventDefault();
    dispatch(createTag(tagData))
      .unwrap()
      .then(() => {
        setTagData({
          name: "",
        });
      })
      .catch((error) => {
        console.error("Error creating tag:", error);
      });
  };

  // Handle category deletion
  const handleDeleteCategory = (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      dispatch(deleteCategory(id))
        .unwrap()
        .catch((err) => {
          console.error("Failed to delete category:", err);
        });
    }
  };

  // Handle tag deletion
  const handleDeleteTag = (id) => {
    if (window.confirm("Are you sure you want to delete this tag?")) {
      dispatch(deleteTag(id))
        .unwrap()
        .catch((err) => {
          console.error("Failed to delete tag:", err);
        });
    }
  };

  // Handle image upload
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

      // Set only one image URL
      setCategoryData((prevData) => ({
        ...prevData,
        image: {
          url: data.imageUrl,
          altText: data.altText || "Category Image",
        },
      }));
      setUploading(false);
    } catch (error) {
      console.error("Error uploading image:", error);
      setUploading(false);
    }
  };

  // Handle category edit
  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setCategoryData({
      name: category.name,
      description: category.description,
      image: category.image,
    });
  };

  // Handle category update
  const handleUpdateCategory = (e) => {
    e.preventDefault();
    dispatch(
      updateCategory({ id: editingCategory._id, updatedData: categoryData })
    )
      .unwrap()
      .then(() => {
        setEditingCategory(null);
        setCategoryData({
          name: "",
          description: "",
          image: {},
        });
      })
      .catch((error) => {
        console.error("Error updating category:", error);
      });
  };

  // Handle tag edit
  const handleEditTag = (tag) => {
    setEditingTag(tag);
    setTagData({
      name: tag.name,
    });
  };

  // Handle tag update
  const handleUpdateTag = (e) => {
    e.preventDefault();
    dispatch(updateTag({ id: editingTag._id, updatedData: tagData }))
      .unwrap()
      .then(() => {
        setEditingTag(null);
        setTagData({
          name: "",
        });
      })
      .catch((error) => {
        console.error("Error updating tag:", error);
      });
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-8">
        Category and Tag Manager
      </h1>

      {/* Display loading and error messages */}
      {loading && <p className="text-center text-blue-600">Loading...</p>}
      {error && <p className="text-center text-red-600">Error: {error}</p>}

      {/* Category Section */}
      <section className="mb-8 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Categories</h2>
        <form
          onSubmit={
            editingCategory ? handleUpdateCategory : handleCreateCategory
          }
          className="space-y-4"
        >
          <input
            type="text"
            placeholder="Category Name"
            value={categoryData.name}
            onChange={(e) =>
              setCategoryData({ ...categoryData, name: e.target.value })
            }
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          />
          <input
            type="text"
            placeholder="Description"
            value={categoryData.description}
            onChange={(e) =>
              setCategoryData({ ...categoryData, description: e.target.value })
            }
            className="w-full p-2 border border-gray-300 rounded-md"
          />

          {/* Image Uploader */}
          <div className="mb-6">
            <label htmlFor="image" className="block font-semibold mb-2">
              Image
            </label>
            <input
              type="file"
              name="image"
              onChange={handleImageUpload}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
            {uploading && (
              <p className="text-sm text-gray-600 mt-2">Uploading image...</p>
            )}
            {categoryData.image?.url && (
              <div className="mt-4 relative">
                <img
                  src={categoryData.image.url}
                  alt={categoryData.image.altText || "Category Image"}
                  className="size-20 object-cover rounded-md shadow-md "
                />
                <button
                  type="button"
                  onClick={() =>
                    setCategoryData({
                      ...categoryData,
                      image: { url: "", altText: "" },
                    })
                  }
                  className="absolute top-2 right-2"
                >
                  <LuX className="size-6 text-gray-700 cursor-pointer absolute top-2 right-2" />
                </button>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600"
          >
            {editingCategory ? "Update Category" : "Create Category"}
          </button>
        </form>

        <ul className="mt-6 space-y-2">
          {categories.map((category) => (
            <li
              key={category._id}
              className="flex justify-between items-center p-3 bg-gray-50 rounded-md"
            >
              <div>
                <strong className="text-lg">{category.name}</strong>
                <p className="text-sm text-gray-600">{category.description}</p>
                {category.image?.url && ( // Access image.url
                  <img
                    src={category.image.url}
                    alt={category.image.altText || "Category Image"}
                    className="size-20 object-cover rounded-md shadow-md mt-2"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/150"; // Fallback image
                    }}
                  />
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditCategory(category)}
                  className="bg-yellow-500 text-white p-1 px-3 rounded-md hover:bg-yellow-600"
                >
                  <FaEdit className="size-4" />
                </button>
                <button
                  onClick={() => handleDeleteCategory(category._id)}
                  className="bg-red-500 text-white p-1 px-3 rounded-md hover:bg-red-600"
                >
                  <FaTrash />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Tag Section */}
      <section className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Tags</h2>
        <form onSubmit={handleCreateTag} className="space-y-4">
          <input
            type="text"
            placeholder="Tag Name"
            value={tagData.name}
            onChange={(e) => setTagData({ ...tagData, name: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          />
          <button
            type="submit"
            className="w-full bg-gray-800 text-white p-2 rounded-md hover:bg-gray-900"
          >
            Create Tag
          </button>
        </form>

        <div className="flex flex-wrap mt-2 gap-4">
          {tags.map((tag) => (
            <div key={tag._id} className="flex items-center gap-2">
              <div className="px-3 py-2 rounded-full bg-gray-300 flex items-center gap-2">
                <p>{tag.name}</p>
                <LuX
                  className="size-4 cursor-pointer"
                  onClick={() => handleDeleteTag(tag._id)}
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default CategoriesTag;
