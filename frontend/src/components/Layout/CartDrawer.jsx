import React, { useState } from "react";
import { IoMdClose } from "react-icons/io";
import CartContents from "../Cart/CartContents";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const CartDrawer = ({ drawerOpen, toggleCartDrawer }) => {
  const navigate = useNavigate();
  const { user, guestId } = useSelector((state) => state.auth);
  const { cart } = useSelector((state) => state.cart);
  const userId = user ? user._id : null;
  const handleCheckout = () => {
    // Handle checkout logic here
    toggleCartDrawer();
    navigate("/checkout");
  };

  return (
    <div
      className={`fixed top-0 right-0 w-3/4 sm:w-1/2 md:w-[25rem] h-full bg-white shadow-lg transform transition-transform duration-300 flex flex-col z-50 ${
        drawerOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      {/* Close Button */}
      <div className="flex justify-end p-4 border-b border-gray-200 shadow-sm">
        <button onClick={toggleCartDrawer}>
          <IoMdClose className="size-6 text-gray-600 cursor-pointer" />
        </button>
      </div>

      {/* Cart Content */}
      <div className="flex-grow overflow-y-auto p-4">
        <h2 className="text-xl font-semibold mb-4">Your Cart</h2>
        {/* Cart items */}
        {cart && cart?.products?.length > 0 ? (
          <CartContents cart={cart} guestId={guestId} userId={userId} />
        ) : (
          <p className="text-gray-600">Your cart is empty.</p>
        )}
      </div>

      {/* Checkout and Cart button */}
      <div className="p-4 bg-white sticky bottom-0">
        {cart && cart?.products?.length > 0 && (
          <>
            <div className="flex flex-col gap-1">
              <button className="w-full bg-white border border-gray-600 text-black py-3 rounded-lg font-semibold hover:bg-black hover:text-white cursor-pointer transition">
                VIEW BAG
              </button>

              <button
                onClick={handleCheckout}
                className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition cursor-pointer"
              >
                CHECKOUT
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              *Shipping, taxes, and discounts calculated at checkout
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
