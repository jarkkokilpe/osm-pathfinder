# osm-pathfinder

osm-pathfinder is a TypeScript-based library designed to solve the Traveling Salesman Problem (TSP) and provide basic pathfinding algorithms for OpenStreetMap (OSM) data. This library is suitable for developers looking to implement efficient routing and pathfinding solutions in their applications.

## Features

- **Traveling Salesman Problem Solver**: Efficiently calculates the optimal path for visiting a set of points.
- **Basic Pathfinding Algorithms**: Implements algorithms to find paths between two points on a map.

## Installation

To install the library, you can use npm:

```bash
npm install osm-pathfinder
```

## Usage

### Importing the Library

You can import the library in your JavaScript or TypeScript project as follows:

```javascript
// For JavaScript
const { TspSolver, Pathfinder } = require('osm-pathfinder');

// For TypeScript
import { TspSolver, Pathfinder } from 'osm-pathfinder';
```

### Traveling Salesman Problem Solver

To use the TspSolver, you can create an instance and call the `solve` method:

```javascript
const tspSolver = new TspSolver();
const points = [[0, 0], [1, 1], [2, 2]]; // Example points
const optimalPath = tspSolver.solve(points);
console.log(optimalPath);
```

### Pathfinding

To find a path between two points, use the Pathfinder class:

```javascript
const pathfinder = new Pathfinder();
const startPoint = [0, 0];
const endPoint = [2, 2];
const path = pathfinder.findPath(startPoint, endPoint);
console.log(path);
```

## API Reference

### TspSolver

- **`solve(points: Array<[number, number]>): Array<[number, number]>`**: Returns the optimal path for the given array of points.

### Pathfinder

- **`findPath(start: [number, number], end: [number, number]): Array<[number, number]>`**: Returns the path between the start and end points.

## TypeScript Support

This library is written in TypeScript, which means it provides type definitions that enhance the development experience for TypeScript users. However, it can also be used seamlessly in JavaScript projects, as TypeScript compiles down to JavaScript.

## Contributing

Contributions are welcome! Please submit a pull request or open an issue for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.