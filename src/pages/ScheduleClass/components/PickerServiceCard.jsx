import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";
import { useQuery } from "react-query";
import userService from "../../../service/user.service";
import { getUser } from "../../../constants/user";
import moment from "moment";

function PickerServiceCard({
  isOpen,
  onClose,
  onChange,
  value,
  Date,
  callback,
  v,
}) {
  let { data } = useQuery({
    queryKey: ["ListOsMember", { isOpen }],
    queryFn: async () => {
      const member = getUser();
      let { data } = await userService.getSheduleOsMin({
        MemberIDs: [member?.ID],
        ProdIDs: [],
        Date: null,
      });
      return data.lst
        ? data.lst
            .filter((x) => x.ClassList && x.ClassList.length > 0)
            .map((x) => ({
              ...x,
              value: x.OS.ID,
              label: x.Prod.Title,
            }))
        : [];
    },
    onSuccess: (rs) => {
      if (rs && rs.length === 1) {
        callback && callback(rs[0]);
      }
    },
    enabled: v ? true : isOpen,
  });

  return createPortal(
    <AnimatePresence exitBeforeEnter>
      {isOpen && (
        <>
          <motion.div
            className="position-fixed w-100 h-100 top-0 left-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            style={{
              zIndex: 10000,
              background: "rgb(0 0 0 / 55%)",
            }}
            onClick={onClose}
          >
            <i
              className="las la-times position-absolute text-white"
              style={{
                fontSize: "35px",
                bottom: "62%",
                right: "15px",
                opacity: ".8",
              }}
            ></i>
          </motion.div>
          <motion.div
            className="position-fixed w-100 bottom-0 left-0 bg-white"
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            style={{
              zIndex: 10001,
              height: "60%",
              borderRadius: "5px 5px 0 0",
              overflow: "hidden",
              background: "#fff",
            }}
          >
            <div
              className="d-flex h-100"
              style={{
                flexDirection: "column",
              }}
            >
              <div
                className="p-15px text-uppercase fw-600"
                style={{
                  borderBottom: "3px solid #F3F6F9",
                }}
              >
                Thẻ liệu trình của bạn
              </div>
              <div
                style={{
                  flexGrow: "1",
                  overflow: "auto",
                }}
              >
                {data &&
                  data.map((item, index) => (
                    <div
                      key={index}
                      style={{
                        padding: "12px 15px",
                        borderBottom: "1px dashed #f1f1f1",
                        color: item.value === value && "var(--ezs-color)",
                        position: "relative",
                      }}
                      onClick={() => {
                        onChange(item);
                        onClose();
                      }}
                    >
                      <div>
                        <div className="fw-500 mb-2px">{item.label}</div>
                        <div className="fw-300 text-muted">
                          {item.ClassList.map((x) => x.Title).join(", ")}
                        </div>
                      </div>
                      {item.value === value && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          stroke="currentColor"
                          style={{
                            position: "absolute",
                            width: "24px",
                            right: "15px",
                            top: "50%",
                            transform: "translateY(-50%)",
                          }}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m4.5 12.75 6 6 9-13.5"
                          />
                        </svg>
                      )}
                    </div>
                  ))}
                {(!data || data.length === 0) && (
                  <div className="p-15px">Bạn chưa có thẻ liệu trình ?</div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.getElementById("framework7-root")
  );
}

export default PickerServiceCard;
