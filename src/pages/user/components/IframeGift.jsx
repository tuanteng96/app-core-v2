import React, { useEffect, useRef, useState } from "react";
import Dom7 from "dom7";
import IframeComm from "react-iframe-comm";
import { getStockIDStorage, getUser } from "../../../constants/user";
import { SERVER_APP } from "../../../constants/config";
import { toAbsoluteUrl } from "../../../constants/assetPath";
import clsx from "clsx";
import PrizePicker from "./PickerPrize";
import { useMutation, useQuery } from "react-query";
import NewsDataService from "../../../service/news.service";
import axios from "axios";
import { toast } from "react-toastify";
import { getRandomItemByPercentage } from "../../../constants/helpers";
import moment from "moment";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";

var colors = new Array(
  [94, 114, 228],
  [130, 94, 228],
  [45, 206, 137],
  [45, 206, 204],
  [17, 205, 239],
  [17, 113, 239],
  [245, 54, 92],
  [245, 96, 54]
);

var step = 0;
var colorIndices = [0, 1, 2, 3];
var gradientSpeed = 0.002;

function SpinnerLoading({ size = 80, color = "#fff" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 50 50"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        animation: "spin 1s linear infinite",
      }}
    >
      <circle
        cx="25"
        cy="25"
        r="20"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray="100"
        strokeDashoffset="60"
      />
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </svg>
  );
}

