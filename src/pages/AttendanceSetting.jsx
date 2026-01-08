import { useState } from "react";
import SelectLocationModal from "../components/common/SelectLocationModal";

export default function AttendanceSetting() {
  const [openMap, setOpenMap] = useState(false);
  const [location, setLocation] = useState(null);

  return (
    <>
      {/* Nút hiển thị tọa độ + bán kính nếu đã chọn */}
      <button
        onClick={() => setOpenMap(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white"
      >
        <span className="material-symbols-outlined">location_on</span>
        {location
          ? `(${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}) – ${location.radius}m`
          : "Chọn vị trí"}
      </button>

      <SelectLocationModal
        open={openMap}
        onClose={() => setOpenMap(false)}
        onConfirm={(data) => {
          // data phải có { lat, lng, radius }
          setLocation(data);
          setOpenMap(false);
        }}
      />
    </>
  );
}