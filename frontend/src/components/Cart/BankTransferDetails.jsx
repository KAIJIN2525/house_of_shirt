import React from "react";

const BankTransferDetails = ({ onConfirm }) => {
  return (
    <div className="bg-gray-100 p-4 rounded-md">
      <h3 className="text-lg font-semibold mb-4">Bank Transfer Details</h3>
      <p className="mb-2">
        Please transfer the total amount to the following account:
      </p>
      <div className="space-y-2">
        <p>
          <strong>Bank Name:</strong> Opay
        </p>
        <p>
          <strong>Account Name:</strong> Aniema Udonnah
        </p>
        <p>
          <strong>Account Number:</strong> 8105362020
        </p>
      </div>
      <button
        onClick={onConfirm}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md mt-4 hover:bg-blue-700"
      >
        I have made the transfer
      </button>
    </div>
  );
};

export default BankTransferDetails;
