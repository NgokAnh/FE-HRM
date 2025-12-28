export default function EmployeeInfoForm({ value, onChange, placeholders }) {
  return (
    <div className="space-y-5">
      {/* Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="Họ và tên">
          <input
            value={value.fullname}
            onChange={(e) => onChange("fullname", e.target.value)}
            placeholder={placeholders?.fullname || "Nhập họ và tên"}
            className="w-full px-4 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-blue-200"
          />
        </Field>

        <Field label="Email">
          <input
            value={value.email}
            onChange={(e) => onChange("email", e.target.value)}
            placeholder={placeholders?.email || "Nhập email"}
            className="w-full px-4 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-blue-200"
          />
        </Field>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Field label="Số điện thoại">
          <input
            value={value.phone}
            onChange={(e) => onChange("phone", e.target.value)}
            placeholder={placeholders?.phone || "Nhập số điện thoại"}
            className="w-full px-4 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-blue-200"
          />
        </Field>

        <Field label="Ngày vào làm">
          <input
            type="date"
            value={value.hiredDate}
            onChange={(e) => onChange("hiredDate", e.target.value)}
            className="w-full px-4 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-blue-200"
          />
          {!value.hiredDate && placeholders?.hiredDate && (
            <div className="mt-1 text-xs text-gray-500">{placeholders.hiredDate}</div>
          )}
        </Field>

        <Field label="Trạng thái">
          <select
            value={String(value.status || "ACTIVE").toUpperCase()}
            onChange={(e) => onChange("status", e.target.value)}
            className="w-full px-4 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-blue-200 bg-white"
          >
            <option value="ACTIVE">Đang làm việc</option>
            <option value="INACTIVE">Đã nghỉ việc</option>
          </select>
        </Field>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="min-w-0">
      <div className="text-sm font-medium text-gray-700 mb-1">{label}</div>
      {children}
    </div>
  );
}
