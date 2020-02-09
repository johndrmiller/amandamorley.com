window.onload = function() {
    //*gallery page elements
    const tabs = document.getElementById("portfolioSubnav").getElementsByTagName("a");
    const tabsArr = [].slice.call(tabs);
    const galleries = document.getElementsByClassName("gallery");
    const galleriesArr = [].slice.call(galleries);
    //*image preview elements
    const imageView = document.getElementById("image-details");
    const ivHeader = imageView.getElementsByTagName("header")[0];
    const imageTitle = ivHeader.querySelector("#image-title");
    const closeBox = ivHeader.querySelector("#closebox");
    const imageArea = imageView.querySelector("#image-display");
    const imageContainer = imageArea.querySelector("#image-container");
    const imageEnlargement = imageContainer.querySelector("#image-image");
    //*page variables
    var currentTab = tabsArr.filter(tab => tab.classList.contains("selectedGallery"))[0];
    var currentGallery = galleriesArr.filter(gallery => gallery.classList.contains("showingGallery"))[0];
    var galleryImages = currentGallery.getElementsByClassName("galleryImages")[0];
    var imageProportion,startingEvCoords = {};

    //*takes array of objects[{ele:element, ev:event, fun:function, action:("add" or "remove"), opts:(optional, {} or options object)}], if element or event is an array, function runs through elements first, then events.
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
            currentGallery.removeEventListener('animationend', sendToNextFunction);
        });
        currentTab.classList.remove("selectedGallery");
        clickedTab.classList.add("selectedGallery");
        currentTab = clickedTab;  
    }
    function openNewGallery (nextGallery) {
        nextGallery.classList.add("showingGallery", "gallery-fade-in");
        currentGallery.classList.remove("showingGallery", "gallery-fade-out");
        nextGallery.addEventListener("animationend", resolveAndReset);
    }
    function resolveAndReset(e) {
        currentGallery = e.target;
        galleryImages = currentGallery.getElementsByClassName("galleryImages")[0];
        e.target.removeEventListener("animationend", resolveAndReset);
        e.target.style = "";
        e.target.classList.remove("gallery-fade-in");
        groupListeners([{ele:tabsArr, ev:"click", fun:closeOldGallery, action:"add"},{ele:galleryImages,ev:"click", fun:expandImage, action:"add"}]);
    }
    //******************End Tab Switching Section******************//

    //******************Begin Image Preview Section******************//
    function expandImage(e) {
        let infoNode = e.target.parentNode.parentNode;
        
        closeBox.addEventListener("click", closePreview);
        imageEnlargement.addEventListener("load",imageCalcs);
        imageEnlargement.src = infoNode.dataset.imageFile;
        imageTitle.textContent = infoNode.dataset.imageName;
    }
    
    function imageCalcs(e) {
        let natH = imageEnlargement.naturalHeight;
        let natW = imageEnlargement.naturalWidth;
        imageProportion = natW/natH;

        imageProportion < 1 ? imageContainer.style.height = "80%" : imageContainer.style.width = "80%";

        if (window.visualViewport.scale > 1.0) {
            let modifier = 1/window.visualViewport.scale;
            let ivStyles = window.getComputedStyle(imageView);
            let ivHeaderStyles = window.getComputedStyle(ivHeader);
            imageView.style = `width: ${modifier*100}vw; height:${modifier*100}vh; top:${window.visualViewport.offsetTop}px; left:${window.visualViewport.offsetLeft}px; font-size:${parseInt(ivStyles.getPropertyValue("font-size"))*modifier}px;`;
            ivHeader.style = `padding-top: ${parseInt(ivHeaderStyles.getPropertyValue("padding-top"))*modifier}px; padding-bottom: ${parseInt(ivHeaderStyles.getPropertyValue("padding-bottom"))*modifier}px;`
            groupListeners([{ele:window, ev:["scroll", "wheel", "touchmove"], fun:stopZoomScroll, action:"add", opts:{passive:false}}]);
        }

        let imContStyle = window.getComputedStyle(imageContainer);
        let currentRatio = parseInt(imContStyle.width)/parseInt(imContStyle.height);

        imageView.style.opacity = 0;
        imageView.style.display = "flex";
        imageContAdjustment(imageProportion, currentRatio, imContStyle.width, imContStyle.height);   
        imageView.addEventListener("animationend",finalize);
        imageView.classList.add("image-details-appear");
    }
    //if img and its container aren't the same ratio, the container is updated to match the image 
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
    
    function sizedOut(){
        imageEnlargement.addEventListener("animationend",function removeAnimation(e) {
            imageEnlargement.classList.remove("size-out");
            imageEnlargement.removeEventListener("animationend", removeAnimation);
        });
        imageEnlargement.classList.add("size-out");
    }
    function imageResize(growCondition, shrinkCondition){
        imageArea.removeEventListener("pointermove", pointermove_handler);
        let imContStyles = window.getComputedStyle(imageContainer);
        let containerHeight = parseInt(imContStyles.getPropertyValue("height"));
        let containerWidth = parseInt(imContStyles.getPropertyValue("width"));
        if (growCondition) {
            if (containerHeight>=1500 || containerWidth>=1500) {
                sizedOut();
                imageArea.addEventListener("pointermove", pointermove_handler);
                return;
            }
            imageContainer.style.width = `${containerWidth + 10}px`;
            imageContainer.style.height = `${containerHeight + 10}px`;
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
            imageContainer.style.width = `${containerWidth - 10}px`;
            imageContainer.style.height = `${containerHeight - 10}px`;
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
    function firstIsLonger(height, width) {
        return height > width;
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
            console.log("yes");
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
        } else if ( ydir == "down" && imageBox.top < imageAreaBox.top) {
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