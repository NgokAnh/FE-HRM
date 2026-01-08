import React from "react";

const incomeItems = [
  { label: "Lương cơ bản", amount: "12.000.000 ₫" },
  { label: "Phụ cấp trách nhiệm", amount: "2.000.000 ₫" },
  { label: "Phụ cấp ăn trưa", amount: "730.000 ₫" },
  { label: "Thưởng hiệu quả", amount: "1.500.000 ₫" },
];

const deductionItems = [
  { label: "BHXH (8%)", amount: "960.000 ₫" },
  { label: "BHYT (1.5%)", amount: "180.000 ₫" },
  { label: "BHTN (1%)", amount: "120.000 ₫" },
  { label: "Thuế TNCN", amount: "450.000 ₫" },
];

export default function Payroll() {
  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen w-full flex justify-center">
      <div className="w-full max-w-5xl p-4 md:p-8">
        <div className="space-y-6">
          {/* Month & history */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-[#111418] dark:text-white cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 px-3 py-1.5 rounded-lg transition-colors">
              <span className="material-symbols-outlined text-[#637588] dark:text-gray-400">calendar_month</span>
              <span className="font-bold text-lg">Tháng 10, 2023</span>
              <span className="material-symbols-outlined text-[#637588] dark:text-gray-400 text-sm">expand_more</span>
            </div>
            <button className="text-primary text-sm font-semibold hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
              <span className="material-symbols-outlined text-[18px]">history</span>
              Lịch sử lương
            </button>
          </div>

          {/* Total salary card */}
          <div className="bg-gradient-to-br from-primary to-blue-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <span className="text-blue-100 font-medium">Tổng thực nhận</span>
                <span className="bg-white/20 px-2.5 py-1 rounded-md text-xs font-bold backdrop-blur-sm border border-white/10 shadow-sm flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">check_circle</span>
                  Đã thanh toán
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-2 tracking-tight">14.520.000 ₫</h2>
              <div className="flex items-center gap-2 text-blue-100 text-sm mt-4">
                <span className="material-symbols-outlined text-[18px]">schedule</span>
                <span>Chuyển khoản ngày 05/11/2023</span>
              </div>
            </div>
            <div className="absolute -right-10 -top-10 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          </div>

          {/* Income */}
          <div className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-sm border border-[#e5e7eb] dark:border-[#2a3441] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-[#e5e7eb] dark:border-[#2a3441] bg-green-50/50 dark:bg-green-900/10">
              <h4 className="text-lg font-bold text-[#111418] dark:text-white flex items-center gap-2">
                <div className="size-8 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">trending_up</span>
                </div>
                Thu nhập
              </h4>
              <span className="text-lg font-bold text-green-600 dark:text-green-400">16.230.000 ₫</span>
            </div>
            <div className="flex flex-col md:grid md:grid-cols-2">
              {incomeItems.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center p-4 border-b border-[#f0f2f4] dark:border-[#2a3441] last:border-0 hover:bg-[#f9fafb] dark:hover:bg-[#202b36] transition-colors">
                  <span className="text-[#637588] dark:text-gray-400">{item.label}</span>
                  <span className="font-semibold text-[#111418] dark:text-white">{item.amount}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Deductions */}
          <div className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-sm border border-[#e5e7eb] dark:border-[#2a3441] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-[#e5e7eb] dark:border-[#2a3441] bg-orange-50/50 dark:bg-orange-900/10">
              <h4 className="text-lg font-bold text-[#111418] dark:text-white flex items-center gap-2">
                <div className="size-8 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">trending_down</span>
                </div>
                Khấu trừ
              </h4>
              <span className="text-lg font-bold text-orange-600 dark:text-orange-400">-1.710.000 ₫</span>
            </div>
            <div className="flex flex-col md:grid md:grid-cols-2">
              {deductionItems.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center p-4 border-b border-[#f0f2f4] dark:border-[#2a3441] last:border-0 hover:bg-[#f9fafb] dark:hover:bg-[#202b36] transition-colors">
                  <span className="text-[#637588] dark:text-gray-400">{item.label}</span>
                  <span className="font-semibold text-[#111418] dark:text-white">{item.amount}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Attendance info */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 flex gap-4 border border-blue-100 dark:border-blue-900/50">
            <span className="material-symbols-outlined text-primary mt-0.5">info</span>
            <div className="flex flex-col gap-1">
              <span className="text-sm font-bold text-[#111418] dark:text-white">Thông tin công & phép</span>
              <p className="text-sm text-[#637588] dark:text-gray-300">
                Công chuẩn: 22 • Công thực tế: 22 • Phép đã dùng: 1
              </p>
            </div>
          </div>

          <div className="h-10"></div>
        </div>
      </div>
    </div>
  );
}