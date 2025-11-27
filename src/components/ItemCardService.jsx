import React from "react";
import {
  maxBookDate,
  formatPriceVietnamese,
  formatDateSv,
  formatDateNotYYYY,
  checkAvt2,
} from "../constants/format";
import { Popover, Link } from "framework7-react";
import NoProduct from "../assets/images/no-product.png";
import { toAbsoluteUrl } from "../constants/assetPath";

export default class ItemCardService extends React.Component {
  checkStatus = (status) => {
    return status;
  };
  render() {
    const { item } = this.props;
    
    return (
      <div className="cardservice-item__service">
        <div
          className="cardservice-item__service-img"
          onClick={() => {
            this.$f7.view.main.router.navigate(
              `/shop/detail/${item.Services[0].ProdID}/?original=${item.Product.ID}&CateId=${item.Product.Type}`
            );
          }}
        >
          {window?.GlobalConfig?.APP?.UIBase ? (
            <div className="h-200px" style={{ background: "#7d7d7d" }}></div>
          ) : (
            <img
              className="w-100"
              src={toAbsoluteUrl("/Upload/image/" + item.Product.Thumbnail)}
              onError={(e) => {
                e.target.src = NoProduct;
              }}
            />
          )}

          <div className="cardservice-item__service-text">
            <h4 className="title">
              {item.OrderItem.ProdTitle} <span>({item.Title})</span>
            </h4>
            <ul>
              {!window?.GlobalConfig?.APP?.Services?.PriceCardHide && (
                <li>
                  <span>Giá trị : </span>
                  <span>{formatPriceVietnamese(item.OrderItem.ToPay)}</span>
                </li>
              )}
              {maxBookDate(item.Services) && (
                <li>
                  <span>Dùng lần cuối : </span>
                  <span>{maxBookDate(item.Services)}</span>
                </li>
              )}
              <li>
                <span>Ngày mua thẻ : </span>
                <span>{formatDateSv(item?.OrderItem?.CreateDate)}</span>
              </li>
              {item.Services &&
                item.Services.some((x) =>
                  window?.GlobalConfig?.APP?.Services?.isEndDate
                    ? x.Status
                    : true
                ) && (
                  <li>
                    <span>Hạn sử dụng : </span>
                    <span>{formatDateSv(item.EndDate)}</span>
                  </li>
                )}
            </ul>
          </div>
        </div>
        <div className="cardservice-item__service-list">
          {item.Services.map((sub, i) => (
            <Link
              noLinkClass
              className="item"
              key={i}
              popoverOpen={".popover-menu-" + sub.ID}
            >
              <div className={"item-box " + this.checkStatus(sub.Status)}>
                <span className="count">{i + 1}</span>
                <span className="hours">
                  <i className="las la-clock"></i>
                  {sub.Minutes}p
                </span>
                {sub.Meta && sub.Meta.search("gift") > -1 && (
                  <span className="gift">
                    <i className="las la-gift"></i>
                  </span>
                )}
                {sub.IsWarrant && (
                  <span className="insu">
                    <i className="las la-user-shield"></i>
                  </span>
                )}
                <span className="date">{formatDateNotYYYY(sub.BookDate)}</span>
                {sub.Staffs &&
                  sub.Staffs.map((user, x) => (
                    <Link noLinkClass className="link-avatar">
                      <span key={x} className="avatar">
                        <img src={checkAvt2(user.Avatar)} alt={user.FullName} />
                      </span>
                    </Link>
                  ))}
              </div>

              <Popover className={"popover-menu-" + sub.ID}>
                <div className="p-15px">
                  {sub.Root2Title && (
                    <div className="fw-500 text-primary mb-8px">
                      {sub.Root2Title}
                    </div>
                  )}
                  {sub.Staffs &&
                    sub.Staffs.map((user, x) => (
                      <div key={x}>
                        Thực hiện : <span>{user.FullName}</span>
                      </div>
                    ))}
                  {(!sub.Staffs || sub.Staffs.length === 0) && (
                    <div>Chưa có nhân viên thực hiện</div>
                  )}
                </div>
              </Popover>
            </Link>
          ))}
        </div>
      </div>
    );
  }
}
