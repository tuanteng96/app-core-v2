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
  f7,
} from "framework7-react";
import { IoCalendarOutline, IoReload, IoReloadCircle } from "react-icons/io5";
import FormScheduleClass from "./FormScheduleClass";
import moment from "moment";
import userService from "../../service/user.service";
import { getUser } from "../../constants/user";
import { toast } from "react-toastify";
import BookDataService from "../../service/book.service";

export default class extends React.Component {
  constructor() {
    super();
    this.state = {
      isLoading: true,
      Items: [],
      Total: 0,
      filters: {
        StockID: [],
        From: null,
        To: null,
        ClassIDs: [],
        TeachIDs: [],
        MemberIDs: [],
        Pi: 1,
        Ps: 20,
      },
      showPreloader: false,
    };
  }

  componentDidMount() {
    const member = getUser();
    if (!member) return false;
    const memberid = member.ID;
    let newFilter = {
      StockID: [],
      From: null,
      To: null,
      ClassIDs: [],
      TeachIDs: [],
      MemberIDs: [memberid],
      BeginFrom: moment()
        .set({
          hour: "00",
          minute: "00",
          second: "00",
        })
        .format("YYYY-MM-DD HH:mm"),
      BeginTo: null,
      Pi: 1,
      Ps: 20,
    };
    this.getSheduleList(newFilter);
  }

  getSheduleList = (filters, callback) => {
    userService
      .getSheduleOsList(filters)
      .then(({ data }) => {
        let newItems =
          filters.Pi === 1
            ? [...(data?.Items || [])]
            : [...this.state.Items, ...(data?.Items || [])];

        this.setState({
          isLoading: false,
          Items: [
            ...new Map(newItems.map((item) => [item["ID"], item])).values(),
          ],
          filters: filters,
          Total: data?.Total,
          showPreloader: false,
        });
        if (filters.Pi === 1) {
          callback && callback();
        }
      })
      .catch((er) => console.log(er));
  };

  loadRefresh(done) {
    this.getSheduleList({ ...this.state.filters, Pi: 1 }, () => done());
  }

  loadMore = () => {
    let { filter, Items, Total, showPreloader } = this.state;
    if (showPreloader) return false;
    if (Items.length >= Total) return false;
    let newFilters = {
      ...filter,
      Pi: filter.Pi + 1,
    };
    this.setState({
      showPreloader: true,
    });
    this.getSheduleList(newFilters);
  };

  onCancelBook = (item) => {
    const member = getUser();
    f7.dialog
      .create({
        title: "Thông báo",
        text: `Bạn muốn huỷ lịch lớp ${item?.Class?.Title} ngày ${moment(
          item.TimeBegin
        ).format("DD-MM-YYYY")} (${moment(item.TimeBegin).format(
          "HH:mm"
        )} - ${moment(item.TimeBegin)
          .add(item?.Class?.Minutes, "minute")
          .format("HH:mm")})`,
        buttons: [
          {
            text: "Đóng",
            close: true,
          },
          {
            text: "Huỷ lịch",
            close: true,
            onClick: async () => {
              f7.dialog.preloader("Đang thực hiện ...");

              let rsClass = await userService.getSheduleOsList({
                StockID: [],
                From: null,
                To: null,
                ClassIDs: [item.Class.ID],
                TeachIDs: [],
                MemberIDs: [member.ID],
                BeginFrom: moment(item.TimeBegin).format("YYYY-MM-DD HH:mm"),
                BeginTo: moment(item.TimeBegin).format("YYYY-MM-DD HH:mm"),
                Pi: 1,
                Ps: 20,
              });

              let index = rsClass?.data?.Items?.findIndex(
                (x) => x.ID === item.ID
              );

              if (index > -1) {
                let iClass = rsClass?.data?.Items[index];

                let newLists = [...(iClass?.Member?.Lists || [])];
                let CrMemberIndex = newLists.findIndex(
                  (x) => Number(x.Member.MemberID) === Number(member.ID)
                );
                let CrMember =
                  CrMemberIndex > -1 ? newLists[CrMemberIndex] : null;
                newLists = newLists.filter(
                  (x) => Number(x.Member.MemberID) !== Number(member.ID)
                );
                let newValues = {
                  ID: item?.ID,
                  CreateDate: moment(
                    item.CreateDate,
                    "YYYY-MM-DD HH:mm"
                  ).format("YYYY-MM-DD HH:mm"),
                  StockID: item?.StockID,
                  TimeBegin: moment(item.TimeBegin).format(
                    "YYYY-MM-DD HH:mm:ss"
                  ),
                  OrderServiceClassID: item?.OrderServiceClassID,
                  TeacherID: iClass.TeacherID,
                  Member: {
                    ...iClass?.Member,
                    Lists: newLists,
                  },
                  MemberID: "",
                  Desc: "",
                };

                let newObj = {
                  ID: CrMember?.Os?.ID,
                  BookDate: null,
                  Status: "",
                  UserID: "",
                  Desc: "",
                };

                let rs = await userService.addEditSheduleOs(
                  { arr: [newValues] },
                  member?.token
                );
                if (rs?.data?.Updated && rs?.data?.Updated.length > 0) {
                  let { Updated } = rs?.data;
                  let index = Updated[0].Member?.Lists?.findIndex(
                    (x) => x?.Member?.ID === Number(member.ID)
                  );
                  if (index === -1) {
                    await userService.addEditSheduleUpdateOs(
                      { arr: [newObj] },
                      member?.token
                    );
                    await BookDataService.bookContact({
                      contact: {
                        StockID: item.Stock?.ID,
                        Fullname: member.FullName,
                        Phone1: member.MobilePhone,
                        Address: "",
                        Email: "",
                        Content: `${member.FullName} / ${
                          member.MobilePhone
                        }  huỷ lịch theo lớp ${item.Class.Title} tại cơ sở ${
                          item.Stock.Title
                        } ngày ${moment(item.TimeBegin).format(
                          "DD-MM-YYYY"
                        )} lúc ${moment(item.TimeBegin).format(
                          "HH:mm"
                        )} - Dịch vụ thẻ ${CrMember?.Os?.Title}`,
                      },
                    });

                    if (newLists?.length === 0) {
                      await userService.deleteSheduleClass(
                        { delete: [item?.ID] },
                        member?.token
                      );
                    }

                    this.getSheduleList(
                      { ...this.state.filters, Pi: 1 },
                      () => {
                        if (newLists?.length === 0) {
                          window.noti27?.LOP_HOC &&
                            window.noti27?.LOP_HOC({
                              type: "Đặt lịch xóa lớp",
                              Class: {
                                ...item?.Class,
                                TimeBegin: item.TimeBegin,
                              },
                              Stock: item.Stock,
                              Members: item?.Member?.Lists
                                ? item?.Member?.Lists.map((x) => x.Member)
                                : [],
                              RefUserIds: item.TeacherID ? [item.Teacher] : [],
                            });
                        }

                        f7.dialog.close();
                        toast.success("Huỷ lịch thành công.");
                      }
                    );
                  } else {
                    this.getSheduleList(
                      { ...this.state.filters, Pi: 1 },
                      () => {
                        f7.dialog.close();
                        toast.success("Xảy ra lỗi. Vui lòng thử lại");
                      }
                    );
                  }
                } else {
                  this.getSheduleList({ ...this.state.filters, Pi: 1 }, () => {
                    f7.dialog.close();
                    toast.success("Xảy ra lỗi. Vui lòng thử lại");
                  });
                }
              } else {
                this.getSheduleList({ ...this.state.filters, Pi: 1 }, () => {
                  f7.dialog.close();
                  toast.success("Lịch đã bị huỷ hoặc lớp đã bị xoá.");
                });
              }
            },
          },
        ],
      })
      .open();
  };

  onEditBook = (item) => {
    const member = getUser();
    f7.dialog
      .create({
        title: "Thông báo",
        text: `Để thay đổi lịch lớp ${item?.Class?.Title} ngày ${moment(
          item.TimeBegin
        ).format("DD-MM-YYYY")} (${moment(item.TimeBegin).format(
          "HH:mm"
        )} - ${moment(item.TimeBegin)
          .add(item?.Class?.Minutes, "minute")
          .format("HH:mm")}) bạn cần huỷ lịch và tạo lịch mới.`,
        buttons: [
          {
            text: "Đóng",
            close: true,
          },
          {
            text: "Huỷ lịch",
            close: true,
            onClick: async () => {
              f7.dialog.preloader("Đang thực hiện ...");

              let rsClass = await userService.getSheduleOsList({
                StockID: [],
                From: null,
                To: null,
                ClassIDs: [item.Class.ID],
                TeachIDs: [],
                MemberIDs: [member.ID],
                BeginFrom: moment(item.TimeBegin).format("YYYY-MM-DD HH:mm"),
                BeginTo: moment(item.TimeBegin).format("YYYY-MM-DD HH:mm"),
                Pi: 1,
                Ps: 20,
              });

              let index = rsClass?.data?.Items?.findIndex(
                (x) => x.ID === item.ID
              );

              if (index > -1) {
                let iClass = rsClass?.data?.Items[index];

                let newLists = [...(iClass?.Member?.Lists || [])];
                let CrMemberIndex = newLists.findIndex(
                  (x) => Number(x.Member.MemberID) === Number(member.ID)
                );
                let CrMember =
                  CrMemberIndex > -1 ? newLists[CrMemberIndex] : null;
                newLists = newLists.filter(
                  (x) => Number(x.Member.MemberID) !== Number(member.ID)
                );

                let newValues = {
                  ID: item?.ID,
                  CreateDate: moment(
                    item.CreateDate,
                    "YYYY-MM-DD HH:mm"
                  ).format("YYYY-MM-DD HH:mm"),
                  StockID: item?.StockID,
                  TimeBegin: moment(item.TimeBegin).format(
                    "YYYY-MM-DD HH:mm:ss"
                  ),
                  OrderServiceClassID: item?.OrderServiceClassID,
                  TeacherID: iClass.TeacherID,
                  Member: {
                    ...iClass?.Member,
                    Lists: newLists,
                  },
                  MemberID: "",
                  Desc: "",
                };
                let newObj = {
                  ID: CrMember?.Os?.ID,
                  BookDate: null,
                  Status: "",
                  UserID: "",
                  Desc: "",
                };

                let rs = await userService.addEditSheduleOs(
                  { arr: [newValues] },
                  member?.token
                );

                if (rs?.data?.Updated && rs?.data?.Updated.length > 0) {
                  let { Updated } = rs?.data;
                  let index = Updated[0].Member?.Lists?.findIndex(
                    (x) => x?.Member?.ID === Number(member.ID)
                  );
                  if (index === -1) {
                    await userService.addEditSheduleUpdateOs(
                      { arr: [newObj] },
                      member?.token
                    );

                    await BookDataService.bookContact({
                      contact: {
                        StockID: item.Stock?.ID,
                        Fullname: member.FullName,
                        Phone1: member.MobilePhone,
                        Address: "",
                        Email: "",
                        Content: `${member.FullName} / ${
                          member.MobilePhone
                        }  huỷ lịch theo lớp ${item.Class.Title} tại cơ sở ${
                          item.Stock.Title
                        } ngày ${moment(item.TimeBegin).format(
                          "DD-MM-YYYY"
                        )} lúc ${moment(item.TimeBegin).format(
                          "HH:mm"
                        )} - Dịch vụ thẻ ${CrMember?.Os?.Title}`,
                      },
                    });

                    if (newLists?.length === 0) {
                      await userService.deleteSheduleClass(
                        { delete: [item?.ID] },
                        member?.token
                      );
                    }

                    this.getSheduleList(
                      { ...this.state.filters, Pi: 1 },
                      () => {
                        f7.dialog.close();

                        if (newLists?.length === 0) {
                          window.noti27?.LOP_HOC &&
                            window.noti27?.LOP_HOC({
                              type: "Đặt lịch xóa lớp",
                              Class: {
                                ...item?.Class,
                                TimeBegin: item.TimeBegin,
                              },
                              Stock: item.Stock,
                              Members: item?.Member?.Lists
                                ? item?.Member?.Lists.map((x) => x.Member)
                                : [],
                              RefUserIds: item.TeacherID ? [item.Teacher] : [],
                            });
                        }

                        toast.success("Huỷ lịch thành công.");
                      }
                    );
                  } else {
                    this.getSheduleList(
                      { ...this.state.filters, Pi: 1 },
                      () => {
                        f7.dialog.close();
                        toast.success("Xảy ra lỗi. Vui lòng thử lại");
                      }
                    );
                  }
                } else {
                  this.getSheduleList({ ...this.state.filters, Pi: 1 }, () => {
                    f7.dialog.close();
                    toast.success("Xảy ra lỗi. Vui lòng thử lại");
                  });
                }
              } else {
                this.getSheduleList({ ...this.state.filters, Pi: 1 }, () => {
                  f7.dialog.close();
                  toast.success("Lịch đã bị huỷ hoặc lớp đã bị xoá.");
                });
              }
            },
          },
        ],
      })
      .open();
  };

