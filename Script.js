// mobile nav
const menuBtn = document.getElementById('menuBtn');
const siteNav = document.getElementById('siteNav');
if (menuBtn) menuBtn.onclick = () => siteNav.classList.toggle('open');

// year
document.getElementById('year').textContent = new Date().getFullYear();

/* ---------- AI Song Helper ---------- */

const topics = ["late night drives","city lights","small town weekends","ocean breeze","unfinished letters","second chances","summer storms"];
const moods  = ["hopeful","bittersweet","restless","moody","fearless","tender","triumphant"];
const images = ["neon signs","dusty vinyl","flickering streetlamps","train windows","blue motels","coffee rings","open highways"];
const verbs  = ["chasing","calling","waiting for","drifting through","running from","dancing with","holding on to"];
const closers= ["and I won’t let go","I keep coming home","’til the morning finds us","and I finally know","and the truth shows up","and the chorus hits"];

function line(a,b){ return `${a} ${b}`.replace(/\s+/g," ").trim(); }

function generateLyrics() {
  const topic = document.getElementById('ai-topic').value || topics[Math.floor(Math.random()*topics.length)];
  const mood  = document.getElementById('ai-mood').value  || moods[Math.floor(Math.random()*moods.length)];
  const genre = document.getElementById('ai-genre').value || "pop";

  const v1 = [
    line("I’ve been", verbs[Math.floor(Math.random()*verbs.length)]) + " " + topic,
    "Under " + images[Math.floor(Math.random()*images.length)],
    "Every word tastes like " + mood,
    "But I hum along anyway"
  ];

  const ch = [
    `This is ${genre} and it feels like ${mood}`,
    `You’re my ${topic} in the dark`,
    "Hands up to the sky, heartbeat on time",
    closers[Math.floor(Math.random()*closers.length)]
  ];

  const v2 = [
    "Flip the coin, tails again",
    "We laugh at the echo in empty rooms",
    "If timing is everything",
    "We’re right on cue"
  ];

  const out = `Verse 1:\n${v1.join("\n")}\n\nChorus:\n${ch.join("\n")}\n\nVerse 2:\n${v2.join("\n")}\n\nChorus:\n${ch.join("\n")}\n`;
  document.getElementById('lyricsOut').value = out;
}
document.getElementById('genLyricsBtn')?.addEventListener('click', generateLyrics);
document.getElementById('clearLyricsBtn')?.addEventListener('click', () => document.getElementById('lyricsOut').value="");

// Rhyme finder via Datamuse
async function fetchRhymes(word){
  const box = document.getElementById('rhymeList');
  if (!word) { box.textContent = "Type a word above."; return; }
  box.textContent = "Loading rhymes…";
  try{
    const res = await fetch(`https://api.datamuse.com/words?rel_rhy=${encodeURIComponent(word)}&max=30`);
    const data = await res.json();
    box.innerHTML = data.length ? data.map(w=>w.word).slice(0,18).join(" • ") : "No rhymes found 😅";
  }catch(e){ box.textContent = "Couldn’t reach rhyme service."; }
}
document.getElementById('rhymeBtn')?.addEventListener('click', ()=>fetchRhymes(document.getElementById('rhymeWord').value.trim()));

// Chord progression suggester
const progressions = [
  {name:"I–V–vi–IV", tip:"pop anthems"},
  {name:"vi–IV–I–V", tip:"emotional pop/country"},
  {name:"I–vi–IV–V", tip:"classic 50s"},
  {name:"ii–V–I", tip:"jazzy resolve"},
  {name:"i–VII–VI–VII", tip:"minor mode energy"}
];
document.getElementById('chordsBtn')?.addEventListener('click', ()=>{
  const p = progressions[Math.floor(Math.random()*progressions.length)];
  document.getElementById('chordsOut').textContent = `Verse: ${p.name} • Chorus: ${p.name} (${p.tip})`;
});

/* ---------- AI Recording Studio ---------- */
let audioCtx, micStream, micSource, gainNode, delayNode, mediaRecorder, chunks=[];
const micBtn = document.getElementById('micBtn');
const recBtn = document.getElementById('recBtn');
const stopBtn = document.getElementById('stopBtn');
const takePlayer = document.getElementById('takePlayer');
const downloadLink = document.getElementById('downloadLink');
const beatPlayer = document.getElementById('beatPlayer');
const beatFile = document.getElementById('beatFile');

