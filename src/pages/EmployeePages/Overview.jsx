import { useEffect, useState } from "react";
import { getEmployee } from "../../api/employeeApi";
import { getWorkSchedulesByEmployeeAndDateRange } from "../../api/workScheduleApi";
import { getMyAttendances, checkIn } from "../../api/attendanceApi";
import ProfileCard from "../../components/employeecomponents/ProfileCard";
import ChangePasswordForm from "../../components/employeecomponents/ChangePasswordForm";

/* ===================== CheckInButton ===================== */
const CheckInButton = ({ onClick }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-primary to-blue-400 rounded-xl shadow-lg mb-6 text-white"
  >
    <div className="flex items-center gap-3">
      <div className="h-12 w-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
        <span className="material-symbols-outlined text-2xl sm:text-3xl">
          fingerprint
        </span>
      </div>
      <div className="flex flex-col items-start">
        <span className="font-bold text-sm sm:text-base">Chấm công ngay</span>
        <span className="text-xs sm:text-sm text-blue-100">08:30 AM - Vào ca</span>
      </div>
    </div>
    <span className="material-symbols-outlined text-xl sm:text-2xl">
      arrow_forward
    </span>
  </button>
);

/* ===================== StatsGrid ===================== */
const StatsGrid = ({ attendances }) => {
  if (!attendances) return null;

  const totalDays = attendances.length;
  const late = attendances.filter((a) => a.late).length;
  const earlyLeave = attendances.filter((a) => a.earlyLeave).length;
  const overtime = attendances.reduce((acc, a) => acc + (a.overtimeMinutes || 0), 0) / 60; // giờ
  const salary = totalDays * 625000; // ví dụ tạm tính lương/ngày

  const stats = [
    { label: "Ngày công", value: `${totalDays}/${totalDays}`, icon: "calendar_month", bg: "green-100", color: "green-600" },
    { label: "Đi muộn", value: late, icon: "timer", bg: "orange-100", color: "orange-600" },
    { label: "Về sớm", value: earlyLeave, icon: "alarm", bg: "red-100", color: "red-600" },
    { label: "Lương tạm tính", value: `${salary.toLocaleString()} ₫`, icon: "payments", bg: "blue-100", color: "blue-600" },
    { label: "Làm thêm giờ", value: `${overtime.toFixed(1)}h`, icon: "work_history", bg: "purple-100", color: "purple-600" },
  ];

  return (
    <div className="mb-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {stats.map((s) => (
        <div key={s.label} className="bg-white p-4 rounded-xl shadow-sm flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-md bg-${s.bg}`}>
              <span className={`material-symbols-outlined text-lg text-${s.color}`}>{s.icon}</span>
            </div>
            <span className="text-slate-500 text-xs sm:text-sm font-medium">{s.label}</span>
          </div>
          <p className="text-slate-900 text-xl sm:text-2xl font-bold">{s.value}</p>
        </div>
      ))}
    </div>
  );
};

/* ===================== NextShiftCard ===================== */
const NextShiftCard = ({ shift }) => {
  if (!shift) return null;

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
      <p className="text-slate-500 text-xs sm:text-sm font-medium mb-2">Ca làm tiếp theo</p>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-900 font-bold">{shift.startTime} - {shift.endTime}</p>
          <p className="text-slate-500 text-xs sm:text-sm">{shift.workDate}</p>
        </div>
        <span className="material-symbols-outlined text-blue-600 text-3xl sm:text-4xl">
          calendar_today
        </span>
      </div>
    </div>
  );
};

/* ===================== Overview Page ===================== */
export default function Overview() {
  const [employee, setEmployee] = useState(null);
  const [attendances, setAttendances] = useState([]);
  const [workSchedules, setWorkSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showChangePassword, setShowChangePassword] = useState(false);

  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Lấy user từ localStorage
        const emp = JSON.parse(localStorage.getItem("user"));
        const empId = emp?.id;
        console.log("🔹 Employee từ localStorage:", emp);
        if (!empId) throw new Error("Không tìm thấy employeeId trong localStorage");

        // Lấy thông tin nhân viên
        const empData = await getEmployee(empId);
        console.log("🔹 Employee data từ API:", empData);
        setEmployee(empData);

        // Tuần hiện tại
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - startDate.getDay());
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));
        const startStr = startDate.toISOString().slice(0, 10);
        const endStr = endDate.toISOString().slice(0, 10);
        console.log("🔹 Tuần hiện tại:", startStr, "~", endStr);

        // Lấy lịch làm việc
        const schedulesRes = await getWorkSchedulesByEmployeeAndDateRange(empId, startStr, endStr);
        console.log("🔹 Response WorkSchedules:", schedulesRes);
        const schedules = Array.isArray(schedulesRes?.schedules) ? schedulesRes.schedules : [];
        console.log("🔹 WorkSchedules array:", schedules);
        setWorkSchedules(schedules);

        // Lấy chấm công
        const attendanceData = await getMyAttendances(empId, startStr, endStr);
        console.log("🔹 Attendances raw:", attendanceData);
        const attendancesArray = Array.isArray(attendanceData) ? attendanceData : [];
        console.log("🔹 Attendances array:", attendancesArray);
        setAttendances(attendancesArray);

        // Debug mapping WorkSchedule -> Attendance
        schedules.forEach(ws => {
          const hasAttendance = attendancesArray.some(a => a.workScheduleId === ws.id);
          if (!hasAttendance) {
            console.warn(`⚠️ Ca ${ws.workDate} (${ws.startTime}-${ws.endTime}) chưa có attendance`);
          }
        });

      } catch (error) {
        console.error("⚠️ Lỗi khi lấy dữ liệu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCheckIn = async () => {
    if (!employee) return;
    const todaySchedule = workSchedules.find((ws) => ws.workDate === today);
    if (!todaySchedule) return alert("Hôm nay bạn không có ca nào để chấm công.");

    try {
      await checkIn(employee.id, todaySchedule.id, 10.762622, 106.660172, 5);
      alert("Chấm công thành công!");
    } catch (error) {
      alert("Lỗi check-in: " + error.message);
    }
  };

  if (loading) return <p>Đang tải dữ liệu...</p>;

  return (
    <div className="flex-1 px-4 sm:px-6 lg:px-8 py-6 relative">
      <ProfileCard employee={employee} onChangePassword={() => setShowChangePassword(true)} />
      <CheckInButton onClick={handleCheckIn} />
      <StatsGrid attendances={attendances} />
      <NextShiftCard shift={workSchedules[0]} />
      {showChangePassword && <ChangePasswordForm onClose={() => setShowChangePassword(false)} />}
    </div>
  );
}