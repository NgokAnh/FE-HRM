import React, { memo } from "react";
import { formatTimeHHmm } from "../../../../utils/dateTime";
import {
  checkOverlapByClocks,
  getCheckInWindowState,
  getCheckOutDelayState,
  isNowWithinCheckInWindow,
  isNowAfterMaxCheckoutDelay,
  isNowAfterEnd,
} from "../../../../utils/timeRange";
import { hasUnfinishedPrevious } from "./attendanceUtils";

const TodaySchedulesList = memo(
  ({
    schedules,
    attendances,
    onCheckInOut,
    loading,
    loadingGPS,
    // workDateForChecks, // truyền schedule.workDate vào khi cần
  }) => {
    const hasSchedules = Array.isArray(schedules) && schedules.length > 0;

    const getScheduleStatus = (attendance) => {
      if (!attendance)
        return {
          text: "Chưa check-in",
          color: "gray",
          icon: "radio_button_unchecked",
        };
      if (attendance.status === "AUTO_CLOSED")
        return { text: "Đã tự đóng", color: "orange", icon: "warning" };
      if (attendance.checkOut)
        return { text: "Đã hoàn thành", color: "green", icon: "check_circle" };
      if (attendance.checkIn)
        return {
          text: "Đã check-in",
          color: "blue",
          icon: "radio_button_checked",
        };
      return {
        text: "Chưa check-in",
        color: "gray",
        icon: "radio_button_unchecked",
      };
    };

    // Warning overlap
    const overlappingWarnings = [];
    for (let i = 0; i < schedules.length; i++) {
      for (let j = i + 1; j < schedules.length; j++) {
        const s1 = schedules[i];
        const s2 = schedules[j];
        if (
          checkOverlapByClocks(
            s1.workDate,
            s1.shift?.startTime,
            s1.shift?.endTime,
            s2.shift?.startTime,
            s2.shift?.endTime
          )
        ) {
          overlappingWarnings.push({
            shift1: s1.shift?.name || `Ca ${i + 1}`,
            shift2: s2.shift?.name || `Ca ${j + 1}`,
          });
        }
      }
    }

    const sortedSchedules = hasSchedules
      ? [...schedules].sort((a, b) =>
          (a.shift?.startTime || "").localeCompare(b.shift?.startTime || "")
        )
      : [];

    return (
      <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">
              today
            </span>
            Ca làm hôm nay
          </h4>
        </div>

        <div className="p-4 space-y-4">
          {!hasSchedules && (
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <span className="material-symbols-outlined">info</span>
              <span className="text-sm">Hôm nay bạn không có ca làm việc</span>
            </div>
          )}

          {/* {hasSchedules && overlappingWarnings.length > 0 && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5">
                  warning
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                    Cảnh báo: Có ca làm việc trùng giờ
                  </p>
                  <ul className="mt-1 text-xs text-yellow-700 dark:text-yellow-400 list-disc list-inside">
                    {overlappingWarnings.map((w, idx) => (
                      <li key={idx}>
                        {w.shift1} và {w.shift2}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )} */}

          <div className="space-y-3">
            {sortedSchedules.map((schedule) => {
            const attendance = attendances.find(
              (a) => a.workScheduleId === schedule.id
            );
            const status = getScheduleStatus(attendance);

            const checkInState = getCheckInWindowState(
              schedule.workDate,
              schedule.shift?.startTime,
              schedule.shift?.endTime,
              30 // giống BE
            );

            const checkOutState = getCheckOutDelayState(
              schedule.workDate,
              schedule.shift?.startTime,
              schedule.shift?.endTime,
              6 // giống BE
            );

            const canCheckIn =
              !attendance?.checkIn &&
              checkInState.allowed &&
              isNowWithinCheckInWindow(
                schedule.workDate,
                schedule.shift?.startTime,
                schedule.shift?.endTime,
                30 // giống BE
              );

            const canCheckOut =
              attendance?.checkIn &&
              !attendance?.checkOut &&
              attendance?.status !== "AUTO_CLOSED" &&
              checkOutState.allowed &&
              !isNowAfterMaxCheckoutDelay(
                schedule.workDate,
                schedule.shift?.startTime,
                schedule.shift?.endTime,
                6 // giống BE
              );

            const hasUnfinished = hasUnfinishedPrevious(
              schedules,
              schedule.id,
              attendances
            );
            const isAfterEnd = isNowAfterEnd(
              schedule.workDate,
              schedule.shift?.startTime,
              schedule.shift?.endTime
            );

            const showCheckInDisabled =
              !attendance?.checkIn &&
              !attendance?.checkOut &&
              attendance?.status !== "AUTO_CLOSED" &&
              !checkInState.allowed;

            const showCheckOutDisabled =
              attendance?.checkIn &&
              !attendance?.checkOut &&
              attendance?.status !== "AUTO_CLOSED" &&
              !checkOutState.allowed;

            const isCompleted =
              attendance?.status === "COMPLETED" ||
              (attendance?.checkIn && attendance?.checkOut);

            const showNoActionLabel =
              !canCheckIn &&
              !canCheckOut &&
              !showCheckInDisabled &&
              !showCheckOutDisabled &&
              !isCompleted;

            return (
              <div
                key={schedule.id}
                className={`bg-white dark:bg-surface-dark rounded-xl shadow-sm border-2 transition-all ${
                  "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                }`}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                          {schedule.shift?.name || "Ca làm việc"}
                        </h4>
                      </div>

                        {schedule.shift?.startTime &&
                          schedule.shift?.endTime && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {formatTimeHHmm(schedule.shift.startTime)} -{" "}
                              {formatTimeHHmm(schedule.shift.endTime)}
                            </p>
                          )}
                      </div>

                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full ${
                          status.color === "green"
                            ? "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"
                            : status.color === "blue"
                              ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                              : status.color === "orange"
                                ? "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400"
                                : "bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                        }`}
                      >
                        {status.text}
                      </span>
                    </div>

                    {(attendance?.checkIn || attendance?.checkOut) && (
                      <div className="space-y-1 mb-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                        {attendance?.checkIn && (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-500 dark:text-gray-400 min-w-[80px]">
                              Check-in:
                            </span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {formatTimeHHmm(attendance.checkIn)}
                            </span>
                          </div>
                        )}
                        {attendance?.checkOut && (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-500 dark:text-gray-400 min-w-[80px]">
                              Check-out:
                            </span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {formatTimeHHmm(attendance.checkOut)}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {attendance?.status === "AUTO_CLOSED" && (
                      <div className="mb-3 p-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                        <div className="flex items-start gap-2 text-orange-600 dark:text-orange-400 text-xs">
                          <span className="material-symbols-outlined text-sm">
                            warning
                          </span>
                          <span>
                            Ca này đã tự đóng sau 6 tiếng vì chưa checkout. Không
                            tính lương.
                          </span>
                        </div>
                      </div>
                  )}

                  <div className="flex items-center gap-2 mt-3">
                    <>
                      {hasUnfinished && (
                        <div className="flex-1 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-xs text-red-600 dark:text-red-400">
                          ⚠️ Cần check-out ca trước đó trước
                        </div>
                      )}

                      {!hasUnfinished && (
                        <>
                          {canCheckIn && (
                            <button
                              onClick={() => onCheckInOut(schedule, "checkin")}
                              disabled={loading || loadingGPS}
                              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm"
                            >
                              {loadingGPS
                                ? "Đang lấy GPS..."
                                : loading
                                  ? "Đang xử lý..."
                                  : "Check In"}
                            </button>
                          )}

                          {showCheckInDisabled && checkInState.reason && (
                            <div className="flex-1 text-xs text-gray-500 dark:text-gray-400">
                              {checkInState.reason}
                            </div>
                          )}

                          {canCheckOut && (
                            <button
                              onClick={() => onCheckInOut(schedule, "checkout")}
                              disabled={loading || loadingGPS}
                              className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm"
                            >
                              {loadingGPS
                                ? "Đang lấy GPS..."
                                : loading
                                  ? "Đang xử lý..."
                                  : "Check Out"}
                            </button>
                          )}

                          {showCheckOutDisabled && (
                            <div className="flex-1">
                              <button
                                disabled
                                className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-lg text-sm font-medium cursor-not-allowed"
                              >
                                Check Out
                              </button>
                              {checkOutState.reason && (
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                  {checkOutState.reason}
                                </p>
                              )}
                            </div>
                          )}

                          {showNoActionLabel && attendance?.status !== "AUTO_CLOSED" && (
                            <div className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-lg text-center text-sm">
                              {isAfterEnd
                                  ? "Đã quá giờ tan ca"
                                  : "Đã hoàn thành"}
                            </div>
                          )}
                        </>
                      )}
                    </>
                  </div>
                </div>
              </div>
            );
            })}
          </div>
        </div>
      </div>
    );
  }
);

TodaySchedulesList.displayName = "TodaySchedulesList";
export default TodaySchedulesList;
