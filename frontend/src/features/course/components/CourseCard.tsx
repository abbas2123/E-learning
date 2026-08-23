import { Clock, BookOpen, ArrowRight, Heart } from "lucide-react";
import { Rating } from "../../../components/ui/Rating";
import { Badge } from "../../../components/ui/Badge";
import { useState } from "react";
import wishlistService from "../../../services/wishlistService";
import { toast } from "sonner";
import { useAuth } from "../../../context/AuthContext";

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  category: string;
  level: "Beginner" | "Intermediate" | "Advanced" | string;
  duration: number;
  lessons?: number;
  lessonsCount?: number;
  price: number;
  originalPrice?: number;
  discountPrice?: number;
  rating?: number;
  reviewsCount?: number;
  instructor?: string;
}

interface CourseCardProps {
  course: Course;
  onClick?: (course: Course) => void;
}

const CourseCard = ({ course, onClick }: CourseCardProps) => {
  const { isLoggedIn } = useAuth();
  const [inWishlist, setInWishlist] = useState(false);

  const handleWishlistClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isLoggedIn) {
      toast.error("Please log in to save courses.");
      return;
    }
    try {
      if (inWishlist) {
        await wishlistService.removeFromWishlist(course.id);
        setInWishlist(false);
        toast.success("Removed from wishlist.");
      } else {
        await wishlistService.addToWishlist(course.id);
        setInWishlist(true);
        toast.success("Saved to wishlist!");
      }
    } catch {
      toast.error("Wishlist action failed.");
    }
  };

  return (
    <div
      onClick={() => onClick?.(course)}
      className="group relative cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl"
    >
      {/* Thumbnail */}
      <div className="relative h-48 overflow-hidden bg-slate-100">
        <img
          src={
            course.thumbnail ||
            "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80"
          }
          alt={course.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Level badge */}
        <div className="absolute left-3 top-3">
          <Badge variant="indigo" size="sm">
            {course.level || "Beginner"}
          </Badge>
        </div>

        {/* Wishlist Heart */}
        <button
          type="button"
          onClick={handleWishlistClick}
          className={`absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-md backdrop-blur-sm transition hover:scale-110 ${
            inWishlist ? "text-rose-500" : "text-slate-400 hover:text-rose-500"
          }`}
          title="Add to Wishlist"
        >
          <Heart size={16} fill={inWishlist ? "currentColor" : "none"} />
        </button>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Category & Rating */}
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
            {course.category}
          </span>
          <Rating
            value={course.rating || 4.9}
            reviewsCount={course.reviewsCount || 12}
            size="sm"
          />
        </div>

        {/* Title */}
        <h3 className="line-clamp-2 min-h-[52px] text-base font-bold leading-6 text-slate-900 transition-colors group-hover:text-indigo-600">
          {course.title}
        </h3>

        {/* Course stats */}
        <div className="mt-4 flex items-center gap-4 border-t border-slate-100 pt-3 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Clock size={14} className="text-slate-400" />
            <span>{course.duration || 10}h</span>
          </div>

          <div className="flex items-center gap-1.5">
            <BookOpen size={14} className="text-slate-400" />
            <span>{course.lessons ?? course.lessonsCount ?? 12} lessons</span>
          </div>
        </div>

        {/* Price & CTA */}
        <div className="mt-4 flex items-center justify-between">
          <div>
            <span className="text-lg font-extrabold text-slate-900">
              ₹{course.price.toLocaleString("en-IN")}
            </span>
            {course.originalPrice && (
              <span className="ml-1.5 text-xs text-slate-400 line-through">
                ₹{course.originalPrice.toLocaleString("en-IN")}
              </span>
            )}
          </div>

          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 text-white transition-all duration-300 group-hover:bg-indigo-600">
            <ArrowRight
              size={15}
              className="transition-transform duration-300 group-hover:translate-x-0.5"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
