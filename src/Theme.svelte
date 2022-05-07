<script>
	
	import { Button, Input, IconButton, Icon, IconAdjust, IconBack, Label, SelectMenu, OnboardingTip, IconTheme } from 'figma-plugin-ds-svelte';
	import {onMount} from 'svelte';
	import { themes, newTheme } from './stores.js';
	import SwapPair from './SwapPair.svelte';
	import SvgIcon from './SvgIcon.svelte';
	import Dropdown from 'sv-bootstrap-dropdown';

	export let theme;
	export let index;
	let dropdownTrigger;

	let blobUrl;
	let download;
	let editing = false;
	let value = theme.name;
	const themeIndex = index;

	let prepareJson = async () => {
		let blobConfig = new Blob(
		    [ JSON.stringify([theme]) ], 
		    { type: 'text/json;charset=utf-8' }
		)
		blobUrl = URL.createObjectURL(blobConfig)
	}

	async function exportTheme() {
		await prepareJson().then((value)=>(download.click()))
	}

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
		if ($newTheme) {
			editing = true;
			$newTheme = false;	
		}
		editing = !editing;
		if (editing) {
			parent.postMessage({ pluginMessage: { 
				'type': 'loadStylesInThemeEdit',
				'theme': {theme, index}
			} }, '*');
			parent.postMessage({ pluginMessage: { 
				'type': 'resizeUI',
				'size': {width:380,height:400}
			} }, '*');

		} else {
			parent.postMessage({ pluginMessage: { 
				'type': 'resizeUI',
				'size': {width:320,height:400}
			} }, '*');
		}
	}

	function buildThemeOnCanvas() {
		parent.postMessage({ pluginMessage: { 
			'type': 'buildThemeOnCanvas',
			'theme': theme,
		} }, '*');
	}

	function duplicateTheme() {
		editing = false;
		parent.postMessage({ pluginMessage: { 
			'type': 'duplicateTheme',
			'theme': theme,
		} }, '*');
	}

	onMount(function(){
		if (typeof $newTheme != 'undefined') {
			if ($newTheme.id == theme.id) {
				editing = true;
			}
		}
	})

</script>

<div class="theme" on:click|self={applyTheme} role="button">
	{value}
	<div class="theme__actions">
		<IconButton iconName={IconAdjust} on:click={editTheme} />
		
	</div>
</div>
{#if editing || ($newTheme === themeIndex)}
	<div class="theme-edit">
		<div class="header">
			<div class="header__left">
				<IconButton iconName={IconBack} on:click={editTheme}/>
				<div class="header__title">
					Edit Theme
				</div>
			</div>
			<div class="header__right">
				<a class="export-link" bind:this={download} href={blobUrl} target="_blank" download={`${value}.json`}>click</a>
				<Dropdown triggerElement={dropdownTrigger}>
					<button
					    type="button"
					    class="btn btn-secondary icon-button"
					    bind:this={dropdownTrigger}
					    >
					    <SvgIcon icon="dots"/>
					</button>
					<div slot="DropdownMenu">
					    <a class="dropdown-item" href="#" on:click={applyTheme}>Apply Theme to Selection</a>
					    <a class="dropdown-item" href="#" on:click={buildThemeOnCanvas}>Build Theme on Canvas</a>
					    <a class="dropdown-item" href="#" on:click={exportTheme}>Export Theme</a>
					    <a class="dropdown-item" href="#" on:click={duplicateTheme}>Duplicate</a>
					    <a class="dropdown-item" href="#" on:click={deleteTheme}>Delete</a>
					</div>
				</Dropdown>
			</div>
		</div>
		<div class="theme-edit__content">

			<div class="theme__name-edit">
				<input type="text" class="theme__field__name" bind:value="{value}" on:blur={updateTheme}>
			</div>
			<div class="swap__actions">
				<button class="btn btn-primary" on:click={addSwapPair}>Add Swap Pair</button>
				<button class="btn btn-secondary" on:click={addSwapPairFromSelection}>Add Swap Pair From Selection</button>
				
			</div>
			{#if theme.swaps.length}
				<div class="swaps__heading">
					<div class="swaps__heading__from">From</div>
					<div class="swaps__heading__to">To</div>
				</div>

				{#each [...theme.swaps].reverse() as swap, index (swap.id)}
				<SwapPair theme={themeIndex} swap={swap} index={index}/>
				{/each}
			{:else}
				<div class="swaps__empty">
					Add pairs of styles to swap to and from. For team libraries, you must be in the team library document to add styles.
				</div>
			{/if}


		
		</div>
	</div>
{/if}

<style>
	.theme {
		display: flex;
		font-size:  12px;
		font-weight:  500;
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
	.theme__field__name {
		/*border:  1px solid var(--black3-opaque);*/
		width:  100%;
		display: flex;
		/*padding:  4px 2px;*/
		padding-left:  4px;
		min-height: 32px;
		border-radius:  3px;
		font-size:  11px;
		background-color:  #FAFAFA;
		margin-bottom: 16px;
	}
	.swap__actions {
		margin-top:  24px;
		margin-bottom:  24px;
		display: flex;
		align-items:  center;
	}
	.swaps__empty {
		color:  #565656;
		font-size:  11px;
		padding-top:  16px;
		padding-top:  20px;
	}
	:global(.swap__actions .btn) {
		margin-right: 16px;
	}
	:global(.theme__field__name > input) {
		background-color:  #fafafa !important;
		border:  1px solid #f2f2f2 !important;
	}
</style>







