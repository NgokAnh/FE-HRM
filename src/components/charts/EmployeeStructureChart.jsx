import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const data = [
  { name: "Kinh doanh", value: 40 },
  { name: "Marketing", value: 25 },
  { name: "Kỹ thuật", value: 20 },
  { name: "Khác", value: 15 },
];

const COLORS = ["#137fec", "#fb923c", "#2dd4bf", "#93c5fd"];

export default function EmployeeStructureChart() {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-6 bg-white dark:bg-gray-800">
      <p className="font-semibold mb-4">Cơ cấu nhân sự</p>

      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={70}
              outerRadius={100}
              paddingAngle={3}
              dataKey="value"
            >
              {data.map((_, index) => (
                <Cell key={index} fill={COLORS[index]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm mt-4">
        {data.map((item, index) => (
          <div key={item.name} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: COLORS[index] }}
            />
            <span>
              {item.name} ({item.value}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}