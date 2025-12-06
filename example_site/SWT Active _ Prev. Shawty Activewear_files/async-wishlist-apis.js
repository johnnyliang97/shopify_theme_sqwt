(function () {
if (typeof window.SwymStorefrontLayoutAPI === 'undefined') {
    window.SwymStorefrontLayoutAPI = {};
}

if (typeof window.SwymStorefrontLayoutContext == 'undefined') {
    window.SwymStorefrontLayoutContext = {};
}

SwymStorefrontLayoutContext.CustomEvents = {
    LayoutInitialized: "SwymStorefrontLayoutInitialized",
    AsyncApisInitialized: "SwymAsyncApisInitialized",
    SavedForLaterFetched: "SwymSavedForLaterFetched",
    WishlistFetched: "SwymWishlistFetched"
}

SwymStorefrontLayoutContext.ShopifyProductData = {};

// Cache validation function
SwymStorefrontLayoutContext.isCacheValid = function(productId) {
  const cachedData = SwymStorefrontLayoutContext.ShopifyProductData[productId];
  if (!cachedData) return false;

  // Check if cached data has required fields and they look valid
  const hasValidPrice = cachedData.price && typeof cachedData.price === 'number' && cachedData.price > 0;
  const hasValidImage = cachedData.image && cachedData.image.trim() !== '';
  const hasValidTitle = cachedData.title && cachedData.title.trim() !== '';

  return hasValidPrice && hasValidImage && hasValidTitle;
};

// Cache invalidation function
SwymStorefrontLayoutContext.clearCache = function() {
  SwymStorefrontLayoutContext.ShopifyProductData = {};
};

// Function to add required listcontext for B2B
SwymStorefrontLayoutContext.addListContextForB2B = function(listConfig){
  if(window.SwymWishlistCurrentCompanyLocation){
    listConfig.contextLocations = [{
        id: window.SwymWishlistCurrentCompanyLocation?.id
    }];
  }
  return listConfig;
}

Object.defineProperty(SwymStorefrontLayoutContext, 'fromCache', {
  get() {
    // Only use cache if it has valid product data
    const hasCache = !!SwymStorefrontLayoutContext.ShopifyProductData &&
                    Object.keys(SwymStorefrontLayoutContext.ShopifyProductData).length > 0;

    if (!hasCache) return false;

    // Check if at least one cached item is valid (as a proxy for cache health)
    const hasValidCache = Object.keys(SwymStorefrontLayoutContext.ShopifyProductData).some(productId =>
      SwymStorefrontLayoutContext.isCacheValid(productId)
    );

    return hasValidCache;
  },
  configurable: true
});

const swymInitWishlistAsyncApi = (swat) =>{
    const SwymWishlistDefaultName = swat.retailerSettings.UI.Title;

    const SwymWLAsyncApis = {
        'fetchLists': async function(){
            return new Promise(async (resolve, reject) => {
                swat.api.fetchLists({
                    callbackFn: lists => resolve(lists),
                    errorFn: err => reject(err)
                });
            });
        },
        'fetchListDetails': async function (lid){
            return new Promise(async (resolve, reject) => {
                swat.api.fetchListDetails(
                    { lid: lid },
                    listContents => resolve(listContents),
                    error => reject(error)
                );
            });
        },
        'fetchListProductsDetails': async function (lid){
            return new Promise(async (resolve, reject) => {
                swat.api.fetchListCtx(
                    { lid: lid },
                    listContents => resolve(listContents),
                    error => reject(error)
                );
            });
        },
        'createList': function (listName = SwymWishlistDefaultName) {
            return new Promise((resolve, reject) => {
                swat.utils.debounce(() => {
                    let listConfig = { "lname": listName };
                    swat.api.createList(
                        listConfig,
                        list => resolve(list),
                        error => reject(error)
                    );
                }, 1000)();
            });
        },
        'renameList': function(lid, lname = SwymWishlistDefaultName) {
            let listUpdateConfig = {
                lname,
                lid
            }
            return new Promise(async (resolve, reject) => {
                swat.api.updateList(listUpdateConfig,
                    list => resolve(list),
                    error => reject(error)
                );
            })
        },
        'deleteLists': async function (lists) {
            try {
                await Promise.all(lists.map(list =>
                    new Promise((resolve, reject) => {
                        swat.api.deleteList(
                            list.lid,
                            obj => resolve(obj),
                            error => reject(error)
                        );
                    })
                ));
                return { success: true };
            } catch (error) {
                swat.utils.error('Error encountered while deleting the list', error);
                throw error;
            }
        },
        'addProductsToList': async function (products, lid){
            return new Promise(async (resolve, reject) => {
                swat.api.addProductsToList(
                    lid,
                    products,
                    products => resolve(products),
                    error => reject(error)
                )
            })
        },
        'addProductToLists': async function (product, lists){
            return new Promise(async (resolve, reject) => {
                swat.api.addProductToLists(
                    product,
                    lists,
                    products => resolve(products),
                    error => reject(error)
                )
            })
        },
        'removeProductFromList': async function (product, lid){
            return new Promise(async (resolve, reject) => {
                swat.api.deleteFromList(
                    lid,
                    product,
                    deletedProduct => resolve(deletedProduct),
                    error => reject(error)
                )
            })
        },
        'removeProductFromLists': async function (product, lists){
            return new Promise(async (resolve, reject) => {
                swat.api.removeProductFromLists(
                    product,
                    lists,
                    deletedProduct => resolve(deletedProduct),
                    error => reject(error)
                )
            })
        },
        'updateProductFromList': async function (product, lid){
            return new Promise(async (resolve, reject) => {
                swat.api.updateListItem(
                    lid,
                    product,
                    updatedListItem => resolve(updatedListItem),
                    error => reject(error)
                )
            })
        },
        'getListsProducts': async function (lists) {
            return Object.values(
                (
                await Promise.all(
                    lists.map(async (list) =>
                        SwymWLAsyncApis.fetchListProductsDetails(list.lid)
                    )
                )
                )
                .flat()
                .reduce((acc, { epi, empi, du }) => {
                    acc[epi] = { epi, empi, du };
                    return acc;
                }, {})
            );
        },
        'generateSharedListURL': async function (lid){
            return new Promise(async (resolve, reject) => {
                swat.api.generateSharedListURL(
                    lid,
                    link => resolve(link),
                    error => reject(error)
                );
            });
        },
        'getProductDetails': async function (productParams) {
            return new Promise(async (resolve, reject) => {
                swat.getProductDetails(
                    productParams,
                    resolve,
                    reject
                );
            });
        },
        'fetchProductDataForList': async function(list = [], fromCache = false){
            const productDataPromises = list.map(async (listItem) => {
                try{
                    // Use cache only if it's valid for this specific product
                    const isCacheValid = fromCache && SwymStorefrontLayoutContext?.isCacheValid(listItem.epi);

                    if (isCacheValid && SwymStorefrontLayoutContext?.ShopifyProductData[listItem.epi]) {
                        const cached = SwymStorefrontLayoutContext?.ShopifyProductData[listItem.epi];
                        const isOldControlCentre = !('multiple-wishlist' in (window?.SwymEnabledCommonFeatures || {}));
                        const isMultipleWishlistEnabled = isOldControlCentre
                          ? !!SwymStorefrontLayoutContext?.Settings?.EnableStorefrontLayoutCollection
                          : !!window?.SwymEnabledCommonFeatures?.['multiple-wishlist'];
                        
                        listItem.productData = isMultipleWishlistEnabled ? cached : JSON.parse(JSON.stringify(cached));
                    } else {
                        let productData = await SwymWLAsyncApis.getProductDetails(listItem);
                        listItem.productData = productData;
                        const isOldControlCentre = !('multiple-wishlist' in (window?.SwymEnabledCommonFeatures || {}));
                        const isMultipleWishlistEnabled = isOldControlCentre
                          ? !!SwymStorefrontLayoutContext?.Settings?.EnableStorefrontLayoutCollection
                          : !!window?.SwymEnabledCommonFeatures?.['multiple-wishlist'];
                        
                        SwymStorefrontLayoutContext.ShopifyProductData[listItem.epi] = isMultipleWishlistEnabled ? listItem.productData : JSON.parse(JSON.stringify(listItem.productData));
                    }
                    return listItem;
                }catch (error) {
                    swat.utils.error(`Error fetching product data for ${listItem.du}`, error);
                    return null;
                }
            });
            const results = await Promise.all(productDataPromises)
            return results.filter((item) => item !== null);
        },
        'fetchProductDataForLists': async function(lists = [], fromCache = false){
            const listDataPromises =  lists.map(async (list) => {
                try{
                    let listcontents = await SwymWLAsyncApis.fetchProductDataForList(list.listcontents, fromCache);
                    list.listcontents = listcontents;
                    return list;
                }catch(error){
                    swat.utils.error(`Error fetching list contents for ${list?.lid}`, error);
                    return null;
                }
            });
            const results = await Promise.all(listDataPromises)
            return results.filter((list) => list !== null);
        },
        'init': async function() {

            SwymWLAsyncApis.updateList();

            swat.utils.log('Swym fetch default list - SUCCESS');

        },
        'updateList':async function() {
            let defaultList = null;
            let collections = [];
            let lists = [];

            try{
                // const isMultiListEnabled = swat.retailerSettings?.Wishlist?.EnableCollections;
                const isOldControlCentre = !('multiple-wishlist' in (window?.SwymEnabledCommonFeatures || {}));
                // Determine the boolean condition based on whether it's the old or new control centre
                const isMultiListEnabled = isOldControlCentre
                ? SwymStorefrontLayoutContext?.Settings?.EnableStorefrontLayoutCollection // For old control centre, use this setting
                : window?.SwymEnabledCommonFeatures?.['multiple-wishlist'];

                lists = (await SwymWLAsyncApis.fetchLists()) || [];
                lists = lists?.sort((a, b) =>  a.cts - b.cts);

                lists = await SwymWLAsyncApis.fetchProductDataForLists(lists, SwymStorefrontLayoutContext?.fromCache)

                defaultList = isMultiListEnabled? lists[0] : lists.find((item) => item.lname?.toLowerCase() === SwymWishlistDefaultName?.toLowerCase()) || lists[0];
                if(isMultiListEnabled){
                    collections = lists.filter((item) => item.lid !== defaultList?.lid );
                    collections?.sort((a, b) =>  b.cts - a.cts);
                }
            }catch(error){
                swat.utils.error(`Error fetching list`, error);
            }

            SwymStorefrontLayoutContext.DefaultList = defaultList;
            SwymStorefrontLayoutContext.collections = collections;
            SwymStorefrontLayoutContext.lists = [
                ...(defaultList != null ? [defaultList] : []),
                ...collections];
            SwymStorefrontLayoutContext.allLists = lists;

            if(SwymStorefrontLayoutContext?.CustomEvents?.WishlistFetched){
                var event = new CustomEvent(SwymStorefrontLayoutContext.CustomEvents.WishlistFetched, {
                    detail: { defaultList, collections, lists }
                });
                document.dispatchEvent(event);
            }else{
                swat.utils.warn(`WishlistFetched event is not defined.`);
            }

            return lists;
        }
    }

    const SwymSFLAsyncApis = {
        'initSFL': async function(){
            return new Promise(async (resolve, reject) => {
                try{
                    swat.api.SaveForLater.init(resolve, reject);
                }catch(e){
                    reject(e);
                }
            });
        },
        'addProductToSFL': async function(product, lid){
            return new Promise(async (resolve, reject) => {
                try{
                    swat.api.SaveForLater.add(lid, [product], resolve, reject);
                }catch(e){
                    reject(e);
                }
            });
        },
        'removeProductFromSFL': async function(product, lid){
            return new Promise(async (resolve, reject) => {
                try{
                    swat.api.SaveForLater.remove(lid, [product], resolve, reject);
                }catch(e){
                    reject(e);
                }
            });
        },
        'fetchSFL': async function(lid){
            return new Promise(async (resolve, reject) => {
                try{
                    swat.api.SaveForLater.fetch(lid, resolve, reject);
                }catch(e){
                    reject(e);
                }
            });
        },
        'updateProductInSFL': async function(product, lid){
            return new Promise(async (resolve, reject) => {
                try{
                    // For SFL, we need to remove and re-add with new quantity
                    await SwymSFLAsyncApis.removeProductFromSFL(product, lid);
                    await SwymSFLAsyncApis.addProductToSFL(product, lid);
                    resolve(product);
                }catch(e){
                    reject(e);
                }
            });
        },
        'updateSflList': async function(){
            let sflData = null;
            let sflItems = [];
            try{
                sflData = await SwymSFLAsyncApis.fetchSFL();
                sflItems = await SwymStorefrontLayoutAPI?.SwymWLAsyncApis.fetchProductDataForList(sflData?.items, true);
            }catch(error){
                swat.utils.error(`Error fetching list`, error);
            }
            SwymStorefrontLayoutContext.sflData = sflData;
            SwymStorefrontLayoutContext.sflList = sflData?.list;
            SwymStorefrontLayoutContext.sflListItems = sflItems;
            SwymStorefrontLayoutContext.sflListId = sflData?.list?.lid;

            if(SwymStorefrontLayoutContext?.CustomEvents?.SavedForLaterFetched){
                var event = new CustomEvent(SwymStorefrontLayoutContext.CustomEvents.SavedForLaterFetched, {
                    detail: { sflData }
                });
                document.dispatchEvent(event);
            }else{
                swat.utils.warn(`SavedForLaterFetched event is not defined.`);
            }
        }
    }

    if(SwymStorefrontLayoutContext?.Settings?.EnableStorefrontLayout){
        if(swat.retailerSettings.SFL?.SFLFeatureEnabled){
            SwymStorefrontLayoutAPI.SwymSFLAsyncApis = SwymSFLAsyncApis;
        }
        SwymStorefrontLayoutAPI.SwymWLAsyncApis = SwymWLAsyncApis;

        // Fallback for Wishlist UI as section/page
        const components = document.querySelectorAll(`#${SwymStorefrontLayoutContext?.StorefrontLayoutViewType?.Wishlist}`);
        if (components.length === 0) {
            SwymWLAsyncApis.init();
        }

        if (SwymStorefrontLayoutContext?.CustomEvents?.AsyncApisInitialized) {
            const event = new CustomEvent(SwymStorefrontLayoutContext.CustomEvents.AsyncApisInitialized, { detail: { SwymStorefrontLayoutAPI } });
            document.dispatchEvent(event);
        }else {
            swat.utils.warn(`AsyncApisInitialized event is not defined.`);
        }
    }
}

if (!window.SwymCallbacks) {
    window.SwymCallbacks = [];
}
window.SwymCallbacks.push(swymInitWishlistAsyncApi);
})();
