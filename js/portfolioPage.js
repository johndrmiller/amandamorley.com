/*
    * This file is divided into sections
    *   Variable declaration - Beginning
    *   Group listeners function - around line 35
    *   The section that controls the switching of the different gallery types (or "tabs") - around line 55
    *   The image preview section - around line 90
    *       The image preview section has several distinct parts as well:
    *       Changing images in preview - around line 110
    *       Zooming in and out of images - around line 240
    *       Dragging the image - around line 380
*/

window.onload = function() {
    //*gallery page elements
    const tabsArr = [...document.getElementById("portfolioSubnav").getElementsByTagName("a")];
    const galleriesArr = [...document.getElementsByClassName("gallery")];
    //*image preview elements
    const imageView = document.getElementById("image-details");
    const ivHeader = imageView.getElementsByTagName("header")[0];
    const imageTitle = ivHeader.querySelector("#image-title");
    const closeBox = ivHeader.querySelector("#closebox");
    const imageArea = imageView.querySelector("#image-display");
    const imageContainer = imageArea.querySelector("#image-container");
    const imageEnlargement = imageContainer.querySelector("#image-image");
    const imageNavButtons = [...this.document.getElementsByClassName("hitbox")];
    const previousButton = imageNavButtons.filter(item => item.id == "previousButtonImage")[0];
    const nextButton = imageNavButtons.filter(item => item.id == "nextButtonImage")[0];
    //*page variables
    var currentTab = tabsArr.filter(tab => tab.classList.contains("selectedGallery"))[0];
    var currentGallery = galleriesArr.filter(gallery => gallery.classList.contains("showingGallery"))[0];
    var galleryImages = [...currentGallery.getElementsByClassName("galleryImages")[0].children];
    var lastGalleryIndex = galleryImages.length - 1;
    var imageProportion, currentImageIndex, startingEvCoords = {};

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
                arr[i].ele[arr[i].action+"EventListener"](arr[i].ev, arr[i].fun, ops);
            }
        }
    }

    //******************Begin Tab Switching Section******************//
    function closeOldGallery(e) {
        let clickedTab = e.target;
        let nextGallery = galleriesArr.filter(gallery => {return gallery.id == clickedTab.dataset.gallery})[0];
        if (clickedTab == currentTab) {
            return
        }
        groupListeners([{ele:tabsArr, ev:"click", fun: closeOldGallery, action:"remove"},{ele:galleryImages,ev:"click", fun:expandImage, action:"remove"}]);
        nextGallery.style.opacity = 0;
        currentGallery.classList.add("gallery-fade-out");  
        currentGallery.addEventListener('animationend', function sendToNextFunction(e){
            openNewGallery(nextGallery);
        }, {once: true});
        currentTab.classList.remove("selectedGallery");
        clickedTab.classList.add("selectedGallery");
        currentTab = clickedTab;  
    }

    function openNewGallery (nextGallery) {
        nextGallery.classList.add("showingGallery", "gallery-fade-in");
        currentGallery.classList.remove("showingGallery", "gallery-fade-out");
        nextGallery.addEventListener("animationend", resolveAndReset, {once:true});
    }

    function resolveAndReset(e) {
        currentGallery = e.target;
        galleryImages = [...currentGallery.getElementsByClassName("galleryImages")[0].children];
        lastGalleryIndex = galleryImages.length - 1;
        e.target.removeEventListener("animationend", resolveAndReset);
        e.target.style = "";
        e.target.classList.remove("gallery-fade-in");
        groupListeners([{ele:tabsArr, ev:"click", fun:closeOldGallery, action:"add"},{ele:galleryImages,ev:"click", fun:expandImage, action:"add"}]);
    }
    //******************End Tab Switching Section******************//

    //******************Begin Image Preview Section******************//
    function expandImage(e) {
        let infoNode = e.target.parentNode.parentNode;
        currentImageIndex = galleryImages.indexOf(infoNode);
        imageView.style.opacity = 0;
        imageView.style.display = "flex";
        closeBox.addEventListener("click", closePreview);
        imageEnlargement.addEventListener("load", function(e) {
            imageCalcs(e);
            imageView.addEventListener("animationend",finalize);
            imageView.classList.add("image-details-appear");
        }, {once:true});
        imageEnlargement.src = infoNode.dataset.imageFile;
        imageTitle.textContent = infoNode.dataset.imageName; 
    }
    //******************Change Image Stuff******************//
    function changeImage(e){
        for (button of imageNavButtons) {
            button.removeEventListener("click", changeImage);
        }
        
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

        function openNewImage(e) {
            imageEnlargement.style.opacity="0";
            imageEnlargement.classList.remove("image-details-disappear");

            imageEnlargement.addEventListener("load", function(e) {
                imageCalcs(e);
                imageEnlargement.addEventListener("animationend", wrapUp);
                imageEnlargement.classList.add("image-details-appear"); 
            }, {once:true});
            if (imageContainer.style.top || imageContainer.style.left) {
                imageContainer.style.top = 0;
                imageContainer.style.left = 0;
            }
            imageContainer.style.width = "auto";
            imageContainer.style.height = "auto";
            imageEnlargement.src = galleryImages[currentImageIndex].dataset.imageFile;
            imageTitle.textContent = galleryImages[currentImageIndex].dataset.imageName;
        }
        function wrapUp(e) {
            imageEnlargement.style.opacity= "";
            imageEnlargement.classList.remove("image-details-appear");
            for (button of imageNavButtons) {
                button.addEventListener("click", changeImage);
            }
        }
    }
    //******************End change Image Stuff******************//
    function imageCalcs(e) {
        //*setting up sizes and position of image preview modal and content
        let natH = imageEnlargement.naturalHeight;
        let natW = imageEnlargement.naturalWidth;
        let imageAreaBox = window.getComputedStyle(imageArea);
        let imageAreaHeight = parseInt(imageAreaBox.height);
        let imageAreaWidth = parseInt(imageAreaBox.width);
        let imContStyle, currentRatio, imageHeight, imageWidth;

        imageProportion = natW/natH;

        //*disabling native browser resizing for custom implementation
        groupListeners([{ele:window, ev:["scroll", "wheel", "touchmove"], fun:stopZoomScroll, action:"add", opts:{passive:false}}]);
        
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

        if (window.visualViewport.scale > 1.0) {
            scaleCorrection();
        }
        
        imContStyle = window.getComputedStyle(imageContainer);
        currentRatio = parseInt(imContStyle.width)/parseInt(imContStyle.height);
        imageContAdjustment(imageProportion, currentRatio, imContStyle.width, imContStyle.height);   
        /* imageView.addEventListener("animationend",finalize);
        imageView.classList.add("image-details-appear"); */
    }

    //*adjusting size of modal elements based on viewport scale to make sure everything is visible on screen
    function scaleCorrection() {
        let modifier = 1/window.visualViewport.scale;
        let ivStyles = window.getComputedStyle(imageView);
        let ivHeaderStyles = window.getComputedStyle(ivHeader);
        console.log(imageView.style);
        imageView.style.width = `${modifier*100}vw`;
        imageView.style.height = `${modifier*100}vh`;
        imageView.style.top = `${window.visualViewport.offsetTop}px`;
        imageView.style.left = `${window.visualViewport.offsetLeft}px`;
        imageView.style.fontSize = `${parseInt(ivStyles.getPropertyValue("font-size"))*modifier}px;`;
        // imageView.style += `width: ${modifier*100}vw; height:${modifier*100}vh; top:${window.visualViewport.offsetTop}px; left:${window.visualViewport.offsetLeft}px; font-size:${parseInt(ivStyles.getPropertyValue("font-size"))*modifier}px;`;
        ivHeader.style = `padding-top: ${parseInt(ivHeaderStyles.getPropertyValue("padding-top"))*modifier}px; padding-bottom: ${parseInt(ivHeaderStyles.getPropertyValue("padding-bottom"))*modifier}px;`;
    }

    //*if img and its container aren't the same ratio, the container is updated to match the image 
    function imageContAdjustment(image, current, width, height) {
        current < image ? imageContainer.style.height = parseInt(width)*(1/image)+"px" : imageContainer.style.width = image*parseInt(height)+"px";
    }

    function stopZoomScroll(e) {
        e.preventDefault();
    }

    function finalize(e) {
        imageView.style.opacity = 1;
        imageView.removeEventListener("animationend",finalize);
        imageView.classList.remove("image-details-appear");
        imageArea.addEventListener("pointerdown", pointerdown_handler);
        imageArea.addEventListener("pointermove", pointermove_handler);
        imageArea.addEventListener("wheel", wheel_handler);
        groupListeners([{ele:imageArea, ev:["pointerup","pointercancel","pointerout","pointerleave"], fun: pointerup_handler, action:"add"}]);
        for (button of imageNavButtons) {
            button.addEventListener("click", changeImage);
        }
    }

    function closePreview(e) {
        imageView.style = ivHeader.style = imageContainer.style = "";
        imageArea.removeEventListener("pointerdown", pointerdown_handler);
        imageArea.removeEventListener("pointermove", pointermove_handler);
        imageArea.removeEventListener("wheel", wheel_handler);
        groupListeners([{ele:imageArea, ev:["pointerup","pointercancel","pointerout","pointerleave"], fun: pointerup_handler, action:"remove"},{ele:window, ev:["scroll", "wheel", "touchmove"], fun:stopZoomScroll, action:"remove", opts:{passive:false}}]);
    }

    //******************Zoom Stuff******************//
    var evCache = new Array();
    var prevDiff = -1;
    
    //*Generates attaches then removes css animation for when image reaches max or min size
    function sizedOut(){
        imageEnlargement.addEventListener("animationend",function removeAnimation(e) {
            imageEnlargement.classList.remove("size-out");
            imageEnlargement.removeEventListener("animationend", removeAnimation);
        });
        imageEnlargement.classList.add("size-out");
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
                sizedOut();
                imageArea.addEventListener("pointermove", pointermove_handler);
                return;
            }
            imageContainer.style.width = `${containerWidth + moveVal}px`;
            imageContainer.style.height = `${containerHeight + moveVal}px`;
        } else if (shrinkCondition) {
            if (containerHeight<=200 || containerWidth<=200) {
                sizedOut();
                imageArea.addEventListener("pointermove", pointermove_handler);
                return;
            }
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

    function propIsNonZero(prop) {
        return prop != "" &&  prop != "0px";
    }

    function firstIsLonger(first, second) {
        return first > second;
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
        // if imageContainer doesn't currently have left/top assigned, need to assign it and set it to 0
        imageContainer.style.left = imageContainer.style.left || "0px";
        imageContainer.style.top = imageContainer.style.top || "0px";
        //instructions based on drag direction
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
    groupListeners([{ele:tabsArr, ev:"click", fun: closeOldGallery, action:"add"},{ele:galleryImages, ev:"click", fun:expandImage, action:"add"}]);
}