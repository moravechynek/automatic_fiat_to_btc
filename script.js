// ==UserScript==
// @name         Fiat to satoshis
// @namespace    http://tampermonkey.net/
// @version      2025-10-26
// @description  Bitcoin website converter script
// @author       Me
// @iconURL      https://bitcoin.org/img/icons/opengraph.png
// @match        *://*/*
// @grant        GM_registerMenuCommand
// ==/UserScript==

(function () {
  "use strict";
  //console.log('HELLO BITCOIN');
  GM_registerMenuCommand("Convert", () => convert_to_satoshis());
  GM_registerMenuCommand("Update rates", () => convert_to_satoshis(true));
  let latest_rates = null;
  const priceRE =
    /(\d{1,3}(?:[\s.]?\d{3})*(?:,\d{1,2})?)(?:\s?)(Kč|CZK|€|\$|USD|EUR|,-)/gi;
  class InnerText {
    constructor(text, node) {
      this.text = text;
      this.node = node;
      this.type = this.detectType(text);
    }
    detectType(text) {
      const hasNumber = /\d/.test(text);
      const hasCurrency = /(Kč|CZK|€|\$|USD|EUR|,-)/i.test(text);
      if (hasNumber && hasCurrency) return "number_currency";
      if (hasNumber) return "number";
      if (hasCurrency) return "currency";
      return "other";
    }
    getNumberPart() {
      const match = this.text.match(/(\d{1,3}(?:[\s.]?\d{3})*(?:,\d{1,2})?)/);
      return match ? match[0] : null;
    }
    getCurrencyPart() {
      const match = this.text.match(/(Kč|CZK|€|\$|USD|EUR|,-)/i);
      return match ? match[0] : null;
    }
  }
  function collectInnerTexts(root) {
    const walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );
    const list = [];
    let node;
    while ((node = walker.nextNode())) {
      const text = node.textContent.trim();
      if (text) list.push(new InnerText(text, node));
    }
    return list;
  }
  function detectCurrency(suffix) {
    if (!suffix) return null;
    const s = suffix.toLowerCase();
    if (s.includes("kč") || s.includes("czk") || suffix === ",-") return "czk";
    if (s.includes("€") || s.includes("eur")) return "eur";
    if (s.includes("$") || s.includes("usd")) return "usd";
    return null;
  }
  function parseNumber(numStr) {
    const cleaned = numStr
      .replace(/\u00A0/g, "")
      .replace(/ /g, "")
      .replace(/\./g, "")
      .replace(/,/g, ".");
    return parseFloat(cleaned);
  }
  async function get() {
    const url =
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=czk,eur,usd";
    try {
      const response = await fetch(url);
      if (!response.ok) {
        console.error("HTTP Error:", response.status, response.statusText);
        if (latest_rates != null) {
          return latest_rates;
        }
        return null;
      }
      const data = await response.json();
      latest_rates = data;
      return data;
    } catch (err) {
      console.error("Fetch failed:", err);
      if (latest_rates != null) {
        return latest_rates;
      }
      return null;
    }
  }
  function convertText(elemText, rates) {
    return elemText.replace(priceRE, (match, numStr, suffix) => {
      let currency = detectCurrency(match) || detectCurrency(suffix);
      if (!currency) return match;
      let number = parseNumber(match);
      if (!Number.isFinite(number)) return match;
      let sats = Math.round((number / rates.bitcoin[currency]) * 1e8);
      return sats.toLocaleString() + " sats";
    });
  }
  function tryReplaceTexts(textNodes, rates) {
    for (let i = 0; i < textNodes.length; i++) {
      if (textNodes[i].type == "number_currency") {
        const replaced = convertText(textNodes[i].text, rates);
        if (replaced !== textNodes[i].text) {
          textNodes[i].node.textContent = replaced;
        }
        continue;
      } else if (textNodes[i].type !== "number") continue;
      let combined = textNodes[i].text;
      let nodesToReplace = [textNodes[i]];

      if (i + 1 < textNodes.length) {
        if (textNodes[i + 1].type !== "currency") continue;
        combined += textNodes[i + 1].text;
        nodesToReplace.push(textNodes[i + 1]);
      } else {
        continue;
      }

      const numberPart = textNodes[i].getNumberPart();
      const currencyPart = textNodes[i + 1].getCurrencyPart();

      if (numberPart && currencyPart) {
        const currency = detectCurrency(currencyPart);
        if (!currency) continue;

        const number = parseNumber(numberPart);
        const sats = Math.round((number / rates.bitcoin[currency]) * 1e8);

        textNodes[i].node.textContent = textNodes[i].text.replace(
          numberPart,
          sats.toLocaleString("en-US")
        );
        textNodes[i + 1].node.textContent = textNodes[i + 1].text.replace(
          currencyPart,
          " sats"
        );
      }
      continue;
    }
  }
  function search_document(rates = latest_rates, container = document) {
    const elements = container.body.querySelectorAll(
      "*:not(script):not(style):not(noscript)"
    );
    for (const el of elements) {
      const texts = collectInnerTexts(el);
      if (texts.length) {
        tryReplaceTexts(texts, rates);
      }
    }
  }
  async function convert_to_satoshis(update_rates = false) {
    if (update_rates) {
      let rates = await get();
      if (rates != null) {
        search_document(rates);
        return;
      }
    }
    search_document();
  }
  if (typeof window !== "undefined") {
    window.addEventListener("load", (event) => {
      convert_to_satoshis(true);
    });
    window.addEventListener("keydown", (e) => {
      if (e.ctrlKey && e.altKey && e.key === "c") {
        e.preventDefault();
        convert_to_satoshis();
      }
    });
    window.addEventListener("keydown", (e) => {
      if (e.ctrlKey && e.altKey && e.key === "g") {
        e.preventDefault();
        convert_to_satoshis(true);
      }
    });
  }
  module.exports = { detectCurrency, parseNumber, convertText, priceRE, search_document };
})();