import { Edge, Node } from "./types/interfaces";

export class Graph {
  adjacencyList: { [key: number]: { node: number; weight: number }[] };

  constructor() {
    this.adjacencyList = {};
  }

  addNode(node: number) {
    if (!this.adjacencyList[node]) {
      this.adjacencyList[node] = [];
    }
  }

  addEdge(from: number, to: number, weight: number, isOneway: boolean) {
    this.adjacencyList[from].push({ node: to, weight });
    if (!isOneway) {
      this.adjacencyList[to].push({ node: from, weight });
    }
  }
}

export function createGraph(nodes: Node[], edges: Edge[], isOneway: boolean[]): Graph {
  const graph = new Graph();

  nodes.forEach(node => graph.addNode(node.id));
  edges.forEach((edge, index) => graph.addEdge(edge.from, edge.to, edge.weight, isOneway[index]));

  return graph;
}
