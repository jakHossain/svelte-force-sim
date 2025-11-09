import type { ForceMapState, ForceZone } from "$forceMap/types/force-map";
import { writable } from "svelte/store";

/**
 * Initializes a ForceMap state store for a given container element and grid size.
 * Calculates initial zones and container metadata.
 *
 * @param {HTMLElement} node - The container element for the force map.
 * @param {number} zoneCols - Number of columns in the grid (must be ≥ 1).
 * @param {number} zoneRows - Number of rows in the grid (must be ≥ 1).
 * @throws {Error} If node is not provided, or if zoneCols/zoneRows are less than 1.
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
 * Each zone's width/height is equalized based on the container width/height and the number of columns/rows
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
