import React from "react";
import { Page, Link } from "framework7-react";
import { iOS } from "../../constants/helpers";
import { FormLogin } from "./components";
import { toAbsoluteUrl } from "../../constants/assetPath";

export default class extends React.Component {
  constructor() {
    super();
    this.state = {};
  }

  isImage = (icon) => {
    const ext = [".jpg", ".jpeg", ".bmp", ".gif", ".png", ".svg"];
    return ext.some((el) => icon.endsWith(el));
  };

  getClassStyle = () => {
    if (window?.GlobalConfig?.APP?.Login?.Background) {
      if (this.isImage(window?.GlobalConfig?.APP?.Login?.Background)) {
        document.documentElement.style.setProperty(
          "--login-background",
          `url(${window?.GlobalConfig?.APP?.Login?.Background})`
        );
        return "bg-login-img";
      } else {
        document.documentElement.style.setProperty(
          "--login-background",
          window?.GlobalConfig?.APP?.Login?.Background
        );
        return "bg-login";
      }
    }
    return "";
  };

  render() {
    return (
      <Page noNavbar noToolbar name="login">
        <div
          className="page-wrapper page-login page-login-iphone page-login-v2"
        >
          {!window?.GlobalConfig?.APP?.OnlyStaff && (
            <div className="page-login__back">
              <Link
                onClick={() => {
                  if (
                    this.$f7router.history[
                      this.$f7router.history.length - 2
                    ]?.indexOf("/profile/") > -1
                  ) {
                    this.$f7router.navigate(`/`);
                  } else {
                    this.$f7router.back();
                  }
                }}
              >
                <i className="las la-arrow-left"></i>
              </Link>
            </div>
          )}

          <div className={`page-login__content ${this.getClassStyle()}`}>
            <div className="page-login__logo">
              <div className="logo">
                <img src={toAbsoluteUrl("/app/images/logo-mau-app.png")} />
              </div>
              <div className="title">Xin chào, Bắt đầu đăng nhập nào</div>
            </div>
            <div className="page-login__form">
              <FormLogin f7={this.$f7} f7router={this.$f7router} />
            </div>
          </div>
          {!window?.GlobalConfig?.APP?.OnlyStaff && (
            <div className="page-login__alert">
              <div className="ft">
                Bạn chưa có tài khoản ?{" "}
                <Link href="/registration/">Đăng ký</Link>
              </div>
            </div>
          )}
        </div>
      </Page>
    );
  }
}
