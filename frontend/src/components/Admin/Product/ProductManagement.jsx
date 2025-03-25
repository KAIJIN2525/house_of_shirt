import React, { useEffect } from "react";
import { FaEdit, FaStar } from "react-icons/fa";
import { LuTrash2 } from "react-icons/lu";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  deleteProduct,
  fetchAdminProducts,
} from "../../../redux/slices/adminProductSlice";

const ProductManagement = () => {
  const dispatch = useDispatch();
  const { products, loading, error } = useSelector(
    (state) => state.adminProducts
  );

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US").format(price);
  };

  useEffect(() => {
    dispatch(fetchAdminProducts());
  }, [dispatch]);

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete the product?")) {
      dispatch(deleteProduct(id));
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="mx-auto sm:p-6">
      <div className="overflow-x-auto shadow-md rounded-lg">
        <div className="min-w-full text-left text-gray-500">
          <table className="min-w-full text-left text-gray-700">
            <thead className="bg-gray-100 text-xs uppercase text-gray-700">
              <tr>
                <th className="py-6 px-4">Name</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4">Featured</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length > 0 ? (
                products.map((product) => (
                  <tr
                    key={product._id}
                    className="border-b hover:bg-gray-50 border-gray-300 cursor-pointer"
                  >
                    <td className="py-4 px-6 font-medium flex items-center gap-2 text-gray-900 whitespace-nowrap">
                      <img
                        src={product.images[0]?.url} // Use optional chaining to avoid errors
                        alt={product.images[0]?.altText || "Product Image"} // Provide a fallback alt text
                        className="size-12 rounded-full"
                      />
                      <p className="text-sm sm:text-base">{product.name}</p>
                    </td>
                    <td className="p-4">
                      ₦{formatPrice(Math.round(product.price))}
                    </td>
                    <td className="p-4">{product.sku}</td>
                    <td className="p-4">
                      {product.variants.reduce(
                        (acc, variant) => acc + variant.stock,
                        0
                      )}
                    </td>
                    <td className="p-4 ">
                      <span className="">
                        <FaStar className="size-6 " />
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="flex items-center ">
                        <Link
                          to={`/admin/products/${product._id}/edit`}
                          className="mr-2"
                        >
                          <FaEdit className="size-5 text-blue-500 hover:text-blue-600" />
                        </Link>
                        <button
                          className="cursor-pointer"
                          onClick={() => handleDelete(product._id)}
                        >
                          <LuTrash2 className="size-5 text-red-500 hover:text-red-600" />
                        </button>
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-gray-500">
                    No Products Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductManagement;
