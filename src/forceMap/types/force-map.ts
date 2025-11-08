import type { ScaleLinear } from "d3-scale";

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
  center: { x: number; y: number };
  container: HTMLElement;
  containerDimensions: DOMRect;
  globalXScale: ScaleLinear<number, number>;
  globalYScale: ScaleLinear<number, number>;
  forceZones: ForceZone[][];
  rows: number;
  cols: number;
  updateZones: () => void;
};
