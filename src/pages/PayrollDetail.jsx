import { useState } from "react";
import { useParams } from "react-router-dom";
import PayrollSlipModal from "../components/payroll/PayrollSlipModal";

/* ================= MOCK DATA ================= */
const payrollByMonth = {
  "12-2023": {
    summary: {
      totalEmployee: 124,
      baseSalary: "1.250.000.000 đ",
      allowance: "150.000.000 đ",
      netSalary: "1.350.500.000 đ",
    },
    details: [
      {
        id: "NV001",
        name: "Nguyễn Văn A",
        email: "nguyen.a@company.com",
        department: "Kỹ thuật",
        baseSalary: 20000000,
        allowance: 2000000,
        deduction: 1000000,
        net: 21000000,
        status: "pending",
      },
      {
        id: "NV002",
        name: "Trần Thị B",
        email: "tran.b@company.com",
        department: "Marketing",
        baseSalary: 15000000,
        allowance: 1500000,
        deduction: 800000,
        net: 15700000,
        status: "approved",
      },
    ],
  },

  "11-2023": {
    summary: {
      totalEmployee: 118,
      baseSalary: "1.180.000.000 đ",
      allowance: "120.000.000 đ",
      netSalary: "1.260.000.000 đ",
    },
    details: [
      {
        id: "NV010",
        name: "Phạm Minh C",
        email: "pham.c@company.com",
        department: "Nhân sự",
        baseSalary: 12000000,
        allowance: 500000,
        deduction: 600000,
        net: 11900000,
        status: "approved",
      },
    ],
  },
};

const formatMoney = (v) => v.toLocaleString("vi-VN");

export default function PayrollDetail() {
  const { month } = useParams();

  const [openSlip, setOpenSlip] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const data = payrollByMonth[month];

  if (!data) {
    return (
      <div className="p-6 text-red-500">
        Không tìm thấy dữ liệu bảng lương
      </div>
    );
  }

  const { summary, details: payrollDetails } = data;

  const handleViewSlip = (emp) => {
    setSelectedEmployee(emp);
    setOpenSlip(true);
  };

  return (
    <>
      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold">
              Chi tiết Bảng lương – Tháng {month.replace("-", "/")}
            </h1>
            <p className="text-gray-500 mt-1">
              Quản lý và duyệt lương cho toàn bộ nhân viên trong kỳ
            </p>
          </div>

          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200">
              <span className="material-symbols-outlined">download</span>
              Xuất Excel
            </button>

            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
              <span className="material-symbols-outlined">check_circle</span>
              Duyệt & Thanh toán
            </button>
          </div>
        </div>

        {/* SUMMARY */}
        <div className="grid grid-cols-4 gap-4">
          <SummaryCard label="Tổng nhân viên" value={summary.totalEmployee} icon="groups" />
          <SummaryCard label="Tổng lương cơ bản" value={summary.baseSalary} icon="payments" />
          <SummaryCard label="Tổng phụ cấp & thưởng" value={summary.allowance} icon="redeem" />
          <SummaryCard
            label="Tổng thực nhận"
            value={summary.netSalary}
            icon="account_balance_wallet"
            highlight
          />
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 text-left">Mã NV</th>
                <th className="p-4 text-left">Nhân viên</th>
                <th className="p-4 text-left">Phòng ban</th>
                <th className="p-4 text-right">Lương cơ bản</th>
                <th className="p-4 text-right">Phụ cấp</th>
                <th className="p-4 text-right">Khấu trừ</th>
                <th className="p-4 text-right text-blue-600">Thực nhận</th>
                <th className="p-4 text-center">Trạng thái</th>
                <th className="p-4 text-center">Thao tác</th>
              </tr>
            </thead>

            <tbody>
              {payrollDetails.map((emp) => (
                <tr key={emp.id} className="border-t hover:bg-gray-50">
                  <td className="p-4 font-medium">{emp.id}</td>

                  <td className="p-4">
                    <div className="font-medium">{emp.name}</div>
                    <div className="text-xs text-gray-500">{emp.email}</div>
                  </td>

                  <td className="p-4">{emp.department}</td>

                  <td className="p-4 text-right">{formatMoney(emp.baseSalary)}</td>
                  <td className="p-4 text-right text-green-600">
                    + {formatMoney(emp.allowance)}
                  </td>
                  <td className="p-4 text-right text-red-500">
                    - {formatMoney(emp.deduction)}
                  </td>

                  <td className="p-4 text-right font-semibold text-blue-600">
                    {formatMoney(emp.net)}
                  </td>

                  <td className="p-4 text-center">
                    {emp.status === "approved" ? (
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full">
                        Đã duyệt
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full">
                        Chờ duyệt
                      </span>
                    )}
                  </td>

                  <td className="p-4 text-center">
                    <button
                      onClick={() => handleViewSlip(emp)}
                      className="text-gray-600 hover:text-blue-600"
                    >
                      <span className="material-symbols-outlined">visibility</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* POPUP PHIẾU LƯƠNG */}
      {openSlip && selectedEmployee && (
        <PayrollSlipModal
          open={openSlip}
          onClose={() => setOpenSlip(false)}
          employee={selectedEmployee}
          month={month}
        />
      )}
    </>
  );
}

/* ================= COMPONENT PHỤ ================= */

function SummaryCard({ label, value, icon, highlight }) {
  return (
    <div
      className={`rounded-xl border p-4 flex items-center gap-4 ${
        highlight ? "border-blue-400 bg-blue-50" : "bg-white"
      }`}
    >
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
          highlight ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"
        }`}
      >
        <span className="material-symbols-outlined">{icon}</span>
      </div>

      <div>
        <div className="text-sm text-gray-500">{label}</div>
        <div className={`text-xl font-semibold ${highlight ? "text-blue-600" : ""}`}>
          {value}
        </div>
      </div>
    </div>
  );
}