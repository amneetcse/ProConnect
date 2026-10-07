import axios from "axios";

export const BASE_URL = "https://proconnect-uqo5.onrender.com";

const clientServer = axios.create({
  baseURL: BASE_URL,
});

export default clientServer;