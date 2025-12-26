import StatCard from "../components/StatCard";
import EmployeeChangeChart from "../components/charts/EmployeeChangeChart";
import EmployeeStructureChart from "../components/charts/EmployeeStructureChart";

export default function Dashboard() {
  return (
    <>
      <div className="grid sm:grid-cols-3 gap-6 mb-6">
        <StatCard title="Tổng số nhân viên" value="152" percent="+1.2%" positive />
        <StatCard title="Nhân viên mới" value="5" percent="+5%" positive />
        <StatCard title="Nhân viên nghỉ việc" value="2" percent="-2%" />
      </div>

      <div className="grid xl:grid-cols-2 gap-6">
        <EmployeeChangeChart />
        <EmployeeStructureChart />
      </div>
    </>
  );
}