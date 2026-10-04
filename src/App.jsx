import React, { useState, useEffect } from 'react';
import './index.css';
import tournamentData from './data/tournament.json';

export default function App() {
  const [liveScores, setLiveScores] = useState({});
  const [activeTab, setActiveTab] = useState('bracket');
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

  return (
    <div className="min-h-screen text-slate-100 font-sans pb-0 flex flex-col justify-between">
      <div>
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
            Cast your votes in the Google Form to crown the champion. Scores update dynamically throughout the round!
          </p>
        </section>

        {/* Main Content */}
        <main className="max-w-6xl mx-auto px-4 mb-16">
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
                    className="bg-slate-900/80 border border-purple-900/40 hover:border-orange-500/50 rounded-2xl p-4 transition-all duration-300 hover:glow-purple group shadow-lg"
                  >
                    {/* Header */}
                    <div className="flex justify-between items-center mb-3 pb-2 border-b border-purple-900/30 text-xs">
                      <span className="font-bold text-orange-400 tracking-wide">{match.matchTitle}</span>
                      <span className="text-slate-500 text-[11px] italic">📍 {match.location}</span>
                    </div>

                    {/* Unified Fighters Container */}
                    <div className="space-y-2">
                      {/* Fighter A */}
                      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-purple-900/20 group-hover:border-purple-800/40 transition-colors">
                        <div className="flex items-center space-x-3.5">
                          <span className="text-3xl filter drop-shadow">{fA.image}</span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-orange-950 text-orange-400 border border-orange-500/30">
                                #{fA.seed}
                              </span>
                              <span className="font-bold text-sm text-slate-100">{fA.name}</span>
                            </div>
                            <p className="text-[11px] text-purple-300/60 mt-0.5">
                              {fA.attributes.join(' • ')}
                            </p>
                          </div>
                        </div>
                        <div className="bg-slate-900/90 px-3.5 py-1.5 rounded-xl border border-purple-800/50 min-w-[48px] text-center shadow-inner">
                          <span className="text-lg font-black font-mono text-amber-400">{scoreA}</span>
                        </div>
                      </div>

                      {/* VS Divider */}
                      <div className="text-center my-1 flex items-center justify-center gap-2">
                        <div className="h-[1px] bg-purple-900/30 flex-1"></div>
                        <span className="text-[10px] font-black tracking-widest text-purple-500/60 uppercase">VS</span>
                        <div className="h-[1px] bg-purple-900/30 flex-1"></div>
                      </div>

                      {/* Fighter B */}
                      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-purple-900/20 group-hover:border-purple-800/40 transition-colors">
                        <div className="flex items-center space-x-3.5">
                          <span className="text-3xl filter drop-shadow">{fB.image}</span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-orange-950 text-orange-400 border border-orange-500/30">
                                #{fB.seed}
                              </span>
                              <span className="font-bold text-sm text-slate-100">{fB.name}</span>
                            </div>
                            <p className="text-[11px] text-purple-300/60 mt-0.5">
                              {fB.attributes.join(' • ')}
                            </p>
                          </div>
                        </div>
                        <div className="bg-slate-900/90 px-3.5 py-1.5 rounded-xl border border-purple-800/50 min-w-[48px] text-center shadow-inner">
                          <span className="text-lg font-black font-mono text-amber-400">{scoreB}</span>
                        </div>
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

      {/* Comprehensive Site Footer */}
      <footer className="bg-slate-950/95 border-t border-purple-900/50 text-slate-400 pt-10 pb-8 px-4 mt-auto">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          
          {/* Tournament Schedule */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-orange-400 uppercase tracking-wider flex items-center gap-2">
              <span>📅</span> Schedule & Deadlines
            </h4>
            <ul className="text-xs space-y-2 text-slate-300 font-mono">
              <li className="flex justify-between border-b border-purple-900/30 pb-1">
                <span className="text-purple-300">Sweet Sixteen:</span>
                <span className="text-slate-400">Oct 16 – Oct 21</span>
              </li>
              <li className="flex justify-between border-b border-purple-900/30 pb-1">
                <span className="text-purple-300">Elite Eight:</span>
                <span className="text-slate-400">Oct 22 – Oct 25</span>
              </li>
              <li className="flex justify-between border-b border-purple-900/30 pb-1">
                <span className="text-purple-300">Final Four:</span>
                <span className="text-slate-400">Oct 26 – Oct 29</span>
              </li>
              <li className="flex justify-between pb-1">
                <span className="text-orange-400 font-bold">Championship:</span>
                <span className="text-amber-300 font-bold">Oct 30 – Oct 31</span>
              </li>
            </ul>
          </div>

          {/* Superfight Rules */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-orange-400 uppercase tracking-wider flex items-center gap-2">
              <span>⚖️</span> Superfight Rules
            </h4>
            <ul className="text-xs text-slate-300 space-y-1.5 leading-relaxed list-disc list-inside">
              <li>One ballot submission per league member per round.</li>
              <li>Consider environmental hazards at match locations.</li>
              <li>Attributes & superpowers apply continuously in battle.</li>
              <li>Tiebreakers determined by Commissioner coin toss.</li>
            </ul>
          </div>

          {/* Share & Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-orange-400 uppercase tracking-wider flex items-center gap-2">
              <span>📢</span> Spread the Word
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Share the companion app with friends to check match stats and vote before the Halloween deadline!
            </p>
            <div className="pt-1 flex flex-wrap gap-2">
              <button
                onClick={handleShare}
                className="bg-purple-900/60 hover:bg-purple-800 text-purple-200 border border-purple-700/50 text-xs font-semibold py-2 px-4 rounded-lg transition-all flex items-center gap-2"
              >
                <span>🔗</span>
                <span>{copied ? 'Link Copied!' : 'Copy Site Link'}</span>
              </button>
              <a
                href={tournamentData.activeVotingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-orange-950 hover:bg-orange-900 text-orange-300 border border-orange-700/50 text-xs font-semibold py-2 px-4 rounded-lg transition-all flex items-center gap-2"
              >
                <span>📝</span>
                <span>Google Form</span>
              </a>
            </div>
          </div>

        </div>

        {/* Copyright */}
        <div className="max-w-6xl mx-auto border-t border-purple-900/30 pt-6 text-center text-xs text-slate-500">
          <p>© 2026 Spooktacular Superfight • October Madness Edition</p>
        </div>
      </footer>
    </div>
  );
}
