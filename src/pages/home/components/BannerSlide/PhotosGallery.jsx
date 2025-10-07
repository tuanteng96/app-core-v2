import React from "react";
import { toAbsoluteUrl } from "../../../../constants/assetPath";
import { OPEN_LINK } from "../../../../constants/prom21";

const PhotosGallery = ({ Images = [] }) => {
  if (Images.length === 1) {
    return (
      <div>
        <img
          className="w-100"
          src={toAbsoluteUrl("/Upload/image/" + Images[0])}
          onClick={() => {
            Fancybox.show(
              [
                {
                  src: toAbsoluteUrl("/Upload/image/" + Images[0]),
                  thumbSrc: toAbsoluteUrl("/Upload/image/" + Images[0]),
                },
              ],
              {
                Carousel: {
                  Toolbar: {
                    items: {
                      downloadImage: {
                        tpl: '<button class="f-button"><svg tabindex="-1" width="24" height="24" viewBox="0 0 24 24"><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2M7 11l5 5 5-5M12 4v12"></path></svg></button>',
                        click: () => {
                          OPEN_LINK(
                            toAbsoluteUrl("/Upload/image/" + Images[0])
                          );
                        },
                      },
                    },
                    display: {
                      left: ["counter"],
                      middle: [
                        "zoomIn",
                        "zoomOut",
                        // "toggle1to1",
                        "rotateCCW",
                        "rotateCW",
                        // "flipX",
                        // "flipY",
                      ],
                      right: [
                        "downloadImage",
                        //"thumbs",
                        "close",
                      ],
                    },
                  },
                },
                startIndex: 0, //index
              }
            );
          }}
        />
      </div>
    );
  }
  if (Images.length === 2) {
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "3px",
        }}
      >
        {Images.map((img, index) => (
          <div key={index}>
            <img
              style={{
                aspectRatio: "1/1",
                height: "100%",
                objectFit: "cover",
              }}
              className="w-100"
              src={toAbsoluteUrl("/Upload/image/" + img)}
              onClick={() => {
                Fancybox.show(
                  Images.map((x) => ({
                    src: toAbsoluteUrl("/Upload/image/" + x),
                    thumbSrc: toAbsoluteUrl("/Upload/image/" + x),
                  })),
                  {
                    Carousel: {
                      Toolbar: {
                        items: {
                          downloadImage: {
                            tpl: '<button class="f-button"><svg tabindex="-1" width="24" height="24" viewBox="0 0 24 24"><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2M7 11l5 5 5-5M12 4v12"></path></svg></button>',
                            click: () => {
                              OPEN_LINK(toAbsoluteUrl("/Upload/image/" + img));
                            },
                          },
                        },
                        display: {
                          left: ["counter"],
                          middle: [
                            "zoomIn",
                            "zoomOut",
                            // "toggle1to1",
                            "rotateCCW",
                            "rotateCW",
                            // "flipX",
                            // "flipY",
                          ],
                          right: [
                            "downloadImage",
                            //"thumbs",
                            "close",
                          ],
                        },
                      },
                    },
                    startIndex: index, //index
                  }
                );
              }}
            />
          </div>
        ))}
      </div>
    );
  }
  if (Images.length === 3) {
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "3px",
        }}
      >
        {Images.map((img, index) => (
          <div
            style={{
              gridColumn: index === 0 ? "span 2" : "span 1",
            }}
            key={index}
          >
            <img
              style={{
                aspectRatio: "1/1",
                height: "100%",
                objectFit: "cover",
              }}
              className="w-100"
              src={toAbsoluteUrl("/Upload/image/" + img)}
              onClick={() => {
                Fancybox.show(
                  Images.map((x) => ({
                    src: toAbsoluteUrl("/Upload/image/" + x),
                    thumbSrc: toAbsoluteUrl("/Upload/image/" + x),
                  })),
                  {
                    Carousel: {
                      Toolbar: {
                        items: {
                          downloadImage: {
                            tpl: '<button class="f-button"><svg tabindex="-1" width="24" height="24" viewBox="0 0 24 24"><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2M7 11l5 5 5-5M12 4v12"></path></svg></button>',
                            click: () => {
                              OPEN_LINK(toAbsoluteUrl("/Upload/image/" + img));
                            },
                          },
                        },
                        display: {
                          left: ["counter"],
                          middle: [
                            "zoomIn",
                            "zoomOut",
                            // "toggle1to1",
                            "rotateCCW",
                            "rotateCW",
                            // "flipX",
                            // "flipY",
                          ],
                          right: [
                            "downloadImage",
                            //"thumbs",
                            "close",
                          ],
                        },
                      },
                    },
                    startIndex: index, //index
                  }
                );
              }}
            />
          </div>
        ))}
      </div>
    );
  }
  if (Images.length === 4) {
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "3px",
        }}
      >
        {Images.map((img, index) => (
          <div key={index}>
            <img
              style={{
                aspectRatio: "1/1",
                height: "100%",
                objectFit: "cover",
              }}
              className="w-100"
              src={toAbsoluteUrl("/Upload/image/" + img)}
              onClick={() => {
                Fancybox.show(
                  Images.map((x) => ({
                    src: toAbsoluteUrl("/Upload/image/" + x),
                    thumbSrc: toAbsoluteUrl("/Upload/image/" + x),
                  })),
                  {
                    Carousel: {
                      Toolbar: {
                        items: {
                          downloadImage: {
                            tpl: '<button class="f-button"><svg tabindex="-1" width="24" height="24" viewBox="0 0 24 24"><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2M7 11l5 5 5-5M12 4v12"></path></svg></button>',
                            click: () => {
                              OPEN_LINK(toAbsoluteUrl("/Upload/image/" + img));
                            },
                          },
                        },
                        display: {
                          left: ["counter"],
                          middle: [
                            "zoomIn",
                            "zoomOut",
                            // "toggle1to1",
                            "rotateCCW",
                            "rotateCW",
                            // "flipX",
                            // "flipY",
                          ],
                          right: [
                            "downloadImage",
                            //"thumbs",
                            "close",
                          ],
                        },
                      },
                    },
                    startIndex: index, //index
                  }
                );
              }}
            />
          </div>
        ))}
      </div>
    );
  }
  if (Images.length > 4) {
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "3px",
        }}
      >
        {Images.slice(0, 4).map((img, index) => (
          <div className="position-relative" key={index}>
            <img
              style={{
                aspectRatio: "1/1",
                height: "100%",
                objectFit: "cover",
              }}
              className="w-100"
              src={toAbsoluteUrl("/Upload/image/" + img)}
              onClick={() => {
                Fancybox.show(
                  Images.map((x) => ({
                    src: toAbsoluteUrl("/Upload/image/" + x),
                    thumbSrc: toAbsoluteUrl("/Upload/image/" + x),
                  })),
                  {
                    Carousel: {
                      Toolbar: {
                        items: {
                          downloadImage: {
                            tpl: '<button class="f-button"><svg tabindex="-1" width="24" height="24" viewBox="0 0 24 24"><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2M7 11l5 5 5-5M12 4v12"></path></svg></button>',
                            click: () => {
                              OPEN_LINK(toAbsoluteUrl("/Upload/image/" + img));
                            },
                          },
                        },
                        display: {
                          left: ["counter"],
                          middle: [
                            "zoomIn",
                            "zoomOut",
                            // "toggle1to1",
                            "rotateCCW",
                            "rotateCW",
                            // "flipX",
                            // "flipY",
                          ],
                          right: [
                            "downloadImage",
                            //"thumbs",
                            "close",
                          ],
                        },
                      },
                    },
                    startIndex: index, //index
                  }
                );
              }}
            />
            {index === 3 && (
              <div
                className="position-absolute w-100 h-100 top-0 left-0 d--f jc--c ai--c text-white fw-500"
                style={{
                  background: "rgb(0 0 0 / 40%)",
                  fontSize: "30px",
                  pointerEvents: "none",
                }}
              >
                +{Images.length - 4}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }
};

export default PhotosGallery;
