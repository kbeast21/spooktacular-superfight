import React, { useState } from 'react';
import tournamentData from './data/tournament.json';

export default function App() {
  const [activeTab, setActiveTab] = useState('bracket');
  const [expandedMatch, setExpandedMatch] = useState(null);

  // Toggle matchup detailed score card breakdown
  const toggleMatchDetails = (matchId) => {
    setExpandedMatch(expandedMatch === matchId ? null : matchId);
  };

  // Fallback data structure with detailed category scoring
  const rounds = tournamentData?.rounds || [
    {
      id: 'sweet-sixteen',
      name: 'SWEET SIXTEEN',
      date: 'Oct 16 – Oct 21',
      status: 'active',
      matchups: [
        {
          id: 'M1',
          location: 'An abandoned Spirit Halloween store',
          status: 'In Progress',
          fighter1: {
            name: 'Dracula',
            icon: '🦇',
            points: 42,
            scores: { trait: 18, location: 14, hazard: 10 },
          },
          fighter2: {
            name: 'Carlos the Painting',
            icon: '🖼️',
            points: 38,
            scores: { trait: 12, location: 16, hazard: 10 },
          },
        },
        {
          id: 'M2',
          location: 'An abandoned Spirit Halloween store',
          status: 'Final',
          winner: 'A Werewolf',
          fighter1: {
            name: 'A Werewolf',
            icon: '🐺',
            points: 55,
            scores: { trait: 22, location: 18, hazard: 15 },
          },
          fighter2: {
            name: 'A Mad Scientist',
            icon: '🧪',
            points: 31,
            scores: { trait: 10, location: 11, hazard: 10 },
          },
        },
      ],
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
              OCTOBER MADNESS 2026
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
              Active Round: <strong className="text-purple-200">Sweet Sixteen</strong>
            </span>
          </div>
          <a
            href="https://forms.google.com"
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
          Ballots for <strong>Sweet Sixteen</strong> are currently OPEN!
        </span>
        <a
          href="https://forms.google.com"
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
            Fighter Vault (32)
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

      {/* 4. MAIN BRACKET & SCORE CARDS */}
      <main className="flex-1 overflow-x-auto p-6 md:p-8">
        {activeTab === 'bracket' && (
          <div className="flex gap-6 min-w-max items-start">
            {rounds.map((round) => (
              <div key={round.id} className="w-80 flex flex-col gap-4">
                {/* Round Header */}
                <div className="border-b border-slate-800 pb-2">
                  <h2 className="text-sm font-black tracking-wider text-orange-500 uppercase">
                    {round.name}
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">{round.date}</p>
                </div>

                {/* Matchup Cards */}
                {round.status === 'active' && round.matchups ? (
                  round.matchups.map((match) => {
                    const isExpanded = expandedMatch === match.id;
                    return (
                      <div
                        key={match.id}
                        className="bg-[#161B26] border border-slate-800/90 rounded-xl p-3 shadow-xl flex flex-col gap-2"
                      >
                        {/* Match Header (Location & Match ID) */}
                        <div className="flex items-center justify-between text-[11px] font-medium text-purple-400">
                          <span className="truncate pr-2 flex items-center gap-1.5">
                            <span>📍</span> {match.location}
                          </span>
                          <span className="text-slate-500 font-mono text-[10px]">
                            Match {match.id}
                          </span>
                        </div>

                        {/* Fighter 1 Row */}
                        <div
                          className={`flex items-center justify-between p-2.5 rounded-lg border transition-colors ${
                            match.winner === match.fighter1.name
                              ? 'bg-orange-500/10 border-orange-500/50'
                              : 'bg-[#0D1117] border-slate-800/50'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-base">{match.fighter1.icon}</span>
                            <span className="text-xs font-bold text-slate-200">
                              {match.fighter1.name}
                            </span>
                            {match.winner === match.fighter1.name && (
                              <span className="text-[10px] bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded font-bold">
                                WINNER
                              </span>
                            )}
                          </div>
                          <span className="text-xs font-mono font-bold text-orange-400">
                            {match.fighter1.points} pts
                          </span>
                        </div>

                        {/* Fighter 2 Row */}
                        <div
                          className={`flex items-center justify-between p-2.5 rounded-lg border transition-colors ${
                            match.winner === match.fighter2.name
                              ? 'bg-orange-500/10 border-orange-500/50'
                              : 'bg-[#0D1117] border-slate-800/50'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-base">{match.fighter2.icon}</span>
                            <span className="text-xs font-bold text-slate-200">
                              {match.fighter2.name}
                            </span>
                            {match.winner === match.fighter2.name && (
                              <span className="text-[10px] bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded font-bold">
                                WINNER
                              </span>
                            )}
                          </div>
                          <span className="text-xs font-mono font-bold text-orange-400">
                            {match.fighter2.points} pts
                          </span>
                        </div>

                        {/* Score Card Detail Breakdown (Expandable) */}
                        {isExpanded && match.fighter1.scores && (
                          <div className="mt-2 pt-2 border-t border-slate-800/80 text-[11px] bg-[#0D1117] p-2 rounded-lg">
                            <p className="text-[10px] font-bold text-purple-300 uppercase mb-1.5 tracking-wider">
                              Category Score Breakdown
                            </p>
                            
                            {/* Score Row: Trait */}
                            <div className="flex justify-between text-slate-400 py-0.5">
                              <span>Fighter Attributes</span>
                              <span className="font-mono text-slate-200">
                                {match.fighter1.scores.trait} vs {match.fighter2.scores.trait}
                              </span>
                            </div>

                            {/* Score Row: Location */}
                            <div className="flex justify-between text-slate-400 py-0.5">
                              <span>Location Advantage</span>
                              <span className="font-mono text-slate-200">
                                {match.fighter1.scores.location} vs {match.fighter2.scores.location}
                              </span>
                            </div>

                            {/* Score Row: Hazard */}
                            <div className="flex justify-between text-slate-400 py-0.5">
                              <span>Hazard Survival</span>
                              <span className="font-mono text-slate-200">
                                {match.fighter1.scores.hazard} vs {match.fighter2.scores.hazard}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Toggle Score Card Button */}
                        <button
                          onClick={() => toggleMatchDetails(match.id)}
                          className="w-full text-center text-[10px] font-semibold text-slate-400 hover:text-orange-400 pt-1 transition-colors"
                        >
                          {isExpanded ? 'Hide Score Breakdown ▲' : 'View Score Breakdown ▼'}
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

        {activeTab === 'vault' && (
          <div className="text-slate-400 text-sm max-w-xl mx-auto text-center py-12">
            <p className="text-lg font-bold text-slate-200 mb-2">Fighter Vault</p>
            <p>Roster card profiles and fighter attributes will display here.</p>
          </div>
        )}

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
