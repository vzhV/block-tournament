import { Piece } from "../types/piece";
import theme from "../theme";
import {PaletteColor, SimplePaletteColorOptions} from "@mui/material";

const getColor = (key: keyof typeof theme.palette): string => {
  const entry = theme.palette[key];
  if (
    entry &&
    typeof entry === "object" &&
    "main" in entry &&
    typeof (entry as PaletteColor | SimplePaletteColorOptions).main === "string"
  ) {
    return (entry as PaletteColor | SimplePaletteColorOptions).main;
  }
  // fallback if palette key doesn't have main color
  return "#335C67";
};

// Helper for rotating matrices (clockwise)
const rotate = (matrix: number[][]) =>
  matrix[0].map((_, i) => matrix.map(row => row[i]).reverse());

// Helper to get all unique rotations for a piece
function getRotations(base: number[][]): number[][][] {
  const rotations = [base];
  let prev = base;
  for (let i = 0; i < 3; i++) {
    prev = rotate(prev);
    // Only add if not duplicate of an existing rotation
    if (!rotations.some(m =>
      JSON.stringify(m) === JSON.stringify(prev)
    )) {
      rotations.push(prev);
    }
  }
  return rotations;
}

export const PIECES: Piece[] = [
  // 3x3 filled block
  {
    id: "block3x3",
    name: "3x3 Square",
    color: getColor("primary"),
    matrices: [
      [
        [1,1,1],
        [1,1,1],
        [1,1,1],
      ],
    ],
  },

  // 2x3 rectangle
  {
    id: "rect2x3",
    name: "2x3 Rectangle",
    color: getColor("secondary"),
    matrices: getRotations([
      [1,1,1],
      [1,1,1],
    ]),
  },

  // 3x2 rectangle
  {
    id: "rect3x2",
    name: "3x2 Rectangle",
    color: getColor("secondary"),
    matrices: getRotations([
      [1,1],
      [1,1],
      [1,1],
    ]),
  },

  // 1x5 line (horizontal, vertical)
  {
    id: "line1x5",
    name: "1x5 Line",
    color: getColor("info"),
    matrices: [
      [[1,1,1,1,1]],
      [[1],[1],[1],[1],[1]],
    ],
  },

  // 1x4 line (horizontal, vertical)
  {
    id: "line1x4",
    name: "1x4 Line",
    color: getColor("warning"),
    matrices: [
      [[1,1,1,1]],
      [[1],[1],[1],[1]],
    ],
  },

  // 4x1 line (same as above)
  {
    id: "line4x1",
    name: "4x1 Line",
    color: getColor("warning"),
    matrices: [
      [[1,1,1,1]],
      [[1],[1],[1],[1]],
    ],
  },

  // 5x1 line (same as 1x5)
  {
    id: "line5x1",
    name: "5x1 Line",
    color: getColor("info"),
    matrices: [
      [[1,1,1,1,1]],
      [[1],[1],[1],[1],[1]],
    ],
  },

  // 2x2 small square
  {
    id: "square2x2",
    name: "2x2 Square",
    color: getColor("success"),
    matrices: [
      [
        [1,1],
        [1,1],
      ],
    ],
  },

  // Classic L shape (like 1x3 with 1 to the right at the bottom)
  {
    id: "l4",
    name: "L",
    color: getColor("error"),
    matrices: getRotations([
      [1,0],
      [1,0],
      [1,1],
    ]),
  },

  // L-shape variant (like a knight move)
  {
    id: "knightL",
    name: "Knight L",
    color: getColor("secondary"),
    matrices: getRotations([
      [1,0,0],
      [1,1,1],
    ]),
  },

  // Inverse L shape
  {
    id: "l4-inverse",
    name: "L Inverse",
    color: getColor("error"),
    matrices: getRotations([
      [0,1],
      [0,1],
      [1,1],
    ]),
  },

  // S shape (zigzag)
  {
    id: "s",
    name: "S",
    color: getColor("warning"),
    matrices: getRotations([
      [0,1,1],
      [1,1,0],
    ]),
  },

  // Z shape
  {
    id: "z",
    name: "Z",
    color: getColor("primary"),
    matrices: getRotations([
      [1,1,0],
      [0,1,1],
    ]),
  },

  // T shape
  {
    id: "t",
    name: "T",
    color: getColor("secondary"),
    matrices: getRotations([
      [1,1,1],
      [0,1,0],
    ]),
  },

  // "Curved" S-shaped piece (weird block)
  {
    id: "curved1",
    name: "Curved",
    color: getColor("success"),
    matrices: getRotations([
      [1,1,0],
      [0,1,1],
      [0,0,1],
    ]),
  },

  // "Weird" snake shape
  {
    id: "snake",
    name: "Snake",
    color: getColor("info"),
    matrices: getRotations([
      [1,0],
      [1,1],
      [0,1],
      [0,1],
    ]),
  },
];
