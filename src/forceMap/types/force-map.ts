import type {
  initForceMap,
  zoneBoundaryForce,
} from "$forceMap/ForceState.svelte";

export type ForceZone = {
  left: number;
  right: number;
  top: number;
  bottom: number;
  width: number;
  height: number;
  center: { x: number; y: number };
};

export type ForceMapState = {
  container: HTMLElement;
  containerWidth: number;
  containerHeight: number;
  containerCenter: { x: number; y: number };
  forceZones: ForceZone[][];
  rows: number;
  cols: number;
  zoneBoundaryForce: typeof zoneBoundaryForce;
};

export type ForceMapContext = ReturnType<typeof initForceMap>;

export type ForceNodeData = {
  [key: string]: number | string;
  x: number;
  y: number;
  vx: number;
  vy: number;
};
