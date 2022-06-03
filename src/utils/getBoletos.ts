import api from '../services/api';
import { currentDatePlus } from './dates';

async function getBoletos(diasFaltandoParaVencer: number, pagina: number) {
  const dataVencimento = currentDatePlus(diasFaltandoParaVencer);

  const response = await api.get(
    `/boletos?situacaoBoleto=10&dtTipo=dtVenc&dtIni=${dataVencimento}&dtFim=${dataVencimento}&page=${pagina}&orderBy=dtVenc,desc`
  );

  const boletos = response.data;

  return { ...boletos, diasParaVencer: diasFaltandoParaVencer };
}

export default getBoletos;
