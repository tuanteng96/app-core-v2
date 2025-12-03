import { SERVER_APP } from "./config";

export const iOS = () => {
  return (
    [
      "iPad Simulator",
      "iPhone Simulator",
      "iPod Simulator",
      "iPad",
      "iPhone",
      "iPod",
    ].indexOf(navigator.platform) !== -1
  );
};

export const getMobileOperatingSystem = () => {
  var userAgent = navigator.userAgent || navigator.vendor || window.opera;

  // Windows Phone must come first because its UA also contains "Android"
  if (/windows phone/i.test(userAgent)) {
    return "Windows Phone";
  }

  if (/android/i.test(userAgent)) {
    return "Android";
  }

  // iOS detection from: http://stackoverflow.com/a/9039885/177710
  if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
    return "iOS";
  }

  return "unknown";
};

export const uuid = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const validURL = (str) => {
  var pattern = new RegExp(
    "^(https?:\\/\\/)?" + // protocol
      "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
      "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
      "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
      "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
      "(\\#[-a-z\\d_]*)?$",
    "i"
  ); // fragment locator
  return !!pattern.test(str);
};

export const checkSLDisabled = (prodid) => {
  const result = {
    Disabled: false,
    Text: "",
  };
  const SL = window?.GlobalConfig?.APP?.Prod?.SL;
  if (!SL || !prodid) return result;
  let index = SL.split(",").findIndex((x) => Number(x) === Number(prodid));
  if (index > -1) {
    result.Disabled = true;
    result.Text = "(*) Chỉ áp dụng mua 1 SP/DV.";
  }
  return result;
};

export const checkDevices = ({ Auth, deviceId }) =>
  new Promise((resolve, reject) => {
    //Auth.DeviceIDs
    if (window?.GlobalConfig?.APP?.DeviceCheck) {
      if (Auth.DeviceIDs && Auth.DeviceIDs === deviceId) {
        resolve("");
      } else {
        reject("Tài khoản của bạn đang đăng nhập tại thiết bị khác.");
      }
    } else {
      resolve("");
    }
  });

export const getRandomItemByPercentage = (items, percentages) => {
  const total = percentages.reduce((sum, value) => sum + value, 0);
  const randomValue = Math.random() * total;

  let runningSum = 0;
  for (let i = 0; i < items.length; i++) {
    runningSum += percentages[i];
    if (randomValue <= runningSum) {
      return i;
    }
  }

  return items.length - 1;
};

export const fixedContentDomain = (content) => {
  if (!content) return "";

  const server = window.SERVER || SERVER_APP;

  // 1. Fix src="/..." → src="SERVER/..."
  let result = content.replace(/src=\"\//g, `src="${server}/`);

  // 2. Tìm tất cả iframe
  result = result.replace(
    /<iframe([^>]*)src=["']([^"']+)["']([^>]*)><\/iframe>/gi,
    (match, beforeSrc, src, afterSrc) => {
      // Regex tìm YouTube videoId
      const ytRegex =
        /(?:youtube\.com\/embed\/|youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{6,})/;
      const m = src.match(ytRegex);

      let updated = match;
      
      if (m && m[1]) {
        const videoId = m[1];
        const newSrc = `${server}/app2021/player.html?videoId=${videoId}`;
        updated = match.replace(src, newSrc);

        // Thêm allowfullscreen nếu chưa có
        if (!/allowfullscreen/i.test(updated)) {
          updated = updated.replace(
            "<iframe",
            `<iframe allowfullscreen="allowfullscreen"`
          );
        }
      }

      // Thêm style responsive max-width 100% cho tất cả iframe
      if (/style="/i.test(updated)) {
        updated = updated.replace(
          /style="/i,
          `style="max-width:100%; width:100%; height:auto; `
        );
      } else {
        updated = updated.replace(
          "<iframe",
          `<iframe style="max-width:100%; width:100%; height:auto;"`
        );
      }

      return updated;
    }
  );

  return result;
};
