import React, { useState } from "react";
import { Navbar, Page, f7 } from "framework7-react";
import axios from "axios";
import httpCommon from "../../service/http-common";
import {
  OPEN_QRCODE,
  SEND_TOKEN_FIREBASE,
  SET_BACKGROUND,
} from "../../constants/prom21";
import { toast } from "react-toastify";
import { Form, Formik } from "formik";
import * as Yup from "yup";
import { toAbsoluteUrl } from "../../constants/assetPath";
import { iOS } from "../../constants/helpers";
import DeviceHelpers from "../../constants/DeviceHelpers";
import { setSubscribe } from "../../constants/subscribe";
import { ref, set } from "firebase/database";
import { database } from "../../firebase/firebase";
import {
  setStockIDStorage,
  setStockNameStorage,
  setUserLoginStorage,
  setUserStorage,
} from "../../constants/user";
import userService from "../../service/user.service";

const brandSchema = Yup.object().shape({
  Domain: Yup.string()
    .matches(
      /((https?):\/\/)?(www.)?[a-z0-9]+(\.[a-z]{2,}){1,3}(#?\/?[a-zA-Z0-9#]+)*\/?(\?[a-zA-Z0-9-_]+=[a-zA-Z0-9-%]+&?)?$/,
      "Tên miền không hợp lệ"
    )
    .required("Vui lòng nhập mật tên miền."),
});

const FormSubmit = ({ onQRDomain, onSubmit }) => {
  const [inititalValues, setInititalValues] = useState({ Domain: "" });
  return (
    <Formik
      initialValues={inititalValues}
      onSubmit={onSubmit}
      enableReinitialize={true}
      validationSchema={brandSchema}
    >
      {(formikProps) => {
        const { values, touched, errors, handleChange, handleBlur } =
          formikProps;

        return (
          <Form className="h-100">
            <div className="h-100 bg-white d--f fd--c jc--sb">
              <div className="position-relative">
                <img
                  src={toAbsoluteUrl("/app2021/images/map-app.jpg")}
                  alt="Maps"
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="var(--ezs-color)"
                  style={{
                    width: "60px",
                    position: "absolute",
                    top: "40%",
                    left: "50%",
                    transform: "translateX(-50%) translateY(-50%)",
                  }}
                >
                  <path
                    fillRule="evenodd"
                    d="m11.54 22.351.07.04.028.016a.76.76 0 0 0 .723 0l.028-.015.071-.041a16.975 16.975 0 0 0 1.144-.742 19.58 19.58 0 0 0 2.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 0 0-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 0 0 2.682 2.282 16.975 16.975 0 0 0 1.145.742ZM12 13.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                    clipRule="evenodd"
                  />
                </svg>
                <div
                  style={{
                    backgroundImage: "linear-gradient(#fff6ef, #fff)",
                    height: "30px",
                    marginTop: "-2px",
                  }}
                ></div>
              </div>
              <div className="p-20px">
                <div className="mb-15px">
                  <div
                    className="mb-3px"
                    style={{
                      color: "rgb(120, 120, 120)",
                    }}
                  >
                    Tên miền chi nhánh
                  </div>
                  <input
                    name="Domain"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    style={{
                      fontSize: "15px",
                      width: "100%",
                      border:
                        errors.Domain && touched.Domain
                          ? "1px solid #F64E60"
                          : "1px solid #e8e8e8",
                      height: "50px",
                      borderRadius: ".125rem",
                      padding: "0 15px",
                    }}
                    type="text"
                    placeholder="Nhập tên miền chi nhánh (***.**)"
                  />
                  {errors.Domain && touched.Domain && (
                    <div
                      className="text-danger mt-5px"
                      style={{ fontSize: "13px" }}
                    >
                      {errors.Domain}
                    </div>
                  )}
                </div>
                <div>
                  <button
                    type="submit"
                    className="text-white fw-500"
                    style={{
                      fontSize: "15px",
                      height: "50px",
                      borderRadius: ".125rem",
                      padding: "0 15px",
                      background: "var(--ezs-color)",
                      border: "1px solid var(--ezs-color)",
                      textTransform: "uppercase",
                    }}
                  >
                    Tiếp tục
                  </button>
                </div>
                <div className="text-center position-relative my-20px">
                  <div
                    className="position-absolute w-100"
                    style={{
                      height: "1px",
                      top: "10px",
                      left: "0px",
                      background: "#e8e8e8",
                    }}
                  ></div>
                  <span
                    className="bg-white position-relative px-15px"
                    style={{
                      color: "rgb(120, 120, 120)",
                      fontSize: "13px",
                    }}
                  >
                    Hoặc tiếp tục bằng
                  </span>
                </div>
                <div className="d--f jc--c">
                  <div
                    className="d--f jc--c ai--c"
                    style={{
                      background: "var(--ezs-color)",
                      width: "60px",
                      height: "60px",
                      borderRadius: "100%",
                      boxShadow: "rgba(0, 0, 0, 0.2) 0px 4px 16px 0px",
                      cursor: "pointer",
                    }}
                    onClick={() => onQRDomain()}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="#fff"
                      style={{
                        width: "30px",
                      }}
                    >
                      <path
                        fillRule="evenodd"
                        d="M3 4.875C3 3.839 3.84 3 4.875 3h4.5c1.036 0 1.875.84 1.875 1.875v4.5c0 1.036-.84 1.875-1.875 1.875h-4.5A1.875 1.875 0 0 1 3 9.375v-4.5ZM4.875 4.5a.375.375 0 0 0-.375.375v4.5c0 .207.168.375.375.375h4.5a.375.375 0 0 0 .375-.375v-4.5a.375.375 0 0 0-.375-.375h-4.5Zm7.875.375c0-1.036.84-1.875 1.875-1.875h4.5C20.16 3 21 3.84 21 4.875v4.5c0 1.036-.84 1.875-1.875 1.875h-4.5a1.875 1.875 0 0 1-1.875-1.875v-4.5Zm1.875-.375a.375.375 0 0 0-.375.375v4.5c0 .207.168.375.375.375h4.5a.375.375 0 0 0 .375-.375v-4.5a.375.375 0 0 0-.375-.375h-4.5ZM6 6.75A.75.75 0 0 1 6.75 6h.75a.75.75 0 0 1 .75.75v.75a.75.75 0 0 1-.75.75h-.75A.75.75 0 0 1 6 7.5v-.75Zm9.75 0A.75.75 0 0 1 16.5 6h.75a.75.75 0 0 1 .75.75v.75a.75.75 0 0 1-.75.75h-.75a.75.75 0 0 1-.75-.75v-.75ZM3 14.625c0-1.036.84-1.875 1.875-1.875h4.5c1.036 0 1.875.84 1.875 1.875v4.5c0 1.035-.84 1.875-1.875 1.875h-4.5A1.875 1.875 0 0 1 3 19.125v-4.5Zm1.875-.375a.375.375 0 0 0-.375.375v4.5c0 .207.168.375.375.375h4.5a.375.375 0 0 0 .375-.375v-4.5a.375.375 0 0 0-.375-.375h-4.5Zm7.875-.75a.75.75 0 0 1 .75-.75h.75a.75.75 0 0 1 .75.75v.75a.75.75 0 0 1-.75.75h-.75a.75.75 0 0 1-.75-.75v-.75Zm6 0a.75.75 0 0 1 .75-.75h.75a.75.75 0 0 1 .75.75v.75a.75.75 0 0 1-.75.75h-.75a.75.75 0 0 1-.75-.75v-.75ZM6 16.5a.75.75 0 0 1 .75-.75h.75a.75.75 0 0 1 .75.75v.75a.75.75 0 0 1-.75.75h-.75a.75.75 0 0 1-.75-.75v-.75Zm9.75 0a.75.75 0 0 1 .75-.75h.75a.75.75 0 0 1 .75.75v.75a.75.75 0 0 1-.75.75h-.75a.75.75 0 0 1-.75-.75v-.75Zm-3 3a.75.75 0 0 1 .75-.75h.75a.75.75 0 0 1 .75.75v.75a.75.75 0 0 1-.75.75h-.75a.75.75 0 0 1-.75-.75v-.75Zm6 0a.75.75 0 0 1 .75-.75h.75a.75.75 0 0 1 .75.75v.75a.75.75 0 0 1-.75.75h-.75a.75.75 0 0 1-.75-.75v-.75Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </Form>
        );
      }}
    </Formik>
  );
};

export default class Report extends React.Component {
  constructor() {
    super();
    this.state = {};
  }

  componentDidMount() {}

  onSubmit = (values, { resetForm, setFieldError }) => {
    f7.dialog.preloader("Đang thực hiện ...");

    let Domain =
      "https://" +
      values.Domain.replaceAll("https://", "").replaceAll("http://", "");
    axios
      .get(Domain + "/brand/global/Global.json")
      .then(({ data }) => {
        if (data && data.APP && data.APP.Css) {
          for (const key in data.APP.Css) {
            document.documentElement.style.setProperty(key, data.APP.Css[key]);
          }
        }
        SET_BACKGROUND(data?.APP?.Css["--ezs-color"] + ";0");

        if (data.APP.FontSize && data.APP.FontSize.length > 0) {
          for (let key of data.APP.FontSize) {
            document.documentElement.style.setProperty(key.name, key.size);
          }
        }

        window.GlobalConfig = data;

        window.SERVER = Domain;

        httpCommon.defaults.baseURL = Domain;

        localStorage.setItem("DOMAIN", Domain);
        localStorage.setItem("GlobalConfig", JSON.stringify(data));

        resetForm();

        f7.dialog.close();
        f7.views.main.router.navigate("/");
      })
      .catch(() => {
        f7.dialog.close();
        setFieldError("Domain", "Tên miền không hợp lệ.");
      });
  };

  onQRDomain = () => {
    OPEN_QRCODE().then((value) => {
      f7.dialog.preloader("Đang thực hiện ...");

      let QRValue = value?.data || "";
      let QRSplit = QRValue.split('"');

      let QRToken = "";
      let QRStocks = "";

      if (iOS()) {
        QRValue = QRSplit[1];
      }

      let QRDomain =
        "https://" +
        QRValue.split("&")[0]
          .replaceAll("https://", "")
          .replaceAll("http://", "");

      if (QRValue.split("&").length > 1) {
        QRToken = QRValue.split("&")[0];
        QRStocks = QRValue.split("&")[1];
        QRDomain = QRValue.split("&")[2];
      }
      
      axios
        .get(QRDomain + "/brand/global/Global.json")
        .then(({ data }) => {
          let datars = data;

          httpCommon.defaults.baseURL = QRDomain;

          if (QRToken && QRStocks) {
            DeviceHelpers.get({
              success: ({ deviceId }) => {
                userService.QRCodeLogin(QRToken, deviceId).then(({ data }) => {
                  if (data.error || data?.Status === -1) {
                    if (data.error === "Thiết bị chưa được cấp phép") {
                      f7.dialog.close();
                      f7.dialog.alert(
                        "Tài khoản của bạn đang đăng nhập tại thiết bị khác."
                      );
                    } else {
                      toast.error(
                        data?.Status === -1
                          ? "Tài khoản của bạn đã bị vô hiệu hoá."
                          : "Mã QR Code không hợp lệ hoặc đã hết hạn.",
                        {
                          position: toast.POSITION.TOP_LEFT,
                          autoClose: 3000,
                        }
                      );
                      f7.dialog.close();
                    }
                    httpCommon.defaults.baseURL = window?.SERVER || window.location.origin
                  } else {
                    setUserStorage(data.token, data);
                    data?.ByStockID && setStockIDStorage(data.ByStockID);
                    data?.StockName && setStockNameStorage(data.StockName);
                    SEND_TOKEN_FIREBASE().then(async ({ error, Token }) => {
                      if (!error && Token) {
                        userService
                          .authSendTokenFirebase({
                            Token: Token,
                            ID: data.ID,
                            Type: data.acc_type,
                          })
                          .then(() => {
                            set(
                              ref(database, `/qrcode/${QRStocks}/${QRToken}`),
                              null
                            ).then(() => {
                              if (data?.acc_type === "M") {
                                setUserLoginStorage(data?.MobilePhone, null);
                              }
                              this.setGlobal({ data: datars, QRDomain });
                              f7.dialog.close();
                              f7.views.main.router.navigate("/", {
                                animate: true,
                                transition: "f7-flip",
                              });
                            });
                          });
                      } else {
                        setSubscribe(data, () => {
                          set(
                            ref(
                              database,
                              `/qrcode/${qrcodeStock}/${qrcodeLogin}`
                            ),
                            null
                          ).then(() => {
                            this.setGlobal({ data: datars, QRDomain });
                            f7.dialog.close();
                            f7.views.main.router.navigate("/", {
                              animate: true,
                              transition: "f7-flip",
                            });
                          });
                        });
                      }
                    });
                  }
                });
              },
            });
          } else {
            this.setGlobal({ data: datars, QRDomain });
            f7.dialog.close();
            f7.views.main.router.navigate("/");
          }
        })
        .catch(() => {
          f7.dialog.close();
          toast.error("Tên miền không hợp lệ.");

          httpCommon.defaults.baseURL = window?.SERVER || window.location.origin
        });
    });
  };

  setGlobal = ({ data, QRDomain }) => {
    if (data && data.APP && data.APP.Css) {
      for (const key in data.APP.Css) {
        document.documentElement.style.setProperty(key, data.APP.Css[key]);
      }
    }
    SET_BACKGROUND(data?.APP?.Css["--ezs-color"] + ";0");

    if (data.APP.FontSize && data.APP.FontSize.length > 0) {
      for (let key of data.APP.FontSize) {
        document.documentElement.style.setProperty(key.name, key.size);
      }
    }

    window.GlobalConfig = data;

    window.SERVER = QRDomain;

    httpCommon.defaults.baseURL = QRDomain;

    localStorage.setItem("DOMAIN", QRDomain);
    localStorage.setItem("GlobalConfig", data);
  };

  // QRDebug = () => {
  //   let val = "38685-83229028906225068177&11409&https://cserbeauty.com";
  //   f7.dialog.preloader("Đang thực hiện ...");

  //   let QRValue = val;

  //   let QRToken = "";
  //   let QRStocks = "";

  //   let QRDomain =
  //     "https://" +
  //     QRValue.split("&")[0]
  //       .replaceAll("https://", "")
  //       .replaceAll("http://", "");

  //   if (QRValue.split("&").length > 1) {
  //     QRToken = QRValue.split("&")[0];
  //     QRStocks = QRValue.split("&")[1];
  //     QRDomain = QRValue.split("&")[2];
  //   }

  //   axios
  //     .get(QRDomain + "/brand/global/Global.json")
  //     .then(({ data }) => {
  //       let datars = data;
  //       if (QRToken && QRStocks) {
  //         DeviceHelpers.get({
  //           success: ({ deviceId }) => {
  //             userService.QRCodeLogin(QRToken, deviceId).then(({ data }) => {
  //               if (data.error || data?.Status === -1) {
  //                 if (data.error === "Thiết bị chưa được cấp phép") {
  //                   f7.dialog.close();
  //                   f7.dialog.alert(
  //                     "Tài khoản của bạn đang đăng nhập tại thiết bị khác."
  //                   );
  //                 } else {
  //                   toast.error(
  //                     data?.Status === -1
  //                       ? "Tài khoản của bạn đã bị vô hiệu hoá."
  //                       : "Mã QR Code không hợp lệ hoặc đã hết hạn.",
  //                     {
  //                       position: toast.POSITION.TOP_LEFT,
  //                       autoClose: 3000,
  //                     }
  //                   );
  //                   f7.dialog.close();
  //                 }
  //               } else {
  //                 setUserStorage(data.token, data);
  //                 data?.ByStockID && setStockIDStorage(data.ByStockID);
  //                 data?.StockName && setStockNameStorage(data.StockName);
  //                 SEND_TOKEN_FIREBASE().then(async ({ error, Token }) => {
  //                   if (!error && Token) {
  //                     userService
  //                       .authSendTokenFirebase({
  //                         Token: Token,
  //                         ID: data.ID,
  //                         Type: data.acc_type,
  //                       })
  //                       .then(() => {
  //                         set(
  //                           ref(database, `/qrcode/${QRStocks}/${QRToken}`),
  //                           null
  //                         ).then(() => {
  //                           if (data?.acc_type === "M") {
  //                             setUserLoginStorage(data?.MobilePhone, null);
  //                           }
  //                           this.setGlobal({ data: datars, QRDomain });
  //                           f7.dialog.close();
  //                           f7.views.main.router.navigate("/", {
  //                             animate: true,
  //                             transition: "f7-flip",
  //                           });
  //                         });
  //                       });
  //                   } else {
  //                     setSubscribe(data, () => {
  //                       set(
  //                         ref(
  //                           database,
  //                           `/qrcode/${qrcodeStock}/${qrcodeLogin}`
  //                         ),
  //                         null
  //                       ).then(() => {
  //                         this.setGlobal({ data: datars, QRDomain });
  //                         f7.dialog.close();
  //                         f7.views.main.router.navigate("/", {
  //                           animate: true,
  //                           transition: "f7-flip",
  //                         });
  //                       });
  //                     });
  //                   }
  //                 });
  //               }
  //             });
  //           },
  //         });
  //       } else {
  //         this.setGlobal({ data, QRDomain });
  //         f7.dialog.close();
  //         f7.views.main.router.navigate("/");
  //       }
  //     })
  //     .catch(() => {
  //       f7.dialog.close();
  //       toast.error("Tên miền không hợp lệ.");
  //     });
  // };

  render() {
    return (
      <Page name="employee-service">
        <Navbar>
          <div className="page-navbar">
            <div className="page-navbar__back"></div>
            <div className="page-navbar__title">
              <span className="title">Chọn chi nhánh gần bạn</span>
            </div>
            <div className="page-navbar__noti"></div>
          </div>
        </Navbar>
        <FormSubmit onQRDomain={this.onQRDomain} onSubmit={this.onSubmit} />
      </Page>
    );
  }
}
