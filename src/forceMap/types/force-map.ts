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
  containerDimensions: DOMRect;
  forceZones: ForceZone[][];
};