function initAudio(){
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  gainNode = audioCtx.createGain();
  delayNode = audioCtx.createDelay(1.0);
  const feedback = audioCtx.createGain(); feedback.gain.value = parseFloat(document.getElementById('echoRange').value);
  delayNode.delayTime.value = 0.23;
  delayNode.connect(feedback); feedback.connect(delayNode); // feedback loop
  gainNode.connect(delayNode).connect(audioCtx.destination);
}

micBtn?.addEventListener('click', async ()=>{
  try{
    initAudio();
    micStream = await navigator.mediaDevices.getUserMedia({audio:true});
    micSource = audioCtx.createMediaStreamSource(micStream);
    micSource.connect(gainNode);
    recBtn.disabled = false;
    micBtn.textContent = "Mic Ready ✅";
  }catch(e){ alert("Mic access failed. On iPhone, allow microphone for Safari in Settings → Safari."); }
});

document.getElementById('gainRange')?.addEventListener('input', e=>{
  if (gainNode) gainNode.gain.value = parseFloat(e.target.value);
});
document.getElementById('echoRange')?.addEventListener('input', e=>{
  // feedback gain lives at node index 2 in connection chain; easiest is reconnect
  if (!audioCtx) return;
  initAudio(); // re-init sets new feedback value
  if (micSource) micSource.connect(gainNode);
});

recBtn?.addEventListener('click', ()=>{
  if (!micStream) return;
  chunks = [];
  mediaRecorder = new MediaRecorder(micStream);
  mediaRecorder.ondataavailable = e => { if (e.data.size>0) chunks.push(e.data); };
  mediaRecorder.onstop = ()=>{
    const blob = new Blob(chunks, {type: chunks[0]?.type || 'audio/webm'});
    const url = URL.createObjectURL(blob);
    takePlayer.src = url;
    downloadLink.href = url;
    downloadLink.style.display = 'inline-block';
    downloadLink.download = `songshack-take.${blob.type.includes('mp4')?'mp4':'webm'}`;
  };
  mediaRecorder.start();
  recBtn.disabled = true; stopBtn.disabled = false;
});

stopBtn?.addEventListener('click', ()=>{
  mediaRecorder?.stop();
  recBtn.disabled = false; stopBtn.disabled = true;
});

// Metronome (simple tick)
let metroId=null;
function tick(){
  const osc = audioCtx.createOscillator();
  const metGain = audioCtx.createGain();
  metGain.gain.value = 0.15;
  osc.frequency.setValueAtTime(1000, audioCtx.currentTime);
  osc.connect(metGain).connect(audioCtx.destination);
  osc.start(); osc.stop(audioCtx.currentTime + 0.05);
}
document.getElementById('metroBtn')?.addEventListener('click', ()=>{
  if (!audioCtx) initAudio();
  if (metroId){ clearInterval(metroId); metroId=null; document.getElementById('metroBtn').textContent="Start Metronome"; return; }
  const bpm = Math.max(40, Math.min(200, parseInt(document.getElementById('bpm').value)||92));
  const interval = (60/bpm)*1000;
  tick();
  metroId = setInterval(tick, interval);
  document.getElementById('metroBtn').textContent="Stop Metronome";
});

// Beat uploader
beatFile?.addEventListener('change', e=>{
  const file = e.target.files[0];
  if (file){ beatPlayer.src = URL.createObjectURL(file); beatPlayer.play(); }
});

/* ---------- Contact helper ---------- */
document.getElementById('copyInquiry')?.addEventListener('click', ()=>{
  const msg = `Hi Song Shack!\n\nName: ${document.getElementById('c-name').value}\nProject: ${document.getElementById('c-proj').value}\nMessage: ${document.getElementById('c-msg').value}\n\nThanks!`;
  navigator.clipboard.writeText(msg).then(()=>alert("Copied! Paste into your email/DM."),()=>alert("Copy failed—select and copy manually."));
});
