<script lang="ts">
  import {
    forceCenter,
    forceCollide,
    forceManyBody,
    forceSimulation,
  } from "d3-force";
  import { getContext, untrack } from "svelte";

  import bubbleData from "$data/bubbleData.csv";
  import type {
    ForceMapContext,
    ForceMapState,
  } from "$forceMap/types/force-map";
  import { scaleSqrt } from "d3-scale";

  let maxR = -Infinity;

  const rKey = "scale";
  bubbleData.forEach((d) => {
    maxR = Math.max(maxR, d[rKey]);
    Object.keys(d).forEach((k) => {
      d[k] = +d[k];
    });
  });

  let nodes = $state();

  const forceMap = getContext<ForceMapContext>("ForceMap");

  let rScale = $derived(
    scaleSqrt()
      .domain([0, maxR])
      .range([0, $forceMap.containerHeight / 10])
  );

  let simulation = $derived(
    forceSimulation(bubbleData)
      .alphaTarget(0.3)
      .velocityDecay(0.1)
      .force(
        "center",
        forceCenter(
          $forceMap.containerCenter.x,
          $forceMap.containerCenter.y
        ).strength(1)
      )
      .force("collide", forceCollide((d) => rScale(d[rKey])).strength(0.008))
      .on("tick", () => {
        nodes = [...bubbleData];
      })
      .stop()
  );

  $effect(() => {
    console.log("rscale updated!", rScale);
  });

  $effect(() => {
    if (simulation) {
      console.log("simulation updated!", rScale);
    }

    untrack(() => {
      simulation.restart();
    });
  });
</script>

<svg class="svg-container">
  <g>
    {#each nodes as node}
      <circle
        cx={node.x}
        cy={node.y}
        r={rScale(node[rKey])}
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
