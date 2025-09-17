import React, { useEffect, useRef, useState } from "react";
import { f7, Link, Navbar, Page, Subnavbar } from "framework7-react";
import PickerAdd from "./components/PickerAdd";
import staffService from "../../service/staff.service";
import { getUser } from "../../constants/user";
import moment from "moment";
import PickerDate from "./components/PickerDate";
import ReactECharts from "echarts-for-react";
import { toast } from "react-toastify";

function getStartEndOfMonth(date) {
  const startOfMonth = moment(date).startOf("month").startOf("day"); // Ngày 1
  const endOfMonth = moment(date).endOf("month").endOf("day"); // Ngày cuối
  return {
    startOfMonth: startOfMonth.toDate(),
    endOfMonth: endOfMonth.toDate(),
  };
}

function getMonthDays(date) {
  const startOfMonth = moment(date).startOf("month");
  const endOfMonth = moment(date).endOf("month");
  const daysInMonth = endOfMonth.date(); // Số ngày trong tháng
  const today = moment();
  const days = [];

  for (let i = 0; i < daysInMonth; i++) {
    const current = startOfMonth.clone().add(i, "days");

    days.push({
      date: current.toDate(),
      isToday: current.isSame(today, "day"),
      avg: 0,
      count: 0,
      total: 0,
    });
  }
  return days;
}

const timelineContainer = {
  position: "relative",
};

const itemStyle = {
  position: "relative",
  padding: "10px 0 10px 35px",
};

const timeStyle = {
  fontWeight: "600",
  fontSize: "13px",
  marginBottom: "2px",
};

const iconStyle = {
  position: "absolute",
  left: "0",
  top: "7px",
  width: "24px",
  height: "24px",
  backgroundColor: "#fce4ec",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "12px",
  color: "#ec407a",
  zIndex: 2,
};

const totalStyle = {
  fontWeight: "600",
  fontSize: "16px",
};

const chipGroup = {
  display: "flex",
  gap: "8px",
  marginTop: "4px",
};

const chip = (bg, color) => ({
  padding: "2px 8px",
  backgroundColor: bg,
  color,
  borderRadius: "6px",
  fontSize: "12px",
});

