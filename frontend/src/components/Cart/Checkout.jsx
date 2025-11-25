import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  createCheckout,
  createGuestCheckout,
  confirmBankPayment,
  updatePaymentStatus,
  finalizeCheckout,
  verifyPaystackPayment,
} from "../../redux/slices/checkoutSlice";
import {
  calculateDelivery,
  resetDelivery,
  setSelectedSpeedOption,
} from "../../redux/slices/deliverySlice";
import nigeriaStates from "../../data/nigeriaStates";
import PaypalButton from "./PaypalButton";
import BankTransferDetails from "./BankTransferDetails";
import PaystackButton from "./PaystackButton";

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { cart } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);
  const { checkout, loading, error, paymentStatus } = useSelector(
    (state) => state.checkout
  );
  const {
    deliveryInfo,
    loading: deliveryLoading,
    selectedSpeedOption,
  } = useSelector((state) => state.delivery);

  const [paymentMethod, setPaymentMethod] = useState("");
  const [deliverySpeed, setDeliverySpeed] = useState("standard");
  const [shippingAddress, setShippingAddress] = useState({
    fullName: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "Nigeria",
    phoneNumber: "",
  });

  useEffect(() => {
    if (!cart?.products?.length) {
      navigate("/cart");
    }
  }, [cart, navigate]);

  // Calculate delivery when state, city, or delivery speed changes
  useEffect(() => {
    if (shippingAddress.state && shippingAddress.city) {
      const timer = setTimeout(() => {
        dispatch(
          calculateDelivery({
            state: shippingAddress.state,
            city: shippingAddress.city,
            speedOption: deliverySpeed,
            orderTotal: cart.totalPrice || 0,
          })
        );
      }, 500); // Debounce for 500ms

      return () => clearTimeout(timer);
    } else {
      dispatch(resetDelivery());
    }
  }, [
    shippingAddress.state,
    shippingAddress.city,
    deliverySpeed,
    cart.totalPrice,
    dispatch,
  ]);

  // Handle delivery speed change
  const handleDeliverySpeedChange = (speed) => {
    setDeliverySpeed(speed);
    dispatch(setSelectedSpeedOption(speed));
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US").format(price);
  };

  const handleCreateCheckout = async (e) => {
    e.preventDefault();
    if (!cart?.products?.length) return;

    const checkoutData = {
      checkoutItems: cart.products.map((product) => ({
        productId: product.productId,
        name: product.name,
        price: product.price,
        size: product.size,
        color: product.color,
        quantity: product.quantity,
        image: product.image,
      })),
      shippingAddress,
      totalPrice: cart.totalPrice,
    };

    try {
      if (user) {
        await dispatch(createCheckout(checkoutData)).unwrap();
      } else {
        await dispatch(createGuestCheckout(checkoutData)).unwrap();
      }
      toast.success("Checkout created successfully");
    } catch (error) {
      const errorMessage =
        error?.error || error?.message || error || "Failed to create checkout";
      toast.error(
        typeof errorMessage === "string"
          ? errorMessage
          : "Failed to create checkout"
      );
    }
  };

  const handlePaymentMethodChange = async (method) => {
    setPaymentMethod(method);
    try {
      await dispatch(
        updatePaymentStatus({
          checkoutId: checkout._id,
          status: "pending",
          paymentDetails: {
            paymentMethod: method,
          },
        })
      ).unwrap();

      toast.success("Payment method updated");
    } catch (error) {
      const errorMessage =
        error?.error ||
        error?.message ||
        error ||
        "Failed to update payment method";
      toast.error(
        typeof errorMessage === "string"
          ? errorMessage
          : "Failed to update payment method"
      );
    }
  };

  const handlePaymentSuccess = async (details) => {
    try {
      // For Paystack payments, verify with backend
      if (paymentMethod === "paystack") {
        await dispatch(
          verifyPaystackPayment({
            reference: details.reference,
            checkoutId: checkout._id,
          })
        ).unwrap();

        const result = await dispatch(finalizeCheckout(checkout._id)).unwrap();
        toast.success("Payment verified successfully!");
        navigate("/order-confirmation", { state: { order: result } });
      }
      // For other payment methods (PayPal, etc.)
      else {
        await dispatch(
          updatePaymentStatus({
            checkoutId: checkout._id,
            status: "success",
            paymentDetails: {
              transactionId: details.reference || details.id,
              paymentGateway: paymentMethod,
              amount: cart.totalPrice,
              currency: "NGN",
              paymentResponse: details,
            },
          })
        ).unwrap();

        const result = await dispatch(finalizeCheckout(checkout._id)).unwrap();
        navigate("/order-confirmation", { state: { order: result } });
      }
    } catch (error) {
      toast.error(
        error?.error || error?.message || "Payment processing failed"
      );
      console.error("Payment error:", error);
    }
  };

  const handleBankTransferConfirmation = async () => {
    try {
      const result = await dispatch(confirmBankPayment(checkout._id)).unwrap();
      navigate("/order-confirmation", {
        state: {
          order: result.checkout,
          message: "Awaiting bank transfer confirmation",
        },
      });
    } catch (error) {
      const errorMessage =
        error?.error ||
        error?.message ||
        error ||
        "Bank transfer confirmation failed";
      toast.error(
        typeof errorMessage === "string"
          ? errorMessage
          : "Bank transfer confirmation failed"
      );
    }
  };

  if (!cart?.products?.length) {
    return (
      <div className="max-w-7xl mx-auto py-10 px-6">
        <p>Your cart is empty</p>
        <button
          onClick={() => navigate("/")}
          className="mt-4 bg-black text-white px-4 py-2 rounded"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto py-10 px-6">
      {/* Error Display */}
      {error && (
        <div className="col-span-full bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {typeof error === "string"
            ? error
            : "An error occurred. Please try again."}
        </div>
      )}

      {/* Checkout Form - THIS IS THE CRUCIAL PART THAT WAS MISSING */}
      <div className="bg-white rounded-lg p-6">
        <h2 className="text-2xl uppercase mb-6">Checkout</h2>
        <form onSubmit={handleCreateCheckout}>
          {/* Contact Information */}
          <h3 className="text-lg mb-4">Contact Information</h3>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={user?.email || ""}
              className="w-full p-2 border border-gray-300 bg-gray-300 rounded"
              disabled
            />
          </div>

          {/* Shipping Address */}
          <h3 className="text-lg mb-4">Shipping Address</h3>
          <div className="mb-4">
            <label htmlFor="fullName" className="block text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              id="fullName"
              value={shippingAddress.fullName}
              onChange={(e) =>
                setShippingAddress({
                  ...shippingAddress,
                  fullName: e.target.value,
                })
              }
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="address" className="block text-gray-700 mb-1">
              Address
            </label>
            <input
              type="text"
              id="address"
              value={shippingAddress.address}
              onChange={(e) =>
                setShippingAddress({
                  ...shippingAddress,
                  address: e.target.value,
                })
              }
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="state" className="block text-gray-700 mb-1">
                State
              </label>
              <select
                id="state"
                value={shippingAddress.state}
                onChange={(e) =>
                  setShippingAddress({
                    ...shippingAddress,
                    state: e.target.value,
                  })
                }
                className="w-full p-2 border border-gray-300 rounded"
                required
              >
                <option value="">Select State</option>
                {nigeriaStates.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="city" className="block text-gray-700 mb-1">
                City
              </label>
              <input
                type="text"
                id="city"
                value={shippingAddress.city}
                onChange={(e) =>
                  setShippingAddress({
                    ...shippingAddress,
                    city: e.target.value,
                  })
                }
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="postalCode" className="block text-gray-700 mb-1">
                Postal Code
              </label>
              <input
                type="text"
                id="postalCode"
                value={shippingAddress.postalCode}
                onChange={(e) =>
                  setShippingAddress({
                    ...shippingAddress,
                    postalCode: e.target.value,
                  })
                }
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            <div>
              <label htmlFor="phoneNumber" className="block text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                id="phoneNumber"
                value={shippingAddress.phoneNumber}
                onChange={(e) =>
                  setShippingAddress({
                    ...shippingAddress,
                    phoneNumber: e.target.value,
                  })
                }
                className="w-full p-2 border border-gray-300 rounded"
                required
                placeholder="+234..."
              />
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="country" className="block text-gray-700 mb-1">
              Country
            </label>
            <input
              type="text"
              id="country"
              value={shippingAddress.country}
              onChange={(e) =>
                setShippingAddress({
                  ...shippingAddress,
                  country: e.target.value,
                })
              }
              className="w-full p-2 border border-gray-300 rounded bg-gray-100"
              readOnly
              required
            />
          </div>

          {/* Delivery Cost Display */}
          {deliveryLoading && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-700">Calculating delivery cost...</p>
            </div>
          )}

          {/* Delivery Speed Options */}
          {shippingAddress.state &&
            shippingAddress.city &&
            deliveryInfo?.deliveryOptions && (
              <div className="mb-4">
                <h4 className="font-semibold text-gray-800 mb-3">
                  Select Delivery Speed
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {deliveryInfo.deliveryOptions.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => handleDeliverySpeedChange(option.id)}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        deliverySpeed === option.id
                          ? "border-emerald-600 bg-emerald-50"
                          : "border-gray-200 hover:border-emerald-300"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gray-900">
                          {option.name}
                        </span>
                        {deliverySpeed === option.id && (
                          <svg
                            className="w-5 h-5 text-emerald-600"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        {option.description}
                      </div>
                      <div className="flex items-baseline space-x-2">
                        {option.isFree ? (
                          <>
                            <span className="text-lg font-bold text-emerald-600">
                              FREE
                            </span>
                            <span className="text-xs text-gray-500 line-through">
                              ₦{formatPrice(option.originalCost)}
                            </span>
                          </>
                        ) : (
                          <span className="text-lg font-bold text-gray-900">
                            ₦{formatPrice(option.cost)}
                          </span>
                        )}
                      </div>
                      {option.isDefault && (
                        <span className="inline-block mt-2 text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded">
                          Recommended
                        </span>
                      )}
                    </button>
                  ))}
                </div>
                {deliveryInfo.isFreeShipping && (
                  <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <p className="text-sm text-emerald-700 flex items-center">
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      🎉 You qualify for FREE shipping! Your order is ₦
                      {formatPrice(cart.totalPrice)}
                    </p>
                  </div>
                )}
              </div>
            )}

          {deliveryInfo && (
            <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
              <h4 className="font-semibold text-emerald-800 mb-2">
                Delivery Summary
              </h4>
              <div className="space-y-1 text-sm text-emerald-700">
                <p>
                  <span className="font-medium">Distance:</span>{" "}
                  {deliveryInfo.distance} km from Lagos
                </p>
                <p>
                  <span className="font-medium">Delivery Fee:</span>{" "}
                  {deliveryInfo.isFreeShipping ? (
                    <span className="font-bold text-emerald-600">FREE</span>
                  ) : (
                    <span>₦{formatPrice(deliveryInfo.deliveryCost)}</span>
                  )}
                </p>
                <p>
                  <span className="font-medium">Estimated Delivery:</span>{" "}
                  {deliveryInfo.deliveryTime}
                </p>
                {deliveryInfo.estimatedDeliveryDate && (
                  <p>
                    <span className="font-medium">Expected by:</span>{" "}
                    {new Date(
                      deliveryInfo.estimatedDeliveryDate
                    ).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Payment Section */}
          {!checkout ? (
            <button
              type="submit"
              className="w-full bg-black text-white py-3 rounded-md hover:bg-gray-800 transition"
              disabled={loading}
            >
              {loading ? "Processing..." : "Continue to Payment"}
            </button>
          ) : (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">
                Select Payment Method
              </h3>

              {/* Payment Method Selection */}
              <div className="space-y-3 mb-6">
                <label
                  className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition"
                  style={{
                    borderColor:
                      paymentMethod === "paystack" ? "#22c55e" : "#e5e7eb",
                  }}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="paystack"
                    checked={paymentMethod === "paystack"}
                    onChange={(e) => handlePaymentMethodChange(e.target.value)}
                    className="mr-3 h-4 w-4"
                  />
                  <div className="flex items-center justify-between w-full">
                    <span className="font-medium">Paystack</span>
                    <span className="text-sm text-gray-500">Card Payment</span>
                  </div>
                </label>

                <label
                  className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition"
                  style={{
                    borderColor:
                      paymentMethod === "paypal" ? "#0070ba" : "#e5e7eb",
                  }}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="paypal"
                    checked={paymentMethod === "paypal"}
                    onChange={(e) => handlePaymentMethodChange(e.target.value)}
                    className="mr-3 h-4 w-4"
                  />
                  <div className="flex items-center justify-between w-full">
                    <span className="font-medium">PayPal</span>
                    <span className="text-sm text-gray-500">
                      PayPal Account
                    </span>
                  </div>
                </label>

                <label
                  className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition"
                  style={{
                    borderColor:
                      paymentMethod === "bank-transfer" ? "#3b82f6" : "#e5e7eb",
                  }}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="bank-transfer"
                    checked={paymentMethod === "bank-transfer"}
                    onChange={(e) => handlePaymentMethodChange(e.target.value)}
                    className="mr-3 h-4 w-4"
                  />
                  <div className="flex items-center justify-between w-full">
                    <span className="font-medium">Bank Transfer</span>
                    <span className="text-sm text-gray-500">
                      Direct Transfer
                    </span>
                  </div>
                </label>
              </div>

              {/* Payment Form Based on Selected Method */}
              {paymentMethod === "paystack" && (
                <div className="mt-4">
                  <PaystackButton
                    amount={cart.totalPrice}
                    onSuccess={handlePaymentSuccess}
                    onError={(error) => toast.error(error)}
                  />
                </div>
              )}

              {paymentMethod === "paypal" && (
                <div className="mt-4">
                  <PaypalButton
                    amount={cart.totalPrice}
                    onSuccess={handlePaymentSuccess}
                    onError={(error) => toast.error("PayPal payment failed")}
                  />
                </div>
              )}

              {paymentMethod === "bank-transfer" && (
                <div className="mt-4">
                  <BankTransferDetails
                    amount={cart.totalPrice}
                    onConfirm={handleBankTransferConfirmation}
                    isLoading={loading}
                  />
                </div>
              )}
            </div>
          )}
        </form>
      </div>

      {/* Order Summary */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-bold mb-4">Order Summary</h3>
        <div className="space-y-4">
          {cart.products.map((product) => (
            <div
              key={`${product._id}-${product.size}-${product.color}`}
              className="flex justify-between items-start border-b pb-4"
            >
              <div className="flex items-start space-x-4">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-20 h-24 object-cover rounded"
                />
                <div>
                  <h4 className="font-medium">{product.name}</h4>
                  <p className="text-sm text-gray-500">
                    {product.size} | {product.color}
                  </p>
                  <p className="text-sm text-gray-500">
                    Qty: {product.quantity}
                  </p>
                </div>
              </div>
              <p className="font-medium">₦{formatPrice(product.price)}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 space-y-2">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>₦{formatPrice(cart.totalPrice)}</span>
          </div>
          <div className="flex justify-between">
            <span>Delivery Fee</span>
            <span>
              {deliveryInfo ? (
                `₦${formatPrice(deliveryInfo.deliveryCost)}`
              ) : (
                <span className="text-gray-500 text-sm">
                  Enter address to calculate
                </span>
              )}
            </span>
          </div>
          <div className="flex justify-between border-t pt-2 font-bold text-lg">
            <span>Total</span>
            <span>
              ₦
              {formatPrice(cart.totalPrice + (deliveryInfo?.deliveryCost || 0))}
            </span>
          </div>
          {deliveryInfo && (
            <div className="text-sm text-gray-600 pt-2">
              <p>
                📍 Delivering to: {deliveryInfo.city}, {deliveryInfo.state}
              </p>
              <p>🚚 Estimated delivery: {deliveryInfo.deliveryTime}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Checkout;
