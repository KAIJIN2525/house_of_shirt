import React from "react";
import Header from "../Common/Header";
import Footer from "../Common/Footer";
import EmailVerificationBanner from "../Common/EmailVerificationBanner";
import { Outlet } from "react-router-dom";

const UserLayout = () => {
  return (
    <>
      {/* Header */}
      <Header />
      {/* Email Verification Banner */}
      <EmailVerificationBanner />
      {/* Main content */}
      <main>
        <Outlet />
      </main>
      {/* Footer */}
      <Footer />
    </>
  );
};

export default UserLayout;
