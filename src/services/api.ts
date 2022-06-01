import axios from 'axios';
import 'dotenv/config';

const url = 'https://v4.egestor.com.br/api/v1';

const api = axios.create({
  baseURL: url,
});

async function getAccessToken() {
  const data = {
    grant_type: 'personal',
    personal_token: `${process.env.PERSONAL_TOKEN}`,
  };

  const response = await api.post(
    'https://v4.egestor.com.br/api/oauth/access_token',
    data
  );

  const accessToken = response.data.access_token;

  return accessToken;
}

function setApiAuthHeader(accessToken: string) {
  api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
}

// Set axios interceptor
api.interceptors.response.use(
  (response) => response,
  // eslint-disable-next-line consistent-return
  async (error) => {
    // if access token is invalid (code 401), generate new token
    if (error.response.data.errCode === 401) {
      const accessToken = await getAccessToken();
      // Set api default Auth Header with new token
      setApiAuthHeader(accessToken);

      // Set originalRequest Authorization header with new token and retry request
      const originalRequest = error.config;
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      return api.request(originalRequest);
    }

    console.error(error.response.data);
  }
);

export default api;
export { getAccessToken, setApiAuthHeader };
