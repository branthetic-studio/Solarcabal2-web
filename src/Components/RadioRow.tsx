"use client";

interface RadioRowProps {
  checked: boolean;
  onChange: () => void;
  label: string;
  className?: string;
}

export default function RadioRow({
  checked,
  onChange,
  label,
  className = "",
}: RadioRowProps) {
  return (
    <div
      onClick={onChange}
      className={`
        flex items-center gap-3 p-4 rounded-lg cursor-pointer border transition-all duration-200
        ${checked ? "bg-red-50 border-blue-600" : "bg-gray-50 border-gray-300"}
        hover:bg-gray-100
        ${className}
      `}
    >
      <div
        className={`
          w-5 h-5 rounded-full border-2 flex items-center justify-center
          ${checked ? "border-blue-600" : "border-gray-400"}
        `}
      >
        {checked && <div className="w-3 h-3 rounded-full bg-blue-600"></div>}
      </div>

      <span className="font-medium text-gray-800">{label}</span>
    </div>
  );
}
