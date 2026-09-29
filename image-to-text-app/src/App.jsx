import { useEffect, useState, useRef } from 'react'
import './App.css'
import {generateCaption, translateCaption, convertToAudio} from './models/api';

function App() {
  const [imgSrc, setImgSrc] = useState(null);
  const [caption, setCaption] = useState("<Caption>")
  const [captionPTBR, setcaptionPTBR] = useState("<Legenda>")
  const [audioSrc, setAudioSrc] = useState(null);
  const captionAudio = useRef();

  function resetCaption(){
    setCaption("<Caption>");
    setcaptionPTBR("<Legenda>");
    setAudioSrc(null);
  }
  async function addCaption() {
    resetCaption();
    
    setCaption("Gerando legenda...");
    const caption = await generateCaption(imgSrc);
    setCaption(caption[0]['generated_text']);

    setcaptionPTBR("Traduzindo legenda...");
    const captionPTBR = await translateCaption(caption[0]['generated_text']);
    setcaptionPTBR(captionPTBR[0]['translation_text']);

    const audioEndpoint = await convertToAudio(captionPTBR[0]['translation_text']);
    const audioSrc = "http://localhost:5000" + audioEndpoint[0]['url'];
    setAudioSrc(audioSrc);
  }

  useEffect(() => {
    const audio = captionAudio.current;
    if (!audio || !audioSrc) return;

    audio.play().catch((error) => {
      if (error.name !== "AbortError") {
        console.error("Erro ao reproduzir áudio:", error);
      }
    });
  }, [audioSrc]);

  return (
    <>
      <h1> Caption Generator </h1>
      <div className='url-form'>
        <input type="text" onChange={e => setImgSrc(e.target.value)}/>
        <button onClick={addCaption}>Generate</button>
      </div>
      <div className='captioned-image'>
        <img src={imgSrc} height={200} style={{marginBottom: "10px"}}/>
        <span>{caption}</span>
        <span>{captionPTBR}</span>
        <audio controls ref={captionAudio} src={audioSrc} />
      </div>
    </>
  )
}

export default App
