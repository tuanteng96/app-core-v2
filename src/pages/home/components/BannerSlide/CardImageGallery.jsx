import { Card, CardContent, CardHeader, Link } from "framework7-react";
import React from "react";
import { useQuery } from "react-query";
import NewsDataService from "../../../../service/news.service";
import { toAbsoluteUrl } from "../../../../constants/assetPath";

function CardImageGallery(props) {
  let { data } = useQuery({
    queryKey: ["CardImageGallery"],
    queryFn: async () => {
      let { data } = await NewsDataService.getBannerName("APP.MAINSALE");
      return data?.data || [];
    },
  });

  if (!data || data.length === 0) return <></>;

  return (
    <div
      className="bg-white mb-8px"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3,minmax(0,1fr))",
        padding: "12px",
        gap: "12px",
      }}
    >
      {data.map((item, index) => (
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
      ))}
    </div>
  );
}

export default CardImageGallery;
