import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";
import { toAbsoluteUrl } from "../../../../constants/assetPath";
import PickerConfirm from "../PickerConfirm";
import { SERVER_APP } from "../../../../constants/config";

function PickerCardView({ children, data }) {
  const [visible, setVisible] = useState(false);
  const [positon, setPosition] = useState(0);

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
                  onScroll={(e) => {
                    setPosition(e.target.scrollTop);
                  }}
                >
                  <div className="positon-relative">
                    <img
                      className="w-100"
                      src={toAbsoluteUrl("/Upload/image/" + data?.Thumbnail)}
                      alt={data.Title}
                    />
                    <div
                      className="position-absolute right-0 top-0 text-white w-100 px-15px bz-bb d--f ai--c jc--sb"
                      style={{
                        background:
                          positon > 0 ? "var(--ezs-color)" : "transparent",
                        height: "48px",
                        transition: "background .3s ease",
                      }}
                    >
                      <div
                        className="fw-500 text-truncate"
                        style={{
                          width: "80%",
                          opacity: positon > 0 ? 1 : 0,
                          visibility: positon > 0 ? "visible" : "hidden",
                        }}
                      >
                        {data.Title}
                      </div>
                      <div onClick={close}>
                        <i className="icon f7-icons">xmark_circle_fill</i>
                      </div>
                    </div>
                  </div>
                  <div className="p-15px">
                    <div
                      className="fw-500 mb-10px"
                      style={{
                        fontSize: "18px",
                        color: "var(--ezs-color)",
                      }}
                    >
                      {data.Title}
                    </div>
                    <div
                      className="content_"
                      dangerouslySetInnerHTML={{
                        __html: fixedContentDomain(data.Desc),
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
                        __html: fixedContentDomain(data.Content),
                      }}
                      style={{
                        fontSize: "15px",
                        lineHeight: "24px",
                        color: "#3c3c3c",
                      }}
                    ></div>
                  </div>
                </div>
                <div className="p-15px">
                  <div>
                    <PickerConfirm initialValue={data}>
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
            </motion.div>
          )}
        </AnimatePresence>,
        document.getElementById("framework7-root")
      )}
    </>
  );
}

export default PickerCardView;
