import { useEffect, useState } from "react";
import FormSection from "../common/FormSection";
import { Input } from "../common/Input";
import { getEmployee } from "../../api/employeeApi";

export default function EmployeeShiftSalaryForm({ value, onChange }) {
  const [loading, setLoading] = useState(false);

  // --- Load dữ liệu khi edit ---
  useEffect(() => {
    console.log("🔍 [EmployeeSalaryForm] value changed:", value);
    if (!value?.id) {
      console.log("⚠️ [EmployeeSalaryForm] No ID, skip loading");
      return;
    }
    console.log("📡 [EmployeeSalaryForm] Loading employee ID:", value.id);
    loadEmployee(value.id);
  }, [value?.id]);

  const loadEmployee = async (id) => {
    setLoading(true);
    try {
      const data = await getEmployee(id);
      console.log("📦 [EmployeeSalaryForm] Employee data received:", data);

      onChange("salaryType", "shift");
      onChange("note", data.currentSalaryType?.note || "");

      // Khởi tạo mặc định cho ca
      const rates = {
        baseSalaryWeekday: "",
        baseSalarySaturday: "",
        baseSalarySunday: "",
        baseSalaryHoliday: "",
      };

      // Backend trả về activeShiftRates (không phải empShiftRates)
      (data.activeShiftRates || []).forEach((r) => {
        switch (r.dayType) {
          case "WEEKDAY":
            rates.baseSalaryWeekday = r.baseRate;
            break;
          case "SATURDAY":
            rates.baseSalarySaturday = r.baseRate;
            break;
          case "SUNDAY":
            rates.baseSalarySunday = r.baseRate;
            break;
          case "HOLIDAY":
            rates.baseSalaryHoliday = r.baseRate;
            break;
          default:
            break;
        }
      });

      console.log("📊 [EmployeeSalaryForm] Parsed rates:", rates);
      onChange("baseSalaryWeekday", rates.baseSalaryWeekday);
      onChange("baseSalarySaturday", rates.baseSalarySaturday);
      onChange("baseSalarySunday", rates.baseSalarySunday);
      onChange("baseSalaryHoliday", rates.baseSalaryHoliday);

      // OT chung, chỉ rateMultiplier
      console.log("🔎 [EmployeeSalaryForm] empOtRates:", data.empOtRates);
      const otRate = (data.empOtRates || []).find(
        (r) => r.otType === "ALL_OT"
      );
      console.log("💰 [EmployeeSalaryForm] OT rate found:", otRate);
      onChange("otRate", otRate?.rateMultiplier || 1.5); // default 1.5 nếu chưa có

      console.log("💵 [EmployeeSalaryForm] Allowance:", data.allowance);
      onChange("allowance", data.allowance || "");
    } catch (err) {
      console.error("[EmployeeShiftSalaryForm] Load error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p className="p-8 text-center">Đang tải...</p>;

  return (
    <div className="space-y-8">
      <FormSection title="Loại lương">
        <Input label="Hình thức trả lương" value="Theo ca" disabled />
      </FormSection>

      <FormSection title="Mức lương theo ca">
        <div className="grid grid-cols-4 gap-6">
          <Input
            label="Ngày thường (VNĐ/ca)"
            type="number"
            value={value.baseSalaryWeekday || ""}
            onChange={(e) => onChange("baseSalaryWeekday", e.target.value)}
          />
          <Input
            label="Thứ 7 (VNĐ/ca)"
            type="number"
            value={value.baseSalarySaturday || ""}
            onChange={(e) => onChange("baseSalarySaturday", e.target.value)}
          />
          <Input
            label="Chủ nhật (VNĐ/ca)"
            type="number"
            value={value.baseSalarySunday || ""}
            onChange={(e) => onChange("baseSalarySunday", e.target.value)}
          />
          <Input
            label="Ngày lễ (VNĐ/ca)"
            type="number"
            value={value.baseSalaryHoliday || ""}
            onChange={(e) => onChange("baseSalaryHoliday", e.target.value)}
          />
        </div>
      </FormSection>

      <FormSection title="Tăng ca (OT)">
        <Input
          label="Hệ số OT"
          type="number"
          step="0.1"
          min="1"
          placeholder="Nhập hệ số OT, ví dụ 1.5"
          value={value.otRate || 1.5}
          onChange={(e) => onChange("otRate", e.target.value)}
        />
      </FormSection>

      <FormSection title="Phụ cấp">
        <Input
          label="Phụ cấp (VNĐ)"
          type="number"
          value={value.allowance || ""}
          onChange={(e) => onChange("allowance", e.target.value)}
        />
      </FormSection>

      <FormSection title="Ghi chú">
        <textarea
          className="w-full min-h-[120px] px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="Nhập các thỏa thuận đặc biệt về lương..."
          value={value.note || ""}
          onChange={(e) => onChange("note", e.target.value)}
        />
      </FormSection>
    </div>
  );
}