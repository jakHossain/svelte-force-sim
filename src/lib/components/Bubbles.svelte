<script>
  import { forceCenter, forceSimulation } from "d3-force";
  let nodes = $state([]);

  const simulation = forceSimulation(nodes).force("center", forceCenter());
</script>

{#each nodes as node}{/each}
