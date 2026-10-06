import axios from "axios";

const clientServer = axios.create({
  baseURL: "http://localhost:9080",
});

export default clientServer;