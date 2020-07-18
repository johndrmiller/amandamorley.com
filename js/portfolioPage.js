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
//*gallery page elements
const portfolioNavArray = [...document.getElementById("portfolioSubnav").getElementsByTagName("a")];
const galleriesArray = [...document.getElementsByClassName("gallery")];
//*image preview elements
const imagePreview = document.getElementById("image-details");
const previewHeader = imagePreview.getElementsByTagName("header")[0];
const imageTitle = previewHeader.querySelector("#image-title");
const closeBox = previewHeader.querySelector("#closebox");
const imageArea = imagePreview.querySelector("#image-display");
const imageContainer = imageArea.querySelector("#image-container");
const imageEnlargement = imageContainer.querySelector("#image-image");
const imagePreviewNavButtons = [...this.document.getElementsByClassName("hitbox")];
const previousButton = imagePreviewNavButtons.filter(item => item.id == "previousButtonImage")[0];
const nextButton = imagePreviewNavButtons.filter(item => item.id == "nextButtonImage")[0];
//*page variables
let currentTab = portfolioNavArray.filter(tab => tab.classList.contains("selectedGallery"))[0];
let currentGallery = galleriesArray.filter(gallery => gallery.classList.contains("showingGallery"))[0];
let galleryImages = [...currentGallery.getElementsByClassName("galleryImages")[0].children];
let lastGalleryIndex = galleryImages.length - 1;
let imageProportion, currentImageIndex, startingEvCoords = {};

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

//*takes array of objects[{ele:element or array of elements, ev:event or array of events, fun:function, action:"add" or "remove", opts:optional, {} or options object}]
//*if element or event is an array, function runs through elements first, then events.
const groupListeners = (arr) => {
    for (let i in arr) { 
        let ops = arr[i].opts || {};
        if (Array.isArray(arr[i].ele)) {
            arr[i].ele.forEach(el => {
                groupListeners([{ele:el, ev:arr[i].ev, fun:arr[i].fun, action:arr[i].action, opts:ops}]);
            });
        } else if (Array.isArray(arr[i].ev)) {
            arr[i].ev.forEach(e => {
                groupListeners([{ele:arr[i].ele, ev:e, fun:arr[i].fun, action:arr[i].action, opts:ops}]);
            })
        } else { 
            arr[i].ele[`${arr[i].action}EventListener`](arr[i].ev, arr[i].fun, ops);
        }
    }
}

