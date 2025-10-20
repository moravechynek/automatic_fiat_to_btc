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

|                 | shortcut       | description                                                                       |
|-----------------|----------------|-----------------------------------------------------------------------------------|
| convert to sats | Ctrl + Alt + C | scan page without API request, useful for dynamic price conversion                |
| update rates    | Ctrl + Alt + G | request for latest rates, API is available only few times per minute              |

## How it work's

The script goes through all elements on a website and converts prices to satoshis.
This might increase loading time of a web page a bit.

## Limitations

- Some data structures are hard to extract and not implemented yet for example:
  - \<span\>50 Kč\<span\>/&nbsp;ks\</span\>\</span\>
  - \<div\>1&nbsp;123\<span\> – \</span\>3&nbsp;987&nbsp;Kč\</div\>
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