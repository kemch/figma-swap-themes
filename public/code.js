'use strict';

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

console.clear();
class Theme {
    constructor(name) {
        // this.assignId();
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
}
class Swap {
    constructor(theme) {
        this.to = { name: '', id: '', key: '', remote: false };
        this.from = { name: '', id: '', key: '', remote: false };
    }
}
// async function applyTheme(theme) {
// }
// // * copy
// async function getStyleFromKeyOrId(key) {
// 	// console.log('=========================')
// 	let style;
// 	if (!!figma.getStyleById(key)) {
// 		style = figma.getStyleById(key);
// 	} else {
// 		// this returns false if key is used in get local getStyleById
// 		try {
// 			const remoteStyle = await figma.importStyleByKeyAsync(key);
// 			style = remoteStyle;
// 		} catch (e) {
// 			const regex = /(?!S:)[\w]+(?=,)/;
// 			const match = regex.exec(key);
// 			try {
// 				const remoteStyleTryAgain = await figma.importStyleByKeyAsync(match[0]);
// 				style = remoteStyleTryAgain;
// 			} catch(e) {
// 				console.log('Style is unavailable in this document.')
// 			}
// 		}
// 	}
// 	// console.log('=========================')
// 	if (typeof style !== 'undefined') {
// 		style = {
// 			name: style.name,
// 			key: style.key,
// 			id: style.id,
// 			paints: style.paints,
// 			remote: style.remote,
// 			type: style.type,
// 		}
// 	}
// 	return style;
// }
const Themes = {
    storageKey: 'PLUGIN_fdffdfdffdfdf4rfgf',
    themes: [],
    listThemes() {
        return __awaiter(this, void 0, void 0, function* () {
            const storage = yield figma.clientStorage.getAsync(this.storageKey);
            this.themes = typeof storage === 'undefined' ? [] : storage;
            return this.themes;
        });
    },
    initPlugin() {
        return __awaiter(this, void 0, void 0, function* () {
            const storage = yield figma.clientStorage.getAsync(this.storageKey);
            this.themes = typeof storage === 'undefined' ? [] : storage;
            yield this.checkStylesForRemote(this.themes);
            yield figma.clientStorage.setAsync(this.storageKey, this.themes);
            figma.ui.postMessage({
                themes: Themes.themes
            });
        });
    },
    // PATTERN
    // 1. Sync local storage to this.themes
    // 2. Manipulate this.themes
    // 3. Sync to local storage
    // 4. Send a plugin update
    addNewTheme() {
        return __awaiter(this, void 0, void 0, function* () {
            const theme = new Theme(`New Theme ${this.themes.length + 1}`);
            const storage = yield figma.clientStorage.getAsync(this.storageKey);
            this.themes.push(theme);
            yield figma.clientStorage.setAsync(this.storageKey, this.themes);
            figma.ui.postMessage({
                themes: this.themes
            });
        });
    },
    checkStylesForRemote(themes) {
        return __awaiter(this, void 0, void 0, function* () {
            // console.log(themes)
            for (let theme of themes) {
                for (let swap of theme.swaps) {
                    // from
                    if (figma.getStyleById(swap.from.id) == null) {
                        if (!!swap.from.key) {
                            try {
                                const style = yield figma.importStyleByKeyAsync(swap.from.key);
                                swap.from.remote = style.remote;
                                swap.from.name = style.name;
                                swap.from.paints = style.paints;
                                swap.from.type = style.type;
                                swap.from.missing = false;
                                // console.log(style)
                                // console.log(`${swap.from.name} is a TEAM STYLE in ${theme.name}.`)
                            }
                            catch (e) {
                                swap.from.missing = true;
                                console.log(e);
                                // console.log(`No team style associated with ${swap.from.name} in theme ${theme.name}`)
                            }
                        }
                    }
                    else if (figma.getStyleById(swap.from.id) != null) {
                        swap.from.missing = false;
                        swap.from.remote = false;
                    }
                    else {
                        console.log(`Could not find ${swap.from.name} in ${theme.name} locally or in team library.`);
                    }
                    if (figma.getStyleById(swap.to.id) == null) {
                        if (!!swap.to.key) {
                            try {
                                const style = yield figma.importStyleByKeyAsync(swap.to.key);
                                swap.to.remote = style.remote;
                                swap.to.name = style.name;
                                swap.to.paints = style.paints;
                                swap.to.type = style.type;
                                swap.to.missing = false;
                                // console.log(style)
                                // console.log(`${swap.to.name} is a TEAM STYLE in ${theme.name}.`)
                            }
                            catch (e) {
                                swap.to.missing = true;
                                console.log(e);
                                // console.log(`No team style associated with ${swap.to.name} in theme ${theme.name}`)
                            }
                        }
                    }
                    else if (figma.getStyleById(swap.to.id) != null) {
                        swap.to.missing = false;
                        swap.to.remote = false;
                    }
                    else {
                        console.log(`Could not find ${swap.to.name} in ${theme.name} locally or in team library.`);
                    }
                }
            }
        });
    },
    addOrUpdateTheme(theme) {
        return __awaiter(this, void 0, void 0, function* () {
            const storage = yield figma.clientStorage.getAsync(this.storageKey);
            this.themes = storage;
            for (var i = this.themes.length - 1; i >= 0; i--) {
                if (this.themes[i].id === theme.id) {
                    this.themes[i] = theme;
                }
            }
            yield figma.clientStorage.setAsync(this.storageKey, this.themes);
            figma.ui.postMessage({
                themes: this.themes
            });
        });
    },
    getIndexFromThemeId(id) {
        for (let index in this.themes) {
            if (this.themes[index].id === id) {
                return index;
                // return this.themes[i]
            }
        }
    },
    getThemeObjFromId(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const storage = yield figma.clientStorage.getAsync(this.storageKey);
            this.themes = storage;
            const theme = this.themes.filter((item) => item.id === id);
            return theme;
        });
    },
    deleteTheme(theme) {
        return __awaiter(this, void 0, void 0, function* () {
            const storage = yield figma.clientStorage.getAsync(this.storageKey);
            this.themes = storage;
            this.themes.splice(theme.index, 1);
            yield figma.clientStorage.setAsync(this.storageKey, this.themes);
            figma.ui.postMessage({
                themes: this.themes
            });
        });
    },
    addSwapPair(theme) {
        return __awaiter(this, void 0, void 0, function* () {
            // console.log(theme)
            const storage = yield figma.clientStorage.getAsync(this.storageKey);
            this.themes = storage;
            const swap = new Swap(this.themes[theme.index]);
            this.themes[theme.index].swaps.push(swap);
            // console.log(this.themes)
            yield figma.clientStorage.setAsync(this.storageKey, this.themes);
            figma.ui.postMessage({
                themes: this.themes
            });
        });
    },
    deleteSwapPair(theme, swap) {
        return __awaiter(this, void 0, void 0, function* () {
            // theme is an index
            const storage = yield figma.clientStorage.getAsync(this.storageKey);
            this.themes = storage;
            this.themes[theme].swaps.splice(swap.index, 1);
            yield figma.clientStorage.setAsync(this.storageKey, this.themes);
            figma.ui.postMessage({
                themes: this.themes
            });
        });
    },
    updateThemes(themes) {
        return __awaiter(this, void 0, void 0, function* () {
            this.themes = themes;
            yield figma.clientStorage.setAsync(this.storageKey, this.themes);
            figma.ui.postMessage({
                themes: themes
            });
        });
    },
    applyTheme(nodes, theme) {
        for (const node of nodes) {
            // console.log(node)
            // this.swapStyle(node, this.getStyles(node), this.themes[theme])
            this.swapStyle(node, this.themes[theme]);
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
    swapStyle(node, theme) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!!node.fillStyleId) {
                const regex = /(S:)(.+)(,)/;
                const match = regex.exec(node.fillStyleId);
                const id = match[1] + match[2] + match[3];
                const key = match[2];
                for (let swap of theme.swaps) {
                    if (id === swap.from.id && !swap.to.remote) {
                        node.fillStyleId = swap.to.id;
                        console.log(`Swapped to local style ${swap.to.name}`);
                    }
                    else if (id === swap.to.id && !swap.from.remote) {
                        node.fillStyleId = swap.from.id;
                        console.log(`Swapped to local style ${swap.from.name}`);
                    }
                    else if (id === swap.from.id && swap.to.remote) {
                        try {
                            const remoteStyle = yield figma.importStyleByKeyAsync(swap.to.key);
                            node.fillStyleId = remoteStyle.id;
                            console.log(`Swapped to team style ${swap.to.name}`);
                        }
                        catch (e) {
                            console.log(e);
                        }
                    }
                    else if (id === swap.to.id && swap.from.remote) {
                        try {
                            const remoteStyle = yield figma.importStyleByKeyAsync(swap.from.key);
                            node.fillStyleId = remoteStyle.id;
                            console.log(`Swapped to team style ${swap.from.name}`);
                        }
                        catch (e) {
                            console.log(e);
                        }
                    }
                }
            }
            if (!!node.strokeStyleId) {
                const regex = /(S:)(.+)(,)/;
                const match = regex.exec(node.strokeStyleId);
                const id = match[1] + match[2] + match[3];
                const key = match[2];
                for (let swap of theme.swaps) {
                    if (id === swap.from.id && !swap.to.remote) {
                        node.strokeStyleId = swap.to.id;
                        console.log(`Swapped to local style ${swap.to.name}`);
                    }
                    else if (id === swap.to.id && !swap.from.remote) {
                        node.strokeStyleId = swap.from.id;
                        console.log(`Swapped to local style ${swap.from.name}`);
                    }
                    else if (id === swap.from.id && swap.to.remote) {
                        try {
                            const remoteStyle = yield figma.importStyleByKeyAsync(swap.to.key);
                            node.strokeStyleId = remoteStyle.id;
                            console.log(`Swapped to team style ${swap.to.name}`);
                        }
                        catch (e) {
                            console.log(e);
                        }
                    }
                    else if (id === swap.to.id && swap.from.remote) {
                        try {
                            const remoteStyle = yield figma.importStyleByKeyAsync(swap.from.key);
                            node.strokeStyleId = remoteStyle.id;
                            console.log(`Swapped to team style ${swap.from.name}`);
                        }
                        catch (e) {
                            console.log(e);
                        }
                    }
                }
            }
            if (!!node.effectStyleId) {
                const regex = /(S:)(.+)(,)/;
                const match = regex.exec(node.effectStyleId);
                const id = match[1] + match[2] + match[3];
                const key = match[2];
                for (let swap of theme.swaps) {
                    if (id === swap.from.id && !swap.to.remote) {
                        node.effectStyleId = swap.to.id;
                        console.log(`Swapped to local style ${swap.to.name}`);
                    }
                    else if (id === swap.to.id && !swap.from.remote) {
                        node.effectStyleId = swap.from.id;
                        console.log(`Swapped to local style ${swap.from.name}`);
                    }
                    else if (id === swap.from.id && swap.to.remote) {
                        try {
                            const remoteStyle = yield figma.importStyleByKeyAsync(swap.to.key);
                            node.effectStyleId = remoteStyle.id;
                            console.log(`Swapped to team style ${swap.to.name}`);
                        }
                        catch (e) {
                            console.log(e);
                        }
                    }
                    else if (id === swap.to.id && swap.from.remote) {
                        try {
                            const remoteStyle = yield figma.importStyleByKeyAsync(swap.from.key);
                            node.effectStyleId = remoteStyle.id;
                            console.log(`Swapped to team style ${swap.from.name}`);
                        }
                        catch (e) {
                            console.log(e);
                        }
                    }
                }
            }
        });
    },
    addSwapPairFromSelection(selection, theme) {
        return __awaiter(this, void 0, void 0, function* () {
            // console.log(theme)
            const storage = yield figma.clientStorage.getAsync(this.storageKey);
            this.themes = storage;
            // const swap = new Swap(this.themes[theme.index]);
            for (let nodes of selection) {
                const swap = new Swap(this.themes[theme.index]);
                for (let node of nodes.children) {
                    const from_swaps = [], to_swaps = [];
                    for (let swaps_used of this.themes[theme.index].swaps) {
                        from_swaps.push(swaps_used.from.id);
                        to_swaps.push(swaps_used.to.id);
                    }
                    if (node.name === 'from') {
                        if (!!node.fillStyleId) {
                            let from_fill = figma.getStyleById(node.fillStyleId);
                            if (!from_swaps.includes(`S:${from_fill.key},`)) {
                                swap.from.id = `S:${from_fill.key},`;
                                swap.from.name = from_fill.name;
                                swap.from.key = from_fill.key;
                                swap.from.remote = from_fill.remote;
                                swap.from.paints = from_fill.paints;
                                swap.from.type = from_fill.type;
                            }
                            else {
                                figma.notify(`Selection contains duplicate PAINT style in swap column 1: ${from_fill.name}`);
                                return;
                            }
                        }
                        else if (!!node.effectStyleId) {
                            let from_fill = figma.getStyleById(node.effectStyleId);
                            if (!from_swaps.includes(`S:${from_fill.key},`)) {
                                swap.from.id = `S:${from_fill.key},`;
                                swap.from.name = from_fill.name;
                                swap.from.key = from_fill.key;
                                swap.from.remote = from_fill.remote;
                                swap.from.effects = from_fill.effects;
                                swap.from.type = from_fill.type;
                            }
                            else {
                                figma.notify(`Selection contains duplicate EFFECT style in swap column 1: ${from_fill.name}`);
                                return;
                            }
                        }
                        // 	console.log(node.effectStyleId)
                        // }
                        // if (!!node.strokeStyleId) {
                        // 	console.log(node.strokeStyleId)
                        // }
                    }
                    if (node.name === 'to') {
                        if (!!node.fillStyleId) {
                            let to_fill = figma.getStyleById(node.fillStyleId);
                            if (!to_swaps.includes(`S:${to_fill.key},`)) {
                                swap.to.id = `S:${to_fill.key},`;
                                swap.to.name = to_fill.name;
                                swap.to.key = to_fill.key;
                                swap.to.remote = to_fill.remote;
                                swap.to.paints = to_fill.paints;
                                swap.to.type = to_fill.type;
                            }
                            else {
                                figma.notify(`Selection contains duplicate PAINT style in swap column 2: ${to_fill.name}`);
                                return;
                            }
                        }
                        else if (!!node.effectStyleId) {
                            let to_fill = figma.getStyleById(node.effectStyleId);
                            if (!to_swaps.includes(`S:${to_fill.key},`)) {
                                swap.to.id = `S:${to_fill.key},`;
                                swap.to.name = to_fill.name;
                                swap.to.key = to_fill.key;
                                swap.to.remote = to_fill.remote;
                                swap.to.effects = to_fill.effects;
                                swap.to.type = to_fill.type;
                            }
                            else {
                                figma.notify(`Selection contains duplicate EFFECT style in swap column 2: ${to_fill.name}`);
                                return;
                            }
                        }
                    }
                }
                this.themes[theme.index].swaps.push(swap);
            }
            yield figma.clientStorage.setAsync(this.storageKey, this.themes);
            figma.ui.postMessage({
                themes: this.themes
            });
        });
    }
};
Themes.initPlugin();
figma.showUI(__html__, { width: 450, height: 500 });
const styles = [];
const paints = figma.getLocalPaintStyles();
const effects = figma.getLocalEffectStyles();
for (let obj of paints) {
    let o = {
        id: '',
        name: '',
        label: '',
        value: '',
        type: '',
        key: '',
        remote: false,
        // paints: Array[]
        paints: [],
    };
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
    styles.push(o);
}
for (let obj of effects) {
    let o = {
        id: '',
        name: '',
        label: '',
        value: '',
        type: '',
        key: '',
        remote: false,
        effects: [],
    };
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
    styles.push(o);
}
// const localStyles = localPaintStyles;
// This will fetch all the local styles in the current document.
figma.ui.postMessage({
    localStylesFetched: {
        localStyles: styles
    }
});
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
        const selection = figma.currentPage.selection;
        Themes.addSwapPairFromSelection(selection, msg.theme);
    }
    if (msg.type === 'applyTheme') {
        const selection = figma.currentPage.selection;
        const swapMap = {};
        for (let swap of Themes.themes[msg.themes.index].swaps) {
            swapMap[swap.from.id] = swap.to.id;
            swapMap[swap.to.id] = swap.from.id;
        }
        // console.log(swapMap)
        Themes.applyTheme(selection, msg.themes);
    }
};
