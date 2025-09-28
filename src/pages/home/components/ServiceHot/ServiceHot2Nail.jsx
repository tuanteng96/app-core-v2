import { useState, useEffect } from "react";
import { Link } from "framework7-react";
import React, { Fragment } from "react";
import NewsDataService from "../../../../service/news.service";
import Slider from "react-slick";

import { getStockIDStorage, getUser } from "../../../../constants/user";

import BookDataService from "../../../../service/book.service";
import { toast } from "react-toastify";
import { PopupConfirm } from "../PopupConfirm";
import { toAbsoluteUrl } from "../../../../constants/assetPath";

export default class ServiceHot2Nail extends React.Component {
  constructor() {
    super();
    this.state = {
      width: window.innerWidth,
      isLoading: true,
      arrService: [],
      show: false,
      initialValues: null,
      btnLoading: false,
    };
  }
  componentDidMount() {
    this.getServiceHot();
  }
  handStyle = () => {
    const _width = this.state.width - 0;
    return Object.assign({
      width: _width,
    });
  };

  getServiceHot = () => {
    NewsDataService.getNewsIdCate(this.props.BannerID)
      .then(({ data }) => {
        let lst = data?.data
          ? data?.data.map((x) => {
              let split = x.text.split(";");
              return {
                ...x,
                Title: split[0],
                Desc: split.length > 1 ? split[1] : "",
              };
            })
          : [];

        this.setState({
          arrService: lst,
          isLoading: false,
        });
      })
      .catch((e) => {
        console.log(e);
      });
  };

  onHide = () => {
    this.setState({
      show: false,
      initialValues: null,
    });
  };
  onSubmit = (values) => {
    let StockID = getStockIDStorage();
    if (!StockID) {
      this.props.OpenStock();
    } else {
      this.setState({
        btnLoading: true,
      });
      var p = {
        contact: {
          Fullname: values.Fullname,
          Phone1: values.Phone,
          Address: "",
          Email: "",
          Content: values.Content,
        },
      };
      BookDataService.bookContact(p)
        .then(({ data }) => {
          toast.success("Đăng ký chương trình ưu đãi thành công !", {
            position: toast.POSITION.TOP_CENTER,
            autoClose: 1000,
          });
          this.setState({
            btnLoading: false,
            show: false,
            initialValues: null,
          });
        })
        .catch((error) => console.log(error));
    }
  };

  getColor = (index, arr) => {
    if (
      window.GlobalConfig?.APP?.ColorRandom &&
      window.GlobalConfig?.APP?.ColorRandom.length > 0 &&
      arr
    ) {
      const { ColorRandom } = window.GlobalConfig?.APP;
      let newColorRandom = [];
      if (arr.length > ColorRandom.length) {
        const addCount = Math.floor(arr.length / ColorRandom.length);
        const surplus = arr.length % ColorRandom.length;
        for (let i = 1; i <= addCount; i++) {
          newColorRandom = [...newColorRandom, ...ColorRandom];
        }

        if (surplus > 0) {
          newColorRandom = [
            ...newColorRandom,
            ...ColorRandom.slice(0, surplus),
          ];
        }
      } else {
        newColorRandom = [...ColorRandom];
      }
      return newColorRandom[index];
    }
    return "transparent";
  };

  getRandomImage = () => {
    const { IconsRandom } = window.GlobalConfig?.APP;
    let newBgRandom = IconsRandom || [];
    return toAbsoluteUrl(
      newBgRandom[Math.floor(Math.random() * newBgRandom.length)]
    );
  };

  stripHtml = (html) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  };

  render() {
    const { arrService, isLoading, initialValues, show, btnLoading } =
      this.state;
    const settingsNews = {
      dots: false,
      arrows: false,
      infinite: true,
      speed: 500,
      slidesToShow: 1,
      slidesToScroll: 1,
      autoplay: true,
      autoplaySpeed: 5000,
    };

    return (
      <Fragment>
        {arrService && arrService.length > 0 && (
          <div className="home-page__news mb-0 pt-8px bg-transparent">
            <div className="">
              <div className="rounded-lg overflow-hidden">
                <Slider {...settingsNews}>
                  {arrService &&
                    arrService.slice(0, 6).map((item, index) => (
                      <Link
                        className="service-hot2 d-block"
                        key={index}
                        style={this.handStyle()}
                        href={this.stripHtml(item.source.Desc)}
                      >
                        <div
                          className="bg"
                          style={{
                            background: this.getColor(index, arrService),
                          }}
                        ></div>
                        <div
                          className="d-flex position-absolute top-0 left-0 h-100 w-100"
                          style={{ zIndex: 2 }}
                        >
                          <div
                            className="p-0"
                            style={{
                              aspectRatio: "1",
                            }}
                          >
                            <img
                              className="w-100 h-100 object-cover rounded-lg"
                              src={
                                item.source.Status === "1"
                                  ? toAbsoluteUrl(
                                      `/app2021/images/vongquay.gif`
                                    )
                                  : toAbsoluteUrl(`/app2021/images/hopqua.gif`)
                              }
                              alt=""
                            />
                          </div>
                          <div className="f--1 pt-15px pr-15px pb-15px d--f jc--c fd--c">
                            <div
                              className="text-white fw-500 mb-2px"
                              style={{
                                fontSize: "18px",
                              }}
                            >
                              {item?.Title}
                            </div>
                            <div
                              className="text-desc"
                              dangerouslySetInnerHTML={{
                                __html: item.Desc,
                              }}
                            ></div>
                          </div>
                          <div className="d--f px-15px">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth="1.5"
                              stroke="#fff"
                              style={{
                                width: "20px",
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
                    ))}
                </Slider>
              </div>
            </div>
          </div>
        )}
        <PopupConfirm
          initialValue={initialValues}
          show={show}
          onHide={() => this.onHide()}
          onSubmit={(values) => this.onSubmit(values)}
          btnLoading={btnLoading}
        />
      </Fragment>
    );
  }
}
