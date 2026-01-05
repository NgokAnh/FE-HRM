# API Optimization - Week View BY SHIFT

## 📋 Tổng Quan

View "Tuần" → "Theo ca" đang gọi API theo pattern 3-tier tương tự "Theo nhân viên"

---

## 🔴 CŨ: Luồng API Hiện Tại (N + N×M calls)

### Bước 1: Lấy danh sách ca làm việc active
```
GET /api/v1/shifts/active
```
**Số lần gọi:** 1 call

**Response:**
```json
[
  {
    "id": 1,
    "name": "Ca Sáng",
    "startTime": "08:00:00",
    "endTime": "12:00:00",
    "standardHours": 4,
    "colorCode": "#3B82F6"
  },
  {
    "id": 2,
    "name": "Ca Chiều",
    "startTime": "13:00:00",
    "endTime": "17:00:00",
    "standardHours": 4,
    "colorCode": "#10B981"
  }
]
```

---

### Bước 2: Lấy work schedules cho TỪNG ca
```
GET /api/v1/work-schedules/shift/{shiftId}/date-range?startDate=2025-12-22&endDate=2025-12-28
```

**Request params:**
- `shiftId`: ID của shift (gọi riêng cho TỪNG ca)
- `startDate`: Ngày đầu tuần (YYYY-MM-DD)
- `endDate`: Ngày cuối tuần (YYYY-MM-DD)

**Số lần gọi:** N calls (1 cho mỗi shift, ví dụ: 5 shifts = 5 calls)

**Response (ResShiftListWorkSchedule):**
```json
{
  "shift": {
    "id": 1,
    "name": "Ca Sáng",
    "startTime": "08:00:00",
    "endTime": "12:00:00",
    "standardHours": 4,
    "colorCode": "#3B82F6"
  },
  "dailySchedules": [
    {
      "date": "2025-12-22",
      "schedules": [
        {
          "id": 201,
          "workDate": "2025-12-22",
          "employee": {
            "id": 10,
            "fullname": "Nguyễn Văn A",
            "email": "a@gmail.com"
          }
        },
        {
          "id": 202,
          "workDate": "2025-12-22",
          "employee": {
            "id": 15,
            "fullname": "Trần Thị B",
            "email": "b@gmail.com"
          }
        }
      ]
    },
    {
      "date": "2025-12-23",
      "schedules": [...]
    }
  ]
}
```

---

### Bước 3: Lấy attendance cho TỪNG work schedule
```
GET /api/v1/attendances/my/{workScheduleId}?employeeId={employeeId}
```

**Request params:**
- `workScheduleId`: ID của work schedule (từ Bước 2)
- `employeeId`: ID nhân viên (từ schedule.employee.id)

**Số lần gọi:** N × M calls
- N = Số ca (ví dụ: 5 shifts)
- M = Tổng số schedules trong 1 tuần cho tất cả các ca (ví dụ: 200 schedules)
- **= 200 calls**

**Response (ResAttendance hoặc null):**
```json
{
  "id": 501,
  "checkIn": "2025-12-22T08:05:00",
  "checkOut": "2025-12-22T12:10:00",
  "lateTime": 5,
  "earlyLeaveTime": 0,
  "overtime": 10,
  "status": "PRESENT"
}
```

---

## 📊 TỔNG KẾT

**Giả sử:** 
- 5 shifts (Ca Sáng, Ca Chiều, Ca Tối, Ca Đêm, Ca Hành Chính)
- Mỗi ca có ~40 work schedules trong tuần (7 ngày × ~6 nhân viên/ngày)
- Tổng: 5 shifts × 40 schedules = 200 work schedules

```
Bước 1: 1 call (get active shifts)
Bước 2: 5 calls (get schedules for each shift)
Bước 3: 200 calls (get attendance for each schedule)
----------------------------------------
TỔNG: 206 API calls ❌
```

---

## 🟢 ĐỀ XUẤT: API MỚI (1 call)

