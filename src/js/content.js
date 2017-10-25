/* Page Shadow
 * 
 * Copyright (C) 2015-2017 Eliastik (eliastiksofts.com)
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
(function(){
    /* Check if the configuration variables are set, if not set some default values (the variables are set globally, so we use window[variableName]) */
    if(typeof(window["nbThemes"]) == "undefined") nbThemes = 15;
    if(typeof(window["colorTemperaturesAvailable"]) == "undefined") colorTemperaturesAvailable = ["1000", "1200", "1500", "1800", "2000", "2200", "2600", "2900", "3100", "3600"];
    if(typeof(window["minBrightnessPercentage"]) == "undefined") minBrightnessPercentage = 0;
    if(typeof(window["maxBrightnessPercentage"]) == "undefined") maxBrightnessPercentage = 0.9;
    if(typeof(window["brightnessDefaultValue"]) == "undefined") brightnessDefaultValue = 0.15;
    
    function assombrirPage(pageShadowEnabled, theme, colorInvert, colorTemp) {
        if(pageShadowEnabled !== null && pageShadowEnabled == "true") {
            if(theme !== null) {
                if(theme == "1") {
                    document.body.classList.add("pageShadowContrastBlack");
                } else {
                    document.body.classList.add("pageShadowContrastBlack" + theme);
                }
            } else {
                document.body.classList.add("pageShadowContrastBlack");
            }
        }

        if(colorInvert !== null && colorInvert == "true") {
            document.body.classList.add("pageShadowInvertImageColor");
        }

        if(document.readyState == "complete" || document.readyState == "interactive") {
            mutationObserve("contrast");
        } else {
            window.onload = function() {
                mutationObserve("contrast");
            }
        }

        if(typeof timeOutAP !== "undefined") {
            clearTimeout(timeOutAP)
        }
    }

    function invertColor(enabled) {
        if(enabled !== null && enabled == "true") {
            document.body.classList.add("pageShadowInvertImageColor");

            if(document.readyState == "complete" || document.readyState == "interactive") {
                mutationObserve("invert");
            } else {
                window.onload = function() {
                    mutationObserve("invert");
                }
            }
        }

        if(typeof timeOutIC !== "undefined") {
            clearTimeout(timeOutIC)
        }
    }

    function luminositePage(enabled, pourcentage, nightmode, siteInterdits, colorTemp) {
        var elLum = document.createElement("div");
        elLum.setAttribute("class", "");

        if(enabled == "true") {
            elLum.style.display = "block";
            if(nightmode == "true") {
                elLum.setAttribute("id", "pageShadowLuminositeDivNightMode");
                elLum.setAttribute("class", "");
                
                var tempColor = "2000";
                
                if(colorTemp !== null) {
                    var tempIndex = parseInt(colorTemp);
                    var tempColor = colorTemperaturesAvailable[tempIndex - 1];
                    
                    elLum.setAttribute("class", "k" + tempColor);
                } else {
                    elLum.setAttribute("class", "k2000");
                }
            } else {
                elLum.setAttribute("id", "pageShadowLuminositeDiv");
            }
            
            if(pourcentage / 100 > maxBrightnessPercentage || pourcentage / 100 < minBrightnessPercentage || typeof pourcentage === "undefined" || typeof pourcentage == null) {
                elLum.style.opacity = brightnessDefaultValue;
            } else {
                elLum.style.opacity = pourcentage / 100;
            }

            applyAL(elLum);
        }
    }

    function appendLum(elLum) {
        if(document.getElementById("pageShadowLuminositeDiv") !== null) {
            document.body.removeChild(document.getElementById("pageShadowLuminositeDiv"));
        }

        if(document.getElementById("pageShadowLuminositeDivNightMode") !== null) {
            document.body.removeChild(document.getElementById("pageShadowLuminositeDivNightMode"));
        }

        document.body.appendChild(elLum);

        if(typeof timeOutLum !== "undefined") {
            clearTimeout(timeOutLum);
        }
    }

    function applyAL(element) {
        if (document.body) return appendLum(element);
        timeOutLum = setTimeout(function() { applyAL(element) }, 50);
    }

    function applyAP(pageShadowEnabled, theme, colorInvert, colorTemp) {
        if (document.body) return assombrirPage(pageShadowEnabled, theme, colorInvert, colorTemp);
        timeOutAP = setTimeout(function() { applyAP(pageShadowEnabled, theme, colorInvert, colorTemp) }, 50);
    }

    function applyIC(colorInvert) {
        if (document.body) return invertColor(colorInvert);
        timeOutIC = setTimeout(function() { applyIC(colorInvert) }, 50);
    }

    function mutationObserve(type) {
        if(type == "contrast") {
            mut_contrast = new MutationObserver(function(mutations, mut){
                mut_contrast.disconnect();
                var classList = document.body.classList;
                var containsPageContrast = true;

                for(i=1; i<=nbThemes; i++) {
                    if(i == "1" && !classList.contains("pageShadowContrastBlack")) {
                        var containsPageContrast = false;
                    } else if(!classList.contains("pageShadowContrastBlack" + i)) {
                        var containsPageContrast = false;
                    }
                }

                if(containsPageContrast == false || classList.contains("pageShadowInvertImageColor") == false) {
                    setTimeout(main("onlycontrast"), 1);
                }
            });
            mut_contrast.observe(document.body, {
                'attributes': true,
                'subtree': false,
                'childList': false,
                'attributeFilter': ["class"]
            });
        } else if(type == "invert") {
            mut_invert = new MutationObserver(function(mutations, mut){
                mut_invert.disconnect();
                var classList = document.body.classList;

                if(classList.contains("pageShadowInvertImageColor") == false) {
                    setTimeout(main("onlyInvert"), 1);
                }
            });
            mut_invert.observe(document.body, {
                'attributes': true,
                'subtree': false,
                'childList': false,
                'attributeFilter': ["class"]
            });
        }
    }

    function main(type) {
        chrome.storage.local.get(['sitesInterditPageShadow', 'pageShadowEnabled', 'theme', 'pageLumEnabled', 'pourcentageLum', 'nightModeEnabled', 'colorInvert', 'whiteList', 'colorTemp'], function (result) {
            if(typeof timeOutLum !== "undefined") clearTimeout(timeOutLum);
            if(typeof timeOutAP !== "undefined") clearTimeout(timeOutAP);
            if(typeof timeOutIC !== "undefined") clearTimeout(timeOutIC);
            if(typeof mut_contrast !== 'undefined') mut_contrast.disconnect();
            if(typeof mut_invert !== 'undefined') mut_invert.disconnect();

            if(type == "reset" || type == "onlyreset") {
                document.body.classList.remove("pageShadowInvertImageColor");

                for(i=1; i<=nbThemes; i++) {
                    if(i == "1") {
                        document.body.classList.remove("pageShadowContrastBlack");
                    } else {
                        document.body.classList.remove("pageShadowContrastBlack" + i);
                    }
                }

                if(document.getElementById("pageShadowLuminositeDiv") != null) {
                    document.body.removeChild(document.getElementById("pageShadowLuminositeDiv"));
                }

                if(document.getElementById("pageShadowLuminositeDivNightMode") != null) {
                    document.body.removeChild(document.getElementById("pageShadowLuminositeDivNightMode"));
                }

                if(type == "onlyreset") {
                    return;
                }
            }

            if(result.sitesInterditPageShadow !== "") {
                var siteInterdits = result.sitesInterditPageShadow.trim().split("\n");
            } else {
                var siteInterdits = "";
            }

            var websiteUrl = window.location.href;
            var websuteUrl_tmp = new URL(websiteUrl);
            var domain = websuteUrl_tmp.hostname;

            if(result.whiteList == "true" && strict_in_array(domain, siteInterdits) == true || result.whiteList !== "true" && strict_in_array(domain, siteInterdits) !== true && strict_in_array(websiteUrl, siteInterdits) !== true) {
                var pageShadowEnabled = result.pageShadowEnabled;
                var theme = result.theme;
                var colorInvert = result.colorInvert;
                var colorTemp = result.colorTemp;

                if(type == "onlyContrast") {
                    assombrirPage(pageShadowEnabled, theme, colorInvert, colorTemp);
                } else if(type == "onlyInvert") {
                    invertColor(colorInvert);
                } else if(pageShadowEnabled == "true") {
                    applyAP(pageShadowEnabled, theme, colorInvert, colorTemp);
                } else {
                    applyIC(colorInvert);
                }

                if(type !== "onlyContrast" && type !== "onlyInvert") {
                    luminositePage(result.pageLumEnabled, result.pourcentageLum, result.nightModeEnabled, siteInterdits, colorTemp);
                }
            }
        });
    }

    main();

    // Execute Page Shadow on the page when the settings have been changed:
    chrome.storage.onChanged.addListener(function() {
        chrome.storage.local.get('liveSettings', function (result) {
            if(result.liveSettings !== "false") {
                main('reset');
            }
        });
    });
}());