//******************Begin Tab Switching Section******************//
async function changeGallery(e) {
    const newGallery = await pickNewGallery(e);
    if (newGallery.clickedTab == currentTab) return
    newGallery.nextGallery.style.opacity = 0;
    groupListeners([
        {ele:portfolioNavArray, ev:"click", fun: changeGallery, action:"remove"},
        {ele:galleryImages,ev:"click", fun:openImagePreview, action:"remove"}
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

    currentTab = newGallery.clickedTab;
    currentGallery = newGallery.nextGallery;
    galleryImages = [...currentGallery.getElementsByClassName("galleryImages")[0].children];
    lastGalleryIndex = galleryImages.length - 1;
    currentGallery.style = "";

    groupListeners([
        {ele:portfolioNavArray, ev:"click", fun:changeGallery, action:"add"},
        {ele:galleryImages, ev:"click", fun:openImagePreview, action:"add"}
    ]);
}
//******************End Tab Switching Section******************//
//******************Begin Image Preview Section******************//
function openImagePreview(e) {
    let newURL;
    let infoNode = e.target.closest(".galleryImage");
    console.log(infoNode);
    currentImageIndex = galleryImages.indexOf(infoNode);
    
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
    newURL = `${window.location.href}?image=${infoNode.dataset.append}`
    history.pushState(null, null, newURL);
}

async function imageCalcs(e) {
    //*setting up sizes and position of image preview modal and content
    let imageAreaBox = window.getComputedStyle(imageArea);
    let imageAreaHeight = parseInt(imageAreaBox.height);
    let imageAreaWidth = parseInt(imageAreaBox.width);
    let imContStyle, currentRatio, imageHeight, imageWidth;

    imageProportion = imageEnlargement.naturalWidth/imageEnlargement.naturalHeight;

    //*disabling native browser resizing for custom implementation
    groupListeners([
        {ele:window, ev:["scroll", "wheel", "touchmove"], fun:stopZoomScroll, action:"add", opts:{passive:false}}
    ]);
    
    //*checking if image is horizontal or vertical, then calculating display w and h of image based on 90% of available width or height
    if (imageProportion <= 1) {
        imageHeight = imageAreaHeight*0.9;
        imageWidth = imageProportion*imageHeight;
    } else if (imageProportion > 1) {
        imageWidth = imageAreaWidth*0.9;
        imageHeight = imageWidth/imageProportion;
    }
    
    //*setting height or width of image, checks to make sure full image will fit within previw area
    if ((imageProportion <= 1 && imageAreaWidth > imageWidth) || (imageProportion > 1 && imageAreaHeight < imageHeight)) {
        imageContainer.style.height = "90%";
    } else if ((imageProportion > 1 && imageAreaHeight > imageHeight) || (imageProportion <= 1 && imageAreaWidth < imageWidth)) {
        imageContainer.style.width = "90%";
    }

    if (window.visualViewport.scale > 1.0) scaleCorrection();
    
    imContStyle = window.getComputedStyle(imageContainer);
    currentRatio = parseInt(imContStyle.width)/parseInt(imContStyle.height);
    imageContAdjustment(imageProportion, currentRatio, imContStyle.width, imContStyle.height);

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
function imageContAdjustment(image, current, width, height) {
    current < image ? imageContainer.style.height = parseInt(width)*(1/image)+"px" : imageContainer.style.width = image*parseInt(height)+"px";
}

function stopZoomScroll(e) {
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

//******************Change Image Stuff******************//
function changeImage(e){
    groupListeners([
        {ele:imagePreviewNavButtons, ev:"click", fun:changeImage, action:"remove"}
    ]);

    switch (e.currentTarget) {
        case previousButton:
            if (currentImageIndex == 0) {
                currentImageIndex = lastGalleryIndex;
            } else {
                currentImageIndex -= 1;
            }
            break;
        case nextButton:
            if (currentImageIndex == lastGalleryIndex) {
                currentImageIndex = 0;
            } else {
                currentImageIndex += 1;
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
//******************End change Image Stuff******************//
//******************Zoom Stuff******************//
var evCache = new Array();
var prevDiff = -1;

//*Generates attaches then removes css animation for when image reaches max or min size
function sizedOutAnimation(){
    imageEnlargement.addEventListener("animationend",function removeAnimation(e) {
        imageEnlargement.classList.remove("size-out");
    }, {once: true});
    imageEnlargement.classList.add("size-out");
}

function propIsNonZero(prop) {
    return prop != "" &&  prop != "0px";
}

function firstIsLonger(first, second) {
    return first > second;
}

//*resizing image preview using touch or mouse wheel
function imageResize(growCondition, shrinkCondition){
    imageArea.removeEventListener("pointermove", pointermove_handler);
    let imContStyles = window.getComputedStyle(imageContainer);
    let containerHeight = parseInt(imContStyles.getPropertyValue("height"));
    let containerWidth = parseInt(imContStyles.getPropertyValue("width"));
    let moveVal = 10;
    if (growCondition) {
        if (containerHeight>=1500 || containerWidth>=1500) {
            sizedOutAnimation();
            imageArea.addEventListener("pointermove", pointermove_handler);
            return;
        }
        imageContainer.style.width = `${containerWidth + moveVal}px`;
        imageContainer.style.height = `${containerHeight + moveVal}px`;
    } else if (shrinkCondition) {
        if (containerHeight<=200 || containerWidth<=200) {
            sizedOutAnimation();
            imageArea.addEventListener("pointermove", pointermove_handler);
            return;
        }
        //*This entire if statement checks to see if the image is off center before resizing and then adjusts the top and left values as needed to bring the image back to center as it shrinks
        if (propIsNonZero(imageContainer.style.top) || propIsNonZero(imageContainer.style.left)) {
            let imageBox= imageContainer.getBoundingClientRect();
            let imageAreaBox = imageArea.getBoundingClientRect();
            let imageSizeCheck = sizeCheck();
            let isHeightLonger = firstIsLonger(containerHeight, containerWidth);
            let longSideRatio = isHeightLonger ? containerHeight/containerWidth : containerWidth/containerHeight;
            let boundaryVals = {
                    shortSide: {
                        range: 2,
                        shift: 5,
                    },
                    longSide: {
                        range: Math.floor(2*longSideRatio),
                        shift: Math.floor(5*longSideRatio),
                    }
            };
            
            isHeightLonger 
            ? (Object.assign(boundaryVals.shortSide, {side1:"left", side2:"right",size:imageSizeCheck.width}), Object.assign(boundaryVals.longSide, {side1:"top", side2:"bottom",size:imageSizeCheck.height}))
            : (Object.assign(boundaryVals.shortSide, {side1:"top", side2:"bottom",size:imageSizeCheck.height}), Object.assign(boundaryVals.longSide, {side1:"left", side2:"right",size:imageSizeCheck.width}))

            function shiftImagePosition (inputs) {
                if (inputs.size) {
                    if ((imageAreaBox[inputs.side1] - inputs.range <= imageBox[inputs.side1] && imageBox[inputs.side1] <= imageAreaBox[inputs.side1] + inputs.range) || (parseInt(imageContainer.style[inputs.side1]) > inputs.shift-1)) {
                        imageContainer.style[inputs.side1] = `${parseInt(imageContainer.style[inputs.side1])-inputs.shift}px`;
                    } else if ((imageAreaBox[inputs.side2] - inputs.range <= imageBox[inputs.side2] && imageBox[inputs.side2] <= imageAreaBox[inputs.side2] + inputs.range) || (parseInt(imageContainer.style[inputs.side1]) < (inputs.shift-1)*-1)) {
                        imageContainer.style[inputs.side1] = `${parseInt(imageContainer.style[inputs.side1])+inputs.shift}px`;
                    } 
                }
            }

            shiftImagePosition(boundaryVals.shortSide);
            shiftImagePosition(boundaryVals.longSide);
        }
        imageContainer.style.width = `${containerWidth - moveVal}px`;
        imageContainer.style.height = `${containerHeight - moveVal}px`;
    }
    let recalcHeight = parseInt(window.getComputedStyle(imageContainer).getPropertyValue("height"));
    let recalcWidth = parseInt(window.getComputedStyle(imageContainer).getPropertyValue("width"));
    let recalcRatio = recalcWidth/recalcHeight;
    imageArea.addEventListener("pointermove", pointermove_handler);
    imageContAdjustment(imageProportion, recalcRatio, recalcWidth, recalcHeight);
}

function pointerdown_handler(ev) {
    evCache.push(ev);
    startingEvCoords.clientX = ev.clientX;
    startingEvCoords.clientY = ev.clientY;
}

function pointermove_handler(ev) {
    for (var i = 0; i < evCache.length; i++) {
        if (ev.pointerId == evCache[i].pointerId) {
            evCache[i] = ev;
        break;    
        }
    }
    if (evCache.length == 2) {
        //difference between 2 points Math.abs(Math.sqrt(Math.pow((x2-x1),2)+Math.pow((y2-y1),2))
        var curDiff = Math.abs(Math.sqrt(Math.pow((evCache[1].clientX-evCache[0].clientX),2)+Math.pow((evCache[1].clientY-evCache[0].clientY),2)));
        if (prevDiff > 0) {
            imageResize((curDiff > prevDiff), (curDiff < prevDiff));  
        }
        prevDiff = curDiff; 
    }
    if (evCache.length == 1) {
        stopZoomScroll(ev);
        let currentPos = {
            clientX: ev.clientX,
            clientY: ev.clientY
        };
        let checkSize = sizeCheck();
        if (Object.values(checkSize).some(function (e){return e})) {
            imageContainer.setAttribute("draggable", "true");
            moveImage(startingEvCoords, currentPos);
        } else {
            return
        }
    }
}
function pointerup_handler(ev) {
    remove_event(ev);
    if (evCache.length < 2) {
        prevDiff = -1;
    }
    if (evCache.length == 1) {
        startingEvCoords.clientX = evCache[0].clientX;
        startingEvCoords.clientY = evCache[0].clientY;
    }
}

function wheel_handler(ev) {
    imageResize((ev.deltaY > 0),(ev.deltaY < 0));
}

function remove_event(ev) {
    for(var i=0; i<evCache.length; i++) {
        if (evCache[i].pointerId==ev.pointerId) {
            evCache.splice(i,1);
            break;
        }
    }
}
//******************Drag Stuff******************//
function sizeCheck() {
    let imageAreaStyles = window.getComputedStyle(imageArea);
    let imageAreaDimensions = {
        height: parseInt(imageAreaStyles.getPropertyValue("height")),
        width: parseInt(imageAreaStyles.getPropertyValue("width"))
    };
    let imageContainerStyles = window.getComputedStyle(imageContainer);
    let imageContainerDimensions ={
        height: parseInt(imageContainerStyles.getPropertyValue("height")),
        width: parseInt(imageContainerStyles.getPropertyValue("width"))
    };
    let panOptions = {
        height: false,
        width: false
    };
    imageContainerDimensions.width > imageAreaDimensions.width ? panOptions.width = true : panOptions.width = false;
    imageContainerDimensions.height > imageAreaDimensions.height ? panOptions.height = true : panOptions.height = false;
    return panOptions;
}
function moveImage(startingCoords,currentCoords) {
    //current > starting = right or down, current < starting = left or up
    imageArea.removeEventListener("pointermove", pointermove_handler);
    let xdir = currentCoords.clientX > startingCoords.clientX ? "right" : (currentCoords.clientX < startingCoords.clientX ? "left" : "stationary");
    let ydir = currentCoords.clientY > startingCoords.clientY ? "down" : (currentCoords.clientY < startingCoords.clientY ? "up" : "stationary");
    let xMovement = Math.abs(currentCoords.clientX-startingCoords.clientX);
    let yMovement = Math.abs(currentCoords.clientY-startingCoords.clientY);
    let imageBox= imageEnlargement.getBoundingClientRect();
    let imageAreaBox = imageArea.getBoundingClientRect();
    imageContainer.style.position = "relative";

    //current > starting = right, down; current - starting = positive;
    //current < starting = left, up; current - starting = negative

    // if imageContainer doesn't currently have left/top assigned, need to assign it and set it to 0
    imageContainer.style.left = imageContainer.style.left || "0px";
    imageContainer.style.top = imageContainer.style.top || "0px";
    
    if (xdir == "left" && imageBox.right > imageAreaBox.right) {
        if (imageBox.right-xMovement < imageAreaBox.right) {
            imageContainer.style.left = (imageAreaBox.width - imageBox.width)/2 + "px";
        } else {
            imageContainer.style.left = (parseInt(imageContainer.style.left) - xMovement) +"px";
        }
    } else if (xdir == "right" && imageBox.left < imageAreaBox.left) {
        if (imageBox.left+xMovement > imageAreaBox.left) {
            imageContainer.style.left = (imageBox.width - imageAreaBox.width)/2 + "px";
        } else {
            imageContainer.style.left = (parseInt(imageContainer.style.left) + xMovement) +"px";
        }
    }
    if(ydir == "up" && imageBox.bottom > imageAreaBox.bottom) {
        if (imageBox.bottom-yMovement < imageAreaBox.bottom) {
            imageContainer.style.top = (imageAreaBox.height - imageBox.height)/2 + "px";
        } else {
            imageContainer.style.top = (parseInt(imageContainer.style.top) - yMovement) +"px";
        }
    } else if (ydir == "down" && imageBox.top < imageAreaBox.top) {
        if (imageBox.top+yMovement > imageAreaBox.top) {
            imageContainer.style.top = (imageBox.height - imageAreaBox.height)/2 + "px";
        } else {
            imageContainer.style.top = (parseInt(imageContainer.style.top) + yMovement) +"px";
        }
    }
    //resetting default coordinates
    startingCoords.clientX = currentCoords.clientX;
    startingCoords.clientY = currentCoords.clientY;
    imageArea.addEventListener("pointermove", pointermove_handler);
}
//******************End Drag Stuff******************//
//******************End Zoom Stuff******************//
//******************End Image Preview Section******************//
groupListeners([
    {ele:portfolioNavArray, ev:"click", fun: changeGallery, action:"add"},
    {ele:galleryImages, ev:"click", fun:openImagePreview, action:"add"}
]);
