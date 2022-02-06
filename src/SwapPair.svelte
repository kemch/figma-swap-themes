<script>
	import { themes, localStyles } from './stores.js';
	import { Button, Input, Label, SelectMenu } from 'figma-plugin-ds-svelte';
	import StylesMenu from './StylesMenu.svelte';

	export let theme;
	export let swap;
	export let index;

	function deleteSwapPair() {
		$themes[theme].swaps.splice(index, 1);
		parent.postMessage({ pluginMessage: { 
			'type': 'deleteSwapPair',
			'theme': theme,
			'swap': {swap, index}
		} }, '*');
	}

</script>

<div class="swap">
	<div class="swap__from">
		<StylesMenu theme={theme} direction={'from'} style={swap.from} />
	</div>
	<div class="swap__to">
		<StylesMenu theme={theme} direction={'to'} style={swap.to} />
	</div>
	<div class="swap__options">
		<Button variant="secondary" on:click={deleteSwapPair}>&times;</Button>
	</div>
</div>

<style>
	.swap {
		display:  flex;

	}
	.swap__from,
	.swap__to {
		/*width:  40%;*/
		width:  auto;
		margin:  10px;
	}

	.swap__options {
		/*flex:  0 0 100%;*/
	}
</style>
