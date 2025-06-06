import React from "react";
import {
  Page,
  Link,
  Navbar,
  Toolbar,
  Sheet,
  Row,
  Col,
  Subnavbar,
  Tabs,
  Tab,
} from "framework7-react";
import ScheduleSpa from "../../components/schedule/ScheduleSpa";
import ScheduleService from "../../components/schedule/ScheduleService";
import ScheduleSuccess from "../../components/schedule/ScheduleSuccess";
import BooksIcon from "../../components/BooksIcon";
import { TiLocation, TiTime, TiCalendarOutline, TiHeart } from "react-icons/ti";
import {
  getStockIDStorage,
  getStockNameStorage,
  getUser,
} from "../../constants/user";
import { BiCheckDouble } from "react-icons/bi";
import BookDataService from "../../service/book.service";
import { toast } from "react-toastify";
import ToolBarBottom from "../../components/ToolBarBottom";
import moment from "moment";
import "moment/locale/vi";
import _ from "lodash";
import { Animated } from "react-animated-css";
import Select, { components } from "react-select";
import staffService from "../../service/staff.service";
import ReactStars from "react-rating-stars-component";

moment.locale("vi");

const CustomOption = ({ children, data, ...props }) => {
  return (
    <components.Option {...props}>
      <div className="d-flex justify-content-between align-items-center">
        {children}
        {window.GlobalConfig?.Admin?.dat_lich_nhan_vien_sao ? (
          <ReactStars
            count={5}
            size={20}
            activeColor="#f3cd00"
            value={
              data.source.AverRate > 5
                ? 5
                : Math.round(data.source.AverRate * 2) / 2
            }
            edit={false}
            isHalf={true}
          />
        ) : (
          <></>
        )}
      </div>
    </components.Option>
  );
};

export default class extends React.Component {
  constructor() {
    super();
    this.state = {
      onFinish: false,
      activeStep: 0,
      selectedService: [],
      isLoadingStep1: false,
      isLoading: false,
      isLoadingSheet: true,
      sheetOpened: false,
      //new
      tabCurrent: 0,
      height: 0,
      DateTimeBook: {
        date: moment(new Date()).format("DD/MM/YYYY"),
        stock:
          window?.GlobalConfig?.StocksNotBook &&
          window?.GlobalConfig?.StocksNotBook?.includes(getStockIDStorage())
            ? ""
            : getStockIDStorage(),
        nameStock:
          window?.GlobalConfig?.StocksNotBook &&
          window?.GlobalConfig?.StocksNotBook.includes(getStockIDStorage())
            ? ""
            : getStockNameStorage(),
        AtHome: false,
        time: "",
      },
      isParams: true,
      options: [],
      StaffSelected: "",
      AmountPeople: {
        label: "1 khách",
        value: 1,
      },
      prevBook: null,
    };
  }

  isOther(dateCurrent) {
    const gettoday = moment();
    var today = moment(gettoday).add(0, "days").format("DD/MM/YYYY");
    var tomorrow = moment(gettoday).add(1, "days").format("DD/MM/YYYY");
    var dateBook = moment(dateCurrent).format("DD/MM/YYYY");

    return today !== dateBook && tomorrow !== dateBook;
  }

  componentDidMount() {
    const height = this.divElement.clientHeight - this.divBtn.clientHeight - 67;
    this.setState({ height });
    const self = this;
    // Check query từ Danh sách dịch vụ tới
    if (
      this.$f7route?.query?.SelectedId ||
      this.$f7route?.query?.SelectedTitle
    ) {
      const { SelectedTitle, SelectedId } = this.$f7route.query;
      this.handleService({
        ID: Number(SelectedId),
        Title: SelectedTitle,
      });
    }
    if (this.$f7route?.query?.note) {
      this.setState({
        serviceNote: this.$f7route?.query?.note,
      });
    }
    //
      
    if (this.$f7route.params.ID && this.state.isParams) {
      self.$f7.dialog.preloader("Đang tải ...");
      const { ID } = this.$f7route.params;
      BookDataService.getBookId(ID)
        .then(({ data }) => {
          const currentBook = data.data;
          
          let serviceNotes = "";
          let AmountPeople = {
            label: "1 khách",
            value: 1,
          };
          let descSplit = currentBook?.Desc?.split("\n");
          if (descSplit) {
            for (let i of descSplit) {
              if (i.includes("Số lượng khách:")) {
                let SL = Number(i.match(/\d+/)[0]);
                AmountPeople = {
                  label: SL + " khách",
                  value: SL,
                };
              }
              if (i.includes("Ghi chú:")) {
                serviceNotes = i.replaceAll("Ghi chú: ", "");
                let indexCut =
                  serviceNotes && serviceNotes.indexOf("(Thay đổi từ");
                if (indexCut > -1) {
                  serviceNotes = serviceNotes.substring(0, indexCut);
                }
              }
            }
          }

          if (currentBook) {
            this.setState({
              DateTimeBook: {
                date: moment(currentBook.BookDate).format("DD/MM/YYYY"),
                time: moment(currentBook.BookDate).format("HH:mm"),
                stock: currentBook?.Stock?.ID || "",
                nameStock: currentBook?.Stock?.Title || "",
                AtHome: currentBook.AtHome,
                isOther: this.isOther(currentBook.BookDate),
              },
              serviceNote: serviceNotes.replaceAll("</br>", "\n"),
              selectedService: currentBook.Roots,
              AmountPeople,
              OldBook: currentBook,
              StaffSelected:
                currentBook?.UserServices &&
                currentBook?.UserServices.length > 0
                  ? currentBook?.UserServices.map((x) => ({
                      ...x,
                      label: x.FullName,
                      value: x.ID,
                    }))[0]
                  : "",
              prevBook: currentBook,
            });
          }

          self.$f7.dialog.close();
        })
        .catch((error) => console.log(error));
    }

    this.getListStaff();
  }

