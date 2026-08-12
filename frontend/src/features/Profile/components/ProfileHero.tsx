import ProfileStats from "./ProfileStats";
import { useAuth } from "../../../context/AuthContext";
import { useState } from "react";
import { updateProfile } from "../service/ProfileService";
import { toast } from "sonner";
interface ProfileHeroProps {
  user: {
    name: string;
    avatar?: string;
  };
}

export default function ProfileHero({ user }: ProfileHeroProps) {
  const { setUser } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");

      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB.");

      return;
    }

    try {
      setIsUpdating(true);

      const res = await updateProfile({
        avatar: file,
      });

      console.log("res", res);

      setUser(res.user);

      toast.success("Avatar updated successfully!");
    } catch (error: unknown) {
      console.error("Avatar upload failed:", error);

      const message =
        error instanceof Error ? error.message : "Something went wrong";

      toast.error(`Failed to update profile picture: ${message}`);
    } finally {
      setIsUpdating(false);
    }
  };
  return (
    <section className="relative w-full rounded-xl border border-gray-100 bg-white shadow-sm">
      {/* Banner */}

      <div className="relative h-[135px] w-full overflow-hidden rounded-t-xl bg-gradient-to-r from-[#53C4C8] via-[#3b8998] to-[#242943] sm:h-[145px]">
        <div className="absolute -right-20 -top-32 h-[300px] w-[300px] rounded-full bg-white/5" />

        <div className="absolute right-20 top-10 h-32 w-32 rounded-full bg-white/[0.03]" />
      </div>

      {/* Avatar */}

      <div className="absolute left-6 top-[95px] z-20 sm:left-8 sm:top-[105px]">
        <label className="group relative block h-[82px] w-[82px] cursor-pointer">
          <div className="relative h-[82px] w-[82px]">
            <div className="h-[82px] w-[82px] overflow-hidden rounded-full border-[4px] border-white bg-[#53C4C8] shadow-md">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {user.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {isUpdating && (
              <div className="absolute inset-0 flex flex-col items-center justify-center rounded-full bg-black/60">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />

                <span className="mt-1 text-[7px] font-semibold text-white">
                  Updating...
                </span>
              </div>
            )}
          </div>

          {/* Hover overlay */}

          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
            <span className="text-xs font-semibold text-white">Change</span>
          </div>

          {/* File input */}

          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </label>
      </div>

      {/* User information */}

      <div className="flex min-h-[82px] flex-col justify-between gap-4 px-6 pb-4 pt-11 sm:flex-row sm:items-end sm:px-8 sm:pt-10">
        <div className="min-w-0">
          <h1 className="truncate text-lg font-bold text-[#252a43]">
            {user.name}
          </h1>

          <p className="mt-1 text-[10px] text-gray-400">
            UI/UX Design Student • Learning to build user-centered products
          </p>
        </div>

        <ProfileStats />
      </div>
    </section>
  );
}
