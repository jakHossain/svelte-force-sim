import type {
  ForceMapState,
  ForceNodeData,
  ForceZone,
} from "$forceMap/types/force-map";
import { writable } from "svelte/store";

/**
 * Initializes a ForceMap state store for a given container element and grid size.
 * Calculates initial zone boundaries and container metadata.
 *
 * @param {HTMLElement} node - The container element for the force map.
 * @param {number} zoneCols - Number of columns in the grid (must be ≥ 1).
 * @param {number} zoneRows - Number of rows in the grid (must be ≥ 1).
 * @throws {Error} If node is not provided, or if zoneCols/zoneRows are less than 1.
 * @returns {{
 *   subscribe: import("svelte/store").Subscriber<ForceMapState>,
 *   updateForceMap: (rows?: number, cols?: number) => void
 * }} Svelte store API for subscribing to state and updating grid size.
 */
export const initForceMap = (
  node: HTMLElement,
  zoneCols: number,
  zoneRows: number
) => {
  if (!node) {
    throw new Error(
      "ForceMap: Node should be initialized before force map generation!"
    );
  }

  if (zoneCols < 1) {
    throw new Error(
      "ForceMap: Column count for force map should be greater than 0!"
    );
  }

  if (zoneRows < 1) {
    throw new Error(
      "ForceMap: Row count for force map should be greater than 0!"
    );
  }

  const containerDimensions = node.getBoundingClientRect();

  const initZones = createZones(
    containerDimensions.width,
    containerDimensions.height,
    zoneCols,
    zoneRows
  );

  const { subscribe, update } = writable<ForceMapState>({
    container: node,
    containerWidth: containerDimensions.width,
    containerHeight: containerDimensions.height,
    containerCenter: {
      x: containerDimensions.width / 2,
      y: containerDimensions.height / 2,
    },
    forceZones: initZones,
    rows: zoneRows,
    cols: zoneCols,
    zoneBoundaryForce,
  });

  const updateForceMap = (rows?: number, cols?: number) => {
    update((prev) => {
      let newCols = cols ? cols : prev.cols;
      let newRows = rows ? rows : prev.rows;

      const { width, height } = prev.container.getBoundingClientRect();
      const newCenter = { x: width / 2, y: height / 2 };
      const newZones = createZones(width, height, newCols, newRows);

      return {
        ...prev,
        containerWidth: width,
        containerHeight: height,
        containerCenter: newCenter,
        forceZones: newZones,
        rows: newRows,
        cols: newCols,
      };
    });
  };

  return {
    subscribe,
    updateForceMap,
  };
};

/**
 * Calculates a 2D array of ForceZone objects representing grid zones
 * for the given container dimensions and grid size.
 *
 * Each zone's width and height are determined by dividing the container's width and height
 * by the number of columns and rows, respectively, ensuring all zones are equal-sized.
 *
 * @param {number} containerWidth - Width of the container in pixels.
 * @param {number} containerHeight - Height of the container in pixels.
 * @param {number} cols - Number of columns in the grid (must be ≥ 1).
 * @param {number} rows - Number of rows in the grid (must be ≥ 1).
 * @returns {ForceZone[][]} 2D array of ForceZone objects.
 * @throws {Error} If container dimensions are zero or negative, or if rows/cols are less than 1.
 */
const createZones = (
  containerWidth: number,
  containerHeight: number,
  cols: number,
  rows: number
) => {
  if (containerWidth <= 0 || containerHeight <= 0) {
    throw new Error("ForceMap: Force map container has 0 width/or height!");
  }
  if (rows < 1 || cols < 1) {
    throw new Error(
      "ForceMap: ForceMaps must have at least 1 row AND column(s)"
    );
  }

  const zoneWidth = containerWidth / cols;
  const zoneHeight = containerHeight / rows;

  return Array.from({ length: rows }, (_, row): ForceZone[] =>
    Array.from({ length: cols }, (_, col): ForceZone => {
      let left = col * zoneWidth;
      let right = left + zoneWidth;
      let top = row * zoneHeight;
      let bottom = top + zoneHeight;
      let center = {
        x: left + zoneWidth / 2,
        y: top + zoneHeight / 2,
      };

      return {
        left,
        right,
        bottom,
        top,
        width: zoneWidth,
        height: zoneHeight,
        center,
      };
    })
  );
};

/**
 * Creates a custom force for d3-force simulations that keeps nodes within the bounds of a specified ForceZone.
 *
 * The force applies a velocity adjustment to nodes that move outside the zone boundaries, nudging them back inside.
 * The adjustment is proportional to the distance from the boundary, the specified strength, and the simulation's alpha.
 *
 * @param {ForceZone} forceZone - The zone boundary to constrain nodes within. See `$forceMap/types/force-map.ts` for definition.
 * @param {number} [strength=0.2] - Magnitude of the applied force. Higher values (>2) may cause unpredictable behavior.
 * @param {number|function} [radius=0] - Either a fixed number or a function `(node) => number` to determine a radius offset for boundary collision checks.
 * @returns {function} A d3-force compatible force function.
 */
export function zoneBoundaryForce(
  forceZone: ForceZone,
  strength: number = 0.2,
  radius: number | ((node: ForceNodeData) => number) = 0
) {
  let nodes: ForceNodeData[];
  function force(alpha: number) {
    for (const node of nodes) {
      const radiusFactor = typeof radius === "function" ? radius(node) : radius;
      if (node.x + radiusFactor > forceZone.right) {
        node.vx -= (node.x - forceZone.right + radiusFactor) * strength * alpha;
      }
      if (node.x - radiusFactor < forceZone.left) {
        node.vx += (forceZone.left - node.x + radiusFactor) * strength * alpha;
      }
      if (node.y + radiusFactor > forceZone.bottom) {
        node.vy -=
          (node.y - forceZone.bottom + radiusFactor) * strength * alpha;
      }
      if (node.y - radiusFactor < forceZone.top) {
        node.vy += (forceZone.top - node.y + radiusFactor) * strength * alpha;
      }
    }
  }

  force.initialize = (_: ForceNodeData[]) => (nodes = _);
  return force;
}
