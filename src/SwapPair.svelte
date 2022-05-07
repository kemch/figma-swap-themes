<script>
	import { themes } from './stores.js';
	import { Button, Input, Label, SelectMenu, IconClose, Icon, IconButton } from 'figma-plugin-ds-svelte';
	import StylesMenu from './StylesMenu.svelte';
	import SvgIcon from './SvgIcon.svelte';
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
		<IconButton iconName={IconClose} on:click={deleteSwapPair}/>
	</div>
</div>

<style>
	.swap {
		display:  flex;
		flex:  1 1 100%;
		width:  100%;
		align-items:  center;
		border-bottom:  1px solid transparent;
		border-top:  1px solid transparent;

	}
	.swap:hover {
		border-top: 1px solid  #f0f0f0;
		border-bottom: 1px solid  #f0f0f0;
	}
	.swap:hover .swap__options {
		visibility: visible;
	}
	.swap__from,
	.swap__to {
		position:  relative;
		display: flex;
		flex:  1 1 100%;
		width:  100%;
		margin-right:  4px;
	}


	.swap__options {
		visibility: hidden;

	}
</style>
