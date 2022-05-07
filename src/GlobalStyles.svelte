<svelte:head>
	<link rel="stylesheet" href="//stackpath.bootstrapcdn.com/bootstrap/4.5.0/css/bootstrap.min.css">
	<style>
		.export-link {
			display: none;
		}
	.btn, .button {
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
	    user-select: none;

	}
	.dropdown-menu {
		background-color: white;
		border:  1px solid #E5E5E5;
		border-radius:  4px;
	}
	.dropdown-item {
		display: block;
    	font-size: 12px;
    	color: black;
    	font-weight: 500;
    	padding: 8px 12px;
	}
	
	.dropdown .btn {
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
        user-select: none;
    }
    .btn {
    	color:  black;
    	background-color:  white;
    	border:  1px solid black;
    }
    .btn-primary {
    	color:  white;
    	background-color: #489FF4;
    	border-color:  transparent;
    }
    .dropdown-menu .btn.icon-button,
	.icon-button {
		padding:  0 5px 0 5px !important;
	}

	.chevron-down {
		position: relative;
	}

	.chevron-down:after {
		position: absolute;
		right:  0;
		top:  -6px;
		display: block;
		content:  "\2304";
		font-size:  26px;
		color:  var(--black3);
	}

	</style>
</svelte:head>