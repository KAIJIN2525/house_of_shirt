import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Common/Loader";
import { fetchAllOrders } from "../redux/slices/orderSlice";

const MyOrders = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { orders, loading, error } = useSelector((state) => state.orders);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchAllOrders());
  }, [dispatch]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US").format(price);
  };

  const handleRowClick = (orderId) => {
    navigate(`/order/${orderId}`);
  };

  if (loading)
    return (
      <Loader size="lg" text="Loading orders..." className="min-h-screen" />
    );
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-bold mb-6">My Orders</h2>
      <div className="relative shadow-md sm:rounded-lg overflow-x-auto">
        <table className="w-full text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-100">
            <tr>
              <th className="py-2 px-4 sm:py-3">Image</th>
              <th className="py-2 px-4 sm:py-3">Order Number</th>
              <th className="py-2 px-4 sm:py-3">Created</th>
              <th className="py-2 px-4 sm:py-3">Delivery</th>
              <th className="py-2 px-4 sm:py-3">Items</th>
              <th className="py-2 px-4 sm:py-3">Total</th>
              <th className="py-2 px-4 sm:py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.length > 0 ? (
              orders.map((order) => (
                <tr
                  key={order._id}
                  onClick={() => handleRowClick(order._id)}
                  className="border-b border-gray-300 hover:bg-gray-50 cursor-pointer transition"
                >
                  <td className="py-2 px-4 sm:py-3 sm:px-4">
                    <img
                      src={order.orderItems[0].image}
                      alt={order.orderItems[0].name}
                      className="size-10 sm:size-12 object-cover rounded-lg"
                    />
                  </td>
                  <td className="py-2 px-2 sm:py-4 sm:px-4 font-medium text-gray-900 whitespace-nowrap">
                    <div>
                      <p className="font-semibold">
                        {order.orderNumber ||
                          `#${order._id.slice(-8).toUpperCase()}`}
                      </p>
                      <p className="text-xs text-gray-500">
                        ID: {order._id.slice(-8)}
                      </p>
                    </div>
                  </td>
                  <td className="py-2 px-2 sm:py-4 sm:px-4">
                    <div>
                      <p>{new Date(order.createdAt).toLocaleDateString()}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(order.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </td>
                  <td className="py-2 px-2 sm:py-4 sm:px-4">
                    <div>
                      <p className="text-sm">
                        {order.shippingAddress?.city},{" "}
                        {order.shippingAddress?.state ||
                          order.shippingAddress?.country}
                      </p>
                      {order.deliveryTime && (
                        <p className="text-xs text-emerald-600">
                          🚚 {order.deliveryTime}
                        </p>
                      )}
                      {order.estimatedDeliveryDate && (
                        <p className="text-xs text-gray-500">
                          Est:{" "}
                          {new Date(
                            order.estimatedDeliveryDate
                          ).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="py-2 px-2 sm:py-4 sm:px-4 text-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 text-xs font-semibold text-gray-700 bg-gray-200 rounded-full">
                      {order.orderItems.length}
                    </span>
                  </td>
                  <td className="py-2 px-2 sm:py-4 sm:px-4">
                    <div>
                      <p className="font-semibold">
                        ₦{formatPrice(order.totalAmount || order.totalPrice)}
                      </p>
                      {order.deliveryCost > 0 && (
                        <p className="text-xs text-gray-500">
                          (incl. ₦{formatPrice(order.deliveryCost)} delivery)
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="py-2 px-2 sm:py-4 sm:px-4">
                    <div className="space-y-1">
                      <span
                        className={`${
                          order.status === "Delivered"
                            ? "bg-green-100 text-green-700"
                            : order.status === "Shipped"
                            ? "bg-blue-100 text-blue-700"
                            : order.status === "Processing"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-700"
                        } px-2 py-1 rounded-full text-xs sm:text-sm font-semibold block text-center`}
                      >
                        {order.status || "Pending"}
                      </span>
                      <span
                        className={`${
                          order.isPaid
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-red-100 text-red-700"
                        } px-2 py-1 rounded-full text-xs block text-center font-medium`}
                      >
                        {order.isPaid ? "Paid" : "Unpaid"}
                      </span>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="py-8 px-4 text-center text-gray-500">
                  <div className="flex flex-col items-center">
                    <p className="text-lg mb-2">📦 No orders yet</p>
                    <p className="text-sm">
                      Start shopping to see your orders here!
                    </p>
                    <button
                      onClick={() => navigate("/")}
                      className="mt-4 px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
                    >
                      Browse Products
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MyOrders;
