//Need to group mutable variables into an objes so they can be changed by the different files as needed.

//*gallery page elements
export const portfolioNavArray = [...document.getElementById("portfolioSubnav").getElementsByTagName("a")];
export const galleriesArray = [...document.getElementsByClassName("gallery")];
export const shopLink = document.querySelector("#shopLink");
//*image preview elements
export const imagePreview = document.getElementById("image-details");
export const previewHeader = imagePreview.getElementsByTagName("header")[0];
export const imageTitle = previewHeader.querySelector("#image-title");
export const purchaseLink = previewHeader.querySelector("#purchase-link");
export const closeBox = previewHeader.querySelector("#closebox");
export const imageArea = imagePreview.querySelector("#image-display");
export const imageContainer = imageArea.querySelector("#image-container");
export const imageEnlargement = imageContainer.querySelector("#image-image");
export const imagePreviewNavButtons = [...document.getElementsByClassName("hitbox")];
export const previousButton = imagePreviewNavButtons.filter(item => item.id == "previousButtonImage")[0];
export const nextButton = imagePreviewNavButtons.filter(item => item.id == "nextButtonImage")[0];
//*page variables
const updateableVariable = (val) => {
    const getVal = () => val;
    const update = (newVal) => val = newVal;
    return {getVal, update};
}
export const currentTab = updateableVariable(portfolioNavArray.filter(tab => tab.classList.contains("selectedGallery"))[0]);
export const currentGallery = updateableVariable(galleriesArray.filter(gallery => gallery.classList.contains("showingGallery"))[0]);
export const galleryImages = updateableVariable([...currentGallery.getVal().getElementsByClassName("galleryImages")[0].children]);
export const lastGalleryIndex = updateableVariable(galleryImages.getVal().length - 1);
export const imageProportion = updateableVariable(0); 
export const currentImageIndex = updateableVariable(undefined);
export const startingEvCoords = updateableVariable({});

