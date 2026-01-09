import { useEffect, useState } from "react";
import StatCard from "../components/StatCard";
import EmployeeChangeChart from "../components/charts/EmployeeChangeChart";
import SalaryChart from "../components/charts/SalaryChart";
import { getDashboardData } from "../api/dashboardApi";


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
    async function fetchData() {
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
    }
    fetchData();
  }, []);

  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="p-8">
      {/* Top Stat Cards */}
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

      {/* Employee Change Chart - full width */}
        <div className="mb-6 w-full">
          <div className="flex flex-col rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
            <h3 className="text-gray-900 dark:text-white text-base font-semibold mb-4">
              Biến động nhân sự
            </h3>

            {loading.totalEmployees ? (
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-gray-400 mx-auto"></div>
            ) : (
              // 👉 DIV BẮT BUỘC PHẢI CÓ HEIGHT
              <div className="h-[320px] w-full">
                <EmployeeChangeChart />
              </div>
            )}
          </div>
        </div>

      {/* Attendance & Salary */}
      <div className="grid xl:grid-cols-2 gap-6">
        {/* Attendance */}
<div className="flex flex-col rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
  <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700/50">
    <div>
      <h3 className="text-gray-900 dark:text-white text-base font-semibold">
        Tóm tắt Chấm công
      </h3>
      <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
        Toàn công ty - Tháng hiện tại
      </p>
    </div>
    <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg p-2">
      <span className="material-symbols-outlined">calendar_month</span>
    </div>
  </div>

  <div className="p-6">
    {/* 🔍 LOG TRẠNG THÁI */}
    {console.log("🔍 loading.attendance:", loading.attendance)}
    {console.log("📊 stats.attendance:", stats.attendance)}

    {loading.attendance ? (
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-gray-400 mx-auto"></div>
    ) : (
      <>
        {/* ⚠️ CHECK NULL / UNDEFINED */}
        {!stats.attendance ? (
          <div className="text-sm text-red-500">
            ❌ stats.attendance is undefined / null
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="flex flex-col p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-100 dark:border-gray-700">
              <p className="text-gray-500 dark:text-gray-400 text-xs font-medium uppercase mb-1">
                Tổng ngày công
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.attendance.totalDays}
              </p>
            </div>

            <div className="flex flex-col p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
              <p className="text-blue-600 dark:text-blue-400 text-xs font-medium uppercase mb-1">
                Giờ làm thêm
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.attendance.overtime}h
              </p>
            </div>

            <div className="flex flex-col p-4 bg-orange-50 dark:bg-orange-900/10 rounded-lg border border-orange-100 dark:border-orange-900/20">
              <p className="text-orange-600 dark:text-orange-400 text-xs font-medium uppercase mb-1">
                Lượt đi muộn
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.attendance.late}
              </p>
            </div>

            <div className="flex flex-col p-4 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
              <p className="text-red-600 dark:text-red-400 text-xs font-medium uppercase mb-1">
                Lượt về sớm
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.attendance.earlyLeave}
              </p>
            </div>
          </div>
        )}
      </>
    )}
  </div>
</div>

        {/* Salary */}
        <div className="flex flex-col rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700/50">
            <div>
              <h3 className="text-gray-900 dark:text-white text-base font-semibold">Thông tin Lương</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Kỳ lương tới: {stats.salary?.nextPayDate}</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg p-2">
              <span className="material-symbols-outlined">attach_money</span>
            </div>
          </div>
          <div className="p-6 flex flex-col h-full">
            {loading.salary ? (
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-gray-400 mx-auto"></div>
            ) : (
              <>
                <div className="flex flex-col gap-2 mb-8">
                  <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">Tổng quỹ lương dự kiến</span>
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-bold text-primary">{stats.salary.totalFund} đ</span>
                    <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                      <span className="material-symbols-outlined text-sm">trending_up</span>
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