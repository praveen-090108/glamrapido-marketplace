import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { BookingPage } from "./pages/BookingPage";
import { HistoryPage } from "./pages/HistoryPage";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { ProfilePage } from "./pages/ProfilePage";
import { SalonDetailPage } from "./pages/SalonDetailPage";
import { SalonListingPage } from "./pages/SalonListingPage";
import { SignupPage } from "./pages/SignupPage";
import { StylistProfilePage } from "./pages/StylistProfilePage";
import "./styles.css";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/salons" element={<SalonListingPage />} />
            <Route path="/salons/:slug" element={<SalonDetailPage tab="overview" />} />
            <Route path="/salons/:slug/services" element={<SalonDetailPage tab="services" />} />
            <Route path="/salons/:slug/stylists" element={<SalonDetailPage tab="stylists" />} />
            <Route path="/salons/:slug/offers" element={<SalonDetailPage tab="offers" />} />
            <Route path="/salons/:slug/reviews" element={<SalonDetailPage tab="reviews" />} />
            <Route path="/stylists/:slug" element={<StylistProfilePage />} />
            <Route path="/booking" element={<BookingPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/booking-history" element={<HistoryPage />} />
          </Route>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
