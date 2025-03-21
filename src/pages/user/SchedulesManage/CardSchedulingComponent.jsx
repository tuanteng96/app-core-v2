import React from "react";
import SkeletonCardScheduling from "./SkeletonCardScheduling";
import PageNoData from "../../../components/PageNoData";
import moment from "moment";
import "moment/locale/vi";
import { Col, Row } from "framework7-react";
import clsx from "clsx";
moment.locale("vi");

export default class CardSchedulingComponent extends React.Component {
  constructor() {
    super();
    this.state = {};
  }

  componentDidMount() {}

  getStatus = (Status) => {
    if (Status === "XAC_NHAN") {
      return {
        Color: "primary",
        Text: "Xác nhận",
      };
    }
    if (Status === "CHUA_XAC_NHAN") {
      return {
        Color: "warning",
        Text: "Chưa xác nhận",
      };
    }
    if (Status === "KHACH_KHONG_DEN") {
      return {
        Color: "danger",
        Text: "Khách không đến",
      };
    }
    if (Status === "KHACH_DEN") {
      return {
        Color: "info",
        Text: "Khách đến",
      };
    }
    if (Status === "TU_CHOI") {
      return {
        Color: "danger",
        Text: "Khách huỷ lịch",
      };
    }
    if (Status === "doing") {
      return {
        Color: "success",
        Text: "Đang thực hiện",
      };
    }
    if (Status === "done") {
      return {
        Color: "secondary",
        Text: "Hoàn thành",
      };
    }
    return {
      Color: "warning",
      Text: "Chưa xác định",
    };
  };

  render() {
    const { listBooking, listExpected, loading, onDelete, f7, isBook } =
      this.props;

    return (
      <div className="chedule-manage__lst">
        {loading && <SkeletonCardScheduling />}
        {!loading && (
          <>
            {isBook && (
              <>
                {listBooking && listBooking.length > 0 ? (
                  listBooking.map((item, index) => (
                    <div className="item" key={index}>
                      <div className="item-date">
                        Ngày {moment(item.dayFull).format("LL")}
                      </div>
                      <div className="item-lst">
                        {item.items &&
                          item.items.map((subitem, subIndex) => (
                            <div className="item-lst__box" key={subIndex}>
                              <div className="time-wrap">
                                <div className="service-book">
                                  <div className="service-book__info">
                                    <div className="title">
                                      {subitem.RootTitles || "Chưa có dịch vụ"}
                                    </div>
                                  </div>
                                </div>
                                <div className="service-time">
                                  <Row>
                                    <Col width="33">
                                      <div className="service-time__item">
                                        <div>Ngày đặt lịch</div>
                                        <div>
                                          {moment(subitem.BookDate).format(
                                            "DD/MM/YYYY"
                                          )}
                                        </div>
                                      </div>
                                    </Col>
                                    <Col width="33">
                                      <div className="service-time__item">
                                        <div>Thời gian</div>
                                        <div>
                                          {moment(subitem.BookDate).format(
                                            "HH:mm"
                                          )}
                                        </div>
                                      </div>
                                    </Col>
                                    <Col width="33">
                                      <div className="service-time__item">
                                        <div>Thực hiện tại</div>
                                        <div>
                                          {subitem.AtHome
                                            ? "Nhà"
                                            : subitem.Stock.Title}
                                        </div>
                                      </div>
                                    </Col>
                                  </Row>
                                </div>
                                <div
                                  className="stock"
                                  style={{
                                    justifyContent: "space-between",
                                  }}
                                >
                                  <div
                                    className={clsx(
                                      "text-" +
                                        this.getStatus(subitem?.Status).Color
                                    )}
                                  >
                                    {this.getStatus(subitem?.Status).Text}
                                  </div>
                                  <div>
                                    <button
                                      onClick={() =>
                                        f7.navigate(`/schedule/${subitem.ID}`)
                                      }
                                      className="btn-close btn-edit"
                                    >
                                      Thay đổi lịch
                                    </button>
                                    <button
                                      onClick={() => onDelete(subitem)}
                                      className="btn-close"
                                    >
                                      Hủy Lịch
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <PageNoData text="Bạn chưa có lịch dịch vụ nào ?" />
                )}
              </>
            )}
            {!isBook && (
              <>
                {listExpected && listExpected.length > 0 ? (
                  listExpected.map((item, index) => (
                    <div className="item" key={index}>
                      <div className="item-date">
                        Ngày {moment(item.dayFull).format("LL")}
                      </div>
                      <div className="item-lst">
                        {item.items &&
                          item.items.map((subitem, subIndex) => (
                            <div className="item-lst__box" key={subIndex}>
                              <div className="time-wrap">
                                <div className="service-book">
                                  <div className="service-book__info">
                                    <div className="title">
                                      {subitem.RootTitles || "Chưa có dịch vụ"}
                                    </div>
                                  </div>
                                </div>
                                <div className="service-time">
                                  <Row>
                                    <Col width="33">
                                      <div className="service-time__item">
                                        <div>Ngày đặt lịch</div>
                                        <div>
                                          {moment(subitem.BookDate).format(
                                            "DD/MM/YYYY"
                                          )}
                                        </div>
                                      </div>
                                    </Col>
                                    <Col width="33">
                                      <div className="service-time__item">
                                        <div>Thời gian</div>
                                        <div>
                                          {moment(subitem.BookDate).format(
                                            "HH:mm"
                                          )}
                                        </div>
                                      </div>
                                    </Col>
                                    <Col width="33">
                                      <div className="service-time__item">
                                        <div>Thực hiện tại</div>
                                        <div>
                                          {subitem.AtHome
                                            ? "Nhà"
                                            : subitem.Stock.Title}
                                        </div>
                                      </div>
                                    </Col>
                                  </Row>
                                </div>
                                <div
                                  className="stock"
                                  style={{
                                    justifyContent: "space-between",
                                  }}
                                >
                                  <div
                                    className={clsx(
                                      "text-" +
                                        this.getStatus(subitem?.Status).Color
                                    )}
                                  >
                                    {this.getStatus(subitem?.Status).Text}
                                  </div>
                                  <div>
                                    <button
                                      onClick={() =>
                                        f7.navigate(`/schedule/${subitem.ID}`)
                                      }
                                      className="btn-close btn-edit"
                                    >
                                      Thay đổi lịch
                                    </button>
                                    <button
                                      onClick={() => onDelete(subitem)}
                                      className="btn-close"
                                    >
                                      Hủy Lịch
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <PageNoData text="Bạn chưa có lịch dịch vụ nào ?" />
                )}
              </>
            )}
          </>
        )}
      </div>
    );
  }
}
