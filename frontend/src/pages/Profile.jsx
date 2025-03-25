import React, { useEffect } from "react";
import MyOrders from "./MyOrders";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout, loginUser } from "../redux/slices/authSlice";
import { clearCart } from "../redux/slices/cartSlice";

const Profile = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem("userToken");

    if (!token) {
      // If the token is missing, clear the user state and redirect to login
      dispatch(logout());
      dispatch(clearCart());
      navigate("/login");
    } else if (!user) {
      // If there's no user in Redux state, fetch the user data
      dispatch(loginUser({})); // Pass empty object or necessary data
    }
  }, [user, navigate, dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearCart());
    navigate("/login");
  };

  // If there's no user, don't render the profile page
  if (!user) {
    return null; // or a loading spinner
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow container mx-auto p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:space-x-6 space-y-6 md:space-y-0">
          {/* Left Section */}
          <div className="w-full md:w-1/3 lg:w-1/4 shadow-md rounded-lg p-6">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              {user?.name}
            </h2>
            <p className="text-gray-600 text-lg mb-4">{user?.email}</p>
            <button
              onClick={handleLogout}
              className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>

          {/* Right Section */}
          <div className="w-full md:w-2/3 lg:w-3/4 shadow-md rounded-lg p-6">
            <MyOrders />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
