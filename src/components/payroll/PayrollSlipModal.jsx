export default function PayrollSlipModal({ open, onClose, employee, month }) {
  if (!open) return null;

  const formatMoney = (v) => v.toLocaleString("vi-VN");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* OVERLAY */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* MODAL */}
      <div className="relative bg-white w-[720px] rounded-xl shadow-lg overflow-hidden">
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h2 className="text-lg font-semibold">Phiếu lương chi tiết</h2>
            <p className="text-sm text-gray-500">
              Tháng {month.replace("-", "/")}
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 space-y-6">
          {/* EMPLOYEE INFO */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <Info label="Mã nhân viên" value={employee.id} />
            <Info label="Họ tên" value={employee.name} />
            <Info label="Email" value={employee.email} />
            <Info label="Phòng ban" value={employee.department} />
          </div>

          {/* SALARY DETAIL */}
          <div className="border rounded-lg overflow-hidden">
            <div className="grid grid-cols-2 gap-4 p-4 text-sm">
              <Row
                label="Lương cơ bản"
                value={formatMoney(employee.baseSalary)}
              />
              <Row
                label="Phụ cấp & thưởng"
                value={`+ ${formatMoney(employee.allowance)}`}
                green
              />
              <Row
                label="Khấu trừ & thuế"
                value={`- ${formatMoney(employee.deduction)}`}
                red
              />
            </div>

            <div className="flex justify-between items-center px-4 py-3 bg-gray-50 border-t">
              <span className="font-medium">Thực nhận</span>
              <span className="text-lg font-semibold text-blue-600">
                {formatMoney(employee.net)}
              </span>
            </div>
          </div>

          {/* STATUS */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">Trạng thái:</span>
            {employee.status === "approved" ? (
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full">
                Đã duyệt
              </span>
            ) : (
              <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full">
                Chờ duyệt
              </span>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
          >
            Đóng
          </button>

          {/* ✅ NÚT ĐÃ DUYỆT (THAY GỬI MAIL) */}
          {employee.status !== "approved" && (
            <button
              className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">
                check_circle
              </span>
              Đã duyệt
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ===== COMPONENT PHỤ ===== */

function Info({ label, value }) {
  return (
    <div>
      <div className="text-gray-500">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
}

function Row({ label, value, green, red }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}</span>
      <span
        className={`font-medium ${
          green ? "text-green-600" : red ? "text-red-500" : ""
        }`}
      >
        {value}
      </span>
    </div>
  );
}