function WinnerModal({ data, prize, onClose, params }) {
  useEffect(() => {
    if (prize) {
      // Tìm hoặc tạo canvas confetti
      let canvas = document.querySelector("canvas.confetti-canvas");
      if (!canvas) {
        canvas = document.createElement("canvas");
        canvas.className = "confetti-canvas";
        canvas.style.position = "fixed";
        canvas.style.top = "0";
        canvas.style.left = "0";
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        canvas.style.pointerEvents = "none";
        canvas.style.zIndex = "20000";
        document.body.appendChild(canvas);
      }

      const myConfetti = confetti.create(canvas, { resize: true });

      const interval = setInterval(() => {
        myConfetti({
          particleCount: 50,
          startVelocity: 40,
          spread: 70,
          origin: { x: Math.random(), y: Math.random() - 0.2 },
        });
      }, 400); // mỗi 0.4s bắn 1 loạt

      // cleanup khi prize thay đổi hoặc về null
      return () => clearInterval(interval);
    }
  }, [prize]);

  return createPortal(
    <AnimatePresence>
      {Boolean(prize) && (
        <div>
          {/* Overlay */}
          <motion.div
            className="position-fixed w-100 h-100 top-0 left-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              zIndex: 10000,
              background: "rgb(0 0 0 / 85%)",
            }}
            onClick={onClose}
          />

          <div
            className="position-fixed w-100 h-100 top-0 left-0 d--f fd--c ai--c jc--c"
            style={{
              zIndex: 10001,
            }}
          >
            <motion.div
              initial={{ scale: 0.7, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{
                duration: 0.35,
                ease: [0.34, 1.56, 0.64, 1],
              }}
            >
              <div
                style={{
                  position: "absolute",
                  opacity: ".85",
                  width: "3rem",
                  height: "3rem",
                  top: ".5rem",
                  right: ".5rem",
                }}
                className="d--f ai--c jc--c text-white"
                onClick={onClose}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                  data-slot="icon"
                  style={{
                    width: "2.25rem",
                  }}
                >
                  <path
                    fillRule="evenodd"
                    d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>

              <div className="d--f jc--c">
                <div className="animate-bounce2">
                  <img
                    src={toAbsoluteUrl(
                      "/brand/minigame/assets/lucky-gift-box/top.png"
                    )}
                    alt=""
                    style={{
                      maxWidth: "300px",
                    }}
                  />
                </div>
              </div>
              <div className="d--f jc--c fd--c text-center ai--c mt-5px">
                <div className="text-white fw-500 mb-5px">Bạn nhận được</div>
                <div
                  className="bg-white fw-600 text-center position-relative bz-bb"
                  style={{
                    textTransform: "uppercase",
                    width: 200,
                    padding: "1.5rem 1.25rem 1.25rem 1.25rem ",
                    borderRadius: ".5rem",
                    fontSize: "16px",
                    lineHeight: "25px",
                    color: "#fd9426",
                  }}
                >
                  {prize?.option}
                  <div
                    style={{
                      borderRadius: "100%",
                      background: "rgb(0 0 0 / 90%)",
                      width: "1rem",
                      height: "1rem",
                      left: "1.75rem",
                      top: "-.5rem",
                      position: "absolute",
                    }}
                  ></div>
                  <div
                    style={{
                      borderRadius: "100%",
                      background: "rgb(0 0 0 / 90%)",
                      width: "1rem",
                      height: "1rem",
                      right: "1.75rem",
                      top: "-.5rem",
                      position: "absolute",
                    }}
                  ></div>
                  <div
                    style={{
                      borderRadius: "100%",
                      background: "rgb(0 0 0 / 90%)",
                      width: "1rem",
                      height: "1rem",
                      left: "1.75rem",
                      bottom: "-.5rem",
                      position: "absolute",
                    }}
                  ></div>
                  <div
                    style={{
                      borderRadius: "100%",
                      background: "rgb(0 0 0 / 90%)",
                      width: "1rem",
                      height: "1rem",
                      right: "1.75rem",
                      bottom: "-.5rem",
                      position: "absolute",
                    }}
                  ></div>
                </div>
              </div>
              <div className="position-relative d--f jc--c">
                <img
                  src={toAbsoluteUrl(
                    "/brand/minigame/assets/lucky-gift-box/bottom.png"
                  )}
                  alt=""
                  style={{
                    maxWidth: "300px",
                  }}
                />
                <div
                  className="position-absolute bg-white fw-600"
                  style={{
                    padding: ".5rem 1rem",
                    borderRadius: ".25rem",
                    overflow: "hidden",
                    bottom: 0,
                    color: "#fd9426",
                    fontSize: "14px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    whiteSpace: "nowrap",
                  }}
                >
                  HSD :
                  <span className="pl-5px">
                    {moment(
                      data?.ExpiredDate || params?.EndDate,
                      "DD-MM-YYYY",
                      true
                    ).isValid()
                      ? moment(params?.EndDate, "DD-MM-YYYY")
                          .set({
                            hours: "23",
                            minutes: "59",
                          })
                          .format("DD-MM-YYYY")
                      : moment()
                          .set({
                            hours: "23",
                            minutes: "59",
                          })
                          .add(
                            Number(data?.ExpiredDate || params?.EndDate || 7),
                            "days"
                          )
                          .format("DD-MM-YYYY")}
                  </span>
                  <div
                    style={{
                      borderRadius: "100%",
                      background: "rgb(0 0 0 / 90%)",
                      width: ".75rem",
                      height: ".75rem",
                      left: "-.375rem",
                      top: "50%",
                      transform: "translateY(-50%)",
                      position: "absolute",
                    }}
                  ></div>
                  <div
                    style={{
                      borderRadius: "100%",
                      background: "rgb(0 0 0 / 90%)",
                      width: ".75rem",
                      height: ".75rem",
                      right: "-.375rem",
                      top: "50%",
                      transform: "translateY(-50%)",
                      position: "absolute",
                    }}
                  ></div>
                </div>
              </div>
              <div
                className="text-white text-center"
                style={{
                  padding: "0 1.25rem",
                  marginTop: "1.5rem",
                }}
              >
                {data?.copyrightWinner}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>,
    document.getElementById("framework7-root")
  );
}

function IframeGift({ f7, params }) {
  const [open, setOpen] = useState(false);
  const [background, setBackground] = useState({
    webkit: "",
    moz: "",
  });
  const [winnerPrize, setWinnerPrize] = useState(null);

  const audioRef = useRef(
    typeof Audio !== "undefined"
      ? new Audio(
          toAbsoluteUrl("/brand/minigame/assets/lucky-gift-box/mp3/gift.mp3")
        )
      : null
  );
  const winerSound = useRef(
    new Audio(
      toAbsoluteUrl("/brand/minigame/assets/lucky-gift-box/mp3/gift-winner.mp3")
    )
  );

  // useEffect(() => {
  //   var $ = Dom7;
  //   if ($(".dialog-preloader").length === 0) {
  //     f7.dialog.preloader("Đang tải hộp quà ... ");
  //   }
  // }, []);

  function updateGradient() {
    var c0_0 = colors[colorIndices[0]];
    var c0_1 = colors[colorIndices[1]];
    var c1_0 = colors[colorIndices[2]];
    var c1_1 = colors[colorIndices[3]];

    var istep = 1 - step;
    var r1 = Math.round(istep * c0_0[0] + step * c0_1[0]);
    var g1 = Math.round(istep * c0_0[1] + step * c0_1[1]);
    var b1 = Math.round(istep * c0_0[2] + step * c0_1[2]);
    var color1 = "rgb(" + r1 + "," + g1 + "," + b1 + ")";

    var r2 = Math.round(istep * c1_0[0] + step * c1_1[0]);
    var g2 = Math.round(istep * c1_0[1] + step * c1_1[1]);
    var b2 = Math.round(istep * c1_0[2] + step * c1_1[2]);
    var color2 = "rgb(" + r2 + "," + g2 + "," + b2 + ")";

    setBackground({
      webkit:
        "-webkit-gradient(linear, left top, right top, from(" +
        color1 +
        "), to(" +
        color2 +
        "))",
      moz: "-moz-linear-gradient(left, " + color1 + " 0%, " + color2 + " 100%)",
    });

    step += gradientSpeed;
    if (step >= 1) {
      step %= 1;
      colorIndices[0] = colorIndices[1];
      colorIndices[2] = colorIndices[3];
      colorIndices[1] =
        (colorIndices[1] +
          Math.floor(1 + Math.random() * (colors.length - 1))) %
        colors.length;
      colorIndices[3] =
        (colorIndices[3] +
          Math.floor(1 + Math.random() * (colors.length - 1))) %
        colors.length;
    }
  }

  useEffect(() => {
    const intervalId = setInterval(updateGradient, 50);

    return () => {
      clearInterval(intervalId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { data, refetch, isLoading } = useQuery({
    queryKey: ["GiftJson"],
    queryFn: async () => {
      let rs = null;

      let { data: dataRs } = await NewsDataService.getNewsIdCate(11609);

      let newDataRs = dataRs.data
        ? dataRs.data.filter((x) => x?.source?.IsPublic)
        : [];
      if (newDataRs && newDataRs.length > 0) {
        if (newDataRs[0].source?.Content) {
          rs = newDataRs[0].source?.Content
            ? {
                ...JSON.parse(newDataRs[0].source?.Content),
                Name: newDataRs[0]?.text.split(";")?.[2],
              }
            : null;
        }
      }
      if (!rs) {
        let { data } = await axios.get(
          toAbsoluteUrl("/brand/minigame/assets/json/prize.json")
        );
        let { data: dataRs2 } = await NewsDataService.getBannerName(
          "APP.POPUP"
        );
        let Name = "";
        if (dataRs2?.data && dataRs2?.data.length > 0) {
          Name = dataRs2?.data[0]?.Title || "";
        }
        rs = { ...data, Name };
      }

      if (rs?.Name) {
        let reCheck = await NewsDataService.recheckContact({
          Title: rs?.Name,
          MemberID: getUser()?.ID,
          BrowserId: getUser()?.ID,
        });
        rs["contact"] = reCheck?.data?.contact || null;
      }

      return rs;
    },
    onSuccess: (data) => {},
  });

  const sendMutation = useMutation({
    mutationFn: async (body) => {
      let data = NewsDataService.sendContact(body);
      await refetch();
      if (window.refetchVQMM) {
        await window.refetchVQMM();
      }
      return data;
    },
  });

  const openGift = () => {
    if (!data?.data) return;

    if (!data?.unlimitedTurns && data?.contact) {
      toast.error("Bạn đã hết mở hộp quà.");
      return;
    }

    setOpen(true);

    audioRef.current.currentTime = 0;
    audioRef.current.play();

    let index = getRandomItemByPercentage(
      data?.data,
      data?.data.map((item) => item.percentage)
    );

    setTimeout(() => {
      setWinnerPrize(data?.data[index]);
      onSubmit(data?.data[index]);

      winerSound.current.currentTime = 0;
      winerSound.current.play();
    }, 1500);
  };

  const onSubmit = (values) => {
    sendMutation.mutate({
      contact: {
        Title: data?.Name,
        Fullname: getUser()?.FullName || "",
        Phone1: getUser()?.MobilePhone || "",
        Content: values?.option || "",
        MemberID: getUser()?.ID || "",
        BrowserId: getUser()?.ID,
        Status: "0",
        Type: "contact",
        StockID: getStockIDStorage(),
        DepartmentID: 22,
        EndDate: moment(
          data?.ExpiredDate || params.EndDate,
          "DD-MM-YYYY",
          true
        ).isValid()
          ? moment(data?.ExpiredDate || params.EndDate, "DD-MM-YYYY")
              .set({
                hours: "23",
                minutes: "59",
              })
              .format("HH:mm YYYY-MM-DD")
          : moment()
              .set({
                hours: "23",
                minutes: "59",
              })
              .add(Number(data?.ExpiredDate || params.EndDate || 7), "days")
              .format("HH:mm YYYY-MM-DD"),
      },
    });
  };

  return (
    <>
      <div
        className="h-100 d--f fd--c position-relative"
        style={{
          backgroundImage: `url(${toAbsoluteUrl(
            "/brand/minigame/assets/lucky-gift-box/bg.png"
          )}), ${background.webkit}`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          //background: background.moz,
          //background: background.webkit,
        }}
      >
        <div
          className="d--f ai--e position-relative"
          style={{
            height: "42%",
            alignItems: "end",
            justifyContent: "center",
          }}
        >
          <div className={clsx("present", open && "open")} onClick={openGift}>
            <div
              className={clsx(
                "position-absolute w-100 bg-cover top-2/4 d--f ai--c jc--c"
              )}
              style={{
                transform: open
                  ? "translate3d(0, -50%, 10px) rotateY(1080deg) rotateX(10deg)"
                  : "translate3d(0, -50%, 0) rotateY(0) rotateX(0)",
                transition: "transform 2.5s cubic-bezier(0.22, 0.61, 0.36, 1)",
                zIndex: open ? 10 : 0,
              }}
            >
              <img
                src={toAbsoluteUrl(
                  "/brand/minigame/assets/lucky-gift-box/finish.png"
                )}
                alt=""
                className={clsx("max-w-fit w-[230px] transition")}
                style={{
                  maxWidth: "fit-content",
                  width: "230px",
                  transition: "all 300ms ease",
                  visibility: open ? "visible" : "invisible",
                  opacity: open ? 1 : 0,
                }}
              />
            </div>

            <div className="rotate-container">
              <div className="bottom"></div>
              <div className="front"></div>
              <div className="left"></div>
              <div className="back"></div>
              <div className="right"></div>

              <div className="lid">
                <div className="lid-top"></div>
                <div className="lid-front"></div>
                <div className="lid-left"></div>
                <div className="lid-back"></div>
                <div className="lid-right"></div>
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            flexGrow: "1",
          }}
        >
          <div
            style={{
              paddingRight: "2.5rem",
              paddingLeft: "1.75rem",
              marginTop: "2.5rem",
            }}
          >
            <img
              src={toAbsoluteUrl(
                "/brand/minigame/assets/lucky-gift-box/title.png"
              )}
              alt=""
            />
          </div>
          <div>
            <div
              style={{
                fontSize: "15px",
                lineHeight: "1.75rem",
              }}
              className="text-center text-white fw-500 text-[15px] leading-7"
            >
              <div>
                Bấm
                <span
                  style={{
                    fontSize: "1.5rem",
                    lineHeight: "1.5rem",
                  }}
                  className="text-2xl fw-700 pl-3px"
                >
                  "Mở Hộp Quà"
                </span>
              </div>
              <div>để tìm kiếm giải thưởng may mắn của bạn</div>
            </div>
            <div
              className="text-center d--f jc--c"
              style={{
                marginTop: "1rem",
              }}
            >
              <button
                style={{
                  background: "linear-gradient(to right,#1081e8,#f32177)",
                  fontSize: "16px",
                  textShadow:
                    "0 .1em 20px #a8237e,.05em -.03em 0 #1a64b9,.05em .005em 0 #1a64b9,0em .08em 0 #a8237e,.05em .08em 0 #a8237e,0px -.03em 0 #a8237e,-.03em -.03em 0 #a8237e,-.03em .08em 0 #a8237e,-.03em 0 0 #a8237e",
                  textTransform: "capitalize",
                  paddingTop: ".75rem",
                  paddingBottom: ".625rem",
                  padding: ".75rem 2rem .625rem 2rem",
                  borderRadius: "1.5rem",
                  width: "auto",
                  border: 0,
                  gap: ".5rem",
                }}
                className="text-white d--f fw-600 btn-gift"
                type="button"
                onClick={openGift}
              >
                {!data?.unlimitedTurns && data?.contact ? (
                  <>
                    <span>Hết</span>
                    <span>lượt</span>
                    <span>mở!</span>
                  </>
                ) : (
                  <>
                    <span>Mở</span>
                    <span>hộp</span>
                    <span>quà!</span>
                  </>
                )}
              </button>
            </div>
          </div>
          <PrizePicker data={data?.data || []}>
            {({ open }) => (
              <div className="mt-25px d--f jc--c">
                <div
                  className="text-underline fw-600 text-white"
                  onClick={open}
                  style={{
                    fontSize: "15px",
                  }}
                >
                  Danh sách giải thưởng
                </div>
              </div>
            )}
          </PrizePicker>
        </div>

        {!data?.unlimitedTurns && (
          <div className="text-center mb-15px text-white">
            Khách hàng có
            <span className="px-5px">{data?.contact ? "0" : "1"}</span>
            lượt mở hộp quà.
          </div>
        )}
        {isLoading && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgb(0 0 0 / 30%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
            }}
          >
            <SpinnerLoading size={60} color="#fff" />
          </div>
        )}
      </div>
      <WinnerModal
        data={data}
        prize={winnerPrize}
        onClose={() => {
          setWinnerPrize(null);
          setOpen(false)
        }}
        params={params}
      />
    </>
  );

  // return (
  //   <IframeComm
  //     attributes={{
  //       src: `${(window.SERVER || SERVER_APP)}/minigame/hop-qua?v=${new Date().valueOf()}&DepartmentID=${params?.DepartmentID}&EndDate=${params?.EndDate}`,
  //       width: "100%",
  //       height: "100%",
  //       frameBorder: 0,
  //       display: "block",
  //     }}
  //     postMessageData={JSON.stringify({
  //       Info: getUser(),
  //     })}
  //     handleReady={() => {
  //       f7.dialog.close();
  //     }}
  //   />
  // );
}

export default IframeGift;
