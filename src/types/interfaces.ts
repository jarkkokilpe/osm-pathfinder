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

export interface OSMData {
  elements: {
    type: string;
    id: number;
    nodes: number[];
    geometry: { lat: number; lon: number }[];
    tags?: { [key: string]: string };
  }[];
}