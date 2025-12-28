import React, { useMemo, useRef } from "react";

function isoToDMY(iso) {
  // iso: yyyy-mm-dd
  if (!iso) return "";
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return "";
  const [, y, mo, d] = m;
  return `${d}-${mo}-${y}`;
}

export default function DatePickerNativeDMY({
  valueISO,           // "yyyy-mm-dd"
  onChangeISO,        // (newISO) => void
  placeholder = "Chọn ngày",
  className = "",
  disabled = false,
}) {
  const hiddenRef = useRef(null);

  const displayValue = useMemo(() => isoToDMY(valueISO), [valueISO]);

  const openPicker = () => {
    if (disabled) return;
    // showPicker support (Chrome/Edge), fallback focus+click
    const el = hiddenRef.current;
    if (!el) return;

    if (typeof el.showPicker === "function") el.showPicker();
    else {
      el.focus();
      el.click();
    }
  };

  return (
    <div className="relative">
      {/* Input hiển thị dd-mm-yyyy */}
      <input
        type="text"
        readOnly
        value={displayValue}
        onClick={openPicker}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full p-3.5 bg-white border border-slate-200 rounded-xl text-[15px]
                    focus:outline-none focus:border-blue-500 cursor-pointer shadow-sm
                    disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
      />

      {/* Icon dropdown */}
      <div
        onClick={openPicker}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer"
        title="Chọn ngày"
      >
        ▼
      </div>

      {/* Input date native ẨN để mở picker */}
      <input
        ref={hiddenRef}
        type="date"
        value={valueISO || ""}
        onChange={(e) => onChangeISO?.(e.target.value)} // trả về yyyy-mm-dd
        className="absolute inset-0 opacity-0 pointer-events-none"
        tabIndex={-1}
      />
    </div>
  );
}
