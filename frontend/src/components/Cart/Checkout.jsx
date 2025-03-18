import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PaypalButton from "./PaypalButton";
import BankTransferDetails from "./BankTransferDetails";
import StripeButton from "./StripeButton";
import { useDispatch, useSelector } from "react-redux";
import {
  createCheckout,
  createGuestCheckout,
  updateCheckout,
} from "../../redux/slices/checkoutSlice";
import axios from "axios";
import PaystackButton from "./PaystackButton";
import { toast } from "sonner";

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { cart, loading, error } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);

  const [checkoutId, setCheckoutId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [shippingAddress, setShippingAddress] = useState({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
    phone: "",
  });

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US').format(price);
  };


  // Ensure cart is not loaded before proceeding
  useEffect(() => {
    if (!cart || !cart.products || cart.products.length === 0) {
      navigate("/");
    }
  }, [cart, navigate]);

  const handleCreateCheckout = async (e) => {
    e.preventDefault();

    if (cart && cart.products.length > 0) {
      const checkoutData = {
        checkoutItems: cart.products,
        shippingAddress,
        totalPrice: cart.totalPrice,
      };

      console.log("Checkout Data:", checkoutData); // Debug: Check the checkout data

      let res;
      if (user) {
        res = await dispatch(createCheckout(checkoutData));
      } else {
        res = await dispatch(createGuestCheckout(checkoutData));
      }

      if (res.payload && res.payload.checkout && res.payload.checkout._id) {
        console.log("Checkout ID:", res.payload.checkout._id); // Debug: Check the checkout ID
        setCheckoutId(res.payload.checkout._id); // Set Checkout ID if checkout was successful
      }
    }
  };

  const handlePaymentMethodChange = async (method) => {
    console.log("Selected Payment Method:", method); // Debug: Check the selected method
    setPaymentMethod(method);
    await handleUpdateCheckoutWithPaymentMethod(); // Update the checkout with the selected payment method
  };

  const handleUpdateCheckoutWithPaymentMethod = async () => {
    if (!checkoutId || !paymentMethod) {
      console.error("Checkout ID or Payment Method is missing:", {
        checkoutId,
        paymentMethod,
      });
      toast.error("Please select a payment method.");
      return;
    }

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/checkout/${checkoutId}`,
        { paymentMethod },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
        }
      );

      if (response.status === 200) {
        console.log("Checkout updated successfully:", response.data);
        toast.success("Payment method added successfully.");

        // Dispatch the updateCheckout action to update the Redux store
        dispatch(updateCheckout(response.data));
      }
    } catch (error) {
      console.error("Error updating checkout:", error);
      toast.error("Failed to update payment method.");
    }
  };

  const handlePaymentSuccess = async (details) => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/checkout/${checkoutId}/pay`,
        { paymentStatus: "success", paymentDetails: details },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
        }
      );

      await handleFinalizeCheckout(checkoutId); // Finalize checkout payment is successful
    } catch (error) {
      console.error("Error in handlePaymentSuccess:", error);
    }
  };

  const handleBankTransferConfirmation = async () => {
    try {
      const response = await axios.post(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/orders/${checkoutId}/confirm-bank-transfer`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
        }
      );

      if (response.status === 200) {
        navigate("/order-confirmation"); // Redirect to order confirmation page
      }
    } catch (error) {
      console.error("Error confirming bank transfer:", error);
    }
  };

  const handleFinalizeCheckout = async (checkoutId) => {
    try {
      const response = await axios.post(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/checkout/${checkoutId}/finalize`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
        }
      );

      console.log("Finalize Checkout Response:", response.data); // Debug: Check the response
      dispatch(updateCheckout(response.data));
      navigate("/order-confirmation");
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <p>Loading cart ....</p>;
  if (error) return <p>Error {error}</p>;
  if (!cart || !cart.products || cart.products.length === 0) {
    return <p>Cart is empty</p>;
  }

  return (
    <div
      className="grid grid-cols-1 lg:grid-cols-2 gap-8
    max-w-7xl mx-auto py-10 px-6 tracking-tighter"
    >
      {/* Left Content */}
      <div className="bg-white rounded-lg p-6">
        <h2 className="txt-2xl uppercase mb-6">Checkout</h2>
        <form onSubmit={handleCreateCheckout}>
          <h3 className="text-lg mb-4">Contact Details</h3>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={user ? user.email : ""}
              className="mt-1 p-2 border border-gray-300 bg-gray-200 rounded-md w-full"
              disabled
            />
          </div>

          <h3 className="text-lg mb-4">Delivery</h3>
          <div className="mb-4 grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="firstName"
                className="block text-sm font-medium text-gray-700"
              >
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={shippingAddress.firstName}
                onChange={(e) =>
                  setShippingAddress({
                    ...shippingAddress,
                    firstName: e.target.value,
                  })
                }
                placeholder="First Name..."
                className="mt-1 p-2 border border-gray-300 rounded-md w-full"
                required
              />
            </div>

            <div>
              <label
                htmlFor="lastName"
                className="block text-sm font-medium text-gray-700"
              >
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={shippingAddress.lastName}
                onChange={(e) =>
                  setShippingAddress({
                    ...shippingAddress,
                    lastName: e.target.value,
                  })
                }
                className="mt-1 p-2 border border-gray-300 rounded-md w-full"
                required
              />
            </div>
          </div>
          <div className="mb-4">
            <label htmlFor="address" className="block text-gray-700">
              Shipping Address
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={shippingAddress.address}
              onChange={(e) =>
                setShippingAddress({
                  ...shippingAddress,
                  address: e.target.value,
                })
              }
              className="mt-1 p-2 border border-gray-300 rounded-md w-full"
              required
            />
          </div>

          <div className="mb-4 grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="city"
                className="block text-sm font-medium text-gray-700"
              >
                City
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={shippingAddress.city}
                onChange={(e) =>
                  setShippingAddress({
                    ...shippingAddress,
                    city: e.target.value,
                  })
                }
                placeholder="City"
                className="mt-1 p-2 border border-gray-300 rounded-md w-full"
                required
              />
            </div>

            <div>
              <label
                htmlFor="postalCode"
                className="block text-sm font-medium text-gray-700"
              >
                Postal Code
              </label>
              <input
                type="text"
                id="postalCode"
                name="postalCode"
                value={shippingAddress.postalCode}
                onChange={(e) =>
                  setShippingAddress({
                    ...shippingAddress,
                    postalCode: e.target.value,
                  })
                }
                className="mt-1 p-2 border border-gray-300 rounded-md w-full"
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="country" className="block text-gray-700">
              Country
            </label>
            <input
              type="text"
              id="country"
              name="country"
              value={shippingAddress.country}
              onChange={(e) =>
                setShippingAddress({
                  ...shippingAddress,
                  country: e.target.value,
                })
              }
              className="mt-1 p-2 border border-gray-300 rounded-md w-full"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="phoneNumber" className="block text-gray-700">
              Phone Number
            </label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={shippingAddress.phone}
              onChange={(e) =>
                setShippingAddress({
                  ...shippingAddress,
                  phone: e.target.value,
                })
              }
              className="mt-1 p-2 border border-gray-300 rounded-md w-full"
              required
            />
          </div>

          <div className="mt-6">
            {!checkoutId ? (
              <button
                type="submit"
                className="w-full bg-black text-white py-3 rounded-md cursor-pointer"
              >
                Continue to Payment
              </button>
            ) : (
              <div>
                <h3 className="text-lg mb-4">Select Payment Method</h3>
                <div className="flex flex-col md:flex-row gap-4 mb-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault(); // Prevent form submission
                      handlePaymentMethodChange("bank-transfer");
                    }}
                    className={`flex-1 p-2 rounded-md bg-gray-100 cursor-pointer flex items-center`}
                  >
                    <span
                      className={`inline-block ml-1 mr-2 w-4 h-4 rounded-full ${
                        paymentMethod === "bank-transfer"
                          ? "bg-green-500"
                          : "bg-gray-400"
                      }`}
                    ></span>
                    Bank Transfer
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault(); // Prevent form submission
                      handlePaymentMethodChange("paypal");
                    }}
                    className={`flex-1 p-2 rounded-md bg-gray-100 cursor-pointer flex items-center`}
                  >
                    <span
                      className={`inline-block ml-1 mr-2 w-4 h-4 rounded-full ${
                        paymentMethod === "paypal"
                          ? "bg-green-500"
                          : "bg-gray-400"
                      }`}
                    ></span>
                    PayPal
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault(); // Prevent form submission
                      handlePaymentMethodChange("paystack");
                    }}
                    className={`flex-1 p-2 rounded-md bg-gray-100 cursor-pointer flex items-center`}
                  >
                    <span
                      className={`inline-block ml-1 mr-2 w-4 h-4 rounded-full ${
                        paymentMethod === "paystack"
                          ? "bg-green-500"
                          : "bg-gray-400"
                      }`}
                    ></span>
                    Credit/Debit Card
                  </button>
                </div>

                {/* Render payment method components based on selection */}
                {paymentMethod === "bank-transfer" && (
                  <BankTransferDetails
                    amount={cart.totalPrice}
                    onConfirm={() => {
                      handlePaymentMethodChange("bank-transfer"); // Update the checkout with the selected payment method
                      handleBankTransferConfirmation(); // Proceed with bank transfer confirmation
                    }}
                  />
                )}
                {paymentMethod === "paystack" && (
                  <PaystackButton
                    amount={cart.totalPrice}
                    onSuccess={(response) => {
                      handlePaymentMethodChange("paystack"); // Update the checkout with the selected payment method
                      handlePaymentSuccess(response); // Proceed with Paystack payment
                    }}
                    onError={(error) => {
                      console.error("Paystack Error:", error);
                      toast.error("Failed to process Paystack payment.");
                    }}
                  />
                )}
                {paymentMethod === "paypal" && (
                  <PaypalButton
                    amount={cart.totalPrice}
                    onSuccess={(details) => {
                      handlePaymentMethodChange("paypal");
                      handlePaymentSuccess(details);
                    }}
                  />
                )}
              </div>
            )}
          </div>
        </form>
      </div>

      {/* Right Section */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-bold mb-4">Order Summary</h3>
        <div className="border-t py-4 mb-4">
          {cart.products.map((product, index) => (
            <div
              key={index}
              className="flex items-start justify-between py-2 border-b"
            >
              <div className="flex items-start">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-20 h-24 object-cover mr-4"
                />
                <div>
                  <h4 className="text-md font-semibold">{product.name}</h4>
                  <p className="text-gray-500 text-sm">Size: {product.size}</p>
                  <p className="text-gray-500 text-sm">
                    Color: {product.color}
                  </p>
                  <p className="text-gray-500 text-sm">
                    Quantity: {product.quantity}
                  </p>
                </div>
              </div>
              <p className="text-xl">₦{formatPrice(product.price?.toLocaleString())}</p>
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center text-lg mb-4">
          <p>Subtotal</p>
          <p>${cart.totalPrice?.toLocaleString()}</p>
        </div>
        <div className="flex justify-between items-center text-lg mb-4">
          <p>Shipping</p>
          <p>Free</p>
        </div>
        <div className="flex justify-between items-center text-lg border-t pt-4">
          <p>Total</p>
          <p>${cart.totalPrice?.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
