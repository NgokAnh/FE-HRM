export default function AccountTab({ employee }) {
  const hasAccount = employee?.account?.hasAccount;

  return (
    <div className="space-y-6">
      {!hasAccount ? (
        <>
          <h3 className="font-semibold text-lg">
            Khởi tạo tài khoản đăng nhập
          </h3>

          <div className="space-y-4">
            <Input
              label="Tên đăng nhập"
              defaultValue={employee.id}
            />
            <Input label="Mật khẩu" type="password" />
            <Input label="Nhập lại mật khẩu" type="password" />
          </div>

          <div className="flex justify-end gap-3">
            <button className="px-4 py-2 rounded-lg bg-gray-100">
              Hủy
            </button>
            <button className="px-4 py-2 rounded-lg bg-blue-600 text-white">
              Tạo tài khoản
            </button>
          </div>
        </>
      ) : (
        <>
          <h3 className="font-semibold text-lg">
            Đổi mật khẩu
          </h3>

          <div className="space-y-4">
            <Input
              label="Tên đăng nhập"
              disabled
              defaultValue={employee.account.username}
            />
            <Input label="Mật khẩu hiện tại" type="password" />
            <Input label="Mật khẩu mới" type="password" />
            <Input label="Nhập lại mật khẩu mới" type="password" />
          </div>

          <div className="flex justify-end">
            <button className="px-4 py-2 rounded-lg bg-blue-600 text-white">
              Cập nhật mật khẩu
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/* ================= INPUT ================= */

function Input({ label, ...props }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">
        {label}
      </label>
      <input
        {...props}
        className="w-full px-4 py-2 rounded-lg border
        focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100"
      />
    </div>
  );
}