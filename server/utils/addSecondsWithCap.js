import addSeconds from 'date-fns/add_seconds';

function addSecondsWithCap(date, seconds, capDate) {
  const nextDate = addSeconds(date, seconds);

  if (nextDate > capDate) {
    return capDate;
  }

  return nextDate;
}

export default addSecondsWithCap;
