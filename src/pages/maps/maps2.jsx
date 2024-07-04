import React from "react";
import { Page, Link, Toolbar, Navbar, LoginScreen, f7 } from "framework7-react";
import ReactHtmlParser from "react-html-parser";
import ToolBarBottom from "../../components/ToolBarBottom";
import UserService from "../../service/user.service";
import NotificationIcon from "../../components/NotificationIcon";
import NewsDataService from "../../service/news.service";
import { iOS } from "../../constants/helpers";
import { OPEN_LINK } from "../../constants/prom21";
import SelectPicker from "../../components/Selects/SelectPicker";
import clsx from "clsx";

export default class extends React.Component {
  constructor() {
    super();
    this.state = {
      arrMaps: [],
      arrMaps2: [],
      arrayCurrent: [],
      showPreloader: false,
      ActiveProvinces: null,
      ActiveDistricts: null,
      isOpen: false,
    };
  }

  componentDidMount() {
    this.setState({ width: window.innerWidth });
    this.getMapsList();
  }

  componentDidUpdate(prevProps, prevState) {
    let { ActiveProvinces, ActiveDistricts, arrMaps, arrayCurrent } =
      this.state;

    if (
      prevState.ActiveProvinces !== ActiveProvinces ||
      prevState.ActiveDistricts !== ActiveDistricts
    ) {
      let newValues = [...arrayCurrent];
      if (ActiveProvinces) {
        newValues = newValues.filter(
          (x) => Number(x?.Province?.Parentid) === Number(ActiveProvinces?.value)
        );
      }
      if (ActiveDistricts) {
        newValues = newValues.filter(
          (x) => Number(x?.District?.ID) === Number(ActiveDistricts?.value)
        );
      }
      this.setState({
        arrMaps: newValues,
      });
    }
  }

  getMapsList = async () => {
    let { data: arr1 } = await UserService.getStock();
    let { data: arr2 } = await NewsDataService.getBannerName("APP.COSO");
    let newArr1 = arr1?.data?.all
      ? arr1?.data?.all.filter((item) => item.ID !== 778)
      : [];
    let newArr2 = arr2?.data
      ? arr2?.data.map((x) => ({
          ...x,
          DescSEO: x.Follow,
        }))
      : [];

    let newMaps = [];

    let Provinces = [];

    for (let x of newArr1) {
      let obj = {
        ...x,
        FileName: x.LinkSEO,
      };
      let newDesc = x.DescSEO ? JSON.parse(x.DescSEO) : null;

      if (newDesc && newDesc.place && newDesc.place.length > 0) {
        obj.Province = newDesc.place.filter((o) => o.Parentid > 0)[0];
        obj.District = newDesc.place.filter((o) => !o.Parentid)[0];
      }
      newMaps.push(obj);
    }

    for (let x of newArr2) {
      let obj = {
        ...x,
        Map: x.Link,
        LinkSEO: x.FileName,
      };
      let newDesc = x.DescSEO ? JSON.parse(x.DescSEO) : null;

      if (newDesc && newDesc.place && newDesc.place.length > 0) {
        obj.Province = newDesc.place.filter((o) => o.Parentid > 0)[0];
        obj.District = newDesc.place.filter((o) => !o.Parentid)[0];
      }
      newMaps.push(obj);
    }

    newMaps = newMaps?.sort(
      (a, b) => Number(a?.Province?.Parentid) - Number(b?.Province?.Parentid)
    );

    for (let province of newMaps) {
      let index = Provinces.findIndex(
        (x) =>
          Number(
            province?.Province?.Parentid && province?.Province?.Parentid
          ) === Number(x.Parentid)
      );
      if (index > -1) {
        let indexDistr = Provinces[index].Districts.findIndex(
          (o) => o.ID === province?.District?.ID
        );
        if (indexDistr === -1) {
          Provinces[index].Districts.push({
            ...province?.District,
            label: province?.District?.Title || null,
            value: province?.District?.ID || null,
          });
        }
      } else {
        Provinces.push({
          ...province?.Province,
          label: province?.Province?.Title || null,
          value: province?.Province?.Parentid || null,
          Districts: [
            {
              ...province?.District,
              label: province?.District?.Title || null,
              value: province?.District?.ID || null,
            },
          ],
        });
      }
    }

    this.setState({
      arrMaps: newMaps,
      arrayCurrent: newMaps,
      currentMap: newMaps[0].Map,
      currentID: newMaps[0].ID,
      Provinces: Provinces.filter((x) => x.Parentid),
    });
  };

  handStyle = () => {
    const { arrMaps } = this.state;
    const _width =
      arrMaps && arrMaps.length > 1 ? this.state.width - 80 : "100%";
    return Object.assign({
      width: _width,
    });
  };

  handleMaps = (item) => {
    this.setState({
      currentMap: item.Map,
      currentID: item.ID,
    });
  };

  openMaps = (item) => {
    OPEN_LINK(
      `https://www.google.com/maps/dir/?api=1&destination=${item?.Desc.split(
        " "
      ).join("+")}`
    );
  };

