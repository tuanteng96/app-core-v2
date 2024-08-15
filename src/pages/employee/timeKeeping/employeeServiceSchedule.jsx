import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  Link,
  Navbar,
  Page,
  PhotoBrowser,
  Sheet,
  Toolbar,
} from "framework7-react";
import NotificationIcon from "../../../components/NotificationIcon";
import PageNoData from "../../../components/PageNoData";
import ToolBarBottom from "../../../components/ToolBarBottom";
import {
  getPassword,
  getStockIDStorage,
  getUser,
} from "../../../constants/user";
import staffService from "../../../service/staff.service";
import "moment/locale/vi";
import moment from "moment";
import LoadingChart from "../../../components/Loading/LoadingChart";
import { SERVER_APP } from "../../../constants/config";
moment.locale("vi");

const Photos = ({ PhotoList }) => {
  const refPhotoWeb = useRef();
  const [PhotoWeb, setPhotoWeb] = useState([]);

  useEffect(() => {
    if (PhotoList) {
      setPhotoWeb(() =>
        PhotoList.map((item) => `${SERVER_APP}/upload/image/${item.Src}`)
      );
    }
  }, [PhotoList]);

  return (
    <>
      <Button fill onClick={() => refPhotoWeb?.current?.open()}>
        Xem hình ảnh
      </Button>
      <PhotoBrowser
        photos={PhotoWeb}
        ref={refPhotoWeb}
        popupCloseLinkText="Đóng"
      />
    </>
  );
};

export default class employeeServiceSchedule extends React.Component {
  constructor() {
    super();
    this.state = {
      loadingSubmit: false,
      sheetOpened: false,
      loading: true,
    };
  }

  componentDidMount() {
    this.getScheduleStaff();
  }

  getScheduleStaff = () => {
    if (!getUser()) return false;
    const infoMember = getUser();
    const user = {
      USN: infoMember.UserName,
      Pwd: getPassword(),
      StockID: getStockIDStorage(),
    };
    const OrderItemID = this.$f7route.params.orderItem;
    const data = {
      cmd: "booklist",
      OrderItemID: OrderItemID,
    };

    staffService
      .getBookStaff(user, data)
      .then((response) => {
        const arrBook = response.data;
        this.setState({
          arrBook: arrBook,
          loading: false,
        });
      })
      .catch((error) => console.log(error));
  };

  checkStatus = (status) => {
    switch (status) {
      case "done":
        return (
          <span className="label-inline label-light-success">Hoàn thành</span>
        );
      case "doing":
        return (
          <span className="label-inline label-light-warning">
            Đang thực hiện
          </span>
        );
      default:
        return (
          <span className="label-inline label-light-info">Chưa thực hiện</span>
        );
    }
  };

  async loadRefresh(done) {
    await this.getScheduleStaff();
    await new Promise((resolve) => setTimeout(resolve, 1000));
    this.setState({
      showPreloader: true,
    });
    done();
  }

  render() {
    const { arrBook, loading } = this.state;
    return (
      <Page
        name="employee-diary"
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
              <span className="title">
                Lịch trình{" "}
                {arrBook && arrBook.length > 0 && `(${arrBook.length})`}
              </span>
            </div>
            <div className="page-navbar__noti">
              <NotificationIcon />
            </div>
          </div>
        </Navbar>
        <div className="employee-diary">
          {loading && <LoadingChart />}
          {!loading && (
            <>
              {arrBook && arrBook.length > 0 ? (
                <ul>
                  {arrBook.map((item, index) => (
                    <li
                      key={index}
                      className={item.Status ? item.Status : "unfulfilled"}
                    >
                      <div className="status">
                        {item.BookDate && (
                          <div className="time">
                            {moment(item.BookDate).format("LLL")}
                          </div>
                        )}
                        {this.checkStatus(item.Status)}
                      </div>
                      <div className="content mb-10px">{item.Title}</div>
                      {item?.PhotoList && item?.PhotoList.length > 0 && (
                        <Photos PhotoList={item?.PhotoList} />
                      )}
                      {(item?.Rate || item?.Rate === 0) && (
                        <div style={{borderTop: "1px solid #eaecf4", paddingTop: "12px", marginTop: item?.PhotoList && item?.PhotoList.length > 0 ? "12px" : "0px"}}>
                          <div className="d--f" style={{
                            gap: "5px"
                          }}>
                            {Array(5)
                              .fill()
                              .map((_, index) => (
                                <svg
                                  style={{
                                    width: "18px",
                                    fill:
                                      index + 1 > item?.Rate
                                        ? "#d1d5dc"
                                        : "#fbca16",
                                  }}
                                  aria-hidden="true"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="currentColor"
                                  viewBox="0 0 22 20"
                                  key={index}
                                >
                                  <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
                                </svg>
                              ))}
                          </div>
                          {item?.RateNote && <div style={{color: "#8b8b8b", marginTop: "6px"}}>{item?.RateNote}</div>}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <PageNoData text="Không có lịch trình." />
              )}
            </>
          )}
        </div>
        <Toolbar tabbar position="bottom">
          <ToolBarBottom />
        </Toolbar>
      </Page>
    );
  }
}
