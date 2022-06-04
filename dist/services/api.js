"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setApiAuthHeader = exports.getAccessToken = void 0;
const axios_1 = __importDefault(require("axios"));
require("dotenv/config");
const url = 'https://v4.egestor.com.br/api/v1';
const api = axios_1.default.create({
    baseURL: url,
});
function getAccessToken() {
    return __awaiter(this, void 0, void 0, function* () {
        const data = {
            grant_type: 'personal',
            personal_token: `${process.env.PERSONAL_TOKEN}`,
        };
        const response = yield api.post('https://v4.egestor.com.br/api/oauth/access_token', data);
        const accessToken = response.data.access_token;
        return accessToken;
    });
}
exports.getAccessToken = getAccessToken;
function setApiAuthHeader(accessToken) {
    api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
}
exports.setApiAuthHeader = setApiAuthHeader;
// Set axios interceptor
api.interceptors.response.use((response) => response, 
// eslint-disable-next-line consistent-return
(error) => __awaiter(void 0, void 0, void 0, function* () {
    // if access token is invalid (code 401), generate new token
    if (error.response.data.errCode === 401) {
        const accessToken = yield getAccessToken();
        // Set api default Auth Header with new token
        setApiAuthHeader(accessToken);
        // Set originalRequest Authorization header with new token and retry request
        const originalRequest = error.config;
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api.request(originalRequest);
    }
    console.error(error.response.data);
}));
exports.default = api;
