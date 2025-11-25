import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import signup from "../assets/register.webp";
import { loginUser } from "../redux/slices/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { mergeCart } from "../redux/slices/cartSlice";
import { toast } from "sonner";
import { FaGoogle } from "react-icons/fa";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, guestId, loading } = useSelector((state) => state.auth);
  const { cart } = useSelector((state) => state.cart);

  // Get redirect parameter from URL
  const redirect = new URLSearchParams(location.search).get("redirect") || "/";
  const isCheckoutRedirect = redirect.includes("checkout");

  useEffect(() => {
    if (user) {
      console.log("Redirecting...");
      if (cart?.products?.length > 0 && guestId) {
        dispatch(mergeCart({ guestId, user })).then(() => {
          navigate(isCheckoutRedirect ? "/checkout" : "/");
        });
      } else {
        navigate(isCheckoutRedirect ? "/checkout" : "/");
      }
    }
  }, [user, guestId, cart, navigate, isCheckoutRedirect, dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter email and password.");
      return;
    }
    setError("");

    try {
      const resultAction = await dispatch(loginUser({ email, password }));
      if (loginUser.fulfilled.match(resultAction)) {
        toast.success("Login successful.");
      } else if (loginUser.rejected.match(resultAction)) {
        const errorMessage =
          resultAction.payload.message ||
          "Login failed. Please check your credentials";
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again.");
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  const handleGoogleLogin = () => {
    const googleLoginWindow = window.open(
      `${import.meta.env.VITE_BACKEND_URL}/api/users/auth/google`,
      "_blank",
      "width=500,height=600"
    );

    const handleMessage = async (event) => {
      // Verify the origin
      const backendUrl =
        import.meta.env.VITE_BACKEND_URL || "http://localhost:9000";
      if (
        event.origin !== backendUrl &&
        event.origin !== window.location.origin
      ) {
        console.error("Invalid origin:", event.origin);
        return;
      }

      if (event.data.type === "oauth_complete") {
        // Close the popup window
        if (googleLoginWindow && !googleLoginWindow.closed) {
          googleLoginWindow.close();
        }

        try {
          // Save the token and user data to localStorage
          localStorage.setItem("userToken", event.data.token);
          localStorage.setItem("userInfo", JSON.stringify(event.data.user));

          // Dispatch with Google OAuth data
          await dispatch(
            loginUser({
              ...event.data.user,
              token: event.data.token,
              googleId: true, // Flag to indicate Google OAuth
            })
          ).unwrap();

          toast.success("Google login successful!");

          // Clean up listener
          window.removeEventListener("message", handleMessage);
        } catch (error) {
          console.error("Login error:", error);
          toast.error("Failed to complete login");
        }
      }
    };

    window.addEventListener("message", handleMessage);

    // Cleanup on unmount or if window closes
    const checkWindowClosed = setInterval(() => {
      if (googleLoginWindow && googleLoginWindow.closed) {
        clearInterval(checkWindowClosed);
        window.removeEventListener("message", handleMessage);
      }
    }, 1000);
  };

  return (
    <div className="flex">
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-8 md:p-12">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md bg-white rounded-lg border border-gray-300 p-6 shadow-sm"
        >
          <div className="flex justify-center mb-6">
            <img className="w-28" src="./house_of_shirt.png" alt="" />
          </div>
          <h2 className="text-2xl font-bold text-center mb-6">Hey there! 👋</h2>
          <p className="text-center mb-6">
            Enter your username and password to login
          </p>

          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-semibold mb-2"
              htmlFor="email"
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              id="email"
              name="email"
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="Enter your email address"
            />
          </div>

          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-semibold mb-2"
              htmlFor="password"
            >
              Password
            </label>
            <input
              type="password"
              value={password}
              id="password"
              name="password"
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="Enter your password"
            />
          </div>

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <button
            type="submit"
            className="w-full bg-black text-white p-3 rounded font-semibold hover:bg-gray-800 transition cursor-pointer"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>

          <p className="text-xs text-gray-600 text-center mb-2">
            OR SIGN IN WITH:
          </p>
          <div className="flex items-center justify-center w-full p-3 rounded font-semibold ">
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="bg-white text-gray-600 p-3 rounded font-semibold hover:bg-gray-100 transition cursor-pointer border border-gray-400"
            >
              <FaGoogle />
            </button>
          </div>

          <p className="mt-6 text-center text-sm">
            Don't have an account?{" "}
            <Link
              to={`/signup?redirect=${encodeURIComponent(redirect)}`}
              className="text-blue-600 "
            >
              Sign Up
            </Link>
          </p>
        </form>
      </div>

      <div className="hidden md:block w-1/2 bg-gray-800">
        <div className="h-full flex-col justify-center items-center">
          <img
            src={signup}
            alt="login to Account"
            className="w-full h-[750px] object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default Login;
