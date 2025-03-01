import { RawCoordinates, Coordinates, OSMData, DijkstraObj, TspObj } from './types/interfaces';
import { 
  findNearestNode, 
  getDistance, 
  getMidpoint, 
  parseOSMData, 
  generateRectangle,
  generateSinglePath
} from './utils/maptools';
import { Osm } from './osm';
import { createGraph } from './graph';
import { dijkstra, getGeometricMedian } from './utils/formulas';

export class Pathfinder {
  private apiBaseUrl: string;
  private rectangle: Coordinates[] = [];
  constructor (apiBaseUrl?: string) { 
    this.apiBaseUrl = apiBaseUrl || '';
  }

  async findSinglePath(startCoords: Coordinates, endCoords: Coordinates): Promise<RawCoordinates> {
    const dist = getDistance(startCoords, endCoords, 'euclidean');
    const midpoint = getMidpoint(startCoords, endCoords, 'euclidean');

    const osm = new Osm(this.apiBaseUrl);
    let osmData: OSMData

    if (dist < 100) {
      osmData = await osm.getOsmWayDataCircle(midpoint, dist * 0.6);
    } else {
      this.rectangle = generateRectangle(startCoords, endCoords, dist * 0.5 > 20000 ? 20000 : dist * 0.5 , dist * 0.05);
      osmData = await osm.getOsmWayDataRectangle(this.rectangle);
    }

    const { nodes, edges, nodeCoordinates, isOneway } = parseOSMData(osmData);
    const graph = createGraph(nodes, edges, isOneway);
    // Find the nearest node

    const startNode = findNearestNode(startCoords, nodes);
    const endNode = findNearestNode(endCoords, nodes);

    if (!startNode) {
      console.log('START: No nodes found in the OSM data.');
      return [];
    }
    
    if (!endNode) {
      console.log('END: No nodes found in the OSM data.');
      return [];
    }

    const { path, distance } = dijkstra(graph, startNode.node.id, endNode.node.id, nodeCoordinates);
    const rawResult: RawCoordinates = path.map(coord => [coord.lat, coord.lon]);

    return rawResult;
  }

  async findMultiPath(coordinates: Coordinates[]): Promise<RawCoordinates> {
    function generatePermutations(arr: Coordinates[]): Coordinates[][] {
      if (arr.length <= 1) return [arr];
      const permutations: Coordinates[][] = [];
      for (let i = 0; i < arr.length; i++) {
        const current = arr[i];
        const remaining = arr.slice(0, i).concat(arr.slice(i + 1));
        const remainingPerms = generatePermutations(remaining);
        for (const perm of remainingPerms) {
          permutations.push([current, ...perm]);
        }
      }
      return permutations;
    }
    const pathLookup: Map<string, TspObj> = new Map();
    const midpoint = getGeometricMedian(coordinates);
    const largestDistance = coordinates.reduce((maxDist, coord) => {
      const dist = getDistance(midpoint, coord, 'euclidean');
      return dist > maxDist ? dist : maxDist;
    }, 0);
  
    if (largestDistance > 10000) {
      throw new Error('The distance between the points is too large for this method.');
    }
  
    const osm = new Osm(this.apiBaseUrl);
    const osmData = await osm.getOsmWayDataCircle(midpoint, largestDistance + 300);
  
    if (osmData.elements.length === 0) {
      throw new Error('No OSM data found.');
    }

    for (let i = 0; i < coordinates.length; i++) {
      for (let j = i + 1; j < coordinates.length; j++) {
        const path = generateSinglePath(coordinates[i], coordinates[j], osmData);
        pathLookup.set(`${i}-${j}`, { ...path, indexes: [i, j] }); // Store path from i to j
      }
    }

    const start = coordinates[0];
    const end = coordinates[coordinates.length - 1];
    const middleCoordinates = coordinates.slice(1, -1);
    const allPermutations = generatePermutations(middleCoordinates);
  
    let minDistance = Infinity;
    let bestSequence: Coordinates[] = [];
  
    for (const permutation of allPermutations) {
      const sequence = [start, ...permutation, end];
      let totalDistance = 0;
      for (let i = 0; i < sequence.length - 1; i++) {
        const startIndex = coordinates.indexOf(sequence[i]);
        const endIndex = coordinates.indexOf(sequence[i + 1]);
        const pathKey = `${startIndex}-${endIndex}`;
        const path = pathLookup.get(pathKey);
        if (path) {
          totalDistance += path.distance;
        } else {
          totalDistance = Infinity;
          break;
        }
      }
      if (totalDistance < minDistance) {
        minDistance = totalDistance;
        bestSequence = sequence;
      }
    }
    
    const result: TspObj[] = [];
    for (let i = 0; i < bestSequence.length - 1; i++) {
      const startIndex = coordinates.indexOf(bestSequence[i]);
      const endIndex = coordinates.indexOf(bestSequence[i + 1]);
      const pathKey = `${startIndex}-${endIndex}`;
      const path = pathLookup.get(pathKey);
      if (path) {
        result.push(path);
      }
    }

    const rawCoordinates: RawCoordinates = [];
    for (let i = 0; i < bestSequence.length - 1; i++) {
      const startIndex = coordinates.indexOf(bestSequence[i]);
      const endIndex = coordinates.indexOf(bestSequence[i + 1]);
      const pathKey = `${startIndex}-${endIndex}`;
      const path = pathLookup.get(pathKey);
      if (path) {
        for (const coord of path.path) {
          rawCoordinates.push([coord.lat, coord.lon]);
        }
      }
    }
    return rawCoordinates;
  }

  async findRectangle(startCoords: Coordinates, endCoords: Coordinates, width: number, padding: number): Promise<RawCoordinates> {
    const rectangle = generateRectangle(startCoords, endCoords, width, padding);
    const rawResult: RawCoordinates = rectangle.map(corner => [corner.lat, corner.lon]);
    return rawResult;
  }  

  getCurrentRectangle(): RawCoordinates {
    const rawResult: RawCoordinates = this.rectangle.map(corner => [corner.lat, corner.lon]);
    return rawResult;
  }  
}
