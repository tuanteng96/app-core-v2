import React from "react";
import {
  Page,
  Link,
  Navbar,
  Toolbar,
  Row,
  Col,
  Subnavbar,
  Tabs,
  Tab,
  Popover,
} from "framework7-react";
import ToolBarBottom from "../../components/ToolBarBottom";
import BookDataService from "../../service/book.service";

import CardSchedulingComponent from "./SchedulesManage/CardSchedulingComponent";
import { getUser } from "../../constants/user";
import { groupbyDDHHMM2 } from "../../constants/format";
import { toast } from "react-toastify";

export default class extends React.Component {
  constructor() {
    super();
    this.state = {
      isRefresh: false,
      tabCurrent: "bookcard",
      listBooking: [],
      listExpected: [],
      loading: false,
      isBook: true,
    };
  }

  getListBooks = () => {
    const userInfo = getUser();
    if (!userInfo) return false;
    this.setState({
      loading: true,
    });
    BookDataService.getListBook(userInfo.ID)
      .then(({ data }) => {
        this.setState({
          listBooking: groupbyDDHHMM2(
            data?.data
              ? data.data.filter(
                  (x) =>
                    !x.Desc ||
                    (x.Desc && x.Desc.indexOf("Tự động đặt lịch") === -1)
                )
              : []
          ),
          listExpected: groupbyDDHHMM2(
            data?.data
              ? data.data.filter(
                  (x) => x.Desc && x.Desc.indexOf("Tự động đặt lịch") > -1
                )
              : []
          ),
          loading: false,
        });
      })
      .catch((er) => console.log(er));
  };

  componentDidMount() {
    this.getListBooks();
  }

  onDelete = (item) => {
    const dataSubmit = {
      deletes: [
        {
          ID: item.ID,
        },
      ],
    };
    const _this = this;
    _this.$f7.dialog.confirm("Bạn chắc chắn mình muốn hủy lịch ?", () => {
      _this.$f7.preloader.show();
      BookDataService.bookDelete(dataSubmit)
        .then((response) => {
          _this.$f7.preloader.hide();
          toast.success("Hủy lịch thành công !", {
            position: toast.POSITION.TOP_LEFT,
            autoClose: 3000,
          });
          this.getListBooks();
          window.OnMemberBook &&
            window.OnMemberBook({
              Member: item.Member,
              booking: item,
              action: "TU_CHOI",
              from: "APP",
            });
        })
        .catch((er) => console.log(er));
    });
  };

  async loadRefresh(done) {
    await this.getListBooks();
    done();
  }

  render() {
    const { loading, listBooking, listExpected, isBook } = this.state;
    return (
      <Page
        name="schedule-manage"
        onPtrRefresh={this.loadRefresh.bind(this)}
        ptr
        infiniteDistance={50}
      >
        <Navbar>
          <div className="page-navbar">
            <div className="page-navbar__back">
              <Link onClick={() => this.$f7router.back()}>
                <i className="las la-angle-left"></i>
              </Link>
            </div>
            <div className="page-navbar__title">
              <span className="title">{isBook ? "Quản lý đặt lịch" : "Dự kiến đặt lịch"}</span>
            </div>
            <div className="page-navbar__noti">
              <Link noLinkClass popoverOpen=".popover-schedules">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  style={{ width: "22px" }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 13.5V3.75m0 9.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 3.75V16.5m12-3V3.75m0 9.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 3.75V16.5m-6-9V3.75m0 3.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 9.75V10.5"
                  />
                </svg>
              </Link>
              <Popover className="popover-schedules" style={{ width: "180px" }}>
                <div
                  style={{
                    padding: "6px 0",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "start",
                  }}
                >
                  <Link
                    style={{
                      display: "block",
                      padding: "12px 15px",
                      color: isBook ? "var(--ezs-color)" : "#000",
                      borderBottom: "1px solid #e9e9e9",
                      width: "100%",
                    }}
                    popoverClose
                    onClick={() => this.setState({ isBook: true })}
                  >
                    Danh sách đặt lịch
                  </Link>
                  <Link
                    style={{
                      display: "block",
                      padding: "12px 15px",
                      color: !isBook ? "var(--ezs-color)" : "#000",
                      width: "100%",
                    }}
                    popoverClose
                    onClick={() => this.setState({ isBook: false })}
                  >
                    Dự kiến đặt lịch
                  </Link>
                </div>
              </Popover>
            </div>
          </div>
        </Navbar>
        <div className="page-wrapper">
          <div className="chedule-manage">
            <CardSchedulingComponent
              isBook={isBook}
              listBooking={listBooking}
              listExpected={listExpected}
              loading={loading}
              onDelete={this.onDelete}
              f7={this.$f7router}
            />
          </div>
        </div>
        <Toolbar tabbar position="bottom">
          <ToolBarBottom />
        </Toolbar>
      </Page>
    );
  }
}
