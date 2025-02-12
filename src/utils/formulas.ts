import { Coordinates, Node, Edge } from "../types/interfaces";
import { Graph } from "../graph";

/**
 * 
 * Use the Haversine formula to calculate the distance between two points on the Earth's surface.
 * The function is accurate for any two points on the Earth's surface, regardless of the distance between them.
 * 
 * @param coordsA the first coordinate
 * @param coordsB the second coordinate
 * @returns Distance in meters
 */
export function haversine(coordsA: Coordinates, coordsB: Coordinates): number {
  const R = 6371; // Earth's radius in kilometers
  const toRadians = (degrees: number) => degrees * (Math.PI / 180); // Helper function to convert degrees to radians

  // Convert latitude and longitude from degrees to radians
  const φ1 = toRadians(coordsA.lat);
  const φ2 = toRadians(coordsA.lat);
  const Δφ = toRadians(coordsB.lat - coordsA.lat);
  const Δλ = toRadians(coordsB.lon - coordsA.lon);

  // Haversine formula
  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  // Distance in meters
  return R * c * 1000;
}

/**
 * 
 * Use the Euclidean distance formula to calculate the distance approximation between two points.
 * The function is less accurate than the Haversine formula, but it's simpler and faster to compute.
 * It's suitable for short distances (under 10 km) and where high accuracy is not required.
 * 
 * @param coordsA the first coordinate
 * @param coordsB the second coordinate
 * @returns Approx distance in meters
 */
export function euclideanDistance(coordsA: Coordinates, coordsB: Coordinates): number {
  const metersPerDegree = 111320; // Approximate km per degree of latitude
  const latDistance = (coordsB.lat - coordsA.lat) * metersPerDegree;
  const lonDistance = (coordsB.lon - coordsA.lon) * metersPerDegree * Math.cos((coordsA.lat + coordsB.lat) / 2 * (Math.PI / 180));
  return Math.sqrt(latDistance ** 2 + lonDistance ** 2);
}

/**
 * Calculate the midpoint between two coordinates using the Haversine formula.
 * Use this function when you need an accurate midpoint between two points.
 * 
 * @param coordsA the first coordinate
 * @param coordsB the second coordinate
 * @returns the midpoint coordinates between the two input coordinates
 */
export function getMidpointPrecision(coordsA: Coordinates, coordsB: Coordinates): Coordinates {
  const toRadians = (degrees: number) => degrees * (Math.PI / 180); // Helper function to convert degrees to radians
  const toDegrees = (radians: number) => radians * (180 / Math.PI); // Helper function to convert radians to degrees

  // Convert latitude and longitude from degrees to radians
  const φ1 = toRadians(coordsA.lat);
  const λ1 = toRadians(coordsA.lon);
  const φ2 = toRadians(coordsB.lat);
  const λ2 = toRadians(coordsB.lon);

  // Calculate midpoint latitude and longitude
  const Bx = Math.cos(φ2) * Math.cos(λ2 - λ1);
  const By = Math.cos(φ2) * Math.sin(λ2 - λ1);
  const midLat = Math.atan2(
      Math.sin(φ1) + Math.sin(φ2),
      Math.sqrt((Math.cos(φ1) + Bx) ** 2 + By ** 2)
  );
  const midLon = λ1 + Math.atan2(By, Math.cos(φ1) + Bx);

  // Convert back to degrees
  return { lat: toDegrees(midLat), lon: toDegrees(midLon) };
}

/**
 * Calculate the midpoint between two coordinates using the Euclidean distance formula.
 * Use this function when you need a quick approximation of the midpoint between two points.
 * 
 * @param coordsA the first coordinate
 * @param coordsB the second coordinate
 * @returns the approximated midpoint coordinates between the two input coordinates
 */
export function getMidpointApprox(coordsA: Coordinates, coordsB: Coordinates): Coordinates {
  const midLat = (coordsA.lat + coordsB.lat) / 2;
  const midLon = (coordsA.lon + coordsB.lon) / 2;
  return {lat: midLat, lon: midLon};
}


export function dijkstra(graph: Graph, startNode: number, endNode: number): { path: number[]; distance: number } {
  const distances: { [key: number]: number } = {};
  const previous: { [key: number]: number | null } = {};
  const nodes = new Set<number>();

  Object.keys(graph.adjacencyList).forEach(node => {
    const nodeNumber = Number(node);
    distances[nodeNumber] = Infinity;
    previous[nodeNumber] = null;
    nodes.add(nodeNumber);
  });

  distances[startNode] = 0;

  while (nodes.size > 0) {
    const currentNode = Array.from(nodes).reduce((minNode, node) => 
      distances[node] < distances[minNode] ? node : minNode
    );

    nodes.delete(currentNode);

    if (currentNode === endNode) {
      const path: number[] = [];
      let tempNode: number | null = currentNode;
      while (tempNode !== null) {
        path.unshift(tempNode);
        tempNode = previous[tempNode];
      }
      return { path, distance: distances[currentNode] };
    }

    graph.adjacencyList[currentNode].forEach(neighbor => {
      const alt = distances[currentNode] + neighbor.weight;
      if (alt < distances[neighbor.node]) {
        distances[neighbor.node] = alt;
        previous[neighbor.node] = currentNode;
      }
    });
  }

  return { path: [], distance: Infinity };
}