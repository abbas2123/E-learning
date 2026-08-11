interface AccountSettingsProps {
  user: {
    name: string;
    email: string;
  };
}

export default function AccountSettings({ user }: AccountSettingsProps) {
  return (
    <section className="h-fit rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      {/* Header */}
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

      {/* Form */}
      <div className="space-y-4">
        <FormField label="Full Name" type="text" defaultValue={user.name} />

        <FormField
          label="Email Address"
          type="email"
          defaultValue={user.email}
        />

        <FormField
          label="Phone Number"
          type="text"
          placeholder="+91 1234567898"
        />

        <FormField
          label="Location"
          type="text"
          placeholder="india,kerala"
        />
      </div>

      {/* Buttons */}
      <div className="mt-6 flex justify-end gap-2">
        <button
          type="button"
          className="rounded-md border border-gray-200 bg-white px-4 py-2 text-[9px] font-semibold text-gray-600 transition hover:bg-gray-50"
        >
          Cancel
        </button>

        <button
          type="button"
          className="rounded-md bg-[#53C4C8] px-4 py-2 text-[9px] font-semibold text-white transition hover:bg-[#43b5b9]"
        >
          Change
        </button>
      </div>
    </section>
  );
}

interface FormFieldProps {
  label: string;
  type: string;
  defaultValue?: string;
  placeholder?: string;
}

function FormField({ label, type, defaultValue, placeholder }: FormFieldProps) {
  return (
    <div>
      <label className="mb-1.5 block text-[8px] font-semibold text-[#3d4357]">
        {label}
      </label>

      <input
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="h-9 w-full rounded-md border border-[#53C4C8]/60 bg-white px-3 text-[9px] text-gray-700 outline-none transition focus:border-[#53C4C8] focus:ring-2 focus:ring-[#53C4C8]/10"
      />
    </div>
  );
}
