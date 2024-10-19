import {groupListeners} from "/js/modules/groupListeners.js";

import {currentImageIndex, galleryImages, imagePreview, imageEnlargement, closeBox, imageTitle,
        imageProportion, imageContainer, previewHeader, imagePreviewNavButtons, imageArea, purchaseLink
} from "/js/modules/HTMLConstants.js";
import {pointerup_handler, pointerdown_handler, pointermove_handler, wheel_handler} from "/js/modules/imagePreviewZoom.js";
import {changeImage} from "/js/modules/changeImagePreview.js";

export function openImagePreview(e) {
    let newURL, URLParams;
    let infoNode = e.target.closest(".galleryImage");
    console.log(infoNode);
    currentImageIndex.update(galleryImages.getVal().indexOf(infoNode));
    
    imagePreview.style.opacity = 0;
    imagePreview.style.display = "flex";
    
    imageEnlargement.addEventListener("load", function(e) {
        imageCalcs(e).then(() => {
            imagePreview.addEventListener("animationend",finalizeImagePreview, {once:true});
            imagePreview.classList.add("image-details-appear");
            closeBox.addEventListener("click", closePreview);
        });
    }, {once:true});
    
    imageEnlargement.src = infoNode.dataset.imageFile;
    imageTitle.textContent = infoNode.dataset.imageName; 
    //if image has a shop-link make the element visible and swap in the URL
    if ("shopLink" in infoNode.dataset) {
        console.log("yes");
        if (purchaseLink.classList.contains("hide")) {
            purchaseLink.classList.remove("hide");
        }
        let anchor = purchaseLink.querySelector("a");
        anchor.href = infoNode.dataset.shopLink;
    } else {
        console.log("no");
        if (!purchaseLink.classList.contains("hide")){
            purchaseLink.classList.add("hide");
        }
    }
    URLParams = new URLSearchParams(window.location.search);
    if (URLParams.has("image") && URLParams.get("image")==infoNode.dataset.append) {
        return;
    };
    newURL = `${window.location.href}?image=${infoNode.dataset.append}`
    history.pushState(null, null, newURL);
}

export async function imageCalcs(e) {
    //*setting up sizes and position of image preview modal and content
    let imageAreaBox = window.getComputedStyle(imageArea);
    let imageAreaHeight = parseInt(imageAreaBox.height);
    let imageAreaWidth = parseInt(imageAreaBox.width);
    let imContStyle, currentRatio, imageHeight, imageWidth;
    imageProportion.update(imageEnlargement.naturalWidth/imageEnlargement.naturalHeight);

    //*disabling native browser resizing for custom implementation
    groupListeners([
        {ele:window, ev:["scroll", "wheel", "touchmove"], fun:stopZoomScroll, action:"add", opts:{passive:false}}
    ]);
    
    //*checking if image is horizontal or vertical, then calculating display w and h of image based on 90% of available width or height
    console.log(imageProportion.getVal());
    if (imageProportion.getVal() <= 1) {
        imageHeight = imageAreaHeight*0.9;
        imageWidth = imageProportion.getVal()*imageHeight;
    } else if (imageProportion.getVal() > 1) {
        imageWidth = imageAreaWidth*0.9;
        imageHeight = imageWidth/imageProportion.getVal();
    }
    
    //*setting height or width of image, checks to make sure full image will fit within previw area
    if ((imageProportion.getVal() <= 1 && imageAreaWidth > imageWidth) || (imageProportion.getVal() > 1 && imageAreaHeight < imageHeight)) {
        imageContainer.style.height = "90%";
    } else if ((imageProportion.getVal() > 1 && imageAreaHeight > imageHeight) || (imageProportion.getVal() <= 1 && imageAreaWidth < imageWidth)) {
        imageContainer.style.width = "90%";
    }

    if (window.visualViewport.scale > 1.0) scaleCorrection();
    
    imContStyle = window.getComputedStyle(imageContainer);
    currentRatio = parseInt(imContStyle.width)/parseInt(imContStyle.height);
    imageContAdjustment(imageProportion.getVal(), currentRatio, imContStyle.width, imContStyle.height);

    return new Promise((resolve, reset) => {
        resolve();
    });
}

//*adjusting size of modal elements based on viewport scale to make sure everything is visible on screen
function scaleCorrection() {
    let scaleModifier = 1/window.visualViewport.scale;
    let imagePreviewStyles = window.getComputedStyle(imagePreview);
    let previewHeaderStyles = window.getComputedStyle(previewHeader);

    imagePreview.style.width = `${scaleModifier*100}vw`;
    imagePreview.style.height = `${scaleModifier*100}vh`;
    imagePreview.style.top = `${window.visualViewport.offsetTop}px`;
    imagePreview.style.left = `${window.visualViewport.offsetLeft}px`;
    imagePreview.style.fontSize = `${parseInt(imagePreviewStyles.getPropertyValue("font-size"))*scaleModifier}px;`;
    previewHeader.style = `padding-top: ${parseInt(previewHeaderStyles.getPropertyValue("padding-top"))*scaleModifier}px; padding-bottom: ${parseInt(previewHeaderStyles.getPropertyValue("padding-bottom"))*scaleModifier}px;`;
}

//*if img and its container aren't the same ratio, the container is updated to match the image 
export function imageContAdjustment(image, current, width, height) {
    current < image ? imageContainer.style.height = parseInt(width)*(1/image)+"px" : imageContainer.style.width = image*parseInt(height)+"px";
}

export function stopZoomScroll(e) {
    e.preventDefault();
}

function finalizeImagePreview(e) {
    imagePreview.style.opacity = 1;
    imagePreview.classList.remove("image-details-appear");

    groupListeners([
        {ele:imageArea, ev:["pointerup","pointercancel","pointerout","pointerleave"], fun: pointerup_handler, action:"add"},
        {ele:imageArea, ev:"pointerdown", fun: pointerdown_handler, action:"add"},
        {ele:imageArea, ev: "pointermove", fun: pointermove_handler, action:"add"},
        {ele:imageArea, ev:"wheel", fun: wheel_handler, action:"add"},
        {ele:imagePreviewNavButtons, ev:"click", fun:changeImage, action:"add"}
    ]);
}

function closePreview(e) {
    imagePreview.style = previewHeader.style = imageContainer.style = "";
    history.replaceState(null, null, "portfolio.html");

    groupListeners([
        {ele:imageArea, ev:["pointerup","pointercancel","pointerout","pointerleave"], fun: pointerup_handler, action:"remove"},
        {ele:window, ev:["scroll", "wheel", "touchmove"], fun:stopZoomScroll, action:"remove", opts:{passive:false}},
        {ele:imageArea, ev:"pointerdown", fun: pointerdown_handler, action:"remove"},
        {ele:imageArea, ev:"pointermove", fun: pointermove_handler, action:"remove"},
        {ele:imageArea, ev:"wheel", fun: wheel_handler, action:"remove"},
        {ele:imagePreviewNavButtons, ev:"click", fun:changeImage, action:"remove"}
    ]);
}