
import React, { useState, useEffect, useCallback } from 'react';
import { StorageService } from '../services/storage';
import { LeaderboardEntry } from '../types';

interface Question {
  question: string;
  options: string[];
  answer: number;
  category: string;
}

interface TrainingViewProps {
  onQuit?: () => void;
}

const QUIZ_QUESTIONS: Question[] = [
  { question: "What does a red octagonal sign mean?", options: ["Yield", "Caution", "Stop", "No Entry"], answer: 2, category: "Signs" },
  { question: "A triangular sign with a red border generally indicates?", options: ["Information", "Prohibition", "Warning", "Direction"], answer: 2, category: "Signs" },
  { question: "What should you do when you see a flashing yellow light?", options: ["Stop completely", "Slow down and proceed with caution", "Speed up to clear the intersection", "Ignore it"], answer: 1, category: "Lights" },
  { question: "A 'No Entry' sign is usually what shape?", options: ["Square", "Circle", "Triangle", "Diamond"], answer: 1, category: "Signs" },
  { question: "What does a double solid yellow line in the center of the road mean?", options: ["Overtaking allowed", "No overtaking or crossing", "One-way street", "Parking allowed"], answer: 1, category: "Markings" },
  { question: "A blue circular sign with a white arrow pointing right means?", options: ["Turn right if you want", "No right turn", "Keep right / Compulsory right turn", "End of right lane"], answer: 2, category: "Signs" },
  { question: "What is the primary meaning of a red 'X' light over a lane?", options: ["Emergency vehicles only", "Lane closed", "Fast lane", "Yield to others"], answer: 1, category: "Lights" },
  { question: "What does an inverted triangle sign mean?", options: ["Stop", "Yield / Give Way", "Hospital ahead", "School zone"], answer: 1, category: "Signs" },
  { question: "A diamond-shaped sign is typically used for?", options: ["Regulatory info", "Speed limits", "Hazard warnings", "Parking zones"], answer: 2, category: "Signs" },
  { question: "What does a green arrow pointing left mean?", options: ["Turn left after stopping", "Yield to oncoming traffic then turn", "Protected left turn allowed", "No left turn"], answer: 2, category: "Lights" },
  { question: "A circle with a red slash through a 'P' means?", options: ["Parking allowed", "No Parking", "Permit required", "Police only"], answer: 1, category: "Signs" },
  { question: "A white 'H' on a blue square indicates?", options: ["Highway", "Hospital", "Hotel", "Hills"], answer: 1, category: "Signs" },
  { question: "What does 'Keep Intersection Clear' mean?", options: ["Don't stop inside the box markings", "Don't drive through it", "Police are watching", "Close windows"], answer: 0, category: "Rules" },
  { question: "What is the speed limit in a typical school zone?", options: ["20 km/h", "40 km/h", "60 km/h", "80 km/h"], answer: 0, category: "Rules" },
  { question: "A sign with a bicycle inside a red circle means?", options: ["Bicycles only", "No Bicycles", "Bicycle crossing", "Bicycle repair ahead"], answer: 1, category: "Signs" },
  { question: "What should you do at a steady red light?", options: ["Slow down", "Yield", "Stop and stay stopped", "Turn immediately"], answer: 2, category: "Lights" },
  { question: "What does a white 'X' on the pavement mean?", options: ["Crossroad", "Railroad crossing ahead", "Target for drones", "No crossing"], answer: 1, category: "Markings" },
  { question: "A blue sign with a white bed symbol means?", options: ["Furniture store", "Accommodation / Hotel", "Quiet zone", "Sleeping area"], answer: 1, category: "Signs" },
  { question: "What does a sign with a 'U' and a red slash mean?", options: ["No U-turn", "U-turn allowed", "Turn around", "Underpass"], answer: 0, category: "Signs" },
  { question: "A sign showing a car skidding means?", options: ["Race track", "Slippery road", "Car wash", "Test drive"], answer: 1, category: "Signs" },
  { question: "What does a sign with two children walking indicate?", options: ["Playground", "School Zone", "Bus stop", "Family park"], answer: 1, category: "Signs" },
  { question: "A sign with a horn and a red slash means?", options: ["No music", "No blowing of horn", "Loud music zone", "Maintenance ahead"], answer: 1, category: "Signs" },
  { question: "A horizontal white line on the road at intersections is?", options: ["Starting line", "Stop line", "Guidance line", "Crosswalk"], answer: 1, category: "Markings" },
  { question: "Zigzag lines near a pedestrian crossing mean?", options: ["Parking allowed", "No parking or overtaking", "Speed up", "Artistic road"], answer: 1, category: "Markings" },
  { question: "What does a sign with a numeric value like '50' inside a red circle mean?", options: ["Recommended speed", "Minimum speed", "Maximum speed limit", "Exit number"], answer: 2, category: "Signs" },
  { question: "A blue rectangular sign with a white 'P' means?", options: ["Police", "Parking permitted", "Prohibited", "Phone"], answer: 1, category: "Signs" },
  { question: "What is the meaning of a flashing red light?", options: ["Yield", "Stop completely then proceed when safe", "Warning only", "Lights are broken"], answer: 1, category: "Lights" },
  { question: "A sign with a black arrow curving right and a red slash means?", options: ["Turn right", "No right turn", "Slight right turn", "One way right"], answer: 1, category: "Signs" },
  { question: "What does a yellow diamond sign with a cross symbol mean?", options: ["Church", "Crossroads ahead", "First aid", "Cemetery"], answer: 1, category: "Signs" },
  { question: "Broken white lines on a multi-lane road mean?", options: ["No lane changes", "Lane changes permitted with caution", "Emergency lane", "Strict lane keeping"], answer: 1, category: "Markings" },
  { question: "What does a sign with a person shoveling mean?", options: ["Farm ahead", "Road works / Construction", "Garden nearby", "Beach access"], answer: 1, category: "Signs" },
  { question: "A sign with an arrow and 'ONE WAY' means?", options: ["Turn here", "Travel only in arrow direction", "No entry", "Single file only"], answer: 1, category: "Signs" },
  { question: "A blue sign with a fuel pump symbol indicates?", options: ["Gas station ahead", "No fuel", "Oil leak", "Auto shop"], answer: 0, category: "Signs" },
  { question: "What does a red circle with a horizontal white bar mean?", options: ["No entry", "Stop", "Yield", "Danger"], answer: 0, category: "Signs" },
  { question: "A sign with a deer symbol means?", options: ["Pet shop", "Animal crossing / Wildlife zone", "Hunting area", "Zoo"], answer: 1, category: "Signs" },
  { question: "What does a sign with a white arrow inside a blue square mean?", options: ["Turn left", "One way street", "Lane ends", "Right of way"], answer: 1, category: "Signs" },
  { question: "What should you do if an emergency vehicle is behind you with sirens?", options: ["Speed up", "Pull over to the right and stop", "Stop immediately where you are", "Follow it"], answer: 1, category: "Rules" },
  { question: "A sign with a truck inside a red circle means?", options: ["Truck parking", "No trucks allowed", "Truck lane", "Heavy load ahead"], answer: 1, category: "Signs" },
  { question: "What does a yellow diamond with a 'T' intersection symbol mean?", options: ["End of road", "T-intersection ahead", "Telephone", "Traffic jam"], answer: 1, category: "Signs" },
  { question: "What does 'LTO' stand for in the Philippines?", options: ["Land Transportation Office", "Local Traffic Organization", "License Tracking Office", "Land Travel Order"], answer: 0, category: "Rules" },
  { question: "A sign with a '5t' inside a red circle means?", options: ["Speed limit 5", "Load limit 5 tons", "Distance 5km", "5 tracks"], answer: 1, category: "Signs" },
  { question: "What is the 'Two-Second Rule'?", options: ["Time to start engine", "Safe following distance", "Duration of a sign", "Parking limit"], answer: 1, category: "Rules" },
  { question: "A sign with a red triangle showing a narrowing road means?", options: ["Road widening", "Road narrows ahead", "End of highway", "Bridge ahead"], answer: 1, category: "Signs" },
  { question: "What is the color of a 'Disabled' parking sign?", options: ["Red", "Green", "Blue", "Yellow"], answer: 2, category: "Signs" },
  { question: "What does a sign with a large black dot on yellow background mean?", options: ["Blind corner", "Hazard ahead", "End of restriction", "Black spot / Accident prone area"], answer: 3, category: "Signs" },
  { question: "A sign with 'EXIT' and an arrow usually has what color?", options: ["Red", "Green", "Blue", "Yellow"], answer: 1, category: "Signs" },
  { question: "What does a sign with a phone handset symbol mean?", options: ["Call center", "Emergency phone available", "No phones", "Charging station"], answer: 1, category: "Signs" },
  { question: "Yellow boxes with diagonal lines at intersections mean?", options: ["Free parking", "Don't enter unless exit is clear", "Slow down", "Speed zone"], answer: 1, category: "Markings" },
  { question: "What does 'Defensive Driving' mean?", options: ["Driving slowly", "Anticipating hazards and avoiding them", "Protective your car with armor", "Being aggressive"], answer: 1, category: "Rules" },
  { question: "A sign with 'STOP' written in white on red means?", options: ["Slow down", "Yield", "Come to a full stop", "No entry"], answer: 2, category: "Signs" }
];

