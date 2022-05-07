<script>
	/*
	:root {
    --blue: #18a0fb;
    --purple: #7b61ff;
    --hot-pink: #f0f;
    --green: #1bc47d;
    --red: #f24822;
    --yellow: #ffeb00;
    --black: #000;
    --black8: rgba(0,0,0,0.8);
    --black8-opaque: #333;
    --black3: rgba(0,0,0,0.3);
    --black3-opaque: #b3b3b3;
    --white: #fff;
    --white8: hsla(0,0%,100%,0.8);
    --white4: hsla(0,0%,100%,0.4);
    --grey: #f0f0f0;
    --silver: #e5e5e5;
    --hud: #222;
    --toolbar: #2c2c2c;
    --black1: rgba(0,0,0,0.1);
    --blue3: rgba(24,145,251,0.3);
    --purple4: rgba(123,97,255,0.4);
    --hover-fill: rgba(0,0,0,0.06);
    --selection-a: #daebf7;
    --selection-b: #edf5fa;
    --white2: hsla(0,0%,100%,0.2);
    --font-stack: "Inter",sans-serif;
    --font-size-xsmall: 11px;
    --font-size-small: 12px;
    --font-size-large: 13px;
    --font-size-xlarge: 14px;
    --font-weight-normal: 400;
    --font-weight-medium: 500;
    --font-weight-bold: 600;
    --font-line-height: 16px;
    --font-line-height-large: 24px;
    --font-letter-spacing-pos-xsmall: .005em;
    --font-letter-spacing-neg-xsmall: .01em;
    --font-letter-spacing-pos-small: 0;
    --font-letter-spacing-neg-small: .005em;
    --font-letter-spacing-pos-large: -.0025em;
    --font-letter-spacing-neg-large: .0025em;
    --font-letter-spacing-pos-xlarge: -.001em;
    --font-letter-spacing-neg-xlarge: -.001em;
    --border-radius-small: 2px;
    --border-radius-med: 5px;
    --border-radius-large: 6px;
    --shadow-hud: 0 5px 17px rgba(0,0,0,0.2),0 2px 7px rgba(0,0,0,0.15);
    --shadow-floating-window: 0 2px 14px rgba(0,0,0,0.15);
    --size-xxxsmall: 4px;
    --size-xxsmall: 8px;
    --size-xsmall: 16px;
    --size-small: 24px;
    --size-medium: 32px;
    --size-large: 40px;
    --size-xlarge: 48px;
    --size-xxlarge: 64px;
    --size-huge: 80px;
}*/
	import { themes, localStyles, swapList } from './stores.js';
	import { Icon, IconBack } from 'figma-plugin-ds-svelte';
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
		updateList()
		open = !open;
		// if (!style.missing) {
		// 	if (!style.remote) {
		// 	}
		// }
	}
</script>


<div class="menu" bind:this={menu}>
	<div class="menu__content" on:click={toggleMenu}>

		<input type="hidden" bind:value={value} >
		{#if style.name.length}

			<StyleSwatch style={style} dropdown={true}/>
			<!-- <StyleSwatch style={lookupStyle(style.id)} /> -->			
		{:else}
			<span class="menu__no-selection chevron-down">
				Select Style
			</span>
		{/if}
	</div>
	{#if open}
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
	.menu__option {
		padding: 4px 0px;
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
	.menu__no-selection {
		min-height: 32px;
		display: flex;
		padding-left:  24px;
		width:  100%;
		align-items:  center;
		padding-right:  4px;
		/*border:  1px solid var(--silver);
		color:  var(--black8);*/
	}
	.menu__dropdown__arrow {
		margin-left:  auto;
		text-align: right;
		transform: rotate(-90deg);
	}
</style>

