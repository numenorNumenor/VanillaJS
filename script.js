// DOM Elements
const mainContainer = document.querySelector('main');
const galleryContainer = document.querySelector('.gallery');
const startSlideshowBtn = document.querySelector('.nav__start-slideshow');
const modal = document.querySelector('.modal')

// Data holders
const galleryItems = [];
const galleryItemsData = [];
const groupedGalleryColumns = [];
let slideshowIntervalID;

// Configurable values
let currentPageIndex = -1;
let slideshowIntervalDuration = 3000;

/**
 * Displays gallery items in columns.
 * @param {Array} items - Array of gallery items.
 * @param {Number} columnsCount - Number of columns to display items in.
 */
function displayItems(items, columnsCount = 1) {
    groupedGalleryColumns.length = 0; // Clear existing columns

    // Create columns based on the specified count
    for (let i = 0; i < columnsCount; i++) {
        const column = document.createElement('div');
        column.classList.add('gallery__column');
        groupedGalleryColumns.push(column);
    }

    // Distribute items across columns
    items.forEach((item, index) => {
        const columnIndex = index % columnsCount;
        groupedGalleryColumns[columnIndex].appendChild(item);
    });

    // Clear the gallery container and append the new columns
    galleryContainer.innerHTML = '';
    groupedGalleryColumns.forEach(column => galleryContainer.appendChild(column));
}

/**
 * Handles click event to show detailed view of an item.
 * @param {Event} e - Click event.
 */
function showDetailedView(e) {
    const targetItemElement = e.target.closest('.gallery__item');
    const targetItemId = targetItemElement.getAttribute('data-id');
    const selectedItem = galleryItemsData[targetItemId];

    currentPageIndex = targetItemId;
    mainContainer.className = 'item__container';
    mainContainer.innerHTML = '';

    createDetailedView(selectedItem, targetItemId);
}

/**
 * Creates the detailed view of a gallery item.
 * @param {Object} item - Gallery item data.
 * @param {Number} id - ID of the item.
 */
function createDetailedView(item, id = 0) {
    const itemContent = `
    <div class="item__header">
        <img class="header__thumbnail" src="${item.images.thumbnail}" alt="">
        <a href="#" class="item__view_image">
            <img class="view_image" src="./assets/shared/icon-view-image.svg">
            <p class="view_p">View Image</p>
        </a>
        <div class="item__caption">
            <h2 class="item__title">${item.name}</h2>
            <h5 class="item__author">${item.artist.name}</h5>
        </div>
        <img class="item__author_thumbnail" src="${item.artist.image}" alt="">
    </div>
    <div class="item__content">
        <p class="content__description">${item.description}</p>
        <a target="_blank" href="${item.source}" class="item__source">go to source</a>
    </div>
    <div class="item__footer">
        <div class="border"></div> 
        <div class="item__footer_wrapper">
            <div class="footer__desciption">
                <h5 class="footer__description_title">${item.name}</h5>
                <h6 class="footer__description_author">${item.artist.name}</h6>
            </div>
            <div class="footer__actions">
                <img class="arrow left" src="./assets/shared/icon-back-button.svg" alt="">
                <img class="arrow right" src="./assets/shared/icon-next-button.svg" alt="">
            </div>
        </div>
        <div class="loading-border"></div> 
    </div>   
    `;

    mainContainer.className = 'item__container';
    mainContainer.setAttribute('data-id', id)
    mainContainer.innerHTML = itemContent;
    updateBorderLength(id);
}

/**
 * Creates a gallery item and adds it to the list.
 * @param {Object} item - Gallery item data.
 * @param {Number} index - Item index.
 */
function createGalleryItem(item, index) {
    const figure = document.createElement('figure');
    figure.classList.add('gallery__item');
    figure.setAttribute('data-id', index);
    figure.addEventListener('click', showDetailedView);

    const img = document.createElement('img');
    img.classList.add('gallery__img');
    img.src = item.images.gallery;
    img.alt = item.name;

    const figcaption = document.createElement('figcaption');
    figcaption.classList.add('gallery__caption');

    const h2 = document.createElement('h2');
    h2.classList.add('caption__title');
    h2.textContent = item.name;

    const h5 = document.createElement('h5');
    h5.classList.add('caption__author');
    h5.textContent = item.artist.name;

    figcaption.append(h2, h5);
    figure.append(img, figcaption);

    galleryItems.push(figure);
    galleryItemsData.push(item);
}

/**
 * Fetches gallery data from JSON and initializes the gallery.
 */
function fetchGalleryData() {
    galleryContainer.innerHTML = ''; // Clear gallery
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            data.forEach((item, index) => createGalleryItem(item, index)); // Populate gallery
            displayItems(galleryItems); // Display in default column layout
            handleResize(); // Handle initial screen resize
        })
        .catch(error => console.error('Error fetching data:', error));
}

/**
 * Handles window resizing and updates the number of columns based on screen size.
 */
