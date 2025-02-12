import { Node, Coordinates } from '../types/interfaces';

export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function nodeToCoordinates(node: Node): Coordinates {
  return {
    lat: node.lat,
    lon: node.lon
  };
}