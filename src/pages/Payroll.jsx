import { useState } from "react";
import { useNavigate } from "react-router-dom";

/* ================= MOCK DATA ================= */
const payrolls = [
  {
    id: 1,
    monthKey: "12-2023",
    name: "Tháng 12/2023",
    fiscalYear: "Năm tài chính 2023",
    status: "processing",
    totalEmployee: 154,
    totalSalary: "3,450,000,000đ",
    paidDate: "--",
  },
  {
    id: 2,
    monthKey: "11-2023",
    name: "Tháng 11/2023",
    fiscalYear: "Năm tài chính 2023",
    status: "paid",
    totalEmployee: 152,
    totalSalary: "3,380,000,000đ",
    paidDate: "05/12/2023",
  },
  {
    id: 3,
    monthKey: "10-2023",
    name: "Tháng 10/2023",
    fiscalYear: "Năm tài chính 2023",
    status: "paid",
    totalEmployee: 148,
    totalSalary: "3,250,000,000đ",
    paidDate: "05/11/2023",
  },
];

export default function Payroll() {
  const navigate = useNavigate();
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Bảng lương</h1>

        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200">
            <span className="material-symbols-outlined">download</span>
            Xuất file
          </button>

          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
            <span className="material-symbols-outlined">add</span>
            Tạo kỳ lương mới
          </button>
        </div>
      </div>

      {/* FILTER */}
      <div className="bg-white rounded-xl p-6 border space-y-4">
        <div className="flex gap-4">
          <div className="flex-1 flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg">
            <span className="material-symbols-outlined text-gray-500">
              search
            </span>
            <input
              className="bg-transparent outline-none flex-1"
              placeholder="Tìm theo tên kỳ lương (VD: Tháng 12)..."
            />
          </div>

          <button className="px-4 py-2 rounded-lg bg-gray-100">
            Xóa bộ lọc
          </button>

          <button className="px-4 py-2 rounded-lg bg-blue-600 text-white">
            Áp dụng
          </button>
        </div>

        <div className="flex gap-3">
          <FilterSelect label="Năm" />
          <FilterSelect label="Trạng thái" />
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="p-4">
                <input type="checkbox" />
              </th>
              <th className="p-4 text-left">Kỳ lương</th>
              <th className="p-4 text-left">Trạng thái</th>
              <th className="p-4 text-center">Tổng nhân viên</th>
              <th className="p-4 text-right">Tổng quỹ lương</th>
              <th className="p-4 text-center">Ngày chi trả</th>
              <th className="p-4 text-center">Hành động</th>
            </tr>
          </thead>

          <tbody>
            {payrolls.map((item) => (
              <tr
                key={item.id}
                className="border-t hover:bg-gray-50"
              >
                <td className="p-4">
                  <input type="checkbox" />
                </td>

                <td className="p-4">
                  <div className="font-medium">{item.name}</div>
                  <div className="text-xs text-gray-500">
                    {item.fiscalYear}
                  </div>
                </td>

                <td className="p-4">
                  {item.status === "processing" ? (
                    <span className="px-3 py-1 text-yellow-700 bg-yellow-100 rounded-full">
                      Đang xử lý
                    </span>
                  ) : (
                    <span className="px-3 py-1 text-green-700 bg-green-100 rounded-full">
                      Đã chi trả
                    </span>
                  )}
                </td>

                <td className="p-4 text-center">
                  {item.totalEmployee}
                </td>

                <td className="p-4 text-right font-medium">
                  {item.totalSalary}
                </td>

                <td className="p-4 text-center text-gray-500">
                  {item.paidDate}
                </td>

                <td className="p-4 text-center">
                  <button
                    onClick={() => navigate(`/admin/payroll/${item.monthKey}`)
}
                    className="text-blue-600 hover:underline"
                  >
                    Xem chi tiết
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* PAGINATION */}
        <div className="flex items-center justify-between p-4 text-sm text-gray-600">
          Hiển thị <b>1-3</b> trên <b>100</b>

          <div className="flex items-center gap-1">
            <PaginationBtn icon="chevron_left" />
            <PaginationBtn label="1" />
            <PaginationBtn label="2" active />
            <PaginationBtn label="3" />
            <PaginationBtn icon="chevron_right" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------- COMPONENT PHỤ -------- */

function FilterSelect({ label }) {
  return (
    <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
      {label}
      <span className="material-symbols-outlined text-[18px]">
        expand_more
      </span>
    </button>
  );
}

function PaginationBtn({ label, icon, active }) {
  return (
    <button
      className={`w-8 h-8 rounded border flex items-center justify-center
        ${
          active
            ? "bg-blue-600 text-white border-blue-600"
            : "bg-white"
        }`}
    >
      {icon ? (
        <span className="material-symbols-outlined text-[18px]">
          {icon}
        </span>
      ) : (
        label
      )}
    </button>
  );
}