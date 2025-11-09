<script>
  import { forceCenter, forceSimulation } from "d3-force";
  import { getContext } from "svelte";
  let nodes = $state([]);

  const forceMap = getContext("ForceMap");
  $inspect($forceMap);
</script>

{#each nodes as node}{/each}
