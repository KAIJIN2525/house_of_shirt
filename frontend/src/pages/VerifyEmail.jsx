import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loginUser } from "../redux/slices/authSlice";
import { toast } from "sonner";
import axios from "axios";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [status, setStatus] = useState("verifying"); // verifying, success, error
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get("token");

      if (!token) {
        setStatus("error");
        setMessage("Invalid verification link");
        return;
      }

      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/users/verify-email/${token}`
        );

        if (response.data.success) {
          setStatus("success");
          setMessage(response.data.message);
          toast.success("Email verified successfully!");

          // Update Redux state and localStorage
          const userInfo = JSON.parse(localStorage.getItem("userInfo"));
          if (userInfo) {
            const updatedUserInfo = { ...userInfo, isEmailVerified: true };
            localStorage.setItem("userInfo", JSON.stringify(updatedUserInfo));
            dispatch(loginUser(updatedUserInfo));
          }

          // Redirect to home page after 2 seconds
          setTimeout(() => {
            navigate("/", { replace: true });
          }, 2000);
        }
      } catch (error) {
        setStatus("error");
        setMessage(
          error.response?.data?.message || "Email verification failed"
        );
        toast.error("Verification failed");
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          {status === "verifying" && (
            <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          )}
          {status === "success" && (
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <svg
                className="w-10 h-10 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          )}
          {status === "error" && (
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <svg
                className="w-10 h-10 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-center mb-4">
          {status === "verifying" && "Verifying Your Email"}
          {status === "success" && "Email Verified!"}
          {status === "error" && "Verification Failed"}
        </h1>

        {/* Message */}
        <p className="text-gray-600 text-center mb-6">
          {status === "verifying" &&
            "Please wait while we verify your email address..."}
          {status === "success" && message}
          {status === "error" && message}
        </p>

        {/* Actions */}
        <div className="space-y-3">
          {status === "success" && (
            <Link
              to="/"
              className="block w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-lg font-medium text-center hover:from-purple-700 hover:to-indigo-700 transition-all"
            >
              Go to Home
            </Link>
          )}

          {status === "error" && (
            <>
              <Link
                to="/login"
                className="block w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-lg font-medium text-center hover:from-purple-700 hover:to-indigo-700 transition-all"
              >
                Go to Login
              </Link>
              <Link
                to="/register"
                className="block w-full border-2 border-purple-600 text-purple-600 py-3 rounded-lg font-medium text-center hover:bg-purple-50 transition-all"
              >
                Create New Account
              </Link>
            </>
          )}

          <Link
            to="/"
            className="block w-full text-gray-600 py-3 rounded-lg font-medium text-center hover:bg-gray-100 transition-all"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
