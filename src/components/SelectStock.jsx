import React from "react";
import {
  Page,
  Link,
  Toolbar,
  Actions,
  ActionsGroup,
  ActionsLabel,
  ActionsButton,
  f7,
} from "framework7-react";
import UserService from "../service/user.service";
import {
  setStockIDStorage,
  getStockIDStorage,
  setStockNameStorage,
  getUser,
  app_request,
} from "../constants/user";
import { toast } from "react-toastify";
import StocksProvincesFilter from "./StocksProvincesFilter";
import { SEND_TOKEN_FIREBASE } from "../constants/prom21";
import userService from "../service/user.service";
import { iOS } from "../constants/helpers";

export default class SelectStock extends React.Component {
  constructor() {
    super();
    this.state = {
      arrStock: [],
      isReload: 0,
      isOpen: false,
    };
  }

  async getStock() {
    UserService.getStock().then((response) => {
      const CurrentStockID = response.data.data.CurrentStockID;
      let ListStock = response.data.data.all;
      const StocksNotBook = window?.GlobalConfig?.StocksNotBook || "";
      ListStock = ListStock
        ? ListStock.filter((o) => o.ID !== 778 && !StocksNotBook.includes(o.ID))
        : "";
      this.setState({
        CurrentStockID: CurrentStockID,
        arrStock: ListStock,
      });
    });
  }

  componentDidMount() {
    const isOpenStock = this.props.isOpenStock;
    if (isOpenStock === true) {
      if (window?.GlobalConfig?.APP?.ByProvince) {
        this.setState({ isOpen: true });
      } else {
        this.refs.actionStock.open();
      }

      this.getStock();
    } else {
      const StockID = getStockIDStorage();
      this.setState({
        StockID: StockID,
      });
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const { isReload, isOpenStock } = this.props;

    if (prevProps.isOpenStock !== isOpenStock) {
      this.getStock();
      if (window?.GlobalConfig?.APP?.ByProvince) {
        this.setState({ isOpen: true });
      } else {
        this.refs.actionStock.open();
      }
    }
    if (prevProps.isReload !== isReload) {
      const StockID = getStockIDStorage();
      this.setState({
        StockID: StockID,
        isReload: this.state.isReload + 1,
      });
    }
  }

  handleChangeStock = (item) => {
    var CheckedStock = item.ID;
    var NameStock = item.Title;
    var bodyData = new FormData();
    bodyData.append("stockid", CheckedStock);

    UserService.setStock(bodyData)
      .then((response) => {
        this.refs.actionStock.close();
        setStockIDStorage(CheckedStock);
        setStockNameStorage(NameStock);
        this.setState({
          StockID: CheckedStock,
        });
        toast.success("Chọn điểm thành công !", {
          position: toast.POSITION.TOP_CENTER,
          autoClose: 1500,
        });
        if (this.props.fnSuccess !== undefined) {
          this.props.fnSuccess(true);
        }
        this.props.nameStock && this.props.nameStock(NameStock);
        if (!this.props?.noReload) {
          this.$f7.views.main.router.navigate(this.$f7.views.main.router.url, {
            reloadCurrent: true,
          });
        }
      })
      .catch((err) => console.log(err));
  };

  updateStockCr = (val) => {
    var bodyData = new FormData();
    bodyData.append("stockid", val?.ID);

    UserService.setStock(bodyData)
      .then((response) => {
        setStockIDStorage(val?.ID);
        setStockNameStorage(val?.Title);
        this.setState({
          StockID: val?.ID,
          isOpen: false,
        });
        toast.success("Chọn điểm thành công !", {
          position: toast.POSITION.TOP_CENTER,
          autoClose: 1500,
        });
        if (this.props.fnSuccess !== undefined) {
          this.props.fnSuccess(true);
        }
        this.props.nameStock && this.props.nameStock(val.Title);
        if (!this.props?.noReload) {
          this.$f7.views.main.router.navigate(this.$f7.views.main.router.url, {
            reloadCurrent: true,
          });
        }
      })
      .catch((err) => console.log(err));
  };

  render() {
    const { isOpen, arrStock } = this.state;
    const StockID = this.state.StockID && this.state.StockID;
    if (!arrStock) return <></>;
    
    if (window?.GlobalConfig?.APP?.ByProvince) {
      return (
        <StocksProvincesFilter
          isOpen={isOpen}
          onClose={() => this.setState({ isOpen: false })}
          Stocks={arrStock}
          onChange={(val) => this.updateStockCr(val)}
          isChangeBrands={true}
        />
      );
    }

    return (
      <Actions className="action-stock" ref="actionStock">
        <ActionsGroup>
          <div className="action-stock__list">
            <div className="action-stock__list-name title">
              <h5>Chọn cơ sở gần bạn</h5>
            </div>
            {arrStock &&
              arrStock.map((item) => (
                <div
                  className={
                    "action-stock__list-name " +
                    (parseInt(StockID) === item.ID ? "currentStock" : "")
                  }
                  key={item.ID}
                  onClick={(e) => this.handleChangeStock(item)}
                >
                  {/* <input
                    name="ValueStock"
                    type="radio"
                    value={item.ID}
                    title={item.Title}
                    id={"stock" + item.ID}
                    defaultChecked={parseInt(StockID) === item.ID}
                    onChange={(e) => this.handleChangeStock(e)}
                  /> */}
                  <label>
                    {item.Title} <i className="las la-check"></i>
                  </label>
                </div>
              ))}
          </div>
        </ActionsGroup>
        {window?.GlobalConfig?.APP?.isMulti && (
          <ActionsGroup>
            <ActionsButton
              className="fw-400"
              color="red"
              onClick={() => {
                f7.dialog.confirm("Bạn muốn thay đổi chi nhánh ?", async () => {
                  if (getUser()) {
                    SEND_TOKEN_FIREBASE().then(async (response) => {
                      if (!response.error && response.Token) {
                        const { ID, acc_type } = getUser();
                        await userService.authRemoveFirebase({
                          Token: response.Token,
                          ID: ID,
                          Type: acc_type,
                        });
                      } else {
                        app_request("unsubscribe", "");
                      }
                      iOS() && REMOVE_BADGE();
                      await localStorage.clear();

                      f7.dialog.close();
                      f7.views.main.router.navigate("/");
                    });
                    window.UnSubscribe && window.UnSubscribe()
                  } else {
                    f7.dialog.close();
                    await localStorage.clear();
                    f7.views.main.router.navigate("/");
                  }
                });
              }}
            >
              Đổi chi nhánh
            </ActionsButton>
          </ActionsGroup>
        )}

        <ActionsGroup>
          <ActionsButton color="red">Đóng</ActionsButton>
        </ActionsGroup>
      </Actions>
    );
  }
}
