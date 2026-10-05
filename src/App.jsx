import React, { useState, useEffect, useMemo } from 'react';
import tournamentData from './data/tournament.json';

export default function App() {
  const [activeTab, setActiveTab] = useState('grid'); // Default to current round grid landing page
  const [expandedMatch, setExpandedMatch] = useState(null);
  const [liveScores, setLiveScores] = useState({});
  const [loadingScores, setLoadingScores] = useState(true);
  
  // Carousel state for auto-rotating banner
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);

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

  // Auto-rotate banner every 10 seconds (6000ms)
  useEffect(() => {
    if (activeMatchups.length === 0) return;

    const timer = setInterval(() => {
      setCurrentMatchIndex((prevIndex) => (prevIndex + 1) % activeMatchups.length);
    }, 10000);

    return () => clearInterval(timer);
  }, [activeMatchups.length]);

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
    setCurrentMatchIndex((prev) => (prev - 1 + activeMatchups.length) % activeMatchups.length);
  };

  const handleNextBanner = () => {
    setCurrentMatchIndex((prev) => (prev + 1) % activeMatchups.length);
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
            
            {/* ROTATING MATCHUP BANNER */}
            {activeBannerMatch && (
              <div className="bg-gradient-to-r from-[#1A0F26] via-[#161B26] to-[#261208] border border-orange-500/40 rounded-2xl p-6 shadow-2xl relative overflow-hidden transition-all duration-500">
                
                {/* Top Badge & Controls */}
                <div className="flex items-center justify-between mb-2">
                  <div className="bg-orange-500 text-black font-black text-[10px] tracking-widest px-3 py-1 rounded-full uppercase">
                    SPOTLIGHT BATTLE ({currentMatchIndex + 1}/{activeMatchups.length})
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
                    {activeBannerMatch.fighter1.name} <span className="text-orange-500 font-mono">VS</span> {activeBannerMatch.fighter2.name}
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  {/* Contestant 1 */}
                  <div
                    className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                      activeBannerMatch.fighter1.isLeading
                        ? 'bg-[#1C1610] border-orange-500/80 shadow-lg shadow-orange-950/40'
                        : 'bg-[#0D1117]/80 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl sm:text-4xl">{activeBannerMatch.fighter1.image}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-100 text-sm sm:text-base">
                            {activeBannerMatch.fighter1.name}
                          </h3>
                          {activeBannerMatch.fighter1.isLeading && (
                            <span className="text-[9px] bg-orange-500/20 text-orange-400 border border-orange-500/40 px-1.5 py-0.5 rounded font-mono font-bold uppercase">
                              IN LEAD
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400">Seed #{activeBannerMatch.fighter1.seed}</p>
                      </div>
                    </div>
                    <span className="text-base sm:text-lg font-mono font-extrabold text-orange-400">
                      {loadingScores ? '...' : `${activeBannerMatch.fighter1.currentScore} pts`}
                    </span>
                  </div>

                  {/* Contestant 2 */}
                  <div
                    className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                      activeBannerMatch.fighter2.isLeading
                        ? 'bg-[#1C1610] border-orange-500/80 shadow-lg shadow-orange-950/40'
                        : 'bg-[#0D1117]/80 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl sm:text-4xl">{activeBannerMatch.fighter2.image}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-100 text-sm sm:text-base">
                            {activeBannerMatch.fighter2.name}
                          </h3>
                          {activeBannerMatch.fighter2.isLeading && (
                            <span className="text-[9px] bg-orange-500/20 text-orange-400 border border-orange-500/40 px-1.5 py-0.5 rounded font-mono font-bold uppercase">
                              IN LEAD
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400">Seed #{activeBannerMatch.fighter2.seed}</p>
                      </div>
                    </div>
                    <span className="text-base sm:text-lg font-mono font-extrabold text-orange-400">
                      {loadingScores ? '...' : `${activeBannerMatch.fighter2.currentScore} pts`}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs gap-2">
                  <span className="text-purple-300 font-medium flex items-center gap-1.5">
                    <span>📍 Arena:</span> {activeBannerMatch.location}
                  </span>
                  
                  {/* Carousel Progress Dots */}
                  <div className="flex items-center gap-1.5 my-1">
                    {activeMatchups.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentMatchIndex(idx)}
                        className={`h-1.5 rounded-full transition-all ${
                          idx === currentMatchIndex ? 'w-5 bg-orange-500' : 'w-1.5 bg-slate-700 hover:bg-slate-500'
                        }`}
                        title={`Go to match ${idx + 1}`}
                      />
                    ))}
                  </div>

                  <a
                    href={votingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-1.5 rounded-lg transition-all shadow-md shadow-orange-500/20 active:scale-95"
                  >
                    Cast Your Vote ↗
                  </a>
                </div>
              </div>
            )}

            {/* GRID HEADER */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-xl font-black text-orange-500 tracking-wide uppercase">
                  {activeRoundName} Battles ({activeMatchups.length})
                </h2>
                <p className="text-xs text-slate-400 font-medium">
                  Live scores update dynamically from Google Sheets.
                </p>
              </div>
              <a
                href={votingUrl}
                target="_blank"
                rel="noreferrer"
                className="hidden sm:inline-flex bg-[#191F2E] border border-orange-500/40 text-orange-400 hover:bg-orange-950/40 font-bold text-xs px-3.5 py-2 rounded-lg items-center gap-1.5 transition-all"
              >
                <span>📝</span> Open Full Ballot
              </a>
            </div>

            {/* MATCHUPS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {activeMatchups.map((match) => {
                const isExpanded = expandedMatch === match.id;
                return (
                  <div
                    key={match.id}
                    className="bg-[#161B26] border border-slate-800/90 rounded-2xl p-4 shadow-xl flex flex-col justify-between hover:border-slate-700 transition-all space-y-3"
                  >
                    {/* Card Top Row */}
                    <div className="flex items-center justify-between text-xs font-medium text-purple-400">
                      <span className="bg-purple-950/40 border border-purple-500/30 text-purple-300 text-[10px] font-bold px-2 py-0.5 rounded font-mono uppercase">
                        MATCH {match.id.toUpperCase()}
                      </span>
                      {match.isTied ? (
                        <span className="bg-slate-800 text-slate-400 font-mono text-[9px] px-2 py-0.5 rounded font-bold uppercase">
                          TIED
                        </span>
                      ) : (
                        <span className="text-slate-500 font-mono text-[10px] uppercase">
                          LIVE TALLY
                        </span>
                      )}
                    </div>

                    {/* Contestants List */}
                    <div className="space-y-2">
                      {/* Fighter 1 */}
                      <div
                        className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                          match.fighter1.isLeading
                            ? 'bg-[#1C1610] border-orange-500/60 shadow-md shadow-orange-950/30'
                            : 'bg-[#0D1117] border-slate-800/60'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{match.fighter1.image}</span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-xs font-bold ${
                                  match.fighter1.isLeading ? 'text-orange-400' : 'text-slate-200'
                                }`}
                              >
                                {match.fighter1.name}
                              </span>
                              {match.fighter1.isLeading && (
                                <span className="text-[8px] bg-orange-500/20 text-orange-400 border border-orange-500/40 px-1.5 py-0.2 rounded font-mono font-bold uppercase">
                                  IN LEAD
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-500">
                              Seed #{match.fighter1.seed || 'N/A'}
                            </span>
                          </div>
                        </div>
                        <span
                          className={`text-xs font-mono font-bold ${
                            match.fighter1.isLeading ? 'text-orange-400 text-sm' : 'text-slate-400'
                          }`}
                        >
                          {loadingScores ? '...' : `${match.fighter1.currentScore} pts`}
                        </span>
                      </div>

                      {/* Fighter 2 */}
                      <div
                        className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                          match.fighter2.isLeading
                            ? 'bg-[#1C1610] border-orange-500/60 shadow-md shadow-orange-950/30'
                            : 'bg-[#0D1117] border-slate-800/60'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{match.fighter2.image}</span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-xs font-bold ${
                                  match.fighter2.isLeading ? 'text-orange-400' : 'text-slate-200'
                                }`}
                              >
                                {match.fighter2.name}
                              </span>
                              {match.fighter2.isLeading && (
                                <span className="text-[8px] bg-orange-500/20 text-orange-400 border border-orange-500/40 px-1.5 py-0.2 rounded font-mono font-bold uppercase">
                                  IN LEAD
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-500">
                              Seed #{match.fighter2.seed || 'N/A'}
                            </span>
                          </div>
                        </div>
                        <span
                          className={`text-xs font-mono font-bold ${
                            match.fighter2.isLeading ? 'text-orange-400 text-sm' : 'text-slate-400'
                          }`}
                        >
                          {loadingScores ? '...' : `${match.fighter2.currentScore} pts`}
                        </span>
                      </div>
                    </div>

                    {/* Arena Location Tag */}
                    <div className="flex items-center justify-center text-[11px] font-medium text-purple-300 bg-[#0D1117]/60 py-1.5 px-3 rounded-lg border border-purple-500/20">
                      <span className="truncate flex items-center gap-1.5" title={match.location}>
                        <span>📍</span> {match.location}
                      </span>
                    </div>

                    {/* Expandable Attributes */}
                    {isExpanded && (
                      <div className="pt-2 border-t border-slate-800/80 text-[11px] bg-[#0D1117] p-3 rounded-xl space-y-2">
                        <div>
                          <p className="text-[10px] font-bold text-purple-300 uppercase">
                            {match.fighter1.name} Traits:
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {match.fighter1.attributes?.join(', ') || 'Standard fighter skills'}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-purple-300 uppercase">
                            {match.fighter2.name} Traits:
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {match.fighter2.attributes?.join(', ') || 'Standard fighter skills'}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Card Actions */}
                    <div className="flex items-center justify-between pt-1 text-[11px]">
                      <button
                        onClick={() => toggleMatchDetails(match.id)}
                        className="text-slate-400 hover:text-orange-400 font-semibold transition-colors"
                      >
                        {isExpanded ? 'Hide Details ▲' : 'View Traits ▼'}
                      </button>
                      <a
                        href={votingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-orange-400 font-bold hover:underline inline-flex items-center gap-1"
                      >
                        Vote Match {match.id.toUpperCase()} ↗
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* INTERACTIVE BRACKET TAB */}
        {activeTab === 'bracket' && (
          <div className="flex gap-6 min-w-max items-start">
            {rounds.map((round) => (
              <div key={round.id} className="w-80 flex flex-col gap-4">
                <div className="border-b border-slate-800 pb-2">
                  <h2 className="text-sm font-black tracking-wider text-orange-500 uppercase">
                    {round.name}
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">{round.date}</p>
                </div>

                {round.status === 'active' && round.matchups.length > 0 ? (
                  round.matchups.map((match) => {
                    const isExpanded = expandedMatch === match.id;
                    return (
                      <div
                        key={match.id}
                        className="bg-[#161B26] border border-slate-800/90 rounded-xl p-3 shadow-xl flex flex-col gap-2 hover:border-slate-700/80 transition-all"
                      >
                        <div className="flex items-center justify-between text-[11px] font-medium text-purple-400">
                          {match.matchTitle ? (
                            <div className="text-[10px] font-bold text-orange-400/90 bg-orange-950/30 px-2 py-0.5 rounded border border-orange-900/30">
                              {match.matchTitle}
                            </div>
                          ) : (
                            <span />
                          )}

                          {match.isTied ? (
                            <span className="bg-slate-800 text-slate-400 font-mono text-[9px] px-1.5 py-0.5 rounded font-bold uppercase">
                              TIED
                            </span>
                          ) : (
                            <span className="text-slate-500 font-mono text-[10px] uppercase">
                              {match.id}
                            </span>
                          )}
                        </div>

                        {/* Fighter 1 Card */}
                        <div
                          className={`flex items-center justify-between p-2.5 rounded-lg border transition-all ${
                            match.fighter1.isLeading
                              ? 'bg-[#1C1610] border-orange-500/60 shadow-md shadow-orange-950/30'
                              : 'bg-[#0D1117] border-slate-800/50 opacity-85'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{match.fighter1.image}</span>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`text-xs font-bold ${
                                    match.fighter1.isLeading ? 'text-orange-400' : 'text-slate-200'
                                  }`}
                                >
                                  {match.fighter1.name}
                                </span>
                                {match.fighter1.isLeading && (
                                  <span className="text-[8px] bg-orange-500/20 text-orange-400 border border-orange-500/40 px-1 py-0.2 rounded font-mono font-bold uppercase">
                                    IN LEAD
                                  </span>
                                )}
                              </div>
                              {match.fighter1.seed && (
                                <span className="text-[9px] text-slate-500">
                                  Seed #{match.fighter1.seed}
                                </span>
                              )}
                            </div>
                          </div>
                          <span
                            className={`text-xs font-mono font-bold ${
                              match.fighter1.isLeading ? 'text-orange-400 text-sm' : 'text-slate-400'
                            }`}
                          >
                            {loadingScores ? '...' : `${match.fighter1.currentScore} pts`}
                          </span>
                        </div>

                        {/* Fighter 2 Card */}
                        <div
                          className={`flex items-center justify-between p-2.5 rounded-lg border transition-all ${
                            match.fighter2.isLeading
                              ? 'bg-[#1C1610] border-orange-500/60 shadow-md shadow-orange-950/30'
                              : 'bg-[#0D1117] border-slate-800/50 opacity-85'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{match.fighter2.image}</span>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`text-xs font-bold ${
                                    match.fighter2.isLeading ? 'text-orange-400' : 'text-slate-200'
                                  }`}
                                >
                                  {match.fighter2.name}
                                </span>
                                {match.fighter2.isLeading && (
                                  <span className="text-[8px] bg-orange-500/20 text-orange-400 border border-orange-500/40 px-1 py-0.2 rounded font-mono font-bold uppercase">
                                    IN LEAD
                                  </span>
                                )}
                              </div>
                              {match.fighter2.seed && (
                                <span className="text-[9px] text-slate-500">
                                  Seed #{match.fighter2.seed}
                                </span>
                              )}
                            </div>
                          </div>
                          <span
                            className={`text-xs font-mono font-bold ${
                              match.fighter2.isLeading ? 'text-orange-400 text-sm' : 'text-slate-400'
                            }`}
                          >
                            {loadingScores ? '...' : `${match.fighter2.currentScore} pts`}
                          </span>
                        </div>

                        {/* Location Tag */}
                        <div className="flex items-center justify-center text-[11px] font-medium text-purple-400 bg-[#0D1117]/60 py-1 px-2 rounded border border-purple-500/20 mt-1">
                          <span className="truncate flex items-center gap-1.5" title={match.location}>
                            <span>📍</span> {match.location}
                          </span>
                        </div>

                        {/* Toggle Details */}
                        {isExpanded && (
                          <div className="mt-1 pt-2 border-t border-slate-800/80 text-[11px] bg-[#0D1117] p-2.5 rounded-lg space-y-2">
                            <div>
                              <p className="text-[10px] font-bold text-purple-300 uppercase">
                                {match.fighter1.name} Attributes:
                              </p>
                              <p className="text-[10px] text-slate-400">
                                {match.fighter1.attributes?.join(', ') || 'Standard fighter skills'}
                              </p>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-purple-300 uppercase">
                                {match.fighter2.name} Attributes:
                              </p>
                              <p className="text-[10px] text-slate-400">
                                {match.fighter2.attributes?.join(', ') || 'Standard fighter skills'}
                              </p>
                            </div>
                          </div>
                        )}

                        <button
                          onClick={() => toggleMatchDetails(match.id)}
                          className="w-full text-center text-[10px] font-semibold text-slate-400 hover:text-orange-400 pt-1 transition-colors"
                        >
                          {isExpanded ? 'Hide Fighter Attributes ▲' : 'View Fighter Attributes ▼'}
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <div className="border border-dashed border-slate-800/80 rounded-xl p-6 text-center text-xs text-slate-500 flex items-center justify-center min-h-[140px] bg-[#0D1117]/40 leading-relaxed font-medium">
                    Matchups lock after previous round concludes
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* VAULT TAB */}
        {activeTab === 'vault' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-7xl mx-auto">
            {tournamentData?.fighters?.map((fighter) => (
              <div
                key={fighter.id}
                className="bg-[#161B26] border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-3xl">{fighter.image}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        fighter.status === 'Main Bracket'
                          ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                          : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      }`}
                    >
                      {fighter.status}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-100">{fighter.name}</h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{fighter.bio}</p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-800/60 flex flex-wrap gap-1">
                  {fighter.attributes?.map((attr, idx) => (
                    <span
                      key={idx}
                      className="text-[9px] bg-[#0D1117] text-slate-300 px-1.5 py-0.5 rounded border border-slate-800"
                    >
                      {attr}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* HAZARDS TAB */}
        {activeTab === 'hazards' && (
          <div className="text-slate-400 text-sm max-w-xl mx-auto text-center py-12">
            <p className="text-lg font-bold text-slate-200 mb-2">Locations & Hazards</p>
            <p>Battle arenas, environment effects, and hazard cards will display here.</p>
          </div>
        )}
      </main>
    </div>
  );
}
