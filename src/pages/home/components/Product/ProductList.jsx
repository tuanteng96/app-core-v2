import React, { useState } from "react";
import ShopDataService from "../../../../service/shop.service";
import { Col, Link, Row } from "framework7-react";
import { getStockIDStorage, getUser } from "../../../../constants/user";
import ProductItem from "../Product/ProductItem";
import SkeletonProduct from "../../components/Product/SkeletonProduct";
import { checkSale, formatPriceVietnamese } from "../../../../constants/format";
import clsx from "clsx";
import { toast } from "react-toastify";

const ButtonCart = ({ item, f7, f7router }) => {
  const [loading, setLoading] = useState(false);

  const orderSubmit = () => {
    const infoUser = getUser();
    const getStock = getStockIDStorage();
    if (!infoUser) {
      f7router.navigate("/login/");
      return false;
    } else {
      setLoading(true);
      const data = {
        order: {
          ID: 0,
          SenderID: infoUser.ID,
          Tinh: 5,
          Huyen: 37,
          MethodPayID: 1,
        },
        adds: [
          {
            ProdID: item.id,
            Qty: 1,
          },
        ],
        forceStockID: getStock,
      };
      ShopDataService.getUpdateOrder(data)
        .then((response) => {
          const { errors } = response.data.data;
          setLoading(false);
          if (response.data.success) {
            if (errors && errors.length > 0) {
              toast.error(errors.join(", "), {
                position: toast.POSITION.TOP_LEFT,
                autoClose: 1500,
              });
            } else {
              toast.success(`Thêm mặt hàng vào giỏ hàng thành công !`, {
                position: toast.POSITION.TOP_LEFT,
                autoClose: 3000,
              });
              f7router.navigate("/pay/");
            }
          }
        })
        .catch((e) => {
          console.log(e);
        });
    }
  };

  return (
    <div className="w-55px d--f jc--c ai--c">
      <div
        className={clsx(
          "cursor-pointer btn-shopping btn-shopping-sm",
          loading && "loading"
        )}
        onClick={orderSubmit}
      >
        <i className="las la-plus"></i>
      </div>
    </div>
  );
};

export default class ProductList extends React.Component {
  constructor() {
    super();
    this.state = {
      isLoading: true,
    };
  }

  componentDidMount() {
    this.getDataList("794,10106", "1", 4, "", "");
  }

  getDataList = (ID, pi, ps, tag, keys) => {
    //ID Cate
    //Trang hiện tại
    //Số sản phẩm trên trang
    // Tag
    //keys Từ khóa tìm kiếm

    let stockid = getStockIDStorage();
    if (!stockid) {
      stockid = 0;
    }
    ShopDataService.getList(ID, pi, ps, tag, keys, stockid, "2")
      .then((response) => {
        const arrCateList = response.data.data.lst;
        this.setState({
          arrCateList: arrCateList,
          isLoading: false,
        });
      })
      .catch((e) => {
        console.log(e);
      });
  };

  render() {
    const { arrCateList, isLoading } = this.state;
    return (
      <React.Fragment>
        {!isLoading && (
          <React.Fragment>
            {arrCateList && arrCateList.length > 0 && (
              <div className="home-page__product">
                <div className="head">
                  <h5>
                    <Link href="/shop/794/">
                      Sản phẩm hot <i className="las la-angle-right"></i>
                    </Link>
                  </h5>
                </div>
                <div className="body">
                  <div
                    className={clsx(
                      "grid gap-15px",
                      window?.GlobalConfig?.APP?.UIBase
                        ? "grid-cols-1"
                        : "grid-cols-2"
                    )}
                  >
                    {arrCateList &&
                      arrCateList.map((item, index) =>
                        window?.GlobalConfig?.APP?.UIBase ? (
                          <div
                            className={clsx(
                              "d-flex",
                              index !== arrCateList.length - 1 &&
                                "border-bottom"
                            )}
                            key={index}
                          >
                            <div className="page-shop__list-text h-auto ai--fs text-left py-15px f--1">
                              <h3 className="p-0">{item.title}</h3>
                              <div
                                className={
                                  "page-shop__list-price jc--fs " +
                                  (item.source.IsDisplayPrice !== 0 &&
                                  checkSale(
                                    item.source.SaleBegin,
                                    item.source.SaleEnd,
                                    item.pricesale
                                  ) === true
                                    ? "sale"
                                    : "")
                                }
                              >
                                {item.source.IsDisplayPrice === 0 ? (
                                  <span className="price">Liên hệ</span>
                                ) : (
                                  <React.Fragment>
                                    <span className="price">
                                      <b>₫</b>
                                      {formatPriceVietnamese(item.price)}
                                    </span>
                                    <span className="price-sale">
                                      <b>₫</b>
                                      {formatPriceVietnamese(item.pricesale)}
                                    </span>
                                  </React.Fragment>
                                )}
                              </div>
                            </div>
                            <ButtonCart
                              item={item}
                              f7={this.props.f7}
                              f7router={this.props.f7router}
                            />
                          </div>
                        ) : (
                          <ProductItem
                            key={index}
                            item={item}
                            source={item.source}
                          />
                        )
                      )}
                  </div>
                </div>
              </div>
            )}
          </React.Fragment>
        )}
        {isLoading && (
          <div className="home-page__product">
            <div className="head">
              <h5>Sản phẩm hot</h5>
              <div className="all">
                <Link href="/shop/794/">
                  Xem tất cả <i className="las la-angle-right"></i>
                </Link>
              </div>
            </div>
            <div className="body">
              <SkeletonProduct />
            </div>
          </div>
        )}
      </React.Fragment>
    );
  }
}
