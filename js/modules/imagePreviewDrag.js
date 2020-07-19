import {imageArea, imageContainer, imageEnlargement } from "/js/modules/HTMLConstants.js";
import {pointermove_handler} from "/js/modules/imagePreviewZoom.js";

export function sizeCheck() {
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
export function moveImage(startingCoords,currentCoords) {
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