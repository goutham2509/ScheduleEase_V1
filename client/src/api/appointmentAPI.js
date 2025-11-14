import axiosClient from "./axiosClient";

export const createAppointment = async (payload) => {
  const res = await axiosClient.post("/appointments", payload);
  return res.data;
};

export const getAppointments = async () => {
  const res = await axiosClient.get("/appointments");
  return res.data;
};