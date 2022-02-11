<script>
	import { themes, localStyles, swapList } from './stores.js';
	import { onMount } from 'svelte';
	import StyleSwatch from './StyleSwatch.svelte';
	export let style;
	export let direction;
	export let theme;

	let value = style.id;
	let list = [];
	let open = false;
	let menu = null;

	function selectStyle(localStyle) {
		// console.log(localStyle)
		style.id = localStyle.id;
		style.name = localStyle.name;
		style.key = localStyle.key;
		style.remote  = localStyle.remote;
		style.type  = localStyle.type;
		style.missing = localStyle.missing;
		
		if (style.type === "PAINT") {
			style.paints = localStyle.paints;
		}
		toggleMenu();
		lookupStyle(style.id);
		parent.postMessage({ pluginMessage: { 
			'type': 'updateThemes',
			'themes': $themes
		} }, '*');
	}


	onMount(() => {
		const handleOutsideClick = (event) => {
	      if (open && !menu.contains(event.target)) {
	        open = false;
	      }
	    };
	    const handleEscape = (event) => {
	      if (open && event.key === 'Escape') {
	        open = false;
	      }
	    };

	    // add events when element is added to the DOM
	    document.addEventListener('click', handleOutsideClick, false);
	    document.addEventListener('keyup', handleEscape, false);

	    // remove events when element is removed from the DOM
	    return () => {
	      document.removeEventListener('click', handleOutsideClick, false);
	      document.removeEventListener('keyup', handleEscape, false);
	    };
	})

	function lookupStyle(id){
// need paint info to show swatch
		for (let style of $localStyles) {
			if (id === style.id) {
				return style;
			}
		}
	}


	function filterList(item) {

		list = [];

		if (direction === 'from') {
			for (var i = $themes[theme].swaps.length - 1; i >= 0; i--) {
				list.push($themes[theme].swaps[i].from.id);
			}
		}
		if (direction === 'to') {
			for (var i = $themes[theme].swaps.length - 1; i >= 0; i--) {
				list.push($themes[theme].swaps[i].to.id);
			}
		}
		return !list.includes(item.id)
	}

	function updateList() {
		$swapList = $localStyles.filter(filterList)
	}

	function toggleMenu() {
		if (!style.missing) {
			updateList()
			open = !open;
		}
	}

	function checkIfLibrary() {

	}
</script>


<div class="menu" bind:this={menu}>
	<div class="menu__content" on:click={toggleMenu}>

		<input type="hidden" bind:value={value} >
		{#if style.name.length}

			<StyleSwatch style={style} dropdown={true}/>
			<!-- <StyleSwatch style={lookupStyle(style.id)} /> -->			
		{:else}
			Select Style
		{/if}
	</div>
	{#if open === true}
		<div class="menu__dropdown">
			{#if $swapList.length > 0}
				{#each $swapList as localStyle, index (localStyle.id)}
					<div class="menu__option" on:click={selectStyle(localStyle)}>
						<StyleSwatch style={localStyle} />
					</div>
				{/each}
			{:else}
				All available stlyes used.
			{/if}
		</div>
	{/if}
</div>

<style>
	.menu__content,
	.menu {
		position:  relative;
		display: flex;
		flex:  1 1 100%;
		width:  100%;
	}
	.menu__content,
	.menu__option {
		font-size:  12px;
		cursor: pointer;
	}
	.menu__content:hover,
	.menu__option:hover {
		background-color:  #E8F6FF;
	}
	.menu__content {
		/*white-space: nowrap;*/
	}

	.menu__dropdown {
		z-index: 10;
		width:  100%;
		position:  absolute;
		background-color:  white;
		padding: 4px 8px;
		margin-left: -4px;
		top: 32px;
		box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.08), 0px 2px 6px rgba(0, 0, 0, 0.16);
		border-radius: 6px;
	}
</style>

