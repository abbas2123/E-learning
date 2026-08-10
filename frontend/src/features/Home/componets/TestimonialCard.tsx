import { FiStar } from "react-icons/fi";
import Button from "../../../components/Button";

type TestimonialCardProps = {
  quote: string;
  name: string;
  role: string;
  avatar?: string;
  rating?: number;
};

export default function TestimonialCard({
  quote,
  name,
  role,
  avatar = "/student.png",
  rating = 5,
}: TestimonialCardProps) {
  return (
    <div className="flex h-full flex-col justify-between rounded-[20px] border border-slate-200 bg-white p-6 shadow-md">
      <div>
        <div className="flex items-center gap-4">
          <img
            src={avatar}
            alt={name}
            className="h-14 w-14 rounded-full object-cover"
          />
          <div>
            <p className="font-semibold text-slate-900">{name}</p>
            <p className="mt-1 text-sm text-slate-600">{role}</p>
          </div>
        </div>

        <p className="mt-6 text-base leading-7 text-slate-700">“{quote}”</p>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center gap-1 text-yellow-400">
          {Array.from({ length: rating }).map((_, i) => (
            <FiStar key={i} className="h-4 w-4" />
          ))}
        </div>

        <Button variant="ghost">Read story</Button>
      </div>
    </div>
  );
}
