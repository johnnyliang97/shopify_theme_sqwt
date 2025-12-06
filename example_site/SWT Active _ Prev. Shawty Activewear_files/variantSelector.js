(function () {
  if (typeof WishlistPlusVariantSelectorAPI === "undefined") {
    window.WishlistPlusVariantSelectorAPI = {};
  }
  WishlistPlusVariantSelectorAPI.productData = [];
  WishlistPlusVariantSelectorAPI.variantImagesArray = [];
  WishlistPlusVariantSelectorAPI.selectedVariant = [];
  WishlistPlusVariantSelectorAPI.selectCallBackObj = [];
  WishlistPlusVariantSelectorAPI.currentVariantId = "";
  WishlistPlusVariantSelectorAPI.arrayOfSwymCollectionsButtons = [];
  WishlistPlusVariantSelectorAPI.globalActionArray = [];
  WishlistPlusVariantSelectorAPI.globalActionArray = [];
  WishlistPlusVariantSelectorAPI.globalListArray = [];
  WishlistPlusVariantSelectorAPI.globalProductsInListArray = [];
  WishlistPlusVariantSelectorAPI.productURL = "";
  WishlistPlusVariantSelectorAPI.isSingleWishlist = "";
  WishlistPlusVariantSelectorAPI.selectedList = [];
  WishlistPlusVariantSelectorAPI.selectedVariantOption = "";
  WishlistPlusVariantSelectorAPI.selectedVariantObject = "";
  WishlistPlusVariantSelectorAPI.removeList = [];
  WishlistPlusVariantSelectorAPI.addToListArr = [];
  WishlistPlusVariantSelectorAPI.commonAction = false;

  WishlistPlusVariantSelectorAPI.convertObjectToString = (
    selectCallBackObj
  ) => {
    return Object.values(selectCallBackObj).join(" / ");
  };
  WishlistPlusVariantSelectorAPI.showErrorNotification = (error) => {
    window._swat.ui.uiRef.showErrorNotification({ message: error });
  };
  WishlistPlusVariantSelectorAPI.showSuccessNotification = (success) => {
    window._swat.ui.uiRef.showSuccessNotification({ message: success });
  };
  WishlistPlusVariantSelectorAPI.toggleVariantData = () => {
    try {
      function getSelectedVariant(selectCallBackObj) {
        WishlistPlusVariantSelectorAPI.globalActionArray = [];
        const variants =
          WishlistPlusVariantSelectorAPI.productData.product.variants;
        let variantComboUnavailable = false;
        variants.forEach((variant) => {
          const filterTitle =
            WishlistPlusVariantSelectorAPI.convertObjectToString(
              selectCallBackObj
            );
          if (filterTitle == variant.title) {
            variantComboUnavailable = true;
            WishlistPlusVariantSelectorAPI.selectedVariant = variant;
            WishlistPlusVariantSelectorAPI.currentVariantId = variant.id;
          }
        });
      }
      getSelectedVariant(WishlistPlusVariantSelectorAPI.selectCallBackObj);
      if (!WishlistPlusVariantSelectorAPI.isSingleWishlist) {
        const listArr = WishlistPlusVariantSelectorAPI.globalListArray;
        const listItem = document.querySelector(
          ".swym-variant-selector-wishlist-item"
        );
        const listId = listItem?.getAttribute("id")?.split("-list-")[1];
        const list = listArr.find((list) => list.lid === listId);
        const variantExistsInList = list?.listcontents.some(
          (product) =>
            product.epi == WishlistPlusVariantSelectorAPI.currentVariantId
        );
        listItem?.classList.toggle(
          "swym-vs-default-list-selected",
          variantExistsInList
        );

        const selectedListIndex =
          WishlistPlusVariantSelectorAPI.selectedList.indexOf(listId);
        if (!variantExistsInList && selectedListIndex !== -1) {
          WishlistPlusVariantSelectorAPI.selectedList.splice(
            selectedListIndex,
            1
          );
        }
        if (variantExistsInList && selectedListIndex === -1) {
          WishlistPlusVariantSelectorAPI.selectedList.push(listId);
          WishlistPlusVariantSelectorAPI.addToListArr.splice(
            WishlistPlusVariantSelectorAPI.addToListArr.indexOf(listId),
            1
          );
        }
        WishlistPlusVariantSelectorAPI.updateButtonState();
      } else {
        const listArr = WishlistPlusVariantSelectorAPI.globalListArray;
        const myWishlist = listArr?.find(
          (item) => item.lname === "My Wishlist"
        );
        const variantExistsInList = myWishlist?.listcontents?.some(
          (product) =>
            product.epi == WishlistPlusVariantSelectorAPI.currentVariantId
        );
        if (variantExistsInList) {
          document.getElementById("swym-vs-add-to-wishlist-single").innerHTML =
            window._swat.retailerSettings.Strings
                ?.CollectionsRemoveItemCTA || "Remove from List";
        }
        const singleList = document.getElementById(
          "swym-vs-add-to-wishlist-single"
        );
        if (singleList) {
          if (variantExistsInList && singleList) {
            singleList.classList.add("variant-in-wishlist");
            singleList.innerHTML = 
            window._swat.retailerSettings.Strings
                ?.CollectionsRemoveItemCTA || "Remove from List";
          }
          if (!variantExistsInList && singleList) {    
            singleList.classList.remove("variant-in-wishlist");
            singleList.innerHTML =
              window._swat.retailerSettings.Strings
                ?.AddWishlistPopupCTASaveAdd || "Add To List";
          }
          singleList.classList.remove("swym-vs-hidden");
        }
      }

      // update the image
      const productData = WishlistPlusVariantSelectorAPI.productData;
      const alternateVariantImages = productData?.product?.images;
      const selectedVariant = WishlistPlusVariantSelectorAPI.selectedVariant;
      const variantPrice = `${window.Shopify?.currency?.active || window._swat?.currency} ${selectedVariant?.price}`;
      const imageId = selectedVariant?.image_id;
      const variantImage = document.getElementById("swym-custom-primary-image");
      if (variantImage) {
        const matchingImage = alternateVariantImages?.find(img => img.id === imageId);
        if (matchingImage) {
          variantImage.setAttribute("src", matchingImage.src);
        } else if (productData?.product?.image?.src) {
          variantImage.setAttribute("src", productData.product.image.src);
        }
      }

      // update the price
      const customVariantPriceElement = document.getElementById("swym-custom-variant-price");
      if (variantPrice && customVariantPriceElement) {
        customVariantPriceElement.innerHTML = variantPrice;
      }
    } catch (error) {
      window._swat.utils?.log(
        error,
        "[Variant Selector] - Error in toggleVariantData function"
      );
    }
  };
  WishlistPlusVariantSelectorAPI.renderVariantSelectors = () => {
    try {
      function handleRadioButtonClick(event) {
        const selectedValue = decodeURIComponent(event.target.getAttribute('data-value'));
        const optionIndex = event.currentTarget.getAttribute("optionIndex");
        WishlistPlusVariantSelectorAPI.selectCallBackObj = {
          ...WishlistPlusVariantSelectorAPI.selectCallBackObj,
          [optionIndex]: selectedValue,
        };
        const labels = event.currentTarget.parentNode.querySelectorAll(
          `label[for="${event.target.id}"]`
        );
        labels.forEach((label) => {
          label.classList.add("selected");
        });
        const allRadios = event.currentTarget.parentNode.querySelectorAll('input[type="radio"]');
        allRadios.forEach((radio) => {
          if (radio !== event.target) {
            const labels = event.currentTarget.parentNode.querySelectorAll(
              `label[for="${radio.id}"]`
            );
            labels.forEach((label) => {
              label.classList.remove("selected");
            });
          }
        });
        WishlistPlusVariantSelectorAPI.toggleVariantData();
      }
      function createRadioGroup(option, optionIndex) {
        const variantOptions = option.values.map((value, index) => {
          const currentOption = WishlistPlusVariantSelectorAPI.selectedVariant[`option${optionIndex + 1}`];
          const isSelected = String(value) === String(currentOption);
          const optionId = `${option.name}-${index}`;
          
          let displayValue = "";
          if (value) {
            const trimmedValue = value.trim();
            displayValue = trimmedValue === "Default Title" ? "" : trimmedValue;
          }
          return `<input style="display: none;" 
                     selected="${isSelected}" 
                     id="${optionId}" 
                     type="radio" 
                     name="${option.name}" 
                     optionIndex="${optionIndex}" 
                     data-value="${encodeURIComponent(value)}" 
                     aria-label="${option.name} ${displayValue}"></input>
                  <label class="swym-filter-labels ${isSelected ? "selected" : ""}" 
                         for="${optionId}">${displayValue}</label>`;
        }).join("");
        
        const radioGroup = document.createElement("div");
        
        // Hide the entire option group if it only contains "Default Title"
        const shouldHideGroup = option?.values.length === 1 && option.values[0] === "Default Title";
        
        radioGroup.setAttribute(
          "class",
          `${option.name} swym-filter-option-name ${
            WishlistPlusVariantSelectorAPI.isSingleWishlist
              ? "swym-vs-anim-slide-in"
              : ""
          }`
        );
        
        // Apply display: none style if this is a Default Title only group
        if (shouldHideGroup) {
          radioGroup.style.display = "none";
        }
        
        radioGroup.innerHTML = `<div id="swymOptionName" selected value="${option.name}">${option.name}</div>
                              <div class="swym-radio-buttons-container">${variantOptions}</div>`;         
        const radioButtons = radioGroup.querySelectorAll(
          `[name="${option.name}"]`
        );       
        for (let i = 0; i < radioButtons.length; i++) {
          radioButtons[i].addEventListener("click", function (event) {
            handleRadioButtonClick(event);
          });
        }      
        return radioGroup;
      }
      const optionsArray =
        WishlistPlusVariantSelectorAPI?.productData?.product?.options;
      const variantSelectionContainer = document.getElementById(
        "swym-custom-variant-selector-container"
      );
      // Clear existing content
      if (variantSelectionContainer) {
        variantSelectionContainer.innerHTML = "";
      }
      // Create and append each variant option as a radio button group
      optionsArray.forEach((option, optionIndex) => {
        const radioGroup = createRadioGroup(option, optionIndex);
        variantSelectionContainer.appendChild(radioGroup);
        radioGroup
          .querySelector('input[type="radio"][selected="true"]')
          ?.click();
      });
    } catch (error) {
      window._swat.utils?.log(
        error,
        "[Variant Selector] - Error in renderVariantSelectors function"
      );
    }
  };
  WishlistPlusVariantSelectorAPI.showZoomedView = (e) => {
    try {
      const zoomedView = document.createElement("div");
      const zoomedImage = new Image();
      SwymUtils.addClass(zoomedView, "zoomed-image");
      zoomedImage.src = e.target.src;
      zoomedView.appendChild(zoomedImage);
      const closeButton = document.createElement("button");
      closeButton.setAttribute("aria-label", "Close zoomed image");
      closeButton.classList.add(
        "swym-zoomed-image-close-button",
        "swym-vs-close-button"
      );
      closeButton.innerHTML = "&times;";
      closeButton.addEventListener("click", () => {
        document.body.removeChild(zoomedView);
      });
      zoomedView.appendChild(closeButton);
      document.body.appendChild(zoomedView);
      zoomedView.addEventListener("click", (event) => {
        if (event.target === zoomedView) {
          document.body.removeChild(zoomedView);
        }
      });
    } catch (error) {
      window._swat.utils?.log(
        error,
        "[Variant Selector] - Error in showZoomedView function"
      );
    }
  };
  WishlistPlusVariantSelectorAPI.generateImageCarousel = () => {
    try {
      WishlistPlusVariantSelectorAPI.variantImagesArray =
        WishlistPlusVariantSelectorAPI.productData.product.images;
      function addImgBlobClickListener(event) {
        const imgBlobSrc = event.target.getAttribute("src");
        const allImgBlobs = document.querySelectorAll(
          "#swym-custom-image-blob"
        );
        // const variantImage = document.getElementById("swym-custom-primary-image");
        document.getElementById("swym-custom-primary-image").src = imgBlobSrc;
        allImgBlobs.forEach((imgBlob) => {
          if (imgBlob !== event.target) {
            imgBlob.classList.remove("selected");
          }
        });
        SwymUtils.toggleClass(event.target, "selected");
      }
      function addImageSliderEventListeners() {
        const slide = document.querySelector(".swym-custom-slider-image");
        const imageSliderContainer = document.getElementById(
          "swym-custom-images-slide-container"
        );
        const prevButton = document.getElementById(
          "swym-custom-slide-arrow-prev"
        );
        const nextButton = document.getElementById(
          "swym-custom-slide-arrow-next"
        );
        nextButton.addEventListener("click", () => {
          const slideWidth = slide.clientWidth;
          imageSliderContainer.scrollLeft += slideWidth;
        });
        prevButton.addEventListener("click", () => {
          const slideWidth = slide.clientWidth;
          imageSliderContainer.scrollLeft -= slideWidth;
        });
      }
      function initializeSwipeableImageSlider() {
        let imageSlides = [];
        WishlistPlusVariantSelectorAPI.variantImagesArray.forEach(
          (image, index) => {
            const imageSlide = document.createElement("img");
            imageSlide.src = image.src;
            imageSlide.ariaLabel = `product-image-${index}`;
            imageSlide.className = "swym-custom-slider-image";
            imageSlide.width = "250";
            imageSlide.height = "250";
            imageSlide.addEventListener(
              "click",
              (event) => {
                document.getElementById("swym-custom-primary-image").src = event.target.src;
              },
              false
            );
            imageSlides.push(imageSlide);
            document
              .getElementById("swym-custom-images-slide-container")
              .appendChild(imageSlide);
          }
        );
        addImageSliderEventListeners();
      }
      initializeSwipeableImageSlider();
      const imgTags = WishlistPlusVariantSelectorAPI.variantImagesArray.map(
        (image, index) => {
          const imgTag = document.createElement("img");
          // imgTag.width = "24";
          // imgTag.height = "24";

          imgTag.className = "swym-custom-image-blob";
          imgTag.ariaLabel = `Product Secondary Image-${index}`;
          imgTag.id = `swym-custom-image-blob`;
          imgTag.src = image.src;
          imgTag.addEventListener("click", (event) => {
            const imgBlobSrc = event.target.getAttribute("src");
            document.getElementById("swym-custom-primary-image").src = imgBlobSrc;
          });
          return imgTag;
        }
      );
      const imgBlobContainer = document.getElementById(
        "swym-custom-image-blob-container"
      );
      // imgBlobContainer.innerHTML = "";
      // imgBlobContainer.append(...imgTags);
      const imgBlobContainer2 = document.getElementById(
        "swym-custom-image-blob-container-2"
      );
      imgBlobContainer2.innerHTML = "";
      imgBlobContainer2.append(...imgTags);
    } catch (error) {
      window._swat.utils?.log(
        error,
        "[Variant Selector] - Error in generateImageCarousel function"
      );
    }
  };
  WishlistPlusVariantSelectorAPI.renderProductData = () => {
    try {
      const product = WishlistPlusVariantSelectorAPI?.productData?.product;
      document.getElementById("swym-custom-primary-image").src =
        product.image.src;
      if (product) {
        document.getElementById("swym-custom-product-title").innerHTML =
          product?.title || "";
        document.getElementById(
          "swym-custom-variant-price"
        ).innerHTML = `${product?.variants[0]?.price_currency} ${product?.variants[0]?.price}`;
        WishlistPlusVariantSelectorAPI.getWishlists();
        WishlistPlusVariantSelectorAPI.generateImageCarousel();
      } else {
        console.error("Product data is undefined.");
      }
    } catch (error) {
      window._swat.utils?.log(
        error,
        "[Variant Selector] - Error in renderProductData function"
      );
    }
  };
  WishlistPlusVariantSelectorAPI.initializeProductData = () => {
    try {
      const productData = window?.swymVariantData;
      if (!productData) {
        console.warn("Product data not available. Retrying...");
        return;
      }
      // Assign the product data and variant
      WishlistPlusVariantSelectorAPI.productData = productData;
      if (!window._swat?.retailerSettings.Wishlist.EnableCollections) {
        WishlistPlusVariantSelectorAPI.selectedVariant =
          productData.product.variants[0];
      }
      // Get primary image and update src
      const primaryImage = document.getElementById("swym-custom-primary-image");
      if (!primaryImage) {
        console.warn("Primary image element not found.");
        return;
      }
      primaryImage.src = productData.product.image.src;
      WishlistPlusVariantSelectorAPI.renderProductData();
      primaryImage.addEventListener(
        "click",
        WishlistPlusVariantSelectorAPI.showZoomedView
      );
    } catch (error) {
      window._swat.utils?.log(
        error,
        "[Variant Selector] - Error in initializeProductData function"
      );
    }
  };
  WishlistPlusVariantSelectorAPI.updateButtonState = () => {
    const buttons = [
      document.getElementById("swym-vs-add-to-wishlist"),
      document.getElementById("swym-vs-show-add-to-list"),
    ];
    const hasChanges =
      WishlistPlusVariantSelectorAPI.addToListArr.length > 0 ||
      WishlistPlusVariantSelectorAPI.removeList.length > 0;
    buttons.forEach((btn) => {
      if (btn) {
        if (hasChanges) {
          btn.classList.remove("swym-vs-disabled");
        } else {
          if(WishlistPlusVariantSelectorAPI.globalListArray.length > 0){
            btn.classList.add("swym-vs-disabled");
          }
        }
      }
    });
  };
  WishlistPlusVariantSelectorAPI.toggleSelection = (
    lid,
    primaryListId,
    activeclass
  ) => {
    try {
      const addToListBtn = document.querySelector(
        "#swym-vs-add-to-wishlist #swym-vs-add-to-wishlist-text"
      );
      const addToListBtn2 = document.querySelector(
        "#swym-vs-show-add-to-list #swym-vs-add-to-wishlist-text"
      );
      const isAlreadySelected =
        WishlistPlusVariantSelectorAPI.selectedList.includes(lid);
      const listItem = document.getElementById(primaryListId);
      if (!listItem) {
        console.error(`Element with ID ${elementId} not found.`);
        return;
      }
      const element = document.getElementById(primaryListId);
      // Check if the element exists to avoid errors
      if (element) {
        // Remove the specified class if it exists
        element.classList.toggle(activeclass);
      } else {
        console.error("Element not found");
      }
      const isSelected = listItem.classList.contains(activeclass);
      if (isSelected) {
        // If the item is now selected, check if it was previously selected or not
        if (!WishlistPlusVariantSelectorAPI.addToListArr.includes(lid)) {
          WishlistPlusVariantSelectorAPI.removeList =
            WishlistPlusVariantSelectorAPI.removeList.filter(
              (id) => id !== lid
            );
        }
        if (!isAlreadySelected) {
          // Item is new and was not previously selected, so add it to addToListArr
          if (!WishlistPlusVariantSelectorAPI.addToListArr.includes(lid)) {
            WishlistPlusVariantSelectorAPI.addToListArr.push(lid);
          }
        }
        // Ensure the item is not in removeList (since it's still selected)
      } else {
        // If the item is now deselected, check if it was previously selected
        if (!WishlistPlusVariantSelectorAPI.removeList.includes(lid)) {
          WishlistPlusVariantSelectorAPI.addToListArr =
            WishlistPlusVariantSelectorAPI.addToListArr.filter(
              (id) => id !== lid
            );
        }
        if (isAlreadySelected) {
          // If it was previously selected, add to removeList (to remove from wishlist)
          if (!WishlistPlusVariantSelectorAPI.removeList.includes(lid)) {
            WishlistPlusVariantSelectorAPI.removeList.push(lid);
          }
        }
        // Remove it from addToListArr if it was marked for addition earlier
      }
      function updateWishlistButtonText() {
        // Determine the button text
        let buttonText =
          window._swat.retailerSettings.Strings?.AddWishlistPopupCTASaveAdd; // Default text
        if (WishlistPlusVariantSelectorAPI.removeList.length > 0) {
          buttonText =
            window._swat.retailerSettings.Strings
              ?.AddWishlistPopupCTASaveUpdate;
        } else if (WishlistPlusVariantSelectorAPI.addToListArr.length > 0) {
          buttonText =
            window._swat.retailerSettings.Strings?.AddWishlistPopupCTASaveAdd;
        }
        // Update the button text for both buttons
        if (addToListBtn) {
          addToListBtn.innerHTML = buttonText;
        }
        if (addToListBtn2) {
          addToListBtn2.innerHTML = buttonText;
        }
      }
      updateWishlistButtonText();
      WishlistPlusVariantSelectorAPI.updateButtonState();
    } catch (error) {
      window._swat.utils?.log(
        error,
        "[Variant Selector] - Error in toggleSelection function"
      );
    }
  };
  WishlistPlusVariantSelectorAPI.defaultWishlistContainer = (
    listcontents,
    productImageUrl,
    lid,
    listName,
    currentView = ""
  ) => {
    try {
      const actionsContainer = document.querySelector(
        "#swym-vs-actions-container"
      );
      const variantExistsInList = listcontents.some(
        (product) =>
          product.epi == WishlistPlusVariantSelectorAPI.currentVariantId
      );
      const isSingleWishlist = WishlistPlusVariantSelectorAPI.isSingleWishlist;
      if (actionsContainer) {
        actionsContainer.innerHTML = lid
          ? `
            <span id="swym-custom-wishlist-actions-title">${
              _swat.retailerSettings.Strings.WishlistMainTitle || "Wishlist"
            }</span>
            <div id="swym-vs-wishlist-container" class="swym-vs-anim-slide-in">
              <div class="swym-variant-selector-wishlist-item ${
                variantExistsInList ? "swym-vs-default-list-selected" : ""
              }" id="swym-variant-selector-list-${lid}" data-list-id="${lid}">
                <div class="swym-variant-selector-wishlist-info-default">
                  ${
                    !currentView && productImageUrl !== "#"
                      ? `<img src="${productImageUrl}" alt="${
                          listcontents?.[0]?.dt || "Product image"
                        }" class="product-image" />`
                      : `<span class="swym-variant-selector-no-image-placeholder">${_swat.retailerSettings.Strings.EmptyListCardText}</span>`
                  }
                </div>
                <div class="swym-variant-selector-list-name">
                  <span>${listName}</span>
                  <span class="swym-variant-selector-status">
                      <svg xmlns="http://www.w3.org/2000/svg" width="6" height="6" viewBox="0 0 6 6" fill="none">
                        <path d="M2 5.2L0 3.2L0.7 2.5L2 3.8L5.3 0.5L6 1.2L2 5.2Z" fill="white"/>
                      </svg>
                  </span>
                </div>
              </div>
              <div class="swym-vs-wishlist-actions-container ${
                isSingleWishlist ? "swym-vs-hidden" : ""
              }">
                <div id="swym-custom-wishlist-actions">
                  <span class="swym-custom-create-wishlist-button"><span>+</span></span>
                  <span class="swym-custom-create-wishlist-text">${
                    window.SwymCollectionsConfig
                      .CollectionsVariantSelectorChooseActionText ||
                    "Choose or Create new wishlist"
                  }</span>
                </div>
              </div>
            </div>`
          : "";
        if (variantExistsInList) {
          WishlistPlusVariantSelectorAPI.selectedList.push(lid);
        }
      }
      const defaultList = document.getElementById(
        `swym-variant-selector-list-${lid}`
      );
      defaultList?.addEventListener("click", () => {
        WishlistPlusVariantSelectorAPI.toggleSelection(
          lid,
          `swym-variant-selector-list-${lid}`,
          "swym-vs-default-list-selected"
        );
      });
      const wishlistActions = document.querySelector(
        "#swym-custom-wishlist-actions"
      );
      wishlistActions?.addEventListener(
        "click",
        WishlistPlusVariantSelectorAPI.swymShowWishlist
      );
    } catch (error) {
      window._swat.utils?.log(
        error,
        "[Variant Selector] - Error in defaultWishlistContainer function"
      );
    }
  };
  WishlistPlusVariantSelectorAPI.getWishlists = () => {
    try {
      const isSingleWishlist = WishlistPlusVariantSelectorAPI.isSingleWishlist;
      if (!isSingleWishlist) {
        const onSuccess = (lists) => {
          for (const variant of WishlistPlusVariantSelectorAPI.productData
            .product.variants) {
            for (const list of lists) {
              const matchingProduct = list.listcontents.find(
                (product) => product.epi === variant.id
              );
              if (matchingProduct) {
                WishlistPlusVariantSelectorAPI.selectedVariantObject = variant;
                WishlistPlusVariantSelectorAPI.selectedVariant = variant;
                break; // Exit the inner loop once a match is found
              }
            }
            if (WishlistPlusVariantSelectorAPI.selectedVariantObject) {
              break; // Exit the outer loop if a match is found
            }
          }
          WishlistPlusVariantSelectorAPI.selectedVariant =
            WishlistPlusVariantSelectorAPI.selectedVariantObject;
          if (!WishlistPlusVariantSelectorAPI.selectedVariant) {
            WishlistPlusVariantSelectorAPI.selectedVariant =
              WishlistPlusVariantSelectorAPI.productData.product.variants[0];
          }
          WishlistPlusVariantSelectorAPI.renderVariantSelectors();
          WishlistPlusVariantSelectorAPI.globalListArray = lists;
          if (lists.length === 0) {
            document
              .getElementById("swym-vs-add-to-wishlist")
              ?.classList.remove("swym-vs-disabled");
          }
          if (lists.length > 0) {
            const listcontents = lists[0].listcontents;
            const productImageUrl = listcontents[0]?.iu || "#";
            const lid = lists[0]?.lid;
            const listName = lists[0].lname;
            WishlistPlusVariantSelectorAPI.defaultWishlistContainer(
              listcontents,
              productImageUrl,
              lid,
              listName
            );
            const wishlistActions = document.querySelector(
              "#swym-custom-wishlist-actions"
            );
            wishlistActions?.addEventListener(
              "click",
              WishlistPlusVariantSelectorAPI.swymShowWishlist
            );
          }
        };
        const onError = (error) =>
          WishlistPlusVariantSelectorAPI.showErrorNotification(
            error.description
          );
        window._swat.fetchLists({ callbackFn: onSuccess, errorFn: onError });
      } else if (isSingleWishlist) {
        const onSuccess = (lists) => {
          if (
            lists.length > 0 &&
            lists.some((item) => item.lname === "My Wishlist")
          ) {
            WishlistPlusVariantSelectorAPI.globalListArray = lists;
            WishlistPlusVariantSelectorAPI.renderVariantSelectors();
            WishlistPlusVariantSelectorAPI.toggleVariantData();
          } else {
            WishlistPlusVariantSelectorAPI.createList("My Wishlist");
          }
        };
        const onError = (error) => {
          WishlistPlusVariantSelectorAPI.showErrorNotification(
            error.description
          );
        };
        window._swat.fetchLists({ callbackFn: onSuccess, errorFn: onError });
      }
    } catch (error) {
      window._swat.utils?.log(
        error,
        "[Variant Selector] - Error in getWishlists function"
      );
    }
  };
  WishlistPlusVariantSelectorAPI.createList = (listName) => {
    const listConfig = { lname: listName };
    window._swat.createList(
      listConfig,
      async (newList) => {
        if (!WishlistPlusVariantSelectorAPI.isSingleWishlist) {
          WishlistPlusVariantSelectorAPI.performAddToList(newList?.lid, "");
          document
            .getElementById("swym-custom-backdrop")
            ?.classList.add("swym-hide-container");
        } else {
          WishlistPlusVariantSelectorAPI.globalListArray.push(newList);
          WishlistPlusVariantSelectorAPI.renderVariantSelectors();
          WishlistPlusVariantSelectorAPI.toggleVariantData();
        }
      },
      (error) =>
        WishlistPlusVariantSelectorAPI.showErrorNotification(error.description)
    );
  };
  WishlistPlusVariantSelectorAPI.showCreateListContainer = (view = "") => {
    const listView = document.querySelector(
      ".swym-variant-selector-lists-view"
    );
    if (listView) {
      listView.classList.add("swym-vs-hidden");
    }
    try {
      document
        .querySelector(".swym-custom-notconfirm-list-button")
        ?.addEventListener(
          "click",
          WishlistPlusVariantSelectorAPI.hideCreateListContainer
        );
      const createListParentContainer = document.getElementById(
        "swym-custom-backdrop"
      );
      document
        .getElementById("swym-custom-backdrop")
        ?.addEventListener("click", (e) => {
          if (e.target === createListParentContainer) {
            WishlistPlusVariantSelectorAPI.hideCreateListContainer();
          }
        });
      const listNameInput = document.getElementById(
        "swym-custom-new-list-name-input"
      );
      function resetListNameInput() {
        listNameInput.value = "";
        listNameInput.focus();
        listNameInput.select();
      }
      function isListNameAlreadyExists(name) {
        return WishlistPlusVariantSelectorAPI.globalListArray.some(
          (list) => list.lname === name
        );
      }

      const confirmListNameButton = document.getElementById(
        "swym-custom-confirm-list-button"
      );
      function handleCreateListEvent() {
        const listName = listNameInput.value.trim();
        if (listName.length < 3 || listName.length > 50) {
          const errorMessage = `listName must be 3-50 characters and unique`;
          WishlistPlusVariantSelectorAPI.showErrorNotification(errorMessage);
          resetListNameInput();
        } else if (isListNameAlreadyExists(listName)) {
          const errorMessage = `${listName} already Exists`;
          WishlistPlusVariantSelectorAPI.showErrorNotification(errorMessage);
          console.error("Name Already Exists");
          resetListNameInput();
        } else {
          WishlistPlusVariantSelectorAPI.createList(listName);
          resetListNameInput();
        }
      }
      if (!confirmListNameButton.isListnerApplied) {
        confirmListNameButton.addEventListener("click", handleCreateListEvent);
        confirmListNameButton.isListnerApplied = true;
      }
      document
        .getElementById("swym-custom-backdrop")
        ?.classList.remove("swym-hide-container");
    } catch (error) {
      window._swat.utils?.log(
        error,
        "[Variant Selector] - Error in showCreateListContainer function"
      );
    }
  };
  WishlistPlusVariantSelectorAPI.hideCreateListContainer = (action = "") => {
    try {
      document
        .getElementById("swym-custom-backdrop")
        ?.classList.add("swym-hide-container");
      const listNameInput = document.getElementById(
        "swym-custom-new-list-name-input"
      );
      listNameInput.value = "";
      listNameInput.focus();
      listNameInput.select();
      if (action !== "back") {
        WishlistPlusVariantSelectorAPI.closePopup();
      }
    } catch (error) {
      window._swat.utils?.log(
        error,
        "[Variant Selector] - Error in hideCreateListContainer function"
      );
    }
  };
  WishlistPlusVariantSelectorAPI.toggleVisibility = (
    isSpinnerVisible,
    addToListBtnId,
    addToListBtnTextId,
    addToListBtnSpinnerId,
    lid = ""
  ) => {
    try {
      const addToListBtnText = document.getElementById(addToListBtnTextId);
      const addToListBtnSpinner = document.getElementById(
        addToListBtnSpinnerId
      );

      if (addToListBtnText) {
        addToListBtnText.classList.toggle("swym-vs-hidden", isSpinnerVisible);
      }
      if (addToListBtnSpinner) {
        addToListBtnSpinner.classList.toggle(
          "swym-vs-hidden",
          !isSpinnerVisible
        );
      }
    } catch (error) {
      window._swat.utils?.log(
        error,
        "[Variant Selector] - Error in toggleVisibility function"
      );
    }
  };
  WishlistPlusVariantSelectorAPI.performAddToList = async (lid, commonAction = "") => {
    try {
      const addToListBtn = document.getElementById("swym-vs-add-to-wishlist");
      const addToListBtn2 = document.getElementById("swym-vs-show-add-to-list");
      if (addToListBtn) {
        WishlistPlusVariantSelectorAPI.toggleVisibility(
          true,
          "swym-vs-add-to-wishlist",
          "swym-vs-add-to-wishlist-text",
          "swym-vs-spinner"
        );
      }
      if (addToListBtn2) {
        WishlistPlusVariantSelectorAPI.toggleVisibility(
          true,
          "swym-vs-show-add-to-list",
          "swym-vs-add-to-wishlist-text",
          "swym-vs-spinner"
        );
      }
      var product = {
        epi: WishlistPlusVariantSelectorAPI.selectedVariant?.id,
        empi: WishlistPlusVariantSelectorAPI.selectedVariant?.product_id,
        du: WishlistPlusVariantSelectorAPI.productURL,
      };
      let lists = [
        ...new Set(WishlistPlusVariantSelectorAPI.addToListArr || []),
      ];
      if (lid) {
        lists.push(lid);
      }
      let onSuccess = function (response) {
        const title = WishlistPlusVariantSelectorAPI.productData?.product?.title;
        const variantTitle = WishlistPlusVariantSelectorAPI.selectedVariant?.title;
        if(commonAction !== "common") {
          let updateMessage = `<span class="swym-vs-notification" onclick="WishlistPlusVariantSelectorAPI.redirectToPopup(event);">${title ? title : "Product"} - ${variantTitle} has been added to ${
            lists?.length
          } list successfully</span>`;
          WishlistPlusVariantSelectorAPI.showSuccessNotification(updateMessage);
        }
        WishlistPlusVariantSelectorAPI.onSuccess();

        if (addToListBtn) {
          WishlistPlusVariantSelectorAPI.toggleVisibility(
            false,
            "swym-vs-add-to-wishlist",
            "swym-vs-add-to-wishlist-text",
            "swym-vs-spinner"
          );
        }
        if (addToListBtn2) {
          WishlistPlusVariantSelectorAPI.toggleVisibility(
            false,
            "swym-vs-show-add-to-list",
            "swym-vs-add-to-wishlist-text",
            "swym-vs-spinner"
          );
        }

        WishlistPlusVariantSelectorAPI.closePopup();
      };
      let onError = function (error) {
        console.log("Error while adding a product to many lists", error);
        WishlistPlusVariantSelectorAPI.closePopup();
        if (addToListBtn) {
          WishlistPlusVariantSelectorAPI.toggleVisibility(
            false,
            "swym-vs-add-to-wishlist",
            "swym-vs-add-to-wishlist-text",
            "swym-vs-spinner"
          );
        }
        if (addToListBtn2) {
          WishlistPlusVariantSelectorAPI.toggleVisibility(
            false,
            "swym-vs-show-add-to-list",
            "swym-vs-add-to-wishlist-text",
            "swym-vs-spinner"
          );
        }
      };
      swat.addProductToLists(product, lists, onSuccess, onError);
    } catch (error) {
      window._swat.utils?.log(
        error,
        "[Variant Selector] - Error in performAddTolist function"
      );
    }
  };
  WishlistPlusVariantSelectorAPI.performRemoveFromList = async (commonAction = "") => {
    try {
      const addToListBtn = document.getElementById("swym-vs-add-to-wishlist");
      const addToListBtn2 = document.getElementById("swym-vs-show-add-to-list");
      if (addToListBtn) {
        WishlistPlusVariantSelectorAPI.toggleVisibility(
          true,
          "swym-vs-add-to-wishlist",
          "swym-vs-add-to-wishlist-text",
          "swym-vs-spinner"
        );
      }
      if (addToListBtn2) {
        WishlistPlusVariantSelectorAPI.toggleVisibility(
          true,
          "swym-vs-show-add-to-list",
          "swym-vs-add-to-wishlist-text",
          "swym-vs-spinner"
        );
      }
      var product = {
        epi: WishlistPlusVariantSelectorAPI.selectedVariant?.id,
        empi: WishlistPlusVariantSelectorAPI.selectedVariant?.product_id,
        du: WishlistPlusVariantSelectorAPI.productURL,
      };
      let lists = [
        ...new Set(WishlistPlusVariantSelectorAPI.removeList || []),
      ];
      let previousLists = [
        ...new Set(WishlistPlusVariantSelectorAPI.selectedList || []),
      ];
      let onSuccess = function (response) {
        let isRemovedFromAllList = false;
        if (previousLists.length === lists.length) {
          isRemovedFromAllList = true;
        }
        WishlistPlusVariantSelectorAPI.onSuccess({
          action: "remove",
          isRemovedFromAllList: isRemovedFromAllList,
        });
        if(commonAction !== "common") {
          let updateMessage = `<span class="swym-vs-notification" onclick="WishlistPlusVariantSelectorAPI.redirectToPopup(event);">${
            WishlistPlusVariantSelectorAPI.productData?.product?.title ||
            "Product"
          } - ${WishlistPlusVariantSelectorAPI.selectedVariant.title} has been removed from ${lists?.length} list successfully</span>`;
          WishlistPlusVariantSelectorAPI.showSuccessNotification(updateMessage);
        }
        WishlistPlusVariantSelectorAPI.closePopup();
        if (addToListBtn) {
          WishlistPlusVariantSelectorAPI.toggleVisibility(
            false,
            "swym-vs-add-to-wishlist",
            "swym-vs-add-to-wishlist-text",
            "swym-vs-spinner"
          );
        }
        if (addToListBtn2) {
          WishlistPlusVariantSelectorAPI.toggleVisibility(
            false,
            "swym-vs-show-add-to-list",
            "swym-vs-add-to-wishlist-text",
            "swym-vs-spinner"
          );
        }
      };
      let onError = function (error) {
        console.log("Error while adding a Product to many Lists", error);
        WishlistPlusVariantSelectorAPI.closePopup();
        if (addToListBtn) {
          WishlistPlusVariantSelectorAPI.toggleVisibility(
            false,
            "swym-vs-add-to-wishlist",
            "swym-vs-add-to-wishlist-text",
            "swym-vs-spinner"
          );
        }
        if (addToListBtn2) {
          WishlistPlusVariantSelectorAPI.toggleVisibility(
            false,
            "swym-vs-show-add-to-list",
            "swym-vs-add-to-wishlist-text",
            "swym-vs-spinner"
          );
        }
      };
      window._swat.removeProductFromLists(product, lists, onSuccess, onError);
    } catch (error) {
      window._swat.utils?.log(
        error,
        "[Variant Selector] - Error in performRemoveFromList function"
      );
    }
  };
  WishlistPlusVariantSelectorAPI.redirectToPopup = () => {
    const launcherOpenHosted = window._swat.retailerSettings.UI.LauncherOpenHosted;
    if(launcherOpenHosted === "popup" ) {
      window._swat.ui.open();
    } else {
      window.location.href = window._swat.retailerSettings?.General?.HostedPages?.Wishlist;
    }
  }
  WishlistPlusVariantSelectorAPI.swymShowWishlist = () => {
    try {
      WishlistPlusVariantSelectorAPI.addToListArr = [];
      if (WishlistPlusVariantSelectorAPI.globalListArray.length === 0) {
        WishlistPlusVariantSelectorAPI.showCreateListContainer();
        return;
      }
      const popupContainer = document.querySelector(
        ".swym-collections-variant-popup-parent"
      );
      if (popupContainer) {
        popupContainer.classList.add("swym-variant-selector-lists-view");
        let htmlContent = `<div class="swym-vs-list-view-header">
      <p>
        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="#000000" height="800px" width="800px" version="1.1" id="Capa_1" viewBox="0 0 219.151 219.151" xml:space="preserve"
        id="swym-vs-back-svg">
        <g>
          <path d="M109.576,219.151c60.419,0,109.573-49.156,109.573-109.576C219.149,49.156,169.995,0,109.576,0S0.002,49.156,0.002,109.575   C0.002,169.995,49.157,219.151,109.576,219.151z M109.576,15c52.148,0,94.573,42.426,94.574,94.575   c0,52.149-42.425,94.575-94.574,94.576c-52.148-0.001-94.573-42.427-94.573-94.577C15.003,57.427,57.428,15,109.576,15z"></path>
          <path d="M94.861,156.507c2.929,2.928,7.678,2.927,10.606,0c2.93-2.93,2.93-7.678-0.001-10.608l-28.82-28.819l83.457-0.008   c4.142-0.001,7.499-3.358,7.499-7.502c-0.001-4.142-3.358-7.498-7.5-7.498l-83.46,0.008l28.827-28.825   c2.929-2.929,2.929-7.679,0-10.607c-1.465-1.464-3.384-2.197-5.304-2.197c-1.919,0-3.838,0.733-5.303,2.196l-41.629,41.628   c-1.407,1.406-2.197,3.313-2.197,5.303c0.001,1.99,0.791,3.896,2.198,5.305L94.861,156.507z"></path>
        </g>
        </svg>
      CHOOSE WISHLIST <span>${WishlistPlusVariantSelectorAPI.globalListArray.length} wishlists</span></p>
          <span class="swym-vs-popup-close-icon" onclick="WishlistPlusVariantSelectorAPI.closePopup(event)"><svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 9 9" fill="none">
              <path d="M1.95594 8.854L0.83313 7.7312L3.72035 4.84398L0.83313 1.97681L1.95594 0.854004L4.84315 3.74122L7.71032 0.854004L8.83313 1.97681L5.94591 4.84398L8.83313 7.7312L7.71032 8.854L4.84315 5.96679L1.95594 8.854Z" fill="white"></path>
            </svg></span></div><ul class="swym-variant-selector-lists-container">`;
        WishlistPlusVariantSelectorAPI.globalListArray.forEach(
          (list, index) => {
            const { lname: listName, listcontents } = list;
            const variantExistsInList = list.listcontents.some(
              (product) =>
                product.epi == WishlistPlusVariantSelectorAPI.currentVariantId
            );
            if (variantExistsInList) {
              if (
                !WishlistPlusVariantSelectorAPI.selectedList.includes(list?.lid)
              ) {
                WishlistPlusVariantSelectorAPI.selectedList.push(list?.lid);
              }
            }
            const firstProduct = listcontents[0];
            const productImageUrl = firstProduct?.iu || "#";

            let imgGridContainer;
            const generateImageMarkup = (listItem) => {
              return `<img src="${listItem?.iu}" alt="${
                listItem?.dt || "Product image"
              }" class="product-image" />`;
            };

            if (listcontents.length === 0) {
              imgGridContainer = `<span class="swym-variant-selector-no-image-placeholder">This is an empty list!</span>`;
            } else if (listcontents.length === 1) {
              imgGridContainer = `<div class="swym-vs-img-container-1">${generateImageMarkup(
                listcontents[0]
              )}</div>`;
            } else if (listcontents.length === 2) {
              imgGridContainer = `<div class="swym-vs-img-container-2">
                          ${generateImageMarkup(listcontents[0])}
                          ${generateImageMarkup(listcontents[1])}
                        </div>`;
            } else if (listcontents.length === 3) {
              imgGridContainer = `<div class="swym-vs-img-container-3"><div>
            ${generateImageMarkup(listcontents[0])}
            ${generateImageMarkup(listcontents[1])}
          </div>
            ${generateImageMarkup(listcontents[2])}
          </div>`;
            } else if (listcontents.length === 4) {
              imgGridContainer = `<div class="swym-vs-img-container-4">
          ${generateImageMarkup(listcontents[0])}
          ${generateImageMarkup(listcontents[1])}
          ${generateImageMarkup(listcontents[2])}
          ${generateImageMarkup(listcontents[3])}
          </div>`;
            } else {
              imgGridContainer = `<div class="swym-vs-img-container-5">
          ${generateImageMarkup(listcontents[0])}
          ${generateImageMarkup(listcontents[1])}
          ${generateImageMarkup(listcontents[2])}
          <span class="swym-vs-product-count">+${
            listcontents.length - 3
          } products</span>
        </div>`;
            }

            htmlContent += `
          <li class="swym-variant-selector-wishlist-item ${
            variantExistsInList ? "swym-vs-show-list-selected" : ""
          }" id="swym-variant-selector-list-${
              list?.lid
            }" onclick='WishlistPlusVariantSelectorAPI.toggleSelection("${
              list?.lid
            }", "swym-variant-selector-list-${
              list?.lid
            }","swym-vs-show-list-selected")'>
            <div class="swym-variant-selector-wishlist-info">
            ${imgGridContainer}
    
            </div>
            <div class="swym-variant-selector-list-name">
              <span>${listName}</span>
              <span class="swym-variant-selector-status">
              <svg xmlns="http://www.w3.org/2000/svg" width="6" height="6" viewBox="0 0 6 6" fill="none">
                <path d="M2 5.2L0 3.2L0.7 2.5L2 3.8L5.3 0.5L6 1.2L2 5.2Z" fill="white"/>
              </svg>
              </span>
            </div>
          </li>
        `;
          }
        );
        htmlContent += `</ul>
        <div class="swym-variant-selector-lists-btn-container">
          <button class="swym-vs-create-list-btn" aria-label=${
            window._swat.retailerSettings.Strings.AddWishlistPopupCTAAddNew
          }>${
          window._swat.retailerSettings.Strings.AddWishlistPopupCTAAddNew ||
          "Create New List"
        }</button>
          <button id="swym-vs-show-add-to-list" aria-label="Add item to Wishlist" class="swym-vs-show-add-to-list ${
            !WishlistPlusVariantSelectorAPI.isSingleWishlist
              ? "swym-vs-disabled"
              : ""
          }">
          <span id="swym-vs-add-to-wishlist-text">${
            window._swat.retailerSettings.Strings?.AddWishlistPopupCTASaveAdd ||
            "Add to Wishlist"
          }</span>
            <div id="swym-vs-spinner" class="swym-vs-spinner swym-vs-hidden">
              <div class="swym-vs-bounce1"></div>
              <div class="swym-vs-bounce2"></div>
              <div class="swym-vs-bounce3"></div>
            </div>
          </button>
        </div>`;
        popupContainer.innerHTML = htmlContent;
        document
          .querySelector(".swym-vs-create-list-btn")
          .addEventListener(
            "click",
            WishlistPlusVariantSelectorAPI.showCreateListContainer
          );
          
          

        document
          .querySelector("#swym-vs-show-add-to-list")
          ?.addEventListener("click", () => {
            const addToListArrLength = WishlistPlusVariantSelectorAPI.addToListArr.length;
            const removeListArrLength= WishlistPlusVariantSelectorAPI.removeList.length;
            const totalListLength = addToListArrLength + removeListArrLength;
            if(addToListArrLength > 0 && removeListArrLength > 0) {
              let commonAction = "common";
              Promise.all([
                WishlistPlusVariantSelectorAPI.performAddToList("", commonAction),
                WishlistPlusVariantSelectorAPI.performRemoveFromList(commonAction),
              ])
                .then(() => {
                  const title =
                  WishlistPlusVariantSelectorAPI.productData?.product?.title;
                  let updateMessage = `<span onclick="WishlistPlusVariantSelectorAPI.redirectToPopup(event);">${title ? title : "Product"} - ${WishlistPlusVariantSelectorAPI.selectedVariant.title} has been updated to ${
                    totalListLength
                  } list successfully</span>`;
                  WishlistPlusVariantSelectorAPI.showSuccessNotification(updateMessage);
                })
                .catch((error) => {
                  console.error("Error with adding/removing from lists", error);
                });
                return;
            }
            if (addToListArrLength > 0 && removeListArrLength === 0) {
              WishlistPlusVariantSelectorAPI.performAddToList();
            }
            if (removeListArrLength > 0 && addToListArrLength === 0) {
              WishlistPlusVariantSelectorAPI.performRemoveFromList();
            }
          });
        const backSvg = document.querySelector(
          ".swym-vs-list-view-header > p > svg"
        );
        if (backSvg) {
          backSvg.addEventListener("click", () => {
            const listView = document.querySelector(
              ".swym-variant-selector-lists-view"
            );
            if (listView) {
              listView.classList.remove("swym-variant-selector-lists-view");
            }
            WishlistPlusVariantSelectorAPI.injectPopupContent();
          });
        }
      }
    } catch (error) {
      window._swym?.utils?.log(
        "[Variant Selector] - Error in Show Wishlist Function"
      );
    }
  };
  WishlistPlusVariantSelectorAPI.closePopup = (event) => {
    try {
      document.body.classList.remove("swym-modal-active");
      if (event) event.preventDefault();
      WishlistPlusVariantSelectorAPI.productData = [];
      WishlistPlusVariantSelectorAPI.variantImagesArray = [];
      WishlistPlusVariantSelectorAPI.selectedVariant = [];
      WishlistPlusVariantSelectorAPI.selectCallBackObj = [];
      WishlistPlusVariantSelectorAPI.currentVariantId = "";
      WishlistPlusVariantSelectorAPI.arrayOfSwymCollectionsButtons = [];
      WishlistPlusVariantSelectorAPI.globalActionArray = [];
      WishlistPlusVariantSelectorAPI.globalListArray = [];
      WishlistPlusVariantSelectorAPI.globalProductsInListArray = [];
      WishlistPlusVariantSelectorAPI.productURL = "";
      WishlistPlusVariantSelectorAPI.isSingleWishlist = "";
      WishlistPlusVariantSelectorAPI.selectedList = [];
      WishlistPlusVariantSelectorAPI.selectedVariantOption = "";
      WishlistPlusVariantSelectorAPI.selectedVariantObject = "";
      WishlistPlusVariantSelectorAPI.removeList = [];
      WishlistPlusVariantSelectorAPI.addToListArr = [];
      WishlistPlusVariantSelectorAPI.commonAction = false;

      document.querySelector(
        ".swym-collections-variant-popup-parent"
      ).innerHTML = "";
      document
        .querySelector(".swym-variant-selector-modal-background")
        .classList.add("swym-hide-container");
      const popupContainer = document.querySelector(
        ".swym-collections-variant-popup-parent"
      );
      popupContainer?.classList.remove("swym-variant-selector-lists-view");
      popupContainer?.classList.remove("swym-vs-hidden");
      sessionStorage.removeItem("swymVariantSelectorPopup");
      sessionStorage.removeItem("popupTriggered");
    } catch (error) {
      window._swat?.log("[Variant Selector] - Error in Close popup");
    }
  };
  WishlistPlusVariantSelectorAPI.injectPopupContent = async () => {
    const modalBackground = document.querySelector(
      ".swym-variant-selector-modal-background"
    );
    const popupContainer = document.querySelector(
      ".swym-collections-variant-popup-parent"
    );
    if (!popupContainer) {
      console.error("Popup container not found.");
      return;
    }
    // Show the modal background
    modalBackground?.classList.remove("swym-hide-container");
    // Create popup HTML content
    const popupHTML = `
<div class="swym-collections-variant-popup-content-container" role="dialog" aria-labelledby="swym-collections-popup-title">
      <div class="swym-vs-popup-content-scroll">
        <div class="swym-collections-variant-popup-header">
          <h1 class="swym-collections-variant-popup-header-title">${
            window._swat.retailerSettings.Strings?.AddWishlistPopupCTASaveAdd ||
            "Add to Wishlist"
          }</h1>
         <span id="swym-vs-close-popup" role="button" tabindex="0" aria-label="Close popup">
            <svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 9 9" fill="none">
              <path d="M1.95594 8.854L0.83313 7.7312L3.72035 4.84398L0.83313 1.97681L1.95594 0.854004L4.84315 3.74122L7.71032 0.854004L8.83313 1.97681L5.94591 4.84398L8.83313 7.7312L7.71032 8.854L4.84315 5.96679L1.95594 8.854Z" fill="white"/>
            </svg>
          </span>
        </div>
        <div class="swym-collections-variant-popup-content">
          <div id="swym-images-container">
            <img src="" width="130" height="130" loading="lazy" id="swym-custom-primary-image" alt="Primary product image" aria-label="Product Main Image">
            <div id="swym-custom-image-blob-container"></div>
          </div>
          <div id="swym-images-container-2">
             <div id="swym-custom-image-blob-container-2"></div>
          </div>
          <div id="swym-custom-image-wrapper">
            <button class="swym-custom-slide-arrow" id="swym-custom-slide-arrow-prev" aria-label="Previous slide">&#8249;</button>
            <button class="swym-custom-slide-arrow" id="swym-custom-slide-arrow-next" aria-label="Next slide">&#8250;</button>
            <div id="swym-custom-images-caraousel">
              <div id="swym-custom-images-slide-container" aria-label="Image Carousel"></div>
            </div>
          </div>
          <div class="swym-collection-title-detail">
            <h2 id="swym-custom-product-title"></h2>
            <span id="swym-custom-variant-price"></span>
          </div>
          <div id="swym-custom-variant-selector-parent" class="${
            WishlistPlusVariantSelectorAPI.isSingleWishlist
              ? "swym-vs-anim-slide-in"
              : ""
          }">
            <div id="swym-custom-variant-selector-container"></div>
          </div>
          <div id="swym-vs-actions-container">
          </div>

           ${
             !WishlistPlusVariantSelectorAPI.isSingleWishlist
               ? `<button id="swym-vs-add-to-wishlist" aria-label="Add To Wishlist" class="swym-add-to-wishlist-1 swym-vs-disabled">
            <span id="swym-vs-add-to-wishlist-text">${
              window._swat.retailerSettings.Strings
                ?.AddWishlistPopupCTASaveAdd || "Add to Wishlist"
            }</span>
            <div id="swym-vs-spinner" class="swym-vs-spinner swym-vs-hidden" aria-hidden="true">
              <div class="swym-vs-bounce1"></div>
              <div class="swym-vs-bounce2"></div>
              <div class="swym-vs-bounce3"></div>
            </div>
          </button>`
               : `<button id="swym-vs-add-to-wishlist-single" aria-label="Add To Wishlist" class="swym-add-to-wishlist-single swym-vs-hidden">
            <span id="swym-vs-add-to-wishlist-text">${
              window._swat.retailerSettings.Strings
                ?.AddWishlistPopupCTASaveAdd || "Add to Wishlist"
            }</span>
          </button>`
           }
        </div>
        </div>
      </div>
    `;

    // Inject the content into the popup container
    popupContainer.innerHTML = popupHTML;
    const singleWishlistBtn = document.getElementById(
      "swym-vs-add-to-wishlist-single"
    );
    if (singleWishlistBtn) {
      singleWishlistBtn.addEventListener("click", () => {
        const myWishlist = WishlistPlusVariantSelectorAPI.globalListArray.find(
          (item) => item.lname === "My Wishlist"
        );
        const lid = myWishlist ? myWishlist.lid : null;
        // const lid = WishlistPlusVariantSelectorAPI.globalListArray[0].lid;
        var product = {
          epi: WishlistPlusVariantSelectorAPI.selectedVariant?.id,
          empi: WishlistPlusVariantSelectorAPI.selectedVariant?.product_id,
          du: WishlistPlusVariantSelectorAPI.productURL,
        };
        const title =
          WishlistPlusVariantSelectorAPI.productData?.product?.title;
        if (!singleWishlistBtn.classList.contains("variant-in-wishlist")) {
          const onSuccess = function (addedListItem) {
            let updateMessage = `<span onclick="WishlistPlusVariantSelectorAPI.redirectToPopup(event);">${
              title ? title : "Product"
            } - ${WishlistPlusVariantSelectorAPI.selectedVariant.title} ${window._swat.retailerSettings.Strings
              ?.CollectionsVariantSelectorSuccessMessage || "has been added to list successfully"}</span>`;
            WishlistPlusVariantSelectorAPI.showSuccessNotification(
              updateMessage
            );
            WishlistPlusVariantSelectorAPI.onSuccess();
            WishlistPlusVariantSelectorAPI.closePopup();
          };
          const onError = function (error) {
            console.log("Error while adding the Product to the List", error);
            WishlistPlusVariantSelectorAPI.closePopup();
          };
          window._swat.addToList(lid, product, onSuccess, onError);
        } else {
          const onSuccess = function (addedListItem) {
            let updateMessage = `<span onclick="WishlistPlusVariantSelectorAPI.redirectToPopup(event);">${
              title ? title : "Product"
            } - ${WishlistPlusVariantSelectorAPI.selectedVariant.title} ${window._swat.retailerSettings.Strings
              ?.CollectionsVariantSelectorRemoveMessage || "has been removed from list successfully"}</span>`;
            WishlistPlusVariantSelectorAPI.showSuccessNotification(
              updateMessage
            );
            WishlistPlusVariantSelectorAPI.onSuccess({ action: "remove" });
            WishlistPlusVariantSelectorAPI.closePopup();
          };
          const onError = function (error) {
            console.log("Error while adding the Product to the List", error);
            let updateMessage = `Error while adding the Product to the List`;
            WishlistPlusVariantSelectorAPI.showErrorNotification(updateMessage);
            WishlistPlusVariantSelectorAPI.closePopup();
          };
          window._swat.deleteFromList(lid, product, onSuccess, onError);
        }
      });
    }
    // inject create list container
    const popupParentContainer = document.querySelector(
      ".swym-variant-selector-modal-background"
    );
    if (popupParentContainer) {
      const createListContainer = document.createElement("div");
      createListContainer.classList.add("swym-hide-container");
      createListContainer.id = "swym-custom-backdrop";
      createListContainer.innerHTML = `
        <div id="swym-custom-create-list-container">
          <div id="swym-create-list-title-wrapper">
          <span id="swym-vs-back-popup" class="swym-vs-back-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="7" height="10" viewBox="0 0 7 10" fill="none">
            <path d="M5.66675 10L0.666748 5L5.66675 0L6.83341 1.16667L3.00008 5L6.83341 8.83333L5.66675 10Z" fill="white"></path>
            </svg>
          </span>
          <p id="swym-create-list-title">${
            window.SwymCollectionsConfig.CollectionsCreateListTitle ||
            "Name Your Wishlist"
          }</p>
          <span id="swym-vs-close-popup" class="swym-custom-notconfirm-list-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 9 9" fill="none">
              <path d="M1.95594 8.854L0.83313 7.7312L3.72035 4.84398L0.83313 1.97681L1.95594 0.854004L4.84315 3.74122L7.71032 0.854004L8.83313 1.97681L5.94591 4.84398L8.83313 7.7312L7.71032 8.854L4.84315 5.96679L1.95594 8.854Z" fill="white"/>
            </svg>
          </span>
          </div>
          <p id="swym-list-guide-text"></p>
          <div id="swym-create-list-button-wrapper">
            <input id="swym-custom-new-list-name-input" aria-label=${window.SwymCollectionsConfig.CollectionsCreateListPlaceholder || "Enter wish list name"} placeholder=${window.SwymCollectionsConfig.CollectionsCreateListPlaceholder || "Enter wish list name"} class="swym-global-font-family">
            <button id="swym-custom-confirm-list-button" aria-label=${window._swat.retailerSettings.Strings.AddWishlistPopupCTAAddNew || "Save New Wishlist Button"} class="swym-global-font-family">${
              window._swat.retailerSettings.Strings.AddWishlistPopupCTAAddNew
            }</button>
          </div>
        </div>
      `;

      if (!document.getElementById("swym-custom-backdrop")) {
        popupParentContainer.appendChild(createListContainer);
      }
    }
    const listBackView = document.querySelector("#swym-vs-back-popup");
    if (listBackView) {
      listBackView.addEventListener("click", () => {
        const currentView = document.querySelector(
          ".swym-variant-selector-lists-view"
        );
        if (currentView) {
          WishlistPlusVariantSelectorAPI.swymShowWishlist();
          WishlistPlusVariantSelectorAPI.hideCreateListContainer("back");
          const listView = document.querySelector(
            ".swym-variant-selector-lists-view"
          );
          if (listView) {
            listView.classList.remove("swym-vs-hidden");
          }
        } else {
          WishlistPlusVariantSelectorAPI.injectPopupContent();
          WishlistPlusVariantSelectorAPI.hideCreateListContainer("back");
        }
        document.querySelector("#swym-vs-back-popup");
      });
    }
    // Initialize product data after content injection
    WishlistPlusVariantSelectorAPI.initializeProductData();

    const addToWishlistBtn = document.querySelector("#swym-vs-add-to-wishlist");
    addToWishlistBtn?.addEventListener("click", () => {
      if (WishlistPlusVariantSelectorAPI.globalListArray.length === 0) {
        WishlistPlusVariantSelectorAPI.showCreateListContainer("defaultview");
      } else {
        if (WishlistPlusVariantSelectorAPI.addToListArr.length > 0) {
          WishlistPlusVariantSelectorAPI.performAddToList();
        }
        if (WishlistPlusVariantSelectorAPI.removeList.length > 0) {
          WishlistPlusVariantSelectorAPI.performRemoveFromList();
        }
      }
    });
    // Attach event listeners
    const closeButton = document.querySelector("#swym-vs-close-popup");
    closeButton?.addEventListener(
      "click",
      WishlistPlusVariantSelectorAPI.closePopup
    );
    document.body.classList.add("swym-modal-active");
  };
  WishlistPlusVariantSelectorAPI.init = (swat) => {
    try {
      WishlistPlusVariantSelectorAPI.isSingleWishlist =
        !swat?.retailerSettings.Wishlist.EnableCollections;
      WishlistPlusVariantSelectorAPI.injectPopupContent();
    } catch (error) {
      swat?.utils.log(error, "[Variant Selector] - Error in init function");
    }
  };
  if (!window.SwymCallbacks) {
    window.SwymCallbacks = [];
  }
  window.SwymCallbacks.push(async () => {
    swat = window._swat;
    WishlistPlusVariantSelectorAPI.swat = window._swat;
    document.addEventListener("swymShowVariantPopup", (event) => {
      WishlistPlusVariantSelectorAPI.onSuccess = event.detail.successCb;
      WishlistPlusVariantSelectorAPI.onFailure = event.detail.failureCb;
      WishlistPlusVariantSelectorAPI.productURL = event.detail.productURL;
      if (Shopify.designMode) {
        sessionStorage.setItem(
          "swymVariantSelectorPopup",
          event.detail.productURL
        );
      }
      WishlistPlusVariantSelectorAPI.init(swat);
    });
  });
})();
