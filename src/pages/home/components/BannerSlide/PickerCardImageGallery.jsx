import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";
import { Swiper, SwiperSlide } from "framework7-react";
import { toAbsoluteUrl } from "../../../../constants/assetPath";
import PickerConfirm from "../PickerConfirm";
import { SERVER_APP } from "../../../../constants/config";

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
      {visible &&
        createPortal(
          <AnimatePresence exitBeforeEnter>
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
                        <div className="positon-relative">
                          <img
                            className="w-100"
                            src={toAbsoluteUrl(
                              "/Upload/image/" + item.source.Thumbnail
                            )}
                            alt={item.source.Title}
                          />
                          <div
                            className="position-absolute right-15px top-15px text-white"
                            onClick={close}
                          >
                            <i className="icon f7-icons">xmark_circle_fill</i>
                          </div>
                        </div>
                        <div
                          className="p-15px"
                          style={{
                            flexGrow: "1",
                            overflow: "auto",
                          }}
                        >
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
                          <div className="mt-15px">
                            <PickerConfirm
                              initialValue={{
                                ...item,
                                Title: item.source.Title,
                              }}
                            >
                              {({ open }) => (
                                <button
                                  className="btn-submit-order btn-submit-order rounded"
                                  type="submit"
                                  onClick={open}
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
          </AnimatePresence>,
          document.getElementById("framework7-root")
        )}
    </>
  );
}

export default PickerCardImageGallery;
