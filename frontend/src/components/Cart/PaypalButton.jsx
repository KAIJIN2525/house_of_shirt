import React, { useEffect, useState } from "react";
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";

const PaypalButton = ({ amount, onSuccess, onError }) => {
  const [convertedAmount, setConvertedAmount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch the exchange rate and convert the amount
  useEffect(() => {
    const convertNairaToDollars = async () => {
      try {
        // Replace with your preferred exchange rate API
        const response = await fetch(
          `https://api.exchangerate-api.com/v4/latest/USD`
        );
        const data = await response.json();
        const exchangeRate = data.rates.NGN; // Get the NGN to USD exchange rate

        // Convert the Naira amount to Dollars
        const amountInDollars = (amount / exchangeRate).toFixed(2);
        setConvertedAmount(amountInDollars);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch exchange rate.");
        setLoading(false);
      }
    };

    convertNairaToDollars();
  }, [amount]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <PayPalScriptProvider
      options={{ "client-id": import.meta.env.VITE_PAYPAL_CLIENT_ID }}
    >
      <PayPalButtons
        style={{ layout: "vertical" }}
        createOrder={(data, actions) => {
          return actions.order.create({
            purchase_units: [
              { amount: { value: parseFloat(convertedAmount).toFixed(2) } },
            ],
          });
        }}
        onApprove={(data, actions) => {
          return actions.order.capture().then((details) => {
            onSuccess(details); // Call the onSuccess callback
          });
        }}
        onError={(error) => {
          onError(error); // Call the onError callback
        }}
      />
    </PayPalScriptProvider>
  );
};

export default PaypalButton;
