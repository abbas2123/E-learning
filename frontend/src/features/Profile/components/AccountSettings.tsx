import { useState } from "react";
import { updateProfile } from "../service/ProfileService";
import { useAuth } from "../../../context/AuthContext";
import { toast } from "sonner";
interface AccountSettingsProps {
  user: {
    name: string;
    email: string;
    phone?: string;
    location?: string;
  };
}

export default function AccountSettings({ user }: AccountSettingsProps) {
  const { setUser } = useAuth();

  const [formData, setFormData] = useState({
    name: user.name,
    phone: user.phone || "",
    location: user.location || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await updateProfile(formData);
      console.log("res", res);
      // Update global user
      const updatedUser = res.user;

      // Update global user

      setUser(updatedUser);
      toast.success("profile updated successfully");
      // Update local form

      setFormData({
        name: updatedUser.name,

        phone: updatedUser.phone || "",

        location: updatedUser.location || "",
      });

      console.log("Profile updated:", updatedUser);
    } catch (error: any) {
      console.error("Profile update failed:", error);
      toast.error(
        `Profile update failed: ${error.message || "Something went wrong"}`,
      );
    }
  };

  return (
    <section className="h-fit rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-6 flex items-start justify-between gap-3">
        <h2 className="text-sm font-bold leading-tight text-[#252a43]">
          Account
          <br />
          Settings
        </h2>

        <span className="rounded-md bg-[#e9fbfb] px-2 py-1.5 text-[7px] font-bold uppercase tracking-wide text-[#53C4C8]">
          Student ID: 23095
        </span>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <FormField
            label="Full Name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
          />

          <FormField
            label="Email Address"
            name="email"
            type="email"
            value={user.email}
            disabled
            onChange={() => {}}
          />

          <FormField
            label="Phone Number"
            name="phone"
            type="text"
            placeholder="+91 1234567898"
            value={formData.phone}
            onChange={handleChange}
          />

          <FormField
            label="Location"
            name="location"
            type="text"
            placeholder="india,kerala"
            value={formData.location}
            onChange={handleChange}
          />
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            className="rounded-md border border-gray-200 bg-white px-4 py-2 text-[9px] font-semibold text-gray-600 transition hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="rounded-md bg-[#53C4C8] px-4 py-2 text-[9px] font-semibold text-white transition hover:bg-[#43b5b9]"
          >
            Change
          </button>
        </div>
      </form>
    </section>
  );
}

interface FormFieldProps {
  label: string;
  name: string;
  type: string;
  value: string;
  placeholder?: string;
  disabled?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function FormField({
  label,
  name,
  type,
  value,
  placeholder,
  disabled = false,
  onChange,
}: FormFieldProps) {
  return (
    <div>
      <label className="mb-1.5 block text-[8px] font-semibold text-[#3d4357]">
        {label}
      </label>

      <input
        name={name}
        type={type}
        value={value}
        disabled={disabled}
        onChange={onChange}
        placeholder={placeholder}
        className="h-9 w-full rounded-md border border-[#53C4C8]/60 bg-white px-3 text-[9px] text-gray-700 outline-none transition focus:border-[#53C4C8] focus:ring-2 focus:ring-[#53C4C8]/10 disabled:bg-gray-50 disabled:text-gray-400"
      />
    </div>
  );
}
