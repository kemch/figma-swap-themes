<script>
	
	import { Button, Input, IconButton, Icon, IconAdjust, IconBack, Label, SelectMenu } from 'figma-plugin-ds-svelte';
	import { themes } from './stores.js';
	import SwapPair from './SwapPair.svelte';
	export let theme;
	export let index;

	let editing = false;
	let value = theme.name;
	const themeIndex = index;


	// onmessage = async (event) => {
	// 	if (event.data.pluginMessage.editNew) {
	// 		console.log(event)
	// 	}
	// }

	function deleteTheme() {
		parent.postMessage({ pluginMessage: { 
			'type': 'deleteTheme',
			'theme': {theme, index}
		} }, '*');
		parent.postMessage({ pluginMessage: { 
			'type': 'resizeUI',
			'size': {width:320,height:400}
		} }, '*');
		editing = !editing;
	}

	function addSwapPair() {
		const swap = {
			from: { id: '', name: '', key: '', remote: false},
			to: {id: '', name: '', key: '', remote: false}
		}
		$themes[index] = theme;
		$themes[index].swaps.push(swap);
		parent.postMessage({ pluginMessage: { 
			'type': 'addSwapPair',
			'theme': {theme, index}
		} }, '*');
	}

	function addSwapPairFromSelection() {
		$themes[index] = theme;
		parent.postMessage({ pluginMessage: { 
			'type': 'addSwapPairFromSelection',
			'theme': {theme, index}
		} }, '*');
	}

	function updateTheme() {
		$themes[index] = theme;
		theme.name = value;
		parent.postMessage({ pluginMessage: { 
			'type': 'updateThemes',
			'themes': $themes
		} }, '*');
	}

	function applyTheme() {
		parent.postMessage({ pluginMessage: { 
			'type': 'applyTheme',
			'theme': {theme, index}
		} }, '*');
	}

	function editTheme() {
		editing = !editing;
		if (editing) {
			parent.postMessage({ pluginMessage: { 
				'type': 'loadStylesInThemeEdit',
				'theme': {theme, index}
			} }, '*');
			parent.postMessage({ pluginMessage: { 
				'type': 'resizeUI',
				'size': {width:500,height:400}
			} }, '*');

		} else {
			parent.postMessage({ pluginMessage: { 
				'type': 'resizeUI',
				'size': {width:320,height:400}
			} }, '*');
		}
	}
</script>

<div class="theme" on:click|self={applyTheme} role="button">
	{value}
	<div class="theme__actions">
		<IconButton iconName={IconAdjust} on:click={editTheme} />
	</div>
</div>
{#if editing}
	<div class="theme-edit">
		<div class="header">
			<div class="header__left">
				<IconButton iconName={IconBack} on:click={editTheme}/>
				<div class="header__title">
					<input type="text" class="theme__field__name" bind:value="{value}" on:blur={updateTheme}>
				</div>
			</div>
			<div class="header__right">
				<Button variant="tertiary" on:click={applyTheme}>Apply Theme</Button>
			</div>
		</div>
		<div class="theme-edit__content">

			<div class="swaps__heading">
				<div class="swaps__heading__from">From:<div class="swaps__heading__icon">⇆</div></div>
				<div class="swaps__heading__to">To:</div>
			</div>

			{#each theme.swaps as swap, index}
			<SwapPair theme={themeIndex} swap={swap} index={index}/>
			{/each}
			<Button variant="secondary" on:click={addSwapPair}>Add Swap Pair</Button>

			<br><br><br>
			<Button variant="secondary" on:click={addSwapPairFromSelection}>Add Swap Pair From Selection</Button>
			<Button variant="secondary" on:click={deleteTheme}>Delete</Button>
		</div>
	</div>
{/if}

<style>
	.theme {
		display: flex;
		font-size:  14px;
		padding: 8px 0px 8px 16px;
		margin: 0px -16px 0px -16px;
		align-items: center;
		cursor: pointer;
		min-height: 48px;
	}
	.theme:hover {
		background-color: #E8F6FF;
	}

	.theme:hover .theme__actions {
		display: flex;
	}
	.theme__actions {
		display: none;
		margin-left:  auto;
		text-align:  right;
		
	}
	.theme-edit {
		position: absolute;
		top:  0;
		left:  0;
		right: 0;
		bottom: 0;
		/*width: 100%;*/
		height: 100%;
		background-color:  white;
		overflow-y:  auto;
		
	}

	.header {
		display:  flex;
		align-items:  center;
		padding:  8px;
		background-color: white;
		margin: 0px 0px 0px -24px;
	}
	.header__left {
		font-size:  12px;
		font-weight: 700;
		padding-left:  16px;
		display:  flex;
		align-items:  center;
	}
	.header__title {
		margin-left: 8px;
	}
	.header__right {
		margin-left:  auto;
		text-align:  right;
	}
	.theme-edit__content {
		padding:  0px 16px;
		/*display: flex;*/
		flex:  1 1 100%;
		width:  100%;
	}
	.swaps__heading {
		font-size:  11px;
		display: flex;
		align-items: center;
		min-height: 32px;
	}
	.swaps__heading__to,
	.swaps__heading__from {
		position:  relative;
		display: flex;
		flex:  1 1 100%;
		width:  100%;
		margin-right:  10px;
	}
	.swaps__heading__icon {
		margin-left:  auto;
		text-align: right;
	}
	.swaps__heading__to {}
	.theme__field__name {
		display: flex;
		flex:  1 1 100%;
		background-color:  white;
		font-size:  14px;
		border:  0;

	}
	:global(.theme__field__name > input) {
		background-color:  #fafafa !important;
		border:  1px solid #f2f2f2 !important;
	}
</style>