### Endpoint
```
GET /api/v2/work-schedules/weekly-by-shift?startDate=2025-12-22&endDate=2025-12-28
```

### Request Parameters
| Param       | Type      | Required | Format     | Example    |
| ----------- | --------- | -------- | ---------- | ---------- |
| `startDate` | LocalDate | ✅ Yes    | YYYY-MM-DD | 2025-12-22 |
| `endDate`   | LocalDate | ✅ Yes    | YYYY-MM-DD | 2025-12-28 |

---

### Response Structure

```json
{
  "startDate": "2025-12-22",
  "endDate": "2025-12-28",
  "shifts": [
    {
      "shift": {
        "id": 1,
        "name": "Ca Sáng",
        "startTime": "08:00:00",
        "endTime": "12:00:00",
        "standardHours": 4,
        "colorCode": "#3B82F6"
      },
      "dailySchedules": [
        {
          "date": "2025-12-22",
          "schedules": [
            {
              "id": 201,
              "workDate": "2025-12-22",
              "employee": {
                "id": 10,
                "fullname": "Nguyễn Văn A",
                "email": "a@gmail.com"
              },
              "attendance": {
                "id": 501,
                "checkIn": "2025-12-22T08:05:00",
                "checkOut": "2025-12-22T12:10:00",
                "lateTime": 5,
                "earlyLeaveTime": 0,
                "overtime": 10,
                "status": "PRESENT"
              }
            },
            {
              "id": 202,
              "workDate": "2025-12-22",
              "employee": {
                "id": 15,
                "fullname": "Trần Thị B",
                "email": "b@gmail.com"
              },
              "attendance": null
            }
          ]
        },
        {
          "date": "2025-12-23",
          "schedules": [...]
        }
      ]
    },
    {
      "shift": {
        "id": 2,
        "name": "Ca Chiều",
        "startTime": "13:00:00",
        "endTime": "17:00:00",
        "standardHours": 4,
        "colorCode": "#10B981"
      },
      "dailySchedules": [...]
    }
  ]
}
```

---

## 📊 Response Model Chi Tiết

### ResWeeklyShiftSchedules (Root Object)
```typescript
interface ResWeeklyShiftSchedules {
  startDate: string;        // YYYY-MM-DD
  endDate: string;          // YYYY-MM-DD
  shifts: ShiftSchedule[];
}
```

### ShiftSchedule
```typescript
interface ShiftSchedule {
  shift: Shift;
  dailySchedules: DailySchedule[];
}
```

### Shift
```typescript
interface Shift {
  id: number;
  name: string;
  startTime: string;        // HH:MM:SS
  endTime: string;          // HH:MM:SS
  standardHours: number;    // Số giờ chuẩn
  colorCode: string;        // Hex color (e.g., "#3B82F6")
}
```

### DailySchedule
```typescript
interface DailySchedule {
  date: string;             // YYYY-MM-DD
  schedules: WorkScheduleWithAttendance[];
}
```

### WorkScheduleWithAttendance
```typescript
interface WorkScheduleWithAttendance {
  id: number;               // Work schedule ID
  workDate: string;         // YYYY-MM-DD
  employee: Employee;
  attendance: Attendance | null;  // null nếu chưa chấm công
}
```

### Employee
```typescript
interface Employee {
  id: number;
  fullname: string;
  email: string;
}
```

### Attendance
```typescript
interface Attendance {
  id: number;
  checkIn: string;          // ISO DateTime (YYYY-MM-DDTHH:MM:SS)
  checkOut: string | null;  // ISO DateTime hoặc null nếu chưa check out
  lateTime: number;         // Phút đi muộn
  earlyLeaveTime: number;   // Phút về sớm
  overtime: number;         // Phút làm thêm
  status: string;           // PRESENT, ABSENT, etc.
}
```

---

## 🔧 Logic Backend Cần Thực Hiện

### SQL Strategy

