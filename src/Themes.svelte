<script>
	import {themes, localStyles} from './stores.js';
	
	import Theme from './Theme.svelte';

</script>

{#each $themes as theme, index}
	<Theme theme={theme} index={index} />
{/each}