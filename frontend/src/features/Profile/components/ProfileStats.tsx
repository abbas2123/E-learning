export default function ProfileStats() {
  return (
    <div className="flex items-center gap-5 sm:gap-7">
      <Stat value="4" label="Enrolled" color="text-[#53C4C8]" />

      <Divider />

      <Stat value="2" label="Completed" color="text-[#53C4C8]" />

      <Divider />

      <Stat value="3" label="Certificates" color="text-orange-500" />
    </div>
  );
}

interface StatProps {
  value: string;
  label: string;
  color: string;
}

function Stat({ value, label, color }: StatProps) {
  return (
    <div className="min-w-[45px] text-center">
      <p className={`text-sm font-bold ${color}`}>{value}</p>

      <p className="mt-0.5 text-[8px] text-gray-400">{label}</p>
    </div>
  );
}

function Divider() {
  return <div className="h-8 w-px bg-gray-200" />;
}
