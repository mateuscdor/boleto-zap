import api from '../services/api';
import { currentDatePlus } from './dates';

async function getBoletosQueVenceraoDaqui(dias: number) {
  const dataVencimento = currentDatePlus(dias);

  const response = await api.get(
    `/boletos?situacaoBoleto=10&dtTipo=dtVenc&dtIni=${dataVencimento}&dtFim=${dataVencimento}&orderBy=dtVenc,desc`
  );

  const boletos = response.data;

  return { ...boletos, diasParaVencer: dias };
}

export default getBoletosQueVenceraoDaqui;