  render() {
    const {
      arrMaps,
      Provinces,
      currentMap,
      currentID,
      ActiveDistricts,
      ActiveProvinces,
      isOpen,
      MapsOpen,
    } = this.state;

    return (
      <Page name="maps">
        <Navbar>
          <div className="page-navbar">
            <div className="page-navbar__back">
              <Link onClick={() => this.$f7router.back()}>
                <i className="las la-angle-left"></i>
              </Link>
            </div>
            <div className="page-navbar__title">
              <span
                className="title"
                onClick={() =>
                  this.$f7.views.main.router.navigate(
                    this.$f7.views.main.router.url,
                    {
                      reloadCurrent: true,
                    }
                  )
                }
              >
                Hệ thống cơ sở
              </span>
            </div>
            <div className="page-navbar__noti">
              <NotificationIcon />
            </div>
          </div>
        </Navbar>
        <div className="page-wrapper page-maps page-maps2">
          {/* <div className="maps">
            {currentMap && (
              <iframe
                src={ReactHtmlParser(currentMap)}
                frameBorder={0}
                allowFullScreen
                aria-hidden="false"
                tabIndex={0}
                loading="lazy"
              />
            )}
          </div> */}
          <div className="wrap-filter pb-0">
            <div className="box-filter">
              <div>
                <SelectPicker
                  placeholder="Tỉnh / TP"
                  value={ActiveProvinces}
                  options={Provinces || []}
                  label="Chọn Tỉnh / Thành phố"
                  onChange={(val) => this.setState({ ActiveProvinces: val })}
                />
              </div>
              <div>
                <SelectPicker
                  placeholder="Quận / Huyện"
                  value={ActiveDistricts}
                  options={ActiveProvinces?.Districts || []}
                  label="Chọn Tỉnh / Thành phố"
                  onChange={(val) => this.setState({ ActiveDistricts: val })}
                  disabled={!ActiveProvinces}
                />
              </div>
            </div>
            {/* <div className="map-total">
              <i className="las la-store"></i> Có {arrMaps?.length} cơ sở
            </div> */}
          </div>
          <div
            className="list"
            style={{
              height: "auto",
              flex: "1",
            }}
          >
            {arrMaps &&
              arrMaps.map((item, index) => (
                <div
                  className={clsx(
                    "item-stock"
                    //currentID === item.ID && "active"
                  )}
                  key={index}
                  onClick={() => {
                    this.setState({ isOpen: true, MapsOpen: item });
                    f7.dialog.preloader("Đang tải...");
                  }}
                >
                  <div className="_title">{item.Title}</div>
                  <div className="_address">
                    <i className="las la-map-marked-alt"></i>
                    <div className="_address-value">
                      {ReactHtmlParser(item.Desc || "Đang cập nhập")}
                    </div>
                  </div>
                  <div className="_work">
                    <div className="_phone">
                      <i className="las la-phone-volume"></i>
                      {item.FileName || "Đang cập nhập"}
                    </div>
                    {!window.GlobalConfig?.APP?.an_chi_duong ? (
                      <>
                        {iOS() ? (
                          <Link
                            className="_support"
                            external
                            href={`https://www.google.com/maps/dir/?api=1&destination=${item?.Desc.split(
                              " "
                            ).join("+")}`}
                            noLinkClass
                          >
                            <i className="las la-blind"></i>
                            Chỉ đường
                          </Link>
                        ) : (
                          <div
                            className="_support"
                            onClick={(e) => {
                              e.stopPropagation();
                              this.openMaps(item);
                            }}
                          >
                            <i className="las la-blind"></i>
                            Chỉ đường
                          </div>
                        )}
                      </>
                    ) : (
                      <></>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>

        <LoginScreen
          opened={isOpen}
          onLoginScreenClosed={() => {
            this.setState({ isOpen: false, MapsOpen: null });
          }}
        >
          <div className="h-100 pop-maps-detail">
            <div className="pop-maps-iframe">
              {MapsOpen?.Map && (
                <iframe
                  src={ReactHtmlParser(MapsOpen?.Map)}
                  frameBorder={0}
                  allowFullScreen
                  aria-hidden="false"
                  tabIndex={0}
                  loading="lazy"
                  onLoad={() => f7.dialog.close()}
                />
              )}
              <div
                className="_back"
                onClick={() => this.setState({ isOpen: false, MapsOpen: null })}
              >
                <i className="las la-arrow-left"></i>
              </div>
            </div>
            <div className="pop-maps-info">
              <div className="_title">{MapsOpen?.Title}</div>
              <div className="_address">
                <i className="las la-map-marked-alt"></i>
                <div className="_address-value">
                  {ReactHtmlParser(MapsOpen?.Desc || "Đang cập nhập")}
                </div>
              </div>
              <div className="_phone">
                <i className="las la-phone-volume"></i>
                {MapsOpen?.FileName || "Đang cập nhập"}
              </div>

              {!window.GlobalConfig?.APP?.an_chi_duong ? (
                <>
                  {iOS() ? (
                    <Link
                      className="_btn-address"
                      external
                      href={`https://www.google.com/maps/dir/?api=1&destination=${MapsOpen?.Desc.split(
                        " "
                      ).join("+")}`}
                      noLinkClass
                    >
                      Chỉ đường
                    </Link>
                  ) : (
                    <button
                      onClick={() => this.openMaps(MapsOpen)}
                      type="button"
                      className="_btn-address"
                    >
                      Chỉ đường
                    </button>
                  )}
                </>
              ) : (
                <></>
              )}

              {MapsOpen?.FileName && (
                <button type="button" className="_btn-contact">
                  Liên hệ
                </button>
              )}
            </div>
          </div>
        </LoginScreen>
        <Toolbar tabbar position="bottom">
          <ToolBarBottom />
        </Toolbar>
      </Page>
    );
  }
}
