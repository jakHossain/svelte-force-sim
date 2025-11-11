<script lang="ts">
  import { forceCenter, forceManyBody, forceSimulation } from "d3-force";
  import { getContext } from "svelte";

  import bubbleData from "$data/bubbleData.csv";
  import { zoneBoundaryForce } from "$forceMap/ForceState.svelte";
  import type {
    ForceMapContext,
    ForceNodeData,
  } from "$forceMap/types/force-map";
  import { scaleSqrt } from "d3-scale";

  type NodeData = {
    x: number;
    y: number;
    [rKey]: number;
    vx: number;
    vy: number;
  };

  let maxR = -Infinity;

  const rKey = "scale";
  bubbleData.forEach((d) => {
    maxR = Math.max(maxR, d[rKey]);
    Object.keys(d).forEach((k) => {
      d[k] = +d[k];
    });
  });

  let renderNodes = $state<NodeData[]>();

  const forceMap = getContext<ForceMapContext>("ForceMap");

  let rScale = $derived(
    scaleSqrt()
      .domain([0, maxR])
      .range([0, $forceMap.forceZones[1][1].height / 4])
  );

  let simulation = $derived.by(() => {
    return () => {
      //doing a deeper copy allows force simulation to fully reset on a resize
      const cleanData = bubbleData.map((d: NodeData) => {
        return { ...d };
      });

      return forceSimulation(cleanData)
        .force(
          "center",
          forceCenter($forceMap.containerCenter.x, $forceMap.containerCenter.y)
        )
        .force("charge", forceManyBody().strength(-50))
        .force(
          "boundary",
          $forceMap.zoneBoundaryForce($forceMap.forceZones[1][1], 1, (d) => {
            let nodeData = d as ForceNodeData;
            return rScale(nodeData[rKey] as number);
          })
        )
        .on("tick", () => {
          renderNodes = [...cleanData];
        });
    };
  });

  $effect(() => {
    simulation();
  });
</script>

<g>
  {#each renderNodes as node}
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
