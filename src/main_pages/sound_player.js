import React, { useState, useRef, useEffect } from 'react';
import { waveTypes } from './physical_models.js';


export function CustomSoundPlayer({ waves, playerCap}) {
  const audioCtx = useRef(new (window.AudioContext || window.webkitAudioContext()));

  const restartAudioContext = async () => {
    if (audioCtx.current) {
      await audioCtx.current.close();
      audioCtx.current = new (window.AudioContext || window.webkitAudioContext)();
      //playCount.current = 0; // Reset the play count
    }
  };

  const playCustomSound = async (t, y) => {

    await restartAudioContext();

    await audioCtx.current.resume();

    const sampleRate = audioCtx.current.sampleRate;
    const buffer = audioCtx.current.createBuffer(1, sampleRate, sampleRate);
    const channelData = buffer.getChannelData(0);

    // Fill the buffer with the custom waveform data
    for (let i = 0; i < t.length; i++) {
      const timeIndex = Math.floor(t[i] * sampleRate);
      if (timeIndex < sampleRate && timeIndex >= 0) {
        channelData[timeIndex] = y[i];
      }
    }

    const source = audioCtx.current.createBufferSource();
    source.buffer = buffer;
    source.connect(audioCtx.current.destination);
    source.start();
    //alert(sampleRate);
    source.onended = async () => {
      source.disconnect();
      //await audioCtx.current.suspend(); 
    };

  };

  const t = Array.from({ length: 50001 }, (_, i) => i / 50000);
  let y = t.map(t0 => waves.reduce((sum, w0) => sum + waveTypes[w0.type].function(t0, w0.freq, w0.amp) / 100, 0));
  let yMax = 0;
  y.map(y0=>{yMax=Math.max(Math.abs(y0),yMax)});
  if (yMax > 1) {
    y = y.map(y0=>y0/yMax);
  }



  return (
      <button onClick={() => playCustomSound(t, y)}>{playerCap}</button>
      /*(waves.length==1) ? <div>{waves[0].freq}, {waves[0].amp}</div> : <div></div>*/
  );
}