# 📅 Luồng Hoạt Động - Tính Năng "Lịch Làm Việc"

## 📍 Route & Component

**Route:** `/admin/schedule`  
**Component:** `WorkSchedule.jsx`  
**Modal:** `CreateScheduleModal.jsx`

---

## 🎯 Tổng Quan Chức Năng

Tính năng quản lý lịch làm việc cho phép:
- ✅ Xem lịch làm việc theo 2 chế độ: **Theo lịch** (Calendar) và **Theo nhân viên** (Employee)
- ✅ Thêm/Sửa/Xóa lịch làm việc
- ✅ Điều hướng theo tuần (Previous/Next week)
- ✅ Tự động sắp xếp theo thời gian ca làm việc
- ✅ Hỗ trợ tạo lịch lặp lại hằng ngày

---

## 🔄 Luồng Hoạt Động Chi Tiết

### 1️⃣ **KHỞI TẠO TRANG (Component Mount)**

```javascript
useEffect(() => {
  fetchWeekData();
}, [weekStartDate]);
```

**Khi vào trang `/admin/schedule`:**

1. **Tính toán tuần hiện tại:**
   - `getStartOfWeek()` → lấy Chủ nhật đầu tuần
   - Tạo mảng 7 ngày (CN → T7)

2. **Gọi API song song:**
   ```javascript
   // API #1: Lấy danh sách nhân viên
   GET /api/v1/employees
   
   // API #2-8: Lấy lịch làm việc cho 7 ngày trong tuần
   GET /api/v1/work-schedules/date/2026-01-05
   GET /api/v1/work-schedules/date/2026-01-06
   GET /api/v1/work-schedules/date/2026-01-07
   ...
   GET /api/v1/work-schedules/date/2026-01-11
   ```

3. **Xử lý response:**
   - Merge tất cả schedules từ 7 API calls
   - Map schedules thành `calendarData`:
     ```javascript
     {
       "2026-01-05": [
         {
           id: 201,
           employee: "Nguyễn Văn A",
           label: "Ca Sáng (08:00-12:00)",
           color: "#3B82F6",
           ws: { ...rawScheduleData }
         }
       ]
     }
     ```

4. **Render UI:**
   - Hiển thị lưới 7×N (7 ngày × N nhân viên/ca)
   - Sắp xếp schedules theo thời gian bắt đầu ca

---

### 2️⃣ **CHỨC NĂNG XEM LỊCH**

#### **A. Chế Độ "Theo Lịch" (Calendar View)**

**Layout:** Lưới 7 cột theo ngày trong tuần

**Mỗi ô ngày hiển thị:**
- Ngày (số)
- Danh sách schedules trong ngày
- Mỗi schedule card có:
  - Tên nhân viên (bold)
  - Tên ca làm việc
  - Thời gian (start-end)
  - Ghi chú (nếu có)
  - Màu sắc theo shift.colorCode

**Tương tác:**
- Click vào ô trống → Mở modal ADD
- Click vào schedule card → Mở modal EDIT
- Hover → Hiện nút Edit/Delete

**Sắp xếp trong mỗi ô:**
```javascript
// Sort theo:
1. Thời gian bắt đầu ca (startTime) - tăng dần
2. Tên nhân viên (alphabetical) - nếu cùng startTime
```

---

#### **B. Chế Độ "Theo Nhân Viên" (Employee View)**

**Layout:** Bảng với:
- Cột 1: Thông tin nhân viên (name, email/phone)
- Cột 2-8: Lịch của nhân viên trong 7 ngày

**Mỗi ô nhân viên-ngày hiển thị:**
- Danh sách shifts mà nhân viên được phân công
- Mỗi shift badge:
  - Tên ca
  - Thời gian
  - Nút xóa (hover)

**Lọc nhân viên (Client-side):**
```javascript
// Search by:
- fullname
- email
- phone
- id
```

---

### 3️⃣ **THÊM LỊCH MỚI (ADD)**

**Trigger:** Click vào ô ngày trống hoặc nút "+ Thêm"

**Luồng:**

1. **Mở modal CreateScheduleModal:**
   ```javascript
   setModalState({
     open: true,
     mode: "add",
     dateKey: "2026-01-05",
     schedule: null
   });
   ```

2. **Modal tự động load dữ liệu:**
   ```javascript
   // API #1: Lấy danh sách nhân viên
   GET /api/v1/employees
   
   // API #2: Lấy danh sách ca (active only)
   GET /api/v1/shifts
   ```

