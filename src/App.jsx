import React, { useState, useEffect, useMemo } from 'react';

// Insert your published Google Sheet CSV URLs here
const CONFIG_SHEET_CSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ2POPXiw_0BcgW0X60GGUk0HY8OQK-sI8LpUKPrCm7hzkgRl80oxulZdvQ9g25jZsAIKioAm08FL1g/pub?gid=0&single=true&output=csv";
const BOONS_SHEET_CSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ2POPXiw_0BcgW0X60GGUk0HY8OQK-sI8LpUKPrCm7hzkgRl80oxulZdvQ9g25jZsAIKioAm08FL1g/pub?gid=388339265&single=true&output=csv";
const FIGHTERS_SHEET_CSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ2POPXiw_0BcgW0X60GGUk0HY8OQK-sI8LpUKPrCm7hzkgRl80oxulZdvQ9g25jZsAIKioAm08FL1g/pub?gid=1937729440&single=true&output=csv";
const SCORES_SHEET_CSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ2POPXiw_0BcgW0X60GGUk0HY8OQK-sI8LpUKPrCm7hzkgRl80oxulZdvQ9g25jZsAIKioAm08FL1g/pub?gid=1873253112&single=true&output=csv";

// Simple CSV parser helper
function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter((line) => line.trim() !== '');
  if (lines.length === 0) return [];
  const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
  return lines.slice(1).map((line) => {
    const values = line.split(',').map((v) => v.trim().replace(/^"|"$/g, ''));
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = values[i] || '';
    });
    return obj;
  });
}

