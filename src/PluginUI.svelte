<script>

	import {themes, localStyles, newTheme} from './stores.js';
	import { GlobalCSS } from 'figma-plugin-ds-svelte';
	import { Button, Input, Label, SelectMenu, IconButton, Icon, IconPlus, IconTheme, OnboardingTip } from 'figma-plugin-ds-svelte';
	import Themes from './Themes.svelte';

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
</script>
<div id="view">
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