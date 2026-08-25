import { Bell, CalendarDays, Gift, Heart, HelpCircle, LogOut, Settings, Star, UserRound, Wallet } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { NavLink, useNavigate } from "react-router-dom";
import { clearSession } from "../data/api";

const items = [
  [UserRound, "My Profile", "/profile"],
  [CalendarDays, "My Bookings", "/booking"],
  [CalendarDays, "Booking History", "/booking-history"],
  [Wallet, "My Wallet", "/profile"],
  [Star, "My Reviews", "/profile"],
  [Heart, "Loyalty Points", "/profile"],
  [Gift, "Offers & Coupons", "/salons/the-glam-studio/offers"],
  [Bell, "Notifications", "/profile"],
  [Settings, "Settings", "/profile"],
  [HelpCircle, "Help & Support", "/profile"]
];

export function ProfileSidebar() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  function handleLogout() {
    clearSession();
    queryClient.removeQueries();
    navigate("/login", { replace: true });
  }

  return (
    <aside className="hidden space-y-2 lg:block">
      {items.map(([Icon, label, to]) => (
        <NavLink key={String(label)} to={String(to)} className={({ isActive }) => `side-link ${isActive ? "active" : ""}`}>
          <Icon size={20} /> {String(label)}
        </NavLink>
      ))}
      <button className="side-link w-full text-left" type="button" onClick={handleLogout}>
        <LogOut size={20} /> Log Out
      </button>
      <div className="mt-8 rounded-lg bg-brand-50 p-6 text-center">
        <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-white text-brand-500"><Gift size={30} /></div>
        <strong>Glam Perks</strong>
        <p className="mt-2 text-sm text-muted">Join our membership and unlock exclusive benefits.</p>
        <button className="btn-primary mt-4 w-full">Join Now</button>
      </div>
    </aside>
  );
}
