import React, { useEffect, useRef, useState } from "react";
import { getStockIDStorage, getUser } from "../../constants/user";
import { SERVER_APP } from "../../constants/config";
import Dom7 from "dom7";
import UserService from "../../service/user.service";
import IframeComm from "react-iframe-comm";

function IframeReport({ f7 }) {
  const iframeRef = useRef(null);
  const [isShow, setIsShow] = useState(false);

  useEffect(() => {
    var $ = Dom7;
    if ($(".dialog-preloader").length === 0) {
      f7.dialog.preloader("Đang tải báo cáo ... ");
    }
    if (window.hasReport) {
      setIsShow(true);
    } else {
      UserService.getInfo().then(({ data }) => {
        if (data) {
          window.Info = {
            ...data,
            CrStockID: getStockIDStorage(),
            rightsSum: data?.Info?.rightsSum,
            Stocks: data?.Info?.StockRights,
            rightTree: data?.Info?.rightTree,
          };
          window.token = data?.token;

          window.hasReport = true

          setIsShow(true);
        } else {
          setIsShow(true);
        }
      });
    }
  }, []);

  useEffect(() => {
    const iFrameElement = iframeRef && iframeRef.current;

    if (iFrameElement) {
      const postMessage = iFrameElement.contentWindow.postMessage;
      postMessage("Message from parent");
    }
  }, [iframeRef]);

  if (!isShow) {
    return "";
  }

  return (
    <IframeComm
      attributes={{
        src: `${
          window.SERVER || SERVER_APP
        }/App23/index.html?v=${new Date().valueOf()}`,
        width: "100%",
        height: "100%",
        frameBorder: 0,
      }}
      postMessageData={JSON.stringify({
        Info: window.Info,
        token: window.token,
        isApp: true,
      })}
      handleReady={() => {
        f7.dialog.close();
      }}
    />
  );
}

export default IframeReport;
