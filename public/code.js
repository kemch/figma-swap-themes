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
    constructor(theme) {
        this.to = { name: '', id: '', key: '', remote: false };
        this.from = { name: '', id: '', key: '', remote: false };
        this.id = this.assignId(theme);
    }
    assignId(theme) {
        let id = +new Date;
        for (let t of theme.swaps) {
            console.log(t);
            do {
                id = id + 1;
            } while (t.id === id);
        }
        return this.id = id;
    }
}
const Themes = {
    storageKey: 'ffd',
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
                themes: this.themes,
                editNew: theme
            });
        });
    },
    loadStylesInThemeEdit(theme) {
        return __awaiter(this, void 0, void 0, function* () {
            const storage = yield figma.clientStorage.getAsync(this.storageKey);
            yield this.checkStylesForRemote([this.themes[theme.index]]);
            yield figma.clientStorage.setAsync(this.storageKey, this.themes);
            figma.ui.postMessage({
                themes: Themes.themes
            });
        });
    },
    checkStylesForRemote(themes) {
        return __awaiter(this, void 0, void 0, function* () {
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
                    }
                    else if (!localStyles.includes(swap.from.id)) {
                        swap.from.missing = true;
                        // check if the style is from a team library
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
                            // it always throws a 404
                            swap.from.missing = true;
                            console.log(e);
                            // console.log(`No team style associated with ${swap.from.name} in theme ${theme.name}`)
                        }
                    }
                    else {
                        console.log('nothing here');
                    }
                    // check TO
                    if (localStyles.includes(swap.to.id)) {
                        swap.to.missing = false;
                        swap.to.remote = false;
                        // this assumes the style was previously local.
                    }
                    else if (!localStyles.includes(swap.from.id)) {
                        swap.to.missing = true;
                        try {
                            const style = yield figma.importStyleByKeyAsync(swap.to.key);
                            swap.to.remote = style.remote;
                            swap.to.name = style.name;
                            swap.to.paints = style.paints;
                            swap.to.type = style.type;
                            swap.to.missing = false;
                        }
                        catch (e) {
                            // it always throws a 404
                            swap.to.missing = true;
                            console.log(e);
                        }
                    }
                    else {
                        console.log('nothing here');
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
            // this.themes[theme].swaps.splice(swap.index, 1);
            let swapIndexFromId = this.themes[theme].swaps.map(item => item.id).indexOf(swap.swap.id);
            ~swapIndexFromId && this.themes[theme].swaps.splice(swapIndexFromId, 1);
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
    importThemes(newThemes) {
        return __awaiter(this, void 0, void 0, function* () {
            const storage = yield figma.clientStorage.getAsync(this.storageKey);
            this.themes = storage;
            const ids = this.themes.map(e => e.id);
            // will replace themes with id
            // for (let theme of newThemes) {
            // 	if (ids.includes(theme.id)) {
            // 		console.log('hi')
            // 		this.themes[theme.id] = theme;
            // 	} else {
            // 		this.themes.push(theme);
            // 	}
            // }
            for (let newTheme of newThemes) {
                // let timestamp = +new Date;
                // newTheme.id = timestamp + 1;
                for (let theme of this.themes) {
                    do {
                        newTheme.id = theme.id + 1;
                    } while (newTheme.id == theme.id);
                }
                this.themes.push(newTheme);
            }
            yield figma.clientStorage.setAsync(this.storageKey, this.themes);
            figma.ui.postMessage({
                themes: this.themes
            });
        });
    },
    duplicateTheme(theme) {
        return __awaiter(this, void 0, void 0, function* () {
            const storage = yield figma.clientStorage.getAsync(this.storageKey);
            this.themes = storage;
            const ids = this.themes.map(e => e.id);
            const newTheme = new Theme(`Copy of ${theme.name}`);
            newTheme.swaps = theme.swaps;
            this.themes.push(newTheme);
            yield figma.clientStorage.setAsync(this.storageKey, this.themes);
            figma.ui.postMessage({
                themes: this.themes,
                editNew: newTheme
            });
        });
    },
    applyStyleToCanvasNode(swap, i) {
        return __awaiter(this, void 0, void 0, function* () {
            const labelFrom = figma.createText();
            const labelTo = figma.createText();
            const nodeFrom = figma.createRectangle();
            const nodeTo = figma.createRectangle();
            const centerX = figma.viewport.center.x;
            const centerY = figma.viewport.center.y;
            labelFrom.name = swap.from.name;
            labelFrom.fontName = { family: "Inter", style: "Medium" };
            labelFrom.characters = swap.from.name;
            labelFrom.textAlignHorizontal = "CENTER";
            labelFrom.fontSize = 6;
            labelFrom.x = centerX;
            labelFrom.y = centerY + 55;
            labelTo.name = swap.to.name;
            labelTo.fontName = { family: "Inter", style: "Medium" };
            labelTo.characters = swap.to.name;
            labelTo.textAlignHorizontal = "CENTER";
            labelTo.fontSize = 6;
            labelTo.x = centerX + 65;
            labelTo.y = centerY + 55;
            nodeFrom.name = "from";
            nodeTo.name = "to";
            nodeFrom.resize(50, 50);
            nodeTo.resize(50, 50);
            nodeFrom.x = centerX;
            nodeTo.x = centerX + 65;
            nodeFrom.y = centerY;
            nodeTo.y = centerY;
            const group = figma.group([nodeFrom, nodeTo, labelFrom, labelTo], figma.currentPage);
            group.name = `swap pair ${i}`;
            group.y = centerY + (i * 70);
            // from
            if (swap.from.type === 'EFFECT') {
                console.log('effect');
                if (swap.from.remote === true) {
                    console.log('remote');
                    try {
                        const remoteStyle = yield figma.importStyleByKeyAsync(swap.from.key);
                        console.log(remoteStyle);
                        nodeFrom.effectStyleId = remoteStyle.id;
                    }
                    catch (e) {
                        console.log(e);
                    }
                }
                else if (figma.getStyleById(swap.from.id) != null) {
                    console.log('null');
                    nodeFrom.effectStyleId = swap.from.id;
                }
                else {
                    console.log('nothing happened');
                    labelFrom.characters += ' (missing)';
                }
            }
            else if (swap.from.type === 'PAINT') {
                if (swap.from.remote === true) {
                    try {
                        const remoteStyle = yield figma.importStyleByKeyAsync(swap.from.key);
                        console.log(remoteStyle);
                        nodeFrom.fillStyleId = remoteStyle.id;
                    }
                    catch (e) {
                        console.log(e);
                    }
                }
                else if (figma.getStyleById(swap.from.id) != null) {
                    nodeFrom.fillStyleId = swap.from.id;
                }
                else {
                    console.log('nothing happened');
                    labelFrom.characters += ' (missing)';
                }
            }
            // to
            if (swap.to.type === 'EFFECT') {
                if (swap.to.remote === true) {
                    try {
                        const remoteStyle = yield figma.importStyleByKeyAsync(swap.to.key);
                        console.log(remoteStyle);
                        nodeTo.effectStyleId = remoteStyle.id;
                    }
                    catch (e) {
                        console.log(e);
                    }
                }
                else if (figma.getStyleById(swap.to.id) != null) {
                    nodeTo.effectStyleId = swap.to.id;
                }
                else {
                    console.log('nothing happened');
                    labelTo.characters += ' (missing)';
                }
            }
            else if (swap.to.type === 'PAINT') {
                if (swap.to.remote === true) {
                    try {
                        const remoteStyle = yield figma.importStyleByKeyAsync(swap.to.key);
                        nodeTo.fillStyleId = remoteStyle.id;
                    }
                    catch (e) {
                        console.log(e);
                    }
                }
                else if (figma.getStyleById(swap.to.id) != null) {
                    nodeTo.fillStyleId = swap.to.id;
                }
                else {
                    console.log('nothing happened');
                    labelTo.characters += ' (missing)';
                }
            }
        });
    },
    buildThemeOnCanvas(theme) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield figma.loadFontAsync({ family: "Inter", style: "Medium" });
            }
            catch (e) {
                console.log(e);
            }
            for (let i = theme.swaps.length - 1; i >= 0; i--) {
                yield Themes.applyStyleToCanvasNode(theme.swaps[i], i);
            }
        });
    },
    applyTheme(nodes, theme) {
        for (const node of nodes) {
            if (node.type === "TEXT" && typeof node.fillStyleId == "symbol") {
                let segments = node.getStyledTextSegments(['fillStyleId']);
                for (let segment of node.getStyledTextSegments(['fillStyleId'])) {
                    this.swapStyle(node, this.themes[theme.index], segment);
                }
            }
            else {
                this.swapStyle(node, this.themes[theme.index]);
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
    swapStyle(node, theme, segment) {
        return __awaiter(this, void 0, void 0, function* () {
            let n;
            if (typeof segment == 'undefined') {
                n = node;
            }
            else {
                n = segment;
            }
            if (!!n.fillStyleId) {
                const regex = /(S:)(.+)(,)/;
                const match = regex.exec(n.fillStyleId);
                const id = match[1] + match[2] + match[3];
                const key = match[2];
                for (let swap of theme.swaps) {
                    if (id === swap.from.id && !swap.to.remote) {
                        if (typeof segment == "undefined") {
                            node.fillStyleId = swap.to.id;
                        }
                        else {
                            node.setRangeFillStyleId(segment.start, segment.end, swap.to.id);
                        }
                        console.log(`Swapped to local style ${swap.to.name}`);
                    }
                    else if (id === swap.to.id && !swap.from.remote) {
                        if (typeof segment == "undefined") {
                            node.fillStyleId = swap.from.id;
                        }
                        else {
                            node.setRangeFillStyleId(segment.start, segment.end, swap.from.id);
                        }
                        console.log(`Swapped to local style ${swap.from.name}`);
                    }
                    else if (id === swap.from.id && swap.to.remote) {
                        try {
                            const remoteStyle = yield figma.importStyleByKeyAsync(swap.to.key);
                            if (typeof segment == "undefined") {
                                node.fillStyleId = remoteStyle.id;
                            }
                            else {
                                node.setRangeFillStyleId(segment.start, segment.end, remoteStyle.id);
                            }
                            console.log(`Swapped to team style ${swap.to.name}`);
                        }
                        catch (e) {
                            console.log(e);
                        }
                    }
                    else if (id === swap.to.id && swap.from.remote) {
                        try {
                            const remoteStyle = yield figma.importStyleByKeyAsync(swap.from.key);
                            if (typeof segment == "undefined") {
                                node.fillStyleId = remoteStyle.id;
                            }
                            else {
                                console.log('HI');
                                node.setRangeFillStyleId(segment.start, segment.end, remoteStyle.id);
                            }
                            console.log(`Swapped to team style ${swap.from.name}`);
                        }
                        catch (e) {
                            console.log(e);
                        }
                    }
                }
            }
            if (!!n.strokeStyleId) {
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
            if (!!n.effectStyleId) {
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
figma.showUI(__html__, { width: 320, height: 400 });
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
