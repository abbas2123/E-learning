type AuthMode = "login" | "register";

type AuthTabsProps = {
  activeMode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
};

export default function AuthTabs({ activeMode, onModeChange }: AuthTabsProps) {
  return (
    <div className="inline-flex rounded-full bg-[#49BBBD]/20 p-1.5 backdrop-blur-md">
      <button
        type="button"
        onClick={() => onModeChange("login")}
        className={`rounded-full px-8 py-2.5 text-sm font-semibold transition-all duration-300 ${
          activeMode === "login"
            ? "bg-[#49BBBD] text-white shadow-md shadow-[#49BBBD]/30"
            : "text-[#49BBBD] hover:text-slate-800"
        }`}
      >
        Login
      </button>

      <button
        type="button"
        onClick={() => onModeChange("register")}
        className={`rounded-full px-8 py-2.5 text-sm font-semibold transition-all duration-300 ${
          activeMode === "register"
            ? "bg-[#49BBBD] text-white shadow-md shadow-[#49BBBD]/30"
            : "text-[#49BBBD] hover:text-slate-800"
        }`}
      >
        Register
      </button>
    </div>
  );
}
