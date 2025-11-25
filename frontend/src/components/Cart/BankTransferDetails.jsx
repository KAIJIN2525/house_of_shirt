import React, { useState } from "react";
import { toast } from "sonner";

const BankTransferDetails = ({ amount, onConfirm, isLoading }) => {
  const [hasConfirmedTransfer, setHasConfirmedTransfer] = useState(false);

  const handleConfirm = async () => {
    if (!hasConfirmedTransfer) {
      toast.warning("Please confirm you have made the transfer");
      return;
    }

    try {
      await onConfirm();
      toast.success("Bank transfer confirmed! Your order is being processed.");
    } catch (error) {
      toast.error("Confirmation failed. Please try again.");
    }
  };

  return (
    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
      <h3 className="text-xl font-bold mb-4">Bank Transfer Instructions</h3>

      <div className="space-y-3 mb-6">
        <div className="flex justify-between">
          <span className="text-gray-600">Amount to transfer:</span>
          <span className="font-semibold">₦{amount?.toLocaleString()}</span>
        </div>

        <div className="bg-white p-4 rounded-md border border-gray-300">
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <p className="text-sm text-gray-500">Bank Name</p>
              <p className="font-medium">Opay</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Account Number</p>
              <p className="font-medium">8105362020</p>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500">Account Name</p>
            <p className="font-medium">Aniema Udonnah</p>
          </div>
        </div>

        <p className="text-sm text-gray-500 mt-2">
          Please include your order number as the payment reference.
        </p>
      </div>

      <div className="mb-6">
        <label className="flex items-start space-x-3">
          <input
            type="checkbox"
            checked={hasConfirmedTransfer}
            onChange={(e) => setHasConfirmedTransfer(e.target.checked)}
            className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-gray-700">
            I confirm that I have completed the bank transfer with the exact
            order amount
          </span>
        </label>
      </div>

      <button
        onClick={handleConfirm}
        disabled={!hasConfirmedTransfer || isLoading}
        className={`w-full py-3 px-4 rounded-md text-white font-medium ${
          !hasConfirmedTransfer || isLoading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Processing...
          </span>
        ) : (
          "Confirm Bank Transfer"
        )}
      </button>
    </div>
  );
};

export default BankTransferDetails;
