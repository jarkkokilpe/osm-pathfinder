import { Pathfinder } from './pathfinder';
import { Coordinates } from './types/interfaces';

async function testOsmApi() {
  console.log('Running manual test for OSM API');
  const locationA: Coordinates = { lat: 64.22386736105923, lon: 27.72419925108855 };
  const locationB: Coordinates = { lat: 64.22142470063005, lon: 27.7381927811236 };
  const points: Coordinates[] = [{ lat: 0, lon: 0 }, { lat: 1, lon: 1 }, { lat: 2, lon: 2 }];
  const finder = new Pathfinder();
  const result = finder.findPath(locationA, locationB);
  console.log('Running manual test for OSM API EXIT');
}
    
testOsmApi().catch(console.error);