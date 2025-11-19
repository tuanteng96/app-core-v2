import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { toAbsoluteUrl } from "../../../constants/assetPath";
import { useMutation, useQuery } from "react-query";
import NewsDataService from "../../../service/news.service";
import axios from "axios";
import { getRandomItemByPercentage } from "../../../constants/helpers";
import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";
import confetti from "canvas-confetti";
import moment from "moment";
import { getStockIDStorage, getUser } from "../../../constants/user";
import PrizePicker from "./PickerPrize";
import { toast } from "react-toastify";

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
              background: "rgb(0 0 0 / 40%)",
            }}
            onClick={onClose}
          />

          {/* Modal wrapper */}
          <motion.div
            className="position-fixed w-100 h-100 top-0 left-0 px-15px d--f ai--c jc--c bz-bb overflow-hidden"
            style={{
              zIndex: 10001,
              "--color-bg": data?.color || "#d51e1e",
            }}
          >
            {/* Modal content */}
            <motion.div
              className="bg-white"
              initial={{ opacity: 0, scale: 0.8, y: 30 }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
                x: [0, -10, 10, -6, 6, -2, 2, 0], // shake effect
              }}
              exit={{ opacity: 0, scale: 0.8, y: 30 }}
              transition={{
                type: "spring",
                duration: 0.8,
                bounce: 0.3,
              }}
              style={{
                borderRadius: "0.5rem",
                padding: "1.25rem",
                position: "relative",
                maxWidth: "480px",
                width: "100%",
              }}
            >
              {/* Top banner */}
              <div
                className="position-absolute"
                style={{
                  width: "250px",
                  top: "-15px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  zIndex: "10",
                }}
              >
                <img
                  src={toAbsoluteUrl("/brand/minigame/assets/12/TOP.png")}
                  alt=""
                />
              </div>

              {/* Nội dung đỏ */}
              <div
                className="text-center text-white position-relative"
                style={{
                  background: "var(--color-bg)",
                  padding: "3rem 2.5rem 5rem 3rem",
                  borderRadius: "0.5rem 0.5rem 50% 50%",
                }}
              >
                <div className="mb-8px" style={{ padding: "0 2rem" }}>
                  <div className="position-relative d--f jc--c">
                    <div
                      className="fw-500"
                      style={{
                        background: "var(--color-bg)",
                        padding: "0 0.75rem",
                        zIndex: "20",
                      }}
                    >
                      Bạn nhận được
                    </div>
                    <div
                      className="position-absolute w-100"
                      style={{
                        height: "1px",
                        background: "#fff",
                        bottom: "6px",
                      }}
                    />
                  </div>
                </div>
                <div
                  style={{
                    fontSize: "20px",
                    textTransform: "uppercase",
                    fontWeight: "700",
                    lineHeight: "30px",
                  }}
                >
                  {prize?.option}
                </div>
                <div
                  className="position-absolute w-100 text-center"
                  style={{
                    left: 0,
                    bottom: "2rem",
                    fontWeight: "500",
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
                </div>
              </div>

              {/* Liên hệ */}
              <div
                className="text-center"
                style={{
                  padding: "2rem",
                  fontSize: "14px",
                }}
              >
                {data?.copyrightWinner}
              </div>

              {/* Nút Đóng */}
              <div
                onClick={onClose}
                className="position-absolute d--f ai--c jc--c text-white cursor-pointer fw-500"
                style={{
                  width: "100px",
                  height: "48px",
                  background: "var(--color-bg)",
                  borderRadius: "9999px",
                  bottom: "-20px",
                  left: "50%",
                  transform: "translateX(-50%)",
                }}
              >
                Đóng
              </div>

              {/* Trang trí trái */}
              <div
                style={{
                  width: "70px",
                  position: "absolute",
                  bottom: "-1.25rem",
                  left: "-25px",
                }}
              >
                <img
                  className="w-100"
                  src={toAbsoluteUrl("/brand/minigame/assets/12/trai.png")}
                  alt=""
                />
              </div>

              {/* Trang trí phải */}
              <div
                style={{
                  width: "70px",
                  position: "absolute",
                  bottom: "-1.25rem",
                  right: "-25px",
                }}
              >
                <img
                  className="w-100"
                  src={toAbsoluteUrl("/brand/minigame/assets/12/phai.png")}
                  alt=""
                />
              </div>
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.getElementById("framework7-root")
  );
}

