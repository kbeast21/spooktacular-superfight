import React, { useState, useEffect } from 'react';
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
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 md:p-8">
      {/* Header & Banner */}
      <header className="max-w-6xl mx-auto text-center mb-8">
        <h1 className="text-4xl md:text-6xl font-black text-orange-500 tracking-tight mb-2">
          {tournamentData.tournamentName}
        </h1>
        <p className="text-slate-400 text-lg mb-6">Round: {tournamentData.activeRound}</p>
        
        <a
          href={tournamentData.activeVotingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 px-8 rounded-full shadow-lg shadow-orange-900/40 transition-all text-lg animate-pulse"
        >
          🗳️ Cast Your Ballot Now
        </a>
      </header>

      {/* Navigation */}
      <div className="max-w-6xl mx-auto flex justify-center space-x-4 mb-8">
        <button
          onClick={() => setActiveTab('bracket')}
          className={`py-2 px-6 rounded-lg font-bold transition-colors ${
            activeTab === 'bracket' ? 'bg-slate-800 text-orange-400 border border-orange-500/30' : 'text-slate-400 hover:text-white'
          }`}
        >
          Main Bracket
        </button>
        <button
          onClick={() => setActiveTab('roster')}
          className={`py-2 px-6 rounded-lg font-bold transition-colors ${
            activeTab === 'roster' ? 'bg-slate-800 text-orange-400 border border-orange-500/30' : 'text-slate-400 hover:text-white'
          }`}
        >
          All 32 Fighters
        </button>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto">
        {activeTab === 'bracket' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tournamentData.rounds[0].matchups.map((match) => {
              const fA = getFighter(match.fighterAId);
              const fB = getFighter(match.fighterBId);
              const scoreA = liveScores[match.id]?.votesA ?? match.votesA ?? 0;
              const scoreB = liveScores[match.id]?.votesB ?? match.votesB ?? 0;

              return (
                <div key={match.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md">
                  <div className="text-xs font-bold text-orange-400 uppercase tracking-wide mb-3 flex justify-between">
                    <span>{match.matchTitle}</span>
                    <span className="text-slate-500">{match.location}</span>
                  </div>

                  <div className="space-y-3">
                    {/* Fighter A */}
                    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{fA.image}</span>
                        <div>
                          <p className="font-bold text-slate-100">
                            <span className="text-orange-500 mr-2">#{fA.seed}</span>
                            {fA.name}
                          </p>
                          <p className="text-xs text-slate-400">{fA.attributes.join(' • ')}</p>
                        </div>
                      </div>
                      <span className="text-2xl font-black text-orange-400">{scoreA}</span>
                    </div>

                    {/* Fighter B */}
                    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{fB.image}</span>
                        <div>
                          <p className="font-bold text-slate-100">
                            <span className="text-orange-500 mr-2">#{fB.seed}</span>
                            {fB.name}
                          </p>
                          <p className="text-xs text-slate-400">{fB.attributes.join(' • ')}</p>
                        </div>
                      </div>
                      <span className="text-2xl font-black text-orange-400">{scoreB}</span>
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
              <div key={f.id} className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col justify-between">
                <div>
                  <div className="text-3xl mb-2">{f.image}</div>
                  <h3 className="font-bold text-lg text-slate-100 mb-1">
                    {f.seed && <span className="text-orange-500 mr-1">#{f.seed}</span>}
                    {f.name}
                  </h3>
                  <p className="text-xs text-orange-400 font-semibold mb-2">{f.status}</p>
                  <p className="text-xs text-slate-400 mb-3">{f.bio}</p>
                </div>
                <div className="flex flex-wrap gap-1">
                  {f.attributes.map((attr, idx) => (
                    <span key={idx} className="bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded">
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
