import React from "react"; 
import { useState } from "react"; 
import { SingleWaveGraph, MultiWaveGraph, TotalFFTGraph, PianoKeys } from './main_pages/output_graph.js';

import { waveTypes } from './main_pages/physical_models.js';
import { CustomSoundPlayer } from "./main_pages/sound_player.js";

const CN = 0, EN = 1;
const model_pic_dir = './assets/';


function GraphicPageTitle({ onClickLangFuncs, lang }) {
    const title_en = "Sound Wave Composition and Application in Chord";
    const title_cn = "声波叠加原理及应用探究";
    const title = (lang === CN) ? title_cn : title_en;

    return (
        <div>

        <tr class='tr1'>
            <td width='940px'> <h1b>  {title} </h1b> </td>
            <td width='60px' align="right"><lang> <div class="highlight_shift" onClick={onClickLangFuncs[0]}>简体中文</div>
                                                <div class="highlight_shift" onClick={onClickLangFuncs[1]}>English</div></lang></td>
        </tr>


        </div>
    )

}

function Introduction({lang}) {
  const intro_cn = ["声音是很多个基本声波叠加而成的，每个声波都有波形，频率 (音调)，振幅 (响度) 等性质。",
                    "在输入区，您可以逐个添加、观察、试听、删除基本声波，并能看到它们在钢琴键上的大致位置。",
                    "同时，您也可以看到这些波叠加之后的合成波的图像 (时间域和频率域)，试听合成声音。",
                    //"3种波形：正弦波、方波(二阶方波)与三角波。  频率范围：50-1000Hz。  振幅范围：1-100%(与最大值之比)",
                    "",
                   ];
  const intro_en = ["A sound wave can be composed of many elementary waves, whose properties include wave type, frequency, and amplitude.",
                    "In the Input area below, you can add, observe, and play elementary waves, and find them on a piano keyboard.",
                    "You will also see the graph of the composed wave (in time and frequency space, and play this mixed sound.",
                    //"3 wave types available: Sine wave, Sqaure wave (2-level), Triangular wave.   Frequency range: 50-1000Hz.   Amplitude range: 1-100%(ratio to Max)",
                    "",
                   ];

  const intro_txt = (lang === CN) ? intro_cn : intro_en;

  return (<div>

    {intro_txt.map( (line) => <div>{line}<br/></div> )}


  </div>


  )

}

function Keyboard() {
    return (
      <div>
          Keyboard shown here
        </div>
    )

}

function FootNote({ lang }) {

    const footnote_cn = 'Copyright © 2024 制作人 龙君纶 杭州绿城育华学校';
    const footnote_en = "Copyright © 2024 made with react.js by Long Junlun Hangzhou GreenTown Yuhua School";

    const declare_cn = '本应用程序只能用于非盈利的教学目的'
    const declare_en = 'For non-profitable educational purpose only'

    const footnote = (lang === CN) ? footnote_cn : footnote_en;
    const declare = (lang === CN) ? declare_cn : declare_en;

    return (
        <tr>
            {declare}
            <br />
            {footnote}
        </tr>

    )

}


