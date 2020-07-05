
const imagesArr = [...document.getElementById("imageContainer").children];
const getCSSprop = (el, prop) => {window.getComputedStyle(el).getPropertyValue(prop)};

imagesArr.sort(function (a,b) {
    let a1 = parseInt(getCSSprop(a, 'zindex'));
    let b1 = parseInt(getCSSprop(b, 'zindex'));
    return b1-a1;
});

const animateTopImage = (arr) => {
    let firstEl = arr.splice(0,1)[0];
    
    firstEl.classList.add("addAnimation");
    firstEl.addEventListener('animationend', prepareNextImage);
}

const prepareNextImage = e => {
    e.target.removeEventListener("animationEnd", prepareNextImage);
    imagesArr.push(e.target);
    let newZindex = imagesArr.length;
    for (var i=0; i < imagesArr.length; i++) {
        imagesArr[i].style.zIndex=newZindex;
        newZindex--;
    }
    e.target.classList.remove("addAnimation");
    animateTopImage(imagesArr);    
}
animateTopImage(imagesArr);   
