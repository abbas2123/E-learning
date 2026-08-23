import { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import ProfileHero from "../components/ProfileHero";
import ProfileStats from "../components/ProfileStats";
import AccountSettings from "../components/AccountSettings";
import EnrolledCourses from "../components/EnrolledCourses";
import Certificates from "../components/Certificates";
import PasswordSettings from "../components/PasswordSettings";
import PaymentHistory from "../components/PaymentHistory";
import Wishlist from "../components/Wishlist";
import {
  User as UserIcon,
  BookOpen,
  Heart,
  Award,
  CreditCard,
  Settings,
} from "lucide-react";

type ProfileTab =
  | "overview"
  | "courses"
  | "wishlist"
  | "certificates"
  | "payments"
  | "settings";

export default function Profile() {
  const { isLoggedIn, user } = useAuth();
  const [activeTab, setActiveTab] = useState<ProfileTab>("overview");

  if (!isLoggedIn || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <h1 className="text-xl font-semibold text-rose-500">
          Please login to view your profile.
        </h1>
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: UserIcon },
    { id: "courses", label: "Enrolled Courses", icon: BookOpen },
    { id: "wishlist", label: "Wishlist", icon: Heart },
    { id: "certificates", label: "Certificates", icon: Award },
    { id: "payments", label: "Payments & Receipts", icon: CreditCard },
    { id: "settings", label: "Account Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen w-full bg-slate-50 px-4 pb-16 pt-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        {/* Profile Header */}
        <ProfileHero user={user} />

        {/* Navigation Tabs */}
        <div className="mt-8 flex flex-wrap gap-2 border-b border-slate-200 pb-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as ProfileTab)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Contents */}
        <div className="mt-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <ProfileStats />
              <EnrolledCourses />
              <Wishlist />
            </div>
          )}

          {activeTab === "courses" && <EnrolledCourses />}

          {activeTab === "wishlist" && <Wishlist />}

          {activeTab === "certificates" && <Certificates />}

          {activeTab === "payments" && <PaymentHistory />}

          {activeTab === "settings" && (
            <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
              <AccountSettings user={user} />
              <PasswordSettings isGoogleUser={user.authProvider === "google"} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
