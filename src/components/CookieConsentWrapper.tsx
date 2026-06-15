"use client";

import React, { useEffect, useState } from "react";
import { BannerCookie } from "./ui/banner-cookie";

export function CookieConsentWrapper() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user already made a choice
    const hasConsent = localStorage.getItem("cookie-consent");
    if (!hasConsent) {
      // Small delay so it animates in nicely after page load
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    // Optionally trigger analytics scripts here
  };

  const handleDecline = () => {
    localStorage.setItem("cookie-consent", "declined");
    // Handle rejecting analytics
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-6 left-6 z-[9999]">
      <BannerCookie onAccept={handleAccept} onDecline={handleDecline} />
    </div>
  );
}
