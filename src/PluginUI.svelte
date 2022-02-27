<script>

	import {themes, localStyles, newTheme} from './stores.js';
	import { GlobalCSS } from 'figma-plugin-ds-svelte';
	import { Button, Input, Label, SelectMenu, IconButton, Icon, IconPlus, IconTheme, OnboardingTip } from 'figma-plugin-ds-svelte';
	import Themes from './Themes.svelte';

	let blobUrl;
	let download;
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
			'size': {width:500,height:400}
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
	function importThemes(e) {
		// let files = e.files;		
		// console.log(e.target.files)
		const reader = new FileReader();
        reader.onload = onReaderLoad;
        reader.readAsText(e.target.files[0]);
	}
	function onReaderLoad(event){
        // console.log(event.target.result);
        var obj = JSON.parse(event.target.result);
        console.log(obj)
        // $themes = [...$themes, obj];
        // $themes.concat(obj);
        parent.postMessage({ pluginMessage: { 
			'type': 'importThemes',
			'themes' : obj
		} }, '*');
    }


</script>
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
			<IconButton iconName={IconPlus} on:click={addNewTheme} />
			<input accept="text/json" type="file" on:change={importThemes}>
			<Button on:click={exportThemes}>Export All</Button>
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
 	margin-left:  auto;
 	text-align:  right;
 }
 .content {
 	padding-left:  24px;
 	padding-right:  24px;
 }
</style>