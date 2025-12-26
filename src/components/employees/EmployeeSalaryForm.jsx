import { useState } from "react";
import FormSection from "../common/FormSection";
import { Input } from "../common/Input";
import { Select } from "../common/Select";

export default function EmployeeSalaryForm() {
  const [salaryType, setSalaryType] = useState("fixed");

  const [allowances, setAllowances] = useState([]);
  const [deductions, setDeductions] = useState([]);

  /* ===== PHỤ CẤP ===== */
  const addAllowance = () => {
    setAllowances([
      ...allowances,
      { name: "", type: "money", value: "" },
    ]);
  };

  const updateAllowance = (index, field, value) => {
    const updated = [...allowances];
    updated[index][field] = value;
    setAllowances(updated);
  };

  const removeAllowance = (index) => {
    setAllowances(allowances.filter((_, i) => i !== index));
  };

  /* ===== KHẤU TRỪ ===== */
  const addDeduction = () => {
    setDeductions([...deductions, { name: "", amount: "" }]);
  };

  const updateDeduction = (index, field, value) => {
    const updated = [...deductions];
    updated[index][field] = value;
    setDeductions(updated);
  };

  const removeDeduction = (index) => {
    setDeductions(deductions.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-8">

      {/* LOẠI LƯƠNG */}
      <FormSection title="Loại lương">
        <Select
          label="Hình thức trả lương"
          value={salaryType}
          onChange={(e) => setSalaryType(e.target.value)}
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
            label={
              salaryType === "hour"
                ? "Lương theo giờ (VNĐ)"
                : "Lương cơ bản (VNĐ)"
            }
            type="number"
          />
          <Input label="Ngày áp dụng" type="date" />
        </div>
      </FormSection>

      {/* PHỤ CẤP */}
      <FormSection title="Phụ cấp">
        <div className="space-y-4">
          {allowances.map((item, index) => (
            <div
              key={index}
              className="grid grid-cols-6 gap-4 items-end"
            >
              <div className="col-span-2">
                <Input
                  label="Tên phụ cấp"
                  placeholder="VD: Ăn trưa"
                  value={item.name}
                  onChange={(e) =>
                    updateAllowance(index, "name", e.target.value)
                  }
                />
              </div>

              <Select
                label="Loại"
                value={item.type}
                onChange={(e) =>
                  updateAllowance(index, "type", e.target.value)
                }
              >
                <option value="money">VNĐ</option>
                <option value="percent">%</option>
              </Select>

              <div className="col-span-2">
                <Input
                  label={
                    item.type === "percent"
                      ? "Phần trăm (%)"
                      : "Số tiền (VNĐ)"
                  }
                  type="number"
                  value={item.value}
                  onChange={(e) =>
                    updateAllowance(index, "value", e.target.value)
                  }
                />
              </div>

              <button
                onClick={() => removeAllowance(index)}
                className="h-10 w-10 flex items-center justify-center
                rounded-lg text-red-600 hover:bg-red-100"
              >
                <span className="material-symbols-outlined">
                  delete
                </span>
              </button>
            </div>
          ))}

          <button
            onClick={addAllowance}
            className="flex items-center gap-2 text-blue-600
            hover:underline text-sm font-medium"
          >
            <span className="material-symbols-outlined">add</span>
            Thêm phụ cấp
          </button>
        </div>
      </FormSection>

      {/* KHOẢN KHẤU TRỪ */}
      <FormSection title="Các khoản khấu trừ mặc định">
        <div className="space-y-4">
          {deductions.map((item, index) => (
            <div
              key={index}
              className="grid grid-cols-5 gap-4 items-end"
            >
              <div className="col-span-2">
                <Input
                  label="Tên khấu trừ"
                  placeholder="VD: BHXH"
                  value={item.name}
                  onChange={(e) =>
                    updateDeduction(index, "name", e.target.value)
                  }
                />
              </div>

              <div className="col-span-2">
                <Input
                  label="Số tiền (VNĐ)"
                  type="number"
                  value={item.amount}
                  onChange={(e) =>
                    updateDeduction(index, "amount", e.target.value)
                  }
                />
              </div>

              <button
                onClick={() => removeDeduction(index)}
                className="h-10 w-10 flex items-center justify-center
                rounded-lg text-red-600 hover:bg-red-100"
              >
                <span className="material-symbols-outlined">
                  delete
                </span>
              </button>
            </div>
          ))}

          <button
            onClick={addDeduction}
            className="flex items-center gap-2 text-blue-600
            hover:underline text-sm font-medium"
          >
            <span className="material-symbols-outlined">add</span>
            Thêm khấu trừ
          </button>
        </div>
      </FormSection>

      {/* TÀI KHOẢN NGÂN HÀNG */}
      <FormSection title="Thông tin tài khoản ngân hàng">
        <div className="grid grid-cols-2 gap-6">
          <Input label="Tên ngân hàng" />
          <Input label="Số tài khoản" />
          <Input label="Tên chủ tài khoản" full />
        </div>
      </FormSection>

      {/* GHI CHÚ */}
      <FormSection title="Ghi chú">
        <textarea
          className="w-full min-h-[120px] px-4 py-3 border rounded-lg
          focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="Nhập các thỏa thuận đặc biệt về lương..."
        />
      </FormSection>
    </div>
  );
}