export const THEMES = ["light", "dark", "system"] as const
export type Theme = (typeof THEMES)[number]

export const THEME_STORAGE_KEY = "theme"
export const THEME_CHANGE_EVENT = "devshelf:theme-change"

// Script executado no <head> antes da primeira pintura: aplica a classe .dark
// conforme a preferência salva e acompanha mudanças do tema do sistema.
// Mantido em ES5 e autocontido, pois roda antes do React.
export const themeScript = `(function(){
  var k=${JSON.stringify(THEME_STORAGE_KEY)};
  var mq=window.matchMedia("(prefers-color-scheme: dark)");
  function apply(){
    var t;try{t=localStorage.getItem(k)}catch(e){}
    var dark=t==="dark"||(t!=="light"&&mq.matches);
    var r=document.documentElement;
    r.classList.toggle("dark",dark);
    r.style.colorScheme=dark?"dark":"light";
  }
  apply();
  mq.addEventListener("change",apply);
  window.addEventListener(${JSON.stringify(THEME_CHANGE_EVENT)},apply);
  window.addEventListener("storage",function(e){if(e.key===k)apply()});
})()`
