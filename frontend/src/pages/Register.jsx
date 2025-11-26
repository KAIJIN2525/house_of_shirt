import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import login from "../assets/login.webp";
import { registerUser, loginUser } from "../redux/slices/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { mergeCart } from "../redux/slices/cartSlice";
import { toast } from "sonner";
import { FaEye, FaEyeSlash, FaGoogle } from "react-icons/fa";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, guestId, loading, error } = useSelector((state) => state.auth);
  const { cart } = useSelector((state) => state.cart);

  // Get redirect parameter from URL
  const redirect = new URLSearchParams(location.search).get("redirect") || "/";
  const isCheckoutRedirect = redirect.includes("checkout");

  useEffect(() => {
    if (user) {
      if (cart?.products.length > 0 && guestId) {
        dispatch(mergeCart({ guestId, user })).then(() => {
          navigate(isCheckoutRedirect ? "/checkout" : "/");
        });
      } else {
        navigate(isCheckoutRedirect ? "/checkout" : "/");
      }
    }
  }, [user, guestId, cart, navigate, isCheckoutRedirect, dispatch]);

  // Validation function
  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!name.trim()) {
      newErrors.name = "Full name is required";
    } else if (name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    // Email validation
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long";
    } else if (!/(?=.*[a-z])/.test(password)) {
      newErrors.password =
        "Password must contain at least one lowercase letter";
    } else if (!/(?=.*[A-Z])/.test(password)) {
      newErrors.password =
        "Password must contain at least one uppercase letter";
    } else if (!/(?=.*\d)/.test(password)) {
      newErrors.password = "Password must contain at least one number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle field blur for real-time validation feedback
  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
    validateForm();
  };

  // Handle field change
  const handleFieldChange = (field, value) => {
    switch (field) {
      case "name":
        setName(value);
        break;
      case "email":
        setEmail(value);
        break;
      case "password":
        setPassword(value);
        break;
    }

    // Clear error for this field when user starts typing
    if (touched[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({ name: true, email: true, password: true });

    // Validate form
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    try {
      const result = await dispatch(
        registerUser({ name, email, password })
      ).unwrap();
      toast.success(
        "Registration successful! Please check your email to verify your account."
      );
    } catch (err) {
      console.error("Registration error:", err);

      // Handle different types of errors from backend
      let errorMessage = "Registration failed. Please try again.";
      const newErrors = {};

      if (err?.message) {
        errorMessage = err.message;
      } else if (typeof err === "string") {
        errorMessage = err;
      }

      // Handle specific validation errors
      if (errorMessage.toLowerCase().includes("user already exists")) {
        newErrors.email = "An account with this email already exists";
        toast.error("An account with this email already exists");
      }
      // Password validation errors
      else if (errorMessage.toLowerCase().includes("password")) {
        // Check for specific password requirements
        if (
          errorMessage.includes("minlength") ||
          errorMessage.includes("minimum") ||
          errorMessage.includes("shorter than") ||
          errorMessage.includes("at least 8 characters")
        ) {
          newErrors.password = "Password must be at least 8 characters long";
          toast.error("Password must be at least 8 characters long");
        } else if (errorMessage.toLowerCase().includes("uppercase")) {
          newErrors.password =
            "Password must contain at least one uppercase letter";
          toast.error("Password must contain at least one uppercase letter");
        } else if (errorMessage.toLowerCase().includes("lowercase")) {
          newErrors.password =
            "Password must contain at least one lowercase letter";
          toast.error("Password must contain at least one lowercase letter");
        } else if (
          errorMessage.toLowerCase().includes("number") ||
          errorMessage.toLowerCase().includes("digit")
        ) {
          newErrors.password = "Password must contain at least one number";
          toast.error("Password must contain at least one number");
        } else if (errorMessage.toLowerCase().includes("special character")) {
          newErrors.password =
            "Password must contain at least one special character";
          toast.error("Password must contain at least one special character");
        } else {
          newErrors.password = errorMessage;
          toast.error(errorMessage);
        }
      }
      // Email validation errors
      else if (errorMessage.toLowerCase().includes("email")) {
        if (
          errorMessage.toLowerCase().includes("valid email") ||
          errorMessage.toLowerCase().includes("invalid email")
        ) {
          newErrors.email = "Please enter a valid email address";
          toast.error("Please enter a valid email address");
        } else {
          newErrors.email = errorMessage;
          toast.error(errorMessage);
        }
      }
      // Name validation errors
      else if (errorMessage.toLowerCase().includes("name")) {
        newErrors.name = errorMessage;
        toast.error(errorMessage);
      }
      // Mongoose validation error format
      else if (err?.errors) {
        // Handle Mongoose validation errors
        Object.keys(err.errors).forEach((field) => {
          const fieldError = err.errors[field];
          if (field === "password") {
            if (fieldError.kind === "minlength") {
              newErrors.password =
                "Password must be at least 8 characters long";
            } else {
              newErrors.password =
                fieldError.message || "Password validation failed";
            }
          } else if (field === "email") {
            newErrors.email = fieldError.message || "Invalid email address";
          } else if (field === "name") {
            newErrors.name = fieldError.message || "Name is required";
          }
        });

        // Show the first error
        const firstError = Object.values(newErrors)[0];
        if (firstError) {
          toast.error(firstError);
        }
      }
      // Generic error
      else {
        toast.error(errorMessage);
      }

      // Set errors in state to display under form fields
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
      }
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

  const handlePasswordToggle = () => {
    setShowPassword((prev) => !prev);
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
              htmlFor="name"
            >
              Full Name
            </label>
            <input
              type="text"
              value={name}
              id="name"
              name="name"
              onChange={(e) => handleFieldChange("name", e.target.value)}
              onBlur={() => handleBlur("name")}
              className={`w-full p-2 border rounded ${
                touched.name && errors.name
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
              placeholder="Enter your name"
            />
            {touched.name && errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
          </div>

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
              onChange={(e) => handleFieldChange("email", e.target.value)}
              onBlur={() => handleBlur("email")}
              className={`w-full p-2 border rounded ${
                touched.email && errors.email
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
              placeholder="Enter your email address"
            />
            {touched.email && errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          <div className="mb-4 relative">
            <label
              className="block text-gray-700 text-sm font-semibold mb-2"
              htmlFor="password"
            >
              Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              id="password"
              name="password"
              onChange={(e) => handleFieldChange("password", e.target.value)}
              onBlur={() => handleBlur("password")}
              className={`w-full p-2 border rounded ${
                touched.password && errors.password
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
              placeholder="Enter your password"
            />
            <button
              onClick={handlePasswordToggle}
              type="button"
              className="absolute right-3 top-9 text-sm text-gray-600"
            >
              {showPassword ? (
                <FaEyeSlash className="size-5" />
              ) : (
                <FaEye className="size-5" />
              )}
            </button>
            {touched.password && errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
            {!errors.password && (
              <p className="text-gray-500 text-xs mt-1">
                Must be at least 8 characters with uppercase, lowercase, and a
                number
              </p>
            )}
          </div>

          <p className="text-xs text-gray-600 text-center mb-2">
            OR SIGN UP WITH:
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

          <button
            type="submit"
            className="w-full bg-black text-white p-3 rounded font-semibold hover:bg-gray-800 transition cursor-pointer"
          >
            {loading ? "Signing up..." : "Sign Up"}
          </button>

          <p className="mt-6 text-center text-sm">
            Already have an account?{" "}
            <Link
              to={`/login?redirect=${encodeURIComponent(redirect)}`}
              className="text-blue-600 "
            >
              Login
            </Link>
          </p>
        </form>
      </div>

      <div className="hidden md:block w-1/2 bg-gray-800">
        <div className="h-full flex-col justify-center items-center">
          <img
            src={login}
            alt="login to Account"
            className="w-full h-[750px] object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default Register;
