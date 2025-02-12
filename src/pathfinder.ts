import { Coordinates } from './types/interfaces';
import { getDistance, getMidpoint, parseOSMData } from './utils/maptools';
import { Osm } from './osm';
import { createGraph } from './graph';
import { dijkstra } from './utils/formulas';

export class Pathfinder {
  private apiBaseUrl: string;
  
  constructor (apiBaseUrl?: string) { 
    this.apiBaseUrl = apiBaseUrl || '';
  }
    async findPath(startCoords: Coordinates, endCoords: Coordinates): Promise<Coordinates[]> {
      // Implement a basic pathfinding algorithm here
      // For example, a simple breadth-first search or A* algorithm
      // This is a placeholder implementation
      const pathCoords: Coordinates[] = [{ lat: 0, lon: 0 }, { lat: 1, lon: 1 }, { lat: 2, lon: 2 }];
      
      const dist = getDistance(startCoords, endCoords);
      const midpoint = getMidpoint(startCoords, endCoords);
      
      if (dist < 10) {
        // dijkstra(startCoords, endCoords);
      } else {
        // aStar(startCoords, endCoords);
      }

      const osm = new Osm(this.apiBaseUrl);
      const osmData = await osm.getOsmWayDataCircle(midpoint, dist * 0.6);
      const { nodes, edges } = parseOSMData(osmData);
      const graph = createGraph(nodes, edges);
      
      const startNode = 248151369; // Example start node ID
      const endNode = 137681703; // Example end node ID

      const { path, distance } = dijkstra(graph, startNode, endNode);
      
      console.log(`Pathfinding from ${startCoords.lat}, ${startCoords.lon} to ${endCoords.lat}, ${endCoords.lon}`);
      console.log(`Distance: ${dist} km`);
      console.log(`Midpoint: ${midpoint.lat}, ${midpoint.lon}`);
      console.log('path', path);
      console.log('distance', distance);
      return pathCoords;
  }
}