type GameState = 'intro' | 'playing' | 'wave_result' | 'break' | 'gameOver' | 'finished';

const TrainingView: React.FC<TrainingViewProps> = ({ onQuit }) => {
  const [gameState, setGameState] = useState<GameState>('intro');
  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [waveScore, setWaveScore] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [timeLeft, setTimeLeft] = useState(10);
  const [breakTimer, setBreakTimer] = useState(10);
  const [leaderboardName, setLeaderboardName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [resultSubmitted, setResultSubmitted] = useState(false);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    const data = await StorageService.getLeaderboard();
    setLeaderboard(data);
  };

  const handleNext = useCallback(() => {
    if (gameState !== 'playing') return;

    const isEndOfWave = (currentQuestionIndex + 1) % 10 === 0;

    if (isEndOfWave) {
      setGameState('wave_result');
    } else {
      setCurrentQuestionIndex(i => i + 1);
      setSelectedOption(null);
      setTimeLeft(10);
    }
  }, [currentQuestionIndex, gameState]);

  useEffect(() => {
    let timer: any;
    if (gameState === 'playing' && selectedOption === null) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleNext();
            return 10;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameState, selectedOption, handleNext]);

  useEffect(() => {
    let timer: any;
    if (gameState === 'break') {
      timer = setInterval(() => {
        setBreakTimer(prev => {
          if (prev <= 1) {
            startNextWave();
            return 10;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameState]);

  const startQuiz = () => {
    const shuffled = [...QUIZ_QUESTIONS].sort(() => Math.random() - 0.5);
    setShuffledQuestions(shuffled);
    setCurrentQuestionIndex(0);
    setWaveScore(0);
    setTotalScore(0);
    setGameState('playing');
    setSelectedOption(null);
    setTimeLeft(10);
    setResultSubmitted(false);
  };

  const startNextWave = () => {
    setCurrentQuestionIndex(i => i + 1);
    setWaveScore(0);
    setGameState('playing');
    setSelectedOption(null);
    setTimeLeft(10);
    setBreakTimer(10);
  };

  const handleOptionSelect = (index: number) => {
    if (selectedOption !== null || gameState !== 'playing') return;
    setSelectedOption(index);
    const isCorrect = index === shuffledQuestions[currentQuestionIndex].answer;
    if (isCorrect) {
      setWaveScore(s => s + 1);
      setTotalScore(s => s + 1);
    }
  };

  const currentWave = Math.floor(currentQuestionIndex / 10) + 1;
  const waveTarget = 6;
  const isWavePassed = waveScore >= waveTarget;

  const handleWaveContinue = () => {
    if (isWavePassed) {
      if (currentQuestionIndex === 49) {
        setGameState('finished');
      } else {
        setGameState('break');
      }
    } else {
      setGameState('gameOver');
    }
  };

  const handleSaveToLeaderboard = async () => {
    if (!leaderboardName.trim()) return;
    setIsSaving(true);
    const percentage = Math.round((totalScore / 50) * 100);
    const entry = {
      userName: leaderboardName.toUpperCase().slice(0, 6),
      score: totalScore,
      total: 50,
      percentage: percentage,
      date: new Date().toISOString()
    };
    try {
      await StorageService.saveQuizResult(entry);
      await fetchLeaderboard();
      setResultSubmitted(true);
    } catch (err) {
      console.error("Save failed", err);
    } finally {
      setIsSaving(false);
    }
  };

  const rawHallOfFame = leaderboard.filter(e => e.percentage >= 90);
  const hallOfFame = [...rawHallOfFame];
  if (!hallOfFame.find(e => e.userName.toLowerCase() === 'rad')) {
    hallOfFame.push({
      userName: 'Rad',
      percentage: 97,
      score: 48,
      total: 50,
      date: new Date().toISOString()
    });
  }
  hallOfFame.sort((a, b) => b.percentage - a.percentage);

  if (gameState === 'intro') {
    return (
      <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <header className="text-center space-y-4 pt-12">
          <h2 className="text-5xl sm:text-7xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
            Are You a <span className="text-blue-600">Legit</span> Driver?
          </h2>
          <p className="text-slate-600 dark:text-slate-400 font-medium text-lg sm:text-2xl max-w-2xl mx-auto leading-relaxed">
            Survive 5 waves of questions. Maintain 60% per wave to stay in the game.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="bg-white dark:bg-slate-900 p-10 sm:p-12 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 shadow-2xl space-y-10">
             <div className="space-y-6">
               <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                 Game Rules 🚦
               </h3>
               <ul className="space-y-6">
                 {[
                   { icon: "🌊", text: "5 Waves (10 Questions each)" },
                   { icon: "⚖️", text: "Min 6/10 per wave to continue" },
                   { icon: "⏱️", text: "10 seconds per question" },
                   { icon: "☕", text: "10-second break between waves" },
                   { icon: "🏆", text: "90%+ total = HALL OF FAME" }
                 ].map((item, i) => (
                   <li key={i} className="flex items-start gap-5 group">
                     <span className="text-3xl bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl group-hover:scale-110 transition-transform">{item.icon}</span>
                     <p className="pt-2 text-slate-900 dark:text-slate-200 font-bold text-xl">{item.text}</p>
                   </li>
                 ))}
               </ul>
             </div>
             <button onClick={startQuiz} className="w-full py-7 bg-blue-600 text-white font-black text-3xl rounded-[2.5rem] shadow-xl hover:scale-[1.03] transition-all uppercase">START MISSION</button>
          </div>
          
          <div className="bg-slate-950 rounded-[3.5rem] border border-slate-800 p-10 shadow-2xl space-y-8 h-fit">
            <h3 className="text-xl font-black text-white uppercase tracking-[0.2em] text-center">🏆 HALL OF FAME (90%+)</h3>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {hallOfFame.map((entry, i) => (
                <div key={i} className={`flex justify-between items-center p-4 rounded-2xl border transition-all hover:scale-[1.02] ${entry.userName.toLowerCase() === 'rad' ? 'bg-amber-500/20 border-amber-500/30' : 'bg-slate-900/50 border-slate-800'}`}>
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{i === 0 || entry.userName.toLowerCase() === 'rad' ? '🥇' : '⭐'}</span>
                    <span className="text-white font-black uppercase text-sm tracking-tight">{entry.userName}</span>
                  </div>
                  <span className={`font-black text-xl ${entry.userName.toLowerCase() === 'rad' ? 'text-amber-500' : 'text-blue-400'}`}>{entry.percentage}%</span>
                </div>
              ))}
              {hallOfFame.length === 0 && (
                <p className="text-slate-600 text-center font-bold text-sm italic">No legends yet. Score 90% to enter.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'wave_result') {
    return (
      <div className="max-w-2xl mx-auto text-center space-y-10 bg-white dark:bg-slate-900 p-12 sm:p-16 rounded-[4rem] border border-slate-100 dark:border-slate-800 shadow-2xl animate-in zoom-in-95 duration-500">
        <div className={`w-32 h-32 rounded-[2.5rem] flex items-center justify-center mx-auto text-6xl shadow-2xl ${isWavePassed ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-red-500 shadow-red-500/20'}`}>
          {isWavePassed ? '🌊' : '🚫'}
        </div>
        <div className="space-y-4">
          <h2 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
            {isWavePassed ? 'Wave Cleared!' : 'Game Over'}
          </h2>
          <div className="flex justify-center gap-12">
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Wave Score</p>
              <p className={`text-6xl font-black ${isWavePassed ? 'text-emerald-600' : 'text-red-600'}`}>{waveScore}/10</p>
            </div>
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Progress</p>
              <p className="text-6xl font-black text-blue-600">{totalScore}</p>
            </div>
          </div>
        </div>
        <button 
          onClick={handleWaveContinue} 
          className={`w-full py-6 font-black rounded-3xl text-white shadow-xl hover:scale-105 transition-all text-xl uppercase ${isWavePassed ? 'bg-blue-600' : 'bg-slate-900'}`}
        >
          {isWavePassed ? (currentQuestionIndex === 49 ? 'Finish Mission' : 'Continue to Break') : 'Try Again'}
        </button>
      </div>
    );
  }

  if (gameState === 'break') {
    return (
      <div className="max-w-2xl mx-auto text-center space-y-12 animate-in fade-in duration-700">
        <div className="space-y-4 pt-20">
          <h2 className="text-6xl font-black text-slate-900 dark:text-white tracking-tighter">BREATHER ☕</h2>
          <p className="text-slate-500 font-bold text-xl uppercase tracking-widest">Next Wave In</p>
          <div className="text-9xl font-black text-blue-600">{breakTimer}</div>
        </div>
        <div className="bg-slate-100 dark:bg-slate-800/50 p-8 rounded-[3rem] border border-slate-200 dark:border-slate-700">
          <p className="text-lg text-slate-700 dark:text-slate-300 font-medium">Get ready for Wave {currentWave + 1}.</p>
        </div>
      </div>
    );
  }

  if (gameState === 'gameOver') {
    return (
      <div className="max-w-2xl mx-auto text-center space-y-10 bg-white dark:bg-slate-900 p-12 rounded-[4rem] border shadow-2xl">
        <div className="w-32 h-32 rounded-[2.5rem] bg-red-600 flex items-center justify-center mx-auto text-6xl text-white">💀</div>
        <h2 className="text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">GAME OVER</h2>
        <div className="grid grid-cols-2 gap-8">
           <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-3xl">
             <p className="text-[10px] font-black text-slate-500 uppercase">Final Wave</p>
             <p className="text-3xl font-black text-slate-900 dark:text-white">{currentWave}</p>
           </div>
           <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-3xl">
             <p className="text-[10px] font-black text-slate-500 uppercase">Total Score</p>
             <p className="text-3xl font-black text-slate-900 dark:text-white">{totalScore}</p>
           </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <button onClick={startQuiz} className="flex-1 py-6 bg-blue-600 text-white font-black rounded-3xl shadow-xl hover:scale-105 transition-all text-xl uppercase">Respawn</button>
          <button onClick={() => setGameState('intro')} className="flex-1 py-6 bg-slate-100 text-slate-600 font-black rounded-3xl hover:bg-slate-200 transition-all text-xl uppercase">Abort</button>
        </div>
      </div>
    );
  }

  if (gameState === 'finished') {
    const finalPercent = Math.round((totalScore / 50) * 100);
    return (
      <div className="max-w-2xl mx-auto text-center space-y-10 bg-white dark:bg-slate-900 p-12 rounded-[4rem] shadow-2xl animate-in zoom-in duration-500">
        <div className="w-32 h-32 rounded-[2.5rem] bg-amber-500 flex items-center justify-center mx-auto text-6xl text-white">🏆</div>
        <div className="space-y-2">
          <h2 className="text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">MISSION COMPLETE</h2>
          <p className="text-8xl font-black text-amber-500">{finalPercent}%</p>
        </div>
        
        {!resultSubmitted ? (
          <div className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-[2.5rem] space-y-6">
             <p className="text-slate-700 dark:text-slate-300 font-bold uppercase tracking-widest text-xs">Record your legacy</p>
             <input 
               type="text" maxLength={6} value={leaderboardName}
               onChange={(e) => setLeaderboardName(e.target.value.toUpperCase())}
               placeholder="NAME"
               className="w-full py-5 px-6 border-4 border-blue-600 rounded-3xl text-center font-black text-3xl uppercase outline-none"
             />
             <button 
               onClick={handleSaveToLeaderboard}
               disabled={!leaderboardName.trim() || isSaving}
               className="w-full py-5 bg-blue-600 text-white rounded-3xl font-black text-xl uppercase disabled:opacity-50"
             >
               {isSaving ? 'Recording...' : 'Save Record'}
             </button>
          </div>
        ) : (
          <div className="p-8 bg-emerald-500/10 rounded-[2.5rem] border border-emerald-500/20">
             <p className="text-emerald-500 font-black uppercase text-xl">Record Saved!</p>
          </div>
        )}
        <button onClick={() => setGameState('intro')} className="w-full py-6 bg-slate-100 text-slate-600 font-black rounded-3xl uppercase text-xl">Back to HQ</button>
      </div>
    );
  }

  const currentQuestion = shuffledQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) % 10 || 10) * 10;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300 pb-20">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
         <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">WAVE {currentWave} OF 5</p>
              <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">Question {currentQuestionIndex + 1} / 50</p>
            </div>
            <div className="px-4 text-center">
               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">WAVE ACCURACY</p>
               <div className={`text-sm font-black ${waveScore >= waveTarget ? 'text-emerald-600' : 'text-amber-500'}`}>
                 {waveScore}/10 ({Math.round((waveScore/10)*100)}%)
               </div>
            </div>
            <div className="text-right shrink-0">
               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">TOTAL CORRECT</p>
               <span className="text-sm font-black text-blue-600">{totalScore}</span>
            </div>
         </div>
         <div className="space-y-2">
            <div className="flex justify-center">
               <div className={`text-4xl font-black transition-all ${timeLeft <= 2 ? 'text-red-600 animate-pulse' : 'text-blue-600'}`}>
                 0:{timeLeft === 10 ? '10' : `0${timeLeft}`}
               </div>
            </div>
            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
               <div className={`h-full transition-all duration-1000 linear ${timeLeft <= 2 ? 'bg-red-600' : 'bg-blue-600'}`} style={{ width: `${(timeLeft / 10) * 100}%` }}></div>
            </div>
         </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-8 sm:p-14 rounded-[4rem] border shadow-2xl space-y-12 min-h-[400px] flex flex-col justify-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-50 dark:bg-slate-800/20">
            <div className="h-full bg-blue-600/20 transition-all duration-700" style={{ width: `${progress}%` }}></div>
        </div>
        <div className="space-y-4">
           <span className="px-5 py-2 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-black rounded-full uppercase tracking-widest">{currentQuestion.category}</span>
           <h3 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white leading-[1.1] tracking-tight">{currentQuestion.question}</h3>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {currentQuestion.options.map((option, idx) => {
            const isSelected = selectedOption === idx;
            const isCorrect = idx === currentQuestion.answer;
            let btnClass = "bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-400 hover:bg-blue-50/30";
            if (selectedOption !== null) {
              if (isCorrect) btnClass = "bg-emerald-500 border-emerald-500 text-white shadow-xl";
              else if (isSelected) btnClass = "bg-red-500 border-red-500 text-white shadow-xl";
              else btnClass = "bg-slate-50 dark:bg-slate-800 opacity-40 text-slate-400";
            }
            return (
              <button
                key={idx}
                disabled={selectedOption !== null}
                onClick={() => handleOptionSelect(idx)}
                className={`w-full text-left p-6 sm:p-8 rounded-[2.5rem] border-2 font-black text-xl sm:text-2xl transition-all flex items-center justify-between ${btnClass}`}
              >
                <span>{option}</span>
                {selectedOption !== null && isCorrect && <span className="text-3xl">✅</span>}
                {selectedOption !== null && isSelected && !isCorrect && <span className="text-3xl">❌</span>}
              </button>
            );
          })}
        </div>
        {selectedOption !== null && (
          <div className="pt-4">
            <button onClick={handleNext} className="w-full py-7 bg-blue-600 text-white font-black text-2xl rounded-[2.5rem] shadow-2xl uppercase animate-in slide-in-from-bottom-4">
              {(currentQuestionIndex + 1) % 10 === 0 ? 'End Wave' : 'Next Question'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainingView;
