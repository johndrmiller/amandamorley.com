import {groupListeners} from "/js/modules/groupListeners.js";
import {imagePreviewNavButtons, previousButton, nextButton, currentImageIndex, lastGalleryIndex, imageEnlargement, galleryImages,
    imageContainer, imageTitle, purchaseLink
} from "/js/modules/HTMLConstants.js";
import {imageCalcs} from "/js/modules/imagePreview.js";

export function changeImage(e){
    groupListeners([
        {ele:imagePreviewNavButtons, ev:"click", fun:changeImage, action:"remove"}
    ]);

    switch (e.currentTarget) {
        case previousButton:
            if (currentImageIndex.getVal() == 0) {
                currentImageIndex.update(lastGalleryIndex.getVal());
            } else {
                currentImageIndex.update(currentImageIndex.getVal()-1);
            }
            break;
        case nextButton:
            if (currentImageIndex.getVal() == lastGalleryIndex.getVal()) {
                currentImageIndex.update(0);
            } else {
                currentImageIndex.update(currentImageIndex.getVal()+1);
            }
            break;
    }

    imageEnlargement.addEventListener("animationend", openNewImage, {once:true});
    imageEnlargement.classList.add("image-details-disappear");
}

function openNewImage() {
    let newImage = galleryImages.getVal()[currentImageIndex.getVal()];

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
    if ("shopLink" in newImage.dataset) {
        console.log("yes");
        if (purchaseLink.classList.contains("hide")) {
            purchaseLink.classList.remove("hide");
        }
        let anchor = purchaseLink.querySelector("a");
        anchor.href = newImage.dataset.shopLink;
    } else {
        console.log("no");
        if (!purchaseLink.classList.contains("hide")){
            purchaseLink.classList.add("hide");
        }
    }

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