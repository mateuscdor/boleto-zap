import { DateTime } from 'luxon';

// GMT -03:00 (Brasilia Standard Time)
function currentDate() {
  return DateTime.now().setZone('America/Sao_Paulo');
}

function currentDatePlus(days: number) {
  return currentDate().plus({ days }).toISODate();
}

export { currentDate, currentDatePlus };
