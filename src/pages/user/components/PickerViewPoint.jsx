import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";
import { SERVER_APP } from "../../../constants/config";
import { checkImageProduct } from "../../../constants/format";
import { f7 } from "framework7-react";
import UserService from "../../../service/user.service";
import { getUser } from "../../../constants/user";
import { toast } from "react-toastify";

function PickerViewPoint({ children, data, disabled, refetch }) {
  const [visible, setVisible] = useState(false);

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

  const alertPoint = () => {
    f7.dialog
      .create({
        title: "Bạn đã đổi quà thành công.",
        buttons: [
          {
            text: "Quản lý Voucher",
            cssClass: "dialog-button-apply",
            onClick: function () {
              close();
              f7.views.main.router.navigate("/voucher/");
            },
          },
          {
            text: "Đóng",
            cssClass: "dialog-button-cancel",
            close: true,
          },
        ],
        // thêm nút đóng riêng biệt (ở góc trên cùng)
        closeButton: true,
        // custom title close text
        destroyOnClose: true,
      })
      .open();
  };

  const onChange = () => {
    f7.dialog.confirm(
      `Bạn có chắc chắn muốn đổi voucher <strong>${data?.Title}</strong> với <strong>${data?.Point} điểm</strong>?`,
      () => {
        f7.dialog.preloader("Đang xử lý...");
        const member = getUser();
        if (!member) return false;
        const memberid = member.ID;
        let dataPost = {
          MemberID: memberid,
          GiftID: data?.ID,
          Voucher: null,
        };
        if (data?.Data) {
          dataPost.Voucher = {
            ...data.Data,
            ForCates: data.Data?.ForCates
              ? data.Data?.ForCates.map((x) => x.ID).toString()
              : "",
            ForProds: data.Data?.ForProds
              ? data.Data?.ForProds.map((x) => x.ID).toString()
              : "",
          };
        }
        UserService.changePointVoucher(dataPost)
          .then((rs) => {
            if (rs.data.mp) {
              if (refetch) {
                refetch(
                  {
                    Pi: 1,
                    Ps: 20,
                  },
                  () => {
                    f7.dialog.close();
                    close();
                    alertPoint();
                  }
                );
              } else {
                f7.dialog.close();
                close();
                alertPoint();
              }
            } else {
              toast.error(rs?.data?.error || "Đổi voucher không thành công");
            }
          })
          .catch((er) => {
            console.log(er);
          });
      }
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
                >
                  <div>
                    <img
                      className="w-100"
                      src={checkImageProduct(data?.Photo)}
                      onClick={() => {
                        Fancybox.show(
                          [
                            {
                              src: checkImageProduct(data?.Photo),
                              thumbSrc: checkImageProduct(data?.Photo),
                            },
                          ],
                          {
                            Carousel: {
                              Toolbar: {
                                items: {
                                  downloadImage: {
                                    tpl: '<button class="f-button"><svg tabindex="-1" width="24" height="24" viewBox="0 0 24 24"><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2M7 11l5 5 5-5M12 4v12"></path></svg></button>',
                                    click: () => {
                                      OPEN_LINK(checkImageProduct(data?.Photo));
                                    },
                                  },
                                },
                                display: {
                                  left: ["counter"],
                                  middle: [
                                    "zoomIn",
                                    "zoomOut",
                                    // "toggle1to1",
                                    "rotateCCW",
                                    "rotateCW",
                                    // "flipX",
                                    // "flipY",
                                  ],
                                  right: [
                                    "downloadImage",
                                    //"thumbs",
                                    "close",
                                  ],
                                },
                              },
                            },
                            startIndex: 0, //index
                          }
                        );
                      }}
                    />
                  </div>
                  <div className="p-15px">
                    <div
                      className="pb-12px mb-12px"
                      style={{
                        borderBottom: "1px solid #eeeeee",
                      }}
                    >
                      <div
                        className="fw-500 mb-5px text-uppercase"
                        style={{
                          fontSize: "15px",
                        }}
                      >
                        {data?.Title}
                      </div>
                      <div className="text-danger fw-500">
                        {data?.Point} điểm
                      </div>
                    </div>
                    <div
                      className="content_"
                      dangerouslySetInnerHTML={{
                        __html: fixedContentDomain(data?.Desc),
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
                        __html: fixedContentDomain(data.Detail),
                      }}
                      style={{
                        fontSize: "15px",
                        lineHeight: "24px",
                        color: "#3c3c3c",
                      }}
                    ></div>
                  </div>
                </div>
                <div
                  className="p-15px"
                  style={{
                    display: "flex",
                    gap: "12px",
                  }}
                >
                  <div
                    style={{
                      width: "50px",
                    }}
                  >
                    <button
                      type="button"
                      className="btn-submit-order btn-submit-order rounded"
                      onClick={close}
                      style={{
                        background: "transparent",
                        border: "1px solid #d3d3d3",
                        minHeight: "48px",
                        color: "#222",
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
                          d="M15.75 19.5 8.25 12l7.5-7.5"
                        />
                      </svg>
                    </button>
                  </div>
                  <div
                    style={{
                      flexGrow: "1",
                    }}
                  >
                    <button
                      onClick={onChange}
                      className="btn-submit-order btn-submit-order rounded"
                      type="button"
                      style={{
                        minHeight: "48px",
                        opacity: disabled ? 0.5 : 1,
                      }}
                      disabled={disabled}
                    >
                      <span>{disabled ? "Không đủ điểm" : "Đổi Quà"}</span>
                    </button>
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

export default PickerViewPoint;
