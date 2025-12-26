import FormSection from "../common/FormSection";
import { Input } from "../common/Input";
import { Select } from "../common/Select";

export default function EmployeeInfoForm() {
  return (
    <div className="space-y-8">

      {/* ẢNH ĐẠI DIỆN */}
      <FormSection title="Ảnh đại diện">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="material-symbols-outlined text-3xl">
              person
            </span>
          </div>

          <div className="flex gap-3">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg">
              Tải ảnh lên
            </button>
            <button className="px-4 py-2 border rounded-lg">
              Xóa
            </button>
          </div>
        </div>
      </FormSection>

      {/* THÔNG TIN CÁ NHÂN */}
      <FormSection title="Thông tin cá nhân">
        <div className="grid grid-cols-2 gap-6">
          <Input label="Họ và tên *" placeholder="Ví dụ: Nguyễn Văn A" />
          <Input label="Ngày sinh" type="date" />

          <Select label="Giới tính">
            <option>Chọn giới tính</option>
          </Select>

          <Input label="Số điện thoại" placeholder="0905 xxx xxx" />

          <Input label="Email" placeholder="email@company.com" />
          <Input label="CCCD/CMND" placeholder="Nhập số thẻ định danh" />

          <Input
            label="Địa chỉ hiện tại"
            placeholder="Số nhà, tên đường, phường/xã..."
            full
          />
        </div>
      </FormSection>

      {/* THÔNG TIN CÔNG VIỆC */}
      <FormSection title="Thông tin công việc">
        <div className="grid grid-cols-2 gap-6">
          <Input label="Mã nhân viên" value="NV-2023-108" />

          <Input
            label="Ngày bắt đầu làm việc"
            type="date"
          />

          <Select label="Phòng ban *">
            <option>Chọn phòng ban</option>
          </Select>

          <Input label="Chức danh *" placeholder="Ví dụ: Lập trình viên Senior" />

          <Select label="Người quản lý trực tiếp">
            <option>Chọn người quản lý</option>
          </Select>

          <Select label="Loại hợp đồng">
            <option>Toàn thời gian</option>
          </Select>
        </div>
      </FormSection>
    </div>
  );
}