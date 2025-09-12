import React, { useState } from "react";
import { createPortal } from "react-dom";
import DatePicker from "react-mobile-datepicker";
import { motion, AnimatePresence } from "framer-motion";

const PickerDate = ({
  className = "",
  children,
  onChange,
  value,
  confirmText = "Xác nhận",
  cancelText = "Đóng",
  headerFormat = "hh:mm DD/MM/YYYY",
  config = {
    hour: {
      format: "hh",
      caption: "Giờ",
      step: 1,
    },
    minute: {
      format: "mm",
      caption: "Phút",
      step: 1,
    },
    date: {
      caption: "Ngày",
      format: "D",
      step: 1,
    },
    month: {
      caption: "Tháng",
      format: "M",
      step: 1,
    },
    year: {
      caption: "Năm",
      format: "YYYY",
      step: 1,
    },
  },
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={className}>
      {children({ open: () => setIsOpen(true) })}

      {createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backgroundColor: "#000",
                zIndex: 10010,
              }}
              onClick={() => setIsOpen(false)}
            />
          )}
        </AnimatePresence>,
        document.getElementById("framework7-root")
      )}

      <DatePicker
        value={value}
        isOpen={isOpen}
        onSelect={(val) => {
          onChange(val);
          setIsOpen(false);
        }}
        onCancel={() => setIsOpen(false)}
        dateFormat={["HH", "mm", "DD", "MM", "YYYY"]}
        confirmText={confirmText}
        cancelText={cancelText}
        theme="ios"
        headerFormat={headerFormat}
        showCaption={true}
        dateConfig={config}
      />
    </div>
  );
};

export default PickerDate;
