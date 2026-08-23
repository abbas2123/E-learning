import { useAuth } from "../../../context/AuthContext";
import AccountSettings from "../components/AccountSettings";
import PasswordSettings from "../components/PasswordSettings";

export default function SettingsPage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <main className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Account & Security Settings
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Update your personal details, profile avatar, and password credentials.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <AccountSettings user={user} />
          <PasswordSettings isGoogleUser={user.authProvider === "google"} />
        </div>
      </div>
    </main>
  );
}
