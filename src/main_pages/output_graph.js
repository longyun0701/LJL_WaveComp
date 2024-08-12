import React, { useRef, useEffect} from 'react';
import * as d3 from 'd3';
import FFT from 'fft.js';
import { waveTypes } from './physical_models.js';

const CN=0, EN=1;


export function SingleWaveGraph({ wave0}) {
  const chartRef = useRef(null);
  const width = 501, height = 50;
  const { type, freq, amp } = wave0;
  const numPoints = 501;
  const tSpan = 0.05;
  const yMax = 100;

  const t = Array.from({ length: numPoints }, (_, i) => i * tSpan / (numPoints - 1));
  const y = t.map(time => waveTypes[type].function(time, freq, amp));

  useEffect(() => {

    const margin = { top: 5, right: 20, bottom: 5, left: 20 };
    const svg = d3.select(chartRef.current);
    svg.selectAll('*').remove();

    const tScale = d3.scaleLinear()
      .domain([0, tSpan])
      .range([margin.left, width - margin.right]);

    const yScale = d3.scaleLinear()
      .domain([-yMax, yMax])
      .range([height - margin.bottom, margin.top]);

    const line = d3.line()
      .x((d, i) => tScale(t[i]))
      .y((d, i) => yScale(y[i]));

    svg.append("path").datum(y) // bind the y data, index will be used to access x data
      .attr("stroke", "blue").attr("fill", 'none').attr("d", line);

  }, [wave0]);

  return (
    <div>
      <svg width={width + 'px'} height={height + 'px'} ref={chartRef} />
    </div>

  );

}

export function MultiWaveGraph({ waves, lang }) {
  const chartRef = useRef(null);
  const width = 520, height = 200;
  const numPoints = 501;
  const tSpan = 0.05;  
  const t = Array.from({ length: numPoints }, (_, i) => i * tSpan / (numPoints - 1));

  const y = t.map(t0 => waves.reduce((sum, w0) => sum + waveTypes[w0.type].function(t0, w0.freq, w0.amp), 0));

  const amp_cap = (lang===CN) ? '位移' : 'Displacement';
  const time_cap = (lang===CN) ? '时间 (毫秒)' : 'Time (ms)';

  let yMax = 100;
  y.map(y0 => { yMax = Math.max(yMax,Math.abs(y0)) });

  useEffect(() => {

    const margin = { top: 5, right: 8, bottom: 35, left: 45 };
    const svg = d3.select(chartRef.current);
    svg.selectAll('*').remove();

    const tScale = d3.scaleLinear()
      .domain([0, tSpan*1000]) // using ms on graph
      .range([margin.left, width - margin.right]);

    const yScale = d3.scaleLinear()
      .domain([-yMax, yMax])
      .range([height - margin.bottom, margin.top]);

    const line = d3.line()
      .x((d, i) => tScale(t[i]*1000)) // using ms
      .y((d, i) => yScale(y[i]));

    svg.append("path").datum(y) // bind the y data, index will be used to access x data
      .attr("stroke", "red").attr("fill", 'none').attr("d", line);

    svg.append('line').attr('x1',tScale(0)).attr('y1',yScale(0))  // draw a zero line
      .attr('x2',tScale(tSpan*1000)).attr('y2',yScale(0))
      .attr('stroke', 'black') // Set the line color
      .attr('stroke-width', 1) // Set the line width
      .attr('fill', 'none'); // Ensure the line does not get filled

    const XaxisGenerator = d3.axisBottom(tScale);
    svg.append("g").call(XaxisGenerator).attr('transform', `translate(0,${(height-margin.bottom)})`);
    const XaxisGenerator2 = d3.axisTop(tScale);
    svg.append("g").call(XaxisGenerator2).attr('transform', `translate(0,${margin.top})`).selectAll('.tick text').remove();

    const YaxisGenerator = d3.axisLeft(yScale);
    svg.append("g").call(YaxisGenerator).attr('transform', `translate(${margin.left},0)`);
    const YaxisGenerator2 = d3.axisRight(yScale);
    svg.append("g").call(YaxisGenerator2).attr('transform', `translate(${width - margin.right},0)`).selectAll('.tick text').remove();

    svg.append("text")             
    .attr("transform", `translate(${width/2},${height-2})`)
    .style("text-anchor", "middle") // Centers the text above the axis
    .text(time_cap);

    svg.append("text")
    .attr("transform", `translate(${13},${height/2-8}), rotate(-90)`) // Rotates the text -90 degrees
    .style("text-anchor", "middle") // Ensures the text is centered after rotation
    .text(amp_cap+" (% Max)");


  }, [waves, lang]);

  return (
    <div>
      <svg width={width + 'px'} height={height + 'px'} ref={chartRef} />
    </div>

  );

}

