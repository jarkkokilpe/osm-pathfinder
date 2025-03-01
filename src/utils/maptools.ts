import { createGraph } from "../graph";
import { 
  Coordinates, 
  OSMData,
  Node,
  Edge,
  DijkstraObj,
 } from "../types/interfaces";
import { 
  haversine,
  euclideanDistance,
  getMidpointPrecision,
  getMidpointApprox,
  calculateBearing,
  calculateDestination,
  dijkstra,
} from "./formulas";

// Function overloads
export function getDistance(coordsA: Coordinates, coordsB: Coordinates, method: 'haversine'): number;
export function getDistance(coordsA: Coordinates, coordsB: Coordinates, method: 'euclidean'): number;

// Function implementation
export function getDistance(coordsA: Coordinates, coordsB: Coordinates, method: 'haversine' | 'euclidean'): number {
  if (method === 'haversine') {
    return haversine(coordsA, coordsB);
  } else if (method === 'euclidean') {
    return euclideanDistance(coordsA, coordsB);
  } else {
    throw new Error('Invalid method');
  }
}

// Function overloads
export function getMidpoint(coordsA: Coordinates, coordsB: Coordinates, method: 'haversine'): Coordinates;
export function getMidpoint(coordsA: Coordinates, coordsB: Coordinates, method: 'euclidean'): Coordinates;

// Function implementation
export function getMidpoint(coordsA: Coordinates, coordsB: Coordinates, method: 'haversine' | 'euclidean'): Coordinates {
  if (method === 'haversine') {
    return getMidpointPrecision(coordsA, coordsB);
  } else if (method === 'euclidean') {
    return getMidpointApprox(coordsA, coordsB);
  } else {
    throw new Error('Invalid method');
  }
}

export function parseOSMData(data: OSMData): { nodes: Node[]; edges: Edge[]; nodeCoordinates: Map<number, { lat: number; lon: number }>, isOneway: boolean[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const nodeMap: { [key: number]: Node } = {};
  const nodeCoordinates = new Map<number, Coordinates>();
  const isOneway: boolean[] = [];

  data.elements.forEach(element => {
    if (element.type === 'way') {
      const wayNodes = element.nodes;
      const wayGeometry = element.geometry;
      const oneway = (element.tags && element.tags.oneway === 'yes') || false;

      for (let i = 0; i < wayNodes.length; i++) {
        const nodeId = wayNodes[i];
        const { lat, lon } = wayGeometry[i];

        if (!nodeMap[nodeId]) {
          nodeMap[nodeId] = { id: nodeId, lat, lon };
          nodes.push(nodeMap[nodeId]);
          nodeCoordinates.set(nodeId, { lat, lon });
        }

        if (i > 0) {
          const prevNodeId = wayNodes[i - 1];
          const prevNode = nodeMap[prevNodeId];
          const currentNode = nodeMap[nodeId];

          const distance = getDistance(nodeToCoordinates(prevNode), nodeToCoordinates(currentNode), 'euclidean');
          edges.push({ from: prevNodeId, to: nodeId, weight: distance });
          isOneway.push(oneway);

          // If the way is not oneway, add the reverse edge as well
          if (!oneway) {
            edges.push({ from: nodeId, to: prevNodeId, weight: distance });
            isOneway.push(false);
          }
        }
      }
    }
  });

  return { nodes, edges, nodeCoordinates, isOneway };
}



export function findNearestNode(
  targetCoords: Coordinates,
  nodes: Node[]
): { node: Node; distance: number } | null {
  if (nodes.length === 0) return null;

  let nearestNode: Node = nodes[0];
  let minDistance = getDistance(targetCoords, nodeToCoordinates(nearestNode), 'euclidean');

  for (const node of nodes) {
    const distance = getDistance(targetCoords, nodeToCoordinates(node), 'euclidean');
    if (distance < minDistance) {
      minDistance = distance;
      nearestNode = node;
    }
  }

  return { node: nearestNode, distance: minDistance };
}

export function nodeToCoordinates(node: Node): Coordinates {
  return {
    lat: node.lat,
    lon: node.lon
  };
}

/**
 * Generates a rectangle aligned with the line between two points.
 * @param start - The starting coordinate.
 * @param end - The ending coordinate.
 * @param width - The width of the rectangle in meters.
 * @param padding - The padding to extend the rectangle beyond the start and end points in meters.
 * @returns An array of four coordinates representing the rectangle's corners.
 */
export function generateRectangle(
  start: Coordinates,
  end: Coordinates,
  width: number,
  padding: number
): Coordinates[] {
  // Calculate the bearing of the line
  const bearing = calculateBearing(start, end);

  // Calculate the perpendicular bearing (90 degrees to the left and right)
  const perpendicularBearingLeft = bearing - Math.PI / 2;
  const perpendicularBearingRight = bearing + Math.PI / 2;

  // Adjust the start and end points with padding
  const adjustedStart = calculateDestination(start, bearing + Math.PI, padding);
  const adjustedEnd = calculateDestination(end, bearing, padding);

  // Calculate the four corners of the rectangle
  const cornerStart = calculateDestination(adjustedStart, perpendicularBearingLeft, width / 2);
  const corner2 = calculateDestination(adjustedStart, perpendicularBearingRight, width / 2);
  const corner3 = calculateDestination(adjustedEnd, perpendicularBearingRight, width / 2);
  const corner4 = calculateDestination(adjustedEnd, perpendicularBearingLeft, width / 2);
  const cornerEnd = cornerStart; // Closing the rectangle

  return [cornerStart, corner2, corner3, corner4, cornerEnd];
}


export function generateSinglePath (
  coordA: Coordinates, 
  coordB: Coordinates, 
  osmData: OSMData): DijkstraObj {
  const { nodes, edges, nodeCoordinates, isOneway } = parseOSMData(osmData);
  //const { nodes, edges } = parseOSMData(osmData);
  const graph = createGraph(nodes, edges, isOneway);
  // Find the nearest node
  
  const startNode = findNearestNode(coordA, nodes);
  const endNode = findNearestNode(coordB, nodes);

  if (!startNode) {
    console.log('START: No nodes found in the OSM data.');
    return { path: [], distance: 0 };
  }

  if (!endNode) {
    console.log('END: No nodes found in the OSM data.');
    return { path: [], distance: 0 };
  }

  const result = dijkstra(graph, startNode.node.id, endNode.node.id, nodeCoordinates);
  console.log('dijkstra result: ', result);
  return result;
}