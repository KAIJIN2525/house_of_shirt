import React, { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { RiArrowLeftLine } from "react-icons/ri";
import Loader from "../components/Common/Loader";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrderDetails } from "../redux/slices/orderSlice";

const OrderDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { orderDetails, loading, error } = useSelector((state) => state.orders);

  // Helper function to format prices with commas
  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US").format(price);
  };

  useEffect(() => {
    dispatch(fetchOrderDetails(id));
  }, [dispatch, id]);

  if (loading)
    return (
      <Loader
        size="lg"
        text="Loading order details..."
        className="min-h-screen"
      />
    );
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <h2 className="text-2xl md:text-3xl font-bold mb-6">Order Details</h2>
      {!orderDetails ? (
        <p>No Order details found</p>
      ) : (
        <div className="p-4 sm:p-6 rounded-lg border border-gray-100 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start mb-8">
            <div>
              <h3 className="text-lg md:text-xl font-semibold mb-1">
                Order #
                {orderDetails.orderNumber ||
                  orderDetails._id.slice(-8).toUpperCase()}
              </h3>
              <p className="text-sm text-gray-500 mb-1">
                ID: {orderDetails._id}
              </p>
              <p className="text-gray-600">
                Placed on{" "}
                {new Date(orderDetails.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <div className="flex flex-col items-start sm:items-end mt-4 sm:mt-0 space-y-2">
              <span
                className={`${
                  orderDetails.status === "Delivered"
                    ? "bg-green-100 text-green-700"
                    : orderDetails.status === "Shipped"
                    ? "bg-blue-100 text-blue-700"
                    : orderDetails.status === "Processing"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-gray-100 text-gray-700"
                } px-3 py-1 rounded-full text-sm font-medium`}
              >
                {orderDetails.status || "Pending"}
              </span>

              <span
                className={`${
                  orderDetails.isPaid
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-red-100 text-red-700"
                } px-3 py-1 rounded-full text-sm font-medium`}
              >
                {orderDetails.isPaid ? "Paid" : "Payment Pending"}
              </span>

              {orderDetails.isDelivered && (
                <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                  ✓ Delivered
                </span>
              )}
            </div>
          </div>

          {/* Delivery Information */}
          {(orderDetails.deliveryTime ||
            orderDetails.estimatedDeliveryDate ||
            orderDetails.customerLocation) && (
            <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
                <span className="mr-2">🚚</span>
                Delivery Information
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                {orderDetails.deliveryTime && (
                  <div>
                    <p className="text-blue-700 font-medium">Delivery Time</p>
                    <p className="text-blue-900">{orderDetails.deliveryTime}</p>
                  </div>
                )}
                {orderDetails.estimatedDeliveryDate && (
                  <div>
                    <p className="text-blue-700 font-medium">
                      Estimated Arrival
                    </p>
                    <p className="text-blue-900">
                      {new Date(
                        orderDetails.estimatedDeliveryDate
                      ).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                )}
                {orderDetails.customerLocation?.distance && (
                  <div>
                    <p className="text-blue-700 font-medium">
                      Distance from Lagos
                    </p>
                    <p className="text-blue-900">
                      {orderDetails.customerLocation.distance} km
                    </p>
                  </div>
                )}
                {orderDetails.deliveryCost > 0 && (
                  <div>
                    <p className="text-blue-700 font-medium">Delivery Fee</p>
                    <p className="text-blue-900">
                      ₦{formatPrice(orderDetails.deliveryCost)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Customer, Payment, Shipping Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="text-lg font-semibold mb-3 flex items-center">
                <span className="mr-2">💳</span>
                Payment Info
              </h4>
              <div className="space-y-2 text-sm">
                <p className="text-gray-600">
                  <span className="font-medium text-gray-800">Method:</span>{" "}
                  <span className="capitalize">
                    {orderDetails.paymentMethod === "bank-transfer"
                      ? "Bank Transfer"
                      : orderDetails.paymentMethod === "paystack"
                      ? "Card (Paystack)"
                      : "PayPal"}
                  </span>
                </p>
                <p className="text-gray-600">
                  <span className="font-medium text-gray-800">Status:</span>{" "}
                  <span
                    className={
                      orderDetails.isPaid ? "text-green-600" : "text-red-600"
                    }
                  >
                    {orderDetails.isPaid ? "Paid" : "Unpaid"}
                  </span>
                </p>
                {orderDetails.paidAt && (
                  <p className="text-gray-600">
                    <span className="font-medium text-gray-800">Paid On:</span>{" "}
                    {new Date(orderDetails.paidAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="text-lg font-semibold mb-3 flex items-center">
                <span className="mr-2">📍</span>
                Shipping Address
              </h4>
              <div className="space-y-1 text-sm text-gray-700">
                {orderDetails.shippingAddress.fullName && (
                  <p className="font-medium text-gray-800">
                    {orderDetails.shippingAddress.fullName}
                  </p>
                )}
                <p>{orderDetails.shippingAddress.address}</p>
                <p>
                  {orderDetails.shippingAddress.city}
                  {orderDetails.shippingAddress.state &&
                    `, ${orderDetails.shippingAddress.state}`}
                </p>
                <p>{orderDetails.shippingAddress.country}</p>
                {orderDetails.shippingAddress.postalCode && (
                  <p className="text-gray-500">
                    {orderDetails.shippingAddress.postalCode}
                  </p>
                )}
                {orderDetails.shippingAddress.phoneNumber && (
                  <p className="text-gray-600 mt-2">
                    📞 {orderDetails.shippingAddress.phoneNumber}
                  </p>
                )}
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="text-lg font-semibold mb-3 flex items-center">
                <span className="mr-2">📦</span>
                Order Status
              </h4>
              <div className="space-y-2 text-sm">
                <p className="text-gray-600">
                  <span className="font-medium text-gray-800">Current:</span>{" "}
                  <span className="font-semibold">
                    {orderDetails.status || "Pending"}
                  </span>
                </p>
                {orderDetails.confirmedAt && (
                  <p className="text-gray-600">
                    ✓ Confirmed:{" "}
                    {new Date(orderDetails.confirmedAt).toLocaleDateString()}
                  </p>
                )}
                {orderDetails.shippedAt && (
                  <p className="text-gray-600">
                    ✓ Shipped:{" "}
                    {new Date(orderDetails.shippedAt).toLocaleDateString()}
                  </p>
                )}
                {orderDetails.deliveredAt && (
                  <p className="text-gray-600">
                    ✓ Delivered:{" "}
                    {new Date(orderDetails.deliveredAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Product List */}
          <div className="overflow-x-auto mb-6">
            <h4 className="text-lg font-semibold mb-4">Order Items</h4>
            <table className="min-w-full divide-y text-gray-600 divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-3 px-4 text-left">Product</th>
                  <th className="py-3 px-4 text-center">Unit Price</th>
                  <th className="py-3 px-4 text-center">Quantity</th>
                  <th className="py-3 px-4 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {orderDetails.orderItems.map((item) => (
                  <tr
                    key={item.productId}
                    className="border-b border-gray-200 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4 flex items-center">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="size-12 object-cover rounded-lg mr-4"
                      />
                      <div>
                        <Link
                          to={`/product/${item.productId}`}
                          className="text-gray-800 hover:underline font-medium"
                        >
                          {item.name}
                        </Link>
                        {(item.size || item.color) && (
                          <p className="text-xs text-gray-500">
                            {item.size && `Size: ${item.size}`}
                            {item.size && item.color && " | "}
                            {item.color && `Color: ${item.color}`}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      ₦{formatPrice(Math.round(item.price))}
                    </td>
                    <td className="py-3 px-4 text-center font-medium">
                      {item.quantity}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold">
                      ₦{formatPrice(Math.round(item.price * item.quantity))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Order Summary */}
          <div className="flex justify-end mb-6">
            <div className="w-full sm:w-80 space-y-2 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-lg mb-3">Order Summary</h4>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span>₦{formatPrice(orderDetails.totalPrice)}</span>
              </div>
              {orderDetails.deliveryCost > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Delivery Fee:</span>
                  <span>₦{formatPrice(orderDetails.deliveryCost)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total:</span>
                <span className="text-emerald-700">
                  ₦
                  {formatPrice(
                    orderDetails.totalAmount || orderDetails.totalPrice
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Back to Orders Link */}
          <Link
            to="/my-orders"
            className="text-gray-800 hover:underline flex items-center font-medium"
          >
            <RiArrowLeftLine className="size-4 mr-1" />
            Back to My Orders
          </Link>
        </div>
      )}
    </div>
  );
};

export default OrderDetails;
