from scipy.io import wavfile

def save_audio(audio, sample_rate, file_id):
    path = f"audio/{file_id}.wav"
    
    audio = audio.numpy().squeeze()

    wavfile.write(path, rate=sample_rate, data=audio)