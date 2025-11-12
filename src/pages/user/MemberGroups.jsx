import React, { createRef } from "react";
import { Page, Link, Navbar, f7 } from "framework7-react";
import moment from "moment";
import "moment/locale/vi";
import { getUser } from "../../constants/user";
import userService from "../../service/user.service";
import clsx from "clsx";
import PageNoData from "../../components/PageNoData";
import Skeleton from "react-loading-skeleton";
import { formatPriceVietnamese } from "../../constants/format";
moment.locale("vi");

export default class extends React.Component {
  constructor() {
    super();
    this.state = {
      Lists: [],
      isLoading: false,
    };

    this.currentRef = createRef();
  }
  componentDidMount() {
    this.getHistory();
  }

  getHistory = async (callback) => {
    const infoUser = getUser();
    if (!infoUser) return false;

    this.setState({
      isLoading: true,
    });

    let { data: Info } = await userService.getInfo();

    let Point = 0;

    if (Info?.Present?.cashSum && Info?.Present?.cashSum.length > 0) {
      Point = Info?.Present?.cashSum[0]?.Payed;
    }

    userService
      .getMemberGroups({
        cmd: "get",
        "(filter)StockID": Info?.ByStockID,
        sort: "[Point] desc",
        Pi: 1,
        Ps: 100,
      })
      .then(({ data }) => {
        let rs = [];
        if (data?.data?.list && data?.data?.list.length > 0) {
          let newData = data?.data?.list.sort(
            (a, b) => Number(a.Point) - Number(b.Point)
          );

          let currentIndex = -1;

          if (Point < newData[0].Point) {
            currentIndex = -1;
          } else {
            for (let i = 0; i < newData.length; i++) {
              if (
                Point >= newData[i].Point &&
                (!newData[i + 1] || Point < newData[i + 1].Point)
              ) {
                currentIndex = i;
                break;
              }
            }
          }

          rs = newData.map((item, i) => {
            let status = "none";
            let need = 0;

            if (currentIndex === -1 && i === 0) {
              status = "next";
              need = item.Point - Point;
            } else if (i === currentIndex) {
              status = "current";
            } else if (i === currentIndex + 1) {
              status = "next";
              need = item.Point - Point;
            }

            return { ...item, status, need };
          });
        }

        this.setState(
          {
            Lists: rs,
            isLoading: false,
          },
          () => {
            setTimeout(() => {
              if (this.currentRef.current) {
                this.currentRef.current.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                });
              }
            }, 300);
            callback && callback();
          }
        );
      });
  };

  loadMore(done) {
    const self = this;
    self.getHistory(() => done());
  }

  render() {
    const { Lists, isLoading } = this.state;

    return (
      <Page
        bgColor="white"
        ptr
        onPtrRefresh={this.loadMore.bind(this)}
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
              <span className="title">Nhóm khách hàng</span>
            </div>
            <div className="page-navbar__noti"></div>
          </div>
        </Navbar>
        <div className="p-20px">
          {isLoading && (
            <div>
              <Skeleton
                height={80}
                className="mb-15px"
                style={{
                  borderRadius: "8px",
                }}
              />
              <Skeleton
                height={80}
                className="mb-15px"
                style={{
                  borderRadius: "8px",
                }}
              />
              <Skeleton
                height={80}
                className="mb-15px"
                style={{
                  borderRadius: "8px",
                }}
              />
            </div>
          )}
          {Lists &&
            Lists.map((item, index) => (
              <div
                className="last-mb-0 mb-15px"
                ref={item.status === "current" ? this.currentRef : null}
                key={index}
              >
                <div
                  className={clsx("p-15px border", {
                    "border-primary": item.status === "current",
                  })}
                  style={{
                    borderRadius: "8px",
                    background: item.status === "current" ? "#fff" : "#efefef",
                  }}
                >
                  <div className="d--f jc--sb ai--c mb-8px">
                    <div className="fw-600">{item.Title}</div>
                    {item.status !== "none" && (
                      <div
                        className={clsx(
                          item.status === "current"
                            ? "text-primary"
                            : "text-danger"
                        )}
                      >
                        {item.status === "current" && "Đang áp dụng"}
                        {item.status === "next" &&
                          `Chi tiêu thêm ${formatPriceVietnamese(item.need)}`}
                      </div>
                    )}
                  </div>
                  <div className="">
                    Số tiền chi tiêu từ {formatPriceVietnamese(item.Point)}
                  </div>
                  {item.Desc && (
                    <div
                      className="mt-10px"
                      dangerouslySetInnerHTML={{
                        __html: item.Desc,
                      }}
                    ></div>
                  )}
                </div>
                {index < Lists.length - 1 && (
                  <div className="d--f jc--c mt-15px">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      style={{
                        width: "20px",
                      }}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3"
                      />
                    </svg>
                  </div>
                )}
              </div>
            ))}
        </div>
      </Page>
    );
  }
}
