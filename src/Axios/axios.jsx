import axios from "axios";

// Base URL from .env
const BASE_URL = import.meta.env.VITE_API_URL;

// Token helper
const getToken = () => localStorage.getItem("token");

// JSON headers
const getHeaders = () => {
  const token = getToken();

  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// File upload headers
const getFileHeaders = () => {
  const token = getToken();

  return {
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// GET
export const getData = async (url, params = {}) => {
  try {
    const res = await axios.get(`${BASE_URL}${url}`, {
      headers: getHeaders(),
      params,
    });
    return res.data;
  } catch (err) {
    throw err.response?.data || err.message;
  }
};

// POST
export const postData = async (url, data) => {
  try {
    const res = await axios.post(`${BASE_URL}${url}`, data, {
      headers: getHeaders(),
    });
    return res.data;
  } catch (err) {
    throw err.response?.data || err.message;
  }
};

// FILE UPLOAD POST
export const uploadFile = async (url, formData) => {
  try {
    const res = await axios.post(`${BASE_URL}${url}`, formData, {
      headers: getFileHeaders(),
    });
    return res.data;
  } catch (err) {
    throw err.response?.data || err.message;
  }
};

// PUT
export const putData = async (url, data) => {
  try {
    const res = await axios.put(`${BASE_URL}${url}`, data, {
      headers: getHeaders(),
    });
    return res.data;
  } catch (err) {
    throw err.response?.data || err.message;
  }
};

// PATCH
export const patchData = async (url, data) => {
  try {
    const res = await axios.patch(`${BASE_URL}${url}`, data, {
      headers: getHeaders(),
    });
    return res.data;
  } catch (err) {
    throw err.response?.data || err.message;
  }
};

// DELETE
export const deleteData = async (url) => {
  try {
    const res = await axios.delete(`${BASE_URL}${url}`, {
      headers: getHeaders(),
    });
    return res.data;
  } catch (err) {
    throw err.response?.data || err.message;
  }
};