export function TotalFFTGraph({ waves, lang }) {

  const chartRef = useRef(null);

  const amp_cap = (lang===CN) ? '强度 (任意单位)' : 'Intensity (arb)';
  const freq_cap = (lang===CN) ? '频率 (Hz)' : 'Frequency (Hz)';


  const width = 320, height = 200;
  const tSpan = 1, numPoints = 8192;

  const t = Array.from({ length: numPoints }, (_, i) => i * tSpan / (numPoints - 1));

  const y = t.map(t0 => waves.reduce((sum, w0) => sum + waveTypes[w0.type].function(t0, w0.freq, w0.amp)/100, 0));


  const fft = new FFT(y.length);
  const out = fft.createComplexArray();
  const data = fft.toComplexArray(y);
  fft.transform(out, data);

  // Calculate magnitudes

  const magnitudes0 = [];

  for (let i = 0; i < out.length / 2; i += 2) {
    const real = out[i];
    const imag = out[i + 1];
    magnitudes0.push(Math.sqrt(real * real + imag * imag));

  }

  // Calculate frequencies

  const sampleRate = 1 / (t[1] - t[0]); // Sample rate based on time array
  const frequencies0 = Array.from({ length: magnitudes0.length }, (_, i) => i * sampleRate / y.length);


  let yMax = 1000;
  magnitudes0.map(y0 => { yMax = Math.max(yMax,Math.abs(y0)) });

  const xMax = 1120;

  const frequencies = frequencies0.filter((f0,i)=>f0<1120);
  const magnitudes = magnitudes0.filter((f0,i)=>frequencies0[i]<1120);

  //frequencies.map(x0 => { xMax = Math.max(xMax,Math.abs(x0)) });


  useEffect(() => {

    const margin = { top: 5, right: 20, bottom: 35, left: 45 };
    const svg = d3.select(chartRef.current);

    svg.selectAll('*').remove();
    const tScale = d3.scaleLinear()
      .domain([0, xMax])
      .range([margin.left, width - margin.right]);

    const yScale = d3.scaleLinear()
      .domain([0, yMax])
      .range([height - margin.bottom, margin.top]);

    const line = d3.line()
      .x((d, i) => tScale(frequencies[i]))
      .y((d, i) => yScale(magnitudes[i]));



    svg.append("path").datum(y) // bind the y data, index will be used to access x data
      .attr("stroke", "blue").attr("fill", 'none').attr("d", line);

    const XaxisGenerator = d3.axisBottom(tScale).tickValues([100,200,300,400,500,600,700,800,900,1000,1100]).tickFormat((d) => d);
    svg.append("g").call(XaxisGenerator).attr('transform', `translate(0,${(height-margin.bottom)})`);
    //const XaxisGenerator2 = d3.axisTop(tScale);
    //svg.append("g").call(XaxisGenerator2).attr('transform', `translate(0,${margin.top})`).selectAll('.tick text').remove();

    const YaxisGenerator = d3.axisLeft(yScale);
    svg.append("g").call(YaxisGenerator).attr('transform', `translate(${margin.left},0)`).selectAll('.tick text').remove();
       
    //const YaxisGenerator2 = d3.axisRight(yScale);
    //svg.append("g").call(YaxisGenerator2).attr('transform', `translate(${width - margin.right},0)`).selectAll('.tick text').remove();

    svg.append("text")             
    .attr("transform", `translate(${width/2},${height-2})`)
    .style("text-anchor", "middle") // Centers the text above the axis
    .text(freq_cap);

    svg.append("text")
    .attr("transform", `translate(${30},${height/2-8}), rotate(-90)`) // Rotates the text -90 degrees
    .style("text-anchor", "middle") // Ensures the text is centered after rotation
    .text(amp_cap);

  }, [waves, lang]);



  return (
    <div>
      <svg width={width + 'px'} height={height + 'px'} ref={chartRef} />
    </div>
  );

}



