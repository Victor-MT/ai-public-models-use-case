class Translator {
    static translator = null;

    static async getTranslator(){
        if(this.translator === null){
            const { pipeline } = await import("@huggingface/transformers")
            this.translator = await pipeline(
                "translation",
                "Xenova/nllb-200-distilled-600M",
                { dtype: "q8" }
            )
        };

        return this.translator;
    }

    static async translate(textENG){
        return this.getTranslator().then(
            translator => translator(textENG, {
                src_lang: 'eng_Latn',
                tgt_lang: 'por_Latn'
            })
        );
    }
}

exports.Translator = Translator