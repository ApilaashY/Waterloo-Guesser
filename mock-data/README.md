Mock data for the Waterloo-Guesser project

Files:
- `mock-site-data.json` - Example site, navigation, sample locations, players, leaderboard, and matches.

Usage:
- Import the JSON in tests or dev pages to seed the UI.

Example:
```ts
import mock from '../mock-data/mock-site-data.json';
console.log(mock.sampleLocations[0].title);
```

Notes:
- Image paths are example placeholders; add real images under `public/sample-images/` if you want to preview.
- `mapNormalized` coordinates are 0-1 ranges suitable for fit-to-map placement.