function handleResize() {
    const viewportWidth = window.innerWidth;

    if (viewportWidth < 768 && mainContainer.classList.contains('gallery__container')) {
        displayItems(galleryItems); // 1 column for mobile
    } else if (viewportWidth >= 768 && viewportWidth < 1440 && mainContainer.classList.contains('gallery__container')) {
        displayItems(galleryItems, 2); // 2 columns for tablets
    } else if (viewportWidth >= 1440 && mainContainer.classList.contains('gallery__container')) {
        displayItems(galleryItems, 4); // 4 columns for large screens
    }
}

/**
 * Updates the length of the progress border based on the current page index.
 * @param {Number} pageIndex - Current page index.
 */
function updateBorderLength(pageIndex) {
    const border = document.querySelector('.border');
    const widthPercentage = (pageIndex / (galleryItems.length - 1)) * 100;
    border.style.display = 'block';
    border.style.width = widthPercentage + '%';
}

/**
 * Moves to the next or previous page.
 * @param {String} direction - 'previous' or 'next'.
 */
function navigateToPage(direction) {
    switch (direction) {
        case 'previous':
            currentPageIndex = (currentPageIndex - 1 + galleryItems.length) % galleryItems.length;
            break;
        case 'next':
            currentPageIndex = (currentPageIndex + 1) % galleryItems.length;
            break;
    }

    const currentItem = galleryItemsData[currentPageIndex];
    createDetailedView(currentItem,currentPageIndex);
    updateBorderLength(currentPageIndex);
}

/**
 * Clears the slideshow interval.
 */
function stopSlideshow() {
    if (slideshowIntervalID) {
        clearInterval(slideshowIntervalID);
        slideshowIntervalID = null;
        updateSlideshowButtonText();
        runSlideshowProgressBar();
    }
}

/**
 * Updates the text of the slideshow button based on the current state.
 */
function updateSlideshowButtonText() {
    startSlideshowBtn.textContent = slideshowIntervalID ? 'Stop Slideshow' : 'Start Slideshow';
}

/**
 * Starts or stops the slideshow.
 */
function toggleSlideshow() {
    if (!slideshowIntervalID) {
        navigateToPage('next'); // Move to the next item
        slideshowIntervalID = setInterval(() => {
            runSlideshowProgressBar();
            navigateToPage('next');
        }, slideshowIntervalDuration);
        runSlideshowProgressBar();
    } else {
        stopSlideshow();
    }
    updateSlideshowButtonText();
}

/**
 * show modal containing bigger picture of an item.
 */

function showHeroImage(e) {
    e.preventDefault();
    modal.classList.toggle('active')
    if(!e.target.classList.contains('modal__close')) {
        const parent = e.target.closest('.item__container')
        const itemID = parent.getAttribute('data-id')
        const img = modal.querySelector('img')
        img.src = galleryItemsData[itemID].images.hero.large
    }

}

// Event listeners
window.addEventListener('DOMContentLoaded', fetchGalleryData);
window.addEventListener('resize', handleResize);

document.addEventListener('click', (e) => {
    if (e.target.classList.contains('left')) {
        stopSlideshow();
        navigateToPage('previous');
    } else if (e.target.classList.contains('right')) {
        stopSlideshow();
        navigateToPage('next');
    } else if (e.target.classList.contains('item__view_image') || e.target.classList.contains('view_image') || e.target.classList.contains('view_p')) {
        showHeroImage(e)
    } else if (e.target.classList.contains('modal__close')) {
        showHeroImage(e)
    }
});

window.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowLeft') {
        stopSlideshow();
        navigateToPage('previous');
    } else if (e.code === 'ArrowRight') {
        stopSlideshow();
        navigateToPage('next');
    }
});

startSlideshowBtn.addEventListener('click', toggleSlideshow);

/**
 * Hides the loading progress bar.
 */
function hideLoadingProgressBar() {
    const border = document.querySelector('.loading-border');
    if (border) {
        border.style.display = 'none';
        border.style.width = '0%';
    }
}

/**
 * Updates the width of the loading progress bar.
 * @param {Number} percentage - Progress percentage.
 */
function updateLoadingProgressBar(percentage) {
    const border = document.querySelector('.loading-border');
    if (border) {
        if (percentage <= 100) {
            border.style.display = 'block';
            border.style.width = percentage + '%';
        } else {
            hideLoadingProgressBar();
        }
    }
}

/**
 * Sleeps for a given number of milliseconds.
 * @param {Number} ms - Milliseconds to sleep.
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Runs the slideshow progress bar with a pause between updates.
 */
async function runSlideshowProgressBar() {
    if (slideshowIntervalID) {
        for (let i = 0; i <= 100; i++) {
            if (!slideshowIntervalID) {
                hideLoadingProgressBar();
                break;
            }
            updateLoadingProgressBar(i);
            await sleep(26);
        }
    } else {
        hideLoadingProgressBar();
    }
}
