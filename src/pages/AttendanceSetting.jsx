import { useState } from "react";
import SelectLocationModal from "../components/common/SelectLocationModal";

export default function AttendanceSetting() {
  const [openMap, setOpenMap] = useState(false);
  const [location, setLocation] = useState(null);

  return (
    <>
      <button
        onClick={() => setOpenMap(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white"
      >
        <span className="material-symbols-outlined">location_on</span>
        Chọn vị trí
      </button>

      {location && (
        <div className="mt-2 text-sm text-gray-600">
          📍 {location.lat}, {location.lng} – {location.radius}m
        </div>
      )}

      <SelectLocationModal
        open={openMap}
        onClose={() => setOpenMap(false)}
        onConfirm={(data) => {
          setLocation(data);
          setOpenMap(false);
          console.log("Vị trí chấm công:", data);
        }}
      />
    </>
  );
}