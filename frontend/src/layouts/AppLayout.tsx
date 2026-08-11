import { Outlet } from "react-router-dom";
import Navbar from "../features/Home/componets/header";
import FooterSection from "../features/Home/sections/FooterSection";

export default function AppLayout() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-white">
      {/* Full width navbar */}

      <header className="absolute inset-x-0 top-0 z-50 w-full bg-[#53C4C8]">
        <Navbar />
      </header>

      {/* Page content */}

      <main className="w-full flex-1">
        <Outlet />
      </main>

      {/* Footer */}

      <FooterSection />
    </div>
  );
}
