import { useState } from "react";
import { toast } from "sonner";
import { changePassword } from "../service/ProfileService";

interface PasswordSettingsProps {
  isGoogleUser: boolean;
}

export default function PasswordSettings({
  isGoogleUser,
}: PasswordSettingsProps) {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const handleChangePassword = async () => {
    // Validate empty fields
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields.");
      return;
    }

    // Validate new password length
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters.");
      return;
    }

    // Validate password confirmation
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    // Prevent using the same password
    if (currentPassword === newPassword) {
      toast.error("New password must be different from your current password.");
      return;
    }

    try {
      setIsLoading(true);

      await changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });

      toast.success("Password updated successfully!");

      // Clear fields after successful update
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      // Reset password visibility
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    } catch (error: any) {
      console.error("Password update failed:", error);

      toast.error(
        error?.message || "Failed to update password. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  /*
   * Google users don't have a local password.
   */
  if (isGoogleUser) {
    return (
      <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex items-start gap-4">
          {/* Google icon */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-50">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
              <path
                d="M21.35 12.23c0-.71-.06-1.4-.18-2.05H12v3.88h5.22a4.46 4.46 0 0 1-1.94 2.93v2.43h3.14c1.84-1.69 2.93-4.18 2.93-7.19Z"
                fill="#4285F4"
              />

              <path
                d="M12 21.6c2.63 0 4.84-.87 6.45-2.36l-3.14-2.43c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.51A9.74 9.74 0 0 0 12 21.6Z"
                fill="#34A853"
              />

              <path
                d="M6.54 13.7a5.84 5.84 0 0 1 0-3.73V7.46H3.3a9.75 9.75 0 0 0 0 8.75l3.24-2.51Z"
                fill="#FBBC05"
              />

              <path
                d="M12 5.94c1.43 0 2.72.49 3.73 1.45l2.8-2.8C16.83 3.01 14.63 2.1 12 2.1a9.74 9.74 0 0 0-8.7 5.36l3.24 2.51C7.31 7.66 9.46 5.94 12 5.94Z"
                fill="#EA4335"
              />
            </svg>
          </div>

          <div>
            <h2 className="text-sm font-bold text-[#252a43]">
              Password & Security
            </h2>

            <p className="mt-1 text-[10px] leading-relaxed text-gray-400">
              Your account is secured through Google. Password management is
              handled by Google and cannot be changed here.
            </p>

            <div className="mt-3 inline-flex items-center rounded-md bg-blue-50 px-2.5 py-1.5 text-[8px] font-semibold text-blue-600">
              Signed in with Google
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="mb-5">
        <h2 className="text-sm font-bold text-[#252a43]">
          Password & Security
        </h2>

        <p className="mt-1 text-[9px] text-gray-400">
          Update your password to keep your account secure.
        </p>
      </div>

      {/* Password fields */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Current password */}
        <PasswordInput
          label="Current Password"
          value={currentPassword}
          onChange={setCurrentPassword}
          show={showCurrentPassword}
          onToggle={() => setShowCurrentPassword((previous) => !previous)}
        />

        {/* New password */}
        <PasswordInput
          label="New Password"
          value={newPassword}
          onChange={setNewPassword}
          show={showNewPassword}
          onToggle={() => setShowNewPassword((previous) => !previous)}
        />

        {/* Confirm password */}
        <PasswordInput
          label="Confirm Password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          show={showConfirmPassword}
          onToggle={() => setShowConfirmPassword((previous) => !previous)}
        />
      </div>

      {/* Password hint */}
      <p className="mt-3 text-[8px] text-gray-400">
        Password must be at least 8 characters long.
      </p>

      {/* Button */}
      <div className="mt-5 flex justify-end">
        <button
          type="button"
          onClick={handleChangePassword}
          disabled={isLoading}
          className="rounded-md bg-[#53C4C8] px-4 py-2 text-[9px] font-semibold text-white transition hover:bg-[#43b5b9] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? "Updating..." : "Change Password"}
        </button>
      </div>
    </section>
  );
}

interface PasswordInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  show: boolean;
  onToggle: () => void;
}

function PasswordInput({
  label,
  value,
  onChange,
  show,
  onToggle,
}: PasswordInputProps) {
  return (
    <div>
      {/* Label */}
      <label className="mb-1.5 block text-[8px] font-semibold text-[#3d4357]">
        {label}
      </label>

      <div className="relative">
        {/* Password input */}
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="••••••••"
          autoComplete="new-password"
          className="h-9 w-full rounded-md border border-[#53C4C8]/60 bg-white px-3 pr-9 text-[9px] text-gray-700 outline-none transition focus:border-[#53C4C8] focus:ring-2 focus:ring-[#53C4C8]/10"
        />

        {/* Show / hide button */}
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? (
            <svg
              className="h-3.5 w-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 3l18 18"
              />

              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.58 10.58a2 2 0 0 0 2.83 2.83"
              />

              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.88 4.24A9.77 9.77 0 0 1 12 4c5 0 8.27 4.5 9 8-.23 1.1-.68 2.18-1.32 3.17"
              />

              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.61 6.61C4.62 7.96 3.4 10.12 3 12c.73 3.5 4 8 9 8 1.61 0 3.05-.45 4.29-1.2"
              />
            </svg>
          ) : (
            <svg
              className="h-3.5 w-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z"
              />

              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
