import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { month: "T1", new: 4, leave: 6 },
  { month: "T2", new: 6, leave: 5 },
  { month: "T3", new: 2, leave: 8 },
  { month: "T4", new: 7, leave: 9 },
  { month: "T5", new: 2, leave: 1 },
  { month: "T6", new: 4, leave: 2 },
];

export default function EmployeeChangeChart() {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-6 bg-white dark:bg-gray-800">
      <div className="mb-4">
        <p className="font-semibold">Biến động nhân sự 6 tháng</p>
        <p className="text-sm text-gray-500">Tháng 1 - Tháng 6</p>
      </div>

      <div className="h-[260px]">
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
    </div>
  );
}