import React from "react";
import { Page, Link, Navbar, Toolbar, PhotoBrowser } from "framework7-react";
import moment from "moment";
import "moment/locale/vi";
import Dom7 from "dom7";
import { getUser } from "../../constants/user";
import userService from "../../service/user.service";
import clsx from "clsx";
import PageNoData from "../../components/PageNoData";
import Skeleton from "react-loading-skeleton";
moment.locale("vi");

export default class extends React.Component {
  constructor() {
    super();
    this.state = {
      List: [],
      isLoading: false,
    };
  }
  componentDidMount() {
    this.getHistory();
  }

  groupbyDDHis(arr, name = "BookDate") {
    const newArr = [];
    if (!arr) return false;
    arr.map((item) => {
      const dayFull = item[name];
      const d = (dayFull || "").split("T")[0];
      var g = null;
      newArr.every((_g) => {
        if (_g.day == d) g = _g;
        return g == null;
      });
      if (g == null) {
        g = {
          day: d,
          dayFull: dayFull,
          items: [],
        };
        newArr.push(g);
      }
      g.items.push(item);
    });
    return newArr
      .map((item) => ({
        ...item,
        items: item.items.sort(function (left, right) {
          return moment.utc(right[name]).diff(moment.utc(left[name]));
        }),
      }))
      .sort(function (left, right) {
        return moment.utc(right.dayFull).diff(moment.utc(left.dayFull));
      });
  }

  getHistory = (callback) => {
    const infoUser = getUser();
    if (!infoUser) return false;

    this.setState({
      isLoading: true,
    });

    userService.historyService(infoUser.ID).then(({ data }) => {
      const dataNew = [];

      if (data && data.length > 0) {
        for (let item of data) {
          for (let service of item.Services) {
            if (service.Status === "done")
              dataNew.push({
                ...service,
                ProdTitle: item.OrderItem.ProdTitle,
                os: service,
              });
          }
        }
      }

      this.setState({
        List: this.groupbyDDHis(dataNew),
        isLoading: false,
      });
      callback && callback();
    });
  };

  loadMore(done) {
    const self = this;
    self.getHistory(() => done());
  }

  render() {
    const { List, isLoading } = this.state;
    return (
      <Page
        ptr
        onPtrRefresh={this.loadMore.bind(this)}
        name="history-service"
        className="history-service"
        noToolbar
      >
        <Navbar>
          <div className="page-navbar">
            <div className="page-navbar__back">
              <Link onClick={() => this.$f7router.back()}>
                <i className="las la-angle-left"></i>
              </Link>
            </div>
            <div className="page-navbar__title">
              <span className="title">Lịch sử dịch vụ</span>
            </div>
            <div className="page-navbar__noti"></div>
          </div>
        </Navbar>
        <div className="p-20px">
          {isLoading && <Skeleton height={150} />}
          {!isLoading && (
            <>
              {List &&
                List.length > 0 &&
                List.map((item, index) => (
                  <div key={index}>
                    <div class="fw-700 mb-10px d--f ai--c">
                      <div
                        style={{
                          width: "0.375rem",
                          height: "0.375rem",
                          background: "#3699FF",
                          borderRadius: "9999px",
                          marginRight: "0.5rem",
                        }}
                      ></div>
                      <div
                        class="px-3 py-1 rounded overflow-hidden position-relative"
                        style={{
                          padding: "0.25rem 0.75rem",
                          zIndex: 1,
                        }}
                      >
                        <div
                          className="position-absolute w-100 h-100 top-0 left-0"
                          style={{
                            background: "var(--ezs-color)",
                            zIndex: "-1",
                            opacity: ".2",
                          }}
                        ></div>
                        Ngày {moment(item.dayFull).format("ll")}
                      </div>
                    </div>
                    <div>
                      {item.items &&
                        item.items.map((k, idx) => (
                          <div
                            class="bg-white p-12px rounded mb-12px"
                            key={idx}
                          >
                            <div class="font-medium text-muted mb-5px">
                              {moment(k.BookDate).format("HH:mm")}
                            </div>
                            <div class="zoom text-sm">
                              <div class="text-[#3f4254] mb-3px">
                                {k.ProdTitle}{" "}
                              </div>
                              <div class="text-muted">
                                {k.ProdService || k.ProdService2}
                              </div>
                            </div>
                            {(k.Rate || k.Rate == 0) && (
                              <div class="border-top pt-10px mt-10px">
                                <div class="d--f ai--c">
                                  {[1, 2, 3, 4, 5].map((v, i) => (
                                    <svg
                                      className={clsx(
                                        "mr-5px",
                                        v > k.Rate
                                          ? "text-muted"
                                          : "text-warning"
                                      )}
                                      key={i}
                                      style={{
                                        width: "15px",
                                      }}
                                      aria-hidden="true"
                                      xmlns="http://www.w3.org/2000/svg"
                                      fill="currentColor"
                                      viewBox="0 0 22 20"
                                    >
                                      <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
                                    </svg>
                                  ))}

                                  <div class="ml-2px text-[13px] text-gray-500">
                                    {k.Rate}
                                  </div>
                                  <div class="ml-2px text-[13px] text-gray-500">
                                    trên
                                  </div>
                                  <div class="ml-2px text-[13px] text-gray-500">
                                    5
                                  </div>
                                </div>
                                {k.RateNote && (
                                  <div class="text-muted text-[13px] mt-5px">
                                    {k.RateNote}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              {(!List || List.length) === 0 && (
                <PageNoData text="Bạn chưa có lịch sử !" />
              )}
            </>
          )}
        </div>
      </Page>
    );
  }
}
