import { SERVER_APP } from "./config";

export const toAbsoluteUrl = (pathname) => {
  return (window?.SERVER || SERVER_APP) + pathname;
};
