import React from "react";
import { Page, Link, Toolbar, Navbar } from "framework7-react";
import PageNoData from "../../components/PageNoData";
import UserService from "../../service/user.service";
import { getUser } from "../../constants/user";
import moment from "moment";
import "moment/locale/vi";
import { checkAvt } from "../../constants/format";
moment.locale("vi");

export default class extends React.Component {
  constructor() {
    super();
    this.state = {
      isLoading: true,
      items: [],
      TotalPoint: 0,
      filter: {
        StockID: "",
        DateStart: "",
        DateEnd: "",
        Pi: 1,
        Ps: 10,
        Order: "ID desc",
        MemberID: "",
      },
      showPreloader: false,
    };
  }
  componentDidMount() {
    const member = getUser();
    if (!member) return false;
    const memberid = member.ID;
    let newFilter = {
      StockID: "",
      DateStart: "",
      DateEnd: "",
      Pi: 1,
      Ps: 10,
      Order: "ID desc",
      MemberID: memberid,
    };
    this.getPoints(newFilter);
  }

  getPoints = (filters) => {
    UserService.getPoints(filters)
      .then(({ data }) => {
        let newItems = [...this.state.items, ...(data?.lst || [])];
        this.setState({
          isLoading: false,
          items: [
            ...new Map(newItems.map((item) => [item["ID"], item])).values(),
          ],
          filter: filters,
          Total: data?.Total,
          showPreloader: false,
          TotalPoint: data?.TotalPoint
        });
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
    this.getPoints(newFilters);
  };

  render() {
    const { items, isLoading, showPreloader } = this.state;
    return (
      <Page
        bgColor="white"
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
              <span className="title">Tích điểm ({this.state.TotalPoint} điểm)</span>
            </div>
          </div>
        </Navbar>
        <div>
          {!isLoading && (
            <>
              {items && items.length > 0 && (
                <>
                  {items.map((item, index) => (
                    <div
                      className="d--f ai--c p-15px border-bottom"
                      key={index}
                    >
                      <div
                        style={{
                          flex: 1,
                        }}
                      >
                        <div className="d--f jc--sb mb-5px">
                          <div
                            style={{
                              fontSize: "15px",
                              fontWeight: "500",
                            }}
                          >
                            {moment(item.CreateDate).format("DD/MM/YYYY")}
                            <span className="px-5px">-</span>#{item.ID}
                          </div>
                          <div
                            style={{
                              fontSize: "15px",
                              fontWeight: "500",
                            }}
                          >
                            Điểm : {item.Point}
                          </div>
                        </div>
                        <div style={{ color: "#636363", fontSize: "15px" }}>
                          {item.RefOrderID > 0 &&
                            item.Point > 0 &&
                            `Tích điểm đơn hàng : #${item.RefOrderID} - ${item.Title}`}
                          {item.RefOrderID > 0 &&
                            item.Point < 0 &&
                            `Khấu trừ tích điểm đơn hàng : #${item.RefOrderID} - ${item.Title}`}
                          {!item.RefOrderID && item.Desc}
                        </div>
                      </div>
                    </div>
                  ))}
                </>
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
