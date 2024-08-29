import React from "react";
import { toAbsoluteUrl } from "../constants/assetPath";

export default class PageNoData extends React.Component {
  render() {
    const data = this.props;
    return (
      <div className="page-nodata">
        <div className="page-nodata__img">
          <img
            src={toAbsoluteUrl("/app2021/images/nodata.png")}
            alt="Chưa có dữ liệu"
          />
        </div>
        <div className="page-nodata__text">{data.text}</div>
      </div>
    );
  }
}
