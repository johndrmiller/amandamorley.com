import {groupListeners} from "/js/modules/groupListeners.js";
import {imagePreviewNavButtons, previousButton, nextButton, currentImageIndex, lastGalleryIndex, imageEnlargement, galleryImages,
    imageContainer, imageTitle, modifyVariable
} from "/js/modules/HTMLConstants.js";
import {imageCalcs} from "/js/modules/imagePreview.js";

export function changeImage(e){
    groupListeners([
        {ele:imagePreviewNavButtons, ev:"click", fun:changeImage, action:"remove"}
    ]);

    switch (e.currentTarget) {
        case previousButton:
            if (currentImageIndex == 0) {
                modifyVariable(currentImageIndex, lastGalleryIndex);
                //currentImageIndex = lastGalleryIndex;
            } else {
                modifyVariable(currentImageIndex, currentImageIndex-1);
                //currentImageIndex -= 1;
            }
            break;
        case nextButton:
            if (currentImageIndex == lastGalleryIndex) {
                modifyVariable(currentImageIndex, 0)
                //currentImageIndex = 0;
            } else {
                modifyVariable(currentImageIndex, currentImageIndex+1)
                //currentImageIndex += 1;
            }
            break;
    }

    imageEnlargement.addEventListener("animationend", openNewImage, {once:true});
    imageEnlargement.classList.add("image-details-disappear");
}

function openNewImage() {
    let newImage = galleryImages[currentImageIndex];

    imageEnlargement.style.opacity="0";
    imageEnlargement.classList.remove("image-details-disappear");

    imageEnlargement.addEventListener("load", function(e) {
        imageCalcs(e).then(() => {
            imageEnlargement.addEventListener("animationend", imageChangeWrapUp), {once:true};
            imageEnlargement.classList.add("image-details-appear"); 
        });
    }, {once:true});
    if (imageContainer.style.top || imageContainer.style.left) {
        imageContainer.style.top = 0;
        imageContainer.style.left = 0;
    }
    imageContainer.style.width = "auto";
    imageContainer.style.height = "auto";

    imageEnlargement.src = newImage.dataset.imageFile;
    imageTitle.textContent = newImage.dataset.imageName;

    let queryParams = new URLSearchParams(window.location.search);
    queryParams.set("image",newImage.dataset.append);
    history.replaceState(null, null, `?${queryParams}`);
}

function imageChangeWrapUp() {
    imageEnlargement.style.opacity= "";
    imageEnlargement.classList.remove("image-details-appear");
    groupListeners([
        {ele:imagePreviewNavButtons, ev:"click", fun:changeImage, action:"add"}
    ]);
}