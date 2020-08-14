import {groupListeners} from "/js/modules/groupListeners.js";
import {portfolioNavArray, galleryImages, currentTab, galleriesArray, currentGallery, lastGalleryIndex
} from "/js/modules/HTMLConstants.js";
import {openImagePreview} from "/js/modules/imagePreview.js"

export async function changeGallery(e) {
    const newGallery = await pickNewGallery(e);
    if (newGallery.clickedTab == currentTab.getVal()) return
    newGallery.nextGallery.style.opacity = 0;
    groupListeners([
        {ele:portfolioNavArray, ev:"click", fun: changeGallery, action:"remove"},
        {ele:galleryImages.getVal(),ev:"click", fun: openImagePreview, action:"remove"}
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
    currentGallery.getVal().classList.add("gallery-fade-out");  
    return new Promise((resolve, reject) => {
        currentGallery.getVal().addEventListener('animationend', function (e) {
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
    currentTab.getVal().classList.remove("selectedGallery");
    newGallery.clickedTab.classList.add("selectedGallery");
    
    currentGallery.getVal().classList.remove("showingGallery", "gallery-fade-out");
    newGallery.nextGallery.classList.remove("gallery-fade-in");

    currentTab.update(newGallery.clickedTab);
    currentGallery.update(newGallery.nextGallery);
    galleryImages.update([...currentGallery.getVal().getElementsByClassName("galleryImages")[0].children]);
    lastGalleryIndex.update(galleryImages.getVal().length - 1);
    currentGallery.getVal().style = "";

    groupListeners([
        {ele:portfolioNavArray, ev:"click", fun:changeGallery, action:"add"},
        {ele:galleryImages.getVal(), ev:"click", fun:openImagePreview, action:"add"}
    ]);
}