export const convertClientNumber: (n: string) => string = (number) => {
  const pureNumber = number.replace(/[^0-9]/g,"");

  if (pureNumber.length === 7) {
    return `+375${pureNumber}`;
  }

  if (pureNumber.length === 9 && pureNumber[0] === '8' && pureNumber[1] === '0') {
    return `+375${pureNumber.slice(2)}`;
  }

  if (pureNumber.length === 10 && pureNumber[0] === '3' && pureNumber[1] === '7' && pureNumber[2] === '5') {
    return `+${pureNumber}`;
  }

  return null;
}
