import React from "react";
import { Page, Link, Toolbar, Navbar, Subnavbar } from "framework7-react";
import PageNoData from "../../components/PageNoData";
import UserService from "../../service/user.service";
import { getUser } from "../../constants/user";
import moment from "moment";
import "moment/locale/vi";
import { PickerViewPoint } from "./components";
import { checkImageProduct } from "../../constants/format";

moment.locale("vi");

export default class extends React.Component {
  constructor() {
    super();
    this.state = {
      isLoading: true,
      items: [],
      TotalPoint: 0,
      filter: {
        Pi: 1,
        Ps: 20,
      },
      showPreloader: false,
    };
  }
  componentDidMount() {
    this.getPointsVoucher({
      Pi: 1,
      Ps: 20,
    });
  }

  getPointsVoucher = async (filters, callback = null) => {
    const member = getUser();
    if (!member) return false;
    const memberid = member.ID;

    let totalpoint = await UserService.getPoints({
      StockID: "",
      DateStart: "",
      DateEnd: "",
      Pi: 1,
      Ps: 10,
      Order: "ID desc",
      MemberID: memberid,
    });

    UserService.getPointsVoucher(filters)
      .then(({ data }) => {
        let newItems = [...this.state.items, ...(data?.items || [])];

        this.setState({
          isLoading: false,
          items: [
            ...new Map(newItems.map((item) => [item["ID"], item])).values(),
          ],
          filter: filters,
          Total: data?.total,
          showPreloader: false,
          TotalPoint: totalpoint?.data?.TotalPoint,
        });

        callback && callback();
      })
      .catch((er) => console.log(er));
  };

  loadRefresh(done) {
    setTimeout(() => {
      this.$f7.views.main.router.navigate(this.$f7.views.main.router.url, {
        reloadCurrent: true,
      });
      this.setState({
        showPreloader: true,
      });
      done();
    }, 600);
  }

  loadMore = () => {
    let { filter, items, Total, showPreloader } = this.state;
    if (showPreloader) return false;
    if (items.length >= Total) return false;
    let newFilters = {
      ...filter,
      Pi: filter.Pi + 1,
    };
    this.setState({
      showPreloader: true,
    });
    this.getPointsVoucher(newFilters);
  };

  render() {
    const { items, isLoading, TotalPoint, showPreloader } = this.state;
    return (
      <Page
        bgColor="xam"
        name="point"
        ptr
        infinite
        infiniteDistance={50}
        infinitePreloader={showPreloader}
        onInfinite={() => this.loadMore()}
        onPtrRefresh={this.loadRefresh.bind(this)}
        noToolbar
      >
        <Navbar>
          <div className="page-navbar">
            <div className="page-navbar__back">
              <Link onClick={() => this.$f7router.back()}>
                <i className="las la-angle-left"></i>
              </Link>
            </div>
            <div className="page-navbar__title">
              <span className="title">Tích điểm đổi quà</span>
            </div>
          </div>
          <Subnavbar className="sub-nav-bar">
            <div
              className="w-100 d--f jc--sb ai--c px-15px"
              style={{
                fontSize: "15px",
              }}
            >
              <div>
                Tổng điểm tích luỹ{" "}
                <span className="text-primary fw-500">{TotalPoint || 0}</span>{" "}
                điểm
              </div>
              <div>
                <Link href="/points/" className="text-primary" noLinkClass>
                  Xem chi tiết
                </Link>
              </div>
            </div>
          </Subnavbar>
        </Navbar>
        <div>
          {!isLoading && (
            <>
              {items && items.length > 0 && (
                <ul
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                    gap: "15px",
                    padding: "15px",
                  }}
                >
                  {items.map((item, index) => (
                    <PickerViewPoint
                      key={index}
                      data={item}
                      disabled={item.Point > TotalPoint}
                      refetch={this.getPointsVoucher}
                    >
                      {({ open }) => (
                        <li
                          className="bg-white d--f fd--c"
                          style={{
                            borderRadius: "8px",
                          }}
                          key={index}
                          onClick={open}
                        >
                          <div>
                            <div
                              className="text-center pt-10px px-10px"
                              style={{
                                fontSize: "15px",
                              }}
                            >
                              <img
                                style={{
                                  //aspectRatio: "1",
                                  objectFit: "cover",
                                  borderRadius: "8px",
                                }}
                                src={checkImageProduct(item.Photo)}
                                alt=""
                              />
                            </div>
                          </div>
                          <div
                            className="position-relative"
                            style={{
                              height: "1px",
                              borderTop: "1px dashed #222",
                              margin: "15px 0",
                            }}
                          >
                            <div
                              style={{
                                width: "20px",
                                height: "20px",
                                borderRadius: "100%",
                                background: "rgb(240 244 247)",
                                left: "-10px",
                                position: "absolute",
                                top: "50%",
                                transform: "translateY(-50%)",
                              }}
                            ></div>
                            <div
                              style={{
                                width: "20px",
                                height: "20px",
                                borderRadius: "100%",
                                background: "rgb(240 244 247)",
                                right: "-10px",
                                position: "absolute",
                                top: "50%",
                                transform: "translateY(-50%)",
                              }}
                            ></div>
                          </div>
                          <div
                            className="px-15px pb-15px d--f jc--sb fd--c"
                            style={{
                              flexGrow: "1",
                            }}
                          >
                            <div>
                              <div
                                className="fw-500 mb-3px"
                                style={{
                                  fontSize: "15px",
                                  display:
                                    "-webkit-box" /* required for WebkitLineClamp to work */,
                                  WebkitLineClamp: 2 /* limits the text to 3 lines */,
                                  WebkitBoxOrient:
                                    "vertical" /* required for WebkitLineClamp */,
                                  overflow:
                                    "hidden" /* hides any overflowing content */,
                                  textOverflow: "ellipsis",
                                  height: "42px",
                                }}
                              >
                                {item.Title}
                              </div>
                              <div className="text-danger fw-500 mb-2px">
                                {item.Point} điểm
                              </div>
                              <div
                                className="text-muted"
                                style={{
                                  display:
                                    "-webkit-box" /* required for WebkitLineClamp to work */,
                                  WebkitLineClamp: 2 /* limits the text to 3 lines */,
                                  WebkitBoxOrient:
                                    "vertical" /* required for WebkitLineClamp */,
                                  overflow:
                                    "hidden" /* hides any overflowing content */,
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {item.Desc}
                              </div>
                            </div>
                            <div
                              //onClick={() => this.handleVcode(item)}
                              className="bg-primary text-center text-white mt-10px py-3px rounded"
                            >
                              Chi tiết
                            </div>
                          </div>
                        </li>
                      )}
                    </PickerViewPoint>
                  ))}
                </ul>
              )}
              {(!items || items.length === 0) && (
                <PageNoData text="Không có người giới thiệu !" />
              )}
            </>
          )}
        </div>
      </Page>
    );
  }
}
