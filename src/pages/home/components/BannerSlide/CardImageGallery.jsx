import { Card, CardContent, CardHeader, Link } from "framework7-react";
import React, { useState } from "react";
import { useQuery } from "react-query";
import NewsDataService from "../../../../service/news.service";
import { toAbsoluteUrl } from "../../../../constants/assetPath";
import PickerCardImageGallery from "./PickerCardImageGallery";

function CardImageGallery(props) {
  let [isMore, setIsMore] = useState(false);
  let { data } = useQuery({
    queryKey: ["CardImageGallery"],
    queryFn: async () => {
      let { data } = await NewsDataService.getNewsIdCate(11608);
      return data?.data ? data?.data.filter(x => x.source.Status === "1") : [];
    },
  });

  if (!data || data.length === 0) return <></>;

  return (
    <div className="bg-white mb-8px">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,minmax(0,1fr))",
          padding: "12px",
          gap: "12px",
        }}
      >
        {data.slice(0, isMore ? 18 : 9).map((item, index) => (
          <PickerCardImageGallery data={data} key={index} index={index}>
            {({ open }) => (
              <div onClick={open}>
                <img
                  className="w-100"
                  src={toAbsoluteUrl("/Upload/image/" + item.source.Thumbnail)}
                  alt={item.Title}
                  style={{
                    aspectRatio: "1",
                    objectFit: "cover",
                    borderRadius: "8px",
                  }}
                />
              </div>
            )}
          </PickerCardImageGallery>
        ))}
      </div>
      {data.length > 9 && (
        <div
          className="text-primary text-center pb-15px pt-8px fw-500"
          onClick={() => setIsMore(!isMore)}
        >
          <span className="pr-5px">{isMore ? "Ẩn bớt" : "Xem thêm"}</span>
          <i
            className="las la-angle-down"
            style={{
              transform: `rotate(${isMore ? "180" : "0"}deg)`,
              transition: "all 250ms",
            }}
          ></i>
        </div>
      )}
    </div>
  );
}

export default CardImageGallery;
