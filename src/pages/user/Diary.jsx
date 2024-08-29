import React, { createRef } from "react";
import { Page, Link, Navbar, Toolbar, PhotoBrowser } from "framework7-react";
import { getUser, getPassword } from "../../constants/user";
import { groupbyDDHHMM } from "../../constants/format";
import PageNoData from "../../components/PageNoData";
import UserService from "../../service/user.service";
import ToolBarBottom from "../../components/ToolBarBottom";
import ReactHtmlParser from "react-html-parser";
import NotificationIcon from "../../components/NotificationIcon";
import moment from "moment";
import "moment/locale/vi";
import { SERVER_APP } from "../../constants/config";
import Dom7 from "dom7";
moment.locale("vi");

export default class extends React.Component {
  constructor() {
    super();
    this.state = {
      arrDiary: [],
      photos: [],
    };
    this.myRef = createRef();
  }
  componentDidMount() {
    this.getDiary();
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.arrDiary.toString() !== prevState.arrDiary.toString()) {
      let $this = this;
      if (this?.myRef?.current) {
        let el = this?.myRef?.current;
        let Photos = [];
        Dom7(el)
          .find("img")
          .each(function (e) {
            Photos.push({ url: Dom7(this).attr("src") });
          });
        this.setState({ photos: Photos });

        Dom7(el)
          .find("img")
          .each(function (e) {
            Dom7(this).click(function () {
              let index = $this.state.photos.findIndex(
                (x) => x.url === Dom7(this).attr("src")
              );
              $this.standalone.open(index);
            });
          });
      }
    }
  }

  getDiary = () => {
    const infoUser = getUser();
    if (!infoUser) return false;
    const member = infoUser?.MobilePhone;
    const password = getPassword();
    UserService.getDiary(member, password).then((response) => {
      const arrDiary = response.data;
      this.setState({
        arrDiary: groupbyDDHHMM(arrDiary, "CreateDate"),
      });
    });
  };
  getStuff = (date) => {
    return moment(date).format("dddd");
  };
  getDate = (date) => {
    return moment(date).format("ll");
  };
  getTime = (date) => {
    return moment(date).format("LT");
  };

  loadMore(done) {
    const self = this;
    setTimeout(() => {
      self.getDiary();
      done();
    }, 1000);
  }

  render() {
    const { arrDiary, photos } = this.state;
    return (
      <Page
        ptr
        onPtrRefresh={this.loadMore.bind(this)}
        name="diary"
        className="diary"
      >
        <Navbar>
          <div className="page-navbar">
            <div className="page-navbar__back">
              <Link onClick={() => this.$f7router.back()}>
                <i className="las la-angle-left"></i>
              </Link>
            </div>
            <div className="page-navbar__title">
              <span className="title">Nhật ký</span>
            </div>
            <div className="page-navbar__noti">
              <NotificationIcon />
            </div>
          </div>
        </Navbar>
        <div className="diary-box">
          <div className="diary-box__list">
            {arrDiary && arrDiary.length > 0 ? (
              arrDiary.map((item, index) => (
                <div className="diary-box__list-item" key={index}>
                  <h4>
                    <span>{this.getStuff(item.dayFull)}</span>
                    <span>{this.getDate(item.dayFull)}</span>
                  </h4>
                  <ul ref={this.myRef}>
                    {item.items.map((sub, i) => (
                      <li key={i}>
                        <div className="icon">
                          <span></span>
                        </div>
                        <div className="time">
                          {this.getTime(sub.CreateDate)}
                        </div>
                        <div className="text">
                          {ReactHtmlParser(
                            sub.Content.replaceAll(
                              "/Upload/image/",
                              (window.SERVER || SERVER_APP) + "/Upload/image/"
                            )
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            ) : (
              <PageNoData text="Bạn chưa có nhật ký !" />
            )}
          </div>
          <PhotoBrowser
            photos={photos}
            ref={(el) => {
              this.standalone = el;
            }}
            popupCloseLinkText="Đóng"
            theme="light"
            type="popup"
          />
        </div>
        <Toolbar tabbar position="bottom">
          <ToolBarBottom />
        </Toolbar>
      </Page>
    );
  }
}
