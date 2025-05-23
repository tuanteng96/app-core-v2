import React from "react";
import {
  Link,
  Tabs,
  Tab,
  Row,
  Col,
  ActionsGroup,
  Actions,
  ActionsButton,
  f7,
} from "framework7-react";
import UserService from "../../service/user.service";
import IconLocation from "../../assets/images/location1.svg";
import SkeletonStock from "./SkeletonStock";
import Carousel from "nuka-carousel";
import DatePicker from "react-mobile-datepicker";
import _ from "lodash";
import { clsx } from "clsx";
import ConfigServiceAPI from "../../service/config.service";
import BookDataService from "../../service/book.service";
import Select from "react-select";
import "moment/locale/vi";
import StocksProvincesFilter from "../StocksProvincesFilter";

import moment from "moment";
moment.locale("vi");

window.moment = moment;

const dateConfig = {
  // hour: {
  //   format: "hh",
  //   caption: "Giờ",
  //   step: 1,
  // },
  // minute: {
  //   format: "mm",
  //   caption: "Phút",
  //   step: 1,
  // },
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
};

const GroupByCount = (List, Count) => {
  return List.reduce((acc, x, i) => {
    const idx = Math.floor(i / Count);
    acc[idx] = [...(acc[idx] || []), x];
    return acc;
  }, []);
};

const formatTimeOpenClose = ({ Text, InitialTime, Date }) => {
  let Times = { ...InitialTime };
  let CommonTime = Array.from(Text.matchAll(/\[([^\][]*)]/g), (x) => x[1]);

  if (CommonTime && CommonTime.length > 0) {
    let CommonTimeJs = CommonTime[0].split(";");
    Times.TimeOpen = CommonTimeJs[0];
    Times.TimeClose = CommonTimeJs[1];
  }

  let PrivateTime = Array.from(Text.matchAll(/{+([^}]+)}+/g), (x) => x[1]);
  PrivateTime = PrivateTime.filter((x) => x.split(";").length > 2).map((x) => ({
    DayName: x.split(";")[0],
    TimeOpen: x.split(";")[1],
    TimeClose: x.split(";")[2],
  }));
  if (Date) {
    let index = PrivateTime.findIndex(
      (x) => x.DayName === moment(Date, "DD/MM/YYYY").format("ddd")
    );

    if (index > -1) {
      Times.TimeOpen = PrivateTime[index].TimeOpen;
      Times.TimeClose = PrivateTime[index].TimeClose;
    }
  }
  return Times;
};

function missingItems(arr, n) {
  let missingItems = [];
  for (let i = 1; i <= n; i++) if (!arr.includes(i)) missingItems.push(i);
  return missingItems;
}

export default class ScheduleSpa extends React.Component {
  constructor() {
    super();
    this.state = {
      ListChoose: [],
      ListDisableChoose: [],
      arrListDate: [], // Hiển thị 3 ngày từ ngày today next
      arrStock: [], // List Stock
      timeSelected: "",
      itemBook: {},
      isLoadingStock: true,
      isActive: 0,
      isOpen: false,
      visible: false,
      indexCurrent: 7,
      openStock: false,
    };
  }

