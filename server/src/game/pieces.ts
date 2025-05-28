
// Helper for rotating matrices (clockwise)
import {Piece} from "../types.js";

const rotate = (matrix: number[][]): number[][] =>
  matrix[0].map((_, i) => matrix.map(row => row[i]).reverse());

// Get all unique rotations for a piece
function getRotations(base: number[][]): number[][][] {
  const rotations = [base];
  let prev = base;
  for (let i = 0; i < 3; i++) {
    prev = rotate(prev);
    if (!rotations.some(m => JSON.stringify(m) === JSON.stringify(prev))) {
      rotations.push(prev);
    }
  }
  return rotations;
}

// --- PIECES DEFINITION (using color hex values directly) ---

export const PIECES: Piece[] = [
  {
    id: "block3x3",
    name: "3x3 Square",
    color: "#335C67",
    matrices: [
      [
        [1,1,1],
        [1,1,1],
        [1,1,1],
      ],
    ],
  },
  {
    id: "rect2x3",
    name: "2x3 Rectangle",
    color: "#E09F3E",
    matrices: getRotations([
      [1,1,1],
      [1,1,1],
    ]),
  },
  {
    id: "rect3x2",
    name: "3x2 Rectangle",
    color: "#E09F3E",
    matrices: getRotations([
      [1,1],
      [1,1],
      [1,1],
    ]),
  },
  {
    id: "line1x5",
    name: "1x5 Line",
    color: "#5396A6", // use a blue/info color
    matrices: [
      [[1,1,1,1,1]],
      [[1],[1],[1],[1],[1]],
    ],
  },
  {
    id: "line1x4",
    name: "1x4 Line",
    color: "#E09F3E",
    matrices: [
      [[1,1,1,1]],
      [[1],[1],[1],[1]],
    ],
  },
  {
    id: "line4x1",
    name: "4x1 Line",
    color: "#E09F3E",
    matrices: [
      [[1,1,1,1]],
      [[1],[1],[1],[1]],
    ],
  },
  {
    id: "line5x1",
    name: "5x1 Line",
    color: "#5396A6",
    matrices: [
      [[1,1,1,1,1]],
      [[1],[1],[1],[1],[1]],
    ],
  },
  {
    id: "square2x2",
    name: "2x2 Square",
    color: "#4CAF50", // green for success
    matrices: [
      [
        [1,1],
        [1,1],
      ],
    ],
  },
  {
    id: "l4",
    name: "L",
    color: "#9E2A2B",
    matrices: getRotations([
      [1,0],
      [1,0],
      [1,1],
    ]),
  },
  {
    id: "knightL",
    name: "Knight L",
    color: "#E09F3E",
    matrices: getRotations([
      [1,0,0],
      [1,1,1],
    ]),
  },
  {
    id: "l4-inverse",
    name: "L Inverse",
    color: "#9E2A2B",
    matrices: getRotations([
      [0,1],
      [0,1],
      [1,1],
    ]),
  },
  {
    id: "s",
    name: "S",
    color: "#E09F3E",
    matrices: getRotations([
      [0,1,1],
      [1,1,0],
    ]),
  },
  {
    id: "z",
    name: "Z",
    color: "#335C67",
    matrices: getRotations([
      [1,1,0],
      [0,1,1],
    ]),
  },
  {
    id: "t",
    name: "T",
    color: "#E09F3E",
    matrices: getRotations([
      [1,1,1],
      [0,1,0],
    ]),
  },
  {
    id: "curved1",
    name: "Curved",
    color: "#4CAF50",
    matrices: getRotations([
      [1,1,0],
      [0,1,1],
      [0,0,1],
    ]),
  },
  {
    id: "snake",
    name: "Snake",
    color: "#5396A6",
    matrices: getRotations([
      [1,0],
      [1,1],
      [0,1],
      [0,1],
    ]),
  },
];
