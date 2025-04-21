export const convertClientNumber: (n: string) => string = (number) => {
  const pureNumber = number.replace(/[^0-9]/g, '');

  if (pureNumber.length === 9) {
    return `+375${pureNumber}`;
  }

  if (
    pureNumber.length === 11 &&
    pureNumber[0] === '8' &&
    pureNumber[1] === '0'
  ) {
    return `+375${pureNumber.slice(2)}`;
  }

  if (
    pureNumber.length === 12 &&
    pureNumber[0] === '3' &&
    pureNumber[1] === '7' &&
    pureNumber[2] === '5'
  ) {
    return `+${pureNumber}`;
  }

  if (pureNumber.length === 11 && pureNumber[0] === '7') {
    return `+${pureNumber}`;
  }

  return '';
};
