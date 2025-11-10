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
  import { onMount, setContext, untrack } from "svelte";
  import { debounce } from "$utils/helpers";
  import { initForceMap } from "$forceMap/ForceState.svelte";

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

  let forceMapState = $state<ReturnType<typeof initForceMap>>();

  onMount(() => {
    forceMapState = initForceMap(node!, cols, rows);
    setContext("ForceMap", forceMapState);
  });

  let debouncedResizer = $derived(
    debounce(() => {
      forceMapState?.updateForceMap(rows, cols);
    }, 75)
  );

  let resizeObs = $state<ResizeObserver>();

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
</script>

<div bind:this={node} class="force-map-layer">
  <!-- Only render child elements if zones are ready -->
  {#if forceMapState}
    {#if children}
      {@render children()}
    {/if}
    {#if showZones}
      {#each $forceMapState?.forceZones as zoneRow, rowNum}
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