const IframeWheel = forwardRef(({ f7, params }, ref) => {
  const [Rotate, setRotate] = useState(0);
  const [winnerPrize, setWinnerPrize] = useState(null);

  const isShowingError = useRef(false);

  const timeoutRef = useRef(null);
  const wheelRef = useRef(null);
  const audioRef = useRef(
    typeof Audio !== "undefined"
      ? new Audio(
          toAbsoluteUrl("/brand/minigame/assets/mp3/backgroundsound.mp3")
        )
      : null
  );
  const winerSound = useRef(
    new Audio(toAbsoluteUrl("/brand/minigame/assets/mp3/fanfare-winner.mp3"))
  );

  const { data, refetch, isLoading } = useQuery({
    queryKey: ["SpinJson"],
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

  const onSpinStart = () => {
    if (!data?.data) return;

    if (!data?.unlimitedTurns && data?.contact) {
      if (!isShowingError.current) {
        isShowingError.current = true;
        toast.error("Bạn đã hết lượt quay.", {
          onClose: () => {
            isShowingError.current = false;
          },
        });
      }
      return;
    }

    let index = getRandomItemByPercentage(
      data?.data,
      data?.data.map((item) => item.percentage)
    );
    let random =
      Rotate +
      (360 - (Rotate % 360)) +
      Math.floor((360 / data?.data?.length) * index + 360 * 8);

    setRotate(random % (360 / data?.data?.length) === 0 ? 10 + random : random);
    setWinnerPrize(null);

    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.loop = true;
      audioRef.current.play().catch((err) => {
        console.warn("Không thể play audio:", err);
      });
    }
  };

  useEffect(() => {
    const wheelEl = wheelRef.current;
    if (!wheelEl) return;

    const handleTransitionEnd = () => {
      // Stop sound khi quay xong
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      // Phát nhạc chiến thắng 1 lần
      if (winerSound.current) {
        winerSound.current.currentTime = 0; // reset để phát từ đầu
        winerSound.current.play().catch((err) => {
          console.warn("Không phát được fanfare:", err);
        });
      }

      let index =
        data?.data?.length -
        Math.floor((Rotate % 360) / (360 / data?.data?.length)) -
        1;

      setWinnerPrize(data?.data[index]);
      onSubmit(data?.data[index]);
    };

    wheelEl.addEventListener("transitionend", handleTransitionEnd);
    return () => {
      wheelEl.removeEventListener("transitionend", handleTransitionEnd);
    };
  }, [Rotate]);

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
          "--color-bg": data?.color || "#d51e1e",
          background: `url(${toAbsoluteUrl(
            "/brand/minigame/assets/12/maunen.jpg"
          )})`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      >
        <div
          style={{
            flexGrow: "1",
            padding: "2.5rem 1.25rem 0 1.25rem",
          }}
        >
          <div className="position-relative">
            <div
              ref={wheelRef}
              style={{
                transform: `rotate(-${Rotate}deg)`,
                transition: `all 5000ms`,
              }}
            >
              <img
                src={toAbsoluteUrl("/brand/minigame/assets/12/vongquay.png")}
                alt=""
              />
            </div>
            <div
              onClick={onSpinStart}
              className="position-absolute cursor-pointer"
              style={{
                top: "50%",
                left: "50%",
                transform: "translateX(-50%) translateY(-50%)",
                width: "19%",
              }}
            >
              <img
                className="w-100"
                src={toAbsoluteUrl("/brand/minigame/assets/12/quay.png")}
                alt=""
              />
            </div>
            <div
              className="position-absolute"
              style={{
                top: "-1.8rem",
                left: "50%",
                transform: "translateX(-50%)",
                width: "10%",
              }}
            >
              <img
                className="w-100"
                src={toAbsoluteUrl("/brand/minigame/assets/12/muiten.png")}
                alt=""
              />
            </div>
          </div>
        </div>
        <div
          className="text-center position-relative text-white"
          style={{
            background: "var(--color-bg)",
            padding: "4rem 2rem 1.25rem 2rem",
            borderTopLeftRadius: "25px",
            borderTopRightRadius: "25px",
          }}
        >
          <div
            className="position-absolute"
            style={{
              top: "-2.5rem",
              left: "50%",
              transform: "translateX(-50%)",
            }}
          >
            <img
              style={{
                width: "150px",
              }}
              src={toAbsoluteUrl("/brand/minigame/assets/12/TITLE.png")}
              alt=""
            />
          </div>
          <div className="mb-20px">
            Bấm "QUAY" để bắt đầu quay vòng quay. Ô giải thưởng nào dừng lại ở
            vị trí mũi tên khi vòng quay kết thúc bạn sẽ nhận được giải thưởng
            tương ứng.
          </div>

          {!data?.unlimitedTurns && (
            <div className="text-center mb-5px">
              Khách hàng có
              <span className="px-5px">{data?.contact ? "0" : "1"}</span>
              lượt quay.
            </div>
          )}
          <PrizePicker data={data?.data || []}>
            {({ open }) => (
              <div className="text-underline fw-500" onClick={open}>
                Danh sách giải thưởng
              </div>
            )}
          </PrizePicker>
        </div>

        <WinnerModal
          data={data}
          prize={winnerPrize}
          onClose={() => setWinnerPrize(null)}
          params={params}
        />
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
    </>
  );
});

export default IframeWheel;
