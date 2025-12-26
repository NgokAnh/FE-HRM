export function Input({
  label,
  full,
  ...props
}) {
  return (
    <div className={full ? "col-span-2" : ""}>
      <label className="block text-sm font-medium mb-1">
        {label}
      </label>
      <input
        {...props}
        className="w-full px-4 py-2 border rounded-lg
        focus:ring-2 focus:ring-blue-500 outline-none"
      />
    </div>
  );
}