function Main({ lang }) {
  const waveTypeList = ['sin', 'sqr', 'tri'];
  const inputParamsCap_en = ['Freq.', 'Amp.', 'Add'];
  const inputParamsCap_cn = ['频率', '振幅', '添加'];
  const inputParamsCap = (lang === CN) ? inputParamsCap_cn : inputParamsCap_en;
  const [curWaveType, setCurWaveType] = useState('sin');
  const [curWaveFreq, setCurWaveFreq] = useState(200);
  const [curWaveAmp, setCurWaveAmp] = useState(50);

  const removeCap = (lang === CN) ? '删除' : 'Remove';
  const newWaveCap_cn = '添加基本声波', newWaveCap_en = 'Add an elementary wave';
  const newWaveCap = (lang === CN) ? newWaveCap_cn : newWaveCap_en;

  const no_wave_en = "There is no wave now. Please add one or a few more.", no_wave_cn = "尚无基本声波。请添加。"
  const no_wave_cap = (lang === CN) ? no_wave_cn : no_wave_en;

  const try_play_en = "Play Wave", try_play_cn = "试听待添加波";
  const try_play_cap = (lang === CN) ? try_play_cn : try_play_en;
  const playerCap_cn = '播放';
  const playerCap_en = 'Play';
  const playAllCap_cn = '播放合成音';
  const playAllCap_en = 'Play Mixed';
  const playerCap_cap = (lang === CN) ? playerCap_cn : playerCap_en;
  const playAllCap_cap = (lang === CN) ? playAllCap_cn : playAllCap_en;

  const clearAll_cap = (lang === CN) ? "清除所有波" : "Clear All";

  const [allWaves, setAllWaves] = useState([]);

  const onSelectWaveType = (e) => {
      setCurWaveType(e.target.value);
  }

  const onFreqChange = (e) => {
      setCurWaveFreq(e.target.value);

  }

  const onAmpChange = (e) => {
      setCurWaveAmp(e.target.value);

  }
  const handleAddWave = () => {
      // clamp input or alert
    const alert_en = ["You can have at most 6 elementary waves. Please remove some before adding.",
                      "Frequency/Amplitude should be a number!",
                      "Frequency/Amplitude out of range (Freq:50-1000Hz, Amp:1-100%). Your values have been brought within the boundary. Click 'Add' again if you want to add this changed wave",
      ]
    const alert_cn = ["最多只能添加 6 个基本声波，请先删除一些，方可继续添加", 
                      '频率和振幅都必须输入数字！',
                      '输入的频率必须在 50-1000Hz 之间，振幅必须在 1-100% 之间，您的越界输入已被拉回到最近的允许值，您可以按“添加”使用该修改值，或重新输入。'
    ]

    const alert_cap = (lang===CN)?alert_cn:alert_en;

    if (allWaves.length >=6) {
      alert(alert_cap[0]);
      return;
    }
    let freqInput = parseFloat(curWaveFreq);
    let ampInput = parseFloat(curWaveAmp);
    const typeInput = curWaveType;


    if (typeof freqInput !== "number" || typeof ampInput !== "number" || isNaN(freqInput) || isNaN(ampInput)) {
      alert(alert_cap[1]);
      return;
    }
    let flag = false;
    if (freqInput > 1000) {
      freqInput = 1000; flag = true;
    }
    if (freqInput < 50) {
      freqInput = 50; flag = true;
    }
    if (ampInput > 100) {
      ampInput = 100; flag = true;
    }
    if (ampInput < 1) {
      ampInput = 1; flag = true;
    }

      // reset Current
    setCurWaveAmp(ampInput);
    setCurWaveFreq(freqInput);
      // add this to AllWaves
    if (flag == true) {
      alert(alert_cap[2])
      return;
    }

    setAllWaves([...allWaves, {type:typeInput,freq:freqInput,amp:ampInput}]);
		
  }

  const handleRemoveWave = (idx) => {
    const newWaves = allWaves.filter((_, i) => i !== idx);
    setAllWaves(newWaves);
  };

  const handleClearAll = () => {
    setAllWaves([]);
  };


  const cols_cn = ['ID', '声波类型', '频率 (Hz)', '振幅 (%)', 
    <CustomSoundPlayer waves={allWaves} playerCap={playAllCap_cap} />, 
    <button onClick={handleClearAll}> {clearAll_cap} </button>, '! 若点击"播放"后不出声，是有限资源正在回复中，请稍后重新点击'];
  const cols_en = ['ID', 'Wave Type', 'Frequency (Hz)', 'Amplitude (%Max)',
      <CustomSoundPlayer waves={allWaves} playerCap={playAllCap_cap} />, 
      <button onClick={handleClearAll}> {clearAll_cap} </button>, 'If no sound after clicking "play", Re-Click after a few second for resource to be resumed'];
  const col_widths = ['40px', '95px', '90px', '90px', '90px', '90px', '505px'];
  const cols = (lang === CN) ? cols_cn : cols_en;


  //const sinTest = waveTypes[curWaveType].function(t, curWaveFreq, curWaveAmp);
  return (
    <table>
      <tr> {/*for keyboard */}
          <Introduction lang={lang} />
          
      </tr>

      <tr> {/*for keyboard */}
          <PianoKeys waves={allWaves}/>
          <br/>
      </tr>

      <tr> <table> <tr> {/*for input and final output*/}
        <td width='160px'> { /* input panel */}
          <tr>{newWaveCap}</tr>
      <tr>
          
            {waveTypeList.map((t0) => {
              const name = (lang === CN) ? waveTypes[t0].name_cn : waveTypes[t0].name_en;
              const abbr = waveTypes[t0].abbr;
              return (
                <div>
                  <input type="radio" name="waveType" value={abbr}
                    checked={curWaveType === abbr} onClick={onSelectWaveType} /> {name}
                </div>
              )
            })}
            <br />
            {inputParamsCap[0]} <input type='number' class='inputBox2' value={curWaveFreq} onChange={onFreqChange} /> Hz <br />
            {inputParamsCap[1]} <input type='number' class='inputBox2' value={curWaveAmp} onChange={onAmpChange} /> % Max <br />
            
            <br />
            <CustomSoundPlayer waves={[{type:curWaveType, freq:curWaveFreq, amp: curWaveAmp}]} playerCap={try_play_cap}/> &nbsp;
            <button onClick={handleAddWave}>{inputParamsCap[2]} </button>
              <br />
              <br />
              <br />
        </tr>
        </td> { /* closing input panel */}

        <td width='320px'> { /* Final output graph, in f space */}
            <TotalFFTGraph waves={allWaves} lang={lang}/>
        </td>

        <td width='520px'> { /* Final output graph, in t space */}
          <MultiWaveGraph waves={allWaves} lang={lang}/>
        </td>



      </tr> </table> </tr> {/* closing input and final output */}

      <tr> { /* for individual series and plots*/}
        
        {(allWaves.length===0) ? <div>{no_wave_cap}</div> : 
        
        <table>
        <tr className="underscore-row" align="center"> 
          {cols.map((c0, i) => <td width={col_widths[i]}> {c0} </td>)}

        </tr>

        {allWaves.map((w0, i) => {
            const w0Type = (lang === CN) ? waveTypes[w0.type].name_cn : waveTypes[w0.type].name_en;
          return (<tr class="center-middle" align='center'  height='50px'>
            
            <td>{i + 1}</td>
            <td>{w0Type}</td>
            <td>{w0.freq}</td>
            <td>{w0.amp}</td>
            <td><CustomSoundPlayer waves={[w0]} playerCap={playerCap_cap}/> </td>
            <td><button onClick={() => handleRemoveWave(i)}>{removeCap}</button></td>
            <td><SingleWaveGraph wave0={w0} /></td>
          </tr>
          )
        })}
        

      </table>}
    </tr> { /* closing individual series and plots*/}
    </table>

  );

}

export default function WaveComp() {

    const [lang, setLang] = useState(CN);

    const onClickLangFuncs = [() => { setLang(CN) }, () => { setLang(EN) }];

    return (
        <div>
            <table width="1000px">
            <tr><GraphicPageTitle onClickLangFuncs={onClickLangFuncs} lang={lang} /></tr>
            <br />
            <tr><Main lang={lang} />        </tr>
            <br />
            <tr><FootNote lang={lang} /></tr>
            </table>
            
        </div>
    )
    
}