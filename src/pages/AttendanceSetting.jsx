// src/pages/AttendanceSetting.jsx
import { useState } from "react";
import SelectLocationModal from "../components/common/SelectLocationModal";
import { createWorksite } from "../api/worksitesApi";

export default function AttendanceSetting() {
  const [openMap, setOpenMap] = useState(false);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);

  // ===== Khi user nhấn Xác nhận trong modal =====
  const handleConfirm = async (data) => {
    if (!data) return;
    setLoading(true);

    try {
      const result = await createWorksite({
        code: `WS-${Date.now()}`,
        name: "Vị trí chấm công",
        address: data.address || "",
        latitude: data.lat,
        longitude: data.lng,
        radiusMeters: data.radius,
        allowedAccuracyMaxMeters: 0, // cố định
      });

      console.log("Worksite created:", result);
      setLocation(data);
      setOpenMap(false);
      alert("Đã tạo địa điểm chấm công!");
    } catch (error) {
      console.error("Tạo worksite thất bại:", error);
      alert("Tạo địa điểm thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      {/* ===== Nút hiển thị tọa độ + radius ===== */}
      <button
        onClick={() => setOpenMap(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white"
        disabled={loading}
      >
        <span className="material-symbols-outlined">location_on</span>
        {location
          ? `(${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}) – ${location.radius}m`
          : "Chọn vị trí"}
      </button>

      {loading && (
        <p className="mt-2 text-sm text-gray-500">Đang tạo địa điểm...</p>
      )}

      {/* ===== Modal chọn vị trí ===== */}
      <SelectLocationModal
        open={openMap}
        onClose={() => setOpenMap(false)}
        onConfirm={handleConfirm}
      />
    </div>
  );
}