import React, { useState, useEffect, useMemo } from 'react';
import tournamentData from './data/tournament.json';

export default function App() {
  const [activeTab, setActiveTab] = useState('bracket');
  const [expandedMatch, setExpandedMatch] = useState(null);
  const [liveScores, setLiveScores] = useState({});
  const [loadingScores, setLoadingScores] = useState(true);

  // 1. Fetch Live Scores from Google Sheet CSV
  useEffect(() => {
    async function fetchScores() {
      if (!tournamentData?.googleSheetCsvUrl) {
        setLoadingScores(false);
        return;
      }

      try {
        const response = await fetch(tournamentData.googleSheetCsvUrl);
        const csvText = await response.text();

        // Simple CSV parser assuming lines format: matchId,fighterAId,scoreA,fighterBId,scoreB
        // or fighterId,score
        const lines = csvText.split('\n');
        const parsedScores = {};

        lines.forEach((line) => {
          const columns = line.split(',').map((col) => col.trim().replace(/^"|"$/g, ''));
          
          // Example parser for rows like: "dracula", "14" or "m1", "dracula", "14"
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

  // Helper map to quickly look up fighters by ID
  const fightersById = useMemo(() => {
    const map = {};
    if (tournamentData?.fighters) {
      tournamentData.fighters.forEach((f) => {
        map[f.id] = f;
      });
    }
    return map;
  }, []);

  // Standard rounds structure merged with data from JSON & Live Sheets
  const rounds = [
    {
      id: 'sweet-16',
      name: 'SWEET SIXTEEN',
      date: 'Oct 16 – Oct 21',
      status: 'active',
      matchups: (tournamentData?.rounds?.[0]?.matchups || []).map((m) => {
        const fA = fightersById[m.fighterAId] || { name: m.fighterAId, image: '❓' };
        const fB = fightersById[m.fighterBId] || { name: m.fighterBId, image: '❓' };

        // Pull live score from state if present, otherwise fallback to fighter.votes or 0
        const scoreA = liveScores[m.fighterAId?.toLowerCase()] ?? fA.votes ?? 0;
        const scoreB = liveScores[m.fighterBId?.toLowerCase()] ?? fB.votes ?? 0;

        return {
          ...m,
          fighter1: { ...fA, currentScore: scoreA },
          fighter2: { ...fB, currentScore: scoreB },
        };
      }),
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

  return (
    <div className="min-h-screen bg-[#0B0E17] text-slate-100 font-sans flex flex-col">
      {/* 1. TOP HEADER */}
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

      {/* 2. ALERT BANNER */}
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

      {/* 3. NAVIGATION TABS */}
      <nav className="flex justify-center border-b border-slate-800/80 bg-[#0B0E17] pt-4">
        <div className="flex gap-8 text-sm font-semibold">
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

      {/* 4. MAIN BRACKET CONTENT */}
      <main className="flex-1 overflow-x-auto p-6 md:p-8">
        {activeTab === 'bracket' && (
          <div className="flex gap-6 min-w-max items-start">
            {rounds.map((round) => (
              <div key={round.id} className="w-80 flex flex-col gap-4">
                {/* Round Title */}
                <div className="border-b border-slate-800 pb-2">
                  <h2 className="text-sm font-black tracking-wider text-orange-500 uppercase">
                    {round.name}
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">{round.date}</p>
                </div>

                {/* Matchup Cards */}
                {round.status === 'active' && round.matchups.length > 0 ? (
                  round.matchups.map((match) => {
                    const isExpanded = expandedMatch === match.id;
                    return (
                      <div
                        key={match.id}
                        className="bg-[#161B26] border border-slate-800/90 rounded-xl p-3 shadow-xl flex flex-col gap-2 hover:border-slate-700/80 transition-all"
                      >
                        {/* Match Location & Title */}
                        <div className="flex items-center justify-between text-[11px] font-medium text-purple-400">
                          <span className="truncate pr-2 flex items-center gap-1.5" title={match.location}>
                            <span>📍</span> {match.location}
                          </span>
                          <span className="text-slate-500 font-mono text-[10px] uppercase">
                            {match.id}
                          </span>
                        </div>

                        {/* Match Title Subheader */}
                        {match.matchTitle && (
                          <div className="text-[10px] font-bold text-orange-400/90 bg-orange-950/30 px-2 py-0.5 rounded border border-orange-900/30">
                            {match.matchTitle}
                          </div>
                        )}

                        {/* Fighter 1 Card */}
                        <div className="flex items-center justify-between bg-[#0D1117] p-2.5 rounded-lg border border-slate-800/50">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{match.fighter1.image}</span>
                            <div>
                              <span className="text-xs font-bold text-slate-200 block">
                                {match.fighter1.name}
                              </span>
                              {match.fighter1.seed && (
                                <span className="text-[9px] text-slate-500">Seed #{match.fighter1.seed}</span>
                              )}
                            </div>
                          </div>
                          <span className="text-xs font-mono font-bold text-orange-400">
                            {loadingScores ? '...' : `${match.fighter1.currentScore} pts`}
                          </span>
                        </div>

                        {/* Fighter 2 Card */}
                        <div className="flex items-center justify-between bg-[#0D1117] p-2.5 rounded-lg border border-slate-800/50">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{match.fighter2.image}</span>
                            <div>
                              <span className="text-xs font-bold text-slate-200 block">
                                {match.fighter2.name}
                              </span>
                              {match.fighter2.seed && (
                                <span className="text-[9px] text-slate-500">Seed #{match.fighter2.seed}</span>
                              )}
                            </div>
                          </div>
                          <span className="text-xs font-mono font-bold text-orange-400">
                            {loadingScores ? '...' : `${match.fighter2.currentScore} pts`}
                          </span>
                        </div>

                        {/* Score Breakdown / Fighter Traits */}
                        {isExpanded && (
                          <div className="mt-2 pt-2 border-t border-slate-800/80 text-[11px] bg-[#0D1117] p-2.5 rounded-lg space-y-2">
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

                        {/* Expand Details Toggle */}
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

        {/* FIGHTER VAULT TAB */}
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
