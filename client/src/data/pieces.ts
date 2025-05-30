import { Piece } from "../types/piece";

// Unified neutral/purple palette for all pieces (subtle differences)
const PIECE_COLORS = [
  "#a259ff", // Main purple
  "#7b337d", // Darker purple
  "#c874b2", // Light magenta/pink
  "#3d246c", // Deep indigo
  "#f5d5e0", // Soft pink-white
  "#f5f0fa", // Almost white with a purple hue
  "#5e4b8b", // Muted dark purple
  "#aea6c9", // Desaturated lilac
  "#f5e9fa", // Off-white
  "#7a4eff", // Highlight purple
  "#b7a4df", // Pale violet
];

let colorIdx = 0; // Rotate through this palette for each piece

// Helper for rotating matrices (clockwise)
const rotate = (matrix: number[][]) =>
  matrix[0].map((_, i) => matrix.map(row => row[i]).reverse());

// Helper to get all unique rotations for a piece
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

// To give each piece a consistent but neutral color:
function nextColor() {
  const color = PIECE_COLORS[colorIdx % PIECE_COLORS.length];
  colorIdx += 1;
  return color;
}

export const PIECES: Piece[] = [
  {
    id: "block3x3",
    name: "3x3 Square",
    color: nextColor(),
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
    color: nextColor(),
    matrices: getRotations([
      [1,1,1],
      [1,1,1],
    ]),
  },
  {
    id: "rect3x2",
    name: "3x2 Rectangle",
    color: nextColor(),
    matrices: getRotations([
      [1,1],
      [1,1],
      [1,1],
    ]),
  },
  {
    id: "line1x5",
    name: "1x5 Line",
    color: nextColor(),
    matrices: [
      [[1,1,1,1,1]],
      [[1],[1],[1],[1],[1]],
    ],
  },
  {
    id: "line1x4",
    name: "1x4 Line",
    color: nextColor(),
    matrices: [
      [[1,1,1,1]],
      [[1],[1],[1],[1]],
    ],
  },
  {
    id: "line4x1",
    name: "4x1 Line",
    color: nextColor(),
    matrices: [
      [[1,1,1,1]],
      [[1],[1],[1],[1]],
    ],
  },
  {
    id: "line5x1",
    name: "5x1 Line",
    color: nextColor(),
    matrices: [
      [[1,1,1,1,1]],
      [[1],[1],[1],[1],[1]],
    ],
  },
  {
    id: "square2x2",
    name: "2x2 Square",
    color: nextColor(),
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
    color: nextColor(),
    matrices: getRotations([
      [1,0],
      [1,0],
      [1,1],
    ]),
  },
  {
    id: "knightL",
    name: "Knight L",
    color: nextColor(),
    matrices: getRotations([
      [1,0,0],
      [1,1,1],
    ]),
  },
  {
    id: "l4-inverse",
    name: "L Inverse",
    color: nextColor(),
    matrices: getRotations([
      [0,1],
      [0,1],
      [1,1],
    ]),
  },
  {
    id: "s",
    name: "S",
    color: nextColor(),
    matrices: getRotations([
      [0,1,1],
      [1,1,0],
    ]),
  },
  {
    id: "z",
    name: "Z",
    color: nextColor(),
    matrices: getRotations([
      [1,1,0],
      [0,1,1],
    ]),
  },
  {
    id: "t",
    name: "T",
    color: nextColor(),
    matrices: getRotations([
      [1,1,1],
      [0,1,0],
    ]),
  },
  {
    id: "curved1",
    name: "Curved",
    color: nextColor(),
    matrices: getRotations([
      [1,1,0],
      [0,1,1],
      [0,0,1],
    ]),
  },
  {
    id: "snake",
    name: "Snake",
    color: nextColor(),
    matrices: getRotations([
      [1,0],
      [1,1],
      [0,1],
      [0,1],
    ]),
  },
];
