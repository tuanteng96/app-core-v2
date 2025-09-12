import React, { useState } from "react";
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
import ReactApexChart from "react-apexcharts";
import ReactECharts from "echarts-for-react";

const ChartWithScroll = ({ options }) => {
  const onChartClick = (params) => {
    console.log("Clicked:", params);
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

const ChartWithScrollTotal = ({ options }) => {
  const onChartClick = (params) => {
    console.log("Clicked:", params);
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

export default class extends React.Component {
  constructor() {
    super();
    this.state = {
      data: {
        options: {
          title: { show: false },
          tooltip: { trigger: "axis" },
          legend: { data: ["Ngực trái", "Ngực phải"] },
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
              name: "Ngực trái",
              type: "bar",
              stack: "total",
              data: getMonthDays(new Date()).map(() => 0),
              label: {
                show: true,
                position: "inside", // hiển thị phía trên cột
              },
            },
            {
              name: "Ngực phải",
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
        let totalLeftChest =
          date.children?.reduce(
            (a, b) => a + (b.ParseData2?.LeftChest || 0),
            0
          ) || 0;
        let totalRightChest =
          date.children?.reduce(
            (a, b) => a + (b.ParseData2?.RightChest || 0),
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
      let names = Dates.map((d) => moment(d.date).format("DD/MM"));

      newOptions.xAxis.data = names;
      newOptions.series[0].data = Dates.map((d) => d.totalRightChest); // Ngực trái
      newOptions.series[1].data = Dates.map((d) => d.totalLeftChest); // Ngực phải

      this.setState({
        loading: false,
        data: { ...this.state.data, TotalArray: Dates },
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
      <Page ptr className="bg-white" onPtrRefresh={this.loadRefresh.bind(this)}>
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
              <span className="title">Biểu đồ hút sữa</span>
            </div>
            <div
              className="page-navbar__back"
              style={{
                width: "70px",
              }}
            ></div>
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

        <div className="pt-20px">
          <ChartWithScroll options={data.options} />
        </div>

        <div className="pt-20px">
          <ChartWithScrollTotal options={data.options} />
        </div>

        {/* <div
          style={{
            animation: loading ? "pulse 1.5s ease-in-out infinite" : "none",
          }}
        >
          <ReactApexChart
            options={state.options}
            series={state.series}
            type="bar"
            height={350}
          />
        </div> */}
      </Page>
    );
  }
}