export default function App() {
  const [activeTab, setActiveTab] = useState('grid');
  const [config, setConfig] = useState({});
  const [boons, setBoons] = useState([]);
  const [fighters, setFighters] = useState([]);
  const [liveScores, setLiveScores] = useState({});
  const [loading, setLoading] = useState(true);

  const [selectedFighter, setSelectedFighter] = useState(null);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // Fetch all Google Sheets data on mount
  useEffect(() => {
    async function loadAllSheetData() {
      try {
        setLoading(true);

        // Fetch Config, Boons, Fighters, and Scores in parallel
        const [configRes, boonsRes, fightersRes, scoresRes] = await Promise.all([
          fetch(CONFIG_SHEET_CSV).then((r) => r.text()),
          fetch(BOONS_SHEET_CSV).then((r) => r.text()),
          fetch(FIGHTERS_SHEET_CSV).then((r) => r.text()),
          fetch(SCORES_SHEET_CSV).then((r) => r.text()),
        ]);

        // Parse Config Key-Value Pairs
        const configRows = parseCSV(configRes);
        const parsedConfig = {};
        configRows.forEach((row) => {
          if (row.Key || row.key) {
            parsedConfig[row.Key || row.key] = row.Value || row.value;
          }
        });
        setConfig(parsedConfig);

        // Parse Boons
        const boonsData = parseCSV(boonsRes);
        setBoons(boonsData);

        // Parse Fighters
        const fightersData = parseCSV(fightersRes).map((f) => ({
          ...f,
          attributes: f.attributes ? f.attributes.split(',').map((a) => a.trim()) : [],
        }));
        setFighters(fightersData);

        // Parse Live Scores
        const scoreRows = parseCSV(scoresRes);
        const parsedScores = {};
        scoreRows.forEach((row) => {
          const key = (row.fighterId || row.id || Object.values(row)[0] || '').toLowerCase();
          const val = parseInt(row.votes || row.score || Object.values(row)[1] || '0', 10);
          if (key && !isNaN(val)) parsedScores[key] = val;
        });
        setLiveScores(parsedScores);
      } catch (err) {
        console.error('Error loading Google Sheet data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadAllSheetData();
  }, []);

  // Target voting start date from dynamic config
  const votingStartDate = useMemo(() => {
    return new Date(config.votingStartDate || '2026-10-16T00:00:00').getTime();
  }, [config.votingStartDate]);

  // Live Countdown Effect
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = votingStartDate - now;

      if (distance <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [votingStartDate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0E17] text-orange-500 flex items-center justify-center font-bold font-mono">
        ⏳ Loading tournament data live from Google Sheets...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0E17] text-slate-100 font-sans flex flex-col relative">
      {/* HEADER */}
      <header className="bg-[#0D1117] border-b border-slate-800/80 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-2xl">
            💀
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-wide text-orange-500 uppercase">
              {config.tournamentName || 'OCTOBER MADNESS 2026'}
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              Culminating Midnight on Halloween 2026
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#191F2E] border border-purple-500/30 text-purple-300 text-xs px-3.5 py-2 rounded-lg font-medium">
            <span>📅</span>
            <span>
              Active Round: <strong className="text-purple-200">{config.activeRound || 'Sweet Sixteen'}</strong>
            </span>
          </div>
          <a
            href={config.activeVotingUrl || '#'}
            target="_blank"
            rel="noreferrer"
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all shadow-md shadow-orange-500/20 active:scale-95"
          >
            <span>☑️</span> Vote Now
          </a>
        </div>
      </header>

      {/* ALERT BANNER: COUNTDOWN TIMER */}
      <div className="bg-[#2A1508] border-b border-orange-900/40 text-orange-400 text-xs py-2.5 px-4 text-center font-medium flex flex-wrap items-center justify-center gap-2 sm:gap-3">
        <span className="text-sm">⏳</span>
        <span>
          <strong>{config.activeRound || 'Sweet Sixteen'}</strong> Voting Session Opens In:
        </span>
        <div className="flex items-center gap-1 font-mono font-bold text-orange-300 bg-black/40 px-2.5 py-1 rounded-md border border-orange-500/30 text-xs">
          <span>{String(timeLeft.days).padStart(2, '0')}d</span>:
          <span>{String(timeLeft.hours).padStart(2, '0')}h</span>:
          <span>{String(timeLeft.minutes).padStart(2, '0')}m</span>:
          <span>{String(timeLeft.seconds).padStart(2, '0')}s</span>
        </div>
        <a
          href={config.activeVotingUrl || '#'}
          target="_blank"
          rel="noreferrer"
          className="underline font-bold text-orange-300 hover:text-orange-200 ml-1 inline-flex items-center gap-0.5"
        >
          Preview Ballot ↗
        </a>
      </div>

      {/* NAVIGATION TABS */}
      <nav className="flex justify-center border-b border-slate-800/80 bg-[#0B0E17] pt-4 overflow-x-auto">
        <div className="flex gap-6 sm:gap-8 text-sm font-semibold whitespace-nowrap px-4">
          <button
            onClick={() => setActiveTab('grid')}
            className={`pb-3 transition-colors ${
              activeTab === 'grid'
                ? 'border-b-2 border-orange-500 text-orange-500 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🔥 Current Round Grid
          </button>
          <button
            onClick={() => setActiveTab('boons')}
            className={`pb-3 transition-colors ${
              activeTab === 'boons'
                ? 'border-b-2 border-orange-500 text-orange-500 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🧙‍♂️️ Boons & Perks ({boons.length})
          </button>
          <button
            onClick={() => setActiveTab('vault')}
            className={`pb-3 transition-colors ${
              activeTab === 'vault'
                ? 'border-b-2 border-orange-500 text-orange-500 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Fighter Vault ({fighters.length})
          </button>
        </div>
      </nav>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        {/* BOONS TAB */}
        {activeTab === 'boons' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {boons.map((boon) => (
              <div
                key={boon.id}
                className="bg-[#161B26] border border-slate-800/90 rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-4xl p-2 bg-[#0D1117] border border-slate-800 rounded-xl">
                    {boon.icon || '✨'}
                  </span>
                  <span className="text-[10px] font-bold font-mono px-2.5 py-1 rounded-full uppercase bg-purple-950/50 text-purple-300 border border-purple-500/50">
                    {boon.rarity || 'Common'}
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100">{boon.name}</h3>
                  <p className="text-[11px] font-mono font-semibold text-purple-400 mt-0.5">
                    {boon.type}
                  </p>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed bg-[#0D1117]/60 border border-slate-800/80 rounded-xl p-3">
                  {boon.effect}
                </p>
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-medium text-slate-400">
                  <span>Applies To:</span>
                  <span className="text-orange-400 font-bold">{boon.target}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* VAULT TAB */}
        {activeTab === 'vault' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {fighters.map((fighter) => (
              <div
                key={fighter.id}
                onClick={() => setSelectedFighter(fighter)}
                className="bg-[#161B26] border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-lg cursor-pointer hover:border-orange-500/50 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-3xl">{fighter.image || '❓'}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30">
                      {fighter.status || 'Contestant'}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-100">{fighter.name}</h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{fighter.bio}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
