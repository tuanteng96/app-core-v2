import React from "react";
import {
  Page,
  Link,
  Navbar,
  Toolbar,
  Tabs,
  Tab,
  Row,
  Col,
  Subnavbar,
  Sheet,
  Button,
} from "framework7-react";
import UserService from "../../service/user.service";
import { getUser } from "../../constants/user";
import {
  formatDateSv,
  checkDateDiff,
  formatPriceVietnamese,
} from "../../constants/format";
import OutVoucher from "../../assets/images/outvoucher.svg";
import NotificationIcon from "../../components/NotificationIcon";
import ToolBarBottom from "../../components/ToolBarBottom";
import Skeleton from "react-loading-skeleton";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { toast } from "react-toastify";
import { SERVER_APP } from "../../constants/config";

import moment from "moment";
import "moment/locale/vi";
import clsx from "clsx";
moment.locale("vi");

export default class extends React.Component {
  constructor() {
    super();
    this.state = {
      voucherAll: [],
      VoucherGood: [],
      loading: false,
      copied: false,
    };
  }
  componentDidMount() {
    this.getVoucher();
  }
  getVoucher = () => {
    const infoUser = getUser();
    if (!infoUser) return false;
    const memberid = infoUser.ID;

    this.setState({ loading: true });
    UserService.getVoucher(memberid)
      .then((response) => {
        const { danh_sach, tot_nhat } = response.data.data;
        this.setState({
          VoucherAll: danh_sach,
          VoucherGood: tot_nhat,
          loading: false,
        });
      })
      .catch((e) => console.log(e));
  };

  loadMore(done) {
    const self = this;
    setTimeout(() => {
      self.getVoucher();
      done();
    }, 1000);
  }

