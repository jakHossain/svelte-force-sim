<!--
  @component ForceMap

  Divides its container into a grid of equal-sized zones, recalculating on resize.
  Optionally renders a visual overlay of the grid for debugging or UI purposes.
  Designed for extensibility and future library use.

  - `children` (Snippet, optional): Svelte snippet to render when zones are ready.
  - `rows` (number): Number of grid rows (must be ≥ 1).
  - `cols` (number): Number of grid columns (must be ≥ 1).
  - `showZones` (boolean, optional): If true, displays a visual overlay of the grid zones.

-->
<script lang="ts">
  import type { Snippet } from "svelte";
  import { untrack } from "svelte";
  import { debounce } from "$utils/helpers";
  import type { ForceZone } from "$forceMap/types/force-map";

  type ForceMapProps = {
    children?: Snippet;
    rows: number;
    cols: number;
    showZones?: boolean;
  };

  let {
    children,
    rows = 1,
    cols = 1,
    showZones = false,
  }: ForceMapProps = $props();

  let node: HTMLDivElement | null = $state(null);
  let containerDimensions = $state<DOMRect | null>(null);

  let debouncedResizer = $derived(
    debounce(() => {
      containerDimensions = node ? node.getBoundingClientRect() : null;
    }, 50)
  );

  let resizeObs: ResizeObserver | null = $state(null);

  $effect(() => {
    if (!debouncedResizer || !node) return;

    //untrack prevents reconfiguring the resizeObs from triggering an infinite loop
    untrack(() => {
      if (resizeObs) {
        resizeObs.disconnect();
      }
      resizeObs = new ResizeObserver(debouncedResizer);
      resizeObs.observe(node as Element);
    });

    return () => {
      resizeObs?.disconnect();
    };
  });

  let forceZones: null | ForceZone[][] = $derived.by(() => {
    //do not generate zones if dimensions are undefined or 0
    if (!containerDimensions) {
      return null;
    }
    if (containerDimensions.width < 0 || containerDimensions.height < 0) {
      return null;
    }
    if (rows < 1 || cols < 1) {
      throw new Error("ForceMaps must have at least 1 row AND column(s)");
    }

    const zoneWidth = containerDimensions.width / cols;
    const zoneHeight = containerDimensions.height / rows;

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
  });
</script>

<div bind:this={node} class="force-map-layer">
  <!-- Only render child elements if zones are ready -->
  {#if forceZones}
    {#if children}
      {@render children()}
    {/if}
    {#if showZones}
      {#each forceZones as zoneRow, rowNum}
        {#each zoneRow as zone, colNum}
          <div
            class="force-zone"
            style="
              left:{zone.left}px;
              top:{zone.top}px;
              width:{zone.width}px;
              height:{zone.height}px;
            "
          ></div>
        {/each}
      {/each}
    {/if}
  {/if}
</div>

<style>
  .force-map-layer {
    position: relative;
    height: 100%;
    width: 100%;
  }

  .force-zone {
    box-sizing: border-box;
    position: absolute;
    background-color: rgba(40, 40, 220, 0.2);
    border: 1px solid black;
  }
</style>