  componentDidUpdate(prevProps, prevState) {
    const { stock } = this.state.DateTimeBook;
    const stockPrev = prevState.DateTimeBook.stock;
    if (stock !== stockPrev) {
      this.getListStaff();
    }
  }

  getListStaff = () => {
    const { DateTimeBook } = this.state;
    const stockid = DateTimeBook.stock;
    staffService
      .getListStaff(stockid)
      .then(({ data }) => {
        if (data.data && data.data.length > 0) {
          const newData = data.data.map((item) => ({
            ...item,
            value: item.id,
            label: item.text,
          }));
          this.setState({
            options: newData,
          });
        }
      })
      .catch((error) => console.log(error));
  };

  onResetStep = () => {
    this.setState({
      tabCurrent: 0,
    });
  };

  nextStep = () => {
    if (this.state.tabCurrent < 3) {
      this.setState({ tabCurrent: this.state.tabCurrent + 1 });
    }
  };

  previousStep = () => {
    if (this.state.tabCurrent > 0) {
      this.setState({ tabCurrent: this.state.tabCurrent - 1 });
    }
  };

  handleTime = (item) => {
    this.setState({
      DateTimeBook: item,
    });
  };

  handleNote = (evt) => {
    const { value } = evt.target;
    this.setState({
      serviceNote: value,
    });
  };

  nextService = () => {
    this.setState({
      isLoadingStep1: true,
    });
    setTimeout(() => {
      this.setState({
        isLoadingStep1: false,
      });
      this.nextStep();
    }, 300);
  };
  nextSuccessService = () => {
    this.setState({
      sheetOpened: true,
    });
  };

