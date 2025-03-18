import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Slider from "rc-slider";
import "rc-slider/assets/index.css"; // Import the default styles for rc-slider

const FilterSidebar = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    category: "",
    gender: "",
    color: "",
    size: [],
    material: [],
    brand: [],
    minPrice: 0,
    maxPrice: 100,
  });

  const [priceRange, setPriceRange] = useState([0, 200000]);

  const categories = ["Shirts", "Pants", "Shoes", "Accessories"];
  const genders = ["Men", "Women"];
  const sizes = ["XS", "S", "M", "L", "XL", "XXL"];
  const materials = [
    "Cotton",
    "Polyester",
    "Denim",
    "Leather",
    "Suede",
    "Silk",
    "Linen",
    "Viscose",
    "Fleece",
    "Wool",
  ];
  const brands = [
    "Zara",
    "Urban Threads",
    "Modern Fit",
    "Street Style",
    "Beach Breeze",
    "Fashionista",
    "ChicStyle",
  ];

  // Helper function to format numbers with commas
  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US").format(price);
  };

  useEffect(() => {
    const params = Object.fromEntries([...searchParams]);

    setFilters({
      category: params.category || "",
      gender: params.gender || "",
      color: params.color || "",
      size: params.size ? params.size.split(",") : [],
      material: params.material ? params.material.split(",") : [],
      brand: params.brand ? params.brand.split(",") : [],
      minPrice: Number(params.minPrice) || 0,
      maxPrice: Number(params.maxPrice) || 200000,
    });
    setPriceRange([
      Number(params.minPrice) || 0,
      Number(params.maxPrice) || 200000,
    ]);
  }, [searchParams]);

  const handleFilterChange = (e) => {
    const { name, value, checked, type } = e.target;
    let newFilters = { ...filters };

    if (type === "checkbox") {
      if (checked) {
        newFilters[name] = [...(newFilters[name] || []), value];
      } else {
        newFilters[name] = newFilters[name].filter((item) => item !== value);
      }
    } else {
      newFilters[name] = value;
    }
    setFilters(newFilters);
    updateURLParams(newFilters);
  };

  const handlePriceChange = (value) => {
    setPriceRange(value);
    const newFilters = { ...filters, minPrice: value[0], maxPrice: value[1] };
    setFilters(newFilters);
    updateURLParams(newFilters);
  };

  const updateURLParams = (newFilters) => {
    const params = new URLSearchParams();
    Object.keys(newFilters).forEach((key) => {
      if (Array.isArray(newFilters[key]) && newFilters[key].length > 0) {
        params.append(key, newFilters[key].join(","));
      } else if (newFilters[key]) {
        params.append(key, newFilters[key]);
      }
    });
    setSearchParams(params);
    navigate(`?${params.toString()}`);
  };

  return (
    <div className="p-4 overflow-y-auto">
      <h3 className="text-xl font-medium text-gray-800 mb-4">Filter</h3>

      {/* Category Filter */}
      <div className="mb-6">
        <label className="block text-gray-600 font-medium mb-2">Category</label>
        {categories.map((category, index) => (
          <div key={index} className="flex items-center mb-2">
            <input
              type="radio"
              name="category"
              value={category}
              onChange={handleFilterChange}
              checked={filters.category === category}
              className="size-4 text-blue-500 focus:ring-blue-400 border-gray-300"
            />
            <span className="ml-2 text-gray-700">{category}</span>
          </div>
        ))}
      </div>

      {/* Gender Filter */}
      <div className="mb-4">
        <label className="block text-gray-600 font-medium mb-2">Gender</label>
        {genders.map((gender, index) => (
          <div key={index} className="flex items-center mb-2">
            <input
              type="radio"
              name="gender"
              value={gender}
              onChange={handleFilterChange}
              checked={filters.gender === gender}
              className="size-4 text-blue-500 focus:ring-blue-400 border-gray-300"
            />
            <span className="ml-2 text-gray-700">{gender}</span>
          </div>
        ))}
      </div>

      {/* Size Filter */}
      <div className="mb-6">
        <label htmlFor="size" className="block text-gray-600 font-medium mb-2">
          Size
        </label>
        {sizes.map((size) => (
          <div key={size} className="flex items-center mb-2">
            <input
              type="checkbox"
              name="size"
              value={size}
              onChange={handleFilterChange}
              checked={filters.size.includes(size)}
              className="size-4 text-blue-500 focus:ring-blue-400 border-gray-300"
            />
            <span className="ml-2 text-gray-700">{size}</span>
          </div>
        ))}
      </div>

      {/* Material Filter */}
      <div className="mb-6">
        <label
          htmlFor="material"
          className="block text-gray-600 font-medium mb-2"
        >
          Material
        </label>
        {materials.map((material) => (
          <div key={material} className="flex items-center mb-2">
            <input
              type="checkbox"
              name="material"
              value={material}
              onChange={handleFilterChange}
              checked={filters.material.includes(material)}
              className="size-4 text-blue-500 focus:ring-blue-400 border-gray-300"
            />
            <span className="ml-2 text-gray-700">{material}</span>
          </div>
        ))}
      </div>

      {/* Brand Filter */}
      <div className="mb-6">
        <label htmlFor="brand" className="block text-gray-600 font-medium mb-2">
          Brand
        </label>
        {brands.map((brand) => (
          <div key={brand} className="flex items-center mb-2">
            <input
              type="checkbox"
              name="brand"
              value={brand}
              onChange={handleFilterChange}
              checked={filters.brand.includes(brand)}
              className="size-4 text-blue-500 focus:ring-blue-400 border-gray-300"
            />
            <span className="ml-2 text-gray-700">{brand}</span>
          </div>
        ))}
      </div>

      {/* Price Range Filter */}
      <div className="mb-8">
        <label className="block text-gray-600 font-medium mb-2">
          Price Range
        </label>
        <Slider
          range
          min={0}
          max={200000}
          value={priceRange}
          onChange={handlePriceChange}
          className="mb-4 text-gray-800"
        />
        <div className="flex justify-between mt-2">
          <span>₦{formatPrice(priceRange[0])}</span>
          <span>₦{formatPrice(priceRange[1])}</span>
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;
