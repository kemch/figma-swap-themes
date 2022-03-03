console.clear()


class Theme {
	id: number;
	name: string;
	archived: boolean;
	swaps: [];
	constructor(name:string) {
		this.assignId(Themes.themes);
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

	assignId(themes) {
		this.id = +new Date;
	}
}

class Swap {
	to: object;
	from: object;

	constructor(theme) {
		this.to = { name:'', id:'', key:'', remote: false}
		this.from = {name:'',id:'', key:'', remote: false}
	}
}

const Themes = {
	storageKey :'PLUGIfN_fdffdfdffdfdf4rfgf',
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
			themes:this.themes,
			editNew:theme
		})
	},

	async loadStylesInThemeEdit(theme) {
		const storage = await figma.clientStorage.getAsync(this.storageKey);
		await this.checkStylesForRemote([this.themes[theme.index]]);
		await figma.clientStorage.setAsync(this.storageKey, this.themes);
		figma.ui.postMessage({
			themes:Themes.themes
		})

	},

	async checkStylesForRemote(themes) {

		const localPaintStyles = figma.getLocalPaintStyles().map(item => item.id);
		const localEffectStyles = figma.getLocalEffectStyles().map(item => item.id);
		const localStyles = localPaintStyles.concat(localEffectStyles);
		// console.log(localStyles)
		// return
		for (let theme of themes) {
			for (let swap of theme.swaps) {
				// check FROM
				// check if styles in the theme are local.
				if (localStyles.includes(swap.from.id)) {
					swap.from.missing = false;
					swap.from.remote = false;	
				
				// this assumes the style was local.
				} else if (!localStyles.includes(swap.from.id)) {
					swap.from.missing = true;
					// check if the style is from a team library
					try {
						const style = await figma.importStyleByKeyAsync(swap.from.key)
						swap.from.remote = style.remote;
						swap.from.name = style.name;
						swap.from.paints = style.paints;
						swap.from.type = style.type;
						swap.from.missing = false;
						// console.log(style)
						// console.log(`${swap.from.name} is a TEAM STYLE in ${theme.name}.`)
					} catch(e) {
						// it always throws a 404
						swap.from.missing = true;
						console.log(e)
						// console.log(`No team style associated with ${swap.from.name} in theme ${theme.name}`)
					}
				
				} else {
					console.log('nothing here')
				}


				// check TO

				if (localStyles.includes(swap.to.id)) {
					swap.to.missing = false;
					swap.to.remote = false;	
				// this assumes the style was previously local.
				} else if (!localStyles.includes(swap.from.id)) {
					swap.to.missing = true;
					try {
						const style = await figma.importStyleByKeyAsync(swap.to.key)
						swap.to.remote = style.remote;
						swap.to.name = style.name;
						swap.to.paints = style.paints;
						swap.to.type = style.type;
						swap.to.missing = false;
					} catch(e) {
						// it always throws a 404
						swap.to.missing = true;
						console.log(e)
					}
				} else {
					console.log('nothing here')
				}
			}
		}
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

	},

	async importThemes(newThemes) {
		const timestamp = +new Date;
		const storage = await figma.clientStorage.getAsync(this.storageKey);
		this.themes = storage;
		let validThemes = [];

		const ids = this.themes.map(e=>e.id);

		// will replace themes with id
		// for (let theme of newThemes) {
		// 	if (ids.includes(theme.id)) {
		// 		console.log('hi')
		// 		this.themes[theme.id] = theme;
		// 	} else {
		// 		this.themes.push(theme);
		// 	}
			
		// }

		// will replace themes with id
		for (let [i, theme] of newThemes.entries()) {
			theme.id = timestamp + i;
			this.themes.push(theme);
		}
		

		await figma.clientStorage.setAsync(this.storageKey, this.themes);

		figma.ui.postMessage({
			themes:this.themes
		})
	},

	async duplicateTheme(theme) {

		const storage = await figma.clientStorage.getAsync(this.storageKey);
		this.themes = storage;
		const ids = this.themes.map(e=>e.id);

		const newTheme = new Theme(`Copy of ${theme.name}`)

		newTheme.swaps = theme.swaps;

		this.themes.push(newTheme);

		await figma.clientStorage.setAsync(this.storageKey, this.themes);
		figma.ui.postMessage({
			themes:this.themes,
			editNew:newTheme
		})

	},

	async applyStyleToCanvasNode(swap, i) {

		const labelFrom: TextNode = figma.createText();
		const labelTo: TextNode = figma.createText();

		const nodeFrom = figma.createRectangle();
		const nodeTo = figma.createRectangle();

		const centerX = figma.viewport.center.x;
		const centerY = figma.viewport.center.y;

		labelFrom.name = swap.from.name;
        labelFrom.fontName = { family: "Inter", style: "Medium"};
        labelFrom.characters = swap.from.name;
        labelFrom.textAlignHorizontal = "CENTER";
        labelFrom.fontSize = 6;
        labelFrom.x = centerX;
        labelFrom.y = centerY + 55;

        labelTo.name = swap.to.name;
        labelTo.fontName = { family: "Inter", style: "Medium"};
        labelTo.characters = swap.to.name;
        labelTo.textAlignHorizontal = "CENTER";
        labelTo.fontSize = 6;
        labelTo.x = centerX + 65;
        labelTo.y = centerY + 55;

        nodeFrom.name = "from";
        nodeTo.name = "to";
		nodeFrom.resize(50,50);
		nodeTo.resize(50,50);

		nodeFrom.x = centerX;
		nodeTo.x = centerX + 65;

		nodeFrom.y = centerY;
		nodeTo.y = centerY;

		

		const group = figma.group([nodeFrom,nodeTo,labelFrom,labelTo], figma.currentPage);

		group.name = `swap pair ${i}`;

		group.y = centerY + (i*70);


		// from
		if (swap.from.type === 'EFFECT') { 
			console.log('effect')
			if (swap.from.remote === true) {
				console.log('remote')
				try {
					const remoteStyle = await figma.importStyleByKeyAsync(swap.from.key);
					console.log(remoteStyle)
					nodeFrom.effectStyleId = remoteStyle.id;
				} catch (e) {
					console.log(e)
				}
			} else if (figma.getStyleById(swap.from.id) != null){
				console.log('null')
				nodeFrom.effectStyleId = swap.from.id;
			} else {
				console.log('nothing happened')
				labelFrom.characters += ' (missing)';
			}
		} else if (swap.from.type === 'PAINT') {
			if (swap.from.remote === true) {
				try {
					const remoteStyle = await figma.importStyleByKeyAsync(swap.from.key);
					console.log(remoteStyle)
					nodeFrom.fillStyleId = remoteStyle.id;
				} catch (e) {
					console.log(e)
				}
			} else if (figma.getStyleById(swap.from.id) != null){
				nodeFrom.fillStyleId = swap.from.id;
			} else {
				console.log('nothing happened')
				labelFrom.characters += ' (missing)';
			}
		}

		// to
		if (swap.to.type === 'EFFECT') {
			if (swap.to.remote === true) {
				try {
					const remoteStyle = await figma.importStyleByKeyAsync(swap.to.key);
					console.log(remoteStyle)
					nodeTo.effectStyleId = remoteStyle.id;
				} catch (e) {
					console.log(e)
				}
			} else if (figma.getStyleById(swap.to.id) != null){
				nodeTo.effectStyleId = swap.to.id;
			} else {
				console.log('nothing happened')
				labelTo.characters += ' (missing)';
			}
		} else if (swap.to.type === 'PAINT') {
			if (swap.to.remote === true) {
				try {
					const remoteStyle = await figma.importStyleByKeyAsync(swap.to.key);
					nodeTo.fillStyleId = remoteStyle.id;
				} catch (e) {
					console.log(e)
				}
			} else if (figma.getStyleById(swap.to.id) != null){
				nodeTo.fillStyleId = swap.to.id;
			} else {
				console.log('nothing happened')
				labelTo.characters += ' (missing)';
			}
		}
	},

	async buildThemeOnCanvas(theme) {
		try {
			await figma.loadFontAsync({family: "Inter", style: "Medium"});
		} catch(e) {
			console.log(e);
		}
		for (let i = theme.swaps.length - 1; i >= 0; i--) {
			await Themes.applyStyleToCanvasNode(theme.swaps[i], i);
		}
	},

	applyTheme(nodes:Array<any>, theme): void {

		for (const node of nodes) {
		
			if (node.type === "TEXT" && typeof node.fillStyleId == "symbol") {
				let segments = node.getStyledTextSegments(['fillStyleId']);
				for (let segment of node.getStyledTextSegments(['fillStyleId']) ) {
					this.swapStyle(node, this.themes[theme.index], segment);
				}
			} else {
				this.swapStyle(node, this.themes[theme.index])

			}

			if (node.type == 'COMPONENT' ||
				node.type == 'INSTANCE' ||
				node.type == 'FRAME' ||
				node.type == 'GROUP' ||
				node.type == 'PAGE' ||
				node.type == 'VECTOR') {
				if (typeof node.children !== 'undefined') {
					this.applyTheme(node.children, theme);
					
				}
			}
		}
	},

	async swapStyle(node, theme, segment) {

		let n;
		if (typeof segment == 'undefined') {
			n = node;
		} else {
			n = segment;
		}

		if (!!n.fillStyleId) {
			const regex = /(S:)(.+)(,)/;
			const match = regex.exec(n.fillStyleId);
			const id = match[1]+match[2]+match[3];
			const key = match[2];
			for (let swap of theme.swaps) {
				if (id === swap.from.id && !swap.to.remote) {
					if (typeof segment == "undefined") {
						node.fillStyleId = swap.to.id;
					} else {
						node.setRangeFillStyleId(segment.start, segment.end, swap.to.id)
					}
					console.log(`Swapped to local style ${swap.to.name}`)
				} else if (id === swap.to.id && !swap.from.remote) {
					if (typeof segment == "undefined") {
						node.fillStyleId = swap.from.id;
					} else {
						node.setRangeFillStyleId(segment.start, segment.end, swap.from.id)
					}
					console.log(`Swapped to local style ${swap.from.name}`)
				} else if (id === swap.from.id && swap.to.remote) {
					try {
						const remoteStyle = await figma.importStyleByKeyAsync(swap.to.key);
						if (typeof segment == "undefined") {
							node.fillStyleId = remoteStyle.id;
						} else {
							node.setRangeFillStyleId(segment.start, segment.end, remoteStyle.id)
						}
						console.log(`Swapped to team style ${swap.to.name}`)
					} catch(e) {
						console.log(e);
					}
				} else if (id === swap.to.id && swap.from.remote) {
					try {
						const remoteStyle = await figma.importStyleByKeyAsync(swap.from.key);
						if (typeof segment == "undefined") {
							node.fillStyleId = remoteStyle.id;
						} else {
							console.log('HI')
							node.setRangeFillStyleId(segment.start, segment.end, remoteStyle.id)
						}
						console.log(`Swapped to team style ${swap.from.name}`)
					} catch(e) {
						console.log(e);
					}
				}
			}
		}

		if (!!n.strokeStyleId) {
			const regex = /(S:)(.+)(,)/;
			const match = regex.exec(node.strokeStyleId);
			const id = match[1]+match[2]+match[3];
			const key = match[2];
			for (let swap of theme.swaps) {
				if (id === swap.from.id && !swap.to.remote) {
					node.strokeStyleId = swap.to.id;
					console.log(`Swapped to local style ${swap.to.name}`)
				} else if (id === swap.to.id && !swap.from.remote) {
					node.strokeStyleId = swap.from.id;
					console.log(`Swapped to local style ${swap.from.name}`)
				} else if (id === swap.from.id && swap.to.remote) {
					try {
						const remoteStyle = await figma.importStyleByKeyAsync(swap.to.key);
						node.strokeStyleId = remoteStyle.id;
						console.log(`Swapped to team style ${swap.to.name}`)
					} catch(e) {
						console.log(e);
					}
				} else if (id === swap.to.id && swap.from.remote) {
					try {
						const remoteStyle = await figma.importStyleByKeyAsync(swap.from.key);
						node.strokeStyleId = remoteStyle.id;
						console.log(`Swapped to team style ${swap.from.name}`)
					} catch(e) {
						console.log(e);
					}
				}
			}
		}

		if (!!n.effectStyleId) {
			const regex = /(S:)(.+)(,)/;
			const match = regex.exec(node.effectStyleId);
			const id = match[1]+match[2]+match[3];
			const key = match[2];
			for (let swap of theme.swaps) {
				if (id === swap.from.id && !swap.to.remote) {
					node.effectStyleId = swap.to.id;
					console.log(`Swapped to local style ${swap.to.name}`)
				} else if (id === swap.to.id && !swap.from.remote) {
					node.effectStyleId = swap.from.id;
					console.log(`Swapped to local style ${swap.from.name}`)
				} else if (id === swap.from.id && swap.to.remote) {
					try {
						const remoteStyle = await figma.importStyleByKeyAsync(swap.to.key);
						node.effectStyleId = remoteStyle.id;
						console.log(`Swapped to team style ${swap.to.name}`)
					} catch(e) {
						console.log(e);
					}
				} else if (id === swap.to.id && swap.from.remote) {
					try {
						const remoteStyle = await figma.importStyleByKeyAsync(swap.from.key);
						node.effectStyleId = remoteStyle.id;
						console.log(`Swapped to team style ${swap.from.name}`)
					} catch(e) {
						console.log(e);
					}
				}

			}

		}

	},

	async addSwapPairFromSelection(selection, theme) {

		
		// console.log(theme)
		const storage = await figma.clientStorage.getAsync(this.storageKey);
		this.themes = storage;
		
		// const swap = new Swap(this.themes[theme.index]);

		
		


		for (let nodes of selection) {

			const swap = new Swap(this.themes[theme.index]);
			for (let node of nodes.children) {

				const from_swaps = [], to_swaps = [];
				const swaps = [];
				for (let swaps_used of this.themes[theme.index].swaps) {
					from_swaps.push(swaps_used.from.id);
					to_swaps.push(swaps_used.to.id);
				}

				if (node.name === 'from') {
					if (!!node.fillStyleId) {
						let from_fill = figma.getStyleById(node.fillStyleId)
						if (!from_swaps.includes(`S:${from_fill.key},`)) {
							swap.from.id = `S:${from_fill.key},`;
							swap.from.name = from_fill.name;
							swap.from.key = from_fill.key;
							swap.from.remote = from_fill.remote;
							swap.from.paints = from_fill.paints;
							swap.from.type = from_fill.type;
						} else {
							figma.notify(`Selection contains duplicate PAINT style in swap column 1: ${from_fill.name}`)
							return
						}
					} else if (!!node.effectStyleId) {
						let from_fill = figma.getStyleById(node.effectStyleId);
						if (!from_swaps.includes(`S:${from_fill.key},`)) {
							swap.from.id = `S:${from_fill.key},`;
							swap.from.name = from_fill.name;
							swap.from.key = from_fill.key;
							swap.from.remote = from_fill.remote;
							swap.from.effects = from_fill.effects;
							swap.from.type = from_fill.type;
						} else {
							figma.notify(`Selection contains duplicate EFFECT style in swap column 1: ${from_fill.name}`)
							return
						}
					}
				} 

				if (node.name === 'to') {
					if (!!node.fillStyleId) {
						let to_fill = figma.getStyleById(node.fillStyleId)
						if (!to_swaps.includes(`S:${to_fill.key},`)) {
							swap.to.id = `S:${to_fill.key},`;
							swap.to.name = to_fill.name;
							swap.to.key = to_fill.key;
							swap.to.remote = to_fill.remote;
							swap.to.paints = to_fill.paints;
							swap.to.type = to_fill.type;
						} else {
							figma.notify(`Selection contains duplicate PAINT style in swap column 2: ${to_fill.name}`)
							return
						}
					} else if (!!node.effectStyleId) {
						let to_fill = figma.getStyleById(node.effectStyleId);
						if (!to_swaps.includes(`S:${to_fill.key},`)) {
							swap.to.id = `S:${to_fill.key},`;
							swap.to.name = to_fill.name;
							swap.to.key = to_fill.key;
							swap.to.remote = to_fill.remote;
							swap.to.effects = to_fill.effects;
							swap.to.type = to_fill.type;
						} else {
							figma.notify(`Selection contains duplicate EFFECT style in swap column 2: ${to_fill.name}`)
							return
						}
					}
				}
			}
			this.themes[theme.index].swaps.push(swap);
		}
		await figma.clientStorage.setAsync(this.storageKey, this.themes);
		figma.ui.postMessage({
			themes:this.themes
		})

	}

}

