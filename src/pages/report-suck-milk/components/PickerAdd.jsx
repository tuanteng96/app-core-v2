import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import PickerDate from "./PickerDate";
import { Form, Formik } from "formik";
import * as Yup from "yup";
import NumberFormat from "react-number-format";
import moment from "moment";
import { useMutation } from "react-query";
import { motion, AnimatePresence } from "framer-motion";
import staffService from "../../../service/staff.service";
import { getUser } from "../../../constants/user";
import { toast } from "react-toastify";
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

const valiSchema = Yup.object().shape({
  LeftChest: Yup.string().required("Vui lòng nhập số lượng."),
  RightChest: Yup.string().required("Vui lòng nhập số lượng."),
});

function PickerAdd({ children, refetch, item, onClose, isSuckMilk = false }) {
  let [visible, setVisible] = useState(false);
  let timeInputRef = useRef();
  let [initialValues, setInitialValues] = useState({
    CreateDate: new Date(),
    LeftChest: "",
    RightChest: "",
    Desc: "",
  });

  useEffect(() => {
    if (item && item.ID > 0) {
      if (isSuckMilk) {
        setInitialValues({
          ID: item.ID,
          CreateDate: moment(item.CreateDate, "YYYY-MM-DD HH:mm").toDate(),
          LeftChest: item?.ParseData3?.LeftChest || "",
          RightChest: item?.ParseData3?.RightChest || "",
          Desc: item?.ParseData3?.Desc || "",
        });
      } else {
        setInitialValues({
          ID: item.ID,
          CreateDate: moment(item.CreateDate, "YYYY-MM-DD HH:mm").toDate(),
          LeftChest: item?.ParseData2?.LeftChest || "",
          RightChest: item?.ParseData2?.RightChest || "",
          Desc: item?.ParseData2?.Desc || "",
        });
      }
    } else {
      setInitialValues({
        CreateDate: new Date(),
        LeftChest: "",
        RightChest: "",
        Desc: "",
      });
    }
  }, [visible]);

  const updateMutation = useMutation({
    mutationFn: async (body) => {
      let rs = await staffService.addEditSuckMilk(body);
      if (refetch) await refetch();
      return rs;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (body) => {
      let rs = await staffService.deleteSuckMilk(body);
      if (refetch) await refetch();
      return rs;
    },
  });

  const onSubmit = (values) => {
    const member = getUser();
    if (!member) return false;
    f7.dialog.preloader("Đang thực hiện ...");
    const MemberID = member.ID;
    let data = {
      ID: values?.ID || 0,
      MemberID: MemberID,
      CreateDate: values.CreateDate
        ? moment(values.CreateDate).format("YYYY-MM-DD HH:mm")
        : null,
    };
    data[isSuckMilk ? "Data3" : "Data2"] = JSON.stringify(values);

    updateMutation.mutate(
      {
        arr: [data],
      },
      {
        onSuccess: () => {
          f7.dialog.close();
          toast.success("Thêm mới thành công !", {
            position: toast.POSITION.TOP_CENTER,
            autoClose: 1000,
          });
          setVisible(false);

          onClose && onClose();
        },
      }
    );
  };

  const onDelete = () => {
    f7.dialog.confirm("Bạn có chắc chắn muốn xoá?", "Xác nhận", () => {
      f7.dialog.preloader("Đang thực hiện ...");
      deleteMutation.mutate(
        {
          delete: [item?.ID],
        },
        {
          onSuccess: () => {
            f7.dialog.close();
            toast.success("Xoá thành công !", {
              position: toast.POSITION.TOP_CENTER,
              autoClose: 1000,
            });
            setVisible(false);

            onClose && onClose();
          },
        }
      );
    });
  };

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
                }}
              >
                <Formik
                  initialValues={initialValues}
                  onSubmit={onSubmit}
                  enableReinitialize={true}
                  validationSchema={valiSchema}
                >
                  {(formikProps) => {
                    const {
                      values,
                      touched,
                      errors,
                      handleChange,
                      handleBlur,
                      setFieldValue,
                    } = formikProps;

                    return (
                      <Form
                        className="position-relative bg-white"
                        style={{
                          borderTopRightRadius: "20px",
                          borderTopLeftRadius: "20px",
                        }}
                      >
                        <div style={containerStyle}>
                          {isSuckMilk ? (
                            <>
                              {item?.ID > 0
                                ? "Chỉnh sửa giờ bú sữa"
                                : "Thêm giờ bú sữa"}
                            </>
                          ) : (
                            <>
                              {item?.ID > 0
                                ? "Chỉnh sửa giờ hút sữa"
                                : "Thêm giờ hút sữa"}
                            </>
                          )}

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
                        <div className="px-15px">
                          <div className="mb-15px last-mb-0">
                            <div className="mb-2px text-muted">Thời gian</div>
                            <div
                              className="d--f"
                              style={{
                                gap: "10px",
                              }}
                            >
                              <div
                                className="position-relative"
                                style={{
                                  width: "120px",
                                  height: "47px",
                                }}
                              >
                                <NumberFormat
                                  style={{
                                    border: "1px solid #E4E6EF",
                                    borderRadius: "5px",
                                    height: "47px",
                                    lineHeight: "47px",
                                    fontSize: "15px",
                                    fontWeight: 500,
                                  }}
                                  value={moment(values.CreateDate).format(
                                    "HH:mm"
                                  )}
                                  format={(val) => {
                                    if (!val) return "--:--";
                                    if (val.length <= 2) return val;
                                    return (
                                      val.slice(0, 2) + ":" + val.slice(2, 4)
                                    );
                                  }}
                                  allowEmptyFormatting
                                  placeholder="--:--"
                                  onValueChange={(values) => {
                                    const { value } = values;
                                    if (/^\d{4}$/.test(value)) {
                                      const hour = parseInt(
                                        value.substring(0, 2),
                                        10
                                      );
                                      const minute = parseInt(
                                        value.substring(2, 4),
                                        10
                                      );
                                      if (
                                        hour >= 0 &&
                                        hour <= 23 &&
                                        minute >= 0 &&
                                        minute <= 59
                                      ) {
                                        setFieldValue(
                                          "CreateDate",
                                          moment(values.CreateDate)
                                            .set({
                                              hour,
                                              minute,
                                              second: 0,
                                              millisecond: 0,
                                            })
                                            .toDate()
                                        );
                                      }
                                    }
                                  }}
                                  className="w-100 pl-12px d--f ai--c"
                                />
                                <div
                                  className="position-absolute h-100 top-0 right-0"
                                  style={{
                                    width: "48px",
                                    background: "rgb(229, 231, 239)",
                                    color: "rgb(114, 114, 114)",
                                    borderTopRightRadius: "5px",
                                    borderBottomRightRadius: "5px",
                                    overflow: "hidden",
                                  }}
                                >
                                  <PickerDate
                                    headerFormat="hh:mm"
                                    style={{
                                      flexGrow: "1",
                                    }}
                                    value={values.CreateDate}
                                    onChange={(val) => {
                                      setFieldValue("CreateDate", val);
                                    }}
                                    config={{
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
                                    }}
                                  >
                                    {({ open }) => (
                                      <div
                                        className="position-absolute w-100 h-100 top-0 left-0 d--f ai--c jc--c"
                                        style={{ zIndex: 2, cursor: "pointer" }}
                                        onClick={open}
                                      >
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          fill="none"
                                          viewBox="0 0 24 24"
                                          strokeWidth="1.5"
                                          stroke="currentColor"
                                          style={{ width: "20px" }}
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                                          />
                                        </svg>
                                      </div>
                                    )}
                                  </PickerDate>
                                </div>
                              </div>

                              <PickerDate
                                headerFormat="DD/MM/YYYY"
                                style={{
                                  flexGrow: "1",
                                }}
                                value={values.CreateDate}
                                onChange={(val) => {
                                  setFieldValue("CreateDate", val);
                                }}
                                config={{
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
                                }}
                              >
                                {({ open }) => (
                                  <div
                                    className="position-relative"
                                    onClick={open}
                                  >
                                    <div
                                      className="w-full pl-12px d--f ai--c"
                                      style={{
                                        border: "1px solid #E4E6EF",
                                        borderRadius: "5px",
                                        height: "45px",
                                        fontSize: "15px",
                                        fontWeight: 500,
                                      }}
                                    >
                                      {values.CreateDate ? (
                                        <span>
                                          {moment(values.CreateDate).format(
                                            "DD/MM/YYYY"
                                          )}
                                        </span>
                                      ) : (
                                        <span className="text-muted">
                                          Chọn thời gian
                                        </span>
                                      )}
                                    </div>
                                    <div
                                      className="d--f ai--c jc--c fw-500"
                                      style={{
                                        position: "absolute",
                                        top: 0,
                                        right: 0,
                                        background: "#e5e7ef",
                                        width: "45px",
                                        height: "100%",
                                        borderTopRightRadius: "5px",
                                        borderBottomRightRadius: "5px",
                                        color: "#727272",
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
                                          d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z"
                                        />
                                      </svg>
                                    </div>
                                  </div>
                                )}
                              </PickerDate>
                            </div>
                          </div>
                          <div className="mb-15px last-mb-0">
                            <div className="mb-2px text-muted">
                              {isSuckMilk ? "Bú bình" : "Ngực phải"}
                            </div>
                            <div className="position-relative">
                              <NumberFormat
                                name="LeftChest"
                                className="w-100 pl-12px"
                                value={values.LeftChest}
                                thousandSeparator={false}
                                placeholder="Nhập số lượng"
                                onValueChange={(val) => {
                                  setFieldValue(
                                    "LeftChest",
                                    typeof val.floatValue === "undefined"
                                      ? val?.value
                                      : val?.floatValue
                                  );
                                }}
                                style={{
                                  border:
                                    errors.LeftChest && touched.LeftChest
                                      ? "1px solid #F64E60"
                                      : "1px solid #E4E6EF",
                                  borderRadius: "5px",
                                  height: "45px",
                                  paddingRight: "50px",
                                  fontSize: "15px",
                                  fontWeight: 500,
                                }}
                              />
                              <div
                                className="d--f ai--c jc--c fw-500"
                                style={{
                                  position: "absolute",
                                  top: 0,
                                  right: 0,
                                  background: "#e5e7ef",
                                  width: "45px",
                                  height: "100%",
                                  borderTopRightRadius: "5px",
                                  borderBottomRightRadius: "5px",
                                  color: "#727272",
                                  pointerEvents: "none",
                                }}
                              >
                                ML
                              </div>
                            </div>
                          </div>
                          <div className="mb-15px last-mb-0">
                            <div className="mb-2px text-muted">
                              {isSuckMilk ? "Bú mẹ" : "Ngực trái"}
                            </div>
                            <div className="position-relative">
                              <NumberFormat
                                name="RightChest"
                                className="w-100 pl-12px"
                                value={values.RightChest}
                                thousandSeparator={false}
                                placeholder="Nhập số lượng"
                                onValueChange={(val) => {
                                  setFieldValue(
                                    "RightChest",
                                    typeof val.floatValue === "undefined"
                                      ? val?.value
                                      : val?.floatValue
                                  );
                                }}
                                style={{
                                  border:
                                    errors.RightChest && touched.RightChest
                                      ? "1px solid #F64E60"
                                      : "1px solid #E4E6EF",
                                  borderRadius: "5px",
                                  height: "45px",
                                  paddingRight: "50px",
                                  fontSize: "15px",
                                  fontWeight: 500,
                                }}
                              />
                              <div
                                className="d--f ai--c jc--c fw-500"
                                style={{
                                  position: "absolute",
                                  top: 0,
                                  right: 0,
                                  background: "#e5e7ef",
                                  width: "45px",
                                  height: "100%",
                                  borderTopRightRadius: "5px",
                                  borderBottomRightRadius: "5px",
                                  color: "#727272",
                                  pointerEvents: "none",
                                }}
                              >
                                ML
                              </div>
                            </div>
                          </div>
                          <div className="mb-15px last-mb-0">
                            <div className="mb-2px text-muted">Ghi chú</div>
                            <textarea
                              className="p-12px w-100"
                              style={{
                                border: "1px solid #E4E6EF",
                                borderRadius: "5px",
                                fontSize: "15px",
                                fontWeight: 500,
                              }}
                              name="Desc"
                              value={values.Desc}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              placeholder="Nhập ghi chú"
                              rows={4}
                            ></textarea>
                          </div>
                        </div>
                        <div className="p-15px d--f" style={{ gap: "12px" }}>
                          {item?.ID > 0 && (
                            <button
                              type="button"
                              className="btn-reviews bg-danger"
                              style={{
                                width: "100px",
                              }}
                              onClick={onDelete}
                            >
                              Xoá
                            </button>
                          )}

                          <button type="submit" className="btn-reviews">
                            {item?.ID ? "Lưu thay đổi" : "Thêm mới"}
                          </button>
                        </div>
                      </Form>
                    );
                  }}
                </Formik>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.getElementById("framework7-root")
      )}
    </>
  );
}

export default PickerAdd;
