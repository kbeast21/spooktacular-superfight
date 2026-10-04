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
    <div className="min-h-screen text-slate-100 font-sans flex flex-col justify-between bg-slate-950 selection:bg-orange-500 selection:text-slate-950">
      <div>
        {/* Sticky Top Navigation */}
        <header className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur-md border-b-2 border-purple-900/60 shadow-xl shadow-purple-950/40">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
            
            {/* App Branding */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-purple-600 flex items-center justify-center shadow-lg text-xl border border-orange-400/30">
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

            {/* Navigation Tabs */}
            <nav className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-purple-900/50">
              <button
                onClick={() => setActiveTab('bracket')}
                className={`py-1.5 px-3 sm:px-4 rounded-lg font-bold transition-all text-xs sm:text-sm flex items-center gap-2 ${
                  activeTab === 'bracket'
                    ? 'bg-purple-900/90 text-orange-400 border border-orange-500/50 shadow-md'
                    : 'text-slate-400 hover:text-purple-300'
                }`}
              >
                <span>⚔️️</span>
                <span>Matchups</span>
              </button>
              <button
                onClick={() => setActiveTab('roster')}
                className={`py-1.5 px-3 sm:px-4 rounded-lg font-bold transition-all text-xs sm:text-sm flex items-center gap-2 ${
                  activeTab === 'roster'
                    ? 'bg-purple-900/90 text-orange-400 border border-orange-500/50 shadow-md'
                    : 'text-slate-400 hover:text-purple-300'
                }`}
              >
                <span>📜</span>
                <span>Roster ({tournamentData.fighters.length})</span>
              </button>
            </nav>

            {/* Google Form Link */}
            <a
              href={tournamentData.activeVotingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-300 text-slate-950 font-black py-2 px-5 rounded-xl text-xs tracking-wider uppercase shadow-lg transition-all duration-200 hover:scale-105 items-center gap-2 border border-orange-300/40"
            >
              <span>🗳️</span>
              <span>Vote Ballot</span>
            </a>
          </div>
        </header>

        {/* Status Banner */}
        <div className="bg-purple-950/30 border-b border-purple-900/40 py-4 px-4">
          <div className="max-w-6xl mx-auto flex flex-wrap justify-between items-center text-xs gap-3">
            <div className="flex items-center space-x-3">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="font-extrabold text-slate-200 uppercase tracking-wide">
                Active Round: <span className="text-orange-400">{tournamentData.activeRound}</span>
              </span>
            </div>
            <div className="text-purple-300/80 font-medium">
              Cast your vote on the ballot to update live match scores!
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <main className="max-w-6xl mx-auto px-4 py-8">
          {activeTab === 'bracket' && (
            <div>
              {/* Round Selection Tabs */}
              <div className="flex items-center justify-between mb-8 pb-3 border-b border-purple-900/40">
                <div className="flex space-x-2">
                  {tournamentData.rounds.map((round, idx) => (
                    <button
                      key={round.roundNumber}
                      onClick={() => setSelectedRound(idx)}
                      className={`px-4 py-2 rounded-xl text-xs font-black tracking-wider uppercase transition-all ${
                        selectedRound === idx
                          ? 'bg-orange-500 text-slate-950 shadow-lg border border-orange-300'
                          : 'bg-slate-900/80 text-purple-300 border border-purple-900/50 hover:bg-purple-950/60'
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

              {/* Grid of Distinct Matchup Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {tournamentData.rounds[selectedRound].matchups.map((match) => {
                  const fA = getFighter(match.fighterAId);
                  const fB = getFighter(match.fighterBId);
                  const scoreA = liveScores[match.id]?.votesA ?? match.votesA ?? 0;
                  const scoreB = liveScores[match.id]?.votesB ?? match.votesB ?? 0;

                  return (
                    /* DISTINCT OUTER MATCHUP BOX */
                    <div
                      key={match.id}
                      className="bg-slate-900/90 border-2 border-purple-800/80 hover:border-orange-500 rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 flex flex-col justify-between"
                    >
                      {/* CARD HEADER BAR */}
                      <div className="bg-slate-950/90 px-5 py-3 border-b-2 border-purple-900/60 flex justify-between items-center">
                        <span className="text-orange-400 text-xs font-black tracking-wider uppercase">
                          {match.matchTitle}
                        </span>
                        <span className="bg-purple-950/90 text-purple-300 border border-purple-800/60 text-[11px] font-mono px-2.5 py-0.5 rounded-lg">
                          📍 {match.location}
                        </span>
                      </div>

                      {/* CARD BODY CONTENT */}
                      <div className="p-5 space-y-3">
                        {/* Fighter A Panel */}
                        <div className={`p-4 rounded-2xl border-2 transition-all ${
                          scoreA > scoreB 
                            ? 'bg-purple-950/50 border-orange-500/80 shadow-md' 
                            : 'bg-slate-950/80 border-purple-900/40'
                        }`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3.5">
                              <span className="text-3xl filter drop-shadow">{fA.image}</span>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-mono font-black px-1.5 py-0.5 rounded bg-orange-950 text-orange-400 border border-orange-500/40">
                                    #{fA.seed}
                                  </span>
                                  <span className="font-bold text-sm text-slate-100">{fA.name}</span>
                                </div>
                                <p className="text-[11px] text-purple-300/70 mt-0.5 font-medium">
                                  {fA.attributes.join(' • ')}
                                </p>
                              </div>
                            </div>
                            {/* Raw Vote Counter Badge */}
                            <div className="bg-slate-900 px-3 py-1.5 rounded-xl border border-purple-800/60 text-center min-w-[70px] shadow-inner">
                              <span className="text-lg font-black font-mono text-amber-400 block leading-none">
                                {scoreA}
                              </span>
                              <span className="text-[9px] font-bold tracking-widest text-purple-400 uppercase">
                                {scoreA === 1 ? 'Vote' : 'Votes'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* VS Divider */}
                        <div className="text-center my-1 flex items-center justify-center gap-3">
                          <div className="h-[1px] bg-purple-900/50 flex-1"></div>
                          <span className="text-[10px] font-black tracking-widest text-purple-400/80 uppercase">VS</span>
                          <div className="h-[1px] bg-purple-900/50 flex-1"></div>
                        </div>

                        {/* Fighter B Panel */}
                        <div className={`p-4 rounded-2xl border-2 transition-all ${
                          scoreB > scoreA 
                            ? 'bg-purple-950/50 border-orange-500/80 shadow-md' 
                            : 'bg-slate-950/80 border-purple-900/40'
                        }`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3.5">
                              <span className="text-3xl filter drop-shadow">{fB.image}</span>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-mono font-black px-1.5 py-0.5 rounded bg-purple-950 text-purple-400 border border-purple-500/40">
                                    #{fB.seed}
                                  </span>
                                  <span className="font-bold text-sm text-slate-100">{fB.name}</span>
                                </div>
                                <p className="text-[11px] text-purple-300/70 mt-0.5 font-medium">
                                  {fB.attributes.join(' • ')}
                                </p>
                              </div>
                            </div>
                            {/* Raw Vote Counter Badge */}
                            <div className="bg-slate-900 px-3 py-1.5 rounded-xl border border-purple-800/60 text-center min-w-[70px] shadow-inner">
                              <span className="text-lg font-black font-mono text-amber-400 block leading-none">
                                {scoreB}
                              </span>
                              <span className="text-[9px] font-bold tracking-widest text-purple-400 uppercase">
                                {scoreB === 1 ? 'Vote' : 'Votes'}
                              </span>
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
                          ? 'bg-purple-900/80 text-orange-400 border border-orange-500/40'
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
                    className={`bg-slate-900/90 border-2 rounded-2xl p-4 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 ${
                      f.status === 'Main Bracket'
                        ? 'border-purple-800/60 hover:border-orange-500'
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
      <footer className="bg-slate-950 border-t-2 border-purple-900/50 text-slate-400 py-8 px-4 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
          <div className="flex items-center space-x-2">
            <span>🎃</span>
            <span className="font-bold text-slate-200">Spooktacular Superfight 2026</span>
          </div>
          <div className="flex space-x-4">
            <button onClick={handleShare} className="hover:text-orange-400 transition-colors">
              {copied ? 'Link Copied!' : 'Copy Site Link'}
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
