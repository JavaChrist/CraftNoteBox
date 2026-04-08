/** Exécuté inline dans <head> avant le premier rendu pour éviter le flash de thème. */
export const THEME_STORAGE_KEY = "cnb-theme";

export const themeInitScript = `(function(){try{var k=${JSON.stringify(THEME_STORAGE_KEY)};var t=localStorage.getItem(k);var r=document.documentElement;if(t==="light")r.classList.remove("dark");else r.classList.add("dark");}catch(e){document.documentElement.classList.add("dark");}})();`;
