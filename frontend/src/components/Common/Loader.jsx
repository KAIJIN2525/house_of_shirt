const Loader = ({ size = "md", text = "", className = "" }) => {
  const sizeClasses = {
    sm: "w-5 h-5 border-2",
    md: "w-10 h-10 border-3",
    lg: "w-16 h-16 border-4",
    xl: "w-24 h-24 border-[5px]",
  };

  const containerPadding = {
    sm: "p-4",
    md: "p-8",
    lg: "p-12",
    xl: "p-16",
  };

  return (
    <div
      className={`flex flex-col items-center justify-center ${containerPadding[size]} ${className}`}
    >
      <div className="relative">
        {/* Outer spinning ring */}
        <div
          className={`${sizeClasses[size]} border-slate-200 border-t-slate-800 rounded-full animate-spin`}
        />
        {/* Inner pulsing dot */}
        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${
            size === "sm"
              ? "w-1.5 h-1.5"
              : size === "md"
              ? "w-2.5 h-2.5"
              : size === "lg"
              ? "w-4 h-4"
              : "w-6 h-6"
          } bg-slate-800 rounded-full animate-pulse`}
        />
      </div>
      {text && (
        <p
          className={`mt-4 text-slate-600 font-medium ${
            size === "sm"
              ? "text-xs"
              : size === "md"
              ? "text-sm"
              : size === "lg"
              ? "text-base"
              : "text-lg"
          }`}
        >
          {text}
        </p>
      )}
    </div>
  );
};

export default Loader;