const ChartWithScroll = ({
  options,
  CrDate,
  data,
  filters,
  refetch,
  onClick,
}) => {
  const chartRef = useRef(null);
  const [sub, setSub] = useState({ count: 0, sum: 0, avg: 0 });
  const [Items, setItems] = useState([]);

  useEffect(() => {
    if (data && data.length > 0) {
      let subData = data.find(
        (d) => d.date && moment(d.date).format("DD/MM") === CrDate
      );
      if (subData) {
        setSub({
          count: subData.count || 0,
          sum: subData.total || 0,
          avg: subData.avg || 0,
        });
        setItems(subData.children || []);
      }
    } else {
      setSub({ count: 0, sum: 0, avg: 0 });
      setItems([]);
    }
  }, [CrDate, data]);

  useEffect(() => {
    const chartInstance = chartRef.current?.getEchartsInstance();
    if (!chartInstance) return;

    const categories = options.xAxis.data;

    const targetIndex = categories.indexOf(CrDate);
    if (targetIndex !== -1) {
      const total = categories.length;
      const visibleCount = 6; // số cột hiển thị cùng lúc
      const startIndex = Math.max(
        targetIndex - Math.floor(visibleCount / 2),
        0
      );
      const endIndex = Math.min(startIndex + visibleCount, total);

      const startPercent = (startIndex / total) * 100;
      const endPercent = (endIndex / total) * 100;

      chartInstance.dispatchAction({
        type: "dataZoom",
        start: startPercent,
        end: endPercent,
      });
    }
  }, [options, CrDate, Items]);

  const onChartClick = (params) => {
    onClick && onClick(params.name);
  };

  const onEvents = {
    click: onChartClick,
  };

  return (
    <div>
      <div style={{ width: "100%", height: "400px" }}>
        <ReactECharts
          onEvents={onEvents}
          option={options}
          style={{ height: "100%" }}
          ref={chartRef}
        />
      </div>
      <div className="p-15px">
        <div
          className="p-15px"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "15px",
            background: "#f1f1f1",
            borderRadius: "8px",
          }}
        >
          <div
            className="text-center pb-12px text-uppercase fw-600"
            style={{
              gridColumn: "span 3/span 3",
              borderBottom: "1px solid #d9d9d9",
            }}
          >
            <div>
              Ngày {CrDate}/{moment(filters.CrDate).format("YYYY")}
            </div>
          </div>
          <div className="text-center">
            <div>Số lần</div>
            <div
              className="fw-600 pt-2px"
              style={{
                fontSize: "16px",
              }}
            >
              {sub.count}
            </div>
            <div className="text-muted">lần</div>
          </div>
          <div className="text-center">
            <div>Tổng</div>
            <div
              className="fw-600 pt-2px"
              style={{
                fontSize: "16px",
              }}
            >
              {sub.sum}
            </div>
            <div className="text-muted">ml</div>
          </div>
          <div className="text-center">
            <div>Trung bình</div>
            <div
              className="fw-600 pt-2px"
              style={{
                fontSize: "16px",
              }}
            >
              {sub.avg}
            </div>
            <div className="text-muted">ml/lần</div>
          </div>
        </div>
        <div className="mt-15px position-relative">
          <div style={timelineContainer}>
            {Items &&
              Items.map((time, idx) => (
                <PickerAdd
                  isSuckMilk={true}
                  key={idx}
                  item={time}
                  refetch={refetch}
                >
                  {({ open }) => (
                    <div onClick={open} style={itemStyle}>
                      <div style={iconStyle}>🍼</div>
                      <div className="d--f jc--sb">
                        <div className="text-muted" style={timeStyle}>
                          {moment(time.CreateDate).format("HH:mm")}
                        </div>
                        <div className="text-muted">
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
                              d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                            />
                          </svg>
                        </div>
                      </div>

                      <div className="mb-5px">
                        <span style={totalStyle}>
                          {time?.ParseData3?.TotalChest || 0}ml
                        </span>
                      </div>
                      <div style={chipGroup}>
                        <span style={chip("rgb(173,216,230)", "#000")}>
                          Bú bình {time?.ParseData3?.LeftChest || 0} ml
                        </span>
                        <span style={chip("rgb(255,183,197)", "#000")}>
                          Bú mẹ {time?.ParseData3?.RightChest || 0} ml
                        </span>
                      </div>
                      {time?.ParseData3?.Desc && (
                        <div className="mt-12px">{time?.ParseData3?.Desc}</div>
                      )}
                    </div>
                  )}
                </PickerAdd>
              ))}
          </div>
          <div
            style={{
              position: "absolute",
              top: 0,
              left: "11px",
              height: "100%",
              borderLeft: "2px dashed #ddd",
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

const ChartWithScrollTotal = ({ options, onChangeDetail }) => {
  const onChartClick = (params) => {
    onChangeDetail(params.name, true);
  };

  const onEvents = {
    click: onChartClick,
  };

  return (
    <div style={{ width: "100%", height: "400px" }}>
      <ReactECharts
        onEvents={onEvents}
        option={options}
        style={{ height: "100%" }}
      />
    </div>
  );
};

export default class extends React.Component {
  constructor() {
    super();
    this.state = {
      data: {
        options: {
          title: { show: false },
          tooltip: { show: false, axisPointer: { type: "none" } },
          legend: { data: ["Bú bình", "Bú mẹ"] },
          grid: {
            left: 60, // giữ khoảng trống cho trục Y
            right: 15,
            bottom: 50,
          },
          xAxis: {
            type: "category",
            data: getMonthDays(new Date()).map((d) =>
              moment(d.date).format("DD/MM")
            ),
            axisPointer: { show: false },
          },
          yAxis: {
            type: "value",
            axisLabel: {
              formatter: (value) => `${value} ml`, // ➕ Hậu tố "ml"
            },
            axisPointer: { show: false },
          },
          dataZoom: [
            {
              type: "slider",
              xAxisIndex: 0,
              start: 0,
              end: 20, // chỉ hiển thị 50% ban đầu
              show: false,
            },
            {
              type: "inside",
              xAxisIndex: 0,
              start: 0,
              end: 50,
            },
          ],
          series: [
            {
              name: "Bú mẹ",
              type: "bar",
              stack: "total",
              data: getMonthDays(new Date()).map(() => 0),
              label: {
                show: true,
                position: "inside", // hiển thị phía trên cột
              },
              itemStyle: {
                color: "rgb(255,183,197)", // ✅ Màu nền của cột Ngực trái
              },
              showSymbol: false,
              markPoint: { data: [] },
              formatter: (params) => (params.value > 0 ? params.value : ""),
            },
            {
              name: "Bú bình",
              type: "bar",
              stack: "total",
              data: getMonthDays(new Date()).map(() => 0),
              label: {
                show: true,
                position: "inside", // hiển thị phía trên cột
              },
              itemStyle: {
                color: "rgb(173,216,230)", // ✅ Màu nền của cột Ngực trái
              },
              showSymbol: false,
              markPoint: { data: [] },
              formatter: (params) => (params.value > 0 ? params.value : ""),
            },
          ],
        },
        optionsTotal: {
          title: { show: false },
          tooltip: { trigger: "axis" },
          grid: {
            left: 60, // giữ khoảng trống cho trục Y
            right: 15,
            bottom: 50,
            top: 20,
          },
          xAxis: {
            type: "category",
            data: getMonthDays(new Date()).map((d) =>
              moment(d.date).format("DD/MM")
            ),
          },
          yAxis: {
            type: "value",
            axisLabel: {
              formatter: (value) => `${value} ml`, // ➕ Hậu tố "ml"
            },
          },
          dataZoom: [
            {
              type: "slider",
              xAxisIndex: 0,
              start: 0,
              end: 20, // chỉ hiển thị 50% ban đầu
              show: false,
            },
            {
              type: "inside",
              xAxisIndex: 0,
              start: 0,
              end: 50,
            },
          ],
          series: [
            {
              name: "Tổng",
              type: "bar",
              stack: "total",
              data: getMonthDays(new Date()).map(() => 0),
              label: {
                show: true,
                position: "inside", // hiển thị phía trên cột
              },
            },
          ],
        },
        data: [],
      },
      loading: true,
      error: null,
      filters: {
        CrDate: new Date(),
      },
      isDetail: false,
      CrDate: moment().format("DD/MM"),
    };
  }

  fetchList = async () => {
    this.setState({ loading: true });
    try {
      const member = getUser();
      const { startOfMonth, endOfMonth } = getStartEndOfMonth(
        this.state.filters.CrDate
      );
      const { data: rs } = await staffService.getSuckMilk({
        MemberID: member.ID,
        FromDate: moment(startOfMonth).format("YYYY-MM-DD"),
        ToDate: moment(endOfMonth).format("YYYY-MM-DD"),
        Pi: 1,
        Ps: 1,
      });
      let Items = [];
      let Dates = [...getMonthDays(this.state.filters.CrDate)];

      if (rs.lst && rs.lst.length > 0) {
        let rsfirst = rs.lst[0];
        Items = rsfirst.Items
          ? rsfirst.Items.map((item) => ({
              ...item,
              ParseData3: item.Data3 ? JSON.parse(item.Data3) : null,
              RoundCreateDate: item.CreateDate
                ? moment(item.CreateDate).startOf("hour").toDate()
                : null,
            })).map((item) => ({
              ...item,
              ParseData3: item.ParseData3
                ? {
                    ...item.ParseData3,
                    TotalChest:
                      Number(item.ParseData3?.LeftChest || 0) +
                      Number(item.ParseData3?.RightChest || 0),
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
        newDate["children"] = date.children
          ? date.children.filter((x) => x.Data3)
          : [];
        let count =
          (date.children && date.children.filter((x) => x.Data3)?.length) || 0;
        let total =
          date.children?.reduce(
            (a, b) => a + (b.ParseData3?.TotalChest || 0),
            0
          ) || 0;
        let totalLeftChest =
          date.children?.reduce(
            (a, b) => a + (b.ParseData3?.LeftChest || 0),
            0
          ) || 0;
        let totalRightChest =
          date.children?.reduce(
            (a, b) => a + (b.ParseData3?.RightChest || 0),
            0
          ) || 0;
        let avg = count > 0 ? Math.round(total / count) : 0;
        return {
          ...newDate,
          count,
          total,
          avg,
          totalLeftChest,
          totalRightChest,
        };
      });

      let newOptions = { ...this.state.data.options };
      let newOptionsTotal = { ...this.state.data.optionsTotal };
      let names = Dates.map((d) => moment(d.date).format("DD/MM"));

      newOptions.xAxis.data = names;
      newOptions.series[0].data = Dates.map((d) => d.totalRightChest); // Bú mẹ
      newOptions.series[1].data = Dates.map((d) => d.totalLeftChest); // Bú bình

      newOptionsTotal.xAxis.data = names;
      newOptionsTotal.series[0].data = Dates.map((d) => d.total);

      this.setState({
        loading: false,
        data: {
          ...this.state.data,
          options: newOptions,
          optionsTotal: newOptionsTotal,
          data: Dates,
        },
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

  onChangeDetail = (date, status) => {
    this.setState({
      isDetail: status,
      CrDate: date || moment().format("DD/MM"),
    });
  };

  render() {
    let { filters, data, loading, isDetail, CrDate } = this.state;

    return (
      <Page noToolbar className="bg-white">
        <Navbar>
          <div className="page-navbar">
            <div className="page-navbar__back">
              <Link
                onClick={() => {
                  if (isDetail) {
                    this.setState({
                      isDetail: false,
                    });
                  } else {
                    this.$f7router.back();
                  }
                }}
              >
                <i className="las la-arrow-left"></i>
              </Link>
            </div>
            <div className="page-navbar__title">
              <span className="title">Biểu đồ bú sữa</span>
            </div>
            <div
              className="page-navbar__back"
              style={{
                width: "70px",
              }}
            >
              <PickerAdd isSuckMilk={true} refetch={this.fetchList}>
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
                    isDetail: false,
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
                      getStartEndOfMonth(filters.CrDate).startOfMonth
                    ).format("DD/MM/YYYY")}
                    <span className="px-8px">-</span>
                    {moment(
                      getStartEndOfMonth(filters.CrDate).endOfMonth
                    ).format("DD/MM/YYYY")}
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
        <div className="h-100 d--f fd--c">
          <div
            className="px-15px d--f ai--c jc--sb"
            style={{
              borderBottom: "1px solid #eee",
              height: "45px",
              minHeight: "45px",
            }}
          >
            <div
              style={{
                color: "var(--ezs-color)",
              }}
            >
              Hiển thị biểu đồ chi tiết
            </div>
            <div
              className="position-absolute right-15px"
              onClick={() => {
                if (
                  moment(filters.CrDate).format("MM-YYYY") ===
                  moment().format("MM-YYYY")
                ) {
                  this.onChangeDetail(null, !isDetail);
                } else {
                  if (isDetail) {
                    this.onChangeDetail(null, !isDetail);
                  } else {
                    toast.warning(
                      "Mom nhấn vào cột ở đồ thị bên trên để xem chi tiết từng ngày nhé !",
                      {
                        position: toast.POSITION.TOP_CENTER,
                        autoClose: 1000,
                      }
                    );
                  }
                }
              }}
            >
              <div
                style={{
                  width: 45,
                  height: 26,
                  borderRadius: "30px",
                  background: isDetail ? "#3ac656" : "#e6e6e6",
                  transition: "all 0.3s",
                }}
              ></div>
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  background: "#fff",
                  position: "absolute",
                  top: "2px",
                  left: "2px",
                  transition: "all 0.3s",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
                  transform: isDetail ? "translateX(19px)" : "translateX(0px)",
                }}
              ></div>
            </div>
          </div>
          <div
            style={{
              flexGrow: 1,
              overflow: "auto",
              animation: loading ? "pulse 1.5s ease-in-out infinite" : "none",
            }}
          >
            {!isDetail && (
              <div className="pt-20px">
                <ChartWithScrollTotal
                  options={data.optionsTotal}
                  onChangeDetail={this.onChangeDetail}
                  filters={filters}
                  refetch={this.fetchList}
                />
                <div
                  className="text-center mt-20px px-30px"
                  style={{ fontSize: 14, fontStyle: "italic" }}
                >
                  Mom nhấn vào cột ở đồ thị bên trên để xem chi tiết từng ngày
                  nhé !
                </div>
              </div>
            )}

            {isDetail && (
              <div className="pt-20px">
                <ChartWithScroll
                  options={data.options}
                  CrDate={CrDate}
                  data={data?.data || []}
                  filters={filters}
                  refetch={this.fetchList}
                  onClick={(val) =>
                    this.setState({
                      CrDate: val,
                    })
                  }
                />
              </div>
            )}
          </div>
        </div>
      </Page>
    );
  }
}
