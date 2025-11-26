import React, { useState } from "react";
import CartDrawer from "../Layout/CartDrawer";
import { Link } from "react-router-dom";
import {
  HiOutlineUser,
  HiOutlineShoppingBag,
  HiBars3BottomRight,
} from "react-icons/hi2";
import SearchBar from "./SearchBar";
import { IoMdClose } from "react-icons/io";
import { FaRegHeart } from "react-icons/fa"; 
import { useSelector } from "react-redux";

const Navbar = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [navDrawerOpen, setNavDrawerOpen] = useState(false);
  const { cart } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);
  const favorites = useSelector((state) => state.favorites.items); // Get favorites from Redux store

  const cartItemCount =
    cart?.products?.reduce((total, product) => total + product.quantity, 0) ||
    0;

  const favoritesCount = favorites.length; 

  const toggleCartDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };
  const toggleNavDrawer = () => {
    setNavDrawerOpen(!navDrawerOpen);
  };

  return (
    <>
      <nav className="container mx-auto flex items-center justify-between py-2 px-2 sm:px-10">
        {/* Left -Logo */}
        <div className="flex items-center space-x-4">
          <Link to="/">
            <img className="w-24" src="/house_of_shirt.png" alt="" />
          </Link>
        </div>

        <div className="hidden md:flex space-x-6">
          <Link
            to="/collections/all?gender=Men"
            className="text-gray-700 hover:text-black text-sm font-medium uppercase"
          >
            MEN
          </Link>
          <Link
            to="/collections/all?gender=Women"
            className="text-gray-700 hover:text-black text-sm font-medium uppercase"
          >
            WOMEN
          </Link>
          <Link
            to="/collections/all?category=Shirt"
            className="text-gray-700 hover:text-black text-sm font-medium uppercase"
          >
            SHIRTS
          </Link>
          <Link
            to="/collections/all?category=Pants"
            className="text-gray-700 hover:text-black text-sm font-medium uppercase"
          >
            PANTS
          </Link>
        </div>

        {/* Right */}
        <div className="flex items-center space-x-4">
          {user && user.role === "admin" && (
            <Link
              to="/admin"
              className="block bg-black px-2 rounded py-1 text-sm text-white"
            >
              Admin
            </Link>
          )}

          <Link to="/profile" className="hover:text-black">
            <HiOutlineUser className="size-6 text-gray-700" />
          </Link>

          {/* Favorites Link with Dot */}
          <Link to="/favorites" className="relative hover:text-black">
            <FaRegHeart className="size-6 border-gray-700" />
            {favoritesCount > 0 && (
              <span className="absolute -top-1 -right-1 w-3 h-3 flex items-center justify-center text-xs bg-gray-800 border-2 border-gray-700 rounded-full "></span>
            )}
          </Link>

          <button
            onClick={toggleCartDrawer}
            className="relative cursor-pointer hover:text-black"
          >
            <HiOutlineShoppingBag className="size-6 text-gray-700 " />
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 text-white bg-gray-900 rounded-full w-4 h-4 flex items-center justify-center text-xs">
                {cartItemCount}
              </span>
            )}
          </button>

          {/* Search */}
          <div className="overflow-hidden">
            <SearchBar />
          </div>

          <button onClick={toggleNavDrawer} className="md:hidden">
            <HiBars3BottomRight className="size-6 text-gray-700 cursor-pointer" />
          </button>
        </div>
      </nav>

      <CartDrawer drawerOpen={drawerOpen} toggleCartDrawer={toggleCartDrawer} />

      {/* Mobile Navigation */}
      <div
        className={`fixed top-0 left-0 w-3/4 sm:w-1/2 md:w-1/3 h-full bg-white shadow-lg transform transition-transform duration-300 z-50 ${
          navDrawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Close button */}
        <div className="flex justify-end p-4">
          <button onClick={toggleNavDrawer}>
            <IoMdClose className="size-6 text-gray-600 cursor-pointer" />
          </button>
        </div>

        {/* Navigation links */}
        <div className="p-4">
          <h2 className="text-xl font-semibold mb-4"> Menu </h2>
          <nav className="space-y-4">
            <Link
              to="/collections/all?gender=Men"
              onClick={toggleNavDrawer}
              className="block text-gray-600 hover:text-black"
            >
              Men
            </Link>
            <Link
              to="/collections/all?gender=Women"
              onClick={toggleNavDrawer}
              className="block text-gray-600 hover:text-black"
            >
              Women
            </Link>
            <Link
              to="/collections/all?category=Shirt"
              onClick={toggleNavDrawer}
              className="block text-gray-600 hover:text-black"
            >
              Shirts
            </Link>
            <Link
              to="/collections/all?category=Pants"
              onClick={toggleNavDrawer}
              className="block text-gray-600 hover:text-black"
            >
              Pants
            </Link>
          </nav>
        </div>
      </div>
    </>
  );
};

export default Navbar;
