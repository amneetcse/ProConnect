const {default: axios} = require("axios");

export const BASE_URL = "http://localhost:9080"

const clientServer = axios.create({
    baseURL: BASE_URL,
})