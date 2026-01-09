export default function AddEmployeeTabs({ tab, setTab }) {
  return (
    <div className="flex gap-8 px-6 border-b">
      <Tab active={tab === "info"} onClick={() => setTab("info")}>
        Thông tin
      </Tab>

      <Tab active={tab === "salary"} onClick={() => setTab("salary")}>
        Thiết lập lương
      </Tab>

      <Tab active={tab === "account"} onClick={() => setTab("account")}>
        Tài khoản
      </Tab>
    </div>
  );
}

function Tab({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`pb-3 font-medium border-b-2 transition ${
        active
          ? "border-blue-600 text-black"
          : "border-transparent text-gray-400 hover:text-gray-700"
      }`}
    >
      {children}
    </button>
  );
}