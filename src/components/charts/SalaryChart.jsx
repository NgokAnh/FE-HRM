export default function SalaryChart({ data }) {
  console.log("📊 SalaryChart data:", data);

  if (!data || data.length === 0) {
    return (
      <div className="text-sm text-gray-500 dark:text-gray-400">
        Chưa có dữ liệu lương
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <p className="text-gray-900 dark:text-white text-base font-semibold mb-4">
        Biến động Quỹ Lương (6 tháng)
      </p>

      <div className="relative h-[200px] flex items-end justify-between gap-3 px-2">
        {data.map((item, idx) => {
          const height = Math.max(item.heightPercent || 0, 2);

          return (
            <div
              key={idx}
              className="flex flex-col items-center justify-end gap-2 w-full h-full group"
            >
              <div
                className="w-full bg-primary/30 rounded-t relative transition-all"
                style={{ height: `${height}%` }}
              >
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                  {item.amount.toLocaleString()} đ
                </div>
              </div>

              <span
                className={`text-xs ${
                  idx === data.length - 1
                    ? "font-bold text-gray-900 dark:text-white"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {item.month}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}