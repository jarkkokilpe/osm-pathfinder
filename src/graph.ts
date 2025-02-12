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

  addEdge(from: number, to: number, weight: number) {
    this.adjacencyList[from].push({ node: to, weight });
    this.adjacencyList[to].push({ node: from, weight }); // Assuming bidirectional edges
  }
}

export function createGraph(nodes: Node[], edges: Edge[]): Graph {
  const graph = new Graph();

  nodes.forEach(node => graph.addNode(node.id));
  edges.forEach(edge => graph.addEdge(edge.from, edge.to, edge.weight));

  return graph;
}
