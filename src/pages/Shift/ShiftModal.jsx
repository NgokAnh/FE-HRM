import { useEffect, useMemo, useState } from "react";
import { createShift, updateShift } from "../../api/shiftApi";

export default function ShiftModal({
  onClose,
  onSaved,
  mode = "add",     // "add" | "edit" | "view"
  shift = null,
  onRequestEdit,    // optional: dùng khi đang view mà bấm "Chỉnh sửa"
}) {
  const isEdit = mode === "edit";
  const isView = mode === "view";
  const isAdd = mode === "add";

  const buildInitialForm = (s) => ({
    name: s?.name ?? "",
    description: s?.description ?? "",
    startTime: normalizeTime(s?.startTime) || "08:00",
    endTime: normalizeTime(s?.endTime) || "17:00",
    isActive: typeof s?.isActive === "boolean" ? s.isActive : true,
    colorCode: s?.colorCode ?? "#22c55e",
  });

  const [form, setForm] = useState(buildInitialForm(shift));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ đổi mode/shift -> fill lại dữ liệu
  useEffect(() => {
    setForm(buildInitialForm(shift));
    setError("");
  }, [shift, mode]); // quan trọng: phụ thuộc cả mode

  const placeholders = useMemo(() => {
    if (isAdd) {
      return {
        name: "Nhập tên ca (VD: Ca sáng)",
        description: "Mô tả (tuỳ chọn)",
        colorCode: "#22c55e",
      };
    }
    // edit/view
    return {
      name: shift?.name ? "" : "Chưa có tên ca",
      description: shift?.description ? "" : "Chưa có mô tả",
      colorCode: shift?.colorCode ? "" : "#22c55e",
    };
  }, [isAdd, shift]);

  const setField = (key, value) => {
    if (isView) return; // ✅ chặn sửa khi view
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const validate = () => {
    if (form.name && form.name.length > 100) return "Tên ca tối đa 100 ký tự";
    if (form.description && form.description.length > 500) return "Mô tả tối đa 500 ký tự";
    if (form.colorCode && form.colorCode.length > 7) return "Mã màu tối đa 7 ký tự";

    if (!/^\d{2}:\d{2}$/.test(form.startTime) || !/^\d{2}:\d{2}$/.test(form.endTime)) {
      return "Giờ phải theo định dạng HH:mm (VD: 08:00)";
    }

    const start = toMinutes(form.startTime);
    const end = toMinutes(form.endTime);
    if (end <= start) return "Giờ kết thúc phải lớn hơn giờ bắt đầu (chưa hỗ trợ ca qua đêm)";

    if (form.colorCode && !/^#([0-9a-fA-F]{6})$/.test(form.colorCode)) {
      return "Mã màu nên theo dạng #RRGGBB (VD: #22c55e)";
    }

    return "";
  };

  const handleSave = async () => {
    if (isView) return;

    const msg = validate();
    if (msg) {
      setError(msg);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const payload = {
        name: form.name?.trim() || null,
        description: form.description?.trim() || null,
        startTime: form.startTime,
        endTime: form.endTime,
        isActive: !!form.isActive,
        colorCode: form.colorCode || null,
      };

      if (isEdit) {
        await updateShift(shift.id, payload);
      } else {
        await createShift(payload);
      }

      onSaved?.();
    } catch (e) {
      setError(e?.message || "Lưu ca thất bại");
    } finally {
      setLoading(false);
    }
  };

  const title = isView
    ? "Chi tiết ca làm việc"
    : isEdit
    ? "Cập nhật ca làm việc"
    : "Thêm ca làm việc";

  const subtitle = isView
    ? "Xem thông tin chi tiết của ca."
    : isEdit
    ? "Chỉnh sửa template ca."
    : "Tạo template ca để dùng khi xếp lịch.";

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex justify-center items-start overflow-y-auto">
      <div className="bg-white w-full max-w-3xl mt-10 rounded-xl shadow-lg">
        {/* HEADER */}
        <div className="p-6">
          <h2 className="text-2xl font-semibold">{title}</h2>
          <p className="text-gray-500">{subtitle}</p>

          {error && <div className="mt-3 text-sm text-red-600">{error}</div>}
        </div>

        {/* CONTENT */}
        <div className="px-6 pb-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Tên ca">
              <input
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                placeholder={placeholders.name}
                disabled={isView}
                className={`w-full px-4 py-2 rounded-lg outline-none ${
                  isView ? "bg-gray-50 text-gray-700 border" : "bg-gray-100"
                }`}
              />
            </Field>

            <Field label="Màu ca">
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={form.colorCode || "#22c55e"}
                  onChange={(e) => setField("colorCode", e.target.value)}
                  disabled={isView}
                  className={`w-12 h-10 rounded-lg border ${
                    isView ? "bg-gray-50" : "bg-white"
                  }`}
                  title="Chọn màu"
                />
                <input
                  value={form.colorCode}
                  onChange={(e) => setField("colorCode", e.target.value)}
                  placeholder={placeholders.colorCode}
                  disabled={isView}
                  className={`flex-1 px-4 py-2 rounded-lg outline-none ${
                    isView ? "bg-gray-50 text-gray-700 border" : "bg-gray-100"
                  }`}
                />
              </div>
            </Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="Giờ bắt đầu">
              <input
                value={form.startTime}
                onChange={(e) => setField("startTime", e.target.value)}
                placeholder="08:00"
                disabled={isView}
                className={`w-full px-4 py-2 rounded-lg outline-none ${
                  isView ? "bg-gray-50 text-gray-700 border" : "bg-gray-100"
                }`}
              />
            </Field>

            <Field label="Giờ kết thúc">
              <input
                value={form.endTime}
                onChange={(e) => setField("endTime", e.target.value)}
                placeholder="17:00"
                disabled={isView}
                className={`w-full px-4 py-2 rounded-lg outline-none ${
                  isView ? "bg-gray-50 text-gray-700 border" : "bg-gray-100"
                }`}
              />
            </Field>

            <Field label="Trạng thái">
              <select
                value={form.isActive ? "ACTIVE" : "INACTIVE"}
                onChange={(e) => setField("isActive", e.target.value === "ACTIVE")}
                disabled={isView}
                className={`w-full px-4 py-2 rounded-lg outline-none ${
                  isView ? "bg-gray-50 text-gray-700 border" : "bg-gray-100"
                }`}
              >
                <option value="ACTIVE">Đang áp dụng</option>
                <option value="INACTIVE">Tạm ngưng</option>
              </select>
            </Field>
          </div>

          <Field label="Mô tả">
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
              placeholder={placeholders.description}
              disabled={isView}
              className={`w-full px-4 py-2 rounded-lg outline-none resize-none ${
                isView ? "bg-gray-50 text-gray-700 border" : "bg-gray-100"
              }`}
            />
          </Field>

          {/* Preview */}
          <div className="bg-gray-50 border rounded-xl p-4 text-sm text-gray-700">
            <div className="font-medium mb-1">Xem trước</div>
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full border"
                style={{ backgroundColor: form.colorCode || "#22c55e" }}
              />
              <b>{form.name || "—"}</b>
              <span className="text-gray-500">
                • {form.startTime || "—"} - {form.endTime || "—"}
              </span>
              <span className="text-gray-500">
                • {form.isActive ? "Đang áp dụng" : "Tạm ngưng"}
              </span>
            </div>
            {form.description ? (
              <div className="text-gray-600 mt-1">{form.description}</div>
            ) : null}
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex justify-end gap-4 px-6 py-4 border-t">
          <button onClick={onClose} className="text-gray-600" disabled={loading}>
            {isView ? "Đóng" : "Hủy bỏ"}
          </button>

          {/* ✅ View: không hiện Lưu, có thể hiện Chỉnh sửa */}
          {isView ? (
            onRequestEdit ? (
              <button
                onClick={onRequestEdit}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg"
              >
                Chỉnh sửa
              </button>
            ) : null
          ) : (
            <button
              onClick={handleSave}
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg disabled:opacity-60"
            >
              {loading ? "Đang lưu..." : "Lưu ca"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-gray-700">{label}</div>
      {children}
    </div>
  );
}

function toMinutes(hhmm) {
  const [h, m] = hhmm.split(":").map((x) => Number(x));
  return h * 60 + m;
}

function normalizeTime(t) {
  if (!t) return "";
  const s = String(t);
  if (/^\d{2}:\d{2}$/.test(s)) return s;
  if (/^\d{2}:\d{2}:\d{2}$/.test(s)) return s.slice(0, 5);
  return s;
}
