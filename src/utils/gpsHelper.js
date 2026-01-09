/**
 * GPS Helper Functions
 * Các hàm tiện ích để kiểm tra và hiển thị vị trí GPS
 */

/**
 * Mở Google Maps với vị trí GPS
 * @param {number} lat - Vĩ độ
 * @param {number} lng - Kinh độ
 */
export function openInGoogleMaps(lat, lng) {
  const url = `https://www.google.com/maps?q=${lat},${lng}`;
  window.open(url, "_blank");
}

/**
 * Mở Google Maps với vị trí GPS (dạng embed)
 * @param {number} lat - Vĩ độ
 * @param {number} lng - Kinh độ
 */
export function getGoogleMapsUrl(lat, lng) {
  return `https://www.google.com/maps?q=${lat},${lng}`;
}

/**
 * Tính khoảng cách giữa 2 điểm GPS (Haversine formula)
 * @param {number} lat1 - Vĩ độ điểm 1
 * @param {number} lng1 - Kinh độ điểm 1
 * @param {number} lat2 - Vĩ độ điểm 2
 * @param {number} lng2 - Kinh độ điểm 2
 * @returns {number} Khoảng cách tính bằng mét
 */
export function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371e3; // Bán kính Trái Đất tính bằng mét
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Khoảng cách tính bằng mét
}

/**
 * Format vị trí để hiển thị
 * @param {number} lat - Vĩ độ
 * @param {number} lng - Kinh độ
 * @returns {string} Vị trí đã format
 */
export function formatLocation(lat, lng) {
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
}

/**
 * Kiểm tra vị trí có hợp lý không (trong phạm vi Việt Nam)
 * @param {number} lat - Vĩ độ
 * @param {number} lng - Kinh độ
 * @returns {boolean} true nếu hợp lý
 */
export function isValidVietnamLocation(lat, lng) {
  // Việt Nam: 8.5°N - 23.5°N, 102°E - 110°E
  return lat >= 8.5 && lat <= 23.5 && lng >= 102 && lng <= 110;
}

/**
 * Test vị trí GPS - Mở Google Maps và hiển thị thông tin
 * Có thể gọi từ console: testGPSLocation(10.886064, 106.781978)
 * @param {number} lat - Vĩ độ
 * @param {number} lng - Kinh độ
 * @param {number} accuracy - Độ chính xác (meters)
 */
export function testGPSLocation(lat, lng, accuracy = null) {
  console.log("🧪 [TEST GPS] Kiểm tra vị trí GPS:");
  console.log("📍 Vị trí:", { lat, lng });
  if (accuracy) {
    console.log("📏 Độ chính xác:", `${accuracy}m`);
    console.log("📊 Đánh giá:", accuracy <= 20 ? "Rất tốt" : accuracy <= 50 ? "Tốt" : accuracy <= 100 ? "Chấp nhận được" : "Kém");
  }
  
  const isValid = isValidVietnamLocation(lat, lng);
  console.log("✅ Vị trí", isValid ? "hợp lý" : "KHÔNG hợp lý", "cho Việt Nam");
  
  const mapsUrl = getGoogleMapsUrl(lat, lng);
  console.log("🗺️ Link Google Maps:", mapsUrl);
  console.log("💡 Click link trên để xem vị trí trên bản đồ");
  
  // Tự động mở Google Maps
  openInGoogleMaps(lat, lng);
  
  return {
    lat,
    lng,
    accuracy,
    isValid,
    mapsUrl,
  };
}

// Export để có thể gọi từ console
if (typeof window !== "undefined") {
  window.testGPSLocation = testGPSLocation;
  window.openInGoogleMaps = openInGoogleMaps;
  console.log("💡 Bạn có thể test GPS bằng cách gọi: testGPSLocation(lat, lng, accuracy)");
  console.log("💡 Ví dụ: testGPSLocation(10.886064, 106.781978, 52)");
}

