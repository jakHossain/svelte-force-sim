<!--
@component
This is just here to compare against imperative d3
-->
<script>
  select;
  import bubbleData from "$data/bubbleData.csv";
  import { forceCenter, forceCollide, forceSimulation } from "d3-force";
  import { scaleSqrt } from "d3-scale";
  import { select } from "d3-selection";
  import { getContext, onMount } from "svelte";
  let svg = $state();

  let maxR = -Infinity;

  const rKey = "scale";
  bubbleData.forEach((d) => {
    maxR = Math.max(maxR, d[rKey]);
    Object.keys(d).forEach((k) => {
      d[k] = +d[k];
    });
  });

  const forceMap = getContext("ForceMap");

  let rScale = $derived(
    scaleSqrt()
      .domain([0, maxR])
      .range([0, $forceMap?.containerHeight / 10])
  );

  const circleJoin = () => {
    select(svg)
      .selectAll("circle")
      .data(bubbleData)
      .join("circle")
      .attr("cx", (d) => (typeof d.x === "number" ? d.x : 0))
      .attr("cy", (d) => (typeof d.y === "number" ? d.y : 0))
      .attr("r", (d) => rScale(d[rKey]))
      .style("fill", "blue")
      .style("stroke", "white")
      .style("stroke-width", 3);
  };

  onMount(() => {
    const sim = forceSimulation(bubbleData)
      .force(
        "center",
        forceCenter($forceMap.containerCenter.x, $forceMap.containerCenter.y)
      )
      .force("collide", forceCollide((d) => rScale(d[rKey])).strength(0.02))
      .on("tick", circleJoin);

    window.addEventListener("resize", () => {
      select(svg).selectAll("circle").remove();

      // Update rScale with new container height
      rScale = scaleSqrt()
        .domain([0, maxR])
        .range([0, $forceMap.containerHeight / 10]);

      // Update center force
      sim.force(
        "center",
        forceCenter($forceMap.containerCenter.x, $forceMap.containerCenter.y)
      );

      // Update collision force
      sim.force("collide", forceCollide((d) => rScale(d[rKey])).strength(0.02));

      // Optionally reset node positions for a fresh layout:
      bubbleData.forEach((d) => {
        d.x = $forceMap.containerCenter.x;
        d.vx = $forceMap.containerCenter.x;
        d.y = $forceMap.containerCenter.y;
        d.vy = $forceMap.containerCenter.y;
      });

      console.log("something!");

      // Restart simulation with full energy
      sim.alpha(1).restart();
    });
  });
</script>

<svg bind:this={svg} class="svg-container"> </svg>

<style>
  .svg-container {
    width: 100%;
    height: 100%;
  }
</style>
