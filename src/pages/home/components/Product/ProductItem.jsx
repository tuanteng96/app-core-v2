import React from "react";
import { checkSale, formatPriceVietnamese } from "../../../../constants/format";
import { Link } from "framework7-react";
import RenderTagsProd from "../../../shop/components/RenderTagsProd";
import { TruncateLines } from "react-truncate-lines";
import { toAbsoluteUrl } from "../../../../constants/assetPath";

export default class ProductItem extends React.Component {
  constructor() {
    super();
    this.state = {};
  }

  render() {
    const { item, source } = this.props;
    return (
      <Link href={"/shop/detail/" + item.id} className="page-shop__list-item border rounded overflow-hidden">
        <div className="page-shop__list-img">
          <RenderTagsProd status={item?.source?.Status} />
          <img
            src={toAbsoluteUrl("/Upload/image/" + item.photo)}
            alt={item.title}
          />
        </div>
        <div className="page-shop__list-text pb-0">
          <h3 className="w-100">
            <TruncateLines lines={2} ellipsis={<span>...</span>}>
              {item.title}
            </TruncateLines>
          </h3>

          <div
            className={
              "page-shop__list-price " +
              (checkSale(source.SaleBegin, source.SaleEnd, item.pricesale) ===
              true
                ? "sale"
                : "")
            }
          >
            {source.IsDisplayPrice !== 0 ? (
              <>
                <span className="price">
                  <b>₫</b>
                  {formatPriceVietnamese(item.price)}
                </span>
                <span className="price-sale">
                  <b>₫</b>
                  {formatPriceVietnamese(item.pricesale)}
                </span>
              </>
            ) : (
              <span className="price">Liên hệ</span>
            )}
          </div>
        </div>
      </Link>
    );
  }
}
