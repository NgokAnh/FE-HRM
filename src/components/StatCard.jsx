export default function StatCard({ title, value, positive, loading }) {
  return (
    <div className="p-4 bg-white rounded-xl shadow flex flex-col items-center justify-center">
      <div className="text-gray-500 mb-2">{title}</div>
      {loading ? (
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-gray-400"></div>
      ) : (
        <div className={`text-2xl font-bold ${positive ? "text-green-500" : ""}`}>
          {value}
        </div>
      )}
    </div>
  );
}