  render() {
    const { VoucherAll, loading, copied } = this.state;
    return (
      <Page name="voucher" ptr onPtrRefresh={this.loadMore.bind(this)}>
        <Navbar>
          <div className="page-navbar">
            <div className="page-navbar__back">
              <Link onClick={() => this.$f7router.back()}>
                <i className="las la-angle-left"></i>
              </Link>
            </div>
            <div className="page-navbar__title">
              <span className="title">Mã giảm giá</span>
            </div>
            <div className="page-navbar__noti">
              <NotificationIcon />
            </div>
          </div>
        </Navbar>

        <div className="page-render p-0 page-voucher">
          <div className="page-voucher__list">
            {loading &&
              Array(5)
                .fill()
                .map((item, index) => (
                  <div className="page-voucher__list-item" key={index}>
                    <div className="voucher-icon">
                      <div className="voucher-icon__text"></div>
                      <div className="voucher-icon__line"></div>
                    </div>
                    <div className="voucher-text">
                      <div className="code">
                        <span>Mã</span>
                        <span>
                          <Skeleton width={60} height={20} />
                        </span>
                      </div>
                      <div className="voucher-value">
                        Giảm tối đa <Skeleton width={30} />
                      </div>
                      <ul>
                        <li>
                          HSD : <Skeleton width={70} />
                        </li>
                        <li>
                          <Button className="show-more">Chi tiết</Button>
                        </li>
                      </ul>
                    </div>
                  </div>
                ))}
            {!loading && (
              <React.Fragment>
                {VoucherAll && VoucherAll.length > 0 ? (
                  VoucherAll.slice()
                    .reverse()
                    .map((item, index) => (
                      <div className="page-voucher__list-item" key={index}>
                        <div className="voucher-icon">
                          <div className="voucher-icon__text">
                            <img
                              className={clsx(window?.GlobalConfig?.APP?.notFilterVoucher && "no-filter")}
                              src={SERVER_APP + "/app/images/logo-app.png"}
                            />
                          </div>
                          <div className="voucher-icon__line"></div>
                        </div>
                        <div className="voucher-text">
                          <div className="code">
                            <span>Mã</span>
                            <span>{item.ma}</span>
                          </div>
                          <div className="voucher-value">
                            {item?.Voucher?.ValueType === 2 ? (
                              <>
                                Đồng giá{" "}
                                {formatPriceVietnamese(item.gia_tri.Tien)} VND
                              </>
                            ) : (
                              <>
                                Giảm tối đa{" "}
                                {item.gia_tri.Phan_tram > 0
                                  ? `${item.gia_tri.Phan_tram}%`
                                  : `${formatPriceVietnamese(
                                      item.gia_tri.Tien
                                    )} VND`}
                              </>
                            )}
                          </div>
                          <ul>
                            <li>
                              HSD :{" "}
                              {item.ngay === null ? (
                                "Không giới hạn"
                              ) : (
                                <React.Fragment>
                                  Còn{" "}
                                  <b>
                                    {checkDateDiff(item.ngay.To) === 0
                                      ? "1"
                                      : checkDateDiff(item.ngay.To)}
                                  </b>{" "}
                                  ngày
                                </React.Fragment>
                              )}
                            </li>
                            <li>
                              <Button
                                sheetOpen={`.demo-sheet-${item.Voucher.ID}`}
                                className="show-more"
                              >
                                Chi tiết
                              </Button>
                            </li>
                          </ul>
                        </div>

                        <Sheet
                          className={`sheet-swipe-product sheet-swipe-voucher sheet-swipe-service demo-sheet-${item.Voucher.ID}`}
                          style={{
                            height: "auto",
                            "--f7-sheet-bg-color": "#fff",
                          }}
                          swipeToClose
                          swipeToStep
                          backdrop
                        >
                          <div className="sheet-modal-swipe-step">
                            <div className="sheet-modal-swipe__close"></div>
                            <div className="sheet-swipe-product__content sheet-swipe-service__content">
                              <div className="sheet-pay-head sheet-service-header">
                                <div className="title">
                                  <b>{item.ma}</b>
                                </div>
                              </div>
                              <div className="sheet-service-lst">
                                <div className="sheet-service-lst__item">
                                  <div className="item-sub">
                                    <div className="item-sub__box">
                                      <h5>Bắt đầu - Kết thúc</h5>
                                      <div className="price">
                                        {item.ngay === null
                                          ? "Không giới hạn"
                                          : `${moment(item.ngay.From).format(
                                              "HH:mm DD/MM/YYYY"
                                            )} - ${moment(item.ngay.To).format(
                                              "HH:mm DD/MM/YYYY"
                                            )}`}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="item-sub">
                                    <div className="item-sub__box">
                                      <h5>
                                        {item?.Voucher?.ValueType === 2
                                          ? "Đồng giá"
                                          : "Giá trị giảm giá"}
                                      </h5>
                                      <div className="price">
                                        {item.gia_tri.Phan_tram > 0
                                          ? `${item.gia_tri.Phan_tram}%`
                                          : `${formatPriceVietnamese(
                                              item.gia_tri.Tien
                                            )} Vnđ`}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="item-sub">
                                    <div className="item-sub__box">
                                      <h5>Số lần sử dụng / Tổng số lần</h5>
                                      <div className="price">
                                        {item.gioi_han_so_lan_su_dung === -1 ? (
                                          `${item.so_lan_su_dung} / Không giới hạn`
                                        ) : (
                                          <>
                                            {Number(
                                              item.gioi_han_so_lan_su_dung
                                            ) <= Number(item.so_lan_su_dung)
                                              ? "Hết lượt sử dụng"
                                              : `${item.so_lan_su_dung} / ${item.gioi_han_so_lan_su_dung} lần`}
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="item-sub">
                                    <div className="item-sub__box">
                                      <h5>
                                        Giới hạn SL trên mỗi SP-DV / Giới hạn SL
                                        SP-DV trên cả đơn hàng
                                      </h5>
                                      <div className="price">
                                        {item?.so_luong_mua_tung_san_pham ||
                                          "Không giới hạn"}
                                        <span style={{ padding: "0 3px" }}>
                                          /
                                        </span>
                                        {item?.so_luong_mua_tung_don ||
                                          "Không giới hạn"}
                                      </div>
                                    </div>
                                  </div>
                                  {item.aff && (
                                    <div className="item-sub">
                                      <div className="item-sub__box">
                                        <h5>Mã dùng chia sẻ cho bạn bè</h5>
                                        <div className="price flex-share">
                                          <div>{item.ma_chia_se}</div>
                                          <CopyToClipboard
                                            text={item.ma_chia_se}
                                            onCopy={() => {
                                              this.setState({ copied: true });
                                              setTimeout(() => {
                                                toast.success(
                                                  "Copy mã thành công !",
                                                  {
                                                    position:
                                                      toast.POSITION.TOP_LEFT,
                                                    autoClose: 1000,
                                                  }
                                                );
                                                this.setState({
                                                  copied: false,
                                                });
                                              }, 1000);
                                            }}
                                          >
                                            <div
                                              className={`code ${
                                                copied && "btn-no-click"
                                              }`}
                                            >
                                              {copied
                                                ? "Đang Copy ..."
                                                : "Copy mã"}
                                            </div>
                                          </CopyToClipboard>
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  <div className="item-sub">
                                    <div className="item-sub__box">
                                      <h5>Điều kiện áp dụng</h5>
                                      <div className="price cates">
                                        {item.dieu_Kien.ap_dung === "NG"
                                          ? "Không áp dụng kèm chương trình ưu đãi."
                                          : "Áp dụng kèm chương trình ưu đãi."}
                                        {item.dieu_Kien.danh_muc &&
                                          item.dieu_Kien.danh_muc.length >
                                            0 && (
                                            <div>
                                              Nhóm :{" "}
                                              <span>
                                                {item.dieu_Kien.danh_muc
                                                  .length > 0
                                                  ? item.dieu_Kien.danh_muc
                                                      .map((item) => item.Title)
                                                      .join(", ")
                                                  : "Tất cả"}
                                              </span>
                                            </div>
                                          )}
                                        {item.dieu_Kien.san_pham &&
                                          item.dieu_Kien.san_pham.length >
                                            0 && (
                                            <div>
                                              Sản phẩm lẻ :{" "}
                                              <span>
                                                {item.dieu_Kien.san_pham &&
                                                item.dieu_Kien.san_pham.length >
                                                  0
                                                  ? item.dieu_Kien.san_pham
                                                      .map((item) => item.Title)
                                                      .join(", ")
                                                  : "Tất cả"}
                                              </span>
                                            </div>
                                          )}

                                        {item.nhom && (
                                          <div>
                                            Nhóm khách hàng :{" "}
                                            <span>{item.nhom.Title}</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  {item.aff &&
                                    item.Voucher.VoucherMeta?.Perc > 0 && (
                                      <div className="item-sub">
                                        <div className="item-sub__box">
                                          <h5>Hoa hồng giới thiệu</h5>
                                          <div className="price">
                                            {item.Voucher.VoucherMeta?.Perc >
                                            100
                                              ? `${formatPriceVietnamese(
                                                  item.Voucher.VoucherMeta?.Perc
                                                )}`
                                              : `${item.Voucher.VoucherMeta?.Perc}%`}
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  {item?.Voucher?.Desc && (
                                    <div className="item-sub">
                                      <div className="item-sub__box">
                                        <h5>Mô tả</h5>
                                        <div
                                          className="price"
                                          dangerouslySetInnerHTML={{
                                            __html:
                                              item?.Voucher?.Desc.replaceAll(
                                                "\n",
                                                "<br />"
                                              ),
                                          }}
                                        ></div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </Sheet>
                      </div>
                    ))
                ) : (
                  <div className="page-voucher__out">
                    <img src={OutVoucher} alt="Không có mã giảm giá" />
                    <div className="text">Bạn chưa có mã giảm giá nào.</div>
                  </div>
                )}
              </React.Fragment>
            )}
          </div>
        </div>
        <Toolbar tabbar position="bottom">
          <ToolBarBottom />
        </Toolbar>
      </Page>
    );
  }
}
