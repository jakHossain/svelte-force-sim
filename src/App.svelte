<script>
  import ForceMap from "$forceMap/ForceMap.svelte";
  import Bubbles from "$lib/Bubbles.svelte";
  import BubblesTest from "$lib/BubblesTest.svelte";
</script>

<div style:width="100vw" style:height="100vh">
  <ForceMap rows={3} cols={3} showZones>
    <svg class="svg-container">
      <Bubbles />
    </svg>
  </ForceMap>
</div>

<style>
  .svg-container {
    width: 100%;
    height: 100%;
  }
</style>
