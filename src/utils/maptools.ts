import { nodeToCoordinates } from "./misc";
import { 
  Coordinates, 
  OSMData,
  Node,
  Edge
 } from "../types/interfaces";
import { 
  haversine,
  euclideanDistance,
  getMidpointPrecision,
  getMidpointApprox,
} from "./formulas";

export function getDistance(coordsA: Coordinates, coordsB: Coordinates): number {
  //return haversine(coordsA, coordsB);
  return euclideanDistance(coordsA, coordsB);
}

export function getMidpoint(coordsA: Coordinates, coordsB: Coordinates): Coordinates {
  return getMidpointPrecision(coordsA, coordsB);
  //return getMidpointApprox(coordsA, coordsB);
}


export function parseOSMData(data: OSMData): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const nodeMap: { [key: number]: Node } = {};

  data.elements.forEach(element => {
    if (element.type === 'way') {
      const wayNodes = element.nodes;
      const wayGeometry = element.geometry;

      for (let i = 0; i < wayNodes.length; i++) {
        const nodeId = wayNodes[i];
        const { lat, lon } = wayGeometry[i];

        if (!nodeMap[nodeId]) {
          nodeMap[nodeId] = { id: nodeId, lat, lon };
          nodes.push(nodeMap[nodeId]);
        }

        if (i > 0) {
          const prevNodeId = wayNodes[i - 1];
          const prevNode = nodeMap[prevNodeId];
          const currentNode = nodeMap[nodeId];

          const distance = euclideanDistance(nodeToCoordinates(prevNode), nodeToCoordinates(currentNode));
          edges.push({ from: prevNodeId, to: nodeId, weight: distance });
        }
      }
    }
  });

  return { nodes, edges };
}
