import { useState } from 'react'
import './App.css'
import {generateCaption, translateCaption} from './models/api';

function App() {
  const [imgSrc, setImgSrc] = useState(null);
  const [caption, setCaption] = useState("<Caption>")
  const [captionPTBR, setcaptionPTBR] = useState("<Legenda>")

  function resetCaption(){
    setCaption("<Caption>");
    setcaptionPTBR("<Legenda>");
  }
  async function addCaption() {
    resetCaption();
    
    setCaption("Gerando legenda...");
    const caption = await generateCaption(imgSrc);
    setCaption(caption[0]['generated_text']);

    setcaptionPTBR("Traduzindo legenda...");
    const captionPTBR = await translateCaption(caption[0]['generated_text']);
    setcaptionPTBR(captionPTBR[0]['translation_text']);

  }

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
      </div>
    </>
  )
}

export default App