  componentDidMount() {
    this.getStock();
    this.setState({
      width: window.innerWidth,
    });
    //this.getListChoose();
    this.getDisableTime();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props.DateTimeBook.stock !== prevProps.DateTimeBook.stock) {
      if (prevProps.DateTimeBook.toDate) {
        this.getListChoose(
          prevProps.DateTimeBook.toDate,
          this.state.ListDisableChoose
        );
      } else {
        this.getListChoose(new Date(), this.state.ListDisableChoose);
      }
    }
    if (this.props.DateTimeBook?.date !== prevProps.DateTimeBook.date) {
      this.getListChoose(
        this.props.DateTimeBook?.date,
        this.state.ListDisableChoose
      );
    }
  }

  getDisableTime = async () => {
    ConfigServiceAPI.getConfigName("giocam")
      .then(({ data }) => {
        if (data && data.data && data?.data.length > 0) {
          const result = JSON.parse(data.data[0].Value);
          this.getListChoose("", result);
          this.setState({
            ListDisableChoose: result,
          });
        }
      })
      .catch((error) => console.log(error));
  };

  group = (items, n) =>
    items.reduce((acc, x, i) => {
      const idx = Math.floor(i / n);
      acc[idx] = [...(acc[idx] || []), x];
      return acc;
    }, []);

  getStock = () => {
    UserService.getStock().then((response) => {
      let ListStock = response.data.data.all;
      const StocksNotBook = window?.GlobalConfig?.StocksNotBook || "";
      ListStock = ListStock
        ? ListStock.filter(
            (o) => o.ID !== 778 && !StocksNotBook.includes(o.ID)
          ).map((o) => ({
            ...o,
            label: o.Title,
            value: o.ID,
          }))
        : "";

      this.setState({
        arrStock: ListStock,
        isLoadingStock: false,
      });
    });
  };

  checkScheduled = (data) => {
    if (!data || !data?.Configs || data?.Configs.length === 0) return false;
    let { Configs, Books, Date, Staffs, DateBook } = data;

    if (moment(Date).format("DD/MM/YYYY") !== DateBook) return false;

    let newBooks = [...Books]
      .map((x) => ({
        BookDate: x.BookDate,
        RootMinutes: x.RootMinutes,
        Status: x.Status || "",
        addToday: x.addToday || false,
      }))
      .sort((left, right) =>
        moment.utc(left.BookDate).diff(moment.utc(right.BookDate))
      );

    newBooks.push({
      BookDate: moment(Date).format("YYYY-MM-DD HH:mm"),
      RootMinutes:
        window?.GlobalConfig?.Admin?.SettingBookOnlineExpectedMinutes || 60,
      addToday: true,
    });

    if (Configs && Configs.length > 0) {
      let newConfigs = Configs.filter((x) =>
        moment(
          moment(Date).format("YYYY-MM-DD HH:mm"),
          "YYYY-MM-DD HH:mm"
        ).isBetween(
          moment(x.Config.from, "YYYY-MM-DD HH:mm"),
          moment(x.Config.to, "YYYY-MM-DD HH:mm"),
          undefined,
          "[)"
        )
      );
      if (newConfigs.length === 0) return true;

      let MaxBook = Math.max(...newConfigs.map((x) => x.Config.MaxBook));
      let Resources = Array.from({ length: MaxBook }, (_, i) => ({
        id: i + 1,
        title: i + 1,
      }));
      let Lists = [];

      for (let book of newBooks) {
        let crList = Lists.filter(
          (x) =>
            moment(x.start, "YYYY-MM-DD HH:mm").isBetween(
              moment(book.BookDate, "YYYY-MM-DD HH:mm"),
              moment(
                moment(book.BookDate, "YYYY-MM-DD HH:mm")
                  .add(book.RootMinutes || 60, "minutes")
                  .subtract(
                    window?.GlobalConfig?.Admin?.SettingBookOnlineMinutes || 0,
                    "minutes"
                  )
                  .format("YYYY-MM-DD HH:mm"),
                "YYYY-MM-DD HH:mm"
              ),
              null,
              "[)"
            ) ||
            moment(book.BookDate, "YYYY-MM-DD HH:mm").isBetween(
              moment(x.start, "YYYY-MM-DD HH:mm"),
              moment(
                moment(x.end, "YYYY-MM-DD HH:mm")
                  .subtract(
                    window?.GlobalConfig?.Admin?.SettingBookOnlineMinutes || 0,
                    "minutes"
                  )
                  .format("YYYY-MM-DD HH:mm"),
                "YYYY-MM-DD HH:mm"
              ),
              null,
              "[)"
            )
        );

        if (crList && crList.length > 0) {
          let ArrMaxBook = Math.max(...crList.map((x) => x.resourceIds[0]));

          let missNumber = missingItems(
            crList.map((x) => x.resourceIds[0]),
            Resources.length
          );

          let resourceId = ArrMaxBook + 1;

          if (missNumber && missNumber.length > 0) {
            resourceId = missNumber[0];
          }

          let newObj;
          if (
            ArrMaxBook < Resources.length &&
            missNumber &&
            missNumber.length > 0
          ) {
            newObj = {
              start: moment(book.BookDate, "YYYY-MM-DD HH:mm").toDate(),
              end: moment(book.BookDate, "YYYY-MM-DD HH:mm")
                .add(book.RootMinutes || 60, "minutes")
                .toDate(),
              resourceIds: [resourceId],
              addToday: book?.addToday || false,
            };
          } else {
            //add thêm resources nếu quá chiều dài max
            Resources.push({
              id: resourceId,
              title: resourceId,
            });
            newObj = {
              start: moment(book.BookDate, "YYYY-MM-DD HH:mm").toDate(),
              end: moment(book.BookDate, "YYYY-MM-DD HH:mm")
                .add(book.RootMinutes || 60, "minutes")
                .toDate(),
              resourceIds: [resourceId],
              addToday: book?.addToday || false,
            };
          }
          Lists.push(newObj);
        } else {
          let newObj = {
            start: moment(book.BookDate, "YYYY-MM-DD HH:mm").toDate(),
            end: moment(book.BookDate, "YYYY-MM-DD HH:mm")
              .add(book.RootMinutes || 60, "minutes")
              .toDate(),
            resourceIds: [1],
            addToday: book?.addToday || false,
          };
          Lists.push(newObj);
        }
      }

      let ToDate = Lists.findIndex((x) => x.addToday);

      return Lists[ToDate].resourceIds[0] > MaxBook;
    } else {
      return false;
    }
  };

  getListChoose = async (DateChoose, ListLock) => {
    const { TimeNext } = window?.GlobalConfig?.APP?.Booking;
    let TimeOpenG = window?.GlobalConfig?.APP?.Booking?.TimeOpen;
    let TimeCloseG = window?.GlobalConfig?.APP?.Booking?.TimeClose;

    let TimeOpen = TimeOpenG;
    let TimeClose = TimeCloseG;
    //

    let dataCheck = null;

    if (window?.GlobalConfig?.Admin?.SettingBookOnline) {
      f7.dialog.preloader("Đang tải ...");
      let { DateTimeBook } = this.props;

      let { data: dataConfig } = await BookDataService.getListBookConfig({
        StockID: DateTimeBook?.stock,
        From: moment(DateTimeBook.date, "DD/MM/YYYY").format("YYYY-MM-DD"),
        To: moment(DateTimeBook.date, "DD/MM/YYYY").format("YYYY-MM-DD"),
        pi: 1,
        ps: 1000,
      });

      let { data: Books } = await BookDataService.getBooking({
        From: moment(DateTimeBook.date, "DD/MM/YYYY").format("YYYY-MM-DD"),
        To: moment(DateTimeBook.date, "DD/MM/YYYY").format("YYYY-MM-DD"),
        MemberID: "",
        StockID: DateTimeBook?.stock,
        Status: "XAC_NHAN,DANG_THUC_HIEN,THUC_HIEN_XONG,CHUA_XAC_NHAN",
        UserServiceIDs: "",
        StatusMember: "",
        StatusBook: "",
        StatusAtHome: "",
        Tags: "",
      });

      let { data: Stafss } = await BookDataService.getListStaff(
        DateTimeBook?.stock
      );

      let { books, osList } = Books;

      let newBooks = [
        ...(books || []),
        ...(osList || []).map((x) => ({
          ...x,
          BookDate: x.os.BookDate,
          RootTitles: x.os.ProdService2 || x.os.ProdService,
          RootMinutes: x.os.RootMinutes,
          Member: x.member,
          Status: x.os.Status,
        })),
      ];

      dataCheck = {
        Configs: dataConfig?.list || [],
        Books: newBooks,
        Staffs: Stafss?.data || [],
      };

      f7.dialog.close();
    }

    //
    const { arrStock } = this.state;
    const { DateTimeBook } = this.props;

    let indexCr = arrStock
      ? arrStock.findIndex((x) => x.ID === Number(DateTimeBook.stock))
      : -1;

    if (indexCr > -1) {
      let StockI = arrStock[indexCr].KeySEO;

      if (StockI) {
        let TimesObj = formatTimeOpenClose({
          Text: StockI,
          InitialTime: {
            TimeOpen: TimeOpen
              ? moment().set(TimeOpen).format("HH:mm:ss")
              : "06:00:00",
            TimeClose: TimeClose
              ? moment().set(TimeClose).format("HH:mm:ss")
              : "18:00:00",
          },
          Date: DateTimeBook.date,
        });
        TimeOpen.hour = TimesObj.TimeOpen.split(":")[0];
        TimeOpen.minute = TimesObj.TimeOpen.split(":")[1];
        TimeClose.hour = TimesObj.TimeClose.split(":")[0];
        TimeClose.minute = TimesObj.TimeClose.split(":")[1];
      } else {
        TimeOpen = window?.GlobalConfig?.APP?.Booking?.TimeOpen;
        TimeClose = window?.GlobalConfig?.APP?.Booking?.TimeClose;
      }
    }
    //
    const indexLock =
      ListLock &&
      ListLock.findIndex(
        (lock) => Number(lock.StockID) === Number(this.props.DateTimeBook.stock)
      );
    const newListChoose = [];
    let DisableTime = [];
    if (indexLock > -1) {
      DisableTime = ListLock[indexLock].ListDisable;
    }
    for (let index = 0; index < 3; index++) {
      let day = moment().add(index, "days").toDate();
      if (DateChoose && index === 2) {
        day = moment(DateChoose, "DD/MM/YYYY").toDate();
      }

      let startDate = moment(day).set(TimeOpen);
      let closeDate = moment(day)
        .set(TimeClose)
        .subtract(
          window?.top?.GlobalConfig?.APP?.ScheduledMinutes || 0,
          "minutes"
        );
      var duration = moment.duration(closeDate.diff(startDate));
      var MinutesTotal = duration.asMinutes();
      let newListTime = [];
      for (let minute = 0; minute <= MinutesTotal; minute += TimeNext) {
        const datetime = moment(startDate).add(minute, "minute").toDate();
        let isDayOff = false;
        if (DisableTime && DisableTime.length > 0) {
          const indexDayOf =
            DisableTime &&
            DisableTime.findIndex(
              (x) => x.Date === moment(datetime).format("DD/MM/YYYY")
            );
          if (indexDayOf > -1) {
            if (
              DisableTime[indexDayOf].TimeClose &&
              DisableTime[indexDayOf].TimeClose.length > 0
            ) {
              isDayOff = DisableTime[indexDayOf].TimeClose.some((time) => {
                const DateStartDayOf = moment(
                  DisableTime[indexDayOf].Date + time.Start,
                  "DD/MM/YYYY HH:mm"
                );
                const DateEndDayOf = moment(
                  DisableTime[indexDayOf].Date + time.End,
                  "DD/MM/YYYY HH:mm"
                );
                let isStart =
                  moment(datetime, "HH:mm").isSameOrAfter(
                    moment(DateStartDayOf, "HH:mm")
                  ) ||
                  moment(datetime).format("HH:mm") ===
                    moment(DateStartDayOf).format("HH:mm");
                let isEnd =
                  moment(datetime, "HH:mm").isSameOrBefore(
                    moment(DateEndDayOf, "HH:mm")
                  ) ||
                  moment(datetime).format("HH:mm") ===
                    moment(DateEndDayOf).format("HH:mm");
                return isStart && isEnd;
              });
            } else {
              isDayOff = true;
            }
          }
        }

        newListTime.push({
          Time: datetime,
          Disable:
            moment()
              .add(window?.GlobalConfig?.APP?.ScheduledMinutes || 0, "minutes")
              .diff(datetime, "minutes") > 0 ||
            isDayOff ||
            this.checkScheduled({
              ...dataCheck,
              DateBook: DateTimeBook.date,
              Date: moment(day)
                .set({
                  hour: moment(datetime).get("hour"),
                  minute: moment(datetime).get("minute"),
                  second: moment(datetime).get("second"),
                })
                .toDate(),
            }),
        });
      }

      const TotalDisable = newListTime.filter((o) => o.Disable);
      const slideIndex =
        TotalDisable.length > 0 ? Math.floor((TotalDisable.length - 1) / 4) : 0;

      let newObj = {
        day: day,
        children: newListTime,
        childrenGroup: GroupByCount(newListTime, 4),
        slideIndex: slideIndex,
      };
      newListChoose.push(newObj);
    }
    this.setState({
      ListChoose: newListChoose,
    });
  };

  handleStock = (item) => {
    this.props.handleTime({
      ...this.props.DateTimeBook,
      stock: item.ID,
      nameStock: item.Title,
    });
    this.setState({
      visible: false,
    });
    this.handleCancelDate();
  };

  handleTime = (time) => {
    this.props.handleTime({
      ...this.props.DateTimeBook,
      time: moment(time).format("HH:mm"),
    });
  };
  handleSelectDate = (datetime) => {
    const date = moment(datetime).format("DD/MM/YYYY");
    this.props.handleTime({
      ...this.props.DateTimeBook,
      date,
      time: "",
      toDate: datetime,
    });
    //this.getListChoose(datetime, this.state.ListDisableChoose);
    this.setState({
      isOpen: false,
      isActive: 2,
    });
  };

  handleCancelDate = () => {
    this.setState({
      isOpen: false,
    });
  };

  configDate = (date) => {
    const dateSplit = date.split("/");
    return dateSplit[1] + "/" + dateSplit[0] + "/" + dateSplit[2];
  };

  render() {
    const {
      arrStock,
      isLoadingStock,
      isOpen,
      indexCurrent,
      isActive,
      ListChoose,
      openStock,
      visible,
    } = this.state;
    const { DateTimeBook } = this.props;

    const settings = {
      wrapAround: true,
      speed: 500,
      slidesToShow: 4,
      slidesToScroll: 4,
      cellSpacing: 10,
      renderBottomCenterControls: () => false,
      renderCenterLeftControls: null,
      renderCenterRightControls: ({ nextDisabled, nextSlide }) => (
        <div
          className={`support-scroll && ${nextDisabled ? "d-none" : ""}`}
          onClick={nextSlide}
        >
          <div className="support-scroll__text">
            Chọn khung giờ khác {nextDisabled}
          </div>
          <div className="support-scroll__icon">
            {/* <div className="line"></div> */}
            <div className="arrow">
              <i className="las la-arrow-right"></i>
            </div>
          </div>
        </div>
      ),
      afterChange: (current) => {},
      beforeChange: (current, next) => {},
    };

    return (
      <div className="page-schedule__box">
        <div className="pt-8px"></div>
        <div className="page-schedule__location">
          <h5>1. Chọn cơ sở đặt lịch</h5>
          <div className="page-schedule__location-list">
            <Row>
              {isLoadingStock && <SkeletonStock />}
              {!isLoadingStock && (
                <>
                  {window?.GlobalConfig?.APP?.ByProvince && (
                    <>
                      <div className="mb-8px">
                        {DateTimeBook.nameStock ? (
                          <div>
                            Bạn đang đặt lịch tại
                            <span className="pl-6px text-app2 fw-600">
                              {DateTimeBook.nameStock}
                            </span>
                          </div>
                        ) : (
                          "Bạn chưa chọn cơ sở đặt lịch."
                        )}

                        <div
                          className="text-primary mt-2px text-underline"
                          onClick={() =>
                            this.setState({
                              visible: true,
                            })
                          }
                        >
                          {DateTimeBook.nameStock
                            ? "Thay đổi cơ sở ?"
                            : "Chọn cơ sở ?"}
                        </div>
                      </div>
                      <StocksProvincesFilter
                        isOpen={visible}
                        onClose={() => this.setState({ visible: false })}
                        Stocks={arrStock}
                        onChange={(val) => this.handleStock(val)}
                        StockActive={
                          DateTimeBook.stock && Number(DateTimeBook.stock)
                        }
                      />
                    </>
                  )}
                  {!window?.GlobalConfig?.APP?.ByProvince && (
                    <>
                      {arrStock &&
                        arrStock.length <= 4 &&
                        arrStock.map((item, index) => (
                          <Col
                            width={arrStock.length > 1 ? "50" : "100"}
                            key={index}
                          >
                            <div className="location">
                              <div
                                className="location-item"
                                onClick={() => this.handleStock(item)}
                              >
                                <input
                                  id={"location-" + item.ID}
                                  type="radio"
                                  name="checklocation"
                                  value={item.ID}
                                  checked={
                                    parseInt(
                                      DateTimeBook.stock && DateTimeBook.stock
                                    ) === item.ID
                                  }
                                  readOnly
                                />
                                <label htmlFor={"location-" + item.ID}>
                                  {item.Title}
                                </label>
                                <div className="icon">
                                  <img src={IconLocation} alt="Location" />
                                </div>
                              </div>
                            </div>
                          </Col>
                        ))}
                      {arrStock && arrStock.length > 4 && (
                        <Col width="100">
                          <div
                            style={{
                              marginBottom: "10px",
                            }}
                            onClick={() => this.setState({ openStock: true })}
                          >
                            <Select
                              isDisabled
                              options={arrStock}
                              className="select-control"
                              classNamePrefix="select"
                              placeholder="Chọn cơ sở"
                              noOptionsMessage={() => "Không có dữ liệu"}
                              value={
                                DateTimeBook?.stock
                                  ? arrStock.filter(
                                      (x) =>
                                        parseInt(
                                          DateTimeBook.stock &&
                                            DateTimeBook.stock
                                        ) === x.ID
                                    )[0]
                                  : ""
                              }
                              onChange={(val) => this.handleStock(val)}
                              menuPosition="fixed"
                              styles={{
                                menuPortal: (base) => ({
                                  ...base,
                                  zIndex: 9999,
                                }),
                              }}
                              menuPortalTarget={document.body}
                              menuPlacement="top"
                            />
                          </div>
                          <Actions
                            className="action-stock"
                            opened={openStock}
                            onActionsClosed={() =>
                              this.setState({ openStock: false })
                            }
                          >
                            <ActionsGroup>
                              <div className="action-stock__list">
                                {arrStock &&
                                  arrStock.map((item) => (
                                    <div
                                      className={
                                        "action-stock__list-name " +
                                        (parseInt(
                                          DateTimeBook.stock &&
                                            DateTimeBook.stock
                                        ) === item.ID
                                          ? "currentStock"
                                          : "")
                                      }
                                      key={item.ID}
                                    >
                                      <input
                                        name="ValueStock"
                                        type="radio"
                                        value={item.ID}
                                        title={item.Title}
                                        id={"stock" + item.ID}
                                        checked={
                                          parseInt(
                                            DateTimeBook.stock &&
                                              DateTimeBook.stock
                                          ) === item.ID
                                        }
                                        onChange={(e) => {
                                          this.handleStock(item);
                                          this.setState({ openStock: false });
                                        }}
                                      />
                                      <label htmlFor={"stock" + item.ID}>
                                        {item.Title}{" "}
                                        <i className="las la-check"></i>
                                      </label>
                                    </div>
                                  ))}
                              </div>
                            </ActionsGroup>
                            <ActionsGroup>
                              <ActionsButton color="red">Đóng</ActionsButton>
                            </ActionsGroup>
                          </Actions>
                        </Col>
                      )}
                    </>
                  )}
                </>
              )}
            </Row>
          </div>
        </div>
        <div className="page-schedule__time">
          <h5>2. Chọn thời gian</h5>
          <div className="page-schedule__date mb-15px">
            <Row>
              {ListChoose &&
                ListChoose.map((item, index) => (
                  <Col width="33" key={index}>
                    {index === ListChoose.length - 1 ? (
                      <div
                        className="date-day"
                        onClick={() => {
                          this.setState({ isOpen: true });
                        }}
                      >
                        <span className={clsx(index === isActive && "active")}>
                          {index === isActive ? DateTimeBook.date : "Ngày khác"}
                        </span>
                      </div>
                    ) : (
                      <div
                        className="date-day"
                        onClick={() => {
                          const date = moment(item.day).format("DD/MM/YYYY");
                          this.props.handleTime({
                            ...this.props.DateTimeBook,
                            date,
                            time: "",
                            toDate: item.day,
                          });
                          this.setState({ isActive: index, isOpen: false });
                        }}
                      >
                        <span className={clsx(index === isActive && "active")}>
                          {moment(item.day).calendar({
                            sameDay: (now) =>
                              `[Hôm nay] ${moment(item.day).format("DD/MM")}`,
                            nextDay: (now) =>
                              `[Ngày mai] ${moment(item.day).format("DD/MM")}`,
                          })}
                        </span>
                      </div>
                    )}
                  </Col>
                ))}
            </Row>
            <DatePicker
              theme="ios"
              cancelText="Đóng"
              confirmText="Chọn"
              headerFormat="Ngày DD/MM/YYYY"
              showCaption={true}
              dateConfig={dateConfig}
              value={
                DateTimeBook.date
                  ? new Date(this.configDate(DateTimeBook.date))
                  : new Date()
              }
              isOpen={isOpen}
              onSelect={this.handleSelectDate}
              onCancel={this.handleCancelDate}
              min={moment().subtract(1, "days").toDate()}
            />
          </div>
          <Tabs>
            {ListChoose &&
              ListChoose.map((item, index) => (
                <Tab
                  key={index}
                  id={"tab-" + index}
                  className="page-tab-location"
                  tabActive={index === isActive}
                >
                  <div className="page-schedule__time-list mt-0">
                    <Carousel {...{ ...settings, slideIndex: item.slideIndex }}>
                      {item.childrenGroup &&
                        item.childrenGroup.map((group, groupIndex) => (
                          <div key={groupIndex}>
                            {group &&
                              group.map((time, timeIndex) => (
                                <div
                                  className="font-number mb-10px date-time-radio position-relative"
                                  key={timeIndex}
                                >
                                  <div
                                    className={clsx(
                                      "font-size-xs h-40px border rounded-sm d-flex align-items-center justify-content-center fw-600 time",
                                      time.Disable && "disabled bg-stripes",
                                      moment(time.Time).format("HH:mm") ===
                                        DateTimeBook.time &&
                                        DateTimeBook.date ===
                                          moment(item.day).format(
                                            "DD/MM/YYYY"
                                          ) &&
                                        "bg-ezs text-white"
                                    )}
                                    onClick={() =>
                                      !time.Disable &&
                                      this.handleTime(time.Time)
                                    }
                                  >
                                    {moment(time.Time).format("HH:mm A")}
                                  </div>
                                </div>
                              ))}
                          </div>
                        ))}
                    </Carousel>
                  </div>
                </Tab>
              ))}
          </Tabs>
        </div>
        {!window.GlobalConfig?.APP?.Booking?.hideNoteWarning && (
          <div className="text-danger bg-white p-15px font-size-xs line-height-sm">
            (*) Nếu khung giờ bạn chọn đã kín lịch, chúng tôi sẽ liên hệ trực
            tiếp để thông báo.
          </div>
        )}
      </div>
    );
  }
}
