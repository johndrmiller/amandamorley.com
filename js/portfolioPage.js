import {groupListeners} from "/js/modules/groupListeners.js";
import {changeGallery} from "/js/modules/changeGallery.js";
import {galleriesArray, portfolioNavArray, galleryImages} from "/js/modules/HTMLConstants.js";
import {openImagePreview} from "/js/modules/imagePreview.js";

/*
    * This file is divided into sections
    *   Variable declaration - Beginning
    *   OnLoad image preview opening - around line 35
    *   Group listeners function - around line 75
    *   The section that controls the switching of the different gallery types (or "tabs") - around line 90
    *   The image preview section - around line 150
    *       The image preview section has several distinct parts as well:
    *       Changing images in preview - around line 265
    *       Zooming in and out of images - around line 330
    *       Dragging the image - around line 474
*/

//* Opening image previews on page load- onload function checks for URL parameters, and parses them if they exist
//* From there the appropriate elements are found and custom events trigger the tab switching and gallery preview opening
window.onload = function () {
    if (window.location.search == "") return        
    parseURL();
}

function parseURL()      {
    let params = new URLSearchParams(window.location.search);
    let imageCode = params.get("image");
    let imageElement, galleryElement;

    galleryElement = galleriesArray.find(function(arrays) {
        return [...[...arrays.children][0].children].find(function(item) {
            if(item.dataset.append == imageCode) {
                imageElement = item;
            }
            return item.dataset.append == imageCode;
        });
    });
    
    tabSwitchOnOpen(galleryElement);
    imagePreviewOnOpen(imageElement);   
}

function imagePreviewOnOpen(imageElement) {
    imageElement.addEventListener("notClick", openImagePreview, {once:true});
    imageElement.dispatchEvent(new CustomEvent("notClick", {}));
}

function tabSwitchOnOpen(galleryElement) {
    let nextTab = portfolioNavArray.find(function(element) {
        return element.dataset.gallery == galleryElement.id
    });
    nextTab.addEventListener("notClick2", changeGallery, {once:true});
    nextTab.dispatchEvent(new CustomEvent("notClick2", {}));
}


groupListeners([
    {ele:portfolioNavArray, ev:"click", fun: changeGallery, action:"add"},
    {ele:galleryImages, ev:"click", fun:openImagePreview, action:"add"}
]);
