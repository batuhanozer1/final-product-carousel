(() => {
    const DATA_SOURCE = "https://gist.githubusercontent.com/sevindi/8bcbde9f02c1d4abe112809c974e1f49/raw/9bf93b58df623a9b16f1db721cd0a7a539296cf0/products.json";
    const LIKED_ITEMS_KEY = "userLikedItems";
    const CACHED_ITEMS_KEY = "sliderItems";
    let itemList = [];
    let likedItems = {};
    let sliderPosition = 0;
    
    const debounce = (func, delay) => {
        let timer;
        return function(...args) {
            clearTimeout(timer);
            timer = setTimeout(() => func.apply(this, args), delay);
        };  
    };
    
    const startSlider = async () => {
        const isHomePage = isIndexPage();
        if (!isHomePage) {
            console.log("Wrong Page");
            return;
        }
        injectStyles();
        const dataLoaded = await fetchItemData();
        if (dataLoaded) {
            whenTargetReady(() => renderSlider());
        } else {
            console.error("E-bebek Slider: Veri yüklenirken bir hata oluştu");
        }
    };

    const isIndexPage = () => {
        const urlPath = window.location.pathname.toLowerCase();
        if (urlPath === '/' || urlPath === '/index.html' || urlPath === '/home.html') {
            return true;
        }
        const hasMainPageMarkers = !!document.querySelector('#home-banner, .home-hero, .main-page-content, .homepage-slider');
        const containsHomeKeyword = /^\/(home|index|main|ana|start)(\.html)?$/i.test(urlPath);
        const isShortPath = urlPath.split('/').filter(Boolean).length <= 1;
        return hasMainPageMarkers || (containsHomeKeyword && isShortPath);
    };

    const injectStyles = () => {
        if (document.querySelector('#bb-slider-styles')) return;
        const styleText = `
            .bb-slider-container {
                max-width: 1320px;
                margin: 40px auto;
                padding: 0 15px;
                font-family: Poppins, sans-serif;
                clear: both;
                position: relative;
            }
            .bb-slider-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                background-color: #fef6eb;
                padding: 25px 67px;
                border-top-left-radius: 35px;
                border-top-right-radius: 35px;
                margin-bottom: 0;
            }
            .bb-slider-title {
                font-family: Quicksand-Bold, sans-serif;
                font-size: 3rem;
                font-weight: 700;
                line-height: 1.11;
                color: #f28e00;
                margin: 0;
            }
            .bb-slider-track-container {
                position: relative;
                overflow: hidden;
                box-shadow: 15px 15px 30px 0 rgba(235, 235, 235, 0.5);
                background-color: #fff;
                border-bottom-left-radius: 35px;
                border-bottom-right-radius: 35px;
            }
            .bb-slider-track {
                display: flex;
                transition: transform 0.25s ease-out;
            }
            .bb-slider-track.swiping {
                transition: none;
            }
            .bb-slider-item {
                flex-shrink: 0;
                padding: 10px 0;
                margin: 0 20px 20px 3px;
                width: 237.2px;
                height: 520px;
                transition: all 0.3s ease;
            }
            .bb-item-card {
                border-radius: 8px;
                transition: all 0.3s ease;
                position: relative;
                background: white;
                height: 100%;
                border: 1px solid #ededed; 
                display: flex;
                flex-direction: column;
                overflow: visible;
                box-sizing: border-box;
            }
            .bb-item-card:hover {
                box-shadow: 0 0 0 0 #00000030, inset 0 0 0 3px #f28e00;
                border-color: transparent;
                z-index: 5;
            }
            .bb-item-image-wrap {
                position: relative;
                width: 100%;
                height: 245px;
                overflow: hidden;
                padding: 3px;
                border-top-left-radius: 8px;
                border-top-right-radius: 8px;
            }
            .bb-item-image {
                width: 100% !important;
                height: 100%;
                object-fit: contain;
                position: relative;
                z-index: 0;
            }
            .bb-discount-label {
                display: inline-block;
                background: white;
                color: #00A365;
                border-radius: 4px;
                padding: 2px 6px;
                font-size: 18px;
                font-weight: 700;
            }
            .bb-like-button {
                position: absolute;
                top: 10px;
                right: 10px;
                background: white;
                border: none;
                width: 50px;
                height: 50px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                z-index: 2;
                padding: 0;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
            }
            .bb-like-button img {
                width: 25px;
                height: 25px;
            }
            .bb-like-button:hover img,
            .bb-like-button.is-liked img {
                width: 50px;
                height: 50px;
            }
            .bb-like-button.is-liked img {
                display: none;
            }
            .bb-like-button .heart-icon {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 25px;
                height: 25px;
                display: none;
            }
            .bb-like-button.is-liked .heart-icon {
                display: block;
            }
            .bb-item-details-link {
                display: block;
                padding: 0 17px 17px;
                color: inherit;
                text-decoration: none;
                flex-grow: 1;
                height: 180px;
            }
            .bb-item-info {
                padding-top: 17px;
                height: 65px;
                overflow: hidden;
                margin-bottom: 15px;
            }
            .bb-item-name {
                font-size: 1.2rem;
                color: #7D7D7D;
                font-weight: 500;
                line-height: 1.222222;
                display: -webkit-box;
                -webkit-line-clamp: 3;
                -webkit-box-orient: vertical;
                overflow: hidden;
                max-height: 90px;
            }
            .bb-brand-name {
                font-weight: bolder;
                color: #7D7D7D;
            }
            .bb-item-price-container {
                display: flex;
                flex-direction: column;
                height: 45px;
                margin-top: 0;
                margin-bottom: 30px;
            }
            .bb-discount-info {
                display: flex;
                align-items: center;
                margin-bottom: 5px;
                height: 22px;
            }
            .bb-price {
                font-size: 1.8rem;
                font-weight: 600;
                color: #00A365;
                line-height: 1.2;
                height: 25px;
            }
            .bb-regular-price {
                color: #7D7D7D;
            }
            .bb-original-price {
                font-size: 13.44px;
                text-decoration: line-through;
                color: #7D7D7D;
                margin-right: 6px;
            }
            .bb-add-to-basket {
                width: 200px;
                height: 48px;
                padding: 15px 20px;
                border-radius: 37.5px;
                background-color: #fff7ec;
                color: #f28e00;
                font-family: Poppins, sans-serif;
                font-size: 1.4rem;
                font-weight: 700;
                border: none;
                cursor: pointer;
                transition: all 0.3s ease;
                margin: 0 auto 17px;
                z-index: 2;
            }
            .bb-add-to-basket:hover {
                background-color: #f28e00;
                color: #fff;
            }
            .bb-slider-nav-button {
                position: absolute;
                top: 50%;
                transform: translateY(-50%);
                width: 48px;
                height: 48px;
                background-color: #fff7ec;
                border: 1px solid transparent;
                border-radius: 50%;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
                cursor: pointer;
                z-index: 10;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;
                color: #f28e00;
            }
            .bb-slider-nav-button:hover {
                background-color: #fff;
                color: #f28e00;
                border: 1px solid #f28e00;
            }
            .bb-prev-button {
                left: -60px;
            }
            .bb-next-button {
                right: -60px;
            }
            .bb-slider-nav-button svg {
                width: 34px;
                height: 34px;
                fill: currentColor;
            }
            @media (max-width: 1320px) {
                .bb-slider-container {
                    max-width: 900px;
                }
                .bb-prev-button { left: 5px; }
                .bb-next-button { right: 5px; }
                .bb-slider-header {
                    padding: 20px 40px;
                }
                .bb-slider-title {
                    font-size: 2.2rem;
                    color: #f28e00;
                }
            }
            @media (max-width: 992px) {
                .bb-slider-container {
                    max-width: 600px;
                }
                .bb-slider-header {
                    padding: 15px 30px;
                }
                .bb-slider-title {
                    font-size: 2rem;
                    line-height: 1.11;
                    color: #f28e00;
                }
                .bb-item-details-link {
                    height: 160px;
                }
                .bb-add-to-basket {
                    width: 180px;
                    font-size: 1.2rem;
                }
            }
            @media (max-width: 768px) {
                .bb-slider-container {
                    max-width: 360px;
                    margin: 20px auto;
                }
                .bb-slider-nav-button {
                    display: none !important;
                }
                .bb-slider-header {
                    padding: 10px 20px;
                    border-top-left-radius: 20px;
                    border-top-right-radius: 20px;
                    background-color: #ffffff;
                }
                .bb-slider-title {
                    font-size: 2.2rem;
                    line-height: 1.5;
                    color: #f28e00;
                }
                .bb-slider-track-container {
                    border-bottom-left-radius: 35px;
                    border-bottom-right-radius: 35px;
                }
                .bb-slider-item {
                    width: 162px;
                    height: 410px;
                    margin-right: 15px;
                    padding: 8px 0;
                }
                .bb-item-image-wrap {
                    height: 180px;
                }
                .bb-like-button {
                    width: 36px;
                    height: 36px;
                    top: 5px;
                    right: 5px;
                }
                .bb-item-details-link {
                    height: 140px;
                }
                .bb-item-name {
                    font-size: 1.2rem !important;
                }
                .bb-price {
                    font-size: 1.8rem !important;
                }
                .bb-add-to-basket {
                    width: 130px;
                    height: 36px;
                    font-size: 12px !important;
                    font-family: Poppins, "cursive" !important;
                    padding: 8px 12px;
                }
            }
            @media (max-width: 576px) {
                .bb-slider-container {
                    margin: 15px auto;
                }
                .bb-slider-header {
                    padding: 8px 15px;
                    border-top-left-radius: 15px;
                    border-top-right-radius: 15px;
                }
                .bb-slider-item {
                    margin-right: 10px;
                }
                .bb-item-details-link {
                    padding: 0 10px 10px;
                }
                .bb-item-info {
                    padding-top: 10px;
                    height: 55px;
                }
                .bb-item-price-container {
                    margin-bottom: 15px;
                }
            }
        `;
        const styleElement = document.createElement('style');
        styleElement.id = 'bb-slider-styles';
        styleElement.textContent = styleText;
        document.head.appendChild(styleElement);
    };
    
    const fetchItemData = async () => {
        try {
            const storedLikes = localStorage.getItem(LIKED_ITEMS_KEY);
            if (storedLikes) {
                const parsedData = JSON.parse(storedLikes);
                if (Array.isArray(parsedData)) {
                    likedItems = {};
                    parsedData.forEach(id => {
                        likedItems[id] = true;
                    });
                } else {
                    likedItems = parsedData;
                }
            }
            const cachedItems = localStorage.getItem(CACHED_ITEMS_KEY);
            if (cachedItems) {
                itemList = JSON.parse(cachedItems);
                if (itemList.length > 0) {
                    console.log("E-bebek Slider: Ürünler localStorage'dan yüklendi");
                    return true;
                }
            }
        } catch (err) {
            likedItems = {};
            localStorage.removeItem(CACHED_ITEMS_KEY);
        }
        try {
            const response = await fetch(DATA_SOURCE);
            if (!response.ok) throw new Error('API bağlantı hatası');
            
            const data = await response.json();
            if (Array.isArray(data) && data.length > 0) {
                itemList = data;
                console.log("E-bebek Slider: Ürünler API'den yüklendi");
                try {
                    localStorage.setItem(CACHED_ITEMS_KEY, JSON.stringify(itemList));
                } catch (storageErr) {}
                return true;
            }
            return false;
        } catch (err) {
            console.error("E-bebek Slider: Veri yüklenirken hata oluştu", err);
            return false;
        }
    };
    
    const renderSlider = () => {
        const existingSlider = document.querySelector('.bb-slider-container');
        if (existingSlider) {
            existingSlider.remove();
        }
        const sliderContainer = document.createElement('div');
        sliderContainer.className = 'bb-slider-container';
        
        const headerSection = document.createElement('div');
        headerSection.className = 'bb-slider-header';
        
        const headerTitle = document.createElement('h2');
        headerTitle.className = 'bb-slider-title';
        headerTitle.textContent = 'Beğenebileceğinizi düşündüklerimiz';
        
        headerSection.appendChild(headerTitle);
        sliderContainer.appendChild(headerSection);
        
        const sliderTrackContainer = document.createElement('div');
        sliderTrackContainer.className = 'bb-slider-track-container';
        
        const sliderTrack = document.createElement('div');
        sliderTrack.className = 'bb-slider-track';
        
        itemList.forEach(item => {
            const itemCard = createItemCard(item);
            sliderTrack.appendChild(itemCard);
        });
        
        sliderTrackContainer.appendChild(sliderTrack);
        sliderContainer.appendChild(sliderTrackContainer);
        
        const prevButton = document.createElement('button');
        prevButton.className = 'bb-slider-nav-button bb-prev-button';
        prevButton.innerHTML = '<svg viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"></path></svg>';
        
        const nextButton = document.createElement('button');
        nextButton.className = 'bb-slider-nav-button bb-next-button';
        nextButton.innerHTML = '<svg viewBox="0 0 24 24"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"></path></svg>';
        
        sliderContainer.appendChild(prevButton);
        sliderContainer.appendChild(nextButton);
        
        const targetSection = document.querySelector('cx-page-slot[position="Section1"], .Section1.has-components');
        if (targetSection) {
            targetSection.after(sliderContainer);
            console.log('E-bebek Slider: Section1 elementinin altına eklendi');
        } else {
            const fallbackTarget = document.querySelector('.homepage-main, main .container, .Section1.has-components');
            if (fallbackTarget) {
                fallbackTarget.after(sliderContainer);
                console.log('E-bebek Slider: Alternatif bölümün altına eklendi');
            } else {
                document.body.appendChild(sliderContainer);
                console.log('E-bebek Slider: Sayfanın en altına eklendi');
            }
        }
        
        updateSliderDimensions(sliderTrack);
        attachEventListeners(sliderTrack, prevButton, nextButton);
    };
    
    const createItemCard = (item) => {
        const itemId = item.id || Math.floor(Math.random() * 10000);
        const brandName = item.brand || "";
        const itemName = item.name || item.title || "Ürün";
        const itemUrl = item.url || "#";
        const imageUrl = item.img || "https://via.placeholder.com/300";
        let currentPrice = parseFloat(item.price) || 0;
        let oldPrice = parseFloat(item.original_price) || currentPrice;

        if (currentPrice > oldPrice) {
            [currentPrice, oldPrice] = [oldPrice, currentPrice];
        }
        
        const hasDiscount = currentPrice !== oldPrice;
        const discountPercent = hasDiscount ? Math.round(100 - (currentPrice * 100 / oldPrice)) : 0;
        const isItemLiked = !!likedItems[itemId];
        
        const cardItem = document.createElement('div');
        cardItem.className = 'bb-slider-item';
        
        cardItem.innerHTML = `
            <div class="bb-item-card" data-item-id="${itemId}">
                <div class="bb-item-image-wrap">
                    <img class="bb-item-image" src="${imageUrl}" alt="${itemName}">
                    <button class="bb-like-button ${isItemLiked ? 'is-liked' : ''}">
                        <img src="https://www.e-bebek.com/assets/svg/default-favorite.svg" 
                            alt="Beğen" 
                            class="like-icon">
                        <svg class="heart-icon" viewBox="0 0 24 24" width="25" height="25">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#F28E00"/>
                        </svg>
                    </button>
                </div>
                <a href="${itemUrl}" class="bb-item-details-link" target="_blank">
                    <div class="bb-item-info">
                        <span class="bb-item-name">
                            ${brandName ? `<span class="bb-brand-name">${brandName}</span> - ` : ''}${itemName}
                        </span>
                    </div>
                    <div class="bb-item-price-container">
                        ${hasDiscount ? `
                            <div class="bb-price-wrapper">
                                <div class="bb-discount-info">
                                    <span class="bb-original-price">${oldPrice.toFixed(2)} TL</span>
                                    <span class="bb-discount-label">%${discountPercent} </span>
                                </div>
                                <span class="bb-price">${currentPrice.toFixed(2)} TL</span>
                            </div>
                        ` : `
                            <div class="bb-price-wrapper">
                                <span class="bb-price bb-regular-price">${currentPrice.toFixed(2)} TL</span>
                            </div>
                        `}
                    </div>
                </a>
                <button class="bb-add-to-basket">Sepete Ekle</button>
            </div>
        `;
        
        return cardItem;
    };
    
    const updateSliderDimensions = (sliderTrack) => {
        const isMobile = window.innerWidth <= 768;
        const cardWidth = isMobile ? 162 : 237.2;
        const cardMargin = isMobile ? (window.innerWidth <= 576 ? 10 : 15) : 20;
        const itemWidth = cardWidth + cardMargin;
        sliderTrack.style.width = `${(itemList.length * itemWidth) + 20}px`;
        return itemWidth;
    };
    
    const updateSliderPosition = (sliderTrack) => {
        const isMobile = window.innerWidth <= 768;
        const cardWidth = isMobile ? 162 : 237.2;
        const cardMargin = isMobile ? (window.innerWidth <= 576 ? 10 : 15) : 20;
        const itemWidth = cardWidth + cardMargin;
        sliderTrack.style.transform = `translateX(-${sliderPosition * itemWidth}px)`;
        return itemWidth;
    };
    
    const addTouchSupport = (sliderTrack, prevButton, nextButton) => {
        let touchStartX = 0;
        let touchEndX = 0;
        let trackStartPos = 0;
        let isDragging = false;
        
        sliderTrack.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            const isMobile = window.innerWidth <= 768;
            const cardWidth = isMobile ? 162 : 237.2;
            const cardMargin = isMobile ? (window.innerWidth <= 576 ? 10 : 15) : 20;
            trackStartPos = sliderPosition * (cardWidth + cardMargin);
            isDragging = true;
            sliderTrack.classList.add('swiping');
        }, {passive: true});
        
        sliderTrack.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            const touchMoveX = e.changedTouches[0].screenX;
            const diffX = touchStartX - touchMoveX;
            sliderTrack.style.transform = `translateX(-${trackStartPos + diffX}px)`;
        }, {passive: true});
        
        sliderTrack.addEventListener('touchend', (e) => {
            isDragging = false;
            sliderTrack.classList.remove('swiping');
            touchEndX = e.changedTouches[0].screenX;
            const swipeDistance = touchStartX - touchEndX;
            const threshold = 30;
            
            if (Math.abs(swipeDistance) >= threshold) {
                const visibleItems = calculateVisibleItems();
                const maxPosition = Math.max(0, itemList.length - visibleItems);
                if (swipeDistance > 0 && sliderPosition < maxPosition) {
                    sliderPosition++;
                } else if (swipeDistance < 0 && sliderPosition > 0) {
                    sliderPosition--;
                }
            }
            
            updateSliderPosition(sliderTrack);
            updateNavButtons(prevButton, nextButton);
        }, {passive: true});
    };
    
    const attachEventListeners = (sliderTrack, prevButton, nextButton) => {
        const likeButtons = document.querySelectorAll('.bb-like-button');
        likeButtons.forEach(button => {
            const likeIcon = button.querySelector('.like-icon');
            
            button.addEventListener('mouseenter', () => {
                if (!button.classList.contains('is-liked')) {
                    likeIcon.src = 'https://www.e-bebek.com/assets/svg/default-hover-favorite.svg';
                }
            });
            
            button.addEventListener('mouseleave', () => {
                if (!button.classList.contains('is-liked')) {
                    likeIcon.src = 'https://www.e-bebek.com/assets/svg/default-favorite.svg';
                }
            });
            
            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const card = button.closest('.bb-item-card');
                if (!card) return;
                const itemId = parseInt(card.dataset.itemId, 10);
                toggleLikeStatus(itemId, button);
            });
        });
        
        const basketButtons = document.querySelectorAll('.bb-add-to-basket');
        basketButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const card = button.closest('.bb-item-card');
                if (!card) return;
                const itemId = parseInt(card.dataset.itemId, 10);
                const product = itemList.find(p => p.id === itemId);
                if (product) {
                    showAddToCartNotification(product.name || product.title);
                }
            });
        });
        
        prevButton.style.opacity = '0.5';
        updateNavButtons(prevButton, nextButton);
        
        prevButton.addEventListener('click', () => {
            if (sliderPosition > 0) {
                sliderPosition--;
                updateSliderPosition(sliderTrack);
                updateNavButtons(prevButton, nextButton);
            }
        });
        
        nextButton.addEventListener('click', () => {
            const visibleItems = calculateVisibleItems();
            const maxPosition = Math.max(0, itemList.length - visibleItems);
            if (sliderPosition < maxPosition) {
                sliderPosition++;
                updateSliderPosition(sliderTrack);
                updateNavButtons(prevButton, nextButton);
            }
        });
        
        addTouchSupport(sliderTrack, prevButton, nextButton);
        
        window.addEventListener('resize', debounce(() => {
            updateSliderDimensions(sliderTrack);
            const visibleItems = calculateVisibleItems();
            const maxPosition = Math.max(0, itemList.length - visibleItems);
            if (sliderPosition > maxPosition) {
                sliderPosition = maxPosition;
            }
            updateSliderPosition(sliderTrack);
            updateNavButtons(prevButton, nextButton);
        }, 250));
    };
    
    const showAddToCartNotification = (productName) => {
        alert(`"${productName}" sepete eklendi`);
    };
    
    const toggleLikeStatus = (itemId, button) => {
        if (likedItems[itemId]) {
            delete likedItems[itemId];
            button.classList.remove('is-liked');
        } else {
            likedItems[itemId] = true;
            button.classList.add('is-liked');
        }
        localStorage.setItem(LIKED_ITEMS_KEY, JSON.stringify(likedItems));
    };
    
    const updateNavButtons = (prevButton, nextButton) => {
        const visibleItems = calculateVisibleItems();
        const maxPosition = Math.max(0, itemList.length - visibleItems);
        prevButton.style.opacity = '1';
        prevButton.style.pointerEvents = sliderPosition <= 0 ? 'none' : 'auto';
        nextButton.style.opacity = '1';
        nextButton.style.pointerEvents = sliderPosition >= maxPosition ? 'none' : 'auto';
    };
    
    const calculateVisibleItems = () => {
        const screenWidth = window.innerWidth;
        if (screenWidth < 768) return 2;
        if (screenWidth < 992) return 3;
        if (screenWidth < 1200) return 4;
        return 5;
    };
    
    const whenTargetReady = (callback, maxTries = 20, waitTime = 300) => {
        let attempt = 0;
        const checkForTarget = () => {
            const targetElement = document.querySelector('.Section1.has-components, .homepage-main, main .container');
            attempt++;
            if (targetElement) {
                callback();
            } else if (attempt < maxTries) {
                setTimeout(checkForTarget, waitTime);
            } else {
                callback();
            }
        };
        checkForTarget();
    };
    
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setTimeout(startSlider, 1);
    } else {
        document.addEventListener('DOMContentLoaded', startSlider);
    }
})();