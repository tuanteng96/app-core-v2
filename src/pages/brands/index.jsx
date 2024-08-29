import React from "react";
import { Navbar, Page, f7 } from "framework7-react";
import axios from "axios";
import httpCommon from "../../service/http-common";
import { SET_BACKGROUND } from "../../constants/prom21";

export default class Report extends React.Component {
  constructor() {
    super();
    this.state = {
      Brands: [
        {
          Domain: "https://daisybeauty.vn",
          Title: "Daisy Beauty",
          Address: "KQH Xuân Phú B4 - 20, TP. Huế",
        },
        {
          Domain: "https://www.spamamgao.com",
          Title: "Mầm Gạo Spa",
          Address: "69 Hoa Lan, phường 2, quận Phú Nhuận",
        },
        {
          Domain: "https://chaming.vn",
          Title: "Chaming Skinlab",
          Address: "17 Ngõ 55 Huỳnh Thúc Kháng - Đống Đa - Hà Nội",
        },
      ],
    };
  }

  componentDidMount() {}

  onChange = (item) => {
    f7.dialog
      .create({
        title: item.Title,
        text: "Bạn muốn chọn cơ sở " + item.Title,
        buttons: [
          {
            text: "Huỷ",
            close: true,
            cssClass: "text-danger",
          },
          {
            text: "Đồng ý",
            close: true,
            onClick: () => {
              f7.dialog.preloader("Đang thực hiện ...");
              axios
                .get(item.Domain + "/brand/global/Global.json")
                .then(({ data }) => {
                  if (data && data.APP && data.APP.Css) {
                    for (const key in data.APP.Css) {
                      document.documentElement.style.setProperty(
                        key,
                        data.APP.Css[key]
                      );
                    }
                  }
                  SET_BACKGROUND(data?.APP?.Css["--ezs-color"] + ";0");

                  if (data.APP.FontSize && data.APP.FontSize.length > 0) {
                    for (let key of data.APP.FontSize) {
                      document.documentElement.style.setProperty(
                        key.name,
                        key.size
                      );
                    }
                  }

                  window.GlobalConfig = data;

                  window.SERVER = item.Domain;

                  httpCommon.defaults.baseURL = item.Domain;

                  localStorage.setItem("DOMAIN", JSON.stringify(item));
                  localStorage.setItem("GlobalConfig", JSON.stringify(data));

                  f7.dialog.close();
                  f7.views.main.router.navigate("/");
                });
            },
          },
        ],
      })
      .open();
  };

  render() {
    let { Brands } = this.state;
    return (
      <Page name="employee-service">
        <Navbar>
          <div className="page-navbar">
            <div className="page-navbar__back"></div>
            <div className="page-navbar__title">
              <span className="title">Chọn chi nhánh gần bạn</span>
            </div>
            <div className="page-navbar__noti"></div>
          </div>
        </Navbar>
        <div className="h-100 bg-white">
          {Brands.map((item, index) => (
            <div
              className="p-20px border-bottom"
              key={index}
              onClick={() => this.onChange(item)}
            >
              <div className="fw-600" style={{ fontSize: "15px" }}>
                {item.Title}
              </div>
              <div className="fw-300 mt-5px">{item.Address}</div>
            </div>
          ))}
        </div>
      </Page>
    );
  }
}
