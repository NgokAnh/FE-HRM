import { useState } from "react";

export default function SelectLocationModal({ open, onClose, onConfirm }) {
  const [lat, setLat] = useState(21.028511); // Hà Nội
  const [lng, setLng] = useState(105.804817);
  const [radius, setRadius] = useState(100);

  if (!open) return null; // ⭐ QUAN TRỌNG

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white w-[420px] rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <span className="material-symbols-outlined text-blue-600">
            location_on
          </span>
          Chọn vị trí chấm công
        </h2>

        {/* MOCK MAP */}
        <div className="h-40 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 text-sm">
          🗺️ Map (Google Map / Leaflet sẽ gắn ở đây)
        </div>

        {/* LAT LNG */}
        <div className="grid grid-cols-2 gap-3">
          <input
            type="number"
            value={lat}
            onChange={(e) => setLat(+e.target.value)}
            className="border rounded-lg px-3 py-2"
            placeholder="Latitude"
          />
          <input
            type="number"
            value={lng}
            onChange={(e) => setLng(+e.target.value)}
            className="border rounded-lg px-3 py-2"
            placeholder="Longitude"
          />
        </div>

        {/* RADIUS */}
        <div>
          <label className="text-sm text-gray-600">
            Bán kính chấm công: <b>{radius}m</b>
          </label>
          <input
            type="range"
            min={50}
            max={500}
            step={10}
            value={radius}
            onChange={(e) => setRadius(+e.target.value)}
            className="w-full"
          />
        </div>

        {/* ACTION */}
        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border"
          >
            Hủy
          </button>
          <button
            onClick={() =>
              onConfirm({ lat, lng, radius })
            }
            className="px-4 py-2 rounded-lg bg-blue-600 text-white"
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
}