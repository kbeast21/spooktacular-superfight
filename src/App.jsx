import React, { useState, useEffect } from 'react';
import './index.css';
import tournamentData from './data/tournament.json';

export default function App() {
  const [liveScores, setLiveScores] = useState({});
  const [activeTab, setActiveTab] = useState('bracket');
  const [selectedRound, setSelectedRound] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [copied, setCopied] = useState(false);

  // Fetch live scores from Google Sheet CSV
  useEffect(() => {
    if (!tournamentData.googleSheetCsvUrl) return;

    fetch(tournamentData.googleSheetCsvUrl)
      .then((res) => res.text())
      .then((csvText) => {
        const rows = csvText.split('\n').slice(1);
        const scores = {};
        rows.forEach((row) => {
          const [id, votesA, votesB] = row.split(',');
          if (id) {
            scores[id.trim()] = {
              votesA: parseInt(votesA, 10) || 0,
              votesB: parseInt(votesB, 10) || 0,
            };
          }
        });
        setLiveScores(scores);
      })
      .catch((err) => console.log('Google Sheets fetch skipped or failed:', err));
  }, []);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const getFighter = (id) => tournamentData.fighters.find((f) => f.id === id);

  const filteredFighters = tournamentData.fighters.filter((f) => {
    const query = searchQuery.toLowerCase();
    const matchesQuery =
      f.name.toLowerCase().includes(query) ||
      f.bio.toLowerCase().includes(query) ||
      f.attributes.some((attr) => attr.toLowerCase().includes(query));

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'Main Bracket' && f.status === 'Main Bracket') ||
      (statusFilter === 'Bench' && f.status !== 'Main Bracket');

    return matchesQuery && matchesStatus;
  });

  return (
    <div className="min-h-screen text-slate-100 font-sans pb-0 flex flex-col justify-between bg-slate-950 selection:bg-orange-500 selection:text-slate-950">
      <div>
        {/* Sticky Top Header */}
        <header className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur-md border-b border-purple-900/40 shadow-lg shadow-purple-950/30">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
            
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-purple-600 flex items-center justify-center shadow-lg glow-orange text-xl">
                🎃
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-black tracking-wider text-orange-400 uppercase leading-none">
                  Spooktacular
                </h1>
                <span className="text-[10px] font-extrabold text-purple-400 tracking-widest uppercase">
                  Superfight 2026
                </span>
              </div>
            </div>

            {/* Navigation Mode Switcher */}
            <nav className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-purple-900/40">
              <button
                onClick={() => setActiveTab('bracket')}
                className={`py-1.5 px-3 sm:px-4 rounded-lg font-bold transition-all text-xs sm:text-sm flex items-center gap-2 ${
                  activeTab === 'bracket'
                    ? 'bg-purple-900/90 text-orange-400 border border-orange-500/40 shadow-md'
                    : 'text-slate-400 hover:text-purple-300'
                }`}
              >
                <span>⚔️</span>
                <span>Matchups</span>
              </button>
              <button
                onClick={() => setActiveTab('roster')}
                className={`py-1.5 px-3 sm:px-4 rounded-lg font-bold transition-all text-xs sm:text-sm flex items-center gap-2 ${
                  activeTab === 'roster'
                    ? 'bg-purple-900/90 text-orange-400 border border-orange-500/40 shadow-md'
                    : 'text-slate-400 hover:text-purple-300'
                }`}
              >
                <span>📜</span>
                <span>Roster ({tournamentData.fighters.length})</span>
              </button>
            </nav>

            {/* Vote Action */}
            <a
              href={tournamentData.activeVotingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-300 text-slate-950 font-black py-2 px-5 rounded-xl text-xs tracking-wider uppercase shadow-lg glow-orange transition-all duration-200 hover:scale-105 items-center gap-2"
            >
              <span>🗳️</span>
              <span>Vote Ballot</span>
            </a>
          </div>
        </header>

        {/* Dashboard Stat Bar */}
        <div className="bg-gradient-to-b from-purple-950/40 via-slate-950/80 to-slate-950 border-b border-purple-900/30 py-5 px-4">
          <div className="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="bg-slate-900/70 border border-purple-900/40 rounded-xl p-3 shadow-md">
              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest block mb-0.5">Active Round</span>
              <span className="text-lg font-black text-orange-400">{tournamentData.activeRound}</span>
            </div>
            <div className="bg-slate-900/70 border border-purple-900/40 rounded-xl p-3 shadow-md">
              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest block mb-0.5">Round Matches</span>
              <span className="text-lg font-black text-amber-300">
                {tournamentData.rounds[selectedRound]?.matchups.length || 0} Battles
              </span>
            </div>
            <div className="bg-slate-900/70 border border-purple-900/40 rounded-xl p-3 shadow-md">
              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest block mb-0.5">Roster Count</span>
              <span className="text-lg font-black text-purple-300">32 Fighters</span>
            </div>
            <div className="bg-slate-900/70 border border-purple-900/40 rounded-xl p-3 shadow-md">
              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest block mb-0.5">Voting Status</span>
              <span className="text-lg font-black text-emerald-400 flex items-center justify-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block"></span>
                Live
              </span>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <main className="max-w-6xl mx-auto px-4 py-8">
          {activeTab === 'bracket' && (
            <div>
              {/* Round Switcher Tabs */}
              <div className="flex items-center justify-between mb-8 pb-3 border-b border-purple-900/40">
                <div className="flex space-x-2">
                  {tournamentData.rounds.map((round, idx) => (
                    <button
                      key={round.roundNumber}
                      onClick={() => setSelectedRound(idx)}
                      className={`px-4 py-2 rounded-xl text-xs font-extrabold tracking-wider uppercase transition-all ${
                        selectedRound === idx
                          ? 'bg-orange-500 text-slate-950 shadow-lg glow-orange'
                          : 'bg-slate-900/80 text-purple-300 border border-purple-900/40 hover:bg-purple-950/60'
                      }`}
                    >
                      {round.roundName}
                    </button>
                  ))}
                </div>
                <a
                  href={tournamentData.activeVotingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sm:hidden text-xs font-black uppercase text-orange-400 bg-orange-950/80 border border-orange-500/40 px-3 py-1.5 rounded-lg"
                >
                  🗳️ Vote
                </a>
              </div>

              {/* Matchups Grid - Each Matchup in an Isolated Card Box */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {tournamentData.rounds[selectedRound].matchups.map((match) => {
                  const fA = getFighter(match.fighterAId);
                  const fB = getFighter(match.fighterBId);
                  const scoreA = liveScores[match.id]?.votesA ?? match.votesA ?? 0;
                  const scoreB = liveScores[match.id]?.votesB ?? match.votesB ?? 0;
                  const totalVotes = scoreA + scoreB;
                  const pctA = totalVotes > 0 ? Math.round((scoreA / totalVotes) * 100) : 50;
                  const pctB = totalVotes > 0 ? Math.round((scoreB / totalVotes) * 100) : 50;

                  return (
                    <div
                      key={match.id}
                      className="bg-slate-900/90 border-2 border-purple-900/60 hover:border-orange-500/60 rounded-2xl p-5 shadow-2xl transition-all duration-300 hover:shadow-purple-950/50 flex flex-col justify-between"
                    >
                      {/* Box Top Banner */}
                      <div className="flex justify-between items-center mb-4 pb-2.5 border-b border-purple-900/40">
                        <span className="font-black text-sm text-orange-400 uppercase tracking-wide">
                          {match.matchTitle}
                        </span>
                        <span className="bg-purple-950 text-purple-300 border border-purple-800/50 text-[11px] px-2.5 py-0.5 rounded-md font-mono">
                          📍 {match.location}
                        </span>
                      </div>

                      {/* Box Content - Fighter Panels */}
                      <div className="space-y-3 my-auto">
                        {/* Fighter A Box */}
                        <div className={`p-3.5 rounded-xl border transition-all ${
                          scoreA > scoreB 
                            ? 'bg-purple-950/50 border-orange-500/50 shadow-inner' 
                            : 'bg-slate-950/90 border-purple-900/40'
                        }`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3.5">
                              <span className="text-3xl filter drop-shadow">{fA.image}</span>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[10px] font-mono font-black px-1.5 py-0.5 rounded bg-orange-950 text-orange-400 border border-orange-500/30">
                                    #{fA.seed}
                                  </span>
                                  <span className="font-bold text-sm text-slate-100">{fA.name}</span>
                                </div>
                                <p className="text-[11px] text-purple-300/70 mt-0.5 font-medium">
                                  {fA.attributes.join(' • ')}
                                </p>
                              </div>
                            </div>
                            <div className="text-right pl-2">
                              <span className="text-xl font-black font-mono text-amber-400 block leading-none">
                                {scoreA}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono">{pctA}%</span>
                            </div>
                          </div>
                        </div>

                        {/* Visual Vote Progress Bar */}
                        <div className="relative my-2">
                          <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden flex border border-purple-900/40">
                            <div style={{ width: `${pctA}%` }} className="bg-gradient-to-r from-orange-500 to-amber-400 h-full transition-all duration-500"></div>
                            <div style={{ width: `${pctB}%` }} className="bg-gradient-to-r from-purple-600 to-indigo-500 h-full transition-all duration-500"></div>
                          </div>
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-950 px-2 py-0.5 text-[9px] font-black text-purple-400 border border-purple-900/60 rounded-full uppercase">
                            VS
                          </div>
                        </div>

                        {/* Fighter B Box */}
                        <div className={`p-3.5 rounded-xl border transition-all ${
                          scoreB > scoreA 
                            ? 'bg-purple-950/50 border-orange-500/50 shadow-inner' 
                            : 'bg-slate-950/90 border-purple-900/40'
                        }`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3.5">
                              <span className="text-3xl filter drop-shadow">{fB.image}</span>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[10px] font-mono font-black px-1.5 py-0.5 rounded bg-purple-950 text-purple-400 border border-purple-500/30">
                                    #{fB.seed}
                                  </span>
                                  <span className="font-bold text-sm text-slate-100">{fB.name}</span>
                                </div>
                                <p className="text-[11px] text-purple-300/70 mt-0.5 font-medium">
                                  {fB.attributes.join(' • ')}
                                </p>
                              </div>
                            </div>
                            <div className="text-right pl-2">
                              <span className="text-xl font-black font-mono text-amber-400 block leading-none">
                                {scoreB}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono">{pctB}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'roster' && (
            <div>
              {/* Search & Status Filter Controls */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mb-6 bg-slate-900/80 p-3.5 rounded-2xl border border-purple-900/40 shadow-lg">
                <div className="relative w-full sm:w-72">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 text-xs">🔍</span>
                  <input
                    type="text"
                    placeholder="Search fighters or superpowers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-slate-950/90 border border-purple-900/50 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-orange-500/80 w-full transition-colors"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-300 text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="flex space-x-1.5 text-xs w-full sm:w-auto justify-stretch sm:justify-end">
                  {[
                    { id: 'ALL', label: 'All Combatants' },
                    { id: 'Main Bracket', label: 'Main Bracket' },
                    { id: 'Bench', label: 'Alternate Bench' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setStatusFilter(tab.id)}
                      className={`flex-1 sm:flex-none px-3 py-2 rounded-xl font-semibold transition-all text-center ${
                        statusFilter === tab.id
                          ? 'bg-purple-900/80 text-orange-400 border border-orange-500/40 glow-orange'
                          : 'bg-slate-950/60 text-slate-400 hover:text-purple-300 border border-purple-900/20'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Roster Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredFighters.map((f) => (
                  <div
                    key={f.id}
                    className={`bg-slate-900/90 border rounded-xl p-4 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 ${
                      f.status === 'Main Bracket'
                        ? 'border-purple-800/50 hover:border-orange-500/50 hover:glow-orange'
                        : 'border-slate-800/60 hover:border-purple-600/40 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-3xl">{f.image}</span>
                        <span
                          className={`text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full ${
                            f.status === 'Main Bracket'
                              ? 'bg-orange-950 text-orange-400 border border-orange-500/30'
                              : 'bg-purple-950 text-purple-300 border border-purple-500/30'
                          }`}
                        >
                          {f.status}
                        </span>
                      </div>
                      <h3 className="font-bold text-base text-slate-100 mb-1">
                        {f.seed && <span className="text-orange-400 mr-1.5">#{f.seed}</span>}
                        {f.name}
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed mb-3">{f.bio}</p>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-auto">
                      {f.attributes.map((attr, idx) => (
                        <span
                          key={idx}
                          className="bg-purple-950/60 text-purple-300 border border-purple-800/40 text-[10px] px-2 py-0.5 rounded-md font-medium"
                        >
                          {attr}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-purple-900/40 text-slate-400 py-8 px-4 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
          <div className="flex items-center space-x-2">
            <span>🎃</span>
            <span className="font-bold text-slate-200">Spooktacular Superfight 2026</span>
          </div>
          <div className="flex space-x-4">
            <button onClick={handleShare} className="hover:text-orange-400 transition-colors">
              {copied ? 'Link Copied!' : 'Copy App Link'}
            </button>
            <a href={tournamentData.activeVotingUrl} target="_blank" rel="noopener noreferrer" className="hover:text-orange-400 transition-colors">
              Official Google Form
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
