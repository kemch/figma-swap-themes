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
    assignId() {
        return __awaiter(this, void 0, void 0, function* () {
            const storage = yield Themes.listThemes();
            return this.id = storage.length + 1;
        });
    }
}
class Swap {
    constructor(theme) {
        this.assignId(theme);
        this.to = { name: '', id: '' };
        this.from = { name: '', id: '' };
    }
    archive() {
        this.archived = true;
    }
    unarchive() {
        this.archived = false;
    }
    assignId(theme) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.id = theme.swaps.length + 1;
        });
    }
}
const Themes = {
    storageKey: 'PLUGIN_fdfdffdfdf4rfgf',
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
                themes: this.themes
            });
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
    }
};
Themes.initPlugin();
figma.showUI(__html__, { width: 420, height: 500 });
const paints = figma.getLocalPaintStyles();
const effects = figma.getLocalEffectStyles();
let localPaintStyles = [];
let localEffectStyles = [];
for (let obj of paints) {
    let o = {
        id: '',
        name: '',
        label: '',
        value: '',
        type: '',
        // paints: Array[]
        paints: [],
    };
    o.id = obj.id;
    // o.key = obj.key;
    o.name = figma.getStyleById(obj.id).name;
    o.label = figma.getStyleById(obj.id).name;
    o.value = obj.id;
    o.type = obj.type;
    for (let paint of obj.paints) {
        o.paints.push(paint);
    }
    localPaintStyles.push(o);
}
// paints.map( obj => {
// 	// o.paints = obj.paints;
// 	// return o;
// });
for (let obj of effects) {
    let o = {
        id: '',
        name: '',
        label: '',
        value: '',
        type: '',
        effects: [],
    };
    o.id = obj.id;
    o.name = figma.getStyleById(obj.id).name;
    o.label = figma.getStyleById(obj.id).name;
    o.value = obj.id;
    o.type = obj.type;
    console.log(o);
    for (let effect of obj.effects) {
        o.effects.push(effect);
    }
}
// const localStyles = localPaintStyles;
const localStyles = localPaintStyles.concat(localEffectStyles);
// This will fetch all the local styles in the current document.
figma.ui.postMessage({
    localStylesFetched: {
        localStyles: localStyles
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
    // One way of distinguishing between different types of messages sent from
    // your HTML page is to use an object with a "type" property like this.
    // Make sure to close the plugin when you're done. Otherwise the plugin will
    // keep running, which shows the cancel button at the bottom of the screen.
    // figma.closePlugin();
};
