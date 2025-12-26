export function Select({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">
        {label}
      </label>
      <select
        className="w-full px-4 py-2 border rounded-lg
        focus:ring-2 focus:ring-blue-500 outline-none bg-white"
      >
        {children}
      </select>
    </div>
  );
}