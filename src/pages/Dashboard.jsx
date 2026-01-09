import { useEffect, useState } from "react";
import StatCard from "../components/StatCard";
import EmployeeChangeChart from "../components/charts/EmployeeChangeChart";
import SalaryChart from "../components/charts/SalaryChart";
import { getDashboardData } from "../api/dashboardApi";

/* ===================== Utils ===================== */
const getCurrentWeekRange = () => {
  const today = new Date();
  const day = today.getDay() || 7; // CN = 7

  const start = new Date(today);
  start.setDate(today.getDate() - day + 1); // Thứ 2

  const end = new Date(start);
  end.setDate(start.getDate() + 6); // Chủ nhật

  const format = (d) => d.toLocaleDateString("vi-VN");

  return `${format(start)} - ${format(end)}`;
};

/* ===================== Component ===================== */
export default function Dashboard() {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState({
    totalEmployees: true,
    newEmployees: true,
    inactiveEmployees: true,
    attendance: true,
    salary: true,
  });
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getDashboardData();

        setStats({
          totalEmployees: data.totalEmployees,
          newEmployees: data.newEmployees,
          inactiveEmployees: data.inactiveEmployees,
          attendance: data.attendance,
          salary: data.salary,
        });

        setLoading({
          totalEmployees: false,
          newEmployees: false,
          inactiveEmployees: false,
          attendance: false,
          salary: false,
        });
      } catch (err) {
        console.error(err);
        setError("Không thể tải dữ liệu dashboard");
      }
    };

    fetchData();
  }, []);

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="p-8">
      {/* ===================== Stat Cards ===================== */}
      <div className="grid sm:grid-cols-3 gap-6 mb-6">
        <StatCard
          title="Tổng số nhân viên"
          value={stats.totalEmployees}
          positive
          loading={loading.totalEmployees}
        />

        <StatCard
          title="Nhân viên mới"
          value={stats.newEmployees}
          positive
          loading={loading.newEmployees}
        />

        <StatCard
          title="Nhân viên nghỉ việc"
          value={stats.inactiveEmployees}
          negative
          loading={loading.inactiveEmployees}
        />
      </div>

      {/* ===================== Employee Change Chart ===================== */}
      <div className="mb-6 w-full">
        <div className="flex flex-col rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
          <h3 className="text-gray-900 dark:text-white text-base font-semibold mb-4">
            Biến động nhân sự
          </h3>

          {loading.totalEmployees ? (
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-gray-400 mx-auto" />
          ) : (
            <div className="h-[320px] w-full">
              <EmployeeChangeChart />
            </div>
          )}
        </div>
      </div>

      {/* ===================== Attendance & Salary ===================== */}
      <div className="grid xl:grid-cols-2 gap-6">
        {/* -------- Attendance -------- */}
        <div className="flex flex-col rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700/50">
            <div>
              <h3 className="text-gray-900 dark:text-white text-base font-semibold">
                Tóm tắt Chấm công
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                Toàn công ty – Tuần hiện tại ({getCurrentWeekRange()})
              </p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg p-2">
              <span className="material-symbols-outlined">
                calendar_month
              </span>
            </div>
          </div>

          <div className="p-6">
            {loading.attendance ? (
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-gray-400 mx-auto" />
            ) : !stats.attendance ? (
              <div className="text-sm text-red-500">
                ❌ stats.attendance is undefined / null
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 mb-6">
                <StatItem
                  label="Tổng ngày công"
                  value={stats.attendance.totalDays}
                />

                <StatItem
                  label="Giờ làm thêm"
                  value={`${Math.round(stats.attendance.overtime)}h`}
                  variant="blue"
                />

                <StatItem
                  label="Lượt đi muộn"
                  value={stats.attendance.late}
                  variant="orange"
                />

                <StatItem
                  label="Lượt về sớm"
                  value={stats.attendance.earlyLeave}
                  variant="red"
                />
              </div>
            )}
          </div>
        </div>

        {/* -------- Salary -------- */}
        <div className="flex flex-col rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700/50">
            <div>
              <h3 className="text-gray-900 dark:text-white text-base font-semibold">
                Thông tin Lương
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                Kỳ lương tới: {stats.salary?.nextPayDate}
              </p>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg p-2">
              <span className="material-symbols-outlined">
                attach_money
              </span>
            </div>
          </div>

          <div className="p-6 flex flex-col h-full">
            {loading.salary ? (
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-gray-400 mx-auto" />
            ) : (
              <>
                <div className="flex flex-col gap-2 mb-8">
                  <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                    Tổng quỹ lương dự kiến
                  </span>

                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-bold text-primary">
                      {stats.salary.totalFund} đ
                    </span>

                    <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                      <span className="material-symbols-outlined text-sm">
                        trending_up
                      </span>
                      {stats.salary.growthPercent}%
                    </span>
                  </div>

                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    So với tháng trước ({stats.salary.previousFund} đ)
                  </p>
                </div>

                <div className="flex-1 min-h-[260px]">
                  <SalaryChart data={stats.salary.monthlyData} />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===================== Small Component ===================== */
function StatItem({ label, value, variant }) {
  const variants = {
    blue: "bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/20 text-blue-600 dark:text-blue-400",
    orange:
      "bg-orange-50 dark:bg-orange-900/10 border-orange-100 dark:border-orange-900/20 text-orange-600 dark:text-orange-400",
    red: "bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/20 text-red-600 dark:text-red-400",
    default:
      "bg-gray-50 dark:bg-gray-700/30 border-gray-100 dark:border-gray-700 text-gray-500 dark:text-gray-400",
  };

  return (
    <div
      className={`flex flex-col p-4 rounded-lg border ${
        variants[variant] || variants.default
      }`}
    >
      <p className="text-xs font-medium uppercase mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">
        {value}
      </p>
    </div>
  );
}