import api from '../services/api';

function setApiAuthHeader(accessToken: string) {
  api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
}

export default setApiAuthHeader;
