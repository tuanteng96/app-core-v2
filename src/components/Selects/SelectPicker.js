import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import React, { useState } from "react";
import { createPortal } from "react-dom";

function SelectPicker({
  options = [],
  value,
  onChange,
  label,
  placeholder,
  errorMessage,
  errorMessageForce,
  isRequired = true,
  disabled = false,
  isClearable = false,
}) {
  const [visible, setVisible] = useState(false);
  let open = () => {
    if (!disabled) setVisible(true);
  };

  let close = () => {
    setVisible(false);
  };
  
  return (
    <AnimatePresence initial={false}>
      <>
        <div className="picker-input-wrap" onClick={open}>
          <input
            className={clsx(
              "picker-input",
              errorMessageForce ? "border-danger" : "border-[#d5d7da]"
            )}
            placeholder={placeholder}
            value={value?.label ? value?.label : ""}
            readOnly
            style={{
              padding: value && isClearable ? "12px 90px 12px 12px" : "12px 40px 12px 12px",
            }}
          ></input>
          <div className="down-icon">
            {value && isClearable && (
              <div
                className="down-icon-clear"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(null);
                }}
              >
                <svg
                  style={{
                    width: "18px",
                  }}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18 18 6M6 6l12 12"
                  />
                </svg>
              </div>
            )}

            <div className="down-icon-drop">
              <i className="las la-angle-down"></i>
            </div>
          </div>
        </div>
        {errorMessage && errorMessageForce && (
          <div className="mt-1.5 text-xs text-danger font-light">
            {errorMessage}
          </div>
        )}

        {visible &&
          createPortal(
            <div className="picker-select">
              <motion.div
                key={visible}
                className="_bg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={close}
              ></motion.div>
              <motion.div
                className="picker-select-wrap"
                initial={{ opacity: 0, translateY: "100%" }}
                animate={{ opacity: 1, translateY: "0%" }}
                exit={{ opacity: 0, translateY: "100%" }}
              >
                <div className="_header">
                  {label}
                  <div className="_close" onClick={close}>
                    <i className="las la-times"></i>
                  </div>
                </div>
                <div className="_body">
                  {options &&
                    options.length > 0 &&
                    options.map((item, index) => (
                      <div
                        className={clsx(
                          "item",
                          value?.value === item?.value && "text-app2"
                        )}
                        onClick={() => {
                          isRequired
                            ? onChange(item)
                            : onChange(
                                value?.value === item?.value ? null : item
                              );
                          isRequired && close();
                        }}
                        key={index}
                      >
                        {item?.label}
                        <i className="las la-check"></i>
                        {/* {value?.value === item?.value && (
                          <i className="las la-check"></i>
                        )} */}
                      </div>
                    ))}
                </div>
              </motion.div>
            </div>,
            document.getElementById("framework7-root")
          )}
      </>
    </AnimatePresence>
  );
}

export default SelectPicker;
