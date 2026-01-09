import React, { useEffect, useMemo, useState } from "react";
import { getEmployees } from "../../api/employeeApi";
import { getShifts } from "../../api/shiftApi";
import {
  createWorkSchedule,
  existsWorkSchedule,
  updateWorkSchedule, // ✅ thêm
} from "../../api/workScheduleApi";
import DatePickerNativeDMY from "../DatePicker";

export default function CreateScheduleModal({
  open,
  onClose,
  selectedDate,          // YYYY-MM-DD
  onSaved,
  mode = "add",          // ✅ "add" | "edit"
  schedule = null,       // ✅ ws raw khi edit
}) {
  const isEdit = mode === "edit";

  const [employees, setEmployees] = useState([]);
  const [shifts, setShifts] = useState([]);

  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [selectedShiftId, setSelectedShiftId] = useState("");

  // ngày áp dụng (ISO: YYYY-MM-DD)
  const [workDateISO, setWorkDateISO] = useState(selectedDate || "");

  // lặp hằng ngày (chỉ cho ADD, edit thì thường không lặp)
  const [repeatDaily, setRepeatDaily] = useState(false);
  const [repeatUntil, setRepeatUntil] = useState("");

  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [loadingShifts, setLoadingShifts] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // ===== fetch lists when open =====
  useEffect(() => {
    if (!open) return;

    const run = async () => {
      setError("");

      try {
        setLoadingEmployees(true);
        const er = await getEmployees();
        const eData = er?.data ?? er;
        setEmployees(Array.isArray(eData) ? eData : []);
      } catch {
        setEmployees([]);
      } finally {
        setLoadingEmployees(false);
      }

      try {
        setLoadingShifts(true);
        const sr = await getShifts();
        const sData = sr?.data ?? sr;
        const arr = Array.isArray(sData) ? sData : [];
        setShifts(arr.filter((x) => x?.isActive !== false));
      } catch {
        setShifts([]);
      } finally {
        setLoadingShifts(false);
      }
    };

    run();
  }, [open]);

  // ===== init form when open / mode changes =====
  useEffect(() => {
    if (!open) return;

    setError("");
    setSaving(false);

    if (isEdit && schedule) {
      // ✅ prefill từ schedule
      const empId = schedule?.employee?.id ?? schedule?.employeeId ?? "";
      const shiftId = schedule?.shift?.id ?? schedule?.shiftId ?? "";
      const date = schedule?.workDate ?? schedule?.date ?? selectedDate ?? "";

      setSelectedEmployeeId(empId ? String(empId) : "");
      setSelectedShiftId(shiftId ? String(shiftId) : "");
      setWorkDateISO(date || "");

      // edit: tắt repeat
      setRepeatDaily(false);
      setRepeatUntil("");
    } else {
      // add: reset
      setSelectedEmployeeId("");
      setSelectedShiftId("");
      setWorkDateISO(selectedDate || "");
      setRepeatDaily(false);
      setRepeatUntil("");
    }
  }, [open, isEdit, schedule, selectedDate]);

  const selectedShift = useMemo(
    () => shifts.find((s) => String(s.id) === String(selectedShiftId)),
    [shifts, selectedShiftId]
  );

  if (!open) return null;

  const canSave =
    !!selectedEmployeeId && !!selectedShiftId && !!workDateISO;

  const handleSave = async () => {
    if (!canSave) {
      setError("Vui lòng chọn nhân viên, ngày áp dụng và ca làm việc.");
      return;
    }

    // ADD mới cần lặp daily
    if (!isEdit && repeatDaily) {
      if (!repeatUntil) {
        setError("Bạn cần chọn 'Lặp đến ngày' để tránh tạo lịch vô hạn.");
        return;
      }
      if (repeatUntil < workDateISO) {
        setError("Ngày 'Lặp đến' phải >= ngày áp dụng.");
        return;
      }
    }

    const employeeId = Number(selectedEmployeeId);
    const shiftId = Number(selectedShiftId);

    const basePayload = {
      employee: { id: employeeId },
      shift: { id: shiftId },
      workSite: { id: 1 },
      workDate: workDateISO,
    };

    try {
      setSaving(true);
      setError("");

      // ========= EDIT =========
      if (isEdit) {
        const id = schedule?.id;
        if (!id) {
          setError("Thiếu schedule.id nên không thể cập nhật.");
          return;
        }

        // nếu user đổi ngày/ca -> check trùng
        const oldDate = schedule?.workDate ?? "";
        const oldShiftId = String(schedule?.shift?.id ?? "");
        const changed = oldDate !== workDateISO || oldShiftId !== String(shiftId);

        if (changed) {
          const ex = await existsWorkSchedule(employeeId, shiftId, workDateISO);
          const existed = typeof ex === "boolean" ? ex : !!(ex?.data);
          if (existed) {
            setError("Nhân viên đã có lịch ngày này với ca này.");
            return;
          }
        }
        try {
          await updateWorkSchedule(id, basePayload);
          onSaved?.();
          onClose?.();
          return;
        } catch (err) {
          setError(err?.message || "Không cập nhật được lịch.");
          return;
        }
      }

      // ========= ADD (có thể lặp daily) =========
      const datesToCreate = repeatDaily ? buildDailyDates(workDateISO, repeatUntil) : [workDateISO];

      const MAX_DAYS = 62;
      if (datesToCreate.length > MAX_DAYS) {
        setError(`Chỉ cho phép lặp tối đa ${MAX_DAYS} ngày.`);
        return;
      }

      const created = [];
      const skipped = [];

      for (const d of datesToCreate) {
        try {
          let existed = false;
          try {
            const ex = await existsWorkSchedule(employeeId, shiftId, d);
            existed = typeof ex === "boolean" ? ex : !!(ex?.data);
          } catch {
            existed = false;
          }

          if (existed) {
            skipped.push(d);
            continue;
          }

          await createWorkSchedule({ ...basePayload, workDate: d });
          created.push(d);
        } catch (err) {
          setError(`Không tạo được lịch cho ngày ${d}: ${err?.message || "Unknown error"}`);
          return;
        }
      }

      if (created.length === 0) {
        setError("Không tạo được lịch (có thể bị trùng hết).");
        return;
      }

      if (skipped.length) {
        alert(`Đã tạo: ${created.length} • Trùng: ${skipped.length}`);
      }

      onSaved?.();
      onClose?.();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="absolute inset-0" onClick={onClose}></div>

      <div className="relative w-full max-w-[480px] bg-white rounded-[24px] shadow-xl overflow-hidden">
        {/* HEADER */}
        <div className="flex justify-between items-center p-6 pb-4">
          <h3 className="text-[22px] font-bold">
            {isEdit ? "Sửa lịch" : "Tạo lịch mới"}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-3xl leading-none font-light">
            ×
          </button>
        </div>

        <hr className="border-slate-100" />

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {error ? <div className="text-sm text-red-600">{error}</div> : null}

          {/* employee */}
          <div className="space-y-2">
            <div className="text-[12px] font-bold text-slate-500 uppercase tracking-widest">Nhân viên</div>
            <select
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
              disabled={loadingEmployees}
              className="w-full p-3.5 bg-white border border-slate-200 rounded-xl text-[15px]"
            >
              <option value="">{loadingEmployees ? "Đang tải..." : "Chọn nhân viên..."}</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>{emp.fullname}</option>
              ))}
            </select>
          </div>

          {/* shift */}
          <div className="space-y-2">
            <div className="text-[12px] font-bold text-slate-500 uppercase tracking-widest">Ca làm</div>
            <select
              value={selectedShiftId}
              onChange={(e) => setSelectedShiftId(e.target.value)}
              disabled={loadingShifts}
              className="w-full p-3.5 bg-white border border-slate-200 rounded-xl text-[15px]"
            >
              <option value="">{loadingShifts ? "Đang tải..." : "Chọn ca..."}</option>
              {shifts.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({normalizeTime(s.startTime)} - {normalizeTime(s.endTime)})
                </option>
              ))}
            </select>

            {selectedShift ? (
              <div className="text-[12px] text-slate-600">
                Đã chọn: <b>{selectedShift.name}</b>
              </div>
            ) : null}
          </div>

          {/* date */}
          <div className="space-y-2">
  <div className="text-[12px] font-bold text-slate-500 uppercase tracking-widest">
    Ngày áp dụng
  </div>

  <input
    type="text"
    value={isoToDMY(workDateISO) || "—"}
    readOnly
    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-[15px]
               font-semibold text-center text-slate-700 cursor-not-allowed"
  />
