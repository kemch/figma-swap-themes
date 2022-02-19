<script>
	import {themes, localStyles} from './stores.js';
	
	import Theme from './Theme.svelte';

</script>

{#each $themes as theme, index (theme.id)}
	<Theme theme={theme} index={index} />
{/each}