  render() {
    const { Items, isLoading, showPreloader } = this.state;
    return (
      <Page
        className="bg-white"
        name="schedule-os-list"
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
              <Link back>
                <i className="las la-angle-left"></i>
              </Link>
            </div>
            <div className="page-navbar__title">
              <span className="title">Quản lý lịch học</span>
            </div>
            <div className="page-navbar__noti">
              <Link
                noLinkClass
                onClick={() => {
                  f7.dialog.preloader("Đang tải ...")
                  this.getSheduleList(
                    { ...this.state.filters, Pi: 1 },
                    () => {
                      f7.dialog.close()
                    }
                  );
                }}
              >
                <IoReload />
              </Link>
            </div>
          </div>
        </Navbar>
        <div className="p-15px">
          {isLoading && "Đang tải"}
          {!isLoading && (
            <>
              {Items &&
                Items.map((item, index) => (
                  <div
                    className="bg-white shadow border rounded mb-15px last-mb-0"
                    key={index}
                  >
                    <div
                      className="px-15px py-12px border-bottom"
                      style={{
                        background: "#f3f3f3",
                      }}
                    >
                      <div className="fw-500 text-primary">
                        {item?.Class?.Title}
                      </div>
                    </div>
                    <div>
                      <div
                        className="d-flex justify-content-between px-15px py-12px"
                        style={{
                          borderBottom: "1px dashed #f0f0f0",
                        }}
                      >
                        <div className="text-muted">Ngày</div>
                        <div className="fw-500">
                          {moment(item?.TimeBegin).format("DD-MM-YYYY")}
                        </div>
                      </div>
                      <div
                        className="d-flex justify-content-between px-15px py-12px"
                        style={{
                          borderBottom: "1px dashed #f0f0f0",
                        }}
                      >
                        <div className="text-muted">Thời gian</div>
                        <div className="fw-500">
                          {moment(item.TimeBegin).format("HH:mm")}
                          <span className="px-4px">-</span>
                          {moment(item.TimeBegin)
                            .add(item?.Class?.Minutes, "minute")
                            .format("HH:mm")}
                        </div>
                      </div>
                      <div
                        className="d-flex justify-content-between px-15px py-12px"
                        style={{
                          borderBottom: "1px dashed #f0f0f0",
                        }}
                      >
                        <div className="text-muted">Học viên</div>
                        <div className="fw-500">
                          {item?.Member?.Lists?.length || 0}
                          <span className="px-2px">/</span>
                          {item?.Class?.MemberTotal}
                        </div>
                      </div>
                      <div
                        className="d-flex justify-content-between px-15px py-12px"
                        style={{
                          borderBottom: "1px dashed #f0f0f0",
                        }}
                      >
                        <div className="text-muted">HLV</div>
                        <div className="fw-500">
                          {item?.Member?.UserRequest && !item?.Teacher ? (
                            "Chờ xác nhận"
                          ) : (
                            <>{item?.Teacher?.FullName || "Chưa có"}</>
                          )}
                        </div>
                      </div>
                      <div
                        className="d-flex justify-content-between px-15px py-12px fw-500"
                        style={{
                          borderBottom: "1px dashed #f0f0f0",
                        }}
                      >
                        Cơ sở {item?.Stock?.Title}
                      </div>
                    </div>
                    {moment(item.TimeBegin).diff(moment(), "minutes") >
                      (window?.GlobalConfig?.Admin?.pt_huy_lich_phut || 0) && (
                      <div
                        className="px-15px py-12px d-flex"
                        style={{
                          gap: "12px",
                        }}
                      >
                        <button
                          className="bg-primary text-white border-0 rounded fw-500"
                          type="button"
                          style={{
                            height: "35px",
                          }}
                          onClick={() => this.onEditBook(item)}
                        >
                          Thay đổi lịch
                        </button>
                        <button
                          onClick={() => this.onCancelBook(item)}
                          className="bg-danger text-white border-0 rounded fw-500"
                          type="button"
                          style={{
                            height: "35px",
                          }}
                        >
                          Huỷ lịch
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              {(!Items || Items.length === 0) && (
                <div
                  className="d-flex"
                  style={{
                    flexDirection: "column",
                    alignItems: "center",
                    paddingTop: "20px",
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    xmlnsXlink="http://www.w3.org/1999/xlink"
                    version="1.1"
                    x="0px"
                    y="0px"
                    viewBox="0 0 500 500"
                    xmlSpace="preserve"
                    style={{
                      width: "300px",
                      enableBackground: "new 0 0 500 500",
                    }}
                  >
                    <g id="Background_Complete">
                      <g>
                        <rect
                          y="382.398"
                          style={{ fill: "#EBEBEB" }}
                          width={500}
                          height="0.25"
                        />
                        <g>
                          <rect
                            x="174.438"
                            y="391.922"
                            style={{ fill: "#EBEBEB" }}
                            width="25.997"
                            height="0.25"
                          />
                          <rect
                            x="52.459"
                            y="389.208"
                            style={{ fill: "#EBEBEB" }}
                            width="54.101"
                            height="0.25"
                          />
                          <rect
                            x="147.119"
                            y="401.208"
                            style={{ fill: "#EBEBEB" }}
                            width="26.317"
                            height="0.25"
                          />
                          <rect
                            x="258.227"
                            y="399.528"
                            style={{ fill: "#EBEBEB" }}
                            width="38.832"
                            height="0.25"
                          />
                          <rect
                            x="305.962"
                            y="399.528"
                            style={{ fill: "#EBEBEB" }}
                            width="10.694"
                            height="0.25"
                          />
                          <rect
                            x="395.346"
                            y="395.306"
                            style={{ fill: "#EBEBEB" }}
                            width="54.556"
                            height="0.25"
                          />
                        </g>
                      </g>
                      <g>
                        <path
                          style={{ fill: "#F5F5F5" }}
                          d="M212.155,382.398c0,0-15.862-18.938-17.716-38.875c-2.686-28.887,26.225,6.056,34.823-1.372    c8.598-7.428-18.613-41.84,3.428-48.521c22.041-6.681,27.375,18.587,36.094,37.072c14.288,30.288,15.165-46.625,39.17-9.689    c15.647,24.077,7.22,61.386,7.22,61.386H212.155z"
                        />
                        <path
                          style={{ fill: "#F5F5F5" }}
                          d="M313.273,382.398c0,0-16.815-17.115-12.092-35.193c6.843-26.193,18.036,5.5,26.844-1.232    c8.807-6.732-1.259-37.944,17.518-43.994c18.777-6.05,15.056,16.863,15.989,33.626c1.529,27.468,25.841-42.27,32.699-8.771    c4.47,21.836-15.016,55.563-15.016,55.563H313.273z"
                        />
                        <path
                          style={{ fill: "#E0E0E0" }}
                          d="M353.761,382.398c0.768-1.913,3.15-15.57,25.1-26.418c-9.43,12.589-11.975,22.051-11.513,26.418    H353.761z"
                        />
                        <g>
                          <path
                            style={{ fill: "#F5F5F5" }}
                            d="M105.703,382.398c-0.065-2.88-2.373-27.417-24.525-39.785c6.725,18.959,5.241,33.208,2.2,39.785     H105.703z"
                          />
                          <path
                            style={{ fill: "#F5F5F5" }}
                            d="M93.397,382.398c-0.543-1.89-1.098-15.387-23.027-26.108c8.262,12.441,9.605,21.792,8.471,26.108     H93.397z"
                          />
                        </g>
                        <g>
                          <path
                            style={{ fill: "#F5F5F5" }}
                            d="M169.578,382.398c0.032-1.76,1.161-16.751,11.995-24.308c-3.289,11.584-2.563,20.29-1.076,24.308     H169.578z"
                          />
                          <path
                            style={{ fill: "#F5F5F5" }}
                            d="M175.596,382.398c0.266-1.155,0.537-9.401,11.262-15.952c-4.041,7.602-4.698,13.315-4.143,15.952     H175.596z"
                          />
                        </g>
                        <path
                          style={{ fill: "#E0E0E0" }}
                          d="M240.43,382.398c-0.605-2.284-1.223-18.592-25.666-31.545c9.209,15.033,10.706,26.33,9.442,31.545    H240.43z"
                        />
                        <path
                          style={{ fill: "#E0E0E0" }}
                          d="M248.148,382.398c0.178-1.726,4.251-14.055-10.622-23.847c2.777,11.364,0.764,19.905-1.643,23.847    H248.148z"
                        />
                        <g>
                          <path
                            style={{ fill: "#FFFFFF" }}
                            d="M361.615,382.398c-0.18-1.398,0.804-11.378-13.072-19.306c4.38,9.2,4.352,16.114,3.143,19.306     H361.615z"
                          />
                        </g>
                        <path
                          style={{ fill: "#F5F5F5" }}
                          d="M381.94,150.511c18.153-5.503-7.622-17.972-36.053-19.22    c-67.14-2.946-83.558-18.021-131.134-23.242c-14.827-1.627-4.608,20.439,29.708,30.16c43.459,12.311,118.767,5.129,100.352,12.86    c-18.415,7.73,1.119,30.801,39.856,23.772c29.96-5.437,72.242,18.929,57.076-2.166c-9.59-13.34-32.119-8.476-42.526-9.437    C388.813,162.277,355.094,158.65,381.94,150.511z"
                        />
                        <path
                          style={{ fill: "#FAFAFA" }}
                          d="M362.618,195.615c-6.36,2.503-22.32-2.935-32.461-2.751c-10.141,0.184-25.864,3.99-34.068-4.178    c-8.204-8.168,34.262-3.441,43.002-2.658C355.3,187.478,371.935,191.949,362.618,195.615z"
                        />
                        <path
                          style={{ fill: "#F5F5F5" }}
                          d="M396.677,79.089c3.483-3.432,13.075,2.928,18.905,2.319c5.83-0.608,14.613-6.051,19.935,4.082    c5.322,10.134-19.493,5.658-24.586,4.981C401.486,89.215,391.575,84.116,396.677,79.089z"
                        />
                        <path
                          style={{ fill: "#F5F5F5" }}
                          d="M68.939,148.392c3.483-3.432,13.075,2.928,18.905,2.32c5.83-0.609,14.613-6.051,19.935,4.083    c5.322,10.133-19.493,5.658-24.586,4.981C73.748,158.518,63.837,153.419,68.939,148.392z"
                        />
                        <path
                          style={{ fill: "#FAFAFA" }}
                          d="M98.93,77.173c9.098,7.054,34.667,1.403,50.062,5.065c15.396,3.661,38.443,16.355,52.843,2.745    c14.399-13.61-51.357-17.989-64.847-19.27C111.973,63.337,85.604,66.84,98.93,77.173z"
                        />
                        <g>
                          <g>
                            <path
                              style={{ fill: "#EBEBEB" }}
                              d="M196.503,260.889c12.944-18.363-7.904-146.667-35.948-155      c-28.044-8.333-29.698,135.878-19.539,153C152.488,278.223,182.406,280.889,196.503,260.889z"
                            />
                            <path
                              style={{ fill: "#E0E0E0" }}
                              d="M170.423,224L170.423,224c2.298,0,4.227,1.753,4.432,4.043      c4.605,51.352,4.481,103.021-0.372,154.356c-2.972,0-5.945,0-8.917,0c4.827-51.07,4.975-102.471,0.443-153.562      C165.779,226.238,167.814,224,170.423,224z"
                            />
                          </g>
                          <g>
                            <path
                              style={{ fill: "#EBEBEB" }}
                              d="M402.082,314.525c-7.23-10.258,4.415-81.926,20.08-86.581      c15.665-4.655,16.589,75.9,10.914,85.464C426.669,324.207,409.957,325.696,402.082,314.525z"
                            />
                            <path
                              style={{ fill: "#FFFFFF" }}
                              d="M426.266,286.974c-0.228-0.083-0.446-0.21-0.641-0.379c-0.855-0.743-0.945-2.038-0.202-2.893      l3.76-4.325c0.743-0.854,2.035-0.947,2.893-0.202c0.854,0.743,0.945,2.038,0.202,2.893l-3.76,4.325      C427.944,287.052,427.041,287.257,426.266,286.974z"
                            />
                            <path
                              style={{ fill: "#FFFFFF" }}
                              d="M412.232,266.048c-0.818-0.053-1.558-0.597-1.821-1.424l-1.967-6.174      c-0.344-1.079,0.252-2.233,1.331-2.576c1.076-0.344,2.232,0.252,2.576,1.331l1.967,6.174c0.344,1.079-0.252,2.233-1.331,2.576      C412.736,266.035,412.48,266.064,412.232,266.048z"
                            />
                            <path
                              style={{ fill: "#E0E0E0" }}
                              d="M416.65,293.919L416.65,293.919c-1.284,0-2.361,0.979-2.476,2.258      c-2.572,28.685-2.503,57.546,0.208,86.221c1.66,0,3.321,0,4.981,0c-2.696-28.527-2.779-57.239-0.247-85.778      C419.245,295.169,418.108,293.919,416.65,293.919z"
                            />
                          </g>
                          <path
                            style={{ fill: "#FFFFFF" }}
                            d="M159.914,217.583c-0.443,0-0.894-0.085-1.329-0.264l-17.284-7.102     c-1.788-0.735-2.642-2.78-1.907-4.568c0.734-1.788,2.78-2.642,4.567-1.907l17.284,7.102c1.788,0.735,2.642,2.78,1.907,4.568     C162.597,216.765,161.291,217.583,159.914,217.583z"
                          />
                          <path
                            style={{ fill: "#FFFFFF" }}
                            d="M182.862,200.46c-0.415,0-0.838-0.075-1.249-0.232c-1.806-0.691-2.71-2.714-2.019-4.52     l3.495-9.137c0.691-1.804,2.707-2.71,4.52-2.018c1.805,0.691,2.709,2.714,2.018,4.52l-3.495,9.137     C185.599,199.604,184.271,200.46,182.862,200.46z"
                          />
                          <path
                            style={{ fill: "#FFFFFF" }}
                            d="M156.886,177.234c-1.398,0-2.719-0.844-3.26-2.225l-4.033-10.298     c-0.705-1.8,0.183-3.83,1.982-4.535c1.795-0.705,3.829,0.182,4.535,1.983l4.033,10.298c0.705,1.8-0.183,3.83-1.982,4.535     C157.742,177.156,157.311,177.234,156.886,177.234z"
                          />
                        </g>
                      </g>
                    </g>
                    <g id="Background_Simple" style={{ display: "none" }}>
                      <g style={{ display: "inline" }}>
                        <path
                          style={{ fill: "#407BFF" }}
                          d="M207.297,134.22c41.976,7.806,109.814-14.28,128.098,34.409    c15.333,40.831-15.768,71.509,19.55,106.515c25.737,25.51,67.078,69.476,17.051,96.298c-39.127,20.977-94.11,17.905-134.583,3.118    c-31.788-11.614-96.082-46.241-97.921-84.922c-2.066-43.469,63.672-65.762,2.404-94.334c-36.873-17.196-79.137-50.7-43.381-94.981    c14.113-17.478,28.815-10.975,43.697,0.035C164.176,116.608,178.422,128.85,207.297,134.22z"
                        />
                        <path
                          style={{ opacity: "0.9", fill: "#FFFFFF" }}
                          d="M207.297,134.22c41.976,7.806,109.814-14.28,128.098,34.409    c15.333,40.831-15.768,71.509,19.55,106.515c25.737,25.51,67.078,69.476,17.051,96.298c-39.127,20.977-94.11,17.905-134.583,3.118    c-31.788-11.614-96.082-46.241-97.921-84.922c-2.066-43.469,63.672-65.762,2.404-94.334c-36.873-17.196-79.137-50.7-43.381-94.981    c14.113-17.478,28.815-10.975,43.697,0.035C164.176,116.608,178.422,128.85,207.297,134.22z"
                        />
                      </g>
                    </g>
                    <g id="Shadow_1_">
                      <ellipse
                        id="_x3C_Path_x3E__71_"
                        style={{ fill: "#F5F5F5" }}
                        cx={250}
                        cy="416.238"
                        rx="193.889"
                        ry="11.323"
                      />
                    </g>
                    <g id="Plant">
                      <g>
                        <path
                          style={{ fill: "#263238" }}
                          d="M163.116,416.778c-0.102,0-0.206-0.029-0.298-0.091c-10.178-6.786-6.422-14.507-2.072-23.447    c5.648-11.609,12.679-26.058-6.021-45.707c-15.895-16.701-23.614-32.704-21.737-45.061c1.01-6.652,4.774-11.97,10.885-15.378    c0.262-0.145,0.589-0.052,0.733,0.208c0.146,0.26,0.053,0.589-0.208,0.734c-5.809,3.239-9.386,8.287-10.344,14.597    c-1.825,12.02,5.793,27.702,21.452,44.156c19.217,20.191,12.005,35.013,6.211,46.923c-4.299,8.835-7.694,15.813,1.699,22.077    c0.248,0.165,0.315,0.5,0.15,0.748C163.462,416.693,163.291,416.778,163.116,416.778z"
                        />
                        <path
                          style={{ fill: "#263238" }}
                          d="M140.497,290.064c6.675-7.401,4.138-18.379,1.816-24.204    C137.084,268.005,132.826,281.808,140.497,290.064z"
                        />
                        <path
                          style={{ fill: "#263238" }}
                          d="M140.494,328.395c-8.657-16.418-24.746-18.455-33.81-19.218    C112.048,319.993,126.175,333.446,140.494,328.395z"
                        />
                        <path
                          style={{ fill: "#263238" }}
                          d="M158.134,399.527c11.485-18.862-8.362-32.483-18.801-46.251    C135.311,367.177,138.276,391.085,158.134,399.527z"
                        />
                        <path
                          style={{ fill: "#263238" }}
                          d="M156.331,348.473c-13.937-16.323-10.751-28.148-6.967-35.794    C156.864,322.351,168.188,339.501,156.331,348.473z"
                        />
                        <path
                          style={{ fill: "#263238" }}
                          d="M136.373,294.483c4.058-4.822,11.09-4.11,14.9-3.116    C150.364,294.847,142.13,298.661,136.373,294.483z"
                        />
                        <path
                          style={{ fill: "#263238" }}
                          d="M166.415,381.025c1.529-12.455,6.946-11.48,11.191-17.059    C179.888,372.22,174.467,379.782,166.415,381.025z"
                        />
                      </g>
                    </g>
                    <g id="Character_1_">
                      <g>
                        <path
                          style={{ fill: "#263238" }}
                          d="M330.07,148.427c-6.743,1.556-16.314,5.347-24.8,8.737c0.142-0.634,0.186-1.291,0.219-1.936    c-0.437,0.787-0.875,1.574-1.312,2.373c-0.109,0.044-0.219,0.077-0.317,0.131c0.033-0.864-0.022-1.717-0.175-2.559    c-0.229,1.126-0.722,2.198-1.432,3.105c-0.033,0.044-0.077,0.098-0.109,0.142c-0.58,0.229-1.148,0.459-1.706,0.689    c0.153-1.728,0.219-3.455-0.033-5.15c-0.153,1.63-0.416,3.237-0.788,4.833c-0.055,0.241-0.109,0.482-0.175,0.722    c-0.765,0.317-1.498,0.612-2.209,0.918c-0.153-0.612-0.317-1.224-0.47-1.837c-0.262,0.787-0.525,1.574-0.787,2.351    c-0.317,0.131-0.623,0.262-0.919,0.383c-0.131-0.918-0.339-1.826-0.623-2.712c-0.12,1.072-0.252,2.165-0.547,3.204    c-0.252,0.109-0.503,0.208-0.744,0.317c-0.033-1.64-0.24-3.269-0.579-4.877c-0.153,1.247-0.306,2.482-0.448,3.718    c-0.066,0.558-0.131,1.115-0.208,1.673c-3.291,1.399-5.347,2.307-5.347,2.307s-0.24-11.897,0-29.939    c0.251-18.032,3.827-32.804,11.186-40.043c7.403-7.282,23.083-8.376,30.497-1.936c7.403,6.441,9.498,21.42,6.681,36.085    C333.302,137.575,348.954,144.068,330.07,148.427z"
                        />
                        <path
                          style={{ fill: "#B55B52" }}
                          d="M264.194,230.184l0.701-2.136c0.557-1.696,1.84-3.056,3.501-3.71l9.256-3.644l4.627,2.259    c-1.242,5.047-6.934,10.15-6.934,10.15l-1.45,1.588c-1.292,1.414-3.452,1.825-4.964,0.942l-3.48-2.032    C264.249,232.9,263.748,231.54,264.194,230.184z"
                        />
                        <path
                          style={{ fill: "#B55B52" }}
                          d="M316.418,171.554c-0.176,1.683-0.363,3.165-0.601,4.721c-0.22,1.54-0.498,3.064-0.768,4.59    c-0.574,3.046-1.217,6.08-1.986,9.094c-0.738,3.019-1.62,6.02-2.591,9.004c-0.95,2.99-2.099,5.95-3.328,8.891l-0.171,0.408    c-0.239,0.572-0.588,1.086-0.993,1.508c-2.263,2.336-4.489,3.999-6.742,5.674c-2.242,1.656-4.535,3.134-6.829,4.572    c-2.309,1.419-4.633,2.776-6.999,4.054c-2.375,1.276-4.735,2.501-7.23,3.625c-1.733,0.78-3.771,0.009-4.551-1.724    c-0.63-1.399-0.249-2.997,0.834-3.972l0.046-0.039c1.927-1.731,3.934-3.445,5.894-5.152c1.971-1.705,3.934-3.401,5.857-5.11    c1.944-1.683,3.823-3.417,5.633-5.12c1.783-1.693,3.558-3.478,4.817-5.061l-1.164,1.916c0.848-2.672,1.627-5.382,2.332-8.145    c0.682-2.768,1.337-5.554,1.912-8.375c0.565-2.821,1.123-5.652,1.609-8.497l0.713-4.265l0.648-4.169l0.031-0.196    c0.583-3.75,4.095-6.319,7.846-5.736C314.268,164.612,316.789,167.94,316.418,171.554z"
                        />
                        <path
                          style={{ fill: "#263238" }}
                          d="M316.714,152.29c-18.738,2.296-21.938,37.956-20.238,45.167c2.642,6.171,14.131,2.969,14.131,2.969    S328.816,173.383,316.714,152.29z"
                        />
                        <path
                          style={{ fill: "#FFFFFF" }}
                          d="M312.501,199.388c-0.664,1.569-1.421,2.557-1.678,2.868c-0.059,0.072-0.127,0.123-0.213,0.159    c-1.019,0.424-8.201,3.173-14.233-0.914c-0.1-0.068-0.183-0.164-0.231-0.276c-0.702-1.629-0.777-3.716-0.757-4.845    c0.007-0.401,0.402-0.672,0.779-0.538c2.279,0.813,9.407,3.125,15.749,2.724C312.36,198.538,312.674,198.98,312.501,199.388z"
                        />
                        <path
                          style={{ fill: "#263238" }}
                          d="M389.796,416.227c9.135,0,8.465-0.141,13.585-0.313c4.383-0.157,5.476,0.392,9.002,0.313    c2.946-0.063,2.624-2.888,1.468-6.137c-0.578-1.632-1.435-3.626-2.261-6.262h-13.875c-1.613,3.594-5.161,6.294-10.257,6.985    C382.594,411.472,386.154,416.227,389.796,416.227z"
                        />
                        <path
                          style={{ fill: "#263238" }}
                          d="M314.354,416.227c11.611,0,12.719-5.015,17.037-7.647c3.697-2.264,5.171-1.635,8.991-3.788    c2.53-1.426,1.406-4.548-0.625-6.219c-1.581-1.301-3.48-3.111-4.931-5.181l-11.315,5.023c-0.617,4.567-2.756,12.239-9.584,12.725    C309.045,411.502,310.76,416.227,314.354,416.227z"
                        />
                        <path
                          style={{ fill: "#407BFF" }}
                          d="M316.639,223.165c0,0-22.032,55.999-24.915,83.767c-0.085,22.982,31.787,91.485,31.787,91.485    c0.987,1.714,10.143-3.209,11.315-5.023c-11.74-28.663-5.569-64.521-16.159-85.559c22.705-32.286,40.312-92.036,40.312-92.036    L316.639,223.165z"
                        />
                        <path
                          style={{ opacity: "0.2", fill: "#FFFFFF" }}
                          d="M312.866,237.096c-0.114,0-0.218-0.079-0.244-0.195    c-0.03-0.135,0.054-0.269,0.188-0.299c4.684-1.064,6.827-4.419,6.849-4.452c0.075-0.118,0.23-0.152,0.345-0.079    c0.117,0.073,0.152,0.227,0.079,0.344c-0.091,0.145-2.277,3.565-7.161,4.675C312.903,237.094,312.885,237.096,312.866,237.096z"
                        />
                        <path
                          style={{ opacity: "0.2" }}
                          d="M337.26,248.998c-4.902,9.926-5.672,24.726-5.276,36.059c6.375-12.663,11.962-26.276,16.369-38.053    c-0.018-0.017-0.037-0.034-0.055-0.051C344.885,243.794,339.318,244.829,337.26,248.998z"
                        />
                        <path
                          style={{ fill: "#407BFF" }}
                          d="M329.335,220.956c0,0,5.841,52.316,17.458,88.017c5.793,17.802,38.896,58.227,50.921,94.855    c2.234,1.243,9.76,1.318,13.875,0c0,0-18.471-80.51-38.357-97.451c-0.063-43.508,1.495-64.502-8.014-91.663L329.335,220.956z"
                        />
                        <path
                          style={{ opacity: "0.2", fill: "#FFFFFF" }}
                          d="M406.5,399.023c-0.12,0-0.226-0.086-0.246-0.208    c-8.229-48.609-37.662-90.963-37.959-91.386c-0.033-0.048-0.049-0.107-0.044-0.165c0.005-0.058,0.506-6.043,1.024-28.104    c0.489-20.799-1.434-43.373-1.674-46.094c-1.563,0.262-9.435,1.329-15.389-2.576c-0.116-0.076-0.148-0.231-0.072-0.346    c0.076-0.116,0.232-0.148,0.346-0.072c6.433,4.218,15.201,2.473,15.289,2.455c0.069-0.014,0.143,0.002,0.199,0.044    c0.058,0.042,0.094,0.107,0.101,0.178c0.022,0.241,2.22,24.33,1.7,46.423c-0.485,20.638-0.955,27.222-1.02,28.044    c1.407,2.035,29.907,43.762,37.99,91.515c0.023,0.136-0.068,0.265-0.204,0.288C406.527,399.022,406.514,399.023,406.5,399.023z"
                        />
                        <g>
                          <path
                            style={{ fill: "#407BFF" }}
                            d="M395.08,398.626c0.323,1.259,0.841,3.455,0.996,5.13c0.056,0.604,0.625,1.164,1.261,1.262     c5.313,0.813,12.323-0.365,14.535-0.784c0.424-0.08,0.661-0.435,0.602-0.883l-0.626-4.799c-0.086-0.656-0.77-1.246-1.431-1.234     l-14.587,0.283C395.265,397.611,394.935,398.057,395.08,398.626z"
                          />
                          <path
                            style={{ opacity: "0.2" }}
                            d="M395.08,398.626c0.323,1.259,0.841,3.455,0.996,5.13c0.056,0.604,0.625,1.164,1.261,1.262     c5.313,0.813,12.323-0.365,14.535-0.784c0.424-0.08,0.661-0.435,0.602-0.883l-0.626-4.799c-0.086-0.656-0.77-1.246-1.431-1.234     l-14.587,0.283C395.265,397.611,394.935,398.057,395.08,398.626z"
                          />
                        </g>
                        <g>
                          <path
                            style={{ fill: "#407BFF" }}
                            d="M320.246,393.928c0.452,1.263,1.246,3.518,1.772,5.212c0.174,0.56,0.757,0.863,1.321,0.701     c4.223-1.215,10.409-4.56,12.429-5.684c0.4-0.223,0.609-0.675,0.526-1.125l-0.899-4.848c-0.123-0.661-0.819-1.046-1.444-0.798     l-13.091,5.198C320.325,392.797,320.052,393.387,320.246,393.928z"
                          />
                          <path
                            style={{ opacity: "0.2" }}
                            d="M320.246,393.928c0.452,1.263,1.246,3.518,1.772,5.212c0.174,0.56,0.757,0.863,1.321,0.701     c4.223-1.215,10.409-4.56,12.429-5.684c0.4-0.223,0.609-0.675,0.526-1.125l-0.899-4.848c-0.123-0.661-0.819-1.046-1.444-0.798     l-13.091,5.198C320.325,392.797,320.052,393.387,320.246,393.928z"
                          />
                        </g>
                        <path
                          style={{ fill: "#FFFFFF" }}
                          d="M316.376,221.078c0.13,0.651-0.547,3.437-1.562,5.91c1.798,1.219,7.964,2.571,15.828,2.91    c0.734-1.209,1.201-4.395,1.774-5.696c0.313,1.875,2.317,4.999,3.506,5.762c4.184-0.074,8.643-0.456,13.054-1.284    c15.258-2.864,18.851-7.603,18.851-7.603s-2.916-8.801-3.749-12.029C356.213,209.674,316.793,210.82,316.376,221.078z"
                        />
                        <path
                          style={{ fill: "#263238" }}
                          d="M302.121,176.784c1.46,4.626,3.298,10.483,7.752,21.185c5.942,15.298,4.543,18.667,6.086,24.949    c3.448,1.438,9.321,2.685,13.375,2.576c0.66-1.479,1.463-2.875,2.716-4.468c1.211,0.815,4.947,3.142,7.099,3.281    c9.721-1.493,22.258-5.265,26.662-9.929c-3.357-13.515-4.566-28.26-6.527-60.684c-0.454-7.518-7.073-12.575-14.218-10.862    c-1.909,0.458-3.92,0.986-5.961,1.591c-7.936,2.352-14.422,4.34-21.135,7.393c-2.225,1.012-4.504,2.133-6.67,3.246    C303.487,159.074,299.506,168.495,302.121,176.784z"
                        />
                        <path
                          style={{ fill: "#B55B52" }}
                          d="M385.275,230.134l-1.506-1.669c-1.196-1.325-1.739-3.114-1.482-4.88l1.431-9.844l4.258-2.895    c3.765,3.584,5.369,11.058,5.369,11.058l0.659,2.047c0.586,1.823-0.13,3.903-1.646,4.777l-3.492,2.013    C387.66,231.435,386.231,231.194,385.275,230.134z"
                        />
                        <path
                          style={{ fill: "#B55B52" }}
                          d="M364.313,152.321c1.289,1.198,2.37,2.262,3.494,3.422c1.116,1.134,2.181,2.308,3.25,3.478    c2.112,2.36,4.158,4.781,6.101,7.294c1.966,2.492,3.826,5.084,5.596,7.75c1.802,2.64,3.423,5.439,4.994,8.265l0.2,0.36    c0.147,0.264,0.266,0.558,0.348,0.836c0.905,3.124,1.243,5.881,1.579,8.669c0.325,2.768,0.469,5.493,0.579,8.197    c0.085,2.709,0.11,5.4,0.045,8.088c-0.071,2.695-0.179,5.353-0.442,8.076c-0.182,1.892-1.864,3.277-3.756,3.095    c-1.527-0.148-2.725-1.272-3.033-2.695l-0.012-0.059c-0.546-2.533-1.038-5.125-1.547-7.674c-0.502-2.557-1-5.104-1.529-7.622    c-0.497-2.522-1.069-5.015-1.648-7.431c-0.585-2.389-1.253-4.815-2.003-6.694l0.548,1.195c-1.601-2.367-3.25-4.707-5.014-7.002    c-1.765-2.287-3.583-4.549-5.473-6.767c-1.897-2.209-3.813-4.413-5.796-6.555l-2.984-3.191c-0.986-1.032-2.042-2.136-2.946-3.048    l-0.113-0.115c-2.672-2.696-2.653-7.047,0.043-9.72C357.42,149.871,361.627,149.831,364.313,152.321z"
                        />
                        <path
                          style={{ fill: "#263238" }}
                          d="M344.216,143.039c17.674-6.634,37.011,23.498,38.84,30.678c0.513,6.693-11.154,9.171-11.154,9.171    S343.247,167.337,344.216,143.039z"
                        />
                        <path
                          style={{ fill: "#407BFF" }}
                          d="M321.533,166.733c-0.215,0-0.424-0.111-0.54-0.309c-0.175-0.298-0.074-0.681,0.224-0.855    c1.456-0.853,7.543-6.801,10.053-11.791c0.155-0.307,0.524-0.434,0.84-0.277c0.308,0.155,0.432,0.531,0.277,0.839    c-2.657,5.283-8.954,11.381-10.539,12.308C321.749,166.705,321.64,166.733,321.533,166.733z"
                        />
                        <path
                          style={{ fill: "#407BFF" }}
                          d="M319.379,166.421c-0.106,0-0.216-0.028-0.314-0.085c-1.876-1.098-5.201-5.549-4.77-11.334    c0.025-0.344,0.301-0.604,0.67-0.577c0.344,0.026,0.602,0.326,0.576,0.67c-0.416,5.585,2.948,9.456,4.154,10.162    c0.298,0.174,0.398,0.557,0.224,0.855C319.803,166.31,319.594,166.421,319.379,166.421z"
                        />
                        <path
                          style={{ fill: "#B55B52" }}
                          d="M327.672,121.547c1.166,7.372,4.266,20.29,10.272,23.282c0,0-6.78,1.286-17.497,14.526    c-5.946-4.294-3.638-7.133-3.638-7.133c7.085-4.51,5.502-9.282,2.317-13.989L327.672,121.547z"
                        />
                        <path
                          style={{ fill: "#FFFFFF" }}
                          d="M322.727,156.647c4.728-0.934,8.518,5.375,8.518,5.375s8.142-11.435,9.683-18.031    c-1.9-0.28-4.828-1.126-4.828-1.126S324.447,153.127,322.727,156.647z"
                        />
                        <path
                          style={{ fill: "#FFFFFF" }}
                          d="M318.193,157.42c0,0-3.525,2.41-3.019,8.376c-4.5-9.558-0.457-12.865-0.457-12.865    s1.06-1.502,3.866-2.013C315.67,154.052,318.193,157.42,318.193,157.42z"
                        />
                        <path
                          style={{ opacity: "0.2" }}
                          d="M324.19,128.354l-5.059,9.871c0.758,1.112,1.454,2.273,1.984,3.466    c2.65-1.673,5.35-6.573,4.552-9.737C325.269,130.376,324.683,128.951,324.19,128.354z"
                        />
                        <path
                          style={{ fill: "#FFFFFF" }}
                          d="M301.333,131.96h-2.319c-0.083,0-0.161-0.037-0.213-0.102c-0.052-0.064-0.072-0.149-0.055-0.23    l1.16-5.346c0.027-0.126,0.139-0.215,0.268-0.215l0,0c0.129,0,0.24,0.09,0.268,0.215l1.159,5.346    c0.018,0.081-0.003,0.165-0.055,0.23C301.494,131.922,301.416,131.96,301.333,131.96z M299.353,131.413h1.642l-0.82-3.783    L299.353,131.413z"
                        />
                        <path
                          style={{ fill: "#B55B52" }}
                          d="M327.376,105.836c2.76,11.51,4.167,16.311,0.389,24.116c-5.682,11.741-20.016,13.296-26.06,3.008    c-5.44-9.259-9.04-26.526,0.33-34.931C311.266,89.749,324.616,94.326,327.376,105.836z"
                        />
                        <path
                          style={{ fill: "#263238" }}
                          d="M295.122,110.778c10.592-2.065,17.019-12.332,22.008-12.028    c-0.761,7.776,5.34,16.569,11.352,16.777c8.128,0.281,0.596-19.693-4.86-22.852C317.851,89.334,293.248,89.091,295.122,110.778z"
                        />
                        <path
                          style={{ fill: "#263238" }}
                          d="M323.539,115.968c-0.844,0-1.682-0.29-2.491-0.869c-3.669-2.628-5.887-10.796-4.476-16.492    c0.073-0.292,0.359-0.472,0.662-0.399c0.293,0.073,0.472,0.369,0.398,0.662c-1.295,5.233,0.749,12.975,4.052,15.34    c1.173,0.84,2.374,0.876,3.574,0.107c0.254-0.164,0.592-0.089,0.755,0.165c0.163,0.254,0.09,0.592-0.165,0.755    C325.089,115.724,324.311,115.968,323.539,115.968z"
                        />
                        <path
                          style={{ fill: "#263238" }}
                          d="M311.351,115.137c0.273,0.956,0.013,1.905-0.581,2.121c-0.594,0.215-1.297-0.385-1.571-1.341    c-0.273-0.956-0.013-1.905,0.581-2.121C310.375,113.581,311.078,114.181,311.351,115.137z"
                        />
                        <path
                          style={{ fill: "#263238" }}
                          d="M300.221,119.354c0.273,0.956,0.013,1.905-0.581,2.121c-0.594,0.215-1.297-0.385-1.571-1.341    c-0.273-0.956-0.013-1.905,0.581-2.121C299.245,117.798,299.948,118.398,300.221,119.354z"
                        />
                        <path
                          style={{ fill: "#263238" }}
                          d="M298.928,117.971l-2.372,0.129C296.556,118.1,298.189,119.488,298.928,117.971z"
                        />
                        <path
                          style={{ fill: "#A02724" }}
                          d="M303.786,119.794c0,0-0.365,4.674-1.495,7.275c1.537,0.743,3.423-0.534,3.423-0.534    L303.786,119.794z"
                        />
                        <path
                          style={{ fill: "#263238" }}
                          d="M311.59,127.968c-0.483,0.18-1.009,0.327-1.58,0.431c-0.154,0.028-0.293-0.079-0.311-0.24    c-0.017-0.159,0.089-0.31,0.248-0.341c4.172-0.75,5.791-4.135,5.807-4.169c0.069-0.15,0.238-0.219,0.377-0.155    c0.139,0.064,0.196,0.237,0.126,0.386C316.195,124.012,314.894,126.738,311.59,127.968z"
                        />
                        <path
                          style={{ fill: "#B55B52" }}
                          d="M333.077,116.765c-0.565,2.606-2.096,4.514-3.721,5.421c-2.445,1.365-4.351-1.352-4.244-4.578    c0.096-2.904,1.485-7.114,4.215-7.114C332.015,110.493,333.722,113.785,333.077,116.765z"
                        />
                        <path
                          style={{ fill: "#263238" }}
                          d="M305.392,110.971c0.079-0.129,0.207-0.223,0.363-0.249c2.441-0.407,3.225-2.386,3.234-2.409    c0.115-0.294,0.439-0.431,0.726-0.297c0.286,0.135,0.425,0.485,0.311,0.785c-0.041,0.104-1.022,2.588-4.052,3.093    c-0.302,0.05-0.596-0.172-0.657-0.495C305.288,111.243,305.318,111.092,305.392,110.971z"
                        />
                        <path
                          style={{ fill: "#263238" }}
                          d="M295.327,115.483c-0.132,0.057-0.281,0.064-0.418,0.008c-0.283-0.117-0.409-0.457-0.283-0.761    c1.273-3.045,3.832-3.651,3.941-3.675c0.307-0.068,0.594,0.133,0.642,0.452c0.048,0.318-0.161,0.631-0.467,0.701    c-0.1,0.022-2.079,0.522-3.091,2.944C295.586,115.307,295.466,115.423,295.327,115.483z"
                        />
                        <path
                          style={{ fill: "#263238" }}
                          d="M310.058,113.754l-2.372,0.129C307.686,113.883,309.319,115.27,310.058,113.754z"
                        />
                        <path
                          style={{ fill: "#407BFF" }}
                          d="M319.362,162.216c1.219-0.219,2.134-0.262,2.728-0.253c0.478,0.007,0.887,0.318,1.02,0.776    c0.294,1.009,0.831,2.82,1.147,3.695c0.451,1.25-3.09,3.819-3.09,3.819s-2.916-1.389-2.986-3.229    c-0.047-1.245,0.153-2.934,0.287-3.897C318.534,162.661,318.899,162.3,319.362,162.216z"
                        />
                        <path
                          style={{ fill: "#407BFF" }}
                          d="M326.68,198.825c-0.236-5.763-4.039-32.113-4.039-32.113l-2.81,0.347    c-0.208,3.749-2.205,26.28-2.205,32.251c0,5.971,5.101,12.637,5.101,12.637S326.915,204.588,326.68,198.825z"
                        />
                        <path
                          style={{ fill: "#FFFFFF" }}
                          d="M369.742,182.843c1.315,1.084,2.443,1.609,2.815,1.766c0.086,0.036,0.169,0.05,0.262,0.042    c1.099-0.095,8.739-0.981,12.194-7.396c0.057-0.107,0.086-0.23,0.077-0.351c-0.131-1.769-1.03-3.654-1.57-4.645    c-0.192-0.352-0.667-0.41-0.939-0.116c-1.645,1.775-6.894,7.123-12.702,9.702C369.475,182.024,369.4,182.561,369.742,182.843z"
                        />
                        <g>
                          <g>
                            <path
                              style={{ fill: "#407BFF" }}
                              d="M292.01,248.319l-4.913,10.01c-0.978,1.993-3.43,2.753-5.364,1.663l-63.29-35.673l5.575-11.359      l66.127,30.142C292.125,244.006,292.969,246.365,292.01,248.319z"
                            />
                            <path
                              style={{ opacity: "0.4" }}
                              d="M292.01,248.319l-4.913,10.01c-0.978,1.993-3.43,2.753-5.364,1.663l-63.29-35.673l5.575-11.359      l66.127,30.142C292.125,244.006,292.969,246.365,292.01,248.319z"
                            />
                          </g>
                          <g>
                            <path
                              style={{ fill: "#407BFF" }}
                              d="M224.047,172.36c-0.073-0.195-0.144-0.391-0.22-0.585c-0.271-0.695-0.555-1.386-0.857-2.071      c-0.041-0.093-0.086-0.184-0.128-0.277c-0.266-0.595-0.545-1.186-0.834-1.773c-0.103-0.209-0.209-0.416-0.314-0.623      c-0.254-0.499-0.516-0.994-0.786-1.487c-0.103-0.188-0.204-0.378-0.31-0.565c-0.371-0.658-0.755-1.312-1.155-1.957      c-0.047-0.075-0.097-0.149-0.144-0.224c-0.359-0.572-0.73-1.138-1.113-1.698c-0.132-0.194-0.267-0.386-0.402-0.578      c-0.326-0.466-0.659-0.926-1.001-1.383c-0.132-0.176-0.261-0.354-0.395-0.529c-0.467-0.611-0.945-1.215-1.441-1.809      c-0.048-0.057-0.099-0.113-0.147-0.17c-0.452-0.537-0.917-1.066-1.391-1.589c-0.16-0.176-0.322-0.348-0.483-0.522      c-0.394-0.423-0.795-0.841-1.204-1.253c-0.16-0.162-0.318-0.324-0.481-0.484c-0.559-0.551-1.128-1.095-1.714-1.626      c-0.04-0.036-0.081-0.07-0.121-0.106c-0.549-0.495-1.111-0.979-1.683-1.455c-0.184-0.154-0.372-0.305-0.559-0.457      c-0.459-0.372-0.924-0.738-1.396-1.098c-0.187-0.143-0.374-0.287-0.563-0.428c-0.646-0.48-1.302-0.952-1.973-1.408      c-0.026-0.017-0.052-0.033-0.077-0.05c-0.647-0.438-1.309-0.862-1.979-1.277c-0.21-0.13-0.422-0.256-0.634-0.384      c-0.518-0.312-1.042-0.616-1.573-0.914c-0.216-0.121-0.43-0.243-0.648-0.361c-0.729-0.396-1.466-0.784-2.219-1.154      c-26.734-13.12-58.242-3.734-70.357,20.952l-3.948,8.046c12.115-24.686,43.623-34.072,70.357-20.952      c0.753,0.37,1.49,0.757,2.219,1.154c0.218,0.118,0.432,0.241,0.647,0.361c0.531,0.298,1.055,0.602,1.573,0.914      c0.212,0.128,0.424,0.254,0.634,0.384c0.67,0.415,1.332,0.839,1.979,1.277c0.025,0.017,0.051,0.033,0.077,0.05      c0.671,0.456,1.326,0.928,1.973,1.408c0.19,0.141,0.376,0.285,0.564,0.428c0.471,0.359,0.935,0.724,1.393,1.095      c0.188,0.153,0.378,0.305,0.564,0.46c0.571,0.475,1.132,0.959,1.681,1.453c0.04,0.036,0.082,0.07,0.122,0.106      c0.586,0.531,1.154,1.075,1.714,1.626c0.162,0.16,0.32,0.323,0.481,0.484c0.408,0.412,0.81,0.83,1.204,1.253      c0.162,0.174,0.324,0.347,0.483,0.522c0.474,0.523,0.939,1.052,1.391,1.589c0.048,0.057,0.099,0.113,0.147,0.17      c0.495,0.594,0.972,1.197,1.44,1.808c0.135,0.176,0.265,0.355,0.398,0.532c0.34,0.456,0.674,0.916,0.998,1.381      c0.135,0.192,0.27,0.385,0.402,0.578c0.382,0.561,0.753,1.126,1.113,1.698c0.047,0.075,0.097,0.149,0.144,0.224      c0.401,0.645,0.784,1.298,1.155,1.957c0.106,0.187,0.207,0.376,0.31,0.565c0.271,0.492,0.533,0.988,0.787,1.486      c0.106,0.208,0.212,0.415,0.314,0.624c0.289,0.587,0.567,1.178,0.834,1.773c0.042,0.093,0.087,0.184,0.128,0.278      c0.302,0.685,0.585,1.376,0.857,2.071c0.076,0.194,0.147,0.39,0.22,0.585c0.196,0.52,0.384,1.043,0.563,1.568      c0.075,0.22,0.15,0.44,0.222,0.66c0.195,0.599,0.38,1.201,0.553,1.805c0.032,0.113,0.069,0.226,0.101,0.34      c0.198,0.712,0.378,1.428,0.545,2.146c0.046,0.2,0.087,0.4,0.132,0.601c0.118,0.538,0.228,1.077,0.328,1.618      c0.042,0.228,0.084,0.456,0.123,0.685c0.103,0.606,0.195,1.214,0.276,1.823c0.017,0.127,0.038,0.253,0.054,0.38      c0.091,0.729,0.163,1.46,0.221,2.192c0.016,0.198,0.025,0.396,0.039,0.595c0.037,0.551,0.065,1.103,0.083,1.656      c0.007,0.231,0.014,0.463,0.018,0.694c0.011,0.603,0.01,1.206-0.002,1.81c-0.003,0.139-0.001,0.279-0.005,0.418      c-0.007,0.226-0.026,0.451-0.036,0.677c-0.029,0.672-0.066,1.345-0.124,2.016c-0.028,0.321-0.067,0.642-0.102,0.962      c-0.061,0.571-0.128,1.142-0.21,1.712c-0.05,0.347-0.107,0.693-0.165,1.039c-0.092,0.548-0.193,1.095-0.305,1.641      c-0.071,0.348-0.144,0.695-0.224,1.042c-0.127,0.556-0.269,1.11-0.418,1.664c-0.094,0.353-0.184,0.706-0.287,1.058      c-0.076,0.26-0.159,0.518-0.24,0.777c-0.152,0.487-0.313,0.973-0.482,1.458c-0.093,0.266-0.188,0.533-0.286,0.799      c-0.186,0.501-0.384,1-0.588,1.497c-0.095,0.231-0.185,0.463-0.284,0.693c-0.309,0.72-0.633,1.437-0.982,2.147l3.948-8.046      c0.349-0.711,0.672-1.427,0.982-2.147c0.099-0.23,0.189-0.462,0.284-0.692c0.204-0.497,0.402-0.996,0.588-1.497      c0.098-0.266,0.193-0.532,0.286-0.799c0.169-0.484,0.33-0.969,0.482-1.457c0.081-0.259,0.164-0.518,0.24-0.778      c0.037-0.126,0.08-0.251,0.116-0.377c0.064-0.226,0.11-0.454,0.17-0.68c0.149-0.554,0.291-1.108,0.418-1.664      c0.079-0.347,0.152-0.694,0.223-1.041c0.112-0.546,0.213-1.094,0.305-1.642c0.058-0.346,0.115-0.691,0.165-1.038      c0.083-0.57,0.149-1.142,0.21-1.714c0.035-0.32,0.074-0.64,0.101-0.96c0.058-0.672,0.095-1.345,0.124-2.018      c0.008-0.187,0.028-0.374,0.035-0.561c0.001-0.038,0-0.077,0.001-0.115c0.004-0.139,0.002-0.279,0.005-0.418      c0.012-0.604,0.013-1.207,0.002-1.811c-0.004-0.231-0.011-0.461-0.019-0.692c-0.018-0.553-0.046-1.105-0.083-1.657      c-0.013-0.198-0.023-0.396-0.039-0.595c-0.058-0.732-0.13-1.463-0.222-2.192c-0.016-0.127-0.037-0.253-0.054-0.38      c-0.081-0.609-0.173-1.216-0.276-1.822c-0.039-0.229-0.081-0.457-0.124-0.685c-0.1-0.542-0.21-1.082-0.328-1.621      c-0.044-0.199-0.084-0.399-0.131-0.598c-0.167-0.719-0.346-1.435-0.545-2.147c-0.032-0.114-0.068-0.226-0.1-0.34      c-0.173-0.604-0.357-1.206-0.553-1.805c-0.071-0.221-0.147-0.44-0.222-0.66C224.432,173.402,224.243,172.88,224.047,172.36z"
                            />
                            <path
                              style={{ opacity: "0.4" }}
                              d="M224.047,172.36c-0.073-0.195-0.144-0.391-0.22-0.585c-0.271-0.695-0.555-1.386-0.857-2.071      c-0.041-0.093-0.086-0.184-0.128-0.277c-0.266-0.595-0.545-1.186-0.834-1.773c-0.103-0.209-0.209-0.416-0.314-0.623      c-0.254-0.499-0.516-0.994-0.786-1.487c-0.103-0.188-0.204-0.378-0.31-0.565c-0.371-0.658-0.755-1.312-1.155-1.957      c-0.047-0.075-0.097-0.149-0.144-0.224c-0.359-0.572-0.73-1.138-1.113-1.698c-0.132-0.194-0.267-0.386-0.402-0.578      c-0.326-0.466-0.659-0.926-1.001-1.383c-0.132-0.176-0.261-0.354-0.395-0.529c-0.467-0.611-0.945-1.215-1.441-1.809      c-0.048-0.057-0.099-0.113-0.147-0.17c-0.452-0.537-0.917-1.066-1.391-1.589c-0.16-0.176-0.322-0.348-0.483-0.522      c-0.394-0.423-0.795-0.841-1.204-1.253c-0.16-0.162-0.318-0.324-0.481-0.484c-0.559-0.551-1.128-1.095-1.714-1.626      c-0.04-0.036-0.081-0.07-0.121-0.106c-0.549-0.495-1.111-0.979-1.683-1.455c-0.184-0.154-0.372-0.305-0.559-0.457      c-0.459-0.372-0.924-0.738-1.396-1.098c-0.187-0.143-0.374-0.287-0.563-0.428c-0.646-0.48-1.302-0.952-1.973-1.408      c-0.026-0.017-0.052-0.033-0.077-0.05c-0.647-0.438-1.309-0.862-1.979-1.277c-0.21-0.13-0.422-0.256-0.634-0.384      c-0.518-0.312-1.042-0.616-1.573-0.914c-0.216-0.121-0.43-0.243-0.648-0.361c-0.729-0.396-1.466-0.784-2.219-1.154      c-26.734-13.12-58.242-3.734-70.357,20.952l-3.948,8.046c12.115-24.686,43.623-34.072,70.357-20.952      c0.753,0.37,1.49,0.757,2.219,1.154c0.218,0.118,0.432,0.241,0.647,0.361c0.531,0.298,1.055,0.602,1.573,0.914      c0.212,0.128,0.424,0.254,0.634,0.384c0.67,0.415,1.332,0.839,1.979,1.277c0.025,0.017,0.051,0.033,0.077,0.05      c0.671,0.456,1.326,0.928,1.973,1.408c0.19,0.141,0.376,0.285,0.564,0.428c0.471,0.359,0.935,0.724,1.393,1.095      c0.188,0.153,0.378,0.305,0.564,0.46c0.571,0.475,1.132,0.959,1.681,1.453c0.04,0.036,0.082,0.07,0.122,0.106      c0.586,0.531,1.154,1.075,1.714,1.626c0.162,0.16,0.32,0.323,0.481,0.484c0.408,0.412,0.81,0.83,1.204,1.253      c0.162,0.174,0.324,0.347,0.483,0.522c0.474,0.523,0.939,1.052,1.391,1.589c0.048,0.057,0.099,0.113,0.147,0.17      c0.495,0.594,0.972,1.197,1.44,1.808c0.135,0.176,0.265,0.355,0.398,0.532c0.34,0.456,0.674,0.916,0.998,1.381      c0.135,0.192,0.27,0.385,0.402,0.578c0.382,0.561,0.753,1.126,1.113,1.698c0.047,0.075,0.097,0.149,0.144,0.224      c0.401,0.645,0.784,1.298,1.155,1.957c0.106,0.187,0.207,0.376,0.31,0.565c0.271,0.492,0.533,0.988,0.787,1.486      c0.106,0.208,0.212,0.415,0.314,0.624c0.289,0.587,0.567,1.178,0.834,1.773c0.042,0.093,0.087,0.184,0.128,0.278      c0.302,0.685,0.585,1.376,0.857,2.071c0.076,0.194,0.147,0.39,0.22,0.585c0.196,0.52,0.384,1.043,0.563,1.568      c0.075,0.22,0.15,0.44,0.222,0.66c0.195,0.599,0.38,1.201,0.553,1.805c0.032,0.113,0.069,0.226,0.101,0.34      c0.198,0.712,0.378,1.428,0.545,2.146c0.046,0.2,0.087,0.4,0.132,0.601c0.118,0.538,0.228,1.077,0.328,1.618      c0.042,0.228,0.084,0.456,0.123,0.685c0.103,0.606,0.195,1.214,0.276,1.823c0.017,0.127,0.038,0.253,0.054,0.38      c0.091,0.729,0.163,1.46,0.221,2.192c0.016,0.198,0.025,0.396,0.039,0.595c0.037,0.551,0.065,1.103,0.083,1.656      c0.007,0.231,0.014,0.463,0.018,0.694c0.011,0.603,0.01,1.206-0.002,1.81c-0.003,0.139-0.001,0.279-0.005,0.418      c-0.007,0.226-0.026,0.451-0.036,0.677c-0.029,0.672-0.066,1.345-0.124,2.016c-0.028,0.321-0.067,0.642-0.102,0.962      c-0.061,0.571-0.128,1.142-0.21,1.712c-0.05,0.347-0.107,0.693-0.165,1.039c-0.092,0.548-0.193,1.095-0.305,1.641      c-0.071,0.348-0.144,0.695-0.224,1.042c-0.127,0.556-0.269,1.11-0.418,1.664c-0.094,0.353-0.184,0.706-0.287,1.058      c-0.076,0.26-0.159,0.518-0.24,0.777c-0.152,0.487-0.313,0.973-0.482,1.458c-0.093,0.266-0.188,0.533-0.286,0.799      c-0.186,0.501-0.384,1-0.588,1.497c-0.095,0.231-0.185,0.463-0.284,0.693c-0.309,0.72-0.633,1.437-0.982,2.147l3.948-8.046      c0.349-0.711,0.672-1.427,0.982-2.147c0.099-0.23,0.189-0.462,0.284-0.692c0.204-0.497,0.402-0.996,0.588-1.497      c0.098-0.266,0.193-0.532,0.286-0.799c0.169-0.484,0.33-0.969,0.482-1.457c0.081-0.259,0.164-0.518,0.24-0.778      c0.037-0.126,0.08-0.251,0.116-0.377c0.064-0.226,0.11-0.454,0.17-0.68c0.149-0.554,0.291-1.108,0.418-1.664      c0.079-0.347,0.152-0.694,0.223-1.041c0.112-0.546,0.213-1.094,0.305-1.642c0.058-0.346,0.115-0.691,0.165-1.038      c0.083-0.57,0.149-1.142,0.21-1.714c0.035-0.32,0.074-0.64,0.101-0.96c0.058-0.672,0.095-1.345,0.124-2.018      c0.008-0.187,0.028-0.374,0.035-0.561c0.001-0.038,0-0.077,0.001-0.115c0.004-0.139,0.002-0.279,0.005-0.418      c0.012-0.604,0.013-1.207,0.002-1.811c-0.004-0.231-0.011-0.461-0.019-0.692c-0.018-0.553-0.046-1.105-0.083-1.657      c-0.013-0.198-0.023-0.396-0.039-0.595c-0.058-0.732-0.13-1.463-0.222-2.192c-0.016-0.127-0.037-0.253-0.054-0.38      c-0.081-0.609-0.173-1.216-0.276-1.822c-0.039-0.229-0.081-0.457-0.124-0.685c-0.1-0.542-0.21-1.082-0.328-1.621      c-0.044-0.199-0.084-0.399-0.131-0.598c-0.167-0.719-0.346-1.435-0.545-2.147c-0.032-0.114-0.068-0.226-0.1-0.34      c-0.173-0.604-0.357-1.206-0.553-1.805c-0.071-0.221-0.147-0.44-0.222-0.66C224.432,173.402,224.243,172.88,224.047,172.36z"
                            />
                          </g>
                          <g>
                            <path
                              style={{ fill: "#407BFF" }}
                              d="M145.714,244.742c-0.976-0.479-1.932-0.982-2.878-1.497c-0.281-0.153-0.557-0.31-0.835-0.466      c-0.69-0.387-1.372-0.783-2.045-1.188c-0.274-0.165-0.548-0.328-0.818-0.495c-0.87-0.539-1.73-1.089-2.57-1.658      c-0.031-0.021-0.064-0.041-0.095-0.062c-0.87-0.591-1.72-1.203-2.558-1.825c-0.247-0.183-0.489-0.371-0.733-0.556      c-0.612-0.466-1.214-0.939-1.808-1.421c-0.242-0.197-0.486-0.393-0.725-0.592c-0.741-0.617-1.469-1.243-2.18-1.884      c-0.052-0.047-0.107-0.093-0.16-0.14c-0.759-0.688-1.496-1.392-2.219-2.106c-0.213-0.209-0.42-0.422-0.629-0.634      c-0.528-0.533-1.046-1.072-1.555-1.619c-0.21-0.226-0.422-0.451-0.629-0.679c-0.616-0.679-1.219-1.366-1.806-2.063      c-0.061-0.073-0.126-0.143-0.187-0.217c-0.641-0.769-1.261-1.552-1.867-2.343c-0.175-0.228-0.344-0.46-0.516-0.69      c-0.442-0.592-0.874-1.188-1.296-1.791c-0.174-0.249-0.349-0.498-0.52-0.749c-0.494-0.725-0.974-1.456-1.438-2.196      c-0.062-0.1-0.129-0.197-0.191-0.297c-0.519-0.835-1.015-1.681-1.496-2.533c-0.138-0.245-0.27-0.492-0.405-0.738      c-0.349-0.636-0.688-1.277-1.017-1.922c-0.137-0.27-0.275-0.54-0.409-0.812c-0.374-0.759-0.734-1.523-1.078-2.292      c-0.054-0.122-0.114-0.243-0.168-0.365c-0.391-0.888-0.759-1.783-1.111-2.683c-0.099-0.253-0.191-0.508-0.287-0.762      c-0.254-0.673-0.498-1.35-0.729-2.029c-0.097-0.284-0.194-0.569-0.287-0.854c-0.254-0.777-0.493-1.558-0.717-2.343      c-0.042-0.147-0.089-0.292-0.13-0.44c-0.257-0.923-0.49-1.851-0.706-2.782c-0.06-0.257-0.113-0.517-0.169-0.775      c-0.154-0.7-0.296-1.401-0.426-2.105c-0.054-0.294-0.108-0.588-0.158-0.882c-0.135-0.787-0.254-1.576-0.359-2.367      c-0.022-0.164-0.049-0.327-0.07-0.491c-0.118-0.945-0.211-1.892-0.287-2.841c-0.02-0.257-0.033-0.514-0.05-0.772      c-0.048-0.715-0.084-1.43-0.107-2.146c-0.01-0.3-0.019-0.6-0.025-0.9c-0.014-0.783-0.013-1.567,0.003-2.351      c0.004-0.179,0.001-0.358,0.006-0.537c0.008-0.292,0.034-0.583,0.046-0.875c0.037-0.872,0.085-1.745,0.16-2.617      c0.036-0.417,0.087-0.833,0.132-1.25c0.079-0.74,0.166-1.479,0.272-2.217c0.065-0.45,0.14-0.899,0.215-1.348      c0.119-0.711,0.25-1.42,0.395-2.129c0.092-0.45,0.187-0.9,0.29-1.349c0.165-0.721,0.349-1.44,0.541-2.157      c0.123-0.459,0.24-0.918,0.374-1.376c0.099-0.335,0.205-0.669,0.31-1.004c0.198-0.633,0.407-1.265,0.627-1.895      c0.12-0.345,0.242-0.689,0.37-1.032c0.241-0.651,0.498-1.299,0.764-1.946c0.123-0.298,0.239-0.598,0.367-0.895      c0.401-0.934,0.821-1.864,1.274-2.786l-3.948,8.046c-0.452,0.922-0.872,1.852-1.274,2.786c-0.127,0.297-0.244,0.596-0.366,0.894      c-0.265,0.646-0.523,1.294-0.764,1.946c-0.127,0.343-0.249,0.688-0.37,1.032c-0.22,0.63-0.429,1.261-0.627,1.895      c-0.105,0.335-0.211,0.669-0.31,1.005c-0.049,0.164-0.105,0.327-0.152,0.492c-0.083,0.293-0.143,0.589-0.221,0.883      c-0.192,0.718-0.376,1.436-0.541,2.157c-0.103,0.449-0.197,0.899-0.29,1.35c-0.145,0.708-0.276,1.417-0.395,2.128      c-0.075,0.45-0.15,0.898-0.215,1.349c-0.107,0.738-0.193,1.477-0.272,2.217c-0.045,0.417-0.096,0.833-0.132,1.25      c-0.075,0.871-0.123,1.744-0.16,2.617c-0.011,0.242-0.037,0.485-0.045,0.727c-0.001,0.049,0,0.099-0.002,0.148      c-0.005,0.179-0.002,0.358-0.006,0.536c-0.016,0.784-0.017,1.568-0.003,2.352c0.005,0.299,0.014,0.599,0.024,0.898      c0.023,0.716,0.06,1.432,0.107,2.147c0.017,0.257,0.03,0.514,0.05,0.771c0.076,0.949,0.169,1.896,0.287,2.842      c0.02,0.164,0.048,0.327,0.069,0.491c0.105,0.791,0.225,1.58,0.359,2.367c0.05,0.294,0.104,0.588,0.158,0.882      c0.131,0.704,0.273,1.405,0.427,2.105c0.057,0.258,0.109,0.517,0.169,0.775c0.216,0.931,0.449,1.86,0.707,2.783      c0.04,0.145,0.087,0.289,0.129,0.435c0.225,0.786,0.464,1.568,0.718,2.347c0.093,0.285,0.19,0.57,0.287,0.854      c0.232,0.679,0.475,1.355,0.729,2.029c0.095,0.254,0.188,0.509,0.287,0.762c0.352,0.9,0.719,1.795,1.111,2.683      c0.054,0.122,0.114,0.243,0.168,0.365c0.345,0.77,0.705,1.535,1.079,2.294c0.133,0.27,0.27,0.539,0.407,0.808      c0.329,0.647,0.669,1.289,1.02,1.927c0.134,0.245,0.265,0.49,0.402,0.733c0.481,0.853,0.978,1.699,1.497,2.535      c0.062,0.1,0.129,0.198,0.191,0.297c0.464,0.739,0.945,1.471,1.438,2.196c0.171,0.251,0.346,0.5,0.52,0.749      c0.422,0.603,0.854,1.199,1.296,1.791c0.172,0.23,0.341,0.461,0.516,0.689c0.606,0.791,1.225,1.574,1.867,2.344      c0.062,0.074,0.126,0.144,0.187,0.217c0.587,0.698,1.19,1.385,1.806,2.063c0.207,0.228,0.418,0.453,0.629,0.679      c0.509,0.547,1.029,1.087,1.557,1.621c0.208,0.21,0.414,0.422,0.625,0.63c0.725,0.714,1.463,1.42,2.222,2.108      c0.049,0.045,0.102,0.088,0.151,0.133c0.714,0.643,1.444,1.271,2.187,1.89c0.239,0.2,0.483,0.395,0.725,0.592      c0.594,0.482,1.196,0.955,1.808,1.421c0.244,0.186,0.486,0.373,0.733,0.556c0.838,0.622,1.687,1.234,2.558,1.825      c0.031,0.021,0.064,0.041,0.095,0.062c0.841,0.569,1.7,1.119,2.57,1.658c0.27,0.168,0.545,0.331,0.819,0.495      c0.673,0.405,1.355,0.801,2.045,1.188c0.278,0.156,0.555,0.313,0.835,0.466c0.946,0.515,1.902,1.017,2.878,1.497      c34.658,17.009,75.488,4.845,91.2-27.17l3.948-8.045C221.203,249.587,180.373,261.751,145.714,244.742z"
                            />
                            <path
                              style={{ opacity: "0.4" }}
                              d="M145.714,244.742c-0.976-0.479-1.932-0.982-2.878-1.497c-0.281-0.153-0.557-0.31-0.835-0.466      c-0.69-0.387-1.372-0.783-2.045-1.188c-0.274-0.165-0.548-0.328-0.818-0.495c-0.87-0.539-1.73-1.089-2.57-1.658      c-0.031-0.021-0.064-0.041-0.095-0.062c-0.87-0.591-1.72-1.203-2.558-1.825c-0.247-0.183-0.489-0.371-0.733-0.556      c-0.612-0.466-1.214-0.939-1.808-1.421c-0.242-0.197-0.486-0.393-0.725-0.592c-0.741-0.617-1.469-1.243-2.18-1.884      c-0.052-0.047-0.107-0.093-0.16-0.14c-0.759-0.688-1.496-1.392-2.219-2.106c-0.213-0.209-0.42-0.422-0.629-0.634      c-0.528-0.533-1.046-1.072-1.555-1.619c-0.21-0.226-0.422-0.451-0.629-0.679c-0.616-0.679-1.219-1.366-1.806-2.063      c-0.061-0.073-0.126-0.143-0.187-0.217c-0.641-0.769-1.261-1.552-1.867-2.343c-0.175-0.228-0.344-0.46-0.516-0.69      c-0.442-0.592-0.874-1.188-1.296-1.791c-0.174-0.249-0.349-0.498-0.52-0.749c-0.494-0.725-0.974-1.456-1.438-2.196      c-0.062-0.1-0.129-0.197-0.191-0.297c-0.519-0.835-1.015-1.681-1.496-2.533c-0.138-0.245-0.27-0.492-0.405-0.738      c-0.349-0.636-0.688-1.277-1.017-1.922c-0.137-0.27-0.275-0.54-0.409-0.812c-0.374-0.759-0.734-1.523-1.078-2.292      c-0.054-0.122-0.114-0.243-0.168-0.365c-0.391-0.888-0.759-1.783-1.111-2.683c-0.099-0.253-0.191-0.508-0.287-0.762      c-0.254-0.673-0.498-1.35-0.729-2.029c-0.097-0.284-0.194-0.569-0.287-0.854c-0.254-0.777-0.493-1.558-0.717-2.343      c-0.042-0.147-0.089-0.292-0.13-0.44c-0.257-0.923-0.49-1.851-0.706-2.782c-0.06-0.257-0.113-0.517-0.169-0.775      c-0.154-0.7-0.296-1.401-0.426-2.105c-0.054-0.294-0.108-0.588-0.158-0.882c-0.135-0.787-0.254-1.576-0.359-2.367      c-0.022-0.164-0.049-0.327-0.07-0.491c-0.118-0.945-0.211-1.892-0.287-2.841c-0.02-0.257-0.033-0.514-0.05-0.772      c-0.048-0.715-0.084-1.43-0.107-2.146c-0.01-0.3-0.019-0.6-0.025-0.9c-0.014-0.783-0.013-1.567,0.003-2.351      c0.004-0.179,0.001-0.358,0.006-0.537c0.008-0.292,0.034-0.583,0.046-0.875c0.037-0.872,0.085-1.745,0.16-2.617      c0.036-0.417,0.087-0.833,0.132-1.25c0.079-0.74,0.166-1.479,0.272-2.217c0.065-0.45,0.14-0.899,0.215-1.348      c0.119-0.711,0.25-1.42,0.395-2.129c0.092-0.45,0.187-0.9,0.29-1.349c0.165-0.721,0.349-1.44,0.541-2.157      c0.123-0.459,0.24-0.918,0.374-1.376c0.099-0.335,0.205-0.669,0.31-1.004c0.198-0.633,0.407-1.265,0.627-1.895      c0.12-0.345,0.242-0.689,0.37-1.032c0.241-0.651,0.498-1.299,0.764-1.946c0.123-0.298,0.239-0.598,0.367-0.895      c0.401-0.934,0.821-1.864,1.274-2.786l-3.948,8.046c-0.452,0.922-0.872,1.852-1.274,2.786c-0.127,0.297-0.244,0.596-0.366,0.894      c-0.265,0.646-0.523,1.294-0.764,1.946c-0.127,0.343-0.249,0.688-0.37,1.032c-0.22,0.63-0.429,1.261-0.627,1.895      c-0.105,0.335-0.211,0.669-0.31,1.005c-0.049,0.164-0.105,0.327-0.152,0.492c-0.083,0.293-0.143,0.589-0.221,0.883      c-0.192,0.718-0.376,1.436-0.541,2.157c-0.103,0.449-0.197,0.899-0.29,1.35c-0.145,0.708-0.276,1.417-0.395,2.128      c-0.075,0.45-0.15,0.898-0.215,1.349c-0.107,0.738-0.193,1.477-0.272,2.217c-0.045,0.417-0.096,0.833-0.132,1.25      c-0.075,0.871-0.123,1.744-0.16,2.617c-0.011,0.242-0.037,0.485-0.045,0.727c-0.001,0.049,0,0.099-0.002,0.148      c-0.005,0.179-0.002,0.358-0.006,0.536c-0.016,0.784-0.017,1.568-0.003,2.352c0.005,0.299,0.014,0.599,0.024,0.898      c0.023,0.716,0.06,1.432,0.107,2.147c0.017,0.257,0.03,0.514,0.05,0.771c0.076,0.949,0.169,1.896,0.287,2.842      c0.02,0.164,0.048,0.327,0.069,0.491c0.105,0.791,0.225,1.58,0.359,2.367c0.05,0.294,0.104,0.588,0.158,0.882      c0.131,0.704,0.273,1.405,0.427,2.105c0.057,0.258,0.109,0.517,0.169,0.775c0.216,0.931,0.449,1.86,0.707,2.783      c0.04,0.145,0.087,0.289,0.129,0.435c0.225,0.786,0.464,1.568,0.718,2.347c0.093,0.285,0.19,0.57,0.287,0.854      c0.232,0.679,0.475,1.355,0.729,2.029c0.095,0.254,0.188,0.509,0.287,0.762c0.352,0.9,0.719,1.795,1.111,2.683      c0.054,0.122,0.114,0.243,0.168,0.365c0.345,0.77,0.705,1.535,1.079,2.294c0.133,0.27,0.27,0.539,0.407,0.808      c0.329,0.647,0.669,1.289,1.02,1.927c0.134,0.245,0.265,0.49,0.402,0.733c0.481,0.853,0.978,1.699,1.497,2.535      c0.062,0.1,0.129,0.198,0.191,0.297c0.464,0.739,0.945,1.471,1.438,2.196c0.171,0.251,0.346,0.5,0.52,0.749      c0.422,0.603,0.854,1.199,1.296,1.791c0.172,0.23,0.341,0.461,0.516,0.689c0.606,0.791,1.225,1.574,1.867,2.344      c0.062,0.074,0.126,0.144,0.187,0.217c0.587,0.698,1.19,1.385,1.806,2.063c0.207,0.228,0.418,0.453,0.629,0.679      c0.509,0.547,1.029,1.087,1.557,1.621c0.208,0.21,0.414,0.422,0.625,0.63c0.725,0.714,1.463,1.42,2.222,2.108      c0.049,0.045,0.102,0.088,0.151,0.133c0.714,0.643,1.444,1.271,2.187,1.89c0.239,0.2,0.483,0.395,0.725,0.592      c0.594,0.482,1.196,0.955,1.808,1.421c0.244,0.186,0.486,0.373,0.733,0.556c0.838,0.622,1.687,1.234,2.558,1.825      c0.031,0.021,0.064,0.041,0.095,0.062c0.841,0.569,1.7,1.119,2.57,1.658c0.27,0.168,0.545,0.331,0.819,0.495      c0.673,0.405,1.355,0.801,2.045,1.188c0.278,0.156,0.555,0.313,0.835,0.466c0.946,0.515,1.902,1.017,2.878,1.497      c34.658,17.009,75.488,4.845,91.2-27.17l3.948-8.045C221.203,249.587,180.373,261.751,145.714,244.742z"
                            />
                          </g>
                          <path
                            style={{ fill: "#407BFF" }}
                            d="M131.252,129.926l-0.549-0.836c2.455-1.613,5.055-3.085,7.727-4.375l0.436,0.901     C136.231,126.887,133.671,128.337,131.252,129.926z M146.355,122.534l-0.326-0.946c11.636-4.009,24.443-4.964,37.04-2.764     l-0.172,0.985C170.466,117.638,157.831,118.581,146.355,122.534z"
                          />
                          <path
                            style={{ fill: "#407BFF" }}
                            d="M111.409,155.979c15.707-32.007,56.533-44.161,91.192-27.152     c34.658,17.009,50.021,56.738,34.314,88.745c-15.712,32.015-56.542,44.179-91.2,27.17     C111.056,227.734,95.697,187.995,111.409,155.979z M222.567,210.531c12.115-24.686,0.271-55.347-26.463-68.467     c-26.734-13.12-58.242-3.734-70.357,20.952c-12.123,24.703-0.262,55.352,26.472,68.471     C178.953,244.607,210.444,235.234,222.567,210.531"
                          />
                          <path
                            style={{ fill: "#407BFF" }}
                            d="M295.959,240.274l-4.963,10.114c-0.959,1.954-3.342,2.73-5.267,1.716l-64.3-33.865l6.538-13.322     l66.127,30.142C296.074,235.96,296.918,238.32,295.959,240.274z"
                          />
                          <path
                            style={{ opacity: "0.1", fill: "#FFFFFF" }}
                            d="M223.49,210.984c12.346-25.156,0.276-56.402-26.968-69.772     c-27.243-13.37-59.353-3.805-71.699,21.352c-12.354,25.174-0.267,56.407,26.977,69.777     C179.044,245.71,211.136,236.159,223.49,210.984"
                          />
                          <path
                            style={{ opacity: "0.1", fill: "#FFFFFF" }}
                            d="M222.567,210.531"
                          />
                          <g>
                            <path
                              style={{ opacity: "0.1", fill: "#FFFFFF" }}
                              d="M196.522,141.212c-6.977-3.424-14.273-5.334-21.475-5.873l-54.487,40.775      c-1.091,7.003-0.607,14.137,1.306,20.967L196.522,141.212z"
                            />
                          </g>
                        </g>
                        <path
                          style={{ fill: "#B55B52" }}
                          d="M277.145,221.567c-4.059-1.457-6.849,1.239-9.66,2.645c-0.477,0.239-0.335,1.654,0.622,1.797    c1.676,0.25,2.501-0.027,3.416-0.586c0.986,0.921,4.577,2.452,7.199-0.31C278.759,223.138,277.145,221.567,277.145,221.567z"
                        />
                        <path
                          style={{ fill: "#FFFFFF" }}
                          d="M330.796,126.785h-2.319c-0.083,0-0.161-0.037-0.213-0.102c-0.052-0.064-0.072-0.149-0.055-0.23    l1.16-5.346c0.027-0.126,0.139-0.215,0.268-0.215l0,0c0.129,0,0.24,0.09,0.268,0.215l1.159,5.346    c0.018,0.081-0.003,0.165-0.055,0.23C330.957,126.748,330.879,126.785,330.796,126.785z M328.815,126.238h1.642l-0.82-3.783    L328.815,126.238z"
                        />
                      </g>
                    </g>
                    <g id="Question_Marks">
                      <g>
                        <g>
                          <path
                            style={{ fill: "#407BFF" }}
                            d="M263.741,97.104l-5.675,9.004l-0.9-0.567c-1.532-0.966-2.666-1.923-3.403-2.873     c-0.737-0.95-1.283-2.017-1.64-3.202c-0.357-1.185-0.774-3.605-1.251-7.261c-0.236-1.937-0.788-3.179-1.657-3.726     c-0.869-0.547-1.706-0.716-2.511-0.507c-0.805,0.21-1.537,0.836-2.194,1.878c-0.707,1.121-0.921,2.284-0.641,3.486     c0.28,1.203,1.279,2.489,2.997,3.859l-6.932,8.477c-3.181-2.446-5.128-5.39-5.84-8.829c-0.712-3.44,0.325-7.371,3.113-11.794     c2.17-3.444,4.642-5.771,7.413-6.981c3.755-1.65,7.252-1.455,10.49,0.586c1.343,0.846,2.404,2.034,3.184,3.563     c0.78,1.529,1.349,4.006,1.706,7.432c0.258,2.392,0.638,4.039,1.141,4.94C261.642,95.488,262.509,96.327,263.741,97.104z      M260.265,107.924l6.078-9.644l8.506,5.362l-6.078,9.644L260.265,107.924z"
                          />
                        </g>
                        <g>
                          <path
                            style={{ fill: "#407BFF" }}
                            d="M344.017,73.588l-7.495-4.078l0.408-0.749c0.694-1.275,1.402-2.232,2.124-2.871     c0.722-0.638,1.548-1.13,2.478-1.477c0.93-0.346,2.845-0.804,5.745-1.374c1.537-0.288,2.503-0.794,2.896-1.517     c0.393-0.723,0.486-1.401,0.276-2.035c-0.209-0.634-0.748-1.187-1.616-1.659c-0.934-0.508-1.874-0.619-2.822-0.334     c-0.948,0.285-1.926,1.151-2.934,2.596l-7.138-5.111c1.794-2.671,4.049-4.38,6.764-5.126c2.715-0.747,5.914-0.118,9.596,1.885     c2.867,1.56,4.855,3.417,5.967,5.572c1.513,2.919,1.536,5.727,0.07,8.423c-0.608,1.118-1.504,2.028-2.687,2.73     c-1.183,0.703-3.136,1.285-5.858,1.746c-1.9,0.33-3.198,0.718-3.894,1.166C345.201,71.826,344.574,72.563,344.017,73.588z      M335.181,71.363l8.028,4.368l-3.853,7.081l-8.028-4.368L335.181,71.363z"
                          />
                        </g>
                        <g>
                          <path
                            style={{ fill: "#407BFF" }}
                            d="M356.15,94.648l-1.988-6.375l0.637-0.199c1.085-0.338,2.004-0.49,2.758-0.455     c0.753,0.035,1.485,0.209,2.197,0.521c0.711,0.312,2.036,1.098,3.976,2.359c1.021,0.676,1.839,0.918,2.454,0.726     c0.615-0.192,1.036-0.523,1.264-0.993c0.228-0.47,0.227-1.074-0.004-1.812c-0.248-0.794-0.716-1.369-1.403-1.725     c-0.688-0.356-1.709-0.403-3.063-0.14l-1.225-6.761c2.463-0.523,4.661-0.254,6.593,0.806c1.932,1.06,3.387,3.156,4.364,6.288     c0.76,2.438,0.865,4.566,0.315,6.382c-0.741,2.465-2.258,4.055-4.551,4.77c-0.951,0.296-1.95,0.32-2.997,0.07     c-1.048-0.25-2.462-0.987-4.243-2.211c-1.247-0.851-2.188-1.34-2.823-1.467C357.776,94.303,357.022,94.376,356.15,94.648z      M352.399,88.583l2.13,6.828l-6.023,1.878l-2.13-6.828L352.399,88.583z"
                          />
                        </g>
                      </g>
                    </g>
                  </svg>
                  <div
                    style={{
                      fontSize: "15px",
                    }}
                  >
                    Bạn không có lớp học.
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </Page>
    );
  }
}