3. **User điền form:**
   - Chọn nhân viên (dropdown)
   - Chọn ca làm việc (dropdown)
   - Chọn ngày áp dụng (date picker)
   - **[Tùy chọn]** Lặp lại hằng ngày đến ngày X

4. **Validation trước khi submit:**
   ```javascript
   // Check duplicate: gọi API kiểm tra
   GET /api/v1/work-schedules/exists?employeeId=X&shiftId=Y&workDate=2026-01-05
   ```
   - Nếu `exists === true` → Show error "Lịch đã tồn tại"
   - Nếu `exists === false` → Cho phép tạo

5. **Submit:**
   
   **Case 1: Không lặp lại (single schedule)**
   ```javascript
   POST /api/v1/work-schedules
   Body: {
     employeeId: 10,
     shiftId: 1,
     workDate: "2026-01-05"
   }
   ```

   **Case 2: Lặp lại hằng ngày (repeat daily)**
   ```javascript
   // Tạo array dates từ workDate đến repeatUntil
   const dates = ["2026-01-05", "2026-01-06", ..., "2026-01-10"];
   
   // Gọi API song song cho mỗi ngày
   await Promise.all(
     dates.map(date => 
       createWorkSchedule({ employeeId, shiftId, workDate: date })
     )
   );
   ```

6. **Sau khi tạo thành công:**
   - Close modal
   - `fetchWeekData()` → Refresh lịch
   - Show success message (nếu có)

---

### 4️⃣ **SỬA LỊCH (EDIT)**

**Trigger:** Click vào schedule card

**Luồng:**

1. **Mở modal với mode="edit":**
   ```javascript
   setModalState({
     open: true,
     mode: "edit",
     dateKey: "2026-01-05",
     schedule: {
       id: 201,
       employee: { id: 10, fullname: "Nguyễn Văn A" },
       shift: { id: 1, name: "Ca Sáng", startTime: "08:00", endTime: "12:00" },
       workDate: "2026-01-05"
     }
   });
   ```

2. **Modal prefill form:**
   - Employee: Pre-select employee.id
   - Shift: Pre-select shift.id
   - Work Date: Pre-fill workDate
   - **Disable** repeat option (edit không cho lặp)

3. **User chỉnh sửa:**
   - Có thể đổi nhân viên
   - Có thể đổi ca
   - Có thể đổi ngày

4. **Submit:**
   ```javascript
   PATCH /api/v1/work-schedules/{id}
   Body: {
     employeeId: 15,  // đổi nhân viên
     shiftId: 2,      // đổi ca
     workDate: "2026-01-06"  // đổi ngày
   }
   ```

5. **Sau khi update thành công:**
   - Close modal
   - `fetchWeekData()` → Refresh lịch

---

### 5️⃣ **XÓA LỊCH (DELETE)**

**Trigger:** Click nút "×" trên schedule card

**Luồng:**

1. **Confirm dialog:**
   ```javascript
   const ok = window.confirm(`Xóa lịch của "${employee.name}"?`);
   if (!ok) return;
   ```

2. **Gọi API xóa:**
   ```javascript
   DELETE /api/v1/work-schedules/{id}
   ```

3. **Update UI ngay lập tức (Optimistic Update):**
   ```javascript
   setSchedules(prev => prev.filter(x => x.id !== deletedId));
   ```

4. **Không cần refresh lại từ server** (UI đã update)

---

### 6️⃣ **ĐIỀU HƯỚNG TUẦN (Week Navigation)**

**Trigger:** Click nút "‹" (Previous) hoặc "›" (Next)

**Luồng:**

1. **Tính toán tuần mới:**
   ```javascript
   // Previous: -7 days
   // Next: +7 days
   const newDate = new Date(weekStartDate);
   newDate.setDate(weekStartDate.getDate() + offset);
   setWeekStartDate(newDate);
   ```

2. **useEffect trigger:**
   ```javascript
   useEffect(() => {
     fetchWeekData();
   }, [weekStartDate]);
   ```

3. **Fetch lại data cho 7 ngày mới:**
   - Repeat bước 1️⃣ (KHỞI TẠO TRANG)

---

## 📊 API Summary

