<script>
	export let style;
	export let dropdown;

	// console.log('style')
	// console.log(style)
	import { Icon, IconEffects, IconLibrary, IconBack, IconImage } from 'figma-plugin-ds-svelte';

	function calculateBorder(color) {
		if (color.r + color.g + color.b > 2.75) {
			let increment = .25;
			let borderColor = {};
			borderColor.r = color.r - increment;
			borderColor.g = color.g - increment;
			borderColor.b = color.b - increment;

			return `rgb(${borderColor.r*255},${borderColor.g*255},${borderColor.b*255})`;
		} else {
			return `transparent`
		}
	}

</script>
{#if typeof style !== 'undefined'}
<div class="style">

	{#if style.type === "PAINT"}
		<div class="style__swatch">
			{#each style.paints as paint}
				{#if paint.type === "SOLID"}
					<div class="swatch__fill" style={`border-color:${calculateBorder(paint.color)};background-color: rgba(${paint.color.r*255},${paint.color.g*255},${paint.color.b*255},${paint.opacity});`}></div>
				{:else if (paint.type === "IMAGE")}
					<div class="swatch__image">
						<Icon iconName={IconImage} />
					</div>
				{/if}
			{/each}
		</div>
	{/if}
	{#if style.type === "EFFECT"}
		<div class="swatch__effect">
			<Icon class="swatch__effect__icon" iconName={IconEffects} />
		</div>
	{/if}
	<div class="swatch__name">{style.name ? style.name : style.id}</div>
	{#if dropdown && !style.remote && !style.missing}
	<div class="swatch__pulldown">
		<Icon iconName={IconBack} />
	</div>
	{/if}
	{#if style.remote}
		<div class="swatch__library" title="This style is from a team library.">
			<Icon iconName={IconLibrary}/>
		</div>
	{/if}
	{#if style.missing}
		<div class="swatch__missing" title="This style is not available in this document.">?</div>
	{/if}
	
</div>
{:else}
	Style undefined
{/if}

<style>
	.style {
		position: relative;
		padding:  2px 4px 2px 0px;
		display: flex;
		align-items: center;
		flex:  1 1 100%;
		width:  100%;
		/*border: 1px solid var(--silver);*/
		border-radius:  4px;
	}

	.swatch__image,
	.swatch__effect {
		margin-left: -7px;
		margin-right:  8px;
		margin-top: -8px;
		width: 16px;
		height: 16px;
	}
	.style__swatch {
		position: relative;
		width: 16px;
		height: 16px;
		margin-left:  4px;
		/*border-radius: 50%;*/
		/*border-style:  solid;*/
		/*border-width:  1px;*/
		flex:  0 0 16px;
	}
	.swatch__image,
	.swatch__fill {
		position: absolute;
		top: 0;
		left: 0;
	}
	.swatch__fill {
		width: 16px;
		height: 16px;
		border-radius: 50%;
		border-style:  solid;
		border-width:  1px;

	}
	
	.swatch__name {
		margin-left: 8px;
		width: auto;
		flex:  1 1 100%;
	}

	.swatch__pulldown {
		transform: rotate(-90deg);
	}
	.swatch__missing {
		display: inline-flex;
		padding:  2px 4px;
		background-color:  #FCEA4F;
		border-radius:  5px;
	}
	.swatch__library {
		opacity: 0.5;
	}
	.swatch__pulldown,
	.swatch__library,
	.swatch__missing {

	}
	
</style>