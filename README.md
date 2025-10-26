# Automatic fiat to Bitcoin price converter

## Installation

1. Install [Tampermonkey](https://www.tampermonkey.net/)

2. Add new user script and copy script.js content to it

3. Now you can browse any e-shop and see [almost all](#limitations) prices in satoshis.

## Usage

If you don't want to restart a browser every time you use the script, let the Tampermonkey extension be always ✅ Enabled.

1. Enable script (name: Fiat to satoshis)
2. Visit the page you want to convert prices on
    - if you do step 2 first and then step 1, you have to reload the page
3. (Optional) disable script

|                 | menu command   | shortcut       | description                                                                      |
|-----------------|----------------|----------------|----------------------------------------------------------------------------------|
| convert to sats | Convert        | Ctrl + Alt + C |scan page without API request, useful for dynamic price conversion                |
| update rates    | Update rates   | Ctrl + Alt + G |request for latest rates, API is available only few times per minute              |

## How it work's

The script goes through all elements on a website and converts prices to satoshis.

## Limitations

- Some price formats haven't been implemented yet:
  - 100 - 1000 Kč bad conversion to 100 - 42 081 sats (100 Kč - 1000 Kč, is ok)
- $, € and czk only (for now)
- Free API is available only few times per minute

## Tests

```bash
cd .\tests\

npm install --save-dev

npm test
```

## Support

If you find this script useful, you can support development.

Bitcoin: bc1qfddfsf7l3eh6rsh4k2q2wdazfnjfewn0pzycer

![BTC_address](./imgs/btc_address.png)