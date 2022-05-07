<script>

	import {themes, localStyles, newTheme} from './stores.js';
	import { GlobalCSS } from 'figma-plugin-ds-svelte';
	import { Button, Input, Label, SelectMenu, IconButton, Icon, IconPlus, IconTheme, OnboardingTip } from 'figma-plugin-ds-svelte';
  	import Dropdown from 'sv-bootstrap-dropdown';

	import Themes from './Themes.svelte';
	import SvgIcons from './Icons.svelte';
	import SvgIcon from './SvgIcon.svelte';
  	import Import from './Import.svelte';

  	import GlobalStyles from './GlobalStyles.svelte';

	let blobUrl;
	let download;

	let viewImport = false;

	let dropdownTrigger;
	onmessage = async (event) => {
		if (event.data.pluginMessage.localStylesFetched) {
			$localStyles = event.data.pluginMessage.localStylesFetched.localStyles;
			console.log($localStyles)
		}
		if (event.data.pluginMessage.themes) {
			$themes = event.data.pluginMessage.themes;
			console.log($themes)
		}
		if (event.data.pluginMessage.editNew) {
			$newTheme = event.data.pluginMessage.editNew
			console.log($newTheme)
		}
	}

	function addNewTheme() {
		parent.postMessage({ pluginMessage: { 
			'type': 'addNewTheme'
		} }, '*');
		parent.postMessage({ pluginMessage: { 
			'type': 'resizeUI',
			'size': {width:380,height:400}
		} }, '*');
	}
	let prepareJson = async () => {
		let blobConfig = new Blob(
		    [ JSON.stringify($themes) ], 
		    { type: 'text/json;charset=utf-8' }
		)
		blobUrl = URL.createObjectURL(blobConfig)
	}

	async function exportThemes() {
		await prepareJson().then((value)=>(download.click()))
	}

	function toggleImportView(event) {
		viewImport = !viewImport;
	}
	
</script>
<GlobalStyles />
<SvgIcons />
<div id="view">
	<a class="export-link" bind:this={download} href={blobUrl} target="_blank" download="export.json">click</a>
	
	<div class="header">
		<div class="header__left">
			{#if $themes.length !== 0}
				Apply theme to selection:
			{:else}
				Themes	
			{/if}
		</div>
		<div class="header__right">
			<button on:click={addNewTheme} class="btn icon-button">
				<SvgIcon icon="plus"/>
			</button>
			<Dropdown triggerElement={dropdownTrigger}>
				<button
				    type="button"
				    class="btn btn-secondary icon-button"
				    bind:this={dropdownTrigger}
				    >
				    <SvgIcon icon="dots"/>
				</button>
				<div slot="DropdownMenu">
				    <a class="dropdown-item" href="#" on:click={toggleImportView}>Import</a>
				    <a class="dropdown-item" href="#" on:click={exportThemes}>Export All</a>
				</div>
			</Dropdown>
		</div>
	</div>
	<div class="content">
		{#if $themes.length !== 0}
			<Themes />
		{:else}
		<OnboardingTip iconName={IconTheme}>
	  		Create a theme to get started.
		</OnboardingTip>
		{/if}
	</div>

	{#if viewImport}
		<Import on:message={toggleImportView}/>
	{/if}
</div>

<style>	
	
	.export-link {
		display: none;
	}
	.header {
		display:  flex;
		align-items:  center;
		padding:  8px;
	}
 .header__left {
 	font-size:  12px;
 	font-weight: 700;
 	padding-left:  16px;
 }
 .header__right {
 	display:  flex;
 	align-items:  center;
 	margin-left:  auto;
 	text-align:  right;
 }
 .content {
 	padding-left:  24px;
 	padding-right:  24px;
 }
</style>