// Fetch live score tallies directly from published Google Sheets CSV
useEffect(() => {
  async function fetchScores() {
    const csvUrl = tournamentData?.googleSheetCsvUrl;
    if (!csvUrl) {
      setLoadingScores(false);
      return;
    }

    try {
      const response = await fetch(csvUrl);
      const csvText = await response.text();

      // Parse CSV rows into key-value map (e.g. { "dracula": 9, "carlos": 3 })
      const lines = csvText.split(/\r?\n/);
      const parsedScores = {};

      lines.forEach((line) => {
        const columns = line.split(',').map((col) => col.trim().replace(/^"|"$/g, ''));
        if (columns.length >= 2) {
          const key = columns[0].toLowerCase();
          const score = parseInt(columns[1], 10);
          if (!isNaN(score)) {
            parsedScores[key] = score;
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
