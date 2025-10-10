// ==UserScript==
// @name         Fiat to satoshis
// @namespace    http://tampermonkey.net/
// @version      2025-10-02
// @description  Bitcoin website converter script
// @author       Me
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    //console.log('HELLO BITCOIN');
    let latest_rates = null;
    const priceRE = /(\d{1,3}(?:[\s.]?\d{3})*(?:,\d{1,2})?)(?:\s?)(Kč|CZK|€|\$|USD|EUR|,-)/gi;
    function detectCurrency(suffix){
        if(!suffix) return null;
        const s = suffix.toLowerCase();
        if (s.includes('kč') || s.includes('czk') || suffix === ',-') return 'czk';
        if (s.includes('€') || s.includes('eur')) return 'eur';
        if (s.includes('$') || s.includes('usd')) return 'usd';
        return null;
    }
    function parseNumber(numStr){
        const cleaned = numStr.replace(/\u00A0/g,'').replace(/ /g,'').replace(/\./g,'').replace(/,/g,'.');
        return parseFloat(cleaned);
    }
    async function get() {
        const url = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=czk,eur,usd';
        try {
            const response = await fetch(url);
            if (!response.ok) {
                console.error("HTTP Error:", response.status, response.statusText);
                if(latest_rates != null){return latest_rates}
                return null;
            }
            const data = await response.json();
            latest_rates = data;
            return data;

        } catch (err) {
            console.error("Fetch failed:", err);
            if(latest_rates != null){return latest_rates}
            return null;
        }
    }
    function convertText(elemText, rates) {
        return elemText.replace(priceRE, (match, numStr, suffix) => {
            let currency = detectCurrency(match) || detectCurrency(suffix);
            if(!currency) return match;
            let number = parseNumber(match);
            if(!Number.isFinite(number)) return match;
            let sats = (number / rates.bitcoin[currency] * 1e8).toFixed(2);
            return sats.toLocaleString() + " sats";
        });
    }
    function search_document(rates = latest_rates){
        let container = document.body,
            elems = container.getElementsByTagName("*"),
            len = elems.length,
            elem,
            elemText,
            i,
            unwanted = ["script", "images", "imput","noscript"];
        for(i=0;i<len;i+=1){
            elem = elems[i];
            //if the element does not have children it means that it will only contain text
            if(unwanted.indexOf(elem.nodeName.toLowerCase())=="-1"){
                if(!elem.children.length){
                    elemText = elem.innerText;
                    if(elemText){
                        if(priceRE.test(elemText)){
                            const replaced = convertText(elemText, rates);
                            if(replaced !== elemText){
                                elem.innerText = replaced;
                            }
                        }
                    }
                }
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
    if(typeof window !== 'undefined'){
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
    module.exports = { detectCurrency, parseNumber, convertText, priceRE };
})();