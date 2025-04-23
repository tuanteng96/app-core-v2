import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence } from "framer-motion";
import { getStockIDStorage, getUser } from "../../../constants/user";
import { Form, Formik } from "formik";
import * as Yup from "yup";
import NumberFormat from "react-number-format";
import { toast } from "react-toastify";
import BookDataService from "../../../service/book.service";
import { useMutation } from "react-query";
import { f7 } from "framework7-react";

function PickerConfirm({ children, initialValue }) {
  const [visible, setVisible] = useState(false);

  const [initialValues, setInitialValues] = useState({
    Fullname: "",
    Phone: "",
  });
  const userInfo = getUser();

  useEffect(() => {
    setInitialValues((prevState) => ({
      ...prevState,
      Fullname: userInfo?.FullName || "",
      Phone: userInfo?.MobilePhone || "",
      Content: "Cần tư vấn " + initialValue?.Title,
    }));
  }, [initialValue]);

  const sendSchema = Yup.object().shape({
    Fullname: Yup.string().required("Vui lòng nhập."),
    Phone: Yup.string().required("Vui lòng nhập."),
  });

  const close = () => {
    setVisible(false);
  };

  const updateMutation = useMutation({
    mutationFn: (body) => BookDataService.bookContact(body),
  });

  const onSubmit = (values) => {
    let StockID = getStockIDStorage();
    if (!StockID) {
      toast.error("Vui lòng chọn cơ sở !", {
        position: toast.POSITION.TOP_CENTER,
        autoClose: 1000,
      });
    } else {
      var p = {
        contact: {
          Fullname: values.Fullname,
          Phone1: values.Phone,
          Address: "",
          Email: "",
          Content: values.Content,
        },
      };

      updateMutation.mutate(p, {
        onSuccess: () => {
          toast.success("Đặt lịch thành công !", {
            position: toast.POSITION.TOP_CENTER,
            autoClose: 1000,
          });
          close();
        },
      });
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={onSubmit}
      enableReinitialize={true}
      validationSchema={sendSchema}
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
          <>
            {children({
              open: () => setVisible(true),
              close: close,
            })}

            {visible &&
              createPortal(
                <AnimatePresence exitBeforeEnter>
                  <Form
                    className="dialog-confirm show"
                    style={{
                      height: "100%",
                      visibility: "visible",
                      opacity: "1",
                    }}
                  >
                    <div className="bg" onClick={close}></div>
                    <div className="content">
                      <div className="text">
                        <h4>{initialValue?.Title}</h4>
                        {!userInfo && (
                          <div className="dialog-confirm-form">
                            <input
                              className={`dialog-confirm-input ${
                                errors.Fullname && touched.Fullname
                                  ? "is-invalid solid-invalid"
                                  : ""
                              }`}
                              type="text"
                              placeholder="Họ và tên"
                              name="Fullname"
                              value={values.Fullname}
                              onChange={handleChange}
                              onBlur={handleBlur}
                            />
                            <NumberFormat
                              className={`dialog-confirm-input ${
                                errors.Phone && touched.Phone
                                  ? "is-invalid solid-invalid"
                                  : ""
                              }`}
                              value={values.Phone}
                              thousandSeparator={false}
                              placeholder="Số điện thoại"
                              onValueChange={(val) => {
                                setFieldValue(
                                  "Phone",
                                  val.floatValue ? val.floatValue : val.value
                                );
                              }}
                              allowLeadingZeros={true}
                            />
                          </div>
                        )}
                      </div>
                      <div className="dialog-buttons">
                        <div className="dialog-button" onClick={close}>
                          Đóng
                        </div>
                        <div className="dialog-button dialog-button-bold">
                          <button
                            type="submit"
                            disabled={updateMutation?.isLoading}
                          >
                            {updateMutation.isLoading
                              ? "Đang gửi ..."
                              : "Gửi liên hệ"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </Form>
                </AnimatePresence>,
                document.getElementById("framework7-root")
              )}
          </>
        );
      }}
    </Formik>
  );
}

export default PickerConfirm;
