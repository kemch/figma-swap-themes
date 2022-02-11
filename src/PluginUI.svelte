<script>

	import {themes, localStyles} from './stores.js';
	//import Global CSS from the svelte boilerplate
	//contains Figma color vars, spacing vars, utility classes and more
	import { GlobalCSS } from 'figma-plugin-ds-svelte';

	//import some Svelte Figma UI components
	import { Button, Input, Label, SelectMenu, IconButton, Icon, IconPlus } from 'figma-plugin-ds-svelte';

	import Themes from './Themes.svelte';


	
	// This stores the result of the plug
	onmessage = async (event) => {
		if (event.data.pluginMessage.localStylesFetched) {
			$localStyles = event.data.pluginMessage.localStylesFetched.localStyles;
			console.log($localStyles)
		}
		if (event.data.pluginMessage.themes) {
			$themes = event.data.pluginMessage.themes;
			console.log($themes)
			// console.log(event.data.pluginMessage.themes)
		}
	}

	function addNewTheme() {
		parent.postMessage({ pluginMessage: { 
			'type': 'addNewTheme'
		} }, '*');
	}

</script>

<div class="header">
	<div class="header__left">Themes</div>
	<div class="header__right">
		<!-- <Button variant="tertiary" on:click={addNewTheme}>New Theme</Button> -->
		<IconButton iconName={IconPlus} on:click={addNewTheme} />
	</div>
</div>
<div class="content">
	<Themes />
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