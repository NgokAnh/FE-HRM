import { useEffect, useState } from "react";
import FormSection from "../common/FormSection";
import { Input } from "../common/Input";
import { Select } from "../common/Select";
import { getEmployee } from "../../api/employeeApi";

export default function EmployeeSalaryForm({ value, onChange }) {
  const [loading, setLoading] = useState(false);
  const [allowances, setAllowances] = useState([]);
  const [deductions, setDeductions] = useState([]);

  // --- Load dữ liệu khi edit ---
  useEffect(() => {
    if (!value?.id) return; // thêm mới không cần load
    loadEmployee(value.id);
  }, [value?.id]);

  const loadEmployee = async (id) => {
    setLoading(true);
    try {
      console.log("[EmployeeSalaryForm] Loading employee", id);
      const data = await getEmployee(id);
      console.log("[EmployeeSalaryForm] Data loaded:", data);

      // Lương cơ bản
      const salaryType = data.currentSalaryType?.salaryType?.toLowerCase() || "fixed";
      onChange("salaryType", salaryType);
      onChange("note", data.currentSalaryType?.note || "");

      if (salaryType === "fixed") {
        onChange("baseSalary", data.currentMonthlySalary?.baseSalary || "");
        onChange("effectiveDate", data.currentMonthlySalary?.effectiveFrom || "");
        if (data.currentMonthlySalary?.allowance > 0) {
          setAllowances([
            { name: "Phụ cấp cố định", type: "money", value: data.currentMonthlySalary.allowance },
          ]);
        } else setAllowances([]);
      } else {
        const activeRate = data.activeShiftRates?.[0];
        onChange("baseSalary", activeRate?.baseRate || "");
        onChange("effectiveDate", activeRate?.effectiveFrom?.split("T")[0] || "");
        setAllowances([]);
      }

      // Khấu trừ
      const mappedDeductions =
        data.employeePenalties?.map((p) => ({
          name: p.penaltyType?.name || "",
          amount: p.penaltyType?.rate || "",
        })) || [];
      setDeductions(mappedDeductions);
    } catch (err) {
      console.error("[EmployeeSalaryForm] Load error:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- ALLOWANCE LOGIC ---
  const addAllowance = () => setAllowances([...allowances, { name: "", type: "money", value: "" }]);
  const updateAllowance = (index, field, val) => {
    const updated = [...allowances];
    updated[index][field] = val;
    setAllowances(updated);
  };
  const removeAllowance = (index) => setAllowances(allowances.filter((_, i) => i !== index));

  // --- DEDUCTION LOGIC ---
  const addDeduction = () => setDeductions([...deductions, { name: "", amount: "" }]);
  const updateDeduction = (index, field, val) => {
    const updated = [...deductions];
    updated[index][field] = val;
    setDeductions(updated);
  };
  const removeDeduction = (index) => setDeductions(deductions.filter((_, i) => i !== index));

  // --- SYNC ALLOWANCE & DEDUCTION LÊN MODAL ---
  useEffect(() => {
    const totalAllowance = allowances.reduce((sum, a) => sum + Number(a.value || 0), 0);
    onChange("allowances", allowances);
    onChange("totalAllowance", totalAllowance);
  }, [allowances]);

  useEffect(() => {
    onChange("deductions", deductions);
  }, [deductions]);

  if (loading) return <p className="p-8 text-center">Đang tải...</p>;

  return (
    <div className="space-y-8">
      {/* LOẠI LƯƠNG */}
      <FormSection title="Loại lương">
        <Select
          label="Hình thức trả lương"
          value={value.salaryType}
          onChange={(e) => onChange("salaryType", e.target.value)}
        >
          <option value="fixed">Cố định theo tháng</option>
          <option value="shift">Theo ca</option>
          <option value="hour">Theo giờ</option>
        </Select>
      </FormSection>

      {/* MỨC LƯƠNG CƠ BẢN */}
      <FormSection title="Mức lương cơ bản">
        <div className="grid grid-cols-2 gap-6">
          <Input
            label={value.salaryType === "hour" ? "Lương theo giờ (VNĐ)" : "Lương cơ bản (VNĐ)"}
            type="number"
            value={value.baseSalary}
            onChange={(e) => onChange("baseSalary", e.target.value)}
          />
          <Input
            label="Ngày áp dụng"
            type="date"
            value={value.effectiveDate || ""}
            onChange={(e) => onChange("effectiveDate", e.target.value)}
          />
        </div>
      </FormSection>

      {/* PHỤ CẤP */}
      <FormSection title="Phụ cấp">
        <div className="space-y-4">
          {allowances.map((a, i) => (
            <div key={i} className="grid grid-cols-6 gap-4 items-end">
              <div className="col-span-2">
                <Input
                  label="Tên phụ cấp"
                  value={a.name}
                  onChange={(e) => updateAllowance(i, "name", e.target.value)}
                />
              </div>
              <Select
                label="Loại"
                value={a.type}
                onChange={(e) => updateAllowance(i, "type", e.target.value)}
              >
                <option value="money">VNĐ</option>
                <option value="percent">%</option>
              </Select>
              <div className="col-span-2">
                <Input
                  label={a.type === "percent" ? "Phần trăm (%)" : "Số tiền (VNĐ)"}
                  type="number"
                  value={a.value}
                  onChange={(e) => updateAllowance(i, "value", e.target.value)}
                />
              </div>
              <button
                onClick={() => removeAllowance(i)}
                className="h-10 w-10 text-red-600 hover:bg-red-100 rounded-lg"
              >
                <span className="material-symbols-outlined">delete</span>
              </button>
            </div>
          ))}
          <button
            onClick={addAllowance}
            className="flex items-center gap-2 text-blue-600 hover:underline text-sm font-medium"
          >
            <span className="material-symbols-outlined">add</span> Thêm phụ cấp
          </button>
        </div>
      </FormSection>

      {/* KHẤU TRỪ */}
      <FormSection title="Các khoản khấu trừ">
        <div className="space-y-4">
          {deductions.map((d, i) => (
            <div key={i} className="grid grid-cols-5 gap-4 items-end">
              <div className="col-span-2">
                <Input
                  label="Tên khấu trừ"
                  value={d.name}
                  onChange={(e) => updateDeduction(i, "name", e.target.value)}
                />
              </div>
              <div className="col-span-2">
                <Input
                  label="Số tiền (VNĐ)"
                  type="number"
                  value={d.amount}
                  onChange={(e) => updateDeduction(i, "amount", e.target.value)}
                />
              </div>
              <button
                onClick={() => removeDeduction(i)}
                className="h-10 w-10 text-red-600 hover:bg-red-100 rounded-lg"
              >
                <span className="material-symbols-outlined">delete</span>
              </button>
            </div>
          ))}
          <button
            onClick={addDeduction}
            className="flex items-center gap-2 text-blue-600 hover:underline text-sm font-medium"
          >
            <span className="material-symbols-outlined">add</span> Thêm khấu trừ
          </button>
        </div>
      </FormSection>

      {/* GHI CHÚ */}
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