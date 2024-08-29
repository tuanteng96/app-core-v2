import React from "react";

import moment from "moment";
import "moment/locale/vi";
import { useState } from "react";
import { useEffect } from "react";
import { PhotoBrowser } from "framework7-react";
import { useRef } from "react";
import { toAbsoluteUrl } from "../../../constants/assetPath";

moment.locale("vi");

function EmployeeImage({ img }) {
  const [photos, setPhotos] = useState([]);
  const standaloneDark = useRef();

  useEffect(() => {
    if (img) {
      setPhotos([
        {
          url: toAbsoluteUrl("/Upload/image/" + img?.Src),
          caption: "Dịch vụ " + img?.Title,
        },
      ]);
    }
  }, [img]);

  return (
    <div
      className="img-item-lst_o"
      onClick={() => {
        standaloneDark.current.open();
      }}
    >
      <div
        className="bg-img"
        style={{
          background: `url(${toAbsoluteUrl("/Upload/image/" + img?.Src)})`,
        }}
      ></div>
      <PhotoBrowser
        photos={photos}
        theme="light"
        type="popup"
        popupCloseLinkText="Đóng"
        navbarOfText="/"
        ref={standaloneDark}
        expositionHideCaptions={true}
      />
    </div>
  );
}

export default EmployeeImage;