</div>


          {/* repeat daily only on ADD */}
          {!isEdit && (
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={repeatDaily}
                  onChange={(e) => setRepeatDaily(e.target.checked)}
                  className="w-5 h-5 accent-blue-600"
                />
                <span className="text-[14px] font-medium text-slate-700">Lặp lại hằng ngày</span>
              </label>

              {repeatDaily && (
                <div>
                  <div className="text-[13px] font-semibold text-slate-600">Lặp đến ngày</div>
                  <DatePickerNativeDMY valueISO={repeatUntil} onChangeISO={setRepeatUntil} minISO={workDateISO} />
                </div>
              )}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="p-6 pt-3 flex justify-end gap-3 bg-slate-50/30">
          <button onClick={onClose} className="px-8 py-3 text-slate-600 font-bold hover:bg-slate-100 rounded-xl" disabled={saving}>
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !canSave}
            className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? "Đang lưu..." : isEdit ? "Cập nhật" : "Lưu lịch"}
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

function addDaysISO(iso, days) {
  // xử lý theo UTC để không bị lệch ngày
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function buildDailyDates(startISO, endISO) {
  const out = [];
  let cur = startISO;

  // so sánh bằng Date UTC cho chắc
  const end = new Date(endISO + "T00:00:00Z");

  while (new Date(cur + "T00:00:00Z") <= end) {
    out.push(cur);
    cur = addDaysISO(cur, 1);
  }
  return out;
}
function isoToDMY(iso) {
  if (!iso) return "";
  const m = String(iso).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return "";
  const [, y, mo, d] = m;
  return `${d}-${mo}-${y}`;
}
