import {imageEnlargement, imageArea, imageContainer, startingEvCoords, imageProportion} from "/js/modules/HTMLConstants.js";
import {imageContAdjustment, stopZoomScroll} from "/js/modules/imagePreview.js";
import {sizeCheck} from "/js/modules/imagePreviewDrag.js";
import {moveImage} from "/js/modules/imagePreviewDrag.js";

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
    imageContAdjustment(imageProportion.getVal(), recalcRatio, recalcWidth, recalcHeight);
}

export function pointerdown_handler(ev) {
    evCache.push(ev);
    startingEvCoords.getVal().clientX = ev.clientX;
    startingEvCoords.getVal().clientY = ev.clientY;
}

export function pointermove_handler(ev) {
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
            moveImage(startingEvCoords.getVal(), currentPos);
        } else {
            return
        }
    }
}

export function pointerup_handler(ev) {
    remove_event(ev);
    if (evCache.length < 2) {
        prevDiff = -1;
    }
    if (evCache.length == 1) {
        startingEvCoords.clientX = evCache[0].clientX;
        startingEvCoords.clientY = evCache[0].clientY;
    }
}

export function wheel_handler(ev) {
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