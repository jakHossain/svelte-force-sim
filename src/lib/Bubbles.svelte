<script lang="ts">
  import {
    forceCenter,
    forceCollide,
    forceManyBody,
    forceSimulation,
  } from "d3-force";
  import { getContext, untrack } from "svelte";

  import bubbleData from "$data/bubbleData.csv";
  import type { ForceMapContext, ForceZone } from "$forceMap/types/force-map";
  import { scaleSqrt } from "d3-scale";

  let maxR = -Infinity;

  const rKey = "scale";
  bubbleData.forEach((d) => {
    maxR = Math.max(maxR, d[rKey]);
    Object.keys(d).forEach((k) => {
      d[k] = +d[k];
    });
  });

  let renderNodes = $state();

  const forceMap = getContext<ForceMapContext>("ForceMap");

  let rScale = $derived(
    scaleSqrt()
      .domain([0, maxR])
      .range([0, $forceMap.containerHeight / 10])
  );

  function forceBoundary(forceZone: ForceZone, strength: number = 0.2) {
    let nodes;
    function force(alpha) {
      for (const node of nodes) {
        const radiusFactor = rScale(node[rKey]);
        if (node.x + radiusFactor > forceZone.right) {
          node.vx -=
            (node.x - forceZone.right + radiusFactor) * strength * alpha;
        }
        if (node.x - radiusFactor < forceZone.left) {
          node.vx +=
            (forceZone.left - node.x + radiusFactor) * strength * alpha;
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

    force.initialize = (_) => (nodes = _);
    return force;
  }

  let simulation = $derived.by(() => {
    return () => {
      //doing a deeper copy allows force simulation to fully reset on a resize
      const cleanData = bubbleData.map((d) => {
        return { ...d };
      });

      return forceSimulation(cleanData)
        .force(
          "center",
          forceCenter($forceMap.containerCenter.x, $forceMap.containerCenter.y)
        )
        .force("charge", forceManyBody().strength(-50))
        .force("boundary", forceBoundary($forceMap.forceZones[1][1], 1))
        .on("tick", () => {
          renderNodes = [...cleanData];
        });
    };
  });

  $effect(() => {
    simulation();
  });
</script>

<svg class="svg-container">
  <g>
    {#each renderNodes as node}
      {@const nodeItem = node as { x: number; y: number; [rKey]: number }}
      <circle
        cx={nodeItem.x}
        cy={nodeItem.y}
        r={rScale(nodeItem[rKey])}
        stroke="white"
        stroke-width="3"
        fill="green"
      ></circle>
    {/each}
  </g>
</svg>

<style>
  .svg-container {
    width: 100%;
    height: 100%;
  }
</style>
