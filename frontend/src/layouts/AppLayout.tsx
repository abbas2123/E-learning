import { Outlet } from "react-router-dom";
import Navbar from "../features/Home/componets/header";
import FooterSection from "../features/Home/sections/FooterSection";

export default function AppLayout() {
  return (
    <div className="relative min-h-screen bg-white flex flex-col justify-between">
      {/* Global full-width Navbar — rendered once for ALL pages */}
      <header className="absolute inset-x-0 top-0 z-50 w-full px-6 sm:px-10 lg:px-12">
        <Navbar />
      </header>

      {/* Matched child route renders here */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Global Footer — rendered once for ALL pages inside the layout */}
      <FooterSection />
    </div>
  );
}
