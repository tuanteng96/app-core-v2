import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import moment from "moment";
import PickerAdd from "./PickerAdd";
import { f7 } from "framework7-react";

const containerStyle = {
  position: "relative",
  display: "flex",
  justifyContent: "center",
  padding: "1.25rem 1rem", // py-5 px-4
  fontSize: "1.25rem", // text-xl
  fontWeight: 600, // font-semibold
  textAlign: "center",
};

const iconContainerLeft = {
  position: "absolute",
  top: 0,
  left: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "3rem", // w-12
  height: "100%", // h-full
  cursor: "pointer",
};

const iconContainerRight = {
  ...iconContainerLeft,
  left: "auto",
  right: 0,
};

const svgStyle = {
  width: "1.5rem", // w-6
  height: "1.5rem",
};

const timelineContainer = {
  position: "relative",
};

const itemStyle = {
  position: "relative",
  padding: "10px 0 10px 35px",
};

const timeStyle = {
  fontWeight: "600",
  fontSize: "13px",
  marginBottom: "2px",
};

const iconStyle = {
  position: "absolute",
  left: "0",
  top: "7px",
  width: "24px",
  height: "24px",
  backgroundColor: "#fce4ec",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "12px",
  color: "#ec407a",
  zIndex: 2,
};

const totalStyle = {
  fontWeight: "600",
  fontSize: "16px",
};

const chipGroup = {
  display: "flex",
  gap: "8px",
  marginTop: "4px",
};

const chip = (bg, color) => ({
  padding: "2px 8px",
  backgroundColor: bg,
  color,
  borderRadius: "6px",
  fontSize: "12px",
});

function PickerViewList({ children, refetch, Items, sub }) {
  let [visible, setVisible] = useState(false);

  return (
    <>
      {children({
        open: () => setVisible(true),
      })}
      {createPortal(
        <AnimatePresence>
          {visible && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                style={{
                  position: "fixed",
                  inset: 0,
                  background: "#000",
                  zIndex: 10000,
                }}
                onClick={() => setVisible(false)}
              />
              <motion.div
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: "100%", opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                style={{
                  position: "fixed",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: "#fff",
                  borderTopLeftRadius: "20px",
                  borderTopRightRadius: "20px",
                  zIndex: 10001,
                  //maxHeight: "80vh",
                }}
              >
                <div
                  className="position-relative bg-white d--f fd--c"
                  style={{
                    borderTopRightRadius: "20px",
                    borderTopLeftRadius: "20px",
                    maxHeight: "80vh",
                  }}
                >
                  <div style={containerStyle}>
                    {Items &&
                      Items.length > 0 &&
                      "Khung " +
                        moment(Items[0].RoundCreateDate).format("HH") +
                        "h" +
                        " ngày " +
                        moment(Items[0].RoundCreateDate).format("DD/MM/YYYY")}
                    <div
                      style={iconContainerRight}
                      onClick={() => setVisible(false)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        aria-hidden="true"
                        style={svgStyle}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </div>
                  </div>
                  <div
                    className="px-15px pb-15px overflow-auto"
                    style={{ flexGrow: 1 }}
                  >
                    <div
                      className="p-15px"
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 1fr",
                        gap: "15px",
                        background: "#f1f1f1",
                        borderRadius: "8px",
                      }}
                    >
                      <div className="text-center">
                        <div>Số lần</div>
                        <div
                          className="fw-600 pt-2px"
                          style={{
                            fontSize: "16px",
                          }}
                        >
                          {sub.count}
                        </div>
                        <div className="text-muted">lần</div>
                      </div>
                      <div className="text-center">
                        <div>Tổng</div>
                        <div
                          className="fw-600 pt-2px"
                          style={{
                            fontSize: "16px",
                          }}
                        >
                          {sub.sum}
                        </div>
                        <div className="text-muted">ml</div>
                      </div>
                      <div className="text-center">
                        <div>Trung bình</div>
                        <div
                          className="fw-600 pt-2px"
                          style={{
                            fontSize: "16px",
                          }}
                        >
                          {sub.avg}
                        </div>
                        <div className="text-muted">ml/lần</div>
                      </div>
                    </div>
                    <div className="mt-15px position-relative">
                      <div style={timelineContainer}>
                        {Items &&
                          Items.map((time, idx) => (
                            <PickerAdd
                              key={idx}
                              item={time}
                              onClose={async () => {
                                f7.dialog.preloader("Đang tải mới...");
                                await refetch();
                                f7.dialog.close();
                              }}
                            >
                              {({ open }) => (
                                <div onClick={open} style={itemStyle}>
                                  <div style={iconStyle}>🍼</div>
                                  <div className="d--f jc--sb">
                                    <div
                                      className="text-muted"
                                      style={timeStyle}
                                    >
                                      {moment(time.CreateDate).format("HH:mm")}
                                    </div>
                                    <div className="text-muted">
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
                                          d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                                        />
                                      </svg>
                                    </div>
                                  </div>

                                  <div className="mb-5px">
                                    <span style={totalStyle}>
                                      {time?.ParseData2?.TotalChest || 0} ml
                                    </span>
                                  </div>
                                  <div style={chipGroup}>
                                    <span style={chip("#e8f5e9", "#388e3c")}>
                                      Trái {time?.ParseData2?.RightChest || 0}{" "}
                                      ml
                                    </span>
                                    <span style={chip("#ffebee", "#d32f2f")}>
                                      Phải {time?.ParseData2?.LeftChest || 0} ml
                                    </span>
                                  </div>
                                </div>
                              )}
                            </PickerAdd>
                          ))}
                      </div>
                      <div
                        style={{
                          position: "absolute",
                          top: 0,
                          left: "11px",
                          height: "100%",
                          borderLeft: "2px dashed #ddd",
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.getElementById("framework7-root")
      )}
    </>
  );
}

export default PickerViewList;
