import React, { useState, useEffect, useMemo } from 'react';

// Insert your published Google Sheet CSV URLs here
const CONFIG_SHEET_CSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ2POPXiw_0BcgW0X60GGUk0HY8OQK-sI8LpUKPrCm7hzkgRl80oxulZdvQ9g25jZsAIKioAm08FL1g/pub?gid=0&single=true&output=csv";
const BOONS_SHEET_CSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ2POPXiw_0BcgW0X60GGUk0HY8OQK-sI8LpUKPrCm7hzkgRl80oxulZdvQ9g25jZsAIKioAm08FL1g/pub?gid=388339265&single=true&output=csv";
const FIGHTERS_SHEET_CSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ2POPXiw_0BcgW0X60GGUk0HY8OQK-sI8LpUKPrCm7hzkgRl80oxulZdvQ9g25jZsAIKioAm08FL1g/pub?gid=1937729440&single=true&output=csv";
const MATCHUPS_SHEET_CSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ2POPXiw_0BcgW0X60GGUk0HY8OQK-sI8LpUKPrCm7hzkgRl80oxulZdvQ9g25jZsAIKioAm08FL1g/pub?gid=2016168137&single=true&output=csv";
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
  const [matchups, setMatchups] = useState([]);
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

        // Fetch Config, Boons, Fighters, Matchups, and Scores in parallel (all 5 included)
        const [configRes, boonsRes, fightersRes, matchupsRes, scoresRes] = await Promise.all([
          fetch(CONFIG_SHEET_CSV).then((r) => r.text()),
          fetch(BOONS_SHEET_CSV).then((r) => r.text()),
          fetch(FIGHTERS_SHEET_CSV).then((r) => r.text()),
          fetch(MATCHUPS_SHEET_CSV).then((r) => r.text()),
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
        setBoons(parseCSV(boonsRes));

        // Parse Fighters
        const fightersData = parseCSV(fightersRes).map((f) => ({
          ...f,
          attributes: f.attributes ? f.attributes.split(',').map((a) => a.trim()) : [],
        }));
        setFighters(fightersData);

        // Parse Matchups
        setMatchups(parseCSV(matchupsRes));
        
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
  
  // Helper map to look up fighters by ID
  const fightersById = useMemo(() => {
    const map = {};
    fighters.forEach((f) => {
      if (f.id) {
        map[f.id.toLowerCase()] = f;
      }
    });
    return map;
  }, [fighters]);
  
  // Compute active round matchups with live lead calculations
  const activeMatchups = useMemo(() => {
    const currentRoundId = (config.activeRound || 'sweet-sixteen').toLowerCase().replace(/\s+/g, '-');
    const roundMatchups = matchups.filter(
      (m) => (m.roundId || '').toLowerCase().replace(/\s+/g, '-') === currentRoundId
    );
  
    return roundMatchups.map((m) => {
      const fA = fightersById[m.fighterAId?.toLowerCase()] || { name: m.fighterAId, image: '❓', seed: '?' };
      const fB = fightersById[m.fighterBId?.toLowerCase()] || { name: m.fighterBId, image: '❓', seed: '?' };
  
      const scoreA = liveScores[m.fighterAId?.toLowerCase()] ?? 0;
      const scoreB = liveScores[m.fighterBId?.toLowerCase()] ?? 0;
  
      return {
        ...m,
        isTied: scoreA === scoreB,
        fighter1: { ...fA, currentScore: scoreA, isLeading: scoreA > scoreB },
        fighter2: { ...fB, currentScore: scoreB, isLeading: scoreB > scoreA },
      };
    });
  }, [matchups, fightersById, liveScores, config.activeRound]);

  // Auto-rotate banner every 8 seconds
  useEffect(() => {
    if (activeMatchups.length === 0 || isPaused) return;
    const timer = setInterval(() => {
      setCurrentMatchIndex((prev) => (prev + 1) % activeMatchups.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [activeMatchups.length, isPaused]);

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

  const activeRoundName = config.activeRound || 'Sweet Sixteen';
  const votingUrl = config.activeVotingUrl || '#';
  const activeBannerMatch = activeMatchups[currentMatchIndex] || activeMatchups[0];

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
              Active Round: <strong className="text-purple-200">{activeRoundName}</strong>
            </span>
          </div>
          <a
            href={votingUrl}
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
          <strong>{activeRoundName}</strong> Voting Session Opens In:
        </span>
        <div className="flex items-center gap-1 font-mono font-bold text-orange-300 bg-black/40 px-2.5 py-1 rounded-md border border-orange-500/30 text-xs">
          <span>{String(timeLeft.days).padStart(2, '0')}d</span>:
          <span>{String(timeLeft.hours).padStart(2, '0')}h</span>:
          <span>{String(timeLeft.minutes).padStart(2, '0')}m</span>:
          <span>{String(timeLeft.seconds).padStart(2, '0')}s</span>
        </div>
        <a
          href={votingUrl}
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
            🧙‍♂️ Boons & Perks ({boons.length})
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
        {/* CURRENT ROUND GRID TAB */}
        {activeTab === 'grid' && (
          <div className="space-y-8">
            {/* ROTATING SPOTLIGHT BANNER */}
            {activeBannerMatch && (
              <div
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                className="bg-gradient-to-r from-[#1A0F26] via-[#161B26] to-[#261208] border border-orange-500/40 rounded-2xl p-6 shadow-2xl relative overflow-hidden"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="bg-orange-500 text-black font-black text-[10px] tracking-widest px-3 py-1 rounded-full uppercase">
                    SPOTLIGHT BATTLE ({currentMatchIndex + 1}/{activeMatchups.length})
                  </span>
                </div>
                <div className="text-center mb-4">
                  <span className="text-xs font-bold text-orange-400 tracking-widest uppercase">
                    {activeRoundName} • Matchup {activeBannerMatch.id?.toUpperCase()}
                  </span>
                  <h2 className="text-lg sm:text-xl font-black text-slate-100 mt-0.5">
                    {activeBannerMatch.fighter1.name} <span className="text-orange-500 font-mono">VS</span> {activeBannerMatch.fighter2.name}
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  <div onClick={() => setSelectedFighter(activeBannerMatch.fighter1)} className="flex items-center justify-between p-4 rounded-xl border bg-[#0D1117]/80 border-slate-800 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{activeBannerMatch.fighter1.image}</span>
                      <div>
                        <h3 className="font-bold text-slate-100 text-sm">{activeBannerMatch.fighter1.name}</h3>
                        <p className="text-xs text-slate-400">Seed #{activeBannerMatch.fighter1.seed || '?'}</p>
                      </div>
                    </div>
                    <span className="text-base font-mono font-extrabold text-orange-400">{activeBannerMatch.fighter1.currentScore} pts</span>
                  </div>
                  <div onClick={() => setSelectedFighter(activeBannerMatch.fighter2)} className="flex items-center justify-between p-4 rounded-xl border bg-[#0D1117]/80 border-slate-800 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{activeBannerMatch.fighter2.image}</span>
                      <div>
                        <h3 className="font-bold text-slate-100 text-sm">{activeBannerMatch.fighter2.name}</h3>
                        <p className="text-xs text-slate-400">Seed #{activeBannerMatch.fighter2.seed || '?'}</p>
                      </div>
                    </div>
                    <span className="text-base font-mono font-extrabold text-orange-400">{activeBannerMatch.fighter2.currentScore} pts</span>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-purple-300 font-medium">📍 Arena: {activeBannerMatch.location || 'Undisclosed Arena'}</span>
                  <a href={votingUrl} target="_blank" rel="noreferrer" className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-1.5 rounded-lg transition-all">
                    Cast Your Vote ↗
                  </a>
                </div>
              </div>
            )}

            {/* MATCHUPS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {activeMatchups.map((match) => (
                <div key={match.id} className="bg-[#161B26] border border-slate-800/90 rounded-2xl p-4 shadow-xl flex flex-col justify-between space-y-3">
                  <div className="flex items-center justify-between text-xs font-medium text-purple-400">
                    <span className="bg-purple-950/40 border border-purple-500/30 text-purple-300 text-[10px] font-bold px-2 py-0.5 rounded font-mono uppercase">
                      MATCH {match.id?.toUpperCase()}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div onClick={() => setSelectedFighter(match.fighter1)} className="flex items-center justify-between p-3 rounded-xl border bg-[#0D1117] border-slate-800 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{match.fighter1.image}</span>
                        <div>
                          <span className="text-xs font-bold text-slate-200">{match.fighter1.name}</span>
                          <p className="text-[10px] text-slate-500">Seed #{match.fighter1.seed || '?'}</p>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold text-orange-400">{match.fighter1.currentScore} pts</span>
                    </div>
                    <div onClick={() => setSelectedFighter(match.fighter2)} className="flex items-center justify-between p-3 rounded-xl border bg-[#0D1117] border-slate-800 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{match.fighter2.image}</span>
                        <div>
                          <span className="text-xs font-bold text-slate-200">{match.fighter2.name}</span>
                          <p className="text-[10px] text-slate-500">Seed #{match.fighter2.seed || '?'}</p>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold text-orange-400">{match.fighter2.currentScore} pts</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-center text-[11px] font-medium text-purple-300 bg-[#0D1117]/60 py-1.5 px-3 rounded-lg border border-purple-500/20">
                    <span>📍 {match.location || 'Arena'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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
