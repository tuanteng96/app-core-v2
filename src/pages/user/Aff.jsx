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
      filter: {
        AFFMemberID: "",
        Pi: 1,
        Ps: 10,
      },
      showPreloader: false,
    };
  }
  componentDidMount() {
    const member = getUser();
    if (!member) return false;
    const memberid = member.ID;
    let newFilter = {
      AFFMemberID: memberid,
      Pi: 1,
      Ps: 10,
    };
    this.getAff(newFilter);
  }

  getAff = (filters) => {
    UserService.getAff(filters)
      .then(({ data }) => {
        let newItems = [...this.state.items, ...(data?.Items || [])];
        this.setState({
          isLoading: false,
          items: [
            ...new Map(newItems.map((item) => [item["ID"], item])).values(),
          ],
          filter: filters,
          Total: data?.Total,
          showPreloader: false,
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
    this.getAff(newFilters);
  };

  render() {
    const { items, isLoading, showPreloader } = this.state;
    return (
      <Page
        bgColor="white"
        name="aff"
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
              <span className="title">Người giới thiệu</span>
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
                      <div style={{ width: "50px" }}>
                        <img
                          style={{
                            borderRadius: "100%",
                          }}
                          src={checkAvt()}
                        />
                      </div>
                      <div
                        className="pl-15px"
                        style={{
                          flex: 1,
                        }}
                      >
                        <div
                          style={{
                            fontSize: "15px",
                            fontWeight: "500",
                          }}
                          className="mb-1px"
                        >
                          {item.FullName}
                        </div>
                        <div style={{ color: "#636363", fontSize: "15px" }}>
                          #{item.ID} - {item.MobilePhone}
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
