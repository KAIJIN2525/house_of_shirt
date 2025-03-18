import React, { useState, useRef, useEffect } from 'react';
import { LuAArrowDown, LuAArrowUp } from "react-icons/lu";

const TagsDropdown = ({ tags, newProduct, setNewProduct }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleTagSelect = (selectedTagId) => {
    const isTagSelected = newProduct.tag?.includes(selectedTagId);

    if (isTagSelected) {
      // Remove tag
      setNewProduct({
        ...newProduct,
        tag: newProduct.tag.filter((tagId) => tagId !== selectedTagId),
      });
    } else {
      // Add tag
      setNewProduct({
        ...newProduct,
        tag: [...(newProduct.tag || []), selectedTagId],
      });
    }
  };

  const closeDropdown = (e) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
      setDropdownOpen(false);
    }
  };

  useEffect(() => {
    if (dropdownOpen) {
      document.addEventListener('click', closeDropdown);
    } else {
      document.removeEventListener('click', closeDropdown);
    }
    return () => {
      document.removeEventListener('click', closeDropdown);
    };
  }, [dropdownOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Dropdown Toggle */}
      <div
        className="flex items-center justify-between cursor-pointer bg-gray-200 px-4 py-2 rounded-lg"
        onClick={() => setDropdownOpen((prev) => !prev)}
        tabIndex={0}
      >
        <p className="text-gray-700">Select Tags</p>
        {dropdownOpen ? <LuAArrowUp /> : <LuAArrowDown />}
      </div>

      {/* Dropdown List */}
      {dropdownOpen && (
        <div className=" mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
          <div className="p-4">
            {/* Selected Tags */}
            {newProduct.tag?.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-gray-600">Selected Tags:</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags
                    .filter((tag) => newProduct.tag.includes(tag._id))
                    .map((tag) => (
                      <span
                        key={tag._id}
                        className="px-3 py-1 bg-gray-800 text-white rounded-full text-sm"
                      >
                        {tag.name}
                      </span>
                    ))}
                </div>
              </div>
            )}

            {/* Available Tags */}
            <div className="flex flex-wrap gap-4">
              {tags.map((tag) => {
                const isSelected = newProduct.tag?.includes(tag._id); // Check if the tag is selected
                return (
                  <div
                    key={tag._id}
                    className={`px-3 py-2 rounded-full cursor-pointer ${
                      isSelected
                        ? "bg-gray-800 text-white"
                        : "bg-gray-300 text-gray-800"
                    } hover:bg-gray-500 hover:text-white transition`}
                    onClick={() => handleTagSelect(tag._id)}
                  >
                    {tag.name}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TagsDropdown;