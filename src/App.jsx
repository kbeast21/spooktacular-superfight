import React, { useState, useEffect } from 'react';
import './index.css';
import tournamentData from './data/tournament.json';

export default function App() {
  const [liveScores, setLiveScores] = useState({});
  const [selectedRound, setSelectedRound] = useState(0);

  // Fetch live vote scores from published Google Sheet CSV
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
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col justify-between selection:bg-orange-500 selection:text-slate-950">
      <div>
        {/* HEADER */}
        <header className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur-md border-b-2 border-purple-900/60 shadow-2xl shadow-purple-950/50">
          <div className="max-w-6xl mx-auto px-4 py-3.5 flex items-center justify-between gap-4">
            
            {/* App Branding */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-purple-600 flex items-center justify-center shadow-lg text-xl border border-orange-400/40">
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

            {/* Voting Form Link */}
            <a
              href={tournamentData.activeVotingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-300 text-slate-950 font-black py-2 px-5 rounded-xl text-xs tracking-wider uppercase shadow-lg transition-all duration-200 hover:scale-105 flex items-center gap-2 border border-orange-300/40"
            >
              <span>🗳️</span>
              <span>Vote Ballot</span>
            </a>
          </div>
        </header>

        {/* MAIN BRACKET CONTAINER */}
        <main className="max-w-6xl mx-auto px-4 py-8">
          
          {/* Round Switcher Tabs */}
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-purple-900/40">
            <div className="flex space-x-2 overflow-x-auto">
              {tournamentData.rounds.map((round, idx) => (
                <button
                  key={round.roundNumber}
                  onClick={() => setSelectedRound(idx)}
                  className={`px-4 py-2 rounded-xl text-xs font-black tracking-wider uppercase transition-all whitespace-nowrap ${
                    selectedRound === idx
                      ? 'bg-orange-500 text-slate-950 shadow-lg border border-orange-300'
                      : 'bg-slate-900/80 text-purple-300 border border-purple-900/50 hover:bg-purple-950/60'
                  }`}
                >
                  {round.roundName}
                </button>
              ))}
            </div>

            <div className="hidden sm:flex items-center space-x-2 text-xs font-semibold text-purple-300/80">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Live Scores Syncing</span>
            </div>
          </div>

          {/* MATCHUP CARDS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tournamentData.rounds[selectedRound]?.matchups.map((match) => {
              const fA = getFighter(match.fighterAId);
              const fB = getFighter(match.fighterBId);
              
              // Live sheet score with fallback to static JSON data
              const scoreA = liveScores[match.id]?.votesA ?? match.votesA ?? 0;
              const scoreB = liveScores[match.id]?.votesB ?? match.votesB ?? 0;

              return (
                /* STANDALONE MATCHUP CARD */
                <div
                  key={match.id}
                  className="bg-slate-900/90 border-2 border-purple-800/80 hover:border-orange-500/80 rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 flex flex-col justify-between"
                >
                  {/* Card Header Bar */}
                  <div className="bg-slate-950/90 px-5 py-3 border-b-2 border-purple-900/60 flex justify-between items-center">
                    <span className="text-orange-400 text-xs font-black tracking-wider uppercase">
                      {match.matchTitle}
                    </span>
                    <span className="bg-purple-950/90 text-purple-300 border border-purple-800/60 text-[11px] font-mono px-2.5 py-0.5 rounded-lg">
                      📍 {match.location}
                    </span>
                  </div>

                  {/* Card Body - Fighter Panels */}
                  <div className="p-5 space-y-3">
                    
                    {/* Fighter A Box */}
                    <div className={`p-4 rounded-2xl border-2 transition-all ${
                      scoreA > scoreB 
                        ? 'bg-purple-950/50 border-orange-500/80 shadow-md' 
                        : 'bg-slate-950/80 border-purple-900/40'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3.5">
                          <span className="text-3xl filter drop-shadow">{fA?.image || '🤺'}</span>
                          <div>
                            <div className="flex items-center gap-2">
                              {fA?.seed && (
                                <span className="text-[10px] font-mono font-black px-1.5 py-0.5 rounded bg-orange-950 text-orange-400 border border-orange-500/40">
                                  #{fA.seed}
                                </span>
                              )}
                              <span className="font-bold text-sm text-slate-100">{fA?.name || 'TBD'}</span>
                            </div>
                            <p className="text-[11px] text-purple-300/70 mt-0.5 font-medium">
                              {fA?.attributes?.join(' • ')}
                            </p>
                          </div>
                        </div>

                        {/* Fighter A Score */}
                        <div className="bg-slate-900 px-3 py-1.5 rounded-xl border border-purple-800/60 text-center min-w-[65px] shadow-inner ml-2">
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

                    {/* Fighter B Box */}
                    <div className={`p-4 rounded-2xl border-2 transition-all ${
                      scoreB > scoreA 
                        ? 'bg-purple-950/50 border-orange-500/80 shadow-md' 
                        : 'bg-slate-950/80 border-purple-900/40'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3.5">
                          <span className="text-3xl filter drop-shadow">{fB?.image || '🤺'}</span>
                          <div>
                            <div className="flex items-center gap-2">
                              {fB?.seed && (
                                <span className="text-[10px] font-mono font-black px-1.5 py-0.5 rounded bg-purple-950 text-purple-400 border border-purple-500/40">
                                  #{fB.seed}
                                </span>
                              )}
                              <span className="font-bold text-sm text-slate-100">{fB?.name || 'TBD'}</span>
                            </div>
                            <p className="text-[11px] text-purple-300/70 mt-0.5 font-medium">
                              {fB?.attributes?.join(' • ')}
                            </p>
                          </div>
                        </div>

                        {/* Fighter B Score */}
                        <div className="bg-slate-900 px-3 py-1.5 rounded-xl border border-purple-800/60 text-center min-w-[65px] shadow-inner ml-2">
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
        </main>
      </div>

      {/* FOOTER */}
      <footer className="bg-slate-950 border-t-2 border-purple-900/50 text-slate-400 py-6 px-4 mt-auto">
        <div className="max-w-6xl mx-auto flex justify-between items-center text-xs">
          <div className="flex items-center space-x-2">
            <span>🎃</span>
            <span className="font-bold text-slate-200">Spooktacular Superfight 2026</span>
          </div>
          <a 
            href={tournamentData.activeVotingUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="hover:text-orange-400 transition-colors font-medium"
          >
            Google Form Ballot ↗
          </a>
        </div>
      </footer>
    </div>
  );
}
