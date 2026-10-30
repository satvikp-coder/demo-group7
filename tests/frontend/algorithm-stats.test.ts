import assert from 'node:assert/strict';
import {test} from 'node:test';
import {createRequire} from 'node:module';
import {AlgorithmStatsPanel} from '../../frontend/src/components/AlgorithmStatsPanel';

// React lives in frontend/node_modules, so resolve it from there rather than from tests/.
const require = createRequire(new URL('../../frontend/package.json', import.meta.url));
const React = require('react');
const {renderToStaticMarkup} = require('react-dom/server');
const base = {attractionsConsidered: 6, attractionsVisited: 6, directRoadConnectionsUsed: 31, dijkstraFallbackCalls: 0};
const text = (stats: Parameters<typeof AlgorithmStatsPanel>[0]['stats']) =>
  renderToStaticMarkup(React.createElement(AlgorithmStatsPanel, {stats, defaultExpanded: true})).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

test('absent graph counts show N/A and never "Not available" next to a unit', () => {
  const out = text({...base, nodesVisited: Number.NaN, edgesRelaxed: Number.NaN, executionTimeMs: Number.NaN});
  assert.match(out, /Graph Ops N\/A \/ N\/A/);
  assert.doesNotMatch(out, /Not available\s*(nodes|edges|ms)/i);
  assert.doesNotMatch(out, /Not availablems/);
});

test('real graph counts are shown with their units', () => {
  const out = text({...base, nodesVisited: 12, edgesRelaxed: 40, executionTimeMs: 7});
  assert.match(out, /Graph Ops 12 nodes \/ 40 edges/);
  assert.match(out, /Exec Time 7ms/);
});

test('one absent count does not hide the other', () => {
  const out = text({...base, nodesVisited: 12, edgesRelaxed: Number.NaN, executionTimeMs: 7});
  assert.match(out, /Graph Ops 12 nodes \/ N\/A/);
});
