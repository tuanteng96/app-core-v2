import React from "react";
import {
  f7,
  Link,
  ListInput,
  Navbar,
  Page,
  Sheet,
  Subnavbar,
  Toolbar,
} from "framework7-react";
import PickerAdd from "./components/PickerAdd";
import staffService from "../../service/staff.service";
import { getUser } from "../../constants/user";
import moment from "moment";
import PickerViewList from "./components/PickerViewList";
import PickerDate from "./components/PickerDate";

function getStartEndOfWeek(date) {
  const startOfWeek = moment(date).isoWeekday(1).startOf("day"); // Thứ 2
  const endOfWeek = moment(date).isoWeekday(7).endOf("day"); // Chủ nhật
  return {
    startOfWeek: startOfWeek.toDate(),
    endOfWeek: endOfWeek.toDate(),
  };
}

function getWeekDays(date) {
  const startOfWeek = moment(date).isoWeekday(1); // Thứ 2
  const days = [];
  const today = moment();

  for (let i = 0; i < 7; i++) {
    const current = startOfWeek.clone().add(i, "days");

    days.push({
      date: startOfWeek.clone().add(i, "days").toDate(),
      isToday: current.isSame(today, "day"),
      avg: 0,
      count: 0,
      total: 0,
    });
  }
  return days;
}

export default class extends React.Component {
  constructor() {
    super();
    this.state = {
      data: {
        TotalArray: getWeekDays(new Date()),
        TimeArray: Array(5)
          .fill(0)
          .map((_, i) => ({
            Title: "",
            items: getWeekDays(new Date()),
          })),
      },
      loading: true,
      error: null,
      filters: {
        CrDate: new Date(),
      },
    };
  }

  fetchList = async () => {
    this.setState({ loading: true });
    try {
      const member = getUser();
      const { startOfWeek, endOfWeek } = getStartEndOfWeek(
        this.state.filters.CrDate
      );
      const { data: rs } = await staffService.getSuckMilk({
        MemberID: member.ID,
        FromDate: moment(startOfWeek).format("YYYY-MM-DD"),
        ToDate: moment(endOfWeek).format("YYYY-MM-DD"),
        Pi: 1,
        Ps: 1,
      });
      let Items = [];
      let Dates = [...getWeekDays(this.state.filters.CrDate)];
      let Times = [];

      if (rs.lst && rs.lst.length > 0) {
        let rsfirst = rs.lst[0];
        Items = rsfirst.Items
          ? rsfirst.Items.map((item) => ({
              ...item,
              ParseData2: item.Data2 ? JSON.parse(item.Data2) : null,
              RoundCreateDate: item.CreateDate
                ? moment(item.CreateDate).startOf("hour").toDate()
                : null,
            })).map((item) => ({
              ...item,
              ParseData2: item.ParseData2
                ? {
                    ...item.ParseData2,
                    TotalChest:
                      Number(item.ParseData2?.LeftChest || 0) +
                      Number(item.ParseData2?.RightChest || 0),
                  }
                : null,
            }))
          : [];
      }

      for (let [index, date] of Dates.entries()) {
        for (let item of Items) {
          if (moment(date.date).isSame(item.RoundCreateDate, "day")) {
            Dates[index]["children"] = [
              ...(Dates[index]["children"] || []),
              item,
            ];
          }
        }
      }

      Dates = Dates.map((date) => {
        let newDate = { ...date };
        let count = date.children?.length || 0;
        let total =
          date.children?.reduce(
            (a, b) => a + (b.ParseData2?.TotalChest || 0),
            0
          ) || 0;
        let avg = count > 0 ? Math.round(total / count) : 0;
        return { ...newDate, count, total, avg };
      });

      Times = [
        ...new Set(
          Items.map((item) => item.RoundCreateDate).map((d) =>
            moment(d).format("HH:mm")
          )
        ),
      ].sort((a, b) => {
        const toMinutes = (t) => {
          const [h, m] = t.split(":").map(Number);
          return h * 60 + m;
        };
        return toMinutes(a) - toMinutes(b);
      });

      while (Times.length < 5) {
        Times.push("");
      }
      Times = Times.map((time) => ({
        Title: time,
        items: getWeekDays(this.state.filters.CrDate).map((day) => {
          let newDay = { ...day };
          newDay["children"] = Items
            ? Items.filter(
                (x) =>
                  moment(x.RoundCreateDate).format("DD/MM/YYYY") ===
                    moment(day.date).format("DD/MM/YYYY") &&
                  time === moment(x.RoundCreateDate).format("HH:mm")
              ).sort(
                (a, b) =>
                  moment(b.CreateDate).valueOf() -
                  moment(a.CreateDate).valueOf()
              )
            : [];
          newDay["sum"] = newDay["children"].reduce(
            (a, b) => a + (b.ParseData2?.TotalChest || 0),
            0
          );
          newDay["count"] = newDay["children"]?.length || 0;
          newDay["avg"] =
            newDay["count"] > 0
              ? Math.round(newDay["sum"] / newDay["count"])
              : 0;
          return newDay;
        }),
      }));

      this.setState({
        loading: false,
        data: { ...this.state.data, TotalArray: Dates, TimeArray: Times },
      });

      f7.dialog.close();
    } catch (err) {
      console.log(err);
    }
  };

