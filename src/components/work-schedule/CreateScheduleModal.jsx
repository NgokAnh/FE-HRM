import React, { useState } from "react";

export default function CreateScheduleModal({
  open,
  onClose,
  selectedDate,
  employees = [],
}) {
  const [workType, setWorkType] = useState("shift"); // shift | hour | fixed
  const [target, setTarget] = useState("employee");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 font-sans text-slate-900">
      {/* Overlay */}
      <div className="absolute inset-0" onClick={onClose}></div>

      {/* MODAL PANEL */}
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
          
          {/* 1. ĐỐI TƯỢNG ÁP DỤNG */}
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
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="radio" 
                  name="target"
                  checked={target === "group"}
                  onChange={() => setTarget("group")}
                  className="w-5 h-5 accent-blue-600 cursor-pointer" 
                />
                <span className="text-[15px] font-medium">Nhóm</span>
              </label>
            </div>

            <div className="relative">
              <select className="w-full p-3.5 bg-white border border-slate-200 rounded-xl text-[15px] appearance-none focus:outline-none focus:border-blue-500 cursor-pointer shadow-sm">
                <option>Chọn nhân viên...</option>
                {employees.map(e => <option key={e.id}>{e.name}</option>)}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[10px]">
                ▼
              </div>
            </div>
          </div>

          {/* 2. LOẠI HÌNH LÀM VIỆC */}
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
                    ${workType === type 
                      ? "bg-white text-blue-600 shadow-md" 
                      : "text-slate-500 hover:text-slate-700"}`}
                >
                  {type === "shift" ? "Theo ca" : type === "hour" ? "Theo giờ" : "Cố định"}
                </button>
              ))}
            </div>

            {/* THEO CA - MÀU XANH LÁ */}
            {workType === "shift" && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 space-y-4 animate-in slide-in-from-top-2 duration-300">
                <div className="flex justify-between items-center">
                  <span className="text-[15px] font-bold text-emerald-700">Thiết lập ca</span>
                  <span className="bg-emerald-200 text-emerald-800 px-3 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider">
                    Ca làm việc
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-[13px] text-emerald-700 font-semibold">Tên ca hoặc chọn ca</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        placeholder="Nhập tên ca..."
                        className="w-full p-3 bg-white border border-emerald-200 rounded-xl text-[15px] focus:outline-none focus:border-emerald-500 shadow-sm"
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-300 text-[10px]">▼</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[13px] text-emerald-700 font-semibold">Bắt đầu</label>
                      <input type="text" defaultValue="08:00" className="w-full text-center p-3 bg-white border border-emerald-200 rounded-xl font-bold focus:outline-none focus:border-emerald-500 shadow-sm" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[13px] text-emerald-700 font-semibold">Kết thúc</label>
                      <input type="text" defaultValue="17:00" className="w-full text-center p-3 bg-white border border-emerald-200 rounded-xl font-bold focus:outline-none focus:border-emerald-500 shadow-sm" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* THEO GIỜ - MÀU CAM */}
            {workType === "hour" && (
              <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5 space-y-4 animate-in slide-in-from-top-2 duration-300">
                <div className="flex justify-between items-center">
                  <span className="text-[15px] font-bold text-orange-700">Chi tiết giờ làm</span>
                  <span className="bg-orange-200 text-orange-800 px-3 py-1 rounded-lg text-[11px] font-black uppercase">Theo giờ</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[13px] text-orange-700 font-semibold">Giờ bắt đầu</label>
                    <input type="text" defaultValue="08:00" className="w-full text-center p-3 bg-white border border-orange-200 rounded-xl font-bold focus:outline-none focus:border-orange-500 shadow-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[13px] text-orange-700 font-semibold">Giờ kết thúc</label>
                    <input type="text" defaultValue="17:00" className="w-full text-center p-3 bg-white border border-orange-200 rounded-xl font-bold focus:outline-none focus:border-orange-500 shadow-sm" />
                  </div>
                </div>
              </div>
            )}

            {/* CỐ ĐỊNH - MÀU XANH DƯƠNG */}
            {workType === "fixed" && (
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 space-y-4 animate-in slide-in-from-top-2 duration-300">
                <div className="flex justify-between items-center">
                  <span className="text-[15px] font-bold text-blue-700">Thông tin lịch</span>
                  <span className="bg-blue-200 text-blue-800 px-3 py-1 rounded-lg text-[11px] font-black uppercase">Cố định</span>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[13px] text-blue-700 font-semibold">Ghi chú lịch làm việc</label>
                  <textarea 
                    placeholder="Nhập ghi chú công việc..."
                    rows="2"
                    className="w-full p-3 bg-white border border-blue-200 rounded-xl text-[15px] focus:outline-none focus:border-blue-400 shadow-sm resize-none"
                  ></textarea>
                </div>
              </div>
            )}
          </div>

          {/* 3. THỜI GIAN ÁP DỤNG (ĐÃ BỎ ICON) */}
          <div className="space-y-4 pt-2">
            <div className="text-[12px] font-bold text-slate-500 uppercase tracking-widest">
              Thời gian áp dụng
            </div>

            <div className="relative">
              <input 
                type="text" 
                value={selectedDate || "10/22/2023"} 
                readOnly 
                className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-[16px] font-bold focus:outline-none text-center shadow-sm" 
              />
            </div>

            <label className="flex items-center gap-3 cursor-pointer pt-1 group">
              <input 
                type="checkbox" 
                className="w-5 h-5 rounded border-slate-300 accent-blue-600 cursor-pointer" 
              />
              <span className="text-[15px] font-medium text-slate-600 group-hover:text-slate-900 transition-colors">
                Lặp lại hàng tuần
              </span>
            </label>
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-6 pt-2 flex justify-end gap-3 bg-slate-50/30">
          <button 
            onClick={onClose} 
            className="px-8 py-3 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-all"
          >
            Hủy
          </button>
          <button 
            className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95"
          >
            Lưu lịch làm việc
          </button>
        </div>
      </div>
    </div>
  );
}