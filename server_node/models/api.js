const { Translator } = require("./Translator");

async function translate(textENG){
    return Translator.translate(textENG);
}

exports.translate = translate;