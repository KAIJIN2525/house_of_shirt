import React from "react";
import PaystackPop from "@paystack/inline-js";

const PaystackButton = ({ amount, onSuccess, onError }) => {
  const handlePayment = () => {
    const paystack = new PaystackPop();

    paystack.newTransaction({
      key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY, // Your Paystack public key
      email: "user@example.com", // Replace with the user's email
      amount: amount * 100, // Convert amount to kobo (Paystack uses kobo for Naira)
      ref: new Date().getTime().toString(), // Unique reference for each transaction
      onSuccess: (response) => {
        console.log("Payment Successful:", response);
        onSuccess(response); // Call the onSuccess callback
      },
      onCancel: () => {
        console.log("Payment Cancelled");
        onError("Payment was cancelled"); // Call the onError callback
      },
    });
  };

  return (
    <button
      onClick={handlePayment}
      className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
    >
      Pay with Paystack
    </button>
  );
};

export default PaystackButton;
