const { convertText, parseNumber } = require('../script');

const RATES = { bitcoin: { czk: 2575238, eur: 105670, usd: 122947 } };

const DESCRIPTION = 'sats';

test('CZK additional text', () => {
  const input = "42,90 Kč bez DPH";
  const output = convertText(input, RATES);
  const price = (42.90*RATES.bitcoin.czk/100000000).toFixed(2);
  expect(output).toMatch(price + ' ' + DESCRIPTION);
});

test('CZK float', () => {
  const input = "1,11 Kč";
  const output = convertText(input, RATES);
  const price = (1.11*RATES.bitcoin.czk/100000000).toFixed(2);
  expect(output).toMatch(price + ' ' + DESCRIPTION);
});

test('ignores non-price text', () => {
  const input = "10 kg";
  const output = convertText(input, RATES);
  expect(output).toBe(input);
});

test('CZK thousand', () => {
  const input = "1 000 Kč";
  const output = convertText(input, RATES);
  const price = (1000*RATES.bitcoin.czk/100000000).toFixed(2);
  expect(output).toMatch(price + ' ' + DESCRIPTION);
});

test('CZK million with float', () => {
  const input = "1 456 534,78 Kč";
  const output = convertText(input, RATES);
  const price = (1456534.78*RATES.bitcoin.czk/100000000).toFixed(2);
  expect(output).toMatch(price + ' ' + DESCRIPTION);
});

test('CZK per item', () => {
  const input = "68 Kč / ks";
  const output = convertText(input, RATES);
  const price = (68*RATES.bitcoin.czk/100000000).toFixed(2);
  expect(output).toMatch(price + ' ' + DESCRIPTION);
});