<script>
	export let style;

	let type = '';


	// style.paints = []
	// style.paints.opacity
	// style.paints.color.r
	// style.paints.color.g
	// style.paints.color.b

	//{`background-color: rgba(${paint.color.r},${paint.color.g},${paint.color.b},${paint.opacity})`}

	// console.log(style.type)

	function calculateBorder(color) {
		// if (color.r + color.g + color.b)
		console.log(color.r + color.g + color.b > 2.75)
		console.log('hii')
		if (color.r + color.g + color.b > 2.75) {
			// return color.r + color.g + color.b
			let increment = .25;
			let borderColor = {};
			borderColor.r = color.r - increment;
			borderColor.g = color.g - increment;
			borderColor.b = color.b - increment;

			console.log(borderColor)

			return `rgb(${borderColor.r*255},${borderColor.g*255},${borderColor.b*255})`;
		} else {
			return `transparent`
		}
	}

</script>

<div class="style">
	<div class="style__swatch">
		{#if style.type === "PAINT"}
			{#each style.paints as paint}
				<div class="swatch__fill" style={`border-color:${calculateBorder(paint.color)};background-color: rgba(${paint.color.r*255},${paint.color.g*255},${paint.color.b*255},${paint.opacity});`}></div>
			{/each}
		{/if}
	</div>
	<div class="swatch__name">{style.name}</div>
</div>

<style>
	.style {
		position: relative;
		padding:  8px 4px 8px 0px;
	}
	.swatch__swatch,
	.swatch__fill {
		position: absolute;
		top: 8px;
		left: 0;
		width: 16px;
		height: 16px;
		border-radius: 50%;
		border-style:  solid;
		border-width:  1px;
	}
	.swatch__name {
		margin-left: 24px;
	}
</style>