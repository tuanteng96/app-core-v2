import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";
import { Swiper, SwiperSlide } from "framework7-react";
import { toAbsoluteUrl } from "../../../../constants/assetPath";
import PickerConfirm from "../PickerConfirm";
import { SERVER_APP } from "../../../../constants/config";
import PhotosGallery from "./PhotosGallery";

function PickerCardImageGallery({ children, data, index }) {
  let elSwiper = useRef();

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (visible) {
      elSwiper?.current?.swiper?.slideTo(index);
    }
  }, [elSwiper, visible]);

  const close = () => {
    setVisible(false);
  };

  const fixedContentDomain = (content) => {
    if (!content) return "";
    return content.replace(
      /src=\"\//g,
      'src="' + (window.SERVER || SERVER_APP) + "/"
    );
  };

  return (
    <>
      {children({
        open: () => setVisible(true),
        close: close,
      })}
      {createPortal(
        <AnimatePresence exitBeforeEnter>
          {visible && (
            <motion.div
              className="position-fixed w-100 bottom-0 left-0 bg-white"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{
                opacity: 1,
                scale: 1,
                transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
              }}
              exit={{
                opacity: 0,
                scale: 0.95,
                transition: { duration: 0.2, ease: "easeIn" },
              }}
              style={{
                zIndex: 10001,
                height: "100%",
                background: "#fff",
              }}
            >
              <Swiper
                className="h-100"
                ref={elSwiper}
                params={
                  {
                    //loop: true,
                  }
                }
              >
                {data &&
                  data.map((item, index) => (
                    <SwiperSlide key={index}>
                      <div
                        className="d--f h-100"
                        style={{
                          flexDirection: "column",
                        }}
                      >
                        <div
                          style={{
                            flexGrow: "1",
                            overflow: "auto",
                          }}
                        >
                          <PhotosGallery
                            Images={[
                              item.source?.Thumbnail,
                              ...item.source?.Photos,
                            ]}
                          />
                          <div className="p-15px">
                            <div
                              className="fw-500 mb-10px"
                              style={{
                                fontSize: "18px",
                                color: "var(--ezs-color)",
                              }}
                            >
                              {item.source.Title}
                            </div>
                            <div
                              className="content_"
                              dangerouslySetInnerHTML={{
                                __html: fixedContentDomain(item.source.Desc),
                              }}
                              style={{
                                fontSize: "15px",
                                lineHeight: "24px",
                                color: "#3c3c3c",
                              }}
                            ></div>
                            <div
                              className="content_"
                              dangerouslySetInnerHTML={{
                                __html: fixedContentDomain(item.source.Content),
                              }}
                              style={{
                                fontSize: "15px",
                                lineHeight: "24px",
                                color: "#3c3c3c",
                              }}
                            ></div>
                          </div>
                        </div>
                        <div
                          className="p-15px"
                          style={{
                            display: "flex",
                            gap: "12px",
                          }}
                        >
                          <div
                            style={{
                              width: "50px",
                            }}
                          >
                            <button
                              type="button"
                              className="btn-submit-order btn-submit-order rounded"
                              onClick={close}
                              style={{
                                background: "transparent",
                                border: "1px solid #d3d3d3",
                                minHeight: "48px",
                                color: "#222",
                              }}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="1.5"
                                stroke="currentColor"
                                style={{
                                  width: "24px",
                                }}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M15.75 19.5 8.25 12l7.5-7.5"
                                />
                              </svg>
                            </button>
                          </div>
                          <div
                            style={{
                              flexGrow: "1",
                            }}
                          >
                            <PickerConfirm initialValue={data}>
                              {({ open }) => (
                                <button
                                  className="btn-submit-order btn-submit-order rounded"
                                  type="submit"
                                  onClick={open}
                                  style={{
                                    minHeight: "48px",
                                  }}
                                >
                                  <span>Đặt lịch ngay</span>
                                </button>
                              )}
                            </PickerConfirm>
                          </div>
                        </div>
                      </div>
                    </SwiperSlide>
                  ))}
              </Swiper>
            </motion.div>
          )}
        </AnimatePresence>,
        document.getElementById("framework7-root")
      )}
    </>
  );
}

export default PickerCardImageGallery;
