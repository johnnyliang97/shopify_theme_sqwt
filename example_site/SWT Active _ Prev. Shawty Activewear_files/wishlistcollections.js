(function () {
  let themeSchemaName = Shopify.theme["schema_name"];

  if (!window.SwymCallbacks) {
    window.SwymCallbacks = [];
  }
  window.SwymCallbacks.push(swat => {
    const isCollectionsEnabledOnTheme = document.querySelector(".swym-add-to-wishlist-view-product");

    const isOldCollectionsEnabled =
      swat.retailerSettings?.Wishlist?.ProductGridButton?.Enabled ||
      swat?.retailerSettings?.UI?.WishlistGridButton?.Enabled ||
      isCollectionsEnabledOnTheme;

    if (!isOldCollectionsEnabled) {
      const socialCountEnabled = swat.collectionsApi.isSocialCountEnabled();
      // Apply social count styles if enabled
      const style = document.createElement("style");
      style.innerHTML = `
        .swym-wishlist-collections-v2,
        .swym-wishlist-collections-v2 svg {
          ${socialCountEnabled ? `display: flex !important; 
          align-items: center !important;
          flex-direction: row-reverse !important;
          gap: 5px !important;` : 
          `width: ${window.SwymCollectionsConfig?.CollectionsButtonSize || 25}px !important;`}
        }
      `;
      document.head.appendChild(style);
      swat?.collectionsApi?.initializeCollections(swat, false, themeSchemaName);
    }
  });
})();
