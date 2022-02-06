console.clear()


class Theme {
	id: number;
	name: string;
	archived: boolean;
	swaps: [];
	constructor(name:string) {
		this.assignId();
		this.name = name;
		this.archived = false;
		this.swaps = [];
	}

	archive() {
		this.archived = true;
	}

	unarchive() {
		this.archived = false;
	}

	async assignId() {
		const storage = await Themes.listThemes();
		return this.id = storage.length + 1;
	}
}

class Swap {
	id: number;
	name: string;
	archived: boolean;
	to: object;
	from: object;

	constructor(theme) {
		this.assignId(theme);
		this.to = { name:'', id:''}
		this.from = {name:'',id:''}
	}

	archive() {
		this.archived = true;
	}

	unarchive() {
		this.archived = false;
	}

	async assignId(theme) {
		return this.id = theme.swaps.length + 1;
	}
}

const Themes = {
	storageKey :'PLUGIN_fdfdffdfdf4rfgf',
	themes: [],
	async listThemes() {
		const storage = await figma.clientStorage.getAsync(this.storageKey);
		this.themes = typeof storage === 'undefined' ? [] : storage;
		return this.themes;
	},
	async initPlugin() {
		const storage = await figma.clientStorage.getAsync(this.storageKey);
		this.themes = typeof storage === 'undefined' ? [] : storage;
		await figma.clientStorage.setAsync(this.storageKey, this.themes);
		figma.ui.postMessage({
			themes:Themes.themes
		})
	},

	// PATTERN
	// 1. Sync local storage to this.themes
	// 2. Manipulate this.themes
	// 3. Sync to local storage
	// 4. Send a plugin update
	async addNewTheme() {
		const theme = new Theme(`New Theme ${this.themes.length+1}` );
		const storage = await figma.clientStorage.getAsync(this.storageKey);
		this.themes.push(theme);
		await figma.clientStorage.setAsync(this.storageKey, this.themes);
		figma.ui.postMessage({
			themes:this.themes
		})
	},

	async addOrUpdateTheme(theme) {
		const storage = await figma.clientStorage.getAsync(this.storageKey);
		this.themes = storage;

		for (var i = this.themes.length - 1; i >= 0; i--) {
			if (this.themes[i].id === theme.id) {
				this.themes[i] = theme;
			}
		}

		await figma.clientStorage.setAsync(this.storageKey, this.themes);

		figma.ui.postMessage({
			themes:this.themes
		})
	},

	getIndexFromThemeId(id) {
		for(let index in this.themes) {
			if (this.themes[index].id === id) {
				return index
				// return this.themes[i]
			}
		}
	},

	async getThemeObjFromId(id) {
		const storage = await figma.clientStorage.getAsync(this.storageKey);
		this.themes = storage;
		const theme = this.themes.filter((item)=>item.id === id);
		return theme;
	},

	async deleteTheme(theme) {
		const storage = await figma.clientStorage.getAsync(this.storageKey);
		this.themes = storage;
		this.themes.splice(theme.index, 1)
		await figma.clientStorage.setAsync(this.storageKey, this.themes);
		figma.ui.postMessage({
			themes:this.themes
		})
	},

	async addSwapPair(theme) {

		// console.log(theme)
		const storage = await figma.clientStorage.getAsync(this.storageKey);
		this.themes = storage;
		
		const swap = new Swap(this.themes[theme.index]);

		this.themes[theme.index].swaps.push(swap)
		// console.log(this.themes)
		await figma.clientStorage.setAsync(this.storageKey, this.themes);
		figma.ui.postMessage({
			themes:this.themes
		})
	},

	async deleteSwapPair(theme, swap) {
		// theme is an index
		const storage = await figma.clientStorage.getAsync(this.storageKey);

		this.themes = storage;
		this.themes[theme].swaps.splice(swap.index, 1);

		await figma.clientStorage.setAsync(this.storageKey, this.themes);
		figma.ui.postMessage({
			themes:this.themes
		})
	},

	async updateThemes(themes) {
		this.themes = themes;
		await figma.clientStorage.setAsync(this.storageKey, this.themes);
		figma.ui.postMessage({
			themes:themes
		})

	}
}

Themes.initPlugin();

figma.showUI(__html__, {width: 420, height: 500 });

const paints = figma.getLocalPaintStyles();
const effects = figma.getLocalEffectStyles();

let localPaintStyles = [];
let localEffectStyles = [];

for (let obj of paints) {
	let o = {
		id:'',
		name: '',
		label: '',
		value: '',
		type: '',
		// paints: Array[]
		paints: [],
	}
	o.id = obj.id;
	// o.key = obj.key;
	o.name = figma.getStyleById(obj.id).name;
	o.label = figma.getStyleById(obj.id).name;
	o.value = obj.id;
	o.type = obj.type;
	for (let paint of obj.paints) {
		o.paints.push(paint);
	}
	localPaintStyles.push(o)
}


// paints.map( obj => {
// 	// o.paints = obj.paints;
// 	// return o;
// });
for (let obj of effects) {
	let o = {
		id: '',
		name:'',
		label:'',
		value:'',
		type: '',
		effects: [],
	}
	o.id = obj.id;
	o.name = figma.getStyleById(obj.id).name;
	o.label = figma.getStyleById(obj.id).name;
	o.value = obj.id;
	o.type = obj.type;
	console.log(o)
	for (let effect of obj.effects) {
		o.effects.push(effect);
	}
	localEffectStyles.push
}

// const localStyles = localPaintStyles;
const localStyles = localPaintStyles.concat(localEffectStyles);

// This will fetch all the local styles in the current document.
figma.ui.postMessage({
	localStylesFetched:{
		localStyles: localStyles
	}
})

// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.
figma.ui.onmessage = msg => {
	if (msg.type === "addNewTheme") {
		Themes.addNewTheme();
	}
	if (msg.type === 'addOrUpdateTheme') {
		Themes.addOrUpdateTheme(msg.theme);
	}
	if (msg.type === 'deleteTheme') {
		Themes.deleteTheme(msg.theme);
	}
	if (msg.type === 'addSwapPair') {
		Themes.addSwapPair(msg.theme);
	}
	if (msg.type === 'deleteSwapPair') {
		Themes.deleteSwapPair(msg.theme, msg.swap);
	}

	if (msg.type === 'updateThemes') {
		Themes.updateThemes(msg.themes);
	}
	// One way of distinguishing between different types of messages sent from
	// your HTML page is to use an object with a "type" property like this.
	
	// Make sure to close the plugin when you're done. Otherwise the plugin will
	// keep running, which shows the cancel button at the bottom of the screen.
	// figma.closePlugin();
};
