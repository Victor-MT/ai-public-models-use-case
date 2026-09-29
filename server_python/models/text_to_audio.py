from transformers import AutoProcessor, BarkModel


def pipeline(model_name):    
    processor = AutoProcessor.from_pretrained(model_name)
    model = BarkModel.from_pretrained(model_name)
    # model = model.to_bettertransformer()
    sample_rate = model.generation_config.sample_rate
        
    def pipe(text):
        model_input = processor(text, voice_preset="v2/pt_speaker_8")
        audio = model.generate(**model_input)
        return audio, sample_rate
    
    return pipe


class TextToAudio:
    def __init__(self):
        model_name = "suno/bark-small"
        self.pipe = pipeline(model_name)

    def convert(self, text):
        return self.pipe(text)