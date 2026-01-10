// src/api/worksitesApi.js
import axiosNoVersion from "./axiosClient";

const BASE_URL = "/work-sites";

// ===================== Chuẩn hoá response backend =====================
const extractData = (response) => {
  const body = response?.data;
  if (!body) return body;
  if (Array.isArray(body)) return body;
  if (Array.isArray(body.data)) return body.data;
  if (Array.isArray(body.data?.items)) return body.data.items;
  return body;
};

// ===================== GET ACTIVE WORKSITES =====================
export async function getActiveWorksites() {
  const response = await axiosNoVersion.get(`${BASE_URL}/active`);
  const data = extractData(response);
  return Array.isArray(data) ? data : [];
}

// ===================== GET WORKSITE DETAIL =====================
export async function getWorksite(id) {
  if (id === undefined || id === null) throw new Error("id is required");
  const response = await axiosNoVersion.get(`${BASE_URL}/${id}`);
  return extractData(response);
}

// ===================== CREATE WORKSITE =====================
export async function createWorksite(dto) {
  if (!dto) throw new Error("dto is required");
  const response = await axiosNoVersion.post(BASE_URL, dto);
  return extractData(response);
}