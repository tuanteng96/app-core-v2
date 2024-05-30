import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";
import { Link } from "framework7-react";
import { getStockIDStorage } from "../constants/user";
import clsx from "clsx";

function StocksProvinces({ isOpen, onClose, Stocks, onChange, StockActive }) {
  let [StocksProvince, setStocksProvince] = useState([]);

  let [ProvinceActive, setProvinceActive] = useState(null);

  let [Districts, setDistricts] = useState([]);
  let [DistrictActive, setDistrictActive] = useState(null);

  let [StocksList, setStocksList] = useState([]);
  let [CrStockID, setCrStockID] = useState(null);

  let [CurrentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    let CurrentStockID = StockActive || getStockIDStorage();
    if (CurrentStockID) {
      let index = Stocks.findIndex((x) => x.ID === Number(CurrentStockID));
      if (index > -1) {
        let newDesc = Stocks[index].DescSEO
          ? JSON.parse(Stocks[index].DescSEO)
          : null;
        if (newDesc?.place) {
          let CrProvince = newDesc?.place.filter((x) => x.Parentid > 0)[0];
          let CrDistrict = newDesc?.place.filter((x) => !x.Parentid)[0];
          setProvinceActive({
            Province: CrProvince,
          });
          setDistrictActive(CrDistrict);
          setCrStockID(Number(CurrentStockID));
        }
      }
    }
  }, [Stocks, StockActive]);

  useEffect(() => {
    if (Stocks) {
      let newStocksProvince = [];

      for (let i of Stocks) {
        let newDesc = i.DescSEO ? JSON.parse(i.DescSEO) : null;
        if (newDesc && newDesc.place) {
          let index = newStocksProvince.findIndex((x) =>
            newDesc && newDesc.place
              ? newDesc.place.some((o) => o.Parentid === x?.Province?.Parentid)
              : false
          );
          if (index > -1) {
            let crDistr = newDesc.place.filter((x) => !x.Parentid)[0];
            let indexDistr = newStocksProvince[index].Districts.findIndex(
              (x) => x.ID === crDistr.ID
            );
            if (indexDistr > -1) {
              newStocksProvince[index].Districts[indexDistr].Stocks.push({
                Title: i.Title,
                ID: i.ID,
                Province: newDesc?.place
                  ? newDesc.place.filter((x) => x.Parentid > 0)[0]
                  : null,
                District: newDesc.place.filter((x) => !x.Parentid)[0],
              });
            } else {
              newStocksProvince[index].Districts.push({
                ...crDistr,
                Stocks: [
                  {
                    Title: i.Title,
                    ID: i.ID,
                    Province: newDesc?.place
                      ? newDesc.place.filter((x) => x.Parentid > 0)[0]
                      : null,
                    District: newDesc.place.filter((x) => !x.Parentid)[0],
                  },
                ],
              });
            }
          } else {
            let newObj = {
              ...i,
              Province: newDesc?.place
                ? newDesc.place.filter((x) => x.Parentid > 0)[0]
                : null,
              Districts: [],
            };
            if (newDesc?.place.filter((x) => !x.Parentid).length > 0) {
              newObj.Districts = [
                {
                  ...newDesc.place.filter((x) => !x.Parentid)[0],
                  Stocks: [
                    {
                      Title: i.Title,
                      ID: i.ID,
                      Province: newDesc?.place
                        ? newDesc.place.filter((x) => x.Parentid > 0)[0]
                        : null,
                      District: newDesc.place.filter((x) => !x.Parentid)[0],
                    },
                  ],
                },
              ];
            }
            newStocksProvince.push(newObj);
          }
        }
      }
      setStocksProvince(newStocksProvince);
    }
  }, [Stocks]);

  useEffect(() => {
    if (ProvinceActive) {
      let index = StocksProvince.findIndex(
        (x) => x?.Province?.Parentid === ProvinceActive?.Province?.Parentid
      );
      if (index > -1) {
        setDistricts(StocksProvince[index].Districts);
      } else {
        setDistricts([]);
      }
    } else {
      setDistricts([]);
    }
  }, [ProvinceActive, StocksProvince]);

  useEffect(() => {
    if (DistrictActive) {
      let index = StocksProvince.findIndex(
        (x) => x?.Province?.Parentid === ProvinceActive?.Province?.Parentid
      );
      if (index > -1) {
        let i = StocksProvince[index].Districts.findIndex(
          (x) => x?.ID === DistrictActive?.ID
        );
        if (i > -1) {
          setStocksList(StocksProvince[index].Districts[i].Stocks);
        } else {
          setStocksList([]);
        }
      }
    } else {
      setStocksList([]);
    }
  }, [DistrictActive]);

  return createPortal(
    <AnimatePresence exitBeforeEnter>
      {isOpen && (
        <>
          <motion.div
            className="position-fixed w-100 h-100 top-0 left-0 bg-white"
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            style={{
              zIndex: 100000,
            }}
          >
            <div
              className="d--f fw--n h-100"
              style={{
                transform: `translateX(-${CurrentStep * window.innerWidth}px)`,
                transition: "all 250ms",
              }}
            >
              <div
                className="d--f fd--c h-100 bg-white"
                style={{
                  width: window.innerWidth,
                  minWidth: window.innerWidth,
                }}
              >
                <div
                  className="d--f position-relative"
                  style={{
                    height: "var(--f7-navbar-height)",
                    background: "var(--ezs-color)",
                    color: "#fff",
                  }}
                >
                  <div
                    className="h-full d--f jc--c ai--c"
                    onClick={onClose}
                    style={{
                      width: "40px",
                    }}
                  >
                    <a
                      className="text-white"
                      href="#"
                      style={{
                        fontSize: "22px",
                      }}
                    >
                      <i className="las la-angle-left" />
                    </a>
                  </div>
                  <div className="page-navbar__title">
                    <span className="title">Cơ sở thuộc thành phố ?</span>
                  </div>
                </div>
                <div
                  className="overflow-auto"
                  style={{
                    flex: "1",
                  }}
                >
                  {StocksProvince &&
                    StocksProvince.map((item, index) => (
                      <Link
                        noLinkClass
                        key={index}
                        className={clsx(
                          "px-15px py-15px border-bottom fw-500 d--f jc--sb ai--c",
                          ProvinceActive?.Province?.Parentid ===
                            item?.Province?.Parentid
                            ? "text-app2"
                            : "text-black"
                        )}
                        onClick={() => {
                          setProvinceActive(item);
                          setCurrentStep(1);
                        }}
                      >
                        <div
                          style={{
                            fontSize: "15px",
                          }}
                        >
                          {item?.Province?.Title}
                        </div>
                        {ProvinceActive?.Province?.Parentid ===
                          item?.Province?.Parentid && (
                          <i
                            className="las la-check"
                            style={{
                              fontSize: "20px",
                            }}
                          ></i>
                        )}
                      </Link>
                    ))}
                </div>
              </div>
              <div
                className="d--f fd--c h-100 bg-white"
                style={{
                  width: window.innerWidth,
                  minWidth: window.innerWidth,
                }}
              >
                <div
                  className="d--f position-relative"
                  style={{
                    height: "var(--f7-navbar-height)",
                    background: "var(--ezs-color)",
                    color: "#fff",
                  }}
                >
                  <div
                    className="h-full d--f jc--c ai--c"
                    onClick={() => {
                        setCurrentStep(0)
                    }}
                    style={{
                      width: "40px",
                    }}
                  >
                    <a
                      className="text-white"
                      href="#"
                      style={{
                        fontSize: "22px",
                      }}
                    >
                      <i className="las la-angle-left" />
                    </a>
                  </div>
                  <div className="page-navbar__title">
                    <span className="title">
                      {ProvinceActive?.Province?.Title}
                    </span>
                  </div>
                </div>

                <div
                  className="overflow-auto"
                  style={{
                    flex: "1",
                  }}
                >
                  {Districts &&
                    Districts.map((item, index) => (
                      <Link
                        noLinkClass
                        key={index}
                        className={clsx(
                          "px-15px py-15px border-bottom fw-500 d--f jc--sb ai--c",
                          DistrictActive?.ID === item?.ID
                            ? "text-app2"
                            : "text-black"
                        )}
                        onClick={() => {
                          setDistrictActive(item);
                          setCurrentStep(2);
                        }}
                      >
                        <div
                          style={{
                            fontSize: "15px",
                          }}
                        >
                          {item.Title}
                        </div>
                        {DistrictActive?.ID === item?.ID && (
                          <i
                            className="las la-check"
                            style={{
                              fontSize: "20px",
                            }}
                          ></i>
                        )}
                      </Link>
                    ))}
                </div>
              </div>
              <div
                className="d--f fd--c h-100 bg-white"
                style={{
                  width: window.innerWidth,
                  minWidth: window.innerWidth,
                }}
              >
                <div
                  className="d--f position-relative"
                  style={{
                    height: "var(--f7-navbar-height)",
                    background: "var(--ezs-color)",
                    color: "#fff",
                  }}
                >
                  <div
                    className="h-full d--f jc--c ai--c"
                    onClick={() => setCurrentStep(1)}
                    style={{
                      width: "40px",
                    }}
                  >
                    <a
                      className="text-white"
                      href="#"
                      style={{
                        fontSize: "22px",
                      }}
                    >
                      <i className="las la-angle-left" />
                    </a>
                  </div>
                  <div className="page-navbar__title">
                    <span className="title">{DistrictActive?.Title}</span>
                  </div>
                </div>
                <div
                  className="overflow-auto"
                  style={{
                    flex: "1",
                  }}
                >
                  {StocksList &&
                    StocksList.map((item, index) => (
                      <Link
                        noLinkClass
                        key={index}
                        className={clsx(
                          "px-15px py-15px border-bottom fw-500 d--f jc--sb ai--c",
                          CrStockID === item?.ID ? "text-app2" : "text-black"
                        )}
                        onClick={() => {
                          setCurrentStep(0);
                          onChange(item);
                        }}
                      >
                        <div
                          style={{
                            fontSize: "15px",
                          }}
                        >
                          {item.Title}
                        </div>
                        {CrStockID === item?.ID && (
                          <i
                            className="las la-check"
                            style={{
                              fontSize: "20px",
                            }}
                          ></i>
                        )}
                      </Link>
                    ))}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.getElementById("framework7-root")
  );
}

export default StocksProvinces;
