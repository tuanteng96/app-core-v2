import React from "react";
import { SERVER_APP } from "./../../constants/config";
import { Page, Link, Toolbar, Navbar } from "framework7-react";
import ReactHtmlParser from "react-html-parser";
import ToolBarBottom from "../../components/ToolBarBottom";
import UserService from "../../service/user.service";
import Slider from "react-slick";
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
          (x) => x?.Province?.Parentid === ActiveProvinces?.value
        );
      }
      if (ActiveDistricts) {
        newValues = newValues.filter(
          (x) => x?.District?.ID === ActiveDistricts?.value
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
    let newArr2 = arr2?.data || [];
    let newMaps = [];

    let Provinces = [];

    for (let x of newArr1) {
      let obj = {
        ...x,
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

    for (let province of newMaps) {
      let index = Provinces.findIndex(
        (x) =>
          province?.Province?.Parentid &&
          province?.Province?.Parentid === x.Parentid
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
    } = this.state;
    const settingsMaps = {
      className: "slider variable-width",
      dots: false,
      arrows: false,
      infinite: true,
      slidesToShow: 1,
      //centerPadding: "20px",
      variableWidth: true,
    };

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
          <div className="maps">
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
          </div>
          <div className="wrap-filter">
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
            <div className="map-total">
              <i className="las la-store"></i> Có {arrMaps?.length} cơ sở
            </div>
          </div>
          <div className="list">
            {arrMaps &&
              arrMaps.map((item, index) => (
                <div
                  className={clsx(
                    "item-stock",
                    currentID === item.ID && "active"
                  )}
                  key={index}
                  onClick={() => this.handleMaps(item)}
                >
                  <div className="_title">{item.Title}</div>
                  <div className="_address">
                    <i className="las la-map-marked-alt"></i>
                    <div className="_address-value">
                      {ReactHtmlParser(item.Desc)}
                    </div>
                  </div>
                  <div className="_work">
                    <div className="_phone">
                      <i className="las la-phone-volume"></i>
                      {item.FileName || "Chưa có"}
                    </div>

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
                  </div>
                </div>
              ))}
          </div>
        </div>
        <Toolbar tabbar position="bottom">
          <ToolBarBottom />
        </Toolbar>
      </Page>
    );
  }
}
