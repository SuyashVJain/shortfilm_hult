export const LOADER_SEEN_KEY = "sf-loader-seen";

/**
 * Runs before first paint. Marks <html data-loader="off"> when the loader
 * should be skipped (already seen this session, or a work route), so CSS
 * hides the server-rendered loader with no flash and no hydration mismatch.
 */
export const loaderBootScript = `(function(){try{var d=document.documentElement,s=/^\\/(dashboard|jury|admin)(\\/|$)/.test(location.pathname);try{if(sessionStorage.getItem("${LOADER_SEEN_KEY}"))s=true}catch(e){}if(s)d.setAttribute("data-loader","off")}catch(e){}})();`;
