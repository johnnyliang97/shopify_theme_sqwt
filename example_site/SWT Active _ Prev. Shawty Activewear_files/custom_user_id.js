(function () {
  const SHOPIFY_COOKIE = '_shopify_y';
  const CUSTOM_COOKIE = 'custom_user_id';
  const DAYS = 365;

  function getCookie(name) {
    return document.cookie
      .split('; ')
      .find(row => row.startsWith(name + '='))
      ?.split('=')[1];
  }

  function setCookie(name, value, days) {
    const expires = new Date(Date.now() + days * 86400000).toUTCString();
    document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
  }

  let shopifyId = getCookie(SHOPIFY_COOKIE);
  let customId = getCookie(CUSTOM_COOKIE);

  let finalId = null;

  if (shopifyId) {
    finalId = shopifyId;

    if (!customId) {
      setCookie(CUSTOM_COOKIE, shopifyId, DAYS);
    }
  } else {
    if (!customId) {
      customId = crypto.randomUUID();
      setCookie(CUSTOM_COOKIE, customId, DAYS);
    }
    finalId = customId;
  }

  window.SHOP_CLIENT_ID = finalId;
})();