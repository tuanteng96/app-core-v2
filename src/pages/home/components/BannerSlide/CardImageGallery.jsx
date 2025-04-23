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
      let { data } = await NewsDataService.getBannerName("APP.MAINSALE");
      return data?.data || [];
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
                  src={toAbsoluteUrl(
                    "/Upload/image/" + (item.FileName2 || item.FileName)
                  )}
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

        {/* {data.map((item, index) => (
        <Card
          key={index}
          className="m-0"
          expandable
          style={{
            height: "auto",
            aspectRatio: "1",
          }}
          noBorder
          noShadow
          expandableAnimateWidth
        >
          <CardContent padding={false}>
            <div>
              <CardHeader className="p-0">
                <img
                  className="w-100"
                  src={toAbsoluteUrl(
                    "/Upload/image/" + (item.FileName2 || item.FileName)
                  )}
                  alt={item.Title}
                  style={{
                    aspectRatio: "1",
                    objectFit: "cover",
                  }}
                />
              </CardHeader>
              <Link
                cardClose
                color="white"
                className="card-opened-fade-in"
                style={{ position: "absolute", right: "15px", top: "15px" }}
                iconF7="xmark_circle_fill"
              />
            </div>
            <div className="card-content-padding">
              <div
                className="fw-500 mb-10px"
                style={{
                  fontSize: "18px",
                  color: "var(--ezs-color)",
                }}
              >
                {item.Title}
              </div>
              <div
                className="content_"
                dangerouslySetInnerHTML={{
                  __html: item.Desc,
                }}
                style={{
                  fontSize: "15px",
                  lineHeight: "24px",
                  color: "#3c3c3c",
                }}
              ></div>
            </div>
          </CardContent>
        </Card>
      ))} */}
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
