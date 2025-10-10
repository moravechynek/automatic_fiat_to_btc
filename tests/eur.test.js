const { convertText, parseNumber } = require('../script');

const RATES = { bitcoin: { czk: 2575238, eur: 105670, usd: 122947 } };

const DESCRIPTION = 'sats';

test('EUR float', () => {
  const input = "89,99 €";
  const output = convertText(input, RATES);
  const price = (89.99/RATES.bitcoin.eur*100000000).toFixed(2);
  console.log(price);
  expect(output).toMatch(price + ' ' + DESCRIPTION);
});