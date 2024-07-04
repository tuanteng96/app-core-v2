import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";
import { Link } from "framework7-react";
import { getStockIDStorage } from "../constants/user";
import clsx from "clsx";
import SelectPicker from "./Selects/SelectPicker";
import ReactHtmlParser from "react-html-parser";
import InfiniteScroll from "react-infinite-scroll-component";

function StocksProvincesFilter({
  isOpen,
  onClose,
  Stocks,
  onChange,
  StockActive,
}) {
  let [StocksList, setStocksList] = useState([]);
  let [StocksProvider, setStocksProvider] = useState([]);

  let [ProvincesList, setProvincesList] = useState([]);

  let [ActiveProvinces, setActiveProvinces] = useState(null);
  let [ActiveDistricts, setActiveDistricts] = useState(null);

  let [CrStock, setCrStock] = useState(null);

  useEffect(() => {
    if (Stocks) {
      let newStocks = [];
      let Provinces = [];

      for (let x of Stocks) {
        let obj = {
          ...x,
        };
        let newDesc = x.DescSEO ? JSON.parse(x.DescSEO) : null;

        if (newDesc && newDesc.place && newDesc.place.length > 0) {
          obj.Province = newDesc.place.filter((o) => o.Parentid > 0)[0];
          obj.District = newDesc.place.filter((o) => !o.Parentid)[0];
        }
        newStocks.push(obj);
      }

      for (let province of newStocks) {
        let index = Provinces.findIndex(
          (x) =>
            Number(
              province?.Province?.Parentid && province?.Province?.Parentid
            ) === Number(x.Parentid)
        );
        if (index > -1) {
          let indexDistr = Provinces[index].Districts.findIndex(
            (o) => Number(o.ID) === Number(province?.District?.ID)
          );
          if (indexDistr === -1) {
            Provinces[index].Districts.push({
              ...province?.District,
              label: province?.District?.Title || null,
              value: province?.District?.ID || null,
            });
          }
        } else {
          Provinces.push({
            ...province?.Province,
            label: province?.Province?.Title || null,
            value: province?.Province?.Parentid || null,
            Districts: [
              {
                ...province?.District,
                label: province?.District?.Title || null,
                value: province?.District?.ID || null,
              },
            ],
          });
        }
      }
      newStocks = newStocks?.sort(
        (a, b) => Number(a?.Province?.Parentid) - Number(b?.Province?.Parentid)
      );
      setStocksList(newStocks);
      setStocksProvider(newStocks);

      setProvincesList(Provinces.filter(x => x.Parentid));
    }
  }, [Stocks, isOpen]);

  useEffect(() => {
    if (isOpen) {
      let CurrentStockID = StockActive || getStockIDStorage();

      if (CurrentStockID && StocksProvider) {
        setCrStock(Number(CurrentStockID));

        //Active filter tạm ẩn
        // let index = StocksProvider.findIndex(
        //   (x) => x.ID === Number(CurrentStockID)
        // );
        // if (index > -1) {
        //   if (StocksProvider[index]?.Province?.Parentid) {
        //     let indexProvince = ProvincesList.findIndex(
        //       (x) => x.Parentid === StocksProvider[index]?.Province?.Parentid
        //     );
        //     if (indexProvince > -1) {
        //       setActiveProvinces(ProvincesList[index]);
        //     }
        //   }
        //   if (StocksProvider[index]?.District) {
        //     setActiveDistricts({
        //       ...StocksProvider[index]?.District,
        //       value: StocksProvider[index]?.District?.ID,
        //       label: StocksProvider[index]?.District?.Title,
        //     });
        //   }
        // }
      }
    } else {
      setActiveProvinces(null);
      setActiveDistricts(null);
    }
  }, [isOpen, StocksProvider, ProvincesList, StockActive]);

  useEffect(() => {
    if (StocksProvider) {
      let newValues = [...StocksProvider];

      if (ActiveProvinces) {
        newValues = newValues.filter(
          (x) => Number(x?.Province?.Parentid) === Number(ActiveProvinces?.value)
        );
      }
      if (ActiveDistricts) {
        newValues = newValues.filter(
          (x) => Number(x?.District?.ID) === Number(ActiveDistricts?.value)
        );
      }
      setStocksList(newValues);
    }
  }, [ActiveProvinces, ActiveDistricts]);

  return createPortal(
    <AnimatePresence exitBeforeEnter>
      {isOpen && (
        <>
          <motion.div
            className="position-fixed w-100 h-100 top-0 left-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            style={{
              zIndex: 100000,
              background: "rgb(0 0 0 / 55%)",
            }}
            onClick={onClose}
          >
            <i
              className="las la-times position-absolute text-white"
              style={{
                fontSize: "35px",
                bottom: "42%",
                right: "15px",
                opacity: ".8",
              }}
            ></i>
          </motion.div>
          <motion.div
            className="position-fixed w-100 bottom-0 left-0 bg-white"
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            style={{
              zIndex: 100001,
              height: "40%",
              borderRadius: "5px 5px 0 0",
              overflow: "hidden",
            }}
          >
            <div
              className="page-maps2 h-100"
              style={{
                backgroundColor: "#f5f5f9",
              }}
            >
              <div className="wrap-filter pb-0">
                <div className="box-filter">
                  <div>
                    <SelectPicker
                      placeholder="Tỉnh / TP"
                      value={ActiveProvinces}
                      options={ProvincesList || []}
                      label="Chọn Tỉnh / Thành phố"
                      onChange={(val) => setActiveProvinces(val)}
                    />
                  </div>
                  <div>
                    <SelectPicker
                      placeholder="Quận / Huyện"
                      value={ActiveDistricts}
                      options={ActiveProvinces?.Districts || []}
                      label="Chọn Tỉnh / Thành phố"
                      onChange={(val) => setActiveDistricts(val)}
                      disabled={!ActiveProvinces}
                    />
                  </div>
                </div>
                {/* <div className="map-total">
                  <i className="las la-store"></i> Có {StocksList?.length} cơ sở
                </div> */}
              </div>
              <div className="list list-stocks">
                {StocksList &&
                  StocksList.map((item, index) => (
                    <div
                      className={clsx(
                        "item-stock",
                        CrStock === item.ID && "active"
                      )}
                      key={index}
                      onClick={() => onChange(item)}
                    >
                      <div className="_title">{item.Title}</div>
                      <div className="_address">
                        <i className="las la-map-marked-alt"></i>
                        <div className="_address-value">
                          {ReactHtmlParser(item.Desc)}
                        </div>
                      </div>
                      {/* <div className="_work">
                        <div className="_phone">
                          <i className="las la-phone-volume"></i>
                          {item.LinkSEO || "Đang cập nhập"}
                        </div>

                        <div
                          className="_support"
                          onClick={(e) => {
                            e.stopPropagation();
                            this.openMaps(item);
                          }}
                        >
                          <i className="las la-blind"></i>
                          Chỉ đường
                        </div>
                      </div> */}
                    </div>
                  ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.getElementById("framework7-root")
  );
}

export default StocksProvincesFilter;
