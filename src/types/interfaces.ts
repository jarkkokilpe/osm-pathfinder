export type CoordinatePair = [number, number];
export type RawCoordinates = CoordinatePair[];

export type RectangleCoordinates = [
  CoordinatePair, 
  CoordinatePair, 
  CoordinatePair, 
  CoordinatePair, 
  CoordinatePair,
];

export interface Coordinates {
  lat: number;
  lon: number;
}

export interface Node {
  id: number;
  lat: number;
  lon: number;
}

export interface Edge {
  from: number;
  to: number;
  weight: number;
}

export interface Way {
  id: number;
  nodes: number[];
  geometry: { lat: number; lon: number }[];
}

export interface DijkstraObj {
  path: { lat: number; lon: number }[];
  distance: number;
}

export interface TspObj {
  path: { lat: number; lon: number }[];
  distance: number;
  indexes: [number, number]; // Add indexes to track the input array indexes
}

export interface OSMData {
  elements: {
    type: string;
    id: number;
    nodes: number[];
    geometry: { lat: number; lon: number }[];
    tags?: { [key: string]: string };
  }[];
}