  submitBooks = () => {
    const {
      DateTimeBook,
      serviceNote,
      selectedService,
      StaffSelected,
      AmountPeople,
      OldBook,
      prevBook,
    } = this.state;
    
    const infoUser = getUser();
    const self = this;
    if (!infoUser) {
      return false;
    }
    const dateSplit = DateTimeBook.date ? DateTimeBook.date.split("/") : "";
    const date =
      Array.isArray(dateSplit) && dateSplit.length > 0
        ? dateSplit[2] +
          "-" +
          dateSplit[1] +
          "-" +
          dateSplit[0] +
          " " +
          DateTimeBook.time
        : "";

    //selectedService
    let Tags = [];

    if (selectedService && selectedService.length > 0) {
      if (
        selectedService.some(
          (item) =>
            item.OsBook > 0 ||
            item.OsDoing > 0 ||
            item.OsNew > 0 ||
            item.OsBH > 0
        )
      ) {
        Tags.push("Có thẻ");
      }
      if (
        selectedService.some(
          (item) =>
            item.OsBook === 0 &&
            item.OsDoing === 0 &&
            item.OsNew === 0 &&
            item.OsBH === 0
        )
      ) {
        Tags.push("Không thẻ");
      }
    }

    let newDesc =
      window.GlobalConfig?.APP?.SL_khach && AmountPeople
        ? `Số lượng khách: ${
            AmountPeople.value
          }. \nTags: ${Tags.toString()} \nGhi chú: ${
            (serviceNote ? serviceNote.replaceAll("\n", "</br>") : "") +
            (OldBook
              ? ` (Thay đổi từ ${OldBook?.RootTitles} - ${moment(
                  OldBook?.BookDate
                ).format("HH:mm DD-MM-YYYY")}`
              : "")
          }`
        : (serviceNote ? serviceNote.replaceAll("\n", "</br>") : "") +
          (OldBook
            ? ` (Thay đổi từ ${OldBook?.RootTitles} - ${moment(
                OldBook?.BookDate
              ).format("HH:mm DD-MM-YYYY")})`
            : "");

    const dataSubmit = {
      booking: [
        {
          MemberID: infoUser.ID,
          RootIdS: selectedService.map((item) => item.ID).toString(),
          BookDate: date,
          Desc: newDesc,
          StockID: DateTimeBook.stock || 0,
          AtHome: DateTimeBook.AtHome,
          UserServiceIDs: StaffSelected ? StaffSelected.value : "",
        },
      ],
    };

    if (this.$f7route.params.ID && Number(this.$f7route.params.ID) > 0 && this.state.isParams) {
      dataSubmit.deletes = [{ ID: this.$f7route.params.ID }];
      dataSubmit.prevDeletes = prevBook && [prevBook];
    }
    this.setState({
      isLoading: true,
    });

    BookDataService.postBooking(dataSubmit)
      .then((response) => {
        if (response.error) {
          toast.error(response.error, {
            position: toast.POSITION.TOP_LEFT,
            autoClose: 3000,
          });
          this.setState({
            isLoading: false,
            sheetOpened: false,
          });
        } else {
          setTimeout(() => {
            self.$f7.preloader.hide();
            toast.success("Đặt lịch thành công !", {
              position: toast.POSITION.TOP_LEFT,
              autoClose: 3000,
            });

            this.setState({
              isLoading: false,
              sheetOpened: false,
              selectedService: [],
              DateTimeBook: {
                date: moment(new Date()).format("DD/MM/YYYY"),
                stock: getStockIDStorage() ? getStockIDStorage() : "",
                nameStock: getStockNameStorage() ? getStockNameStorage() : "",
                AtHome: false,
              },
              serviceNote: "",
              isParams: false,
              StaffSelected: "",
            });
            this.nextStep();
            window.OnMemberBook &&
              window.OnMemberBook({
                Member: infoUser,
                booking: { ...dataSubmit.booking[0], Roots: selectedService },
                action: "ADD_EDIT",
                from: "APP",
                delete: dataSubmit?.deletes ? dataSubmit?.deletes : null,
                prevDelete : prevBook
              });
          }, 300);
        }
      })
      .catch((e) => {
        console.log(e);
      });
  };

  closeSheet = () => {
    this.setState({
      sheetOpened: false,
    });
  };

  controlsStep = () => {
    const { DateTimeBook, isLoadingStep1, selectedService } = this.state;

    switch (this.state.tabCurrent) {
      case 0:
        return (
          <div className="schedule-toolbar">
            <button
              type="button"
              className={`btn-submit-order btn-submit-order ${
                (DateTimeBook && !DateTimeBook["time"]) ||
                (DateTimeBook && !DateTimeBook.stock) ||
                !DateTimeBook ||
                !DateTimeBook.date
                  ? "btn-no-click"
                  : ""
              } ${!DateTimeBook && "btn-no-click"} ${
                isLoadingStep1 && "loading"
              }`}
              onClick={() => this.nextService()}
            >
              <span>Chọn dịch vụ</span>
              <div className="loading-icon">
                <div className="loading-icon__item item-1"></div>
                <div className="loading-icon__item item-2"></div>
                <div className="loading-icon__item item-3"></div>
                <div className="loading-icon__item item-4"></div>
              </div>
            </button>
          </div>
        );
      case 1:
        return (
          <div className="schedule-toolbar">
            <button
              type="button"
              className={`btn-submit-order btn-submit-order 
              ${
                !selectedService ||
                (selectedService.length === 0 && "btn-no-click")
              }`}
              onClick={() => this.nextSuccessService()}
            >
              <span>Đặt lịch ngay</span>
              <div className="loading-icon">
                <div className="loading-icon__item item-1"></div>
                <div className="loading-icon__item item-2"></div>
                <div className="loading-icon__item item-3"></div>
                <div className="loading-icon__item item-4"></div>
              </div>
            </button>
          </div>
        );
      default:
        return <ToolBarBottom />;
    }
  };

  onToBack = () => {
    if (this.state.tabCurrent === 0) {
      this.$f7router.back();
    } else {
      this.previousStep();
    }
  };

  handleService = (item) => {
    const { selectedService } = this.state;
    const index = this.state.selectedService.findIndex(
      (service) => service.ID === item.ID
    );
    if (index > -1) {
      this.setState({
        selectedService: selectedService.filter(
          (service) => service.ID !== item.ID
        ),
      });
    } else {
      this.setState({
        selectedService: [...selectedService, item],
      });
    }
  };

  // loadRefresh(done) {
  //   const _this = this;
  //   _this.setState((prevState) => ({
  //     onRefresh: {
  //       fn: done(),
  //       isRefresh: !prevState.onRefresh.onRefresh,
  //     },
  //   }));
  // }

  render() {
    const {
      isLoading,
      sheetOpened,
      DateTimeBook,
      selectedService,
      //new
      tabCurrent,
      height,
      serviceNote,
      options,
      StaffSelected,
      AmountPeople,
    } = this.state;

    return (
      <Page
        name="schedule"
        // ptr
        // infiniteDistance={50}
        //infinitePreloader={showPreloader}
        //onPtrRefresh={this.loadRefresh.bind(this)}
      >
        <Navbar>
          <div className="page-navbar">
            <div className="page-navbar__back">
              <Link onClick={() => this.onToBack()}>
                <i className="las la-angle-left"></i>
              </Link>
            </div>
            <div className="page-navbar__title">
              <span className="title">Đặt lịch</span>
            </div>
            <div className="page-navbar__noti">
              <BooksIcon />
            </div>
          </div>
          <Subnavbar className="subnavbar-booking">
            <div
              className="page-schedule__step"
              ref={(divBtn) => {
                this.divBtn = divBtn;
              }}
            >
              <Link
                className={`page-schedule__step-item`}
                noLinkClass
                tabLink={`#book-${0}`}
                tabLinkActive={tabCurrent === 0}
                onClick={() =>
                  this.state.tabCurrent > 0 && this.setState({ tabCurrent: 0 })
                }
              >
                <div className="number">1</div>
                <div className="text">
                  <span>Thời gian</span>
                </div>
              </Link>
              <Link
                className={`page-schedule__step-item`}
                noLinkClass
                tabLink={`#book-${1}`}
                tabLinkActive={tabCurrent === 1}
                onClick={() =>
                  this.state.tabCurrent > 1 && this.setState({ tabCurrent: 1 })
                }
              >
                <div className="number">2</div>
                <div className="text">
                  <span>Đặt lịch</span>
                </div>
              </Link>
              <Link
                className={`page-schedule__step-item`}
                noLinkClass
                tabLink={`#book-${2}`}
                tabLinkActive={tabCurrent === 2}
              >
                <div className="number">3</div>
                <div className="text">
                  <span>Hoàn tất</span>
                </div>
              </Link>
            </div>
          </Subnavbar>
        </Navbar>
        <div
          className={`page-schedule h-100`}
          ref={(divElement) => {
            this.divElement = divElement;
          }}
        >
          <Tabs>
            <Tab id={`#book-${0}`} tabActive={tabCurrent === 0}>
              <Animated
                animationIn="bounceInLeft"
                animationOut="bounceInLeft"
                animationInDuration={700}
                isVisible={true}
              >
                <ScheduleSpa
                  handleTime={(item) => this.handleTime(item)}
                  DateTimeBook={DateTimeBook}
                />
              </Animated>
            </Tab>
            <Tab
              className="h-100"
              id={`#book-${1}`}
              tabActive={tabCurrent === 1}
            >
              {tabCurrent === 1 && (
                <Animated
                  animationIn="bounceInRight"
                  animationOut="bounceInLeft"
                  animationInDuration={700}
                  isVisible={true}
                >
                  <ScheduleService
                    height={height}
                    selectedService={selectedService}
                    handleService={(ID) => this.handleService(ID)}
                    DateTimeBook={DateTimeBook}
                  />
                </Animated>
              )}
            </Tab>
            <Tab id={`#book-${2}`} tabActive={tabCurrent === 2}>
              {tabCurrent === 2 && (
                <Animated
                  animationIn="bounceInLeft"
                  animationOut="bounceInLeft"
                  animationInDuration={700}
                  isVisible={true}
                >
                  <ScheduleSuccess onResetStep={() => this.onResetStep()} />
                </Animated>
              )}
            </Tab>
          </Tabs>
        </div>
        <Sheet
          className="sheet-swipe-product sheet-swipe-service"
          style={{ height: "auto", "--f7-sheet-bg-color": "#fff" }}
          opened={sheetOpened}
          onSheetClosed={() => this.closeSheet()}
          //swipeToClose
          //swipeToStep
          backdrop
        >
          <div className="sheet-modal-swipe-step">
            <div className="sheet-modal-swipe__close"></div>
            <div className="sheet-swipe-product__content sheet-swipe-service__content">
              <div className="sheet-pay-head sheet-service-header">
                Xác nhận đặt lịch
              </div>
              <div className="sheet-pay-body sheet-service-body">
                <div className="sheet-service-body__content">
                  <div className="location">
                    <div className="icon">
                      <TiLocation /> Cơ sở
                      <span>{DateTimeBook && DateTimeBook.nameStock}</span>
                    </div>
                  </div>
                  <div className="time">
                    <Row>
                      <Col width="50">
                        <div className="time-box">
                          <div className="icon">
                            <TiCalendarOutline />
                            Ngày
                          </div>
                          <div className="text">
                            {DateTimeBook && DateTimeBook.date}
                          </div>
                        </div>
                      </Col>
                      <Col width="50">
                        <div className="time-box">
                          <div className="icon">
                            <TiTime />
                            Giờ
                          </div>
                          <div className="text">
                            {DateTimeBook && DateTimeBook.time}
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </div>
                  <div className="service">
                    <div className="icon">
                      <TiHeart />
                      Dịch vụ đã chọn
                    </div>
                    {selectedService &&
                      selectedService.map((item, index) => (
                        <div className="text" key={index}>
                          {index + 1}. {item.Title}
                          <BiCheckDouble />
                        </div>
                      ))}
                  </div>
                </div>
                {window.GlobalConfig?.APP?.Booking?.AtHome && (
                  <div className="sheet-service-body__athome">
                    <div>
                      <i className="las la-home"></i> Sử dụng dịch vụ tại nhà
                    </div>
                    <label>
                      <input
                        type="checkbox"
                        onChange={(evt) => {
                          const isChecked = evt.target.checked;
                          this.setState((prevState) => ({
                            ...prevState,
                            DateTimeBook: {
                              ...prevState.DateTimeBook,
                              AtHome: isChecked,
                            },
                          }));
                        }}
                        checked={DateTimeBook.AtHome}
                      />
                      <span />
                    </label>
                  </div>
                )}
                {window.GlobalConfig?.Admin?.dat_lich_nhan_vien === 1 && (
                  <div className="sheet-service-body__content">
                    <div className="fw-500 mb-5px font-size-xs">
                      Nhân viên thực hiện
                    </div>
                    <Select
                      //isSearchable
                      isClearable
                      classNamePrefix="select"
                      options={options}
                      placeholder="Chọn nhân viên"
                      value={StaffSelected}
                      onChange={(value) =>
                        this.setState({ StaffSelected: value })
                      }
                      components={{ Option: CustomOption }}
                      blurInputOnSelect={true}
                      noOptionsMessage={() => "Không có nhân viên."}
                      //menuIsOpen
                      //menuPosition="fixed"
                    />
                  </div>
                )}
                {window.GlobalConfig?.APP?.SL_khach && (
                  <div className="sheet-service-body__content">
                    <div className="fw-500 mb-5px font-size-xs">
                      Số lượng khách
                    </div>
                    <Select
                      //isSearchable
                      isClearable
                      classNamePrefix="select"
                      options={Array(10)
                        .fill()
                        .map((_, x) => ({
                          label: x + 1 + " khách",
                          value: x + 1,
                        }))}
                      placeholder="Chọn số khách"
                      value={AmountPeople}
                      onChange={(value) =>
                        this.setState({ AmountPeople: value })
                      }
                      blurInputOnSelect={true}
                      noOptionsMessage={() => "Không có nhân viên."}
                      //menuIsOpen
                      //menuPosition="fixed"
                    />
                  </div>
                )}
                <div className="sheet-service-body__note">
                  <textarea
                    onChange={this.handleNote}
                    placeholder="Cho chúng tôi biết lưu ý thêm của bạn"
                    value={serviceNote}
                  ></textarea>
                </div>
                <div className="sheet-pay-body__btn">
                  <button
                    className={
                      "page-btn-order btn-submit-order " +
                      (isLoading ? "loading" : "")
                    }
                    onClick={() => this.submitBooks()}
                  >
                    <span>Đặt Lịch</span>
                    <div className="loading-icon">
                      <div className="loading-icon__item item-1"></div>
                      <div className="loading-icon__item item-2"></div>
                      <div className="loading-icon__item item-3"></div>
                      <div className="loading-icon__item item-4"></div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Sheet>

        <Toolbar tabbar position="bottom">
          {this.controlsStep()}
        </Toolbar>
      </Page>
    );
  }
}
