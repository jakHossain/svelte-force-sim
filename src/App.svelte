<script>
  import ForceMap from "$forceMap/ForceMap.svelte";
  import Bubbles from "$lib/components/Bubbles.svelte";
</script>

<div style:width="100vw" style:height="100vh">
  <ForceMap rows={3} cols={3} showZones>
    <Bubbles />
  </ForceMap>
</div>
