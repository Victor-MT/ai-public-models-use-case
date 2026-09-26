import { useState } from 'react'
import './App.css'
import generateCaption from'./models/api';

function App() {
  const [imgSrc, setImgSrc] = useState(null);
  const [caption, setCaption] = useState("<Caption>")

  async function addCaption() {
    setCaption("Gerando legenda...")

    const caption = await generateCaption(imgSrc);
    console.log(caption)
    setCaption(caption[0]['generated_text']);

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
      </div>
    </>
  )
}

export default App