  async componentDidMount() {
    await this.fetchList();
  }

  async componentDidUpdate(prevProps, prevState) {
    if (prevState.filters !== this.state.filters) {
      await this.fetchList();
    }
  }

  loadRefresh(done) {
    this.fetchList().then(() => done());
  }

  render() {
    let { filters, data, loading } = this.state;

    return (
      <Page
        noToolbar
        ptr
        className="bg-white"
        onPtrRefresh={this.loadRefresh.bind(this)}
      >
        <Navbar>
          <div className="page-navbar">
            <div className="page-navbar__back">
              <Link
                onClick={() => {
                  this.$f7router.back();
                }}
              >
                <i className="las la-arrow-left"></i>
              </Link>
            </div>
            <div className="page-navbar__title">
              <span className="title">Thống kê hút sữa</span>
            </div>
            <div
              className="page-navbar__back"
              style={{
                width: "70px",
              }}
            >
              <PickerAdd refetch={this.fetchList}>
                {({ open }) => (
                  <Link
                    style={{
                      width: "100%",
                    }}
                    onClick={open}
                  >
                    <div
                      style={{
                        fontSize: "14px",
                        lineHeight: "16px",
                      }}
                    >
                      + Thêm
                    </div>
                  </Link>
                )}
              </PickerAdd>
            </div>
          </div>
          <Subnavbar className="sub-nav-bar">
            <div className="w-100 h-100 position-relative">
              <i
                className="las la-calendar"
                style={{
                  position: "absolute",
                  right: "15px",
                  fontSize: "24px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  pointerEvents: "none",
                }}
              ></i>
              <PickerDate
                headerFormat="DD/MM/YYYY"
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
                onChange={(date) => {
                  this.setState({
                    filters: { ...this.state.filters, CrDate: date },
                  });
                }}
                value={filters.CrDate}
                className="w-100 h-100"
              >
                {({ open }) => (
                  <div
                    onClick={open}
                    className="px-15px fw-500 h-100 d--f ai--c"
                    style={{ fontSize: "14px" }}
                  >
                    {moment(
                      getStartEndOfWeek(filters.CrDate).startOfWeek
                    ).format("DD/MM/YYYY")}
                    <span className="px-8px">-</span>
                    {moment(getStartEndOfWeek(filters.CrDate).endOfWeek).format(
                      "DD/MM/YYYY"
                    )}
                  </div>
                )}
              </PickerDate>
            </div>
          </Subnavbar>
        </Navbar>
        <style>
          {`
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.2;
            }
          }
        `}
        </style>
        <div
          style={{
            animation: loading ? "pulse 1.5s ease-in-out infinite" : "none",
          }}
        >
          <div
            style={{
              background: "#f1f1f1",
              gridTemplateColumns: "repeat(8, 1fr)",
              display: "grid",
              borderBottom: "1px solid #e1e1e1",
            }}
          >
            <div
              className="h-45px d--f ai--c jc--c fw-500"
              style={{
                fontSize: "12px",
                textTransform: "uppercase",
              }}
            >
              Ngày
            </div>
            {getWeekDays(filters.CrDate).map((item, index) => (
              <div
                className="h-45px d--f ai--c jc--c fw-500"
                style={{
                  fontSize: "12px",
                  color: item.isToday ? "var(--ezs-color)" : "#000",
                }}
                key={index}
              >
                {moment(item.date).format("DD/MM")}
              </div>
            ))}
          </div>
          <div
            style={{
              background: "#f1f1f1",
              gridTemplateColumns: "repeat(8, 1fr)",
              display: "grid",
              borderBottom: "1px solid #e1e1e1",
            }}
          >
            <div
              className="h-45px d--f ai--c jc--c fw-500"
              style={{
                fontSize: "12px",
                textTransform: "uppercase",
              }}
            >
              Tổng
            </div>
            {data.TotalArray &&
              data.TotalArray.map((item, index) => (
                <div
                  className="h-45px d--f ai--c jc--c fw-500"
                  style={{
                    fontSize: "12px",
                    color: item.isToday ? "var(--ezs-color)" : "#000",
                  }}
                  key={index}
                >
                  {item?.total || "-"}
                </div>
              ))}
          </div>
          <div
            style={{
              background: "#f1f1f1",
              gridTemplateColumns: "repeat(8, 1fr)",
              display: "grid",
              borderBottom: "1px solid #e1e1e1",
            }}
          >
            <div
              className="h-45px d--f ai--c jc--c fw-500"
              style={{
                fontSize: "12px",
                textTransform: "uppercase",
              }}
            >
              TB
            </div>
            {data.TotalArray &&
              data.TotalArray.map((item, index) => (
                <div
                  className="h-45px d--f ai--c jc--c fw-500"
                  style={{
                    fontSize: "12px",
                    color: item.isToday ? "var(--ezs-color)" : "#000",
                  }}
                  key={index}
                >
                  {item?.avg || "-"}
                </div>
              ))}
          </div>
          <div
            style={{
              background: "#f1f1f1",
              gridTemplateColumns: "repeat(8, 1fr)",
              display: "grid",
              borderBottom: "1px solid #e1e1e1",
            }}
          >
            <div
              className="h-45px d--f ai--c jc--c fw-500"
              style={{
                fontSize: "12px",
                textTransform: "uppercase",
              }}
            >
              SL
            </div>
            {data.TotalArray &&
              data.TotalArray.map((item, index) => (
                <div
                  className="h-45px d--f ai--c jc--c fw-500"
                  style={{
                    fontSize: "12px",
                    color: item.isToday ? "var(--ezs-color)" : "#000",
                  }}
                  key={index}
                >
                  {item?.count || "-"}
                </div>
              ))}
          </div>

          {data.TimeArray &&
            data.TimeArray.map((time, index) => (
              <div
                key={index}
                style={{
                  background: "#fff",
                  gridTemplateColumns: "repeat(8, 1fr)",
                  display: "grid",
                  borderBottom: "1px solid #f1f1f1",
                }}
              >
                <div
                  className="h-45px d--f ai--c jc--c fw-500"
                  style={{
                    fontSize: "12px",
                    backgroundColor: "#f1f1f1",
                  }}
                >
                  {time.Title
                    ? moment(time.Title, "HH:mm").format("H") + "h"
                    : "-"}
                </div>
                {time.items.map((sub, i) => {
                  if (sub.children && sub.children.length > 1) {
                    return (
                      <PickerViewList
                        key={i}
                        Items={sub.children}
                        refetch={this.fetchList}
                        item={time}
                        sub={sub}
                      >
                        {({ open }) => (
                          <div
                            onClick={open}
                            className="h-45px d--f ai--c jc--c fw-500"
                            style={{
                              fontSize: "12px",
                              backgroundColor:
                                sub?.sum > 0
                                  ? sub?.sum >
                                    window?.GlobalConfig?.APP?.AverageMilk
                                    ? "#067f08"
                                    : "#ffa701"
                                  : "transparent",
                            }}
                          >
                            {sub?.sum > 0 ? sub.sum : "-"}
                          </div>
                        )}
                      </PickerViewList>
                    );
                  }
                  return (
                    <PickerAdd
                      key={i}
                      item={
                        sub?.children && sub?.children.length > 0
                          ? sub.children[0]
                          : null
                      }
                      refetch={this.fetchList}
                    >
                      {({ open }) => (
                        <div
                          onClick={() => {
                            if (sub?.children && sub?.children.length > 0)
                              open();
                          }}
                          className="h-45px d--f ai--c jc--c fw-500"
                          style={{
                            fontSize: "12px",
                            backgroundColor:
                              sub?.sum > 0
                                ? sub?.sum > 200
                                  ? "#067f08"
                                  : "#ffa701"
                                : "transparent",
                          }}
                        >
                          {sub?.sum > 0 ? sub.sum : "-"}
                        </div>
                      )}
                    </PickerAdd>
                  );
                })}
              </div>
            ))}
        </div>
        <div className="p-15px">
          <div className="d--f ai--c mb-8px" style={{ gap: "8px" }}>
            <div
              style={{
                width: "25px",
                height: "16px",
                background: "#67b269",
                border: "1px solid #f1f1f1",
              }}
            ></div>
            <div
              style={{
                fontSize: "13px",
                fontWeight: "300",
              }}
            >
              Các giá trị trên mức trung bình
            </div>
          </div>
          <div className="d--f ai--c" style={{ gap: "8px" }}>
            <div
              style={{
                width: "25px",
                height: "16px",
                background: "#ffa602",
                border: "1px solid #f1f1f1",
              }}
            ></div>
            <div
              style={{
                fontSize: "13px",
                fontWeight: "300",
              }}
            >
              Các giá trị dưới mức trung bình
            </div>
          </div>
          <div
            className="p-15px mt-15px"
            style={{
              background: "#f1f1f1",
              fontSize: "13px",
              borderLeft: "4px solid #dedede",
              color: "#494949",
            }}
          >
            <div>
              <div className="mb-2px">
                - "Giá trị trung bình" được tính bằng trung bình cộng của tất cả
                các giá trị đang hiển thị trên màn hình.
              </div>
              <div>
                - Bảng này có giá trị nhất khi các mom kích sữa / cho bé ăn đúng
                giờ.
              </div>
            </div>
          </div>
          <div className="mt-15px">
            <Link
              href="/report-suck-milk-chart/"
              noLinkClass
              className="btn-reviews w-100 text-center"
              style={{
                display: "block",
              }}
            >
              Biểu đồ hút sữa
            </Link>
          </div>
        </div>
      </Page>
    );
  }
}
