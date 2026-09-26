import { pipeline } from "@huggingface/transformers"

export default class ImageCaptioner {
    static captioner = null;

    static async getCaptioner(){
        if(this.captioner === null){
            this.captioner = await pipeline(
                "image-to-text", 
                "Xenova/vit-gpt2-image-captioning",
                {dtype: "q8"}
            );
        }
        return this.captioner;
    }

    static async generateCaption(imgSrc){
        return this.getCaptioner().then((captioner) => 
            captioner(imgSrc, {
                do_sample: true
            })
        )
    }
}