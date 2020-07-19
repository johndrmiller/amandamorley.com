import {groupListeners} from "/js/modules/groupListeners.js";
import {portfolioNavArray, galleryImages, currentTab, galleriesArray, currentGallery, lastGalleryIndex, modifyVariable
} from "/js/modules/HTMLConstants.js";
import {openImagePreview} from "/js/modules/imagePreview.js"

export async function changeGallery(e) {
    const newGallery = await pickNewGallery(e);
    if (newGallery.clickedTab == currentTab) return
    newGallery.nextGallery.style.opacity = 0;
    groupListeners([
        {ele:portfolioNavArray, ev:"click", fun: changeGallery, action:"remove"},
        {ele:galleryImages,ev:"click", fun: openImagePreview, action:"remove"}
    ]);
    closeOldGallery().then(() => {
        openNewGallery(newGallery.nextGallery);
    }).then(() => {
        cleanupAndReset(newGallery);
    });
}

function pickNewGallery(e) {
    let clickedTab = e.target;
    let nextGallery = galleriesArray.filter(gallery => {return gallery.id == clickedTab.dataset.gallery})[0];
    return {"clickedTab": clickedTab, "nextGallery": nextGallery}
}

async function closeOldGallery() {
    currentGallery.classList.add("gallery-fade-out");  
    return new Promise((resolve, reject) => {
        currentGallery.addEventListener('animationend', function (e) {
            resolve();
        }, {once:true});
    });
}

async function openNewGallery (nextGallery) {
    nextGallery.classList.add("showingGallery", "gallery-fade-in");
    return new Promise((resolve, reject) => {
        nextGallery.addEventListener("animationend", function (e) {
            resolve();
        }, {once:true});
    });
}

function cleanupAndReset(newGallery) {
    currentTab.classList.remove("selectedGallery");
    newGallery.clickedTab.classList.add("selectedGallery");
    
    currentGallery.classList.remove("showingGallery", "gallery-fade-out");
    newGallery.nextGallery.classList.remove("gallery-fade-in");

    modifyVariable(currentTab, newGallery.clickedTab);
    //currentTab = newGallery.clickedTab;
    modifyVariable(currentGallery, newGallery.nextGallery);
    //currentGallery = newGallery.nextGallery;
    modifyVariable(galleryImages, [...currentGallery.getElementsByClassName("galleryImages")[0].children]);
    //galleryImages = [...currentGallery.getElementsByClassName("galleryImages")[0].children];
    modifyVariable(lastGalleyIndex, galleryImages.length-1);
    //lastGalleryIndex = galleryImages.length - 1;
    currentGallery.style = "";

    groupListeners([
        {ele:portfolioNavArray, ev:"click", fun:changeGallery, action:"add"},
        {ele:galleryImages, ev:"click", fun:openImagePreview, action:"add"}
    ]);
}