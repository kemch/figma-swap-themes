<script>
	export let icon;
	export let size;
	export let classes = '';

	let _iconClass = 'icon';
</script>

<svg class="{_iconClass} {classes}">
  <use xlink:href="#{icon}"></use>
</svg>


<style>
.icon { 
  width: 16px; 
  height: 16px;
  margin:  0;
  display: inline-block;
}
</style>