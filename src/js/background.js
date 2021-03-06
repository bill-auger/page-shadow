/* Page Shadow
 *
 * Copyright (C) 2015-2018 Eliastik (eliastiksofts.com)
 *
 * This file is part of Page Shadow.
 *
 * Page Shadow is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Page Shadow is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Page Shadow.  If not, see <http://www.gnu.org/licenses/>. */
function setPopup() {
    if(typeof(chrome.browserAction.setPopup) !== 'undefined') {
        chrome.browserAction.setPopup({
            popup: "../extension.html"
        });
    } else if(typeof(chrome.browserAction.onClicked) !== 'undefined') {
        // For Firefox for Android
        chrome.browserAction.onClicked.addListener(function(tab) {
            if(typeof(tab.id) !== "undefined") {
                chrome.tabs.create({
                    url: "../extension.html?tabId="+ tab.id
                });
            } else {
                chrome.tabs.create({
                    url: "../extension.html"
                });
            }
        });
    }
}

function createContextMenu(id, type, title, contexts, checked) {
    if(typeof(chrome.contextMenus.create) !== 'undefined') {
        chrome.contextMenus.create({
            id: id,
            type: type,
            title: title,
            contexts: contexts,
            checked: checked
        }, function() {
            if(chrome.runtime.lastError) return; // ignore the error messages
        });
    }
}

function updateContextMenu(id, type, title, contexts, checked) {
    if(typeof(chrome.contextMenus.update) !== 'undefined') {
        chrome.contextMenus.update(id, {
            type: type,
            title: title,
            contexts: contexts,
            checked: checked
        }, function() {
            if(chrome.runtime.lastError) return; // ignore the error messages
        });
    }
}

function deleteContextMenu(id) {
    if(typeof(chrome.contextMenus.remove) !== 'undefined') {
        chrome.contextMenus.remove(id);
    }
}

function menu() {
    function createMenu() {
        chrome.storage.local.get(['sitesInterditPageShadow', 'whiteList', 'globallyEnable'], function (result) {
            if(result.sitesInterditPageShadow == null || typeof(result.sitesInterditPageShadow) == 'undefined' || result.sitesInterditPageShadow.trim() == '') {
                var siteInterdits = "";
            } else {
                var siteInterdits = result.sitesInterditPageShadow.split("\n");
            }

            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                var tabUrl = tabs[0].url;

                var url = new URL(tabUrl);
                var domain = url.hostname;
                var href = url.href;

                if(result.whiteList == "true") {
                    if(strict_in_array(domain, siteInterdits)) {
                        createContextMenu("disable-website", "checkbox", getUImessage("disableWebsite"), ["all"], false);
                    } else {
                        createContextMenu("disable-website", "checkbox", getUImessage("disableWebsite"), ["all"], true);
                    }
                } else {
                    if(strict_in_array(domain, siteInterdits)) {
                        createContextMenu("disable-website", "checkbox", getUImessage("disableWebsite"), ["all"], true);
                    } else {
                        createContextMenu("disable-website", "checkbox", getUImessage("disableWebsite"), ["all"], false);
                    }

                    if(strict_in_array(href, siteInterdits)) {
                        createContextMenu("disable-webpage", "checkbox", getUImessage("disableWebpage"), ["all"], true);
                    } else {
                        createContextMenu("disable-webpage", "checkbox", getUImessage("disableWebpage"), ["all"], false);
                    }
                }
            });
            
            if(result.globallyEnable == "false") {
                createContextMenu("disable-globally", "checkbox", getUImessage("disableGlobally"), ["all"], true);
            } else {
                createContextMenu("disable-globally", "checkbox", getUImessage("disableGlobally"), ["all"], false);
            }
        });
    }

    if(typeof(chrome.contextMenus.removeAll) !== 'undefined') {
        chrome.contextMenus.removeAll(function() {
            createMenu();
        });
    } else {
        createMenu();
    }
}

function updateMenu() {
    menu();
}

setPopup();
menu();

if(typeof(chrome.storage.onChanged) !== 'undefined') {
    chrome.storage.onChanged.addListener(function() {
        menu();
    });
}

if(typeof(chrome.tabs.onActivated) !== 'undefined') {
    chrome.tabs.onActivated.addListener(function() {
        menu();
    });
}

if(typeof(chrome.tabs.onUpdated) !== 'undefined') {
    chrome.tabs.onUpdated.addListener(function() {
        menu();
    });
}

if(typeof(chrome.contextMenus.onClicked) !== 'undefined') {
    chrome.contextMenus.onClicked.addListener((info, tab) => {
        chrome.storage.local.get(['sitesInterditPageShadow', 'whiteList'], function (result) {
            var disabledWebsites = '';
            var disabledWebsitesEmpty = false;
            var url = new URL(tab.url);
            var domain = url.hostname;

            if(result.sitesInterditPageShadow == null || typeof(result.sitesInterditPageShadow) == 'undefined') {
                var disabledWebsitesEmpty = true;
                var disabledWebsitesArray = [];
            } else {
                var disabledWebsites = result.sitesInterditPageShadow;
                var disabledWebsitesArray = disabledWebsites.split("\n");
                var disabledWebsitesEmpty = false;
            }

            switch (info.menuItemId) {
                case "disable-website":
                    if(result.whiteList == "true") {
                        if(info.checked == true && info.wasChecked == false) {
                            var disabledWebsitesNew = removeA(disabledWebsitesArray, domain);
                            var disabledWebsitesNew = removeA(disabledWebsitesArray, "").join("\n");
                            setSettingItem("sitesInterditPageShadow", disabledWebsitesNew.trim());
                        } else {
                            disabledWebsitesArray.push(domain);
                            var disabledWebsitesNew = removeA(disabledWebsitesArray, "").join("\n")

                            setSettingItem("sitesInterditPageShadow", disabledWebsitesNew);
                        }
                    } else {
                        if(info.checked == true && info.wasChecked == false) {
                            disabledWebsitesArray.push(domain);
                            var disabledWebsitesNew = removeA(disabledWebsitesArray, "").join("\n")

                            setSettingItem("sitesInterditPageShadow", disabledWebsitesNew);
                        } else {
                            var disabledWebsitesNew = removeA(disabledWebsitesArray, domain);
                            var disabledWebsitesNew = removeA(disabledWebsitesArray, "").join("\n");
                            setSettingItem("sitesInterditPageShadow", disabledWebsitesNew.trim());
                        }
                    }
                    break;
                case "disable-webpage":
                    if(info.checked == true && info.wasChecked == false) {
                        disabledWebsitesArray.push(tab.url);
                        var disabledWebsitesNew = removeA(disabledWebsitesArray, "").join("\n")

                        setSettingItem("sitesInterditPageShadow", disabledWebsitesNew);
                    } else {
                        var disabledWebsitesNew = removeA(disabledWebsitesArray, tab.url);
                        var disabledWebsitesNew = removeA(disabledWebsitesArray, "").join("\n");
                        setSettingItem("sitesInterditPageShadow", disabledWebsitesNew.trim());
                    }
                    break;
                case "disable-globally":
                    if(info.checked == true && info.wasChecked == false) {
                        setSettingItem("globallyEnable", "false");
                    } else {
                        setSettingItem("globallyEnable", "true");
                    }
                    break;
            }
        });
    });
}