| API Call | Method | Endpoint | Purpose | Called When |
|----------|--------|----------|---------|-------------|
| **Get Employees** | GET | `/api/v1/employees` | Lấy danh sách nhân viên | Page load, Modal open |
| **Get Shifts** | GET | `/api/v1/shifts` | Lấy danh sách ca | Modal open |
| **Get Schedules by Date** | GET | `/api/v1/work-schedules/date/{date}` | Lấy lịch của 1 ngày | Page load (×7 calls) |
| **Check Exists** | GET | `/api/v1/work-schedules/exists?...` | Kiểm tra duplicate | Before create |
| **Create Schedule** | POST | `/api/v1/work-schedules` | Tạo lịch mới | Submit Add form |
| **Update Schedule** | PATCH | `/api/v1/work-schedules/{id}` | Cập nhật lịch | Submit Edit form |
| **Delete Schedule** | DELETE | `/api/v1/work-schedules/{id}` | Xóa lịch | Click delete button |

---

## 🎨 UI Features

### Color Coding
- Mỗi shift có `colorCode` (hex) riêng
- Schedule cards sử dụng `rgba(colorCode, 0.22)` làm background
- Text color tự động: dark/light dựa vào luminance

### Sorting Logic
```javascript
// Sort schedules trong mỗi ô ngày:
1. startTime (ascending) - Ca sớm lên trước
2. employee.fullname (alphabetical) - Nếu cùng giờ
```

### Hover Effects
- Cell hover → Show "+ Thêm" button
- Schedule card hover → Show Edit/Delete buttons
- Smooth transitions với Tailwind classes

### Responsive
- Calendar view: Min-width với horizontal scroll
- Employee view: Fixed min-width 1000px
- Modal: Centered overlay với backdrop blur

---

## 🔧 Technical Details

### State Management
```javascript
const [mode, setMode] = useState("calendar");  // calendar | employee
const [weekStartDate, setWeekStartDate] = useState(getStartOfWeek());
const [schedules, setSchedules] = useState([]);
const [employees, setEmployees] = useState([]);
const [modalState, setModalState] = useState({
  open: false,
  mode: "add",
  dateKey: null,
  schedule: null
});
```

### Data Flow
```
1. Fetch raw schedules from API
   ↓
2. Map to calendarData { "YYYY-MM-DD": [...events] }
   ↓
3. Render Calendar/Employee view
   ↓
4. User action (Add/Edit/Delete)
   ↓
5. Call API
   ↓
6. Refresh schedules (fetchWeekData)
   ↓
7. Re-render with new data
```

### Performance Optimizations
- `useMemo` for calendarData mapping
- `useMemo` for filtered employees
- `useMemo` for weekDays calculation
- Optimistic UI update for delete (no refetch needed)

---

## 🐛 Edge Cases Handled

1. **No schedules for a day:** Shows empty cell with "+ Thêm" on hover
2. **Employee has no schedules:** Shows empty cells in employee view
3. **Duplicate schedule:** Prevented by `existsWorkSchedule` check
4. **Invalid time format:** `normalizeTime()` handles "HH:MM:SS" and "HH:MM"
5. **Missing shift color:** Defaults to `#22c55e` (green)
6. **API errors:** Shows error message, doesn't crash
7. **Loading states:** Shows "Đang tải..." during fetch

---

## 📝 Notes

### Modal Lock Scroll
```javascript
useEffect(() => {
  document.body.style.overflow = modalState.open ? "hidden" : "auto";
  return () => (document.body.style.overflow = "auto");
}, [modalState.open]);
```

### Date Format
- **Internal:** `YYYY-MM-DD` (ISO format for API)
- **Display:** `DD/MM` (Vietnamese format)

### Repeat Daily Logic
- Generates array of dates from `workDate` to `repeatUntil`
- Calls `createWorkSchedule` in parallel for each date
- Uses `Promise.all` for concurrent requests

---

## 🔄 Possible Optimizations

### API Call Reduction
**Current:** 7 API calls cho 7 ngày (GET by date)
**Optimize:** 1 API call cho cả tuần
```
GET /api/v2/work-schedules/weekly?startDate=2026-01-05&endDate=2026-01-11
```

**Benefits:**
- 7 calls → 1 call (giảm 85.7%)
- Faster load time
- Less network overhead

### Search Enhancement
**Current:** Client-side filter
**Optimize:** Server-side search
```
GET /api/v1/employees?search=nguyễn
```

---

## ✅ Summary

Tính năng "Lịch làm việc" cung cấp giao diện trực quan để quản lý phân công ca làm việc với:
- ✅ 2 chế độ xem linh hoạt
- ✅ CRUD operations đầy đủ
- ✅ Validation & error handling
- ✅ Smooth UX với optimistic updates
- ✅ Color-coded visual organization

**Total API calls per page load:** 1 (employees) + 7 (schedules) = **8 calls**  
**Optimization potential:** Có thể giảm xuống **2 calls** (employees + weekly schedules)
