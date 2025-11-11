<script lang="ts">
  import { forceCenter, forceCollide, forceSimulation } from "d3-force";
  import { getContext } from "svelte";

  import bubbleData from "$data/bubbleData.csv";
  import type { ForceMapContext } from "$forceMap/types/force-map";
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
        .force(
          "collide",
          forceCollide((d) => rScale(d[rKey] * 1.1)).strength(0.05)
        )
        .on("tick", () => {
          nodes = [...cleanData];
        });
    };
  });

  $effect(() => {
    nodes = [];

    simulation();
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
