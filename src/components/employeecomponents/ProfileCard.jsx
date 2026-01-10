import React from "react";

const ProfileCard = ({ employee, onChangePassword }) => (
  <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 bg-white p-4 rounded-xl shadow-sm mb-6">
    <div className="flex items-center gap-4">
      <div
        className="h-16 w-16 rounded-full bg-cover bg-center shadow-inner"
        style={{ backgroundImage: `url(${employee?.avatar || "https://via.placeholder.com/150"})` }}
      />
      <div className="flex flex-col">
        <p className="text-slate-900 font-bold text-base sm:text-lg">
          {employee?.position || "Kỹ sư phần mềm"}
        </p>
        <p className="text-slate-500 text-sm sm:text-base">
          MSNV: {employee?.id || "10293"}
        </p>
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

export default ProfileCard;