Themes.initPlugin();

figma.showUI(__html__, {width: 320, height: 400 });

const styles = [];
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
		key: '',
		remote: false,
		// paints: Array[]
		paints: [],
	}
	o.id = obj.id;
	// o.key = obj.key;
	o.name = figma.getStyleById(obj.id).name;
	o.label = figma.getStyleById(obj.id).name;
	o.value = obj.id;
	o.type = obj.type;
	o.key = obj.key;
	o.remote = obj.remote;
	for (let paint of obj.paints) {
		o.paints.push(paint);
	}
	styles.push(o)
}

for (let obj of effects) {
	let o = {
		id: '',
		name:'',
		label:'',
		value:'',
		type: '',
		key: '',
		remote: false,
		effects: [],
	}
	o.id = obj.id;
	o.name = figma.getStyleById(obj.id).name;
	o.label = figma.getStyleById(obj.id).name;
	o.value = obj.id;
	o.type = obj.type;
	o.key = obj.key;
	o.remote = obj.remote;
	for (let effect of obj.effects) {
		o.effects.push(effect);
	}
	styles.push(o)
}

// const localStyles = localPaintStyles;


// This will fetch all the local styles in the current document.
figma.ui.postMessage({
	localStylesFetched:{
		localStyles: styles
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
	if (msg.type === 'addSwapPairFromSelection') {
		const selection = figma.currentPage.selection as any;
		Themes.addSwapPairFromSelection(selection, msg.theme);
	}
	if (msg.type === 'applyTheme') {
		const selection = figma.currentPage.selection as any;
		const swapMap = {};

		for (let swap of Themes.themes[msg.theme.index].swaps) {
			swapMap[swap.from.id] = swap.to.id;
			swapMap[swap.to.id] = swap.from.id;
		}

		Themes.applyTheme(selection, msg.theme);
	}
	if (msg.type === 'loadStylesInThemeEdit') {
		Themes.loadStylesInThemeEdit(msg.theme);
	}
	if (msg.type === 'resizeUI') {
		figma.ui.resize(msg.size.width, msg.size.height);
	}
	if (msg.type === 'importThemes') {
		Themes.importThemes(msg.themes);
	}

	if (msg.type === 'duplicateTheme') {
		Themes.duplicateTheme(msg.theme);
	}

	if (msg.type === 'buildThemeOnCanvas') {
		Themes.buildThemeOnCanvas(msg.theme);
	}
};
