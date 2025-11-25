import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { clearCart } from "../redux/slices/cartSlice";

const OrderConfirmation = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { checkout } = useSelector((state) => state.checkout);
  const { deliveryInfo } = useSelector((state) => state.delivery);

  console.log("Checkout State:", checkout); // Debug: Check the checkout state

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US").format(price);
  };

  // Clear cart when order is confirmed
  useEffect(() => {
    if (checkout && checkout._id) {
      dispatch(clearCart());
      localStorage.removeItem("cart");
    } else {
      navigate("/my-orders");
    }
  }, [checkout, dispatch]);

  const calculateEstimatedDelivery = (createdAt) => {
    const orderDate = new Date(createdAt);
    orderDate.setDate(orderDate.getDate() + 10); // Add 10 days to the order date
    return orderDate.toLocaleDateString();
  };

  // Add checks to ensure checkout and checkout.orderItems are defined
  if (!checkout) {
    return (
      <Loader
        size="lg"
        text="Loading checkout details..."
        className="min-h-screen"
      />
    );
  }

  if (!checkout.orderItems) {
    return <p>No items in the checkout.</p>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">✅</div>
        <h1 className="text-xl sm:text-4xl font-bold text-emerald-700 mb-2">
          Order Confirmed!
        </h1>
        <p className="text-gray-600">
          Thank you for your order. We've sent a confirmation email with your
          order details.
        </p>
      </div>

      {checkout && checkout.orderItems && (
        <div className="p-6 rounded-lg shadow-md border border-gray-200">
          {/* Order Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-4 border-b">
            <div>
              <h2 className="text-md sm:text-xl font-semibold mb-1">
                Order ID: {checkout._id}
              </h2>
              <p className="text-sm sm:text-base text-gray-500">
                Order Date:{" "}
                {new Date(checkout.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div className="mt-4 sm:mt-0 text-left sm:text-right">
              {deliveryInfo && deliveryInfo.estimatedDeliveryDate ? (
                <>
                  <p className="text-emerald-700 font-semibold text-xs sm:text-sm">
                    Estimated Delivery
                  </p>
                  <p className="text-sm text-gray-700">
                    {new Date(
                      deliveryInfo.estimatedDeliveryDate
                    ).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    ({deliveryInfo.deliveryTime})
                  </p>
                </>
              ) : (
                <p className="text-emerald-700 text-xs sm:text-sm">
                  Estimated Delivery: 3-7 business days
                </p>
              )}
            </div>
          </div>

          {/* Delivery Information Box */}
          {deliveryInfo && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
                <span className="mr-2">🚚</span>
                Delivery Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-blue-800">
                <p>
                  <span className="font-medium">Distance from Lagos:</span>{" "}
                  {deliveryInfo.distance} km
                </p>
                <p>
                  <span className="font-medium">Delivery Fee:</span> ₦
                  {formatPrice(deliveryInfo.deliveryCost)}
                </p>
                <p className="col-span-1 sm:col-span-2">
                  <span className="font-medium">Destination:</span>{" "}
                  {deliveryInfo.city}, {deliveryInfo.state}
                </p>
              </div>
            </div>
          )}

          {/* Render order items */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Order Items</h3>
            {checkout.orderItems.map((item) => (
              <div
                key={item.productId}
                className="flex items-center mb-4 pb-4 border-b last:border-b-0"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="size-16 rounded-md object-cover mr-4"
                />
                <div className="flex-1">
                  <h4 className="text-md font-semibold">{item.name}</h4>
                  <p className="text-sm text-gray-500">
                    {item.color} | {item.size}
                  </p>
                  <p className="text-sm text-gray-500">
                    Quantity: {item.quantity}
                  </p>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-md font-semibold">
                    ₦{formatPrice(item.price * item.quantity)}
                  </p>
                  <p className="text-sm text-gray-500">
                    ₦{formatPrice(item.price)} each
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span>₦{formatPrice(checkout.totalPrice)}</span>
              </div>
              {deliveryInfo && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Fee:</span>
                  <span>₦{formatPrice(deliveryInfo.deliveryCost)}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t font-bold text-lg">
                <span>Total:</span>
                <span className="text-emerald-700">
                  ₦
                  {formatPrice(
                    checkout.totalPrice + (deliveryInfo?.deliveryCost || 0)
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Render payment and delivery info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="text-lg font-semibold mb-2 flex items-center">
                <span className="mr-2">💳</span>
                Payment Method
              </h4>
              <p className="text-gray-700 capitalize">
                {checkout.paymentMethod === "bank-transfer"
                  ? "Bank Transfer"
                  : checkout.paymentMethod === "paystack"
                  ? "Card Payment (Paystack)"
                  : "PayPal"}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Status:{" "}
                {checkout.paymentStatus === "success"
                  ? "Paid"
                  : checkout.paymentStatus === "unconfirmed"
                  ? "Awaiting Confirmation"
                  : "Pending"}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="text-lg font-semibold mb-2 flex items-center">
                <span className="mr-2">📍</span>
                Delivery Address
              </h4>
              <p className="text-gray-700">
                {checkout.shippingAddress.address}
              </p>
              <p className="text-gray-700">
                {checkout.shippingAddress.city},{" "}
                {checkout.shippingAddress.state}
              </p>
              <p className="text-gray-700">
                {checkout.shippingAddress.country}
              </p>
              {checkout.shippingAddress.postalCode && (
                <p className="text-gray-500 text-sm mt-1">
                  Postal Code: {checkout.shippingAddress.postalCode}
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate("/my-orders")}
              className="flex-1 bg-emerald-600 text-white py-3 px-6 rounded-lg hover:bg-emerald-700 transition font-semibold"
            >
              View My Orders
            </button>
            <button
              onClick={() => navigate("/")}
              className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-lg hover:bg-gray-300 transition font-semibold"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderConfirmation;
