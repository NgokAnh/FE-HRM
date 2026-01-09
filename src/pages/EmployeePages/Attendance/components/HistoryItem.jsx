import React from "react";

export default function HistoryItem({ date, status, inTime, outTime, total }) {
  const statusColors = {
    "Đúng giờ":
      "bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800",
    "Đi muộn":
      "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800",
    "Về sớm":
      "bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800",
  };

  return (
    <div className="p-4 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group cursor-default">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-bold text-gray-900 dark:text-white">
          {date}
        </span>
        {status && (
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
              statusColors[status] || statusColors["Đúng giờ"]
            }`}
          >
            {status}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider">
              Vào
            </span>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-green-500 text-sm">
                login
              </span>
              <span
                className={`text-base font-semibold ${
                  status === "Đi muộn"
                    ? "text-red-600 dark:text-red-400"
                    : "text-gray-900 dark:text-white"
                }`}
              >
                {inTime || "--:--"}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider">
              Ra
            </span>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-orange-500 text-sm">
                logout
              </span>
              <span
                className={`text-base font-semibold ${
                  status === "Về sớm"
                    ? "text-orange-600 dark:text-orange-400"
                    : "text-gray-900 dark:text-white"
                }`}
              >
                {outTime || "--:--"}
              </span>
            </div>
          </div>
        </div>

        <div className="text-right flex flex-col gap-0.5">
          <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider">
            Tổng
          </span>
          <p className="text-sm font-semibold text-primary">
            {total || "Đang tính..."}
          </p>
        </div>
      </div>
    </div>
  );
}
