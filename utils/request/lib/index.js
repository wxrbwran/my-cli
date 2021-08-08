'use strict';

const axios = require('axios');

const BASE_URL = process.env.XZL_CLI_BASE_URL || 'http://localhost:7001'

const request = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
})

request.interceptors.response.use(response => {
  if (response.status === 200) {
    return response.data;
  }
}, error => {
  return Promise.reject(new Error(error.message))
});



module.exports = request;


