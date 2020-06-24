window.addEventListener("resize", setWindowHeight);

function setWindowHeight() {
    window.removeEventListener("resize",setWindowHeight);
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    window.addEventListener("resize", setWindowHeight);
}
setWindowHeight();