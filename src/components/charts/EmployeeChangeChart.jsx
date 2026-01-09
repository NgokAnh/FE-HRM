import { useEffect, useState } from "react";
import { getEmployees } from "../../api/employeeApi";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function EmployeeChangeChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const employees = await getEmployees();

        // Lấy 6 tháng gần nhất
        const today = new Date();
        const last6Months = Array.from({ length: 6 }, (_, i) => {
          const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
          return { month: d.getMonth() + 1, year: d.getFullYear() };
        }).reverse(); // đảo để hiển thị từ cũ → mới

        const chartData = last6Months.map(({ month, year }) => {
          const newCount = employees.filter(
            (e) =>
              e.hiredDate &&
              new Date(e.hiredDate).getFullYear() === year &&
              new Date(e.hiredDate).getMonth() + 1 === month
          ).length;

          const leaveCount = employees.filter(
            (e) =>
              e.status === "INACTIVE" &&
              e.updatedAt &&
              new Date(e.updatedAt).getFullYear() === year &&
              new Date(e.updatedAt).getMonth() + 1 === month
          ).length;

          return {
            month: `T${month}`,
            new: newCount,
            leave: leaveCount,
          };
        });

        setData(chartData);
      } catch (error) {
        console.error(error);
      }
    }

    fetchData();
  }, []);

  // EmployeeChangeChart.jsx
return (
  <>

    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="leave" fill="#93c5fd" radius={[4, 4, 0, 0]} />
          <Bar dataKey="new" fill="#137fec" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>

    <div className="flex gap-6 justify-center text-sm mt-4">
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-[#93c5fd]" />
        <span>Nghỉ việc</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-primary" />
        <span>Tuyển mới</span>
      </div>
    </div>
  </>
);
}