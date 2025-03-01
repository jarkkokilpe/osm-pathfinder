import { Pathfinder } from './pathfinder';
import { Coordinates } from './types/interfaces';

async function testOsmApi() {
  console.log('Running manual test for OSM API');
  const locationA: Coordinates = { lat: 64.22654576263102, lon: 27.70900067391138 };
  const locationB: Coordinates = { lat: 64.21243073946002, lon: 27.75487807721271 };
  const points: Coordinates[] = [{ lat: 0, lon: 0 }, { lat: 1, lon: 1 }, { lat: 2, lon: 2 }];
  const finder = new Pathfinder();
  const result = await finder.findSinglePath(locationA, locationB);
  console.log('Running manual test for OSM API EXIT');
  console.log('EXIT result', result);
}
    
testOsmApi().catch(console.error);