import type { initForceMap } from "$forceMap/ForceState.svelte";
import type { ScaleLinear } from "d3-scale";
import type { Subscriber } from "svelte/store";

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
};

export type ForceMapContext = ReturnType<typeof initForceMap>;
