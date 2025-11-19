import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
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
  const canvasRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!prize) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const canvas = canvasRef.current;
    const myConfetti = confetti.create(canvas, {
      resize: true,
      useWorker: true,
    });

    intervalRef.current = setInterval(() => {
      myConfetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
      });
    }, 500); // bắn mỗi 0.5s

    return () => {
      myConfetti.reset();
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [prize]);

  if (!prize) return null;

  return createPortal(
    <AnimatePresence>
      {Boolean(prize) && (
        <>
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

          <motion.div
            className="position-fixed w-100 h-100 top-0 left-0 d--f fd--c ai--c jc--c"
            style={{
              zIndex: 10001,
            }}
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
            <canvas
              ref={canvasRef}
              className="confetti-canvas"
              style={{
                position: "absolute",
                width: "100%",
                height: "100%",
                zIndex: 100,
                pointerEvents: "none",
              }}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.getElementById("framework7-root")
  );
}

const IframeGift = forwardRef(({ f7, params }, ref) => {
  const [open, setOpen] = useState(false);
  const [winnerPrize, setWinnerPrize] = useState(null);
  const isShowingError = useRef(false);

  const timeoutRef = useRef(null);

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

  const safePlay = (audio) => {
    if (!audio) {
      return;
    }
    audio.currentTime = 0;
    const playPromise = audio.play();

    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.log("Không phát được audio:", err);
      });
    }
  };

  const openGift = () => {
    if (!data?.data) return;

    if (!data?.unlimitedTurns && data?.contact) {
      if (!isShowingError.current) {
        isShowingError.current = true;
        toast.error("Bạn đã hết mở hộp quà.", {
          onClose: () => {
            isShowingError.current = false;
          },
        });
      }
      return;
    }

    setOpen(true);

    safePlay(audioRef.current);

    let index = getRandomItemByPercentage(
      data?.data,
      data?.data.map((item) => item.percentage)
    );

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setWinnerPrize(data?.data[index]);

      onSubmit(data?.data[index]);

      safePlay(winerSound.current);
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
        Status: "1",
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

  useImperativeHandle(ref, () => ({
    onClose: () => {
      setOpen(false);
      setWinnerPrize(null);

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      if (winerSound.current) {
        winerSound.current.pause();
        winerSound.current.currentTime = 0;
      }

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    },
  }));

  return (
    <>
      <div
        className="h-100 d--f fd--c position-relative"
        style={{
          backgroundImage: `url(${toAbsoluteUrl(
            "/brand/minigame/assets/lucky-gift-box/bg.png"
          )})`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundColor: "var(--ezs-color)",
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
          setOpen(false);

          winerSound.current.pause();
          winerSound.current.currentTime = 0;
        }}
        params={params}
      />
    </>
  );
});

export default IframeGift;
