import axiosClient from "./axiosClient";

const BASE_URL = "/salaries";

// Danh sách bảng lương
export async function getSalaries(params = {}) {
  const response = await axiosClient.get(BASE_URL, { params });
  return response.data.data || [];
}

// Chi tiết bảng lương
export async function getSalary(id) {
  const response = await axiosClient.get(`${BASE_URL}/${id}`);
  return response.data.data;
}

// Tổng hợp bảng lương (tổng quỹ, tổng nhân viên theo tháng)
export async function getSalarySummary(params = {}) {
  const response = await axiosClient.get(`${BASE_URL}/summary`, { params });
  return response.data.data || [];
}

// Tính lương
export async function calculateSalary(payload) {
  const response = await axiosClient.post(`${BASE_URL}/calculate`, payload);
  return response.data.data;
}

// Cập nhật bảng lương
export async function updateSalary(id, payload) {
  const response = await axiosClient.put(`${BASE_URL}/${id}`, payload);
  return response.data.data;
}