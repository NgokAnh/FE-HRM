import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getSalaries } from "../api/salaryApi";

/* ==================== COMPONENT CHÍNH ==================== */
export default function Payroll() {
  const navigate = useNavigate();

  const [allPayrolls, setAllPayrolls] = useState([]); // dữ liệu đầy đủ sau khi gom
  const [payrolls, setPayrolls] = useState([]); // dữ liệu hiện thị theo trang
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const PAGE_SIZE = 10;

  // 🔹 Lấy dữ liệu bảng lương từ API, gom theo tháng
  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      // Lấy tất cả dữ liệu
      const params = { page: 1, size: 1000 };
      const data = await getSalaries(params); // API trả về mảng salaries

      // 🔹 Gom theo tháng
      const grouped = data.reduce((acc, item) => {
        const key = `${item.month}-${item.year}`;
        if (!acc[key]) {
          acc[key] = {
            monthKey: key,
            name: `Tháng ${item.month}`,
            fiscalYear: `Năm ${item.year}`,
            status: item.status.toLowerCase() === "draft" ? "processing" : "paid",
            totalEmployee: 0,
            totalSalary: 0,
            paidDate:
              item.status.toLowerCase() === "paid"
                ? `05/${item.month}/${item.year}`
                : "--",
          };
        }
        acc[key].totalEmployee += 1;
        acc[key].totalSalary += Number(item.finalSalary || 0); // camelCase đúng với API
        return acc;
      }, {});

      let mapped = Object.values(grouped).map((item) => ({
        ...item,
        totalSalary: item.totalSalary.toLocaleString("vi-VN") + "đ",
      }));

      // 🔹 Filter search
      if (search) {
        mapped = mapped.filter((item) =>
          item.name.toLowerCase().includes(search.toLowerCase())
        );
      }
      // 🔹 Filter năm
      if (yearFilter) {
        mapped = mapped.filter((item) => item.fiscalYear.includes(yearFilter));
      }
      // 🔹 Filter trạng thái
      if (statusFilter) {
        mapped = mapped.filter((item) => item.status === statusFilter);
      }

      setAllPayrolls(mapped);
      setTotal(mapped.length);

      // 🔹 Phân trang
      const start = (page - 1) * PAGE_SIZE;
      const end = start + PAGE_SIZE;
      setPayrolls(mapped.slice(start, end));
    } catch (err) {
      console.error("Lỗi khi lấy bảng lương:", err);
      setError(err.message || "Lỗi khi lấy bảng lương");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Khi thay đổi filter hoặc search
  useEffect(() => {
    setPage(1);
    fetchData();
  }, [search, yearFilter, statusFilter]);

  // 🔹 Khi đổi trang
  useEffect(() => {
    const start = (page - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    setPayrolls(allPayrolls.slice(start, end));
  }, [page, allPayrolls]);

  // Xử lý Filter
  const handleApplyFilter = () => {
    setPage(1);
    fetchData();
  };

  const handleClearFilter = () => {
    setSearch("");
    setYearFilter("");
    setStatusFilter("");
    setPage(1);
  };

  // Lấy danh sách các năm có trong dữ liệu để fill select
  const availableYears = Array.from(
    new Set(allPayrolls.map((p) => p.fiscalYear.replace("Năm ", "")))
  ).sort((a, b) => b - a);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Bảng lương</h1>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200">
            <span className="material-symbols-outlined">download</span>
            Xuất file
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
            <span className="material-symbols-outlined">add</span>
            Tạo kỳ lương mới
          </button>
        </div>
      </div>

      {/* FILTER */}
      <div className="bg-white rounded-xl p-6 border space-y-4">
        <div className="flex gap-4">
          <div className="flex-1 flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg">
            <span className="material-symbols-outlined text-gray-500">search</span>
            <input
              className="bg-transparent outline-none flex-1"
              placeholder="Tìm theo tên kỳ lương (VD: Tháng 12)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <button
            onClick={handleClearFilter}
            className="px-4 py-2 rounded-lg bg-gray-100"
          >
            Xóa bộ lọc
          </button>

          <button
            onClick={handleApplyFilter}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white"
          >
            Áp dụng
          </button>
        </div>

        <div className="flex gap-3">
          <FilterSelect
            label="Năm"
            value={yearFilter}
            onChange={setYearFilter}
            options={availableYears}
          />
          <FilterSelect
            label="Trạng thái"
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: "processing", label: "Đang xử lý" },
              { value: "paid", label: "Đã chi trả" },
            ]}
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="p-4"><input type="checkbox" /></th>
              <th className="p-4 text-left">Kỳ lương</th>
              <th className="p-4 text-left">Trạng thái</th>
              <th className="p-4 text-center">Tổng nhân viên</th>
              <th className="p-4 text-right">Tổng quỹ lương</th>
              <th className="p-4 text-center">Ngày chi trả</th>
              <th className="p-4 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="p-4 text-center text-gray-500">
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : payrolls.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-4 text-center text-gray-500">
                  Không có dữ liệu
                </td>
              </tr>
            ) : (
              payrolls.map((item) => (
                <tr key={item.monthKey} className="border-t hover:bg-gray-50">
                  <td className="p-4"><input type="checkbox" /></td>
                  <td className="p-4">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-gray-500">{item.fiscalYear}</div>
                  </td>
                  <td className="p-4">
                    {item.status === "processing" ? (
                      <span className="px-3 py-1 text-yellow-700 bg-yellow-100 rounded-full">
                        Đang xử lý
                      </span>
                    ) : (
                      <span className="px-3 py-1 text-green-700 bg-green-100 rounded-full">
                        Đã chi trả
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-center">{item.totalEmployee}</td>
                  <td className="p-4 text-right font-medium">{item.totalSalary}</td>
                  <td className="p-4 text-center text-gray-500">{item.paidDate}</td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => navigate(`/admin/payroll/${item.monthKey}`)}
                      className="text-blue-600 hover:underline"
                    >
                      Xem chi tiết
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* PAGINATION */}
        <div className="flex items-center justify-between p-4 text-sm text-gray-600">
          Hiển thị{" "}
          <b>{(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, total)}</b> trên <b>{total}</b>
          <div className="flex items-center gap-1">
            <PaginationBtn
              icon="chevron_left"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            />
            {Array.from({ length: Math.ceil(total / PAGE_SIZE) }, (_, i) => (
              <PaginationBtn
                key={i}
                label={i + 1}
                active={i + 1 === page}
                onClick={() => setPage(i + 1)}
              />
            ))}
            <PaginationBtn
              icon="chevron_right"
              onClick={() => setPage((p) => Math.min(Math.ceil(total / PAGE_SIZE), p + 1))}
              disabled={page === Math.ceil(total / PAGE_SIZE)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==================== COMPONENT PHỤ ==================== */
function FilterSelect({ label, value, onChange, options }) {
  return (
    <select
      className="flex-1 px-4 py-2 bg-gray-100 rounded-lg"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">{label}</option>
      {options.map((opt) =>
        typeof opt === "string" ? (
          <option key={opt} value={opt}>{opt}</option>
        ) : (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        )
      )}
    </select>
  );
}

function PaginationBtn({ label, icon, active, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-8 h-8 rounded border flex items-center justify-center
        ${active ? "bg-blue-600 text-white border-blue-600" : "bg-white"}
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {icon ? <span className="material-symbols-outlined text-[18px]">{icon}</span> : label}
    </button>
  );
}