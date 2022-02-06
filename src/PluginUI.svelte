<script>

	import {themes, localStyles} from './stores.js';
	//import Global CSS from the svelte boilerplate
	//contains Figma color vars, spacing vars, utility classes and more
	import { GlobalCSS } from 'figma-plugin-ds-svelte';

	//import some Svelte Figma UI components
	import { Button, Input, Label, SelectMenu } from 'figma-plugin-ds-svelte';

	import Themes from './Themes.svelte';


	
	// This stores the result of the plug
	onmessage = async (event) => {
		if (event.data.pluginMessage.localStylesFetched) {
			$localStyles = event.data.pluginMessage.localStylesFetched.localStyles;
			console.log($localStyles)
		}
		if (event.data.pluginMessage.themes) {
			$themes = event.data.pluginMessage.themes;
			// console.log(event.data.pluginMessage.themes)
		}
	}

	function addNewTheme() {
		parent.postMessage({ pluginMessage: { 
			'type': 'addNewTheme'
		} }, '*');
	}

</script>


<div class="wrapper p-xxsmall">

	<Button on:click={addNewTheme}>New Theme</Button>

	<Themes />
</div>


<style>
/* Add additional global or scoped styles here */
</style>