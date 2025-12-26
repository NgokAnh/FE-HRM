
export default function StatCard({
  title,
  value,
  percent,
  positive = false,
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <p className="text-sm text-gray-500 mb-1">{title}</p>

      <p className="text-3xl font-bold text-gray-900">{value}</p>

      {percent && (
        <p
          className={`text-sm font-medium mt-1 ${
            positive ? "text-green-600" : "text-red-600"
          }`}
        >
          {percent}
        </p>
      )}
    </div>
  );
}