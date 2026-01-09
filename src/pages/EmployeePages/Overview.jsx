import React, { useState } from "react";

/* ================= ProfileCard ================= */
const ProfileCard = ({ employee, onChangePassword }) => (
  <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 bg-white p-4 rounded-xl shadow-sm mb-6">
    <div className="flex items-center gap-4">
      <div
        className="h-16 w-16 rounded-full bg-cover bg-center shadow-inner"
        style={{ backgroundImage: `url(${employee?.avatar || "https://via.placeholder.com/150"})` }}
      />
      <div className="flex flex-col">
        <p className="text-slate-900 font-bold text-base sm:text-lg">{employee?.position || "Kỹ sư phần mềm"}</p>
        <p className="text-slate-500 text-sm sm:text-base">MSNV: {employee?.id || "10293"}</p>
      </div>
    </div>
    <button
      onClick={onChangePassword}
      className="mt-2 sm:mt-0 px-4 py-2 bg-primary text-white rounded-xl shadow hover:bg-blue-600 transition-colors text-sm sm:text-base"
    >
      Đổi mật khẩu
    </button>
  </div>
);

/* ================= ChangePasswordForm ================= */
const ChangePasswordForm = ({ onClose }) => {
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newPass !== confirmPass) {
      alert("Mật khẩu mới và xác nhận không khớp!");
      return;
    }
    // Gọi API đổi mật khẩu tại đây
    alert("Đổi mật khẩu thành công!");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-lg w-full max-w-md p-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Đổi mật khẩu</h3>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="password"
            placeholder="Mật khẩu cũ"
            value={oldPass}
            onChange={(e) => setOldPass(e.target.value)}
            className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-slate-900 dark:text-white"
            required
          />
          <input
            type="password"
            placeholder="Mật khẩu mới"
            value={newPass}
            onChange={(e) => setNewPass(e.target.value)}
            className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-slate-900 dark:text-white"
            required
          />
          <input
            type="password"
            placeholder="Xác nhận mật khẩu mới"
            value={confirmPass}
            onChange={(e) => setConfirmPass(e.target.value)}
            className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-slate-900 dark:text-white"
            required
          />
          <div className="flex justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-gray-200 dark:bg-gray-700 text-slate-700 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-primary text-white hover:bg-blue-600 transition-colors"
            >
              Lưu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ================= CheckInButton ================= */
const CheckInButton = () => (
  <button className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-primary to-blue-400 rounded-xl shadow-lg mb-6 text-white">
    <div className="flex items-center gap-3">
      <div className="h-12 w-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
        <span className="material-symbols-outlined text-2xl sm:text-3xl">fingerprint</span>
      </div>
      <div className="flex flex-col items-start">
        <span className="font-bold text-sm sm:text-base">Chấm công ngay</span>
        <span className="text-xs sm:text-sm text-blue-100">08:30 AM - Vào ca</span>
      </div>
    </div>
    <span className="material-symbols-outlined text-xl sm:text-2xl">arrow_forward</span>
  </button>
);

/* ================= StatsGrid ================= */
const StatsGrid = () => {
  const stats = [
    { label: "Ngày công", value: "20/22", icon: "calendar_month", bg: "green-100", color: "green-600" },
    { label: "Đi muộn", value: "1", icon: "timer", bg: "orange-100", color: "orange-600" },
    { label: "Về sớm", value: "0", icon: "alarm", bg: "red-100", color: "red-600" },
    { label: "Lương tạm tính", value: "12,500,000 ₫", icon: "payments", bg: "blue-100", color: "blue-600" },
    { label: "Làm thêm giờ", value: "5h", icon: "work_history", bg: "purple-100", color: "purple-600" },
  ];

  return (
    <div className="mb-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {stats.map((s) => (
        <div key={s.label} className="bg-white p-4 rounded-xl shadow-sm flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-md bg-${s.bg}`}>
              <span className={`material-symbols-outlined text-lg text-${s.color}`}>{s.icon}</span>
            </div>
            <span className="text-slate-500 text-xs sm:text-sm font-medium">{s.label}</span>
          </div>
          <p className="text-slate-900 text-xl sm:text-2xl font-bold">{s.value}</p>
        </div>
      ))}
    </div>
  );
};

/* ================= NextShiftCard ================= */
const NextShiftCard = () => (
  <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
    <p className="text-slate-500 text-xs sm:text-sm font-medium mb-2">Ca làm tiếp theo</p>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-slate-900 font-bold">08:30 AM - 05:30 PM</p>
        <p className="text-slate-500 text-xs sm:text-sm">Thứ 4, 10/01/2026</p>
      </div>
      <span className="material-symbols-outlined text-blue-600 text-3xl sm:text-4xl">
        calendar_today
      </span>
    </div>
  </div>
);

/* ================= Overview Page ================= */
export default function Overview() {
  const employee = { id: "10293", position: "Kỹ sư phần mềm", avatar: "https://via.placeholder.com/150" };
  const [showChangePassword, setShowChangePassword] = useState(false);

  return (
    <div className="flex-1 px-4 sm:px-6 lg:px-8 py-6 relative">
      <ProfileCard employee={employee} onChangePassword={() => setShowChangePassword(true)} />
      <CheckInButton />
      <StatsGrid />
      <NextShiftCard />

      {showChangePassword && <ChangePasswordForm onClose={() => setShowChangePassword(false)} />}
    </div>
  );
}