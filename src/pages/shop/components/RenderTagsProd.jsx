import React from "react";
import { toAbsoluteUrl } from "../../../constants/assetPath";

function RenderTagsProd({ status }) {
  if (!status || !window.GlobalConfig?.APP?.Prod?.ShowTags) return "";
  return (
    <>
      {status.includes("1") && <div className="ribbon-new">Mới</div>}
      {status.includes("2") && (
        <div className="ribbon-hot">
          <img src={toAbsoluteUrl(`/app2021/images/hot-icon.gif`)} alt="" />
        </div>
      )}
      {status.includes("3") && <div className="ribbon-sale">Sale</div>}
    </>
  );
}

export default RenderTagsProd;