```sql
-- 1. Lấy tất cả shifts active
SELECT * FROM shifts WHERE status = 'ACTIVE'

-- 2. JOIN work_schedules với employees theo date range và shift
LEFT JOIN work_schedules ws ON ws.shift_id = s.id 
  WHERE ws.work_date BETWEEN :startDate AND :endDate

-- 3. JOIN employees để lấy thông tin nhân viên
JOIN employees e ON e.id = ws.employee_id

-- 4. LEFT JOIN attendances để lấy dữ liệu chấm công
LEFT JOIN attendances a ON a.work_schedule_id = ws.id

-- 5. GROUP BY shift_id, work_date để nhóm theo ca và ngày
```

### Response Building Logic

```java
for (Shift shift : activeShifts) {
    ShiftSchedule shiftSchedule = new ShiftSchedule();
    shiftSchedule.setShift(shift);
    
    // Group work schedules by date
    Map<LocalDate, List<WorkSchedule>> schedulesByDate = 
        workScheduleRepository.findByShiftAndDateRange(shift.getId(), startDate, endDate)
            .stream()
            .collect(Collectors.groupingBy(WorkSchedule::getWorkDate));
    
    List<DailySchedule> dailySchedules = new ArrayList<>();
    
    for (LocalDate date : dateRange) {
        DailySchedule daily = new DailySchedule();
        daily.setDate(date);
        
        List<WorkSchedule> schedulesForDay = schedulesByDate.get(date);
        
        if (schedulesForDay != null) {
            // Fetch attendance for each schedule
            for (WorkSchedule ws : schedulesForDay) {
                Attendance att = attendanceRepository.findByWorkScheduleId(ws.getId());
                ws.setAttendance(att); // Can be null
            }
            daily.setSchedules(schedulesForDay);
        } else {
            daily.setSchedules(Collections.emptyList());
        }
        
        dailySchedules.add(daily);
    }
    
    shiftSchedule.setDailySchedules(dailySchedules);
    shifts.add(shiftSchedule);
}
```

---

## ✅ Lợi Ích

| Metric              | Cũ (3 APIs)  | Mới (1 API) | Cải Thiện |
| ------------------- | ------------ | ----------- | --------- |
| **API Calls**       | 206 calls    | 1 call      | ⬇️ 99.51%  |
| **Thời gian load**  | 5-8 giây     | 200-500ms   | ⬇️ 90%+    |
| **SQL Queries**     | 206+ queries | 3-5 queries | Tối ưu    |
| **Network Latency** | Cao          | Thấp        | ⬇️ Đáng kể |

---

## 📝 Notes

### Điểm Quan Trọng

1. **Attendance có thể null:**
   - Nếu nhân viên chưa chấm công, trả về `attendance: null`
   - Frontend sẽ hiển thị "--" cho checkIn/checkOut

2. **Only Active Shifts:**
   - API chỉ trả về shifts có `status = ACTIVE`
   - Không bao gồm shifts đã bị xóa hoặc inactive

3. **Empty Schedules:**
   - Nếu 1 ngày không có nhân viên nào được phân ca → `schedules: []`
   - Frontend vẫn hiển thị ô trống với "-"

4. **Color Code:**
   - Mỗi shift có `colorCode` để frontend hiển thị màu border
   - Format: Hex color string (e.g., "#3B82F6")

---

## 🔄 So Sánh Với API weekly-summary

| Feature       | weekly-summary            | weekly-by-shift                |
| ------------- | ------------------------- | ------------------------------ |
| Group by      | Employee                  | Shift                          |
| Data          | Statistics (count, hours) | Full schedules with attendance |
| Use case      | Summary table             | Detail calendar view           |
| Response size | Small (aggregated)        | Large (raw data)               |

---

## 💡 Gợi Ý Tối Ưu Thêm

1. **Pagination:** Nếu có quá nhiều shifts hoặc schedules, có thể thêm limit/offset
2. **Caching:** Backend có thể cache response này 5-10 phút vì dữ liệu ít thay đổi
3. **Lazy Loading:** Frontend có thể lazy load attendance khi hover vào schedule box

---
