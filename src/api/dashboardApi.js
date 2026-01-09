// dashboardApi.js
import axiosClient from "./axiosClient";
import { getAttendanceSummaryCompanyV2 } from "../api/attendanceApi";

function getCurrentWeekRangeVN() {
  const now = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" })
  );

  const day = now.getDay() || 7; // CN = 7
  const monday = new Date(now);
  monday.setDate(now.getDate() - day + 1);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return {
    startDate: monday.toISOString().slice(0, 10),
    endDate: sunday.toISOString().slice(0, 10),
  };
}
/* =============================
   EMPLOYEE STATS
   ============================= */
export async function getTotalEmployees() {
  const response = await axiosClient.get("/employees");
  const employees = Array.isArray(response.data?.data)
    ? response.data.data
    : [];

  return employees.filter(emp => emp.status === "ACTIVE").length;
}

export async function getNewEmployees() {
  const response = await axiosClient.get("/employees");
  const employees = Array.isArray(response.data?.data)
    ? response.data.data
    : [];

  const today = new Date();
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(today.getMonth() - 1);

  return employees.filter(emp => {
    const hired = new Date(emp.hiredDate);
    return emp.status === "ACTIVE" && hired >= oneMonthAgo && hired <= today;
  }).length;
}

export async function getInactiveEmployees() {
  const response = await axiosClient.get("/employees");
  const employees = Array.isArray(response.data?.data)
    ? response.data.data
    : [];

  const today = new Date();
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(today.getMonth() - 1);

  return employees.filter(emp => {
    if (emp.status !== "INACTIVE" || !emp.updatedAt) return false;
    const updated = new Date(emp.updatedAt);
    return updated >= oneMonthAgo && updated <= today;
  }).length;
}


/* =============================
   ATTENDANCE SUMMARY (v2)
   TOÀN CÔNG TY – weekly-summary
   ============================= */
export async function getAttendanceSummaryThisWeek() {
  const { startDate, endDate } = getCurrentWeekRangeVN();

  return getAttendanceSummaryCompanyV2(startDate, endDate);
}

/* =============================
   SALARY DASHBOARD SUMMARY
   ============================= */
export async function getSalarySummary() {
  const response = await axiosClient.get("/salaries");

  const salaries = Array.isArray(response.data?.data)
    ? response.data.data
    : [];

  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();

  const currentSalaries = salaries.filter(
    s => s.month === currentMonth && s.year === currentYear
  );

  const totalFund = currentSalaries.reduce(
    (sum, s) => sum + (s.finalSalary || 0),
    0
  );

  const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;

  const prevSalaries = salaries.filter(
    s => s.month === prevMonth && s.year === prevYear
  );

  const previousFund = prevSalaries.reduce(
    (sum, s) => sum + (s.finalSalary || 0),
    0
  );

  const growthPercent =
    previousFund === 0
      ? 0
      : Math.round(((totalFund - previousFund) / previousFund) * 100);

  const rawMonthlyData = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(currentYear, currentMonth - 1 - i, 1);
    const m = d.getMonth() + 1;
    const y = d.getFullYear();

    const monthSalaries = salaries.filter(
      s => s.month === m && s.year === y
    );

    const amount = monthSalaries.reduce(
      (sum, s) => sum + (s.finalSalary || 0),
      0
    );

    rawMonthlyData.push({
      month: `${m}/${y}`,
      amount
    });
  }

  const maxAmount = Math.max(...rawMonthlyData.map(m => m.amount)) || 1;

  const monthlyData = rawMonthlyData.map(m => ({
    ...m,
    heightPercent: m.amount
      ? Math.round((m.amount / maxAmount) * 100)
      : 0
  }));

  return {
    totalFund,
    previousFund,
    growthPercent,
    nextPayDate: `${currentMonth}/${currentYear}`,
    monthlyData
  };
}

/* =============================
   DASHBOARD AGGREGATION
   ============================= */
export async function getDashboardData() {
  const [
    totalEmployees,
    newEmployees,
    inactiveEmployees,
    attendance,
    salary
  ] = await Promise.all([
    getTotalEmployees(),
    getNewEmployees(),
    getInactiveEmployees(),
    getAttendanceSummaryThisWeek(), // ✅ TUẦN
    getSalarySummary()
  ]);


  return {
    totalEmployees,
    newEmployees,
    inactiveEmployees,
    attendance,
    salary
  };
}