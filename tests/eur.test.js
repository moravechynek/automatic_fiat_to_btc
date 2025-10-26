const { convertText, parseNumber } = require('../script');

const RATES = { bitcoin: { czk: 2575238, eur: 105670, usd: 122947 } };

const DESCRIPTION = 'sats';

test('EUR float', () => {
  const input = "89,99 €";
  const output = convertText(input, RATES);
  const price = Math.round(89.99/RATES.bitcoin.eur*100000000);
  expect(output).toMatch("85 161 " + DESCRIPTION);
});