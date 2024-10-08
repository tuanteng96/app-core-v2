import React from "react";
import { f7, Link } from "framework7-react";
import Slider from "react-slick";
import ShopDataService from "../../../../service/shop.service";
import SkeletonServiceHot from "./SkeletonServiceHot";
import { getStockIDStorage, getUser } from "../../../../constants/user";
import { Fragment } from "react";
import ShopListServiceItem from "../../../shop/shopListServiceItem";
import clsx from "clsx";
import { toAbsoluteUrl } from "../../../../constants/assetPath";

export default class ServiceHot extends React.Component {
  constructor() {
    super();
    this.state = {
      width: window.innerWidth,
      isLoading: true,
      arrService: [],
    };
  }

  componentDidMount() {
    this.getServicesAll();
  }
  handStyle = () => {
    const off = window?.GlobalConfig?.APP?.UIBase ? 34 : 120;
    const _width = this.state.width - off;
    return Object.assign({
      width: _width,
    });
  };

  getServicesAll = () => {
    let stockid = getStockIDStorage();
    stockid ? stockid : 0;
    if (window?.GlobalConfig?.APP?.UIBase) {
      ShopDataService.getServiceParent(795, stockid)
        .then(({ data }) => {
          const result = data.lst;
          if (result) {
            let newData = [];
            if (stockid > 0) {
              newData = result.filter((item) => {
                const arrayStatus = item?.root?.Status
                  ? item.root.Status.split(",")
                  : [];
                return (
                  (item.root.OnStocks.indexOf("*") > -1 ||
                    item.root.OnStocks.indexOf(stockid) > -1) &&
                  item.root.IsRootPublic &&
                  arrayStatus.indexOf("2") > -1
                );
              });
            } else {
              newData = result.filter((item) => {
                const arrayStatus = item?.root?.Status
                  ? item.root.Status.split(",")
                  : [];
                return (
                  item.root.OnStocks &&
                  item.root.IsRootPublic &&
                  arrayStatus.indexOf("2") > -1
                );
              });
            }
            this.setState({
              arrService: newData,
              isLoading: false,
            });
          }
        })
        .catch((e) => console.log(e));
    } else {
      ShopDataService.getServiceOriginal(stockid)
        .then(({ data }) => {
          const result = data.data;
          if (result) {
            let newData = [];
            if (stockid > 0) {
              newData = result.filter((item) => {
                const arrayStatus = item?.root?.Status
                  ? item.root.Status.split(",")
                  : [];
                return (
                  (item.root.OnStocks.indexOf("*") > -1 ||
                    item.root.OnStocks.indexOf(stockid) > -1) &&
                  item.root.IsRootPublic &&
                  arrayStatus.indexOf("2") > -1
                );
              });
            } else {
              newData = result.filter((item) => {
                const arrayStatus = item?.root?.Status
                  ? item.root.Status.split(",")
                  : [];
                return (
                  item.root.OnStocks &&
                  item.root.IsRootPublic &&
                  arrayStatus.indexOf("2") > -1
                );
              });
            }
            this.setState({
              arrService: newData,
              isLoading: false,
            });
          }
        })
        .catch((err) => console.log(err));
    }
  };

  handleUrl = (item) => {
    this.props.f7router.navigate(`/shop/selected/${item.root.ID}`);
  };

  render() {
    const { isLoading, arrService } = this.state;
    const settingsNews = {
      className: "slider variable-width",
      dots: false,
      arrows: false,
      infinite: true,
      slidesToShow: 1,
      centerPadding: "20px",
      variableWidth: true,
      autoplay: false,
      autoplaySpeed: 5000,
    };
    const userInfo = getUser();
    return (
      <React.Fragment>
        {!isLoading && (
          <React.Fragment>
            {arrService && arrService.length > 0 && (
              <div
                className={clsx(
                  "home-page__news",
                  !window?.GlobalConfig?.APP?.UIBase
                    ? "mb-15px bg-transparent py-0"
                    : "bg-transparent pb-0 pt-0"
                )}
              >
                <div className="page-news__list">
                  <div
                    className={clsx(
                      "page-news__list-ul",
                      window?.GlobalConfig?.APP?.UIBase &&
                        "page-news__list-flex"
                    )}
                  >
                    <Slider {...settingsNews}>
                      {arrService &&
                        arrService.slice(0, 6).map((item, index) => (
                          <Fragment key={index}>
                            {window?.GlobalConfig?.APP?.UIBase ? (
                              <div
                                className="page-shop__service-item mb-0"
                                style={this.handStyle()}
                              >
                                <div className="page-shop__service-item service-about mb-0">
                                  <div className="service-about__title pb-20px pr-80px">
                                    <span onClick={() => this.handleUrl(item)}>
                                      {item.root.Title}
                                    </span>
                                    <Link
                                      href={
                                        userInfo
                                          ? `/schedule/?SelectedTitle=${item.root.Title}&SelectedId=${item.root.ID}`
                                          : "/login/"
                                      }
                                      className="_btn"
                                    >
                                      Đặt lịch
                                    </Link>
                                  </div>
                                  <div className="service-about__content children-p-0 px-15px">
                                    {item.root?.Desc ? (
                                      <div className="mb-12px">
                                        <div
                                          className="text-truncate-2"
                                          dangerouslySetInnerHTML={{
                                            __html: item.root.Desc,
                                          }}
                                        ></div>
                                      </div>
                                    ) : (
                                      ""
                                    )}
                                  </div>
                                  <ShopListServiceItem
                                    item={item}
                                    f7router={this.props.f7router}
                                    lines={true}
                                  />
                                </div>
                              </div>
                            ) : (
                              <Link
                                className="page-news__list-item box-shadow-none p-10px"
                                key={item.root.ID}
                                style={this.handStyle()}
                                onClick={() => this.handleUrl(item)}
                              >
                                <div className="images bd-rd3">
                                  <img
                                    src={toAbsoluteUrl(item.root.Thumbnail_web)}
                                    alt={item.root.Title}
                                  />
                                </div>
                                <div className="text">
                                  <h6 className="text-cut-1">
                                    {item.root.Title}
                                  </h6>
                                  <div
                                    className="desc-flash"
                                    dangerouslySetInnerHTML={{
                                      __html: item.root.Desc,
                                    }}
                                  ></div>
                                  <div className="d--f ai--c jc--sb mt-5px">
                                    <div className="d--f ai--c">
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth="1.5"
                                        stroke="currentColor"
                                        style={{
                                          width: "18px",
                                          stroke: "var(--ezs-color)"
                                        }}
                                        className="text-warning"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z"
                                        />
                                      </svg>

                                      <span className="fw-400 pl-5px" style={{
                                        color: "#999"
                                      }}>
                                        Xem chi tiết
                                      </span>
                                    </div>

                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      strokeWidth="1.5"
                                      stroke="#999"
                                      style={{
                                        width: "18px",
                                      }}
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                                      />
                                    </svg>
                                  </div>
                                </div>
                              </Link>
                            )}
                          </Fragment>
                        ))}
                    </Slider>
                  </div>
                </div>
              </div>
            )}
          </React.Fragment>
        )}
        {isLoading && (
          <div className="home-page__news mb-8">
            <div className="page-news__list">
              <div className="page-news__list-ul">
                <SkeletonServiceHot />
              </div>
            </div>
          </div>
        )}
      </React.Fragment>
    );
  }
}
