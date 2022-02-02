const request = require('request')
const rp = require('request-promise')
const cheerio = require('cheerio')

var kronoxUrl
var item = ""

function sendTenta(chatbotToken, event, commandParamSplitted) {
    var hittaTentaUrl = 'https://tenta.ltu.se/ajax/ajax_autocompleteResurser.jsp?typ=kurs&term='
    kronoxUrl = "https://schema.ltu.se/setup/jsp/Schema.jsp?startDatum=idag&intervallTyp=m&intervallAntal=12&sprak=SV&sokMedAND=true&forklaringar=true&resurser=k."
    hittaTentaUrl += commandParamSplitted
    rp(hittaTentaUrl).then(function(html) {
        html = JSON.parse(html)
        kronoxUrl += html[0].value
        hittaDatum()
    })
    .catch(function(err) {
        console.log(err)
    })
}


function hittaDatum() {
    rp(kronoxUrl).then(function(html) {
        const $ = cheerio.load(html)
        const dataWhite = $('.data-white')
        $('.data-white td').each((i, el) => {
            if (i > 1) {
                item = $(el).text()
                console.log(item)
            }
            if (i == 2) {
                return false
            }
        });
    })
    .catch(function(err) {
        console.log(err)
    })
}

module.exports = sendTenta