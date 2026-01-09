/**
 * GPS Utility Functions
 * Wrapper cho Browser Geolocation API với error handling
 */

/**
 * Lấy vị trí GPS hiện tại
 * @param {Object} options - Options cho geolocation
 * @param {boolean} options.enableHighAccuracy - Bật độ chính xác cao (default: true)
 * @param {number} options.timeout - Timeout tính bằng ms (default: 15000)
 * @param {number} options.maximumAge - Cache age tính bằng ms (default: 0)
 * @param {number} options.maxAccuracy - Accuracy tối đa chấp nhận được (meters, default: 50)
 * @returns {Promise<{lat: number, lng: number, accuracy: number}>}
 */
export function getCurrentLocation(options = {}) {
  const {
    enableHighAccuracy = true,
    timeout = 15000,
    maximumAge = 0,
    maxAccuracy = 50,
  } = options;

  console.log("📍 [GPS] Bắt đầu lấy vị trí GPS...", {
    enableHighAccuracy,
    timeout,
    maximumAge,
    maxAccuracy,
  });

  return new Promise((resolve, reject) => {
    // Kiểm tra browser có hỗ trợ Geolocation không
    if (!navigator.geolocation) {
      console.error("❌ [GPS] Trình duyệt không hỗ trợ Geolocation API");
      reject(new Error("Trình duyệt không hỗ trợ Geolocation API"));
      return;
    }

    console.log(
      "✅ [GPS] Browser hỗ trợ Geolocation, đang gọi getCurrentPosition..."
    );

    const startTime = Date.now();

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const elapsed = Date.now() - startTime;
        const {
          latitude,
          longitude,
          accuracy,
          altitude,
          altitudeAccuracy,
          heading,
          speed,
        } = position.coords;

        console.log("✅ [GPS] Nhận được vị trí từ browser:", {
          latitude,
          longitude,
          accuracy: `${Math.round(accuracy)}m`,
          altitude,
          altitudeAccuracy,
          heading,
          speed,
          timestamp: position.timestamp,
          elapsed: `${elapsed}ms`,
        });

        // Validate accuracy (cho phép lệch 10m để linh hoạt hơn)
        const allowedAccuracy = maxAccuracy + 10;
        if (accuracy > allowedAccuracy) {
          console.warn(
            `⚠️ [GPS] Độ chính xác quá thấp: ${Math.round(accuracy)}m > ${allowedAccuracy}m`
          );
          reject(
            new Error(
              `Độ chính xác GPS quá thấp (${Math.round(accuracy)}m). Vui lòng di chuyển ra ngoài trời hoặc thử lại.`
            )
          );
          return;
        } else if (accuracy > maxAccuracy) {
          console.warn(
            `⚠️ [GPS] Độ chính xác hơi thấp: ${Math.round(accuracy)}m > ${maxAccuracy}m (nhưng vẫn chấp nhận)`
          );
        }

        const result = {
          lat: latitude,
          lng: longitude,
          accuracy: Math.round(accuracy),
        };

        console.log("✅ [GPS] Vị trí hợp lệ, trả về kết quả:", result);
        resolve(result);
      },
      (error) => {
        const elapsed = Date.now() - startTime;
        console.error("❌ [GPS] Lỗi khi lấy vị trí:", {
          code: error.code,
          message: error.message,
          elapsed: `${elapsed}ms`,
        });

        let errorMessage = "Không thể lấy vị trí GPS";

        // Check error code (1 = PERMISSION_DENIED, 2 = POSITION_UNAVAILABLE, 3 = TIMEOUT)
        if (error.code === 1 || error.code === error.PERMISSION_DENIED) {
          console.error(
            "❌ [GPS] PERMISSION_DENIED - Người dùng từ chối quyền"
          );
          // Kiểm tra xem có browser extension đang can thiệp không
          const hasExtension =
            error.stack?.includes("chrome-extension://") ||
            error.stack?.includes("moz-extension://");
          if (hasExtension) {
            errorMessage =
              "Browser extension đang chặn quyền truy cập vị trí. Vui lòng:\n1. Tắt các extension liên quan đến privacy/security\n2. Hoặc thử ở chế độ Incognito\n3. Sau đó reload trang và thử lại";
          } else {
            errorMessage =
              'Bạn đã từ chối quyền truy cập vị trí. Vui lòng:\n1. Click vào icon khóa ở thanh địa chỉ\n2. Cho phép "Vị trí"\n3. Reload trang và thử lại';
          }
        } else if (
          error.code === 2 ||
          error.code === error.POSITION_UNAVAILABLE
        ) {
          console.error(
            "❌ [GPS] POSITION_UNAVAILABLE - Vị trí không khả dụng"
          );
          errorMessage =
            "Vị trí không khả dụng. Vui lòng kiểm tra GPS và thử lại.";
        } else if (error.code === 3 || error.code === error.TIMEOUT) {
          console.error("❌ [GPS] TIMEOUT - Hết thời gian chờ");
          errorMessage = "Hết thời gian chờ lấy vị trí. Vui lòng thử lại.";
        } else {
          console.error("❌ [GPS] Lỗi không xác định:", error);
          errorMessage = "Lỗi không xác định khi lấy vị trí.";
        }

        reject(new Error(errorMessage));
      },
      {
        enableHighAccuracy,
        timeout,
        maximumAge,
      }
    );
  });
}

/**
 * Kiểm tra browser có hỗ trợ Geolocation không
 */
export function isGeolocationSupported() {
  const supported = !!navigator.geolocation;
  console.log(
    `📍 [GPS] Browser ${supported ? "hỗ trợ" : "KHÔNG hỗ trợ"} Geolocation API`
  );
  return supported;
}

/**
 * Kiểm tra quyền truy cập vị trí
 * @returns {Promise<boolean>} true nếu có quyền, false nếu không
 */
export async function checkLocationPermission() {
  console.log("📍 [GPS] Đang kiểm tra quyền truy cập vị trí...");

  if (!isGeolocationSupported()) {
    console.log("❌ [GPS] Browser không hỗ trợ Geolocation");
    return false;
  }

  try {
    // Thử lấy vị trí với timeout ngắn để check permission
    const hasPermission = await new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        () => {
          console.log("✅ [GPS] Có quyền truy cập vị trí");
          resolve(true);
        },
        (error) => {
          if (error.code === error.PERMISSION_DENIED) {
            console.log(
              "❌ [GPS] Không có quyền truy cập vị trí (PERMISSION_DENIED)"
            );
            resolve(false);
          } else {
            console.log("✅ [GPS] Có quyền nhưng có lỗi khác:", error.code);
            resolve(true); // Có quyền nhưng có lỗi khác
          }
        },
        { timeout: 1000 }
      );
    });
    return hasPermission;
  } catch (err) {
    console.error("❌ [GPS] Lỗi khi kiểm tra quyền:", err);
    return false;
  }
}
