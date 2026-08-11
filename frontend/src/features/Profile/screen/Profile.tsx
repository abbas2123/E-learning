import { useAuth } from "../../../context/AuthContext";
import ProfileHero from "../components/ProfileHero";
import AccountSettings from "../components/AccountSettings";
import EnrolledCourses from "../components/EntrolledCousrses";
import Certificates from "../components/Certificates";
import PasswordSettings from "../components/PasswordSettings";

export default function Profile() {
  const { isLoggedIn, user } = useAuth();

  if (!isLoggedIn || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f8fa]">
        <h1 className="text-xl font-semibold text-red-500">
          Please login to view your profile.
        </h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#f5f8fa] px-4 pb-16 pt-28 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-[1280px]">
        {/* Profile Header */}
        <ProfileHero user={user} />

        {/* Main Content */}
        <div className="mt-5 grid w-full grid-cols-1 gap-5 lg:grid-cols-[275px_minmax(0,1fr)]">
          {/* Left */}
          <AccountSettings user={user} />

          {/* Right */}
          <div className="min-w-0">
            <EnrolledCourses />
            <Certificates />
          </div>
        </div>
        <div className="mt-5">
          <PasswordSettings isGoogleUser={user.authProvider === "google"} />
        </div>
      </div>
    </div>
  );
}
