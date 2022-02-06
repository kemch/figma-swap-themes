<script>
	
	import { Button, Input, Label, SelectMenu } from 'figma-plugin-ds-svelte';
	import { themes } from './stores.js';
	import SwapPair from './SwapPair.svelte';
	export let theme;
	export let index;

	let value = theme.name;

	const themeIndex = index;
	
	function deleteTheme() {
		parent.postMessage({ pluginMessage: { 
			'type': 'deleteTheme',
			'theme': {theme, index}
		} }, '*');
	}

	function addSwapPair() {
		const swap = { from: { id: '', name: ''}, to: {id: '', name: ''}}
		$themes[index].swaps.push(swap);
		parent.postMessage({ pluginMessage: { 
			'type': 'addSwapPair',
			'theme': {theme, index}
		} }, '*');
	}

	function updateTheme() {
		theme.name = value;
		parent.postMessage({ pluginMessage: { 
			'type': 'updateThemes',
			'themes': $themes
		} }, '*');
	}
</script>

<Input bind:value={value} on:blur={updateTheme}/>
<Button variant="secondary" on:click={addSwapPair}>Add Swap Pair</Button>
<Button variant="secondary" on:click={deleteTheme}>Delete</Button>

{#each theme.swaps as swap, index}
<SwapPair theme={themeIndex} swap={swap} index={index}/>
{/each}