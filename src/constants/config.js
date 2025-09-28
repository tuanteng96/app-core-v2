export const SERVER_APP =
  window.location.origin === "http://localhost:8080"
    ? window?.SERVER || "https://app.facewashfox.com"
    : window?.SERVER || window.location.origin;
// export const SERVER_APP =
//   window.location.origin === "http://localhost:8080"
//     ? "https://cserbeauty.com/"
//     : window?.SERVER || window.location.origin;
export const NAME_APP = window.GlobalConfig?.APP.Name;
export const VERSION_APP = window.GlobalConfig?.APP.Version;
