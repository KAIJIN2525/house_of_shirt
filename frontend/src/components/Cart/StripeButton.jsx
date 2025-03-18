import React from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe('your-publishable-key');

const StripeCheckoutForm = ({ amount, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: elements.getElement(CardElement),
    });

    if (error) {
      console.error(error);
      alert('Payment failed. Please try again.');
    } else {
      console.log('Payment successful:', paymentMethod);
      onSuccess(paymentMethod);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardElement className="mb-4 p-2 border border-gray-300 rounded-md" />
      <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded-md">
        Pay with Card
      </button>
    </form>
  );
};

const StripeButton = ({ amount, onSuccess }) => {
  return (
    <Elements stripe={stripePromise}>
      <StripeCheckoutForm amount={amount} onSuccess={onSuccess} />
    </Elements>
  );
};

export default StripeButton;