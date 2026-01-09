function EditAttendanceModal({ isOpen, onClose, schedule, onSave }) {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");

  // Helper: Chuyển ISO string sang HH:mm để hiện thị trong ô input type="time"
  const formatToTimeInput = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleTimeString('vi-VN', { hour12: false, hour: '2-digit', minute: '2-digit' });
  };

  useEffect(() => {
    if (schedule?.attendance) {
      setCheckIn(formatToTimeInput(schedule.attendance.checkIn));
      setCheckOut(formatToTimeInput(schedule.attendance.checkOut));
    } else {
      setCheckIn("");
      setCheckOut("");
    }
  }, [schedule, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    // Trả về dữ liệu giờ đã sửa
    onSave(schedule.id, { checkIn, checkOut });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl p-6 w-[400px] shadow-2xl">
        <h3 className="text-lg font-bold mb-4">Chỉnh sửa giờ chấm công</h3>
        <p className="text-sm text-gray-600 mb-4">Nhân viên: <b>{schedule.employee.fullname}</b></p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Giờ vào (Check-in)</label>
            <input 
              type="time" 
              className="w-full border rounded-lg px-3 py-2"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Giờ ra (Check-out)</label>
            <input 
              type="time" 
              className="w-full border rounded-lg px-3 py-2"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Hủy</button>
          <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Lưu thay đổi</button>
        </div>
      </div>
    </div>
  );
}