<script>
	import SvgIcon from './SvgIcon.svelte';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	function importThemes(e) {
		const reader = new FileReader();
        reader.onload = onReaderLoad;
        reader.readAsText(e.target.files[0]);
	}
	function onReaderLoad(event){
        var obj = JSON.parse(event.target.result);
        if (typeof obj[0].swaps != 'undefined') {
	        parent.postMessage({ pluginMessage: { 
				'type': 'importThemes',
				'themes' : obj
			} }, '*');

        }
    }

    function goBack() {
	    dispatch('message');	
    }

</script>

<div class="view">
	<div class="header">
		<div class="header__left">
			<button type="button" class="icon-button" on:click={goBack}>
				<SvgIcon icon="back"/>
			</button>
			<div class="header__title">
				Import
			</div>
		</div>
	</div>
	<div class="content">


		<label class="file">
			<input class="file-input" accept="text/json" type="file" on:change={importThemes}>
		    <span class="file-custom">Import Themes</span>
		</label>
	</div>
</div>

<style>
	.icon-button {
		background:  none;
		border:  0;
	}
	.view {
		position: absolute;
		top:  0;
		left:  0;
		right: 0;
		bottom: 0;
		height: 100%;
		background-color:  white;
		overflow-y:  auto;
	}
	.header {
		display:  flex;
		align-items:  center;
		padding:  8px;
		background-color: white;
		margin: 0px 0px 0px -24px;
	}
	.header__left {
		font-size:  12px;
		font-weight: 700;
		padding-left:  16px;
		display:  flex;
		align-items:  center;
	}
	.header__title {
		margin-left: 8px;
	}
	.content {
		text-align:  center;
	}

	.file  {
	    position: relative;
	    display: inline-block;
	    cursor: pointer;
	    height: var(--size-medium);
	}
	    
	.file-custom {
		position: absolute;
	    top: 0;
	    left: 50%;
	    transform: translateX(-50%);
	    z-index: 5;
	    min-width: 200px;

	    text-align: center;
	    justify-content: center;

	    display: flex;
	    align-items: center;
	    border-radius: var(--border-radius-large);
	    color: var(--white);
	    flex-shrink: 0;
	    font-family: var(--font-stack);
	    font-size: var(--font-size-xsmall);
	    font-weight: var(--font-weight-medium);
	    letter-spacing: var(--font-letter-spacing-neg-small);
	    line-height: var(--font-line-height);
	    height: var(--size-medium);
	    padding: 0 var(--size-xsmall) 0 var(--size-xsmall);
	    text-decoration: none;
	    outline: none;
	    border: 2px solid transparent;
	    /* user-select: none; */
		
	    background-color: var(--white);
	    border: 1px solid var(--black8);
	    color: var(--black8);
	    padding: 0 calc(var(--size-xsmall) + 1px) 0 calc(var(--size-xsmall) + 1px);
	    letter-spacing: var(--font-letter-spacing-pos-small);
	}

	.file-input {
		min-width: 14rem;
	    margin: 0;
	    opacity: 0;
	}
</style>