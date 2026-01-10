import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

/* ===== Fix icon Leaflet cho Vite ===== */
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

/* ===== Const ===== */
const DEFAULT_CENTER = { lat: 10.8231, lng: 106.6297 }; // TP.HCM

export default function SelectLocationModal({ open, onClose, onConfirm, viewOnly = false }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerRef = useRef(null);
  const circleRef = useRef(null);
  const hasLocatedRef = useRef(false); // ⭐ auto locate only once
  const debounceRef = useRef(null);

  const [position, setPosition] = useState(DEFAULT_CENTER);
  const [radius, setRadius] = useState(200);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ===== Init map when open ===== */
  useEffect(() => {
    if (!open || mapInstance.current) return;

    mapInstance.current = L.map(mapRef.current).setView(
      [position.lat, position.lng],
      15
    );

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(mapInstance.current);

    markerRef.current = L.marker([position.lat, position.lng]).addTo(
      mapInstance.current
    );

    circleRef.current = L.circle([position.lat, position.lng], {
      radius,
      color: "#2563eb",
      fillColor: "#2563eb",
      fillOpacity: 0.2,
    }).addTo(mapInstance.current);

    mapInstance.current.on("click", (e) => {
      updatePosition(e.latlng.lat, e.latlng.lng);
    });

    /* ⭐ AUTO lấy vị trí khi mở modal (1 lần) */
    if (!hasLocatedRef.current) {
      hasLocatedRef.current = true;
      locateMe();
    }
  }, [open]);

  /* ===== Update marker + circle ===== */
  const updatePosition = (lat, lng) => {
    setPosition({ lat, lng });

    if (!mapInstance.current) return;

    markerRef.current.setLatLng([lat, lng]);
    circleRef.current.setLatLng([lat, lng]);
    mapInstance.current.panTo([lat, lng]);
  };

  /* ===== Update radius ===== */
  useEffect(() => {
    if (circleRef.current) {
      circleRef.current.setRadius(radius);
    }
  }, [radius]);

  /* ===== Search address / place with debounce ===== */
  const handleQueryChange = (value) => {
    setQuery(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      searchAddress(value);
    }, 500); // 0.5s debounce
  };

  const searchAddress = async (value) => {
    if (!value || value.length < 3) {
      setResults([]);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&countrycodes=vn&q=${encodeURIComponent(
          value
        )}`
      );
      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error("Nominatim fetch error:", err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  /* ===== Lấy vị trí hiện tại ===== */
  const locateMe = () => {
    if (!navigator.geolocation || !mapInstance.current) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;

        mapInstance.current.setView([latitude, longitude], 16, { animate: true });

        markerRef.current.setLatLng([latitude, longitude]);
        circleRef.current.setLatLng([latitude, longitude]);

        setPosition({ lat: latitude, lng: longitude });
      },
      () => alert("Không lấy được vị trí hiện tại")
    );
  };

  /* ===== Cleanup when close ===== */
  useEffect(() => {
    if (!open && mapInstance.current) {
      mapInstance.current.remove();
      mapInstance.current = null;
      markerRef.current = null;
      circleRef.current = null;

      hasLocatedRef.current = false;
      setResults([]);
      setQuery("");
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white w-[650px] rounded-xl p-4">
        <h2 className="text-lg font-semibold mb-3">
          {viewOnly ? "Vị trí hiện tại" : "Chọn vị trí chấm công"}
        </h2>

        {/* ===== Search ===== */}
        <div className="relative mb-3">
          <input
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Nhập địa chỉ hoặc địa danh"
            className="w-full border rounded px-3 py-2"
          />

          {loading && <div className="text-sm text-gray-500 mt-1">Đang tìm...</div>}

          {!loading && query.length >= 3 && results.length === 0 && (
            <div className="text-sm text-gray-500 mt-1">Không tìm thấy kết quả</div>
          )}

          {results.length > 0 && (
            <ul className="absolute z-[9999] bg-white border w-full max-h-48 overflow-auto rounded shadow mt-1">
              {results.map((item) => (
                <li
                  key={item.place_id}
                  onClick={() => {
                    updatePosition(Number(item.lat), Number(item.lon));
                    setQuery(item.display_name);
                    setResults([]);
                  }}
                  className="px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm"
                >
                  {item.display_name}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ===== Action buttons ===== */}
        <div className="flex gap-2 mb-2">
          <button
            onClick={locateMe}
            className="px-3 py-1 text-sm bg-green-600 text-white rounded"
          >
            📍 Vị trí hiện tại
          </button>
        </div>

        {/* ===== Map ===== */}
        <div ref={mapRef} className="w-full h-[400px] rounded" />

        {!viewOnly && (
          <>
            {/* ===== Radius ===== */}
            <div className="mt-3">
              <label className="text-sm font-medium block mb-1">
                Bán kính: {radius} m
              </label>
              <input
                type="range"
                min={50}
                max={1000}
                step={50}
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </>
        )}

        {/* ===== Footer ===== */}
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
          >
            {viewOnly ? "Đóng" : "Hủy"}
          </button>
          {!viewOnly && (
            <button
              onClick={() =>
                onConfirm({ lat: position.lat, lng: position.lng, radius, address: query })
              }
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              Xác nhận
            </button>
          )}
          {viewOnly && (
            <button
              onClick={() => onConfirm({ lat: position.lat, lng: position.lng, address: query })}
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              Xong
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
