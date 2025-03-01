import { Coordinates, Node, Edge, DijkstraObj } from "../types/interfaces";
import { toRadians, toDegrees } from "./misc";
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
  const φ1 = toRadians(coordsA.lat);
  const φ2 = toRadians(coordsA.lat);
  const Δφ = toRadians(coordsB.lat - coordsA.lat);
  const Δλ = toRadians(coordsB.lon - coordsA.lon);
  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
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
  const φ1 = toRadians(coordsA.lat);
  const λ1 = toRadians(coordsA.lon);
  const φ2 = toRadians(coordsB.lat);
  const λ2 = toRadians(coordsB.lon);

  const Bx = Math.cos(φ2) * Math.cos(λ2 - λ1);
  const By = Math.cos(φ2) * Math.sin(λ2 - λ1);
  const midLat = Math.atan2(
      Math.sin(φ1) + Math.sin(φ2),
      Math.sqrt((Math.cos(φ1) + Bx) ** 2 + By ** 2)
  );
  const midLon = λ1 + Math.atan2(By, Math.cos(φ1) + Bx);

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

export function getGeometricMedian(coordinates: Coordinates[]): Coordinates {
  if (coordinates.length < 2 || coordinates.length > 5) {
    throw new Error("The input must contain between 2 and 5 coordinates.");
  }

  function distance(a: Coordinates, b: Coordinates): number {
    const latDiff = a.lat - b.lat;
    const lonDiff = a.lon - b.lon;
    return Math.sqrt(latDiff * latDiff + lonDiff * lonDiff);
  }

  let median = {
    lat: coordinates.reduce((sum, coord) => sum + coord.lat, 0) / coordinates.length,
    lon: coordinates.reduce((sum, coord) => sum + coord.lon, 0) / coordinates.length,
  };

  const tolerance = 1e-6;
  let difference = Infinity;

  while (difference > tolerance) {
    let num = { lat: 0, lon: 0 };
    let denom = 0;

    for (const coord of coordinates) {
      const dist = distance(median, coord);
      if (dist !== 0) {
        num.lat += coord.lat / dist;
        num.lon += coord.lon / dist;
        denom += 1 / dist;
      }
    }

    const newMedian = { lat: num.lat / denom, lon: num.lon / denom };
    difference = distance(median, newMedian);
    median = newMedian;
  }

  return median;
}

// Function to calculate the average middle point
export function getCentroid(coordinates: Coordinates[]): Coordinates {
  if (coordinates.length < 2 || coordinates.length > 5) {
    throw new Error("The input must contain between 2 and 5 coordinates.");
  }

  const total = coordinates.reduce(
    (acc, coord) => {
      return {
        lat: acc.lat + coord.lat,
        lon: acc.lon + coord.lon,
      };
    },
    { lat: 0, lon: 0 } // Initial value
  );

  const average = {
    lat: total.lat / coordinates.length,
    lon: total.lon / coordinates.length,
  };

  return average;
}

/**
 * Convert a Node object to a Coordinates object.
 * 
 * @param node the Node object
 * @returns the Coordinates object
 */
export function dijkstra(
  graph: Graph,
  startNode: number,
  endNode: number,
  nodeCoordinates: Map<number, { lat: number; lon: number }>
): DijkstraObj {
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

      // Map node IDs to coordinates
      const coordinatesPath = path.map(nodeId => {
        const coords = nodeCoordinates.get(nodeId);
        if (!coords) throw new Error(`Coordinates not found for node ${nodeId}`);
        return coords;
      });
      console.log('Path:', coordinatesPath);
      return { path: coordinatesPath, distance: distances[currentNode] };
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

/**
 * Calculates the destination point given a starting point, bearing, and distance.
 */
export function calculateDestination(
  start: Coordinates,
  bearing: number,
  distance: number
): Coordinates {
  const R = 6371000; // Earth's radius in meters
  const lat1 = toRadians(start.lat);
  const lon1 = toRadians(start.lon);
  const angularDistance = distance / R;

  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(angularDistance) +
    Math.cos(lat1) * Math.sin(angularDistance) * Math.cos(bearing)
  );

  const lon2 =
    lon1 +
    Math.atan2(
      Math.sin(bearing) * Math.sin(angularDistance) * Math.cos(lat1),
      Math.cos(angularDistance) - Math.sin(lat1) * Math.sin(lat2)
    );

  return {
    lat: toDegrees(lat2),
    lon: toDegrees(lon2),
  };
}

/**
 * Calculates the bearing (direction) between two points.
 */
export function calculateBearing(start: Coordinates, end: Coordinates): number {
  const lat1 = toRadians(start.lat);
  const lon1 = toRadians(start.lon);
  const lat2 = toRadians(end.lat);
  const lon2 = toRadians(end.lon);

  const y = Math.sin(lon2 - lon1) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);

  return Math.atan2(y, x);
}