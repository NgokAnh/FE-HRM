import React, { useEffect, useMemo, useState } from "react";
import { getEmployees } from "../../api/employeeApi";
import { getShifts } from "../../api/shiftApi";
import {
  createWorkSchedule,
  existsWorkSchedule,
} from "../../api/workScheduleApi";

export default function CreateScheduleModal({
  open,
  onClose,
  selectedDate, // YYYY-MM-DD
  onSaved, // callback để page reload tuần
}) {
  const [workType, setWorkType] = useState("shift"); // shift | hour | fixed
  const [target, setTarget] = useState("employee"); // employee | group

  const [employees, setEmployees] = useState([]);
  const [shifts, setShifts] = useState([]);

  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [selectedShiftId, setSelectedShiftId] = useState("");

  const [repeatWeekly, setRepeatWeekly] = useState(false);

  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [loadingShifts, setLoadingShifts] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // fetch employees + shifts khi mở modal
  useEffect(() => {
    if (!open) return;

    const run = async () => {
      try {
        setError("");

        setLoadingEmployees(true);
        const er = await getEmployees();
        const eData = er?.data ?? er;
        setEmployees(Array.isArray(eData) ? eData : []);
      } catch (e) {
        console.log(e);
        setEmployees([]);
      } finally {
        setLoadingEmployees(false);
      }

      try {
        setLoadingShifts(true);
        const sr = await getShifts(); // hoặc getActiveShifts nếu bạn có
        const sData = sr?.data ?? sr;
        const arr = Array.isArray(sData) ? sData : [];
        // nếu có isActive thì lọc active
        setShifts(arr.filter((x) => x?.isActive !== false));
      } catch (e) {
        console.log(e);
        setShifts([]);
      } finally {
        setLoadingShifts(false);
      }
    };

    run();
  }, [open]);

  // reset khi mở
  useEffect(() => {
    if (!open) return;
    setSelectedEmployeeId("");
    setSelectedShiftId("");
    setRepeatWeekly(false);
    setWorkType("shift");
    setTarget("employee");
    setError("");
  }, [open]);


  const selectedShift = useMemo(
    () => shifts.find((s) => String(s.id) === String(selectedShiftId)),
    [shifts, selectedShiftId]
  );
  if (!open) return null;

  const canSave =
    target === "employee" &&
    selectedEmployeeId &&
    (workType !== "shift" ? true : !!selectedShiftId);

  const handleSave = async () => {
    if (!canSave) {
      setError("Vui lòng chọn nhân viên và ca làm việc.");
      return;
    }
    if (!selectedDate) {
      setError("Thiếu ngày áp dụng.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const employeeId = Number(selectedEmployeeId);
      const shiftId = Number(selectedShiftId);

      // optional: check trùng lịch (chỉ khi workType === "shift")
      if (workType === "shift") {
        const existed = await existsWorkSchedule(employeeId, shiftId, selectedDate);
        if (existed) {
          setError("Nhân viên đã có lịch ngày này với ca này.");
          return;
        }
      }

      // =========================
      // Payload (chọn 1 trong 2)
      // =========================

      // A) phổ biến với JPA entity relation:
      const payloadA = {
        employee: { id: employeeId },
        shift: { id: shiftId },
        workDate: selectedDate, // YYYY-MM-DD
        workSite: { id: 1 },
      };

      // B) nếu BE dùng employeeId/shiftId trực tiếp:
      const payloadB = {
        employeeId,
        shiftId,
        workDate: selectedDate,
      };

      await createWorkSchedule(payloadA);

      // TODO: repeatWeekly nếu bạn muốn tạo 4-8 tuần tiếp theo
      // (cần bạn confirm logic và BE có cho create nhiều record không)

      onSaved?.();
      onClose?.();
    } catch (e) {
      setError(e?.message || "Tạo lịch thất bại");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 font-sans text-slate-900">
      <div className="absolute inset-0" onClick={onClose}></div>

      <div className="relative w-full max-w-[480px] bg-white rounded-[24px] shadow-xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* HEADER */}
        <div className="flex justify-between items-center p-6 pb-4">
          <h3 className="text-[22px] font-bold">Tạo lịch mới</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-3xl leading-none font-light"
          >
            ×
          </button>
        </div>

        <hr className="border-slate-100" />

        {/* BODY */}
        <div className="p-6 space-y-7 overflow-y-auto max-h-[75vh]">
          {error ? <div className="text-sm text-red-600">{error}</div> : null}

          {/* 1) ĐỐI TƯỢNG */}
          <div className="space-y-3">
            <div className="text-[12px] font-bold text-slate-500 uppercase tracking-widest">
              Đối tượng áp dụng
            </div>

            <div className="bg-slate-50/80 border border-slate-100 rounded-2xl p-4 flex gap-8">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="target"
                  checked={target === "employee"}
                  onChange={() => setTarget("employee")}
                  className="w-5 h-5 accent-blue-600 cursor-pointer"
                />
                <span className="text-[15px] font-medium">Nhân viên</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer opacity-60">
                <input
                  type="radio"
                  name="target"
                  checked={target === "group"}
                  onChange={() => setTarget("group")}
                  className="w-5 h-5 accent-blue-600 cursor-pointer"
                  disabled
                />
                <span className="text-[15px] font-medium">Nhóm</span>
              </label>
            </div>

            <div className="relative">
              <select
                value={selectedEmployeeId}
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                disabled={loadingEmployees || target !== "employee"}
                className="w-full p-3.5 bg-white border border-slate-200 rounded-xl text-[15px] appearance-none focus:outline-none focus:border-blue-500 cursor-pointer shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <option value="">
                  {loadingEmployees ? "Đang tải nhân viên..." : "Chọn nhân viên..."}
                </option>

                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.fullname}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[10px]">
                ▼
              </div>
            </div>
          </div>

          {/* 2) LOẠI HÌNH */}
          <div className="space-y-4">
            <div className="text-[12px] font-bold text-slate-500 uppercase tracking-widest">
              Loại hình làm việc
            </div>

            <div className="flex bg-slate-100/80 p-1.5 rounded-2xl">
              {["shift", "hour", "fixed"].map((type) => (
                <button
                  key={type}
                  onClick={() => setWorkType(type)}
                  className={`flex-1 py-2 text-[14px] font-bold rounded-xl transition-all
                    ${
                      workType === type
                        ? "bg-white text-blue-600 shadow-md"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                >
                  {type === "shift" ? "Theo ca" : type === "hour" ? "Theo giờ" : "Cố định"}
                </button>
              ))}
            </div>

            {/* SHIFT */}
            {workType === "shift" && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 space-y-4 animate-in slide-in-from-top-2 duration-300">
                <div className="flex justify-between items-center">
                  <span className="text-[15px] font-bold text-emerald-700">Chọn ca có sẵn</span>
                  <span className="bg-emerald-200 text-emerald-800 px-3 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider">
                    Ca làm việc
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-[13px] text-emerald-700 font-semibold">
                      Danh sách ca
                    </label>

                    <div className="relative">
                      <select
                        value={selectedShiftId}
                        onChange={(e) => setSelectedShiftId(e.target.value)}
                        disabled={loadingShifts}
                        className="w-full p-3 bg-white border border-emerald-200 rounded-xl text-[15px] appearance-none focus:outline-none focus:border-emerald-500 shadow-sm disabled:opacity-60"
                      >
                        <option value="">
                          {loadingShifts ? "Đang tải ca..." : "Chọn ca..."}
                        </option>

                        {shifts.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name} ({normalizeTime(s.startTime)} - {normalizeTime(s.endTime)})
                          </option>
                        ))}
                      </select>

                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-300 text-[10px] pointer-events-none">
                        ▼
                      </div>
                    </div>
                  </div>

                  {/* preview */}
                  <div className="bg-white/70 border border-emerald-100 rounded-xl p-3 text-[13px] text-emerald-800">
                    {selectedShift ? (
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full border"
                          style={{ backgroundColor: selectedShift.colorCode || "#22c55e" }}
                        />
                        <b>{selectedShift.name}</b>
                        <span className="text-emerald-700">
                          • {normalizeTime(selectedShift.startTime)} - {normalizeTime(selectedShift.endTime)}
                        </span>
                      </div>
                    ) : (
                      <div className="text-emerald-700">Chưa chọn ca</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* hour/fixed: bạn đang để UI nhưng chưa nối BE */}
            {workType === "hour" && (
              <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5 space-y-2 text-sm text-orange-700">
                Hiện chưa nối BE cho loại “Theo giờ”. (Bạn có thể mở rộng WorkSchedule entity/DTO để lưu start/end riêng)
              </div>
            )}

            {workType === "fixed" && (
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 space-y-2 text-sm text-blue-700">
                Hiện chưa nối BE cho loại “Cố định”. (Có thể lưu note/dayType… tuỳ thiết kế)
              </div>
            )}
          </div>

          {/* 3) NGÀY ÁP DỤNG */}
          <div className="space-y-4 pt-2">
            <div className="text-[12px] font-bold text-slate-500 uppercase tracking-widest">
              Thời gian áp dụng
            </div>

            <div className="relative">
              <input
                type="text"
                value={selectedDate || "—"}
                readOnly
                className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-[16px] font-bold focus:outline-none text-center shadow-sm"
              />
            </div>

            <label className="flex items-center gap-3 cursor-pointer pt-1 group">
              <input
                type="checkbox"
                checked={repeatWeekly}
                onChange={(e) => setRepeatWeekly(e.target.checked)}
                className="w-5 h-5 rounded border-slate-300 accent-blue-600 cursor-pointer"
              />
              <span className="text-[15px] font-medium text-slate-600 group-hover:text-slate-900 transition-colors">
                Lặp lại hàng tuần (chưa implement)
              </span>
            </label>
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-6 pt-2 flex justify-end gap-3 bg-slate-50/30">
          <button
            onClick={onClose}
            className="px-8 py-3 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-all"
            disabled={saving}
          >
            Hủy
          </button>

          <button
            onClick={handleSave}
            disabled={saving || !canSave}
            className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95 disabled:opacity-60"
          >
            {saving ? "Đang lưu..." : "Lưu lịch làm việc"}
          </button>
        </div>
      </div>
    </div>
  );
}

function normalizeTime(t) {
  if (!t) return "—";
  const s = String(t);
  if (/^\d{2}:\d{2}:\d{2}$/.test(s)) return s.slice(0, 5);
  if (/^\d{2}:\d{2}$/.test(s)) return s;
  return s;
}
