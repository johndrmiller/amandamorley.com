//Need to group mutable variables into an objes so they can be changed by the different files as needed.

//*gallery page elements
export const portfolioNavArray = [...document.getElementById("portfolioSubnav").getElementsByTagName("a")];
export const galleriesArray = [...document.getElementsByClassName("gallery")];
//*image preview elements
export const imagePreview = document.getElementById("image-details");
export const previewHeader = imagePreview.getElementsByTagName("header")[0];
export const imageTitle = previewHeader.querySelector("#image-title");
export const closeBox = previewHeader.querySelector("#closebox");
export const imageArea = imagePreview.querySelector("#image-display");
export const imageContainer = imageArea.querySelector("#image-container");
export const imageEnlargement = imageContainer.querySelector("#image-image");
export const imagePreviewNavButtons = [...document.getElementsByClassName("hitbox")];
export const previousButton = imagePreviewNavButtons.filter(item => item.id == "previousButtonImage")[0];
export const nextButton = imagePreviewNavButtons.filter(item => item.id == "nextButtonImage")[0];
//*page variables
export let currentTab = portfolioNavArray.filter(tab => tab.classList.contains("selectedGallery"))[0];
export let currentGallery = galleriesArray.filter(gallery => gallery.classList.contains("showingGallery"))[0];
export let galleryImages = [...currentGallery.getElementsByClassName("galleryImages")[0].children];
export let lastGalleryIndex = galleryImages.length - 1;
export let imageProportion, currentImageIndex, startingEvCoords = {};
export function modifyVariable(variable, value) {
    variable = value;
    console.log(imageProportion);
}