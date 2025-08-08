import * as React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Modal, FlatList } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const Tab = createBottomTabNavigator();

function countSyllables(line) {
  if (!line) return 0;
  const words = line.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/).filter(Boolean);
  let total = 0;
  for (const w of words) {
    const m = w.match(/[aeiouy]+/g);
    total += m ? m.length : 1;
  }
  return total;
}

function HomeScreen() {
  return (
    <View style={styles.center}>
      <Text style={styles.title}>🎶 The Song Shack</Text>
      <Text style={styles.subtitle}>Write lyrics, get ideas, and book vocal coaching.</Text>
    </View>
  );
}

function WriteScreen() {
  const [section, setSection] = React.useState('Verse');
  const [lyrics, setLyrics] = React.useState({ Verse: '', Chorus: '', Bridge: '' });
  const syllables = lyrics[section].split(/\n+/).map(line => countSyllables(line));
  return (
    <View style={{flex:1, backgroundColor:'#0e0e10'}}>
      <View style={styles.tabs}>
        {['Verse','Chorus','Bridge'].map(key => (
          <TouchableOpacity key={key} onPress={()=>setSection(key)} style={[styles.tab, section===key && styles.tabActive]}>
            <Text style={styles.tabText}>{key}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <ScrollView style={{flex:1, paddingHorizontal:16}}>
        <TextInput
          multiline
          placeholder={`Write your ${section.toLowerCase()} here...`}
          placeholderTextColor="#888"
          style={styles.input}
          value={lyrics[section]}
          onChangeText={(t)=>setLyrics(p=>({...p,[section]:t}))}
        />
      </ScrollView>
      <View style={styles.footer}>
        <Text style={styles.metaLabel}>Syllables per line:</Text>
        <ScrollView horizontal>
          {syllables.map((s,i)=>(<View key={i} style={styles.badge}><Text style={styles.badgeText}>{s}</Text></View>))}
        </ScrollView>
      </View>
    </View>
  );
}

const templates = [
  'Under the {theme}, I learned to {verb} again',
  'Every {time} I {verb}, I think of you',
  'We were {adj} kids chasing {noun} in the rain',
  "If loving you is wrong, I'll {verb} anyway",
  'Your name is a {noun} I whisper at night',
  'I left my {noun} on the backseat of July',
  "I'm not the {noun} you wanted, but I'm the one who stayed",
  'We draw our dreams in dust and gasoline'
];
const verbs = ['breathe','believe','run','hide','dance','try','stay','forgive','forget','wander'];
const times = ['morning','midnight','Friday','sunset','winter'];
const adjs = ['reckless','restless','wild','stubborn','soft'];
const nouns = ['promise','ghost','scar','song','map','river','cigarette','storm'];
function pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
const rhymeDict = {
  love: ['above','dove','glove','of','shove','scrub'],
  time: ['rhyme','climb','sublime','chime','prime'],
  night: ['light','bright','kite','flight','tight','alright'],
  heart: ['start','part','art','chart','apart'],
  pain: ['rain','train','again','chain','plane'],
};

function suggestLines(theme) {
  const th = (theme || 'love').toLowerCase();
  const p = { theme: th, verb: pick(verbs), time: pick(times), adj: pick(adjs), noun: pick(nouns) };
  return templates.slice(0,6).map(t => t.replace('{theme}', p.theme).replace('{verb}', p.verb).replace('{time}', p.time).replace('{adj}', p.adj).replace('{noun}', p.noun));
}
function rhymeWords(w){
  w = (w||'').toLowerCase();
  if (rhymeDict[w]) return rhymeDict[w];
  const end = w.slice(-2);
  const pool = Object.values(rhymeDict).flat();
  return pool.filter(x=>x.endsWith(end)).slice(0,12);
}

function SuggestScreen(){
  const [prompt, setPrompt] = React.useState('');
  const [rhyme, setRhyme] = React.useState('love');
  const [results, setResults] = React.useState([]);
  const [rhymes, setRhymes] = React.useState([]);
  return (
    <ScrollView style={{flex:1, backgroundColor:'#0e0e10'}} contentContainerStyle={{padding:16}}>
      <Text style={styles.title}>Lyric Ideas</Text>
      <TextInput placeholder="Theme or line (e.g., summer nights)" placeholderTextColor="#888" style={styles.input} value={prompt} onChangeText={setPrompt}/>
      <TouchableOpacity style={styles.btn} onPress={()=>setResults(suggestLines(prompt))}><Text style={styles.btnText}>Get Suggestions</Text></TouchableOpacity>
      {results.length>0 && <View style={styles.card}>{results.map((r,i)=><Text key={i} style={styles.line}>• {r}</Text>)}</View>}

      <Text style={[styles.title,{marginTop:24}]}>Quick Rhymes</Text>
      <TextInput placeholder="Word to rhyme (e.g., love)" placeholderTextColor="#888" style={styles.input} value={rhyme} onChangeText={setRhyme}/>
      <TouchableOpacity style={styles.btn} onPress={()=>setRhymes(rhymeWords(rhyme))}><Text style={styles.btnText}>Find Rhymes</Text></TouchableOpacity>
      {rhymes.length>0 && <View style={styles.cardRow}>{rhymes.map((w,i)=><View key={i} style={styles.pill}><Text style={styles.pillText}>{w}</Text></View>)}</View>}
    </ScrollView>
  );
}

const demoCoaches = [
  { id:'c1', name:'Haley West', style:'Pop / Country', rate:55, remote:true },
  { id:'c2', name:'Marcus Lee', style:'R&B / Pop', rate:70, remote:true },
  { id:'c3', name:'Riley Dawn', style:'Country', rate:50, remote:false },
];
function getSlotsForDay(date){
  const hours = [9,10,11,13,14,15,16,18];
  return hours.map(h => new Date(date.getFullYear(), date.getMonth(), date.getDate(), h, 0));
}

function CoachesScreen(){
  const [open, setOpen] = React.useState(false);
  const [coach, setCoach] = React.useState(null);
  const [dayOffset, setDayOffset] = React.useState(0);
  const date = React.useMemo(()=>{ const d=new Date(); d.setDate(d.getDate()+dayOffset); return d; },[dayOffset]);
  const slots = getSlotsForDay(date);
  return (
    <View style={{flex:1, backgroundColor:'#0e0e10', padding:16}}>
      <Text style={styles.title}>Vocal Coaches</Text>
      <FlatList
        data={demoCoaches}
        keyExtractor={i=>i.id}
        renderItem={({item})=>(
          <View style={styles.card}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.meta}>{item.style} • ${item.rate}/hr • {item.remote?'Remote':'In-person'}</Text>
            <TouchableOpacity style={styles.btn} onPress={()=>{setCoach(item); setOpen(true);}}><Text style={styles.btnText}>View Slots</Text></TouchableOpacity>
          </View>
        )}
      />
      <Modal visible={open} transparent animationType="slide">
        <View style={{flex:1, backgroundColor:'rgba(0,0,0,0.6)', justifyContent:'flex-end'}}>
          <View style={{backgroundColor:'#111', borderTopLeftRadius:16, borderTopRightRadius:16, padding:16, maxHeight:'80%'}}>
            <Text style={styles.name}>{coach?.name}</Text>
            <Text style={styles.meta}>{coach?.style} • ${coach?.rate}/hr</Text>
            <View style={{flexDirection:'row', justifyContent:'space-between', marginBottom:10}}>
              <TouchableOpacity style={styles.navBtn} onPress={()=>setDayOffset(o=>Math.max(0,o-1))}><Text style={styles.btnText}>◀︎</Text></TouchableOpacity>
              <Text style={styles.name}>{date.toDateString()}</Text>
              <TouchableOpacity style={styles.navBtn} onPress={()=>setDayOffset(o=>o+1)}><Text style={styles.btnText}>▶︎</Text></TouchableOpacity>
            </View>
            <FlatList
              data={slots}
              keyExtractor={(d)=>String(d)}
              renderItem={({item})=>(
                <TouchableOpacity style={styles.slot} onPress={()=>{ alert(`Booked ${coach?.name} on ${item.toLocaleString()}`); setOpen(false); }}>
                  <Text style={styles.btnText}>{item.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</Text>
                </TouchableOpacity>
              )}
              contentContainerStyle={{gap:10}}
            />
            <TouchableOpacity style={[styles.navBtn, {alignSelf:'center', marginTop:10}]} onPress={()=>setOpen(false)}><Text style={styles.btnText}>Close</Text></TouchableOpacity>
            <Text style={{color:'#777', marginTop:8, fontSize:12}}>Add Calendar later with expo-calendar.</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

export default function App(){
  return (
    <NavigationContainer>
      <Tab.Navigator screenOptions={{headerShown:false}}>
        <Tab.Screen name="Home" component={HomeScreen}/>
        <Tab.Screen name="Write" component={WriteScreen}/>
        <Tab.Screen name="Suggestions" component={SuggestScreen}/>
        <Tab.Screen name="Coaches" component={CoachesScreen}/>
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  center:{ flex:1, alignItems:'center', justifyContent:'center', padding:24, backgroundColor:'#0e0e10' },
  title:{ fontSize:22, fontWeight:'800', color:'#fff', marginBottom:8 },
  subtitle:{ color:'#cfcfcf', textAlign:'center' },
  tabs:{ flexDirection:'row', padding:8, gap:8, justifyContent:'center' },
  tab:{ paddingVertical:8, paddingHorizontal:16, borderRadius:20, backgroundColor:'#222' },
  tabActive:{ backgroundColor:'#444' },
  tabText:{ color:'white', fontWeight:'700' },
  input:{ minHeight:200, color:'white', fontSize:16, lineHeight:22, padding:12, borderColor:'#333', borderWidth:1, borderRadius:8, marginTop:8 },
  footer:{ padding:12, borderTopColor:'#222', borderTopWidth:1 },
  metaLabel:{ color:'#ccc', marginBottom:6 },
  badge:{ backgroundColor:'#222', paddingVertical:6, paddingHorizontal:10, borderRadius:12, marginRight:6 },
  badgeText:{ color:'#fff' },
  btn:{ backgroundColor:'#444', padding:12, borderRadius:8, alignItems:'center', marginTop:8 },
  btnText:{ color:'white', fontWeight:'700' },
  card:{ backgroundColor:'#151515', borderColor:'#333', borderWidth:1, borderRadius:8, padding:12, marginTop:10, gap:6 },
  line:{ color:'#ddd' },
  cardRow:{ flexDirection:'row', flexWrap:'wrap', gap:8, marginTop:10 },
  pill:{ backgroundColor:'#222', paddingHorizontal:10, paddingVertical:6, borderRadius:16 },
  pillText:{ color:'#fff' },
  name:{ color:'#fff', fontSize:18, fontWeight:'700' },
  meta:{ color:'#bbb', marginBottom:10 },
  navBtn:{ backgroundColor:'#222', paddingHorizontal:16, paddingVertical:8, borderRadius:8 },
  slot:{ backgroundColor:'#222', padding:12, borderRadius:8, alignItems:'center' },
});