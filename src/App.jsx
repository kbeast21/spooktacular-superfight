import React, { useState, useEffect, useMemo } from 'react';
import tournamentData from './data/tournament.json';

export default function App() {
  const [activeTab, setActiveTab] = useState('grid');
  const [expandedMatch, setExpandedMatch] = useState(null);
  const [liveScores, setLiveScores] = useState({});
  const [loadingScores, setLoadingScores] = useState(true);

  // Carousel state for auto-rotating banner
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Fetch Live Scores from Google Sheet CSV
  useEffect(() => {
    async function fetchScores() {
      if (!tournamentData?.googleSheetCsvUrl) {
        setLoadingScores(false);
        return;
      }

      try {
        const response = await fetch(tournamentData.googleSheetCsvUrl);
        const csvText = await response.text();

        const lines = csvText.split(/\r?\n/);
        const parsedScores = {};

        lines.forEach((line) => {
          const columns = line.split(',').map((col) => col.trim().replace(/^"|"$/g, ''));

          if (columns.length >= 2) {
            const key = columns[0].toLowerCase();
            const val = parseInt(columns[1], 10);
            if (!isNaN(val)) {
              parsedScores[key] = val;
            }
          }
        });

        setLiveScores(parsedScores);
      } catch (err) {
        console.error('Failed to load live scores from Google Sheets:', err);
      } finally {
        setLoadingScores(false);
      }
    }

    fetchScores();
  }, []);

  const toggleMatchDetails = (matchId) => {
    setExpandedMatch(expandedMatch === matchId ? null : matchId);
  };

  // Helper map to look up fighters by ID
  const fightersById = useMemo(() => {
    const map = {};
    if (tournamentData?.fighters) {
      tournamentData.fighters.forEach((f) => {
        map[f.id] = f;
      });
    }
    return map;
  }, []);

  // Compute round matchups with live lead calculations
  const activeMatchups = useMemo(() => {
    const rawMatchups = tournamentData?.rounds?.[0]?.matchups || [];
    return rawMatchups.map((m) => {
      const fA = fightersById[m.fighterAId] || { name: m.fighterAId, image: '❓' };
      const fB = fightersById[m.fighterBId] || { name: m.fighterBId, image: '❓' };

      const scoreA = liveScores[m.fighterAId?.toLowerCase()] ?? fA.votes ?? 0;
      const scoreB = liveScores[m.fighterBId?.toLowerCase()] ?? fB.votes ?? 0;

      const isATied = scoreA === scoreB;
      const isALeading = scoreA > scoreB;
      const isBLeading = scoreB > scoreA;

      return {
        ...m,
        isTied: isATied,
        fighter1: { ...fA, currentScore: scoreA, isLeading: isALeading },
        fighter2: { ...fB, currentScore: scoreB, isLeading: isBLeading },
      };
    });
  }, [fightersById, liveScores]);

  // Auto-rotate banner every 8 seconds (8000ms), pausing on hover or manual interaction
  useEffect(() => {
    if (activeMatchups.length === 0 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentMatchIndex((prevIndex) => (prevIndex + 1) % activeMatchups.length);
    }, 8000);

    return () => clearInterval(timer);
  }, [activeMatchups.length, isPaused]);

  const rounds = [
    {
      id: 'sweet-16',
      name: 'SWEET SIXTEEN',
      date: 'Oct 16 – Oct 21',
      status: 'active',
      matchups: activeMatchups,
    },
    {
      id: 'elite-eight',
      name: 'ELITE EIGHT',
      date: 'Oct 22 – Oct 25',
      status: 'locked',
    },
    {
      id: 'final-four',
      name: 'FINAL FOUR',
      date: 'Oct 26 – Oct 29',
      status: 'locked',
    },
    {
      id: 'championship',
      name: 'CHAMPIONSHIP',
      date: 'Oct 30 – Oct 31',
      status: 'locked',
    },
  ];

  const votingUrl = tournamentData?.activeVotingUrl || '#';
  const activeRoundName = tournamentData?.activeRound || 'Sweet Sixteen';

  // Currently displayed banner matchup
  const activeBannerMatch = activeMatchups[currentMatchIndex] || activeMatchups[0];

  const handlePrevBanner = () => {
    setIsPaused(true);
    setCurrentMatchIndex((prev) => (prev - 1 + activeMatchups.length) % activeMatchups.length);
  };

  const handleNextBanner = () => {
    setIsPaused(true);
    setCurrentMatchIndex((prev) => (prev + 1) % activeMatchups.length);
  };

  const handleSelectDot = (idx) => {
    setIsPaused(true);
    setCurrentMatchIndex(idx);
  };

  return (
    <div className="min-h-screen bg-[#0B0E17] text-slate-100 font-sans flex flex-col">
      {/* HEADER */}
      <header className="bg-[#0D1117] border-b border-slate-800/80 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-2xl">
            💀
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-wide text-orange-500 uppercase">
              {tournamentData?.tournamentName || 'OCTOBER MADNESS 2026'}
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

      {/* ALERT BANNER */}
      <div className="bg-[#2A1508] border-b border-orange-900/40 text-orange-400 text-xs py-2.5 px-4 text-center font-medium flex items-center justify-center gap-2">
        <span className="text-sm">⚠️</span>
        <span>
          Ballots for <strong>{activeRoundName}</strong> are currently OPEN!
        </span>
        <a
          href={votingUrl}
          target="_blank"
          rel="noreferrer"
          className="underline font-bold text-orange-300 hover:text-orange-200 ml-1 inline-flex items-center gap-0.5"
        >
          Submit Ballot ↗
        </a>
      </div>

      {/* NAVIGATION TABS */}
      <nav className="flex justify-center border-b border-slate-800/80 bg-[#0B0E17] pt-4">
        <div className="flex gap-6 sm:gap-8 text-sm font-semibold">
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
            onClick={() => setActiveTab('bracket')}
            className={`pb-3 transition-colors ${
              activeTab === 'bracket'
                ? 'border-b-2 border-orange-500 text-orange-500 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Interactive Bracket
          </button>
          <button
            onClick={() => setActiveTab('vault')}
            className={`pb-3 transition-colors ${
              activeTab === 'vault'
                ? 'border-b-2 border-orange-500 text-orange-500 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Fighter Vault ({tournamentData?.fighters?.length || 32})
          </button>
          <button
            onClick={() => setActiveTab('hazards')}
            className={`pb-3 transition-colors ${
              activeTab === 'hazards'
                ? 'border-b-2 border-orange-500 text-orange-500 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Locations & Hazards
          </button>
        </div>
      </nav>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-x-auto p-4 md:p-8">
        {/* LANDING PAGE GRID VIEW */}
        {activeTab === 'grid' && (
          <div className="max-w-7xl mx-auto space-y-8">
            {/* ROTATING MATCHUP BANNER (8s Delay + Pause on Hover/Interaction) */}
            {activeBannerMatch && (
              <div
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                className="bg-gradient-to-r from-[#1A0F26] via-[#161B26] to-[#261208] border border-orange-500/40 rounded-2xl p-6 shadow-2xl relative overflow-hidden transition-all duration-500"
              >
                {/* Top Badge & Status Controls */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="bg-orange-500 text-black font-black text-[10px] tracking-widest px-3 py-1 rounded-full uppercase">
                      SPOTLIGHT BATTLE ({currentMatchIndex + 1}/{activeMatchups.length})
                    </span>
                    {isPaused && (
                      <span className="text-[9px] bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded-full font-mono uppercase font-semibold">
                        ⏸ PAUSED
                      </span>
                    )}
                  </div>

                  {/* Manual Nav Controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrevBanner}
                      className="w-7 h-7 bg-[#0D1117]/80 hover:bg-orange-500 hover:text-black border border-slate-700 text-slate-300 rounded-full flex items-center justify-center text-xs transition-colors"
                      title="Previous Match"
                    >
                      ◀
                    </button>
                    <button
                      onClick={handleNextBanner}
                      className="w-7 h-7 bg-[#0D1117]/80 hover:bg-orange-500 hover:text-black border border-slate-700 text-slate-300 rounded-full flex items-center justify-center text-xs transition-colors"
                      title="Next Match"
                    >
                      ▶
                    </button>
                  </div>
                </div>

                <div className="text-center mb-4">
                  <span className="text-xs font-bold text-orange-400 tracking-widest uppercase">
                    {activeRoundName} • Matchup {activeBannerMatch.id.toUpperCase()}
                  </span>
                  <h2 className="text-lg sm:text-xl font-black text-slate-100 mt-0.5">
                    {activeBannerMatch.fighter1.name}{' '}
                    <span className="text-orange-500 font-mono">VS</span>{' '}
                    {activeBannerMatch.fighter2.name}
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  {/* Contestant 1 */}
                  <div
                    className={`flex items-center justify-between p-4 rounded-xl border transition-
