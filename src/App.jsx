import React, { useState, useEffect } from 'react';
import './index.css';
import tournamentData from './data/tournament.json';

export default function App() {
  const [liveScores, setLiveScores] = useState({});
  const [activeTab, setActiveTab] = useState('bracket');

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

  const getFighter = (id) => tournamentData.fighters.find((f) => f.id === id);

  return (
    <div className="min-h-screen text-slate-100 font-sans pb-12">
      {/* Top Navbar Header */}
      <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-purple-900/50 shadow-lg shadow-purple-950/20">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
          
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <span className="text-2xl filter drop-shadow">🎃</span>
            <div>
              <h1 className="text-lg font-black tracking-wider text-orange-400 uppercase leading-none">
                Spooktacular Superfight
              </h1>
              <span className="text-[10px] font-bold text-purple-400 tracking-widest uppercase">
                {tournamentData.tournamentName}
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={() => setActiveTab('bracket')}
              className={`py-1.5 px-4 rounded-lg font-bold transition-all text-xs sm:text-sm ${
                activeTab === 'bracket'
                  ? 'bg-purple-900/80 text-orange-400 border border-orange-500/40 glow-orange'
                  : 'text-slate-400 hover:text-purple-300 hover:bg-slate-900'
              }`}
            >
              ⚔️ Sweet Sixteen
            </button>
            <button
              onClick={() => setActiveTab('roster')}
              className={`py-1.5 px-4 rounded-lg font-bold transition-all text-xs sm:text-sm ${
                activeTab === 'roster'
                  ? 'bg-purple-900/80 text-orange-400 border border-orange-500/40 glow-orange'
                  : 'text-slate-400 hover:text-purple-300 hover:bg-slate-900'
              }`}
            >
              📜 All 32 Combatants
            </button>
          </nav>

          {/* Live Action Button */}
          <div className="flex items-center space-x-3">
            <a
              href={tournamentData.activeVotingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-slate-950 font-black py-1.5 px-4 rounded-full text-xs tracking-wider uppercase shadow-md glow-orange transition-all duration-200 transform hover:scale-105"
            >
              🗳️ Vote Now
            </a>
          </div>

        </div>
      </header>

      {/* Main Banner / Hero Section */}
      <section className="max-w-6xl mx-auto text-center mt-8 mb-10 px-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-500/30 text-purple-300 text-xs font-semibold tracking-wider uppercase mb-4 glow-purple">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Active Round: {tournamentData.activeRound}</span>
        </div>
        
        <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-3 text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-purple-400 text-glow-orange">
          The Ultimate Halloween Bracket
        </h2>
        
        <p className="text-purple-300/70 text-sm md:text-base max-w-xl mx-auto font-medium">
          Cast your votes in the Google Form to crown the 2026 Champion. Scores update dynamically throughout the round!
        </p>
      </section>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4">
        {activeTab === 'bracket' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tournamentData.rounds[0].matchups.map((match) => {
              const fA = getFighter(match.fighterAId);
              const fB = getFighter(match.fighterBId);
              const scoreA = liveScores[match.id]?.votesA ?? match.votesA ?? 0;
              const scoreB = liveScores[match.id]?.votesB ?? match.votesB ?? 0;

              return (
                <div
                  key={match.id}
                  className="bg-gradient-to-b from-slate-900 via-purple-950/20 to-slate-950 border border-purple-900/40 hover:border-orange-500/40 rounded-2xl p-5 transition-all duration-300 hover:glow-purple group"
                >
                  <div className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-3 flex justify-between items-center border-b border-purple-900/40 pb-2">
                    <span className="text-orange-400">{match.matchTitle}</span>
                    <span className="text-slate-500 text-[11px] font-normal italic">
                      📍 {match.location}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {/* Fighter A */}
                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/80 border border-purple-900/30 group-hover:border-purple-800/50 transition-colors">
                      <div className="flex items-center space-x-3.5">
                        <span className="text-3xl filter drop-shadow">{fA.image}</span>
                        <div>
                          <p className="font-bold text-slate-100 flex items-center gap-2">
                            <span className="text-xs px-1.5 py-0.5 rounded bg-orange-950 text-orange-400 font-mono border border-orange-500/30">
                              #{fA.seed}
                            </span>
                            {fA.name}
                          </p>
                          <p className="text-xs text-purple-300/60 mt-0.5">
                            {fA.attributes.join(' • ')}
                          </p>
                        </div>
                      </div>
                      <span className="text-2xl font-black text-amber-400 font-mono pl-2">
                        {scoreA}
                      </span>
                    </div>

                    {/* Fighter B */}
                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/80 border border-purple-900/30 group-hover:border-purple-800/50 transition-colors">
                      <div className="flex items-center space-x-3.5">
                        <span className="text-3xl filter drop-shadow">{fB.image}</span>
                        <div>
                          <p className="font-bold text-slate-100 flex items-center gap-2">
                            <span className="text-xs px-1.5 py-0.5 rounded bg-orange-950 text-orange-400 font-mono border border-orange-500/30">
                              #{fB.seed}
                            </span>
                            {fB.name}
                          </p>
                          <p className="text-xs text-purple-300/60 mt-0.5">
                            {fB.attributes.join(' • ')}
                          </p>
                        </div>
                      </div>
                      <span className="text-2xl font-black text-amber-400 font-mono pl-2">
                        {scoreB}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'roster' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {tournamentData.fighters.map((f) => (
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
        )}
      </main>
    </div>
  );
}
