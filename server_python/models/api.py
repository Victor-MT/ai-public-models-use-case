from .text_to_audio import TextToAudio


def convert_text_to_audio(text):
    return TextToAudio().convert(text)