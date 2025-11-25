import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Loader from "../components/Common/Loader";
import {
  FiUser,
  FiMail,
  FiEdit2,
  FiSave,
  FiX,
  FiPackage,
  FiTruck,
  FiCheckCircle,
  FiClock,
  FiCalendar,
  FiEye,
  FiLogOut,
  FiShoppingBag,
} from "react-icons/fi";
import { toast } from "sonner";
import { logout, loginUser } from "../redux/slices/authSlice";
import { clearCart } from "../redux/slices/cartSlice";
import { fetchAllOrders } from "../redux/slices/orderSlice";

const Profile = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { orders, loading: ordersLoading } = useSelector(
    (state) => state.orders
  );

  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({
    name: "",
    email: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("userToken");

    if (!token) {
      dispatch(logout());
      dispatch(clearCart());
      navigate("/login");
    } else if (!user) {
      dispatch(loginUser({}));
    } else {
      // Set user data when available
      setEditedUser({
        name: user.name || "",
        email: user.email || "",
      });
      // Fetch orders
      dispatch(fetchAllOrders());
    }
  }, [user, navigate, dispatch]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedUser({
      name: user.name || "",
      email: user.email || "",
    });
  };

  const handleSave = async () => {
    try {
      // TODO: Implement update profile API call
      // For now, just show success message
      toast.success("Profile update functionality coming soon!");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedUser({
      name: user.name || "",
      email: user.email || "",
    });
  };

  const handleInputChange = (field, value) => {
    setEditedUser((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleOrderClick = (orderId) => {
    navigate(`/order/${orderId}`);
  };

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearCart());
    navigate("/login");
  };

  const getStatusIcon = (status) => {
    const normalizedStatus = status.toLowerCase();
    switch (normalizedStatus) {
      case "delivered":
        return <FiCheckCircle className="text-green-500" />;
      case "processing":
        return <FiClock className="text-amber-500" />;
      case "shipped":
        return <FiTruck className="text-blue-500" />;
      default:
        return <FiPackage className="text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    const normalizedStatus = status.toLowerCase();
    switch (normalizedStatus) {
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200";
      case "processing":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "shipped":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatPrice = (price) => {
    return `₦${price.toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // If there's no user, don't render the profile page
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 flex items-center justify-center">
        <Loader size="lg" text="Loading profile..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-slate-700 to-slate-800 rounded-3xl shadow-2xl p-8 mb-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-600/20 to-slate-700/10" />
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
              <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border-4 border-white/30">
                <FiUser className="text-6xl text-white" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-4xl font-bold mb-2 font-serif">
                  {user.name}
                </h1>
                <p className="text-slate-100 text-lg mb-4">
                  Fashion Enthusiast
                </p>
                <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <FiMail className="text-slate-200" />
                    <span>{user.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FiShoppingBag className="text-slate-200" />
                    <span>{orders?.length || 0} Orders</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleEdit}
                  className="px-6 py-3 bg-white/20 backdrop-blur-sm rounded-xl text-white font-medium hover:bg-white/30 transition-all duration-300 flex items-center justify-center space-x-2 border border-white/30"
                >
                  <FiEdit2 />
                  <span>Edit Profile</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="px-6 py-3 bg-red-600/80 backdrop-blur-sm rounded-xl text-white font-medium hover:bg-red-600 transition-all duration-300 flex items-center justify-center space-x-2 border border-red-500/30"
                >
                  <FiLogOut />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-100">
              <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center space-x-2">
                <FiUser className="text-slate-600" />
                <span>Profile Information</span>
              </h2>

              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedUser.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                    />
                  ) : (
                    <p className="text-slate-900 font-medium">{user.name}</p>
                  )}
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email Address
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={editedUser.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                      disabled
                    />
                  ) : (
                    <p className="text-slate-900 font-medium">{user.email}</p>
                  )}
                  {isEditing && (
                    <p className="text-xs text-slate-600 mt-1">
                      Email cannot be changed
                    </p>
                  )}
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-emerald-200">
                  <label className="block text-sm font-medium text-emerald-700 mb-2">
                    Account Role
                  </label>
                  <p className="text-emerald-900 font-medium capitalize">
                    {user.role || "Customer"}
                  </p>
                </div>

                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                  <label className="block text-sm font-medium text-emerald-700 mb-2">
                    Email Verification
                  </label>
                  <p className="text-emerald-900 font-medium">
                    {user.isEmailVerified || user.googleId ? (
                      <span className="flex items-center space-x-1 text-green-600">
                        <FiCheckCircle />
                        <span>Verified</span>
                      </span>
                    ) : (
                      <span className="text-amber-600">Not Verified</span>
                    )}
                  </p>
                </div>

                {isEditing && (
                  <div className="flex space-x-3 pt-4">
                    <button
                      onClick={handleSave}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl font-medium hover:from-emerald-700 hover:to-emerald-800 transition-all duration-300 flex items-center justify-center space-x-2"
                    >
                      <FiSave />
                      <span>Save Changes</span>
                    </button>
                    <button
                      onClick={handleCancel}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-all duration-300 flex items-center space-x-2"
                    >
                      <FiX />
                      <span>Cancel</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Order History */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-emerald-100">
              <h2 className="text-2xl font-bold text-emerald-800 mb-6 flex items-center space-x-2">
                <FiPackage className="text-emerald-600" />
                <span>Order History</span>
              </h2>

              {ordersLoading ? (
                <Loader size="md" text="Loading orders..." />
              ) : (
                <div className="space-y-4">
                  {orders && orders.length > 0 ? (
                    orders.map((order) => (
                      <div
                        key={order._id}
                        className="bg-emerald-50 rounded-xl p-6 border border-emerald-200 hover:shadow-lg transition-all duration-300 cursor-pointer group"
                        onClick={() => handleOrderClick(order._id)}
                      >
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                          <div className="flex items-center space-x-3 mb-2 md:mb-0">
                            <div className="p-2 bg-emerald-100 rounded-lg">
                              {getStatusIcon(order.status)}
                            </div>
                            <div>
                              <p className="font-bold text-emerald-900">
                                Order #{order._id.slice(-8).toUpperCase()}
                              </p>
                              <p className="text-sm text-emerald-700 flex items-center space-x-1">
                                <FiCalendar className="text-emerald-600" />
                                <span>{formatDate(order.createdAt)}</span>
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4 flex-wrap">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                                order.status
                              )}`}
                            >
                              {order.status}
                            </span>
                            <p className="text-lg font-bold text-emerald-800">
                              {formatPrice(
                                order.totalAmount || order.totalPrice
                              )}
                            </p>
                            <div className="flex items-center space-x-2 text-emerald-600 group-hover:text-emerald-800 transition-colors">
                              <FiEye />
                              <span className="text-sm">View Details</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          {order.orderItems &&
                            order.orderItems.slice(0, 2).map((item, index) => (
                              <div
                                key={index}
                                className="flex justify-between items-center text-sm"
                              >
                                <span className="text-emerald-900">
                                  {item.name} x{item.quantity}
                                </span>
                                <span className="text-emerald-700 font-medium">
                                  {formatPrice(item.price * item.quantity)}
                                </span>
                              </div>
                            ))}
                          {order.orderItems && order.orderItems.length > 2 && (
                            <p className="text-xs text-emerald-600">
                              +{order.orderItems.length - 2} more items
                            </p>
                          )}
                        </div>

                        <div className="mt-3 pt-3 border-t border-emerald-200">
                          <p className="text-xs text-emerald-600 flex items-center space-x-1">
                            <FiTruck />
                            <span>
                              Delivery:{" "}
                              {order.isFreeShipping ? (
                                <span className="font-bold text-emerald-600">
                                  FREE
                                </span>
                              ) : (
                                formatPrice(order.deliveryCost)
                              )}{" "}
                              to {order.shippingAddress?.city},{" "}
                              {order.shippingAddress?.state}
                            </span>
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FiPackage className="text-4xl text-emerald-600" />
                      </div>
                      <h3 className="text-lg font-medium text-emerald-800 mb-2">
                        No Orders Yet
                      </h3>
                      <p className="text-emerald-600 mb-4">
                        Start exploring our amazing collection!
                      </p>
                      <button
                        onClick={() => navigate("/")}
                        className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg hover:from-emerald-700 hover:to-emerald-800 transition-all duration-300"
                      >
                        Browse Products
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
