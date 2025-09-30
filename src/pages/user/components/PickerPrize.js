import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

function PrizePicker({ children, data }) {
  const [visible, setVisible] = useState(false);

  const onHide = () => setVisible(false);

  return (
    <>
      {children({
        open: () => setVisible(true),
      })}
      {visible && (
        <AnimatePresence>
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              zIndex: 50,
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
              height: "100%",
              maxHeight: "100%",
              overflowX: "hidden",
              overflowY: "auto",
            }}
          >
            {/* Modal box */}
            <motion.div
              style={{
                position: "relative",
                width: "100%",
                maxWidth: "450px",
                maxHeight: "80%",
                zIndex: 20,
                background: "#fff",
                borderRadius: "0.75rem 0.75rem 0 0",
                boxShadow:
                  "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)",
                display: "flex",
                flexDirection: "column",
                color: "#000",
              }}
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
            >
              {/* Header */}
              <div
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "1rem 1.25rem",
                  borderBottom: "1px solid #e5e7eb",
                }}
              >
                <div style={{ fontSize: "1.125rem", fontWeight: "700" }}>
                  Cơ cấu giải thưởng
                </div>
                <div
                  onClick={onHide}
                  style={{
                    position: "absolute",
                    right: "0.75rem",
                    width: "2.5rem",
                    height: "2.5rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#B5B5C3",
                    cursor: "pointer",
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.color = "#000")}
                  onMouseOut={(e) => (e.currentTarget.style.color = "#B5B5C3")}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    style={{ width: "22px" }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18 18 6M6 6l12 12"
                    />
                  </svg>
                </div>
              </div>

              {/* Body */}
              <div
                style={{
                  padding: "1.25rem",
                  overflow: "auto",
                  flexGrow: 1,
                }}
              >
                {data &&
                  data.map((x, index) => (
                    <div
                      key={index}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        marginBottom:
                          data?.length - 1 === index ? "" : "0.75rem",
                        background: "#fff",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: "2.5rem",
                          height: "2.5rem",
                          borderRadius: "9999px",
                          background: "#d51e1e",
                          color: "#fff",
                          fontWeight: "600",
                        }}
                      >
                        {index + 1}
                      </div>
                      <div
                        style={{
                          flex: 1,
                          paddingLeft: "1rem",
                          fontWeight: "500",
                          textAlign: "left",
                        }}
                      >
                        {x.option}
                      </div>
                    </div>
                  ))}
              </div>
            </motion.div>

            {/* Overlay */}
            <motion.div
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 10,
                background: "rgba(17, 24, 39, 0.5)",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onHide}
            />
          </div>
        </AnimatePresence>
      )}
    </>
  );
}

export default PrizePicker;