export function PianoKeys({ waves}){
  const svgRef = useRef(null);

  const width = 900;
  const height0 = 160;

  useEffect(() => {
    const height = 120;
    const whiteKeyHeight = height-40;
    const blackKeyHeight = height-60;
    const whiteKeyWidth = 17;
    const blackKeyWidth = 17;

    d3.select(svgRef.current).selectAll('*').remove();
    // Frequencies and notes within the 50 Hz to 1000 Hz range
    const keys = [
      { note: 'A1', freq: 55.00, type: 'white' },
      { note: 'A#1/Bb1', freq: 58.27, type: 'black' },
      { note: 'B1', freq: 61.74, type: 'white' },
      { note: 'C2', freq: 65.41, type: 'white' },
      { note: 'C#2/Db2', freq: 69.30, type: 'black' },
      { note: 'D2', freq: 73.42, type: 'white' },
      { note: 'D#2/Eb2', freq: 77.78, type: 'black' },
      { note: 'E2', freq: 82.41, type: 'white' },
      { note: 'F2', freq: 87.31, type: 'white' },
      { note: 'F#2/Gb2', freq: 92.50, type: 'black' },
      { note: 'G2', freq: 98.00, type: 'white' },
      { note: 'G#2/Ab2', freq: 103.83, type: 'black' },
      { note: 'A2', freq: 110.00, type: 'white' },
      { note: 'A#2/Bb2', freq: 116.54, type: 'black' },
      { note: 'B2', freq: 123.47, type: 'white' },
      { note: 'C3', freq: 130.81, type: 'white' },
      { note: 'C#3/Db3', freq: 138.59, type: 'black' },
      { note: 'D3', freq: 146.83, type: 'white' },
      { note: 'D#3/Eb3', freq: 155.56, type: 'black' },
      { note: 'E3', freq: 164.81, type: 'white' },
      { note: 'F3', freq: 174.61, type: 'white' },
      { note: 'F#3/Gb3', freq: 185.00, type: 'black' },
      { note: 'G3', freq: 196.00, type: 'white' },
      { note: 'G3', freq: 196.00, type: 'white' },   // Just below the range, for context
      { note: 'G#3/Ab3', freq: 207.65, type: 'black' },
      { note: 'A3', freq: 220.00, type: 'white' },
      { note: 'A#3/Bb3', freq: 233.08, type: 'black' },
      { note: 'B3', freq: 246.94, type: 'white' },
      { note: 'C4', freq: 261.63, type: 'white' },
      { note: 'C#4/Db4', freq: 277.18, type: 'black' },
      { note: 'D4', freq: 293.66, type: 'white' },
      { note: 'D#4/Eb4', freq: 311.13, type: 'black' },
      { note: 'E4', freq: 329.63, type: 'white' },
      { note: 'F4', freq: 349.23, type: 'white' },
      { note: 'F#4/Gb4', freq: 369.99, type: 'black' },
      { note: 'G4', freq: 392.00, type: 'white' },
      { note: 'G#4/Ab4', freq: 415.30, type: 'black' },
      { note: 'A4', freq: 440.00, type: 'white' },
      { note: 'A#4/Bb4', freq: 466.16, type: 'black' },
      { note: 'B4', freq: 493.88, type: 'white' },
      { note: 'C5', freq: 523.25, type: 'white' },
      { note: 'C#5/Db5', freq: 554.37, type: 'black' },
      { note: 'D5', freq: 587.33, type: 'white' },
      { note: 'D#5/Eb5', freq: 622.25, type: 'black' },
      { note: 'E5', freq: 659.25, type: 'white' },
      { note: 'F5', freq: 698.46, type: 'white' },
      { note: 'F#5/Gb5', freq: 739.99, type: 'black' },
      { note: 'G5', freq: 783.99, type: 'white' },
      { note: 'G#5/Ab5', freq: 830.61, type: 'black' },
      { note: 'A5', freq: 880.00, type: 'white' },
      { note: 'A#5/Bb5', freq: 932.33, type: 'black' },
      { note: 'B5', freq: 987.77, type: 'white' },
      { note: 'C6', freq: 1046.50, type: 'white' },  // Just above the range, for context
    ];

    // Filter keys to keep only those within the 200 Hz to 1000 Hz range
    const filteredKeys = keys.filter(key => key.freq >= 50 && key.freq <= 1050);

    // Create a logarithmic scale for frequencies
    const xScale = d3.scaleLog()
      .domain([50, 1100]) // Adjusted for the new frequency range
      .range([0, width]);

    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    // Draw the keys
    svg.selectAll('rect')
      .data(filteredKeys)
      .enter()
      .append('rect')
      .attr('x', d => xScale(d.freq) - (d.type === 'white' ? whiteKeyWidth / 2 : blackKeyWidth / 2) )
      .attr('y', d => d.type === 'white' ? 20 : 20)
      .attr('width', d => d.type === 'white' ? whiteKeyWidth : blackKeyWidth)
      .attr('height', d => d.type === 'white' ? whiteKeyHeight : blackKeyHeight)
      .attr('fill', d => d.type === 'white' ? '#fff' : '#777')
      .attr('stroke', '#000');

    // Add labels for the notes above the keys
    svg.selectAll('text')
      .data(filteredKeys)
      .enter()
      .append('text')
      .attr('x', d => xScale(d.freq) )
      .attr('y', d => d.type === 'white' ? 18 : 0) // Position above the keys
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('fill', 'black')
      .text(d => d.note);

  // Show aadded waves on the piano keys
    const crossSymbol = d3.symbol().type(d3.symbolCross).size(100);
    svg.selectAll('path')
      .data(waves)
      .enter()
      .append('path')
      .attr('d', crossSymbol)
      .attr('transform', (d,i) => `translate(${xScale(d.freq)},${height*0.5-15 + i*5}) rotate(45)`)
      .attr('fill', 'blue');

    //const XaxisGenerator = d3.axisBottom(xScale).tickValues([60,120,261.6, 240,480,960]).tickFormat((d) => d);
    const XaxisGenerator = d3.axisBottom(xScale).tickValues([55,100,200, 261.6, 400,800,1000]).tickFormat((d) => d);
    svg.append("g").call(XaxisGenerator).attr('transform', `translate(0,${(height0-60)})`);    

  }, [waves]);

  return (<div>
    <svg width={width + 'px'} height={height0+'px'}  ref={svgRef} />
    </div>);

};
