export default function AddEmployeeTabs({ tab, setTab }) {
  return (
    <div className="flex gap-8 px-6 border-b">
      <button
        onClick={() => setTab("info")}
        className={`pb-3 font-medium ${
          tab === "info"
            ? "border-b-2 border-blue-600 text-black"
            : "text-gray-400"
        }`}
      >
        Thông tin
      </button>

      <button
        onClick={() => setTab("salary")}
        className={`pb-3 font-medium ${
          tab === "salary"
            ? "border-b-2 border-blue-600 text-black"
            : "text-gray-400"
        }`}
      >
        Thiết lập lương
      </button>
    </div>
  );
}