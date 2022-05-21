import api from '../services/api';

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

export default getAccessToken;
