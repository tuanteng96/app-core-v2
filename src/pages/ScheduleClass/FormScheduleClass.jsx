import React, { useEffect, useState } from "react";
import userService from "../../service/user.service";
import BookDataService from "../../service/book.service";
import { useQuery } from "react-query";
import { Formik, Form } from "formik";
import StocksProvincesFilter from "../../components/StocksProvincesFilter";
import { PickerServiceCard } from "./components";
import DatePicker from "react-mobile-datepicker";
import moment from "moment";
import clsx from "clsx";
import { getUser } from "../../constants/user";
import { f7 } from "framework7-react";
import { toast } from "react-toastify";
import { createPortal } from "react-dom";
import SelectPicker from "../../components/Selects/SelectPicker";

const dateConfig = {
  // hour: {
  //   format: "hh",
  //   caption: "Giờ",
  //   step: 1,
  // },
  // minute: {
  //   format: "mm",
  //   caption: "Phút",
  //   step: 1,
  // },
  date: {
    caption: "Ngày",
    format: "D",
    step: 1,
  },
  month: {
    caption: "Tháng",
    format: "M",
    step: 1,
  },
  year: {
    caption: "Năm",
    format: "YYYY",
    step: 1,
  },
};

const ConvertViToEn = (str, toUpperCase = false) => {
  str = str.toLowerCase();
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
  str = str.replace(/đ/g, "d");
  // Some system encode vietnamese combining accent as individual utf-8 characters
  str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ""); // Huyền sắc hỏi ngã nặng
  str = str.replace(/\u02C6|\u0306|\u031B/g, ""); // Â, Ê, Ă, Ơ, Ư

  return toUpperCase ? str.toUpperCase() : str;
};

const SubmitListener = ({ formik }) => {
  useEffect(() => {
    if (
      formik.values?.Date &&
      formik.values?.ProdIDs &&
      formik.values?.StockID
    ) {
      (async function () {
        f7.dialog.preloader("Đang kiểm tra ...");
        try {
          let filter = {
            ProdIDs: [formik.values?.ProdIDs?.ProdID],
            StockID: [formik.values?.StockID?.value],
            From: null,
            To: null,
            ClassIDs: [],
            TeachIDs: [],
            MemberIDs: [],
            BeginFrom: moment(formik.values?.Date)
              .set({
                hour: "00",
                minute: "00",
                second: "00",
              })
              .format("YYYY-MM-DD HH:mm"),
            BeginTo: moment(formik.values?.Date)
              .set({
                hour: "23",
                minute: "59",
                second: "59",
              })
              .format("YYYY-MM-DD HH:mm"),
            Pi: 1,
            Ps: 100,
          };
          let data = await userService.getSheduleOsList(filter);

          let rs = await userService.getSheduleClassList({
            StockID: [formik.values?.StockID?.value],
            ClassIDs: formik.values?.ProdIDs?.ClassList
              ? formik.values?.ProdIDs?.ClassList.map((x) => x.ID)
              : [],
            From: null,
            To: null,
            Pi: 1,
            Ps: 1000,
          });
          let ListClass = rs?.data?.Items || [];
          let OsClass = data?.data?.Items || [];

          let Events = [];
          for (let clss of ListClass) {
            if (clss.TimeSlot && clss.TimeSlot.length > 0) {
              for (let day of clss.TimeSlot) {
                if (day.Items && day.Items.length > 0) {
                  let Date =
                    day.Index !== 0
                      ? moment(formik.values?.Date, "e")
                          .startOf("week")
                          .isoWeekday(day.Index)
                          .format("YYYY-MM-DD")
                      : moment(formik.values?.Date, "e")
                          .startOf("week")
                          .isoWeekday(day.Index)
                          .add(7, "day")
                          .format("YYYY-MM-DD");

                  if (
                    Date === moment(formik.values?.Date).format("YYYY-MM-DD")
                  ) {
                    for (let item of day.Items) {
                      let newObj = {
                        Class: clss,
                        Day: day,
                        TimeFrom: item.from,
                        DateFrom:
                          day.Index !== 0
                            ? moment(formik.values?.Date, "e")
                                .startOf("week")
                                .isoWeekday(day.Index)
                                .toDate()
                            : moment(formik.values?.Date, "e")
                                .startOf("week")
                                .isoWeekday(day.Index)
                                .add(7, "day")
                                .toDate(),
                        start: moment()
                          .set({
                            hour: moment(item.from, "HH:mm").get("hour"),
                            minute: moment(item.from, "HH:mm").get("minute"),
                            second: moment(item.from, "HH:mm").get("second"),
                          })
                          .toDate(),
                        end: moment()
                          .set({
                            hour: moment(item.from, "HH:mm").get("hour"),
                            minute: moment(item.from, "HH:mm").get("minute"),
                            second: moment(item.from, "HH:mm").get("second"),
                          })
                          .add(clss.Minutes, "minutes")
                          .toDate(),
                        className: `!bg-[#d0d0d0] h-[130px]`,
                        resourceIds: [clss.ID + "-" + day.Index],
                      };

                      let index =
                        OsClass &&
                        OsClass.findIndex((o) => {
                          return (
                            o.OrderServiceClassID === clss.ID &&
                            moment(o.TimeBegin, "YYYY-MM-DD HH:mm").day() ===
                              day.Index &&
                            moment(o.TimeBegin, "YYYY-MM-DD HH:mm").isBetween(
                              moment(newObj.DateFrom).set({
                                hour: moment(newObj.TimeFrom, "HH:mm").get(
                                  "hour"
                                ),
                                minute: moment(newObj.TimeFrom, "HH:mm").get(
                                  "minute"
                                ),
                                second: moment(newObj.TimeFrom, "HH:mm").get(
                                  "second"
                                ),
                              }),
                              moment(newObj.DateFrom).set({
                                hour: moment(newObj.TimeFrom, "HH:mm").get(
                                  "hour"
                                ),
                                minute: moment(newObj.TimeFrom, "HH:mm").get(
                                  "minute"
                                ),
                                second: moment(newObj.TimeFrom, "HH:mm").get(
                                  "second"
                                ),
                              }),
                              null,
                              "[]"
                            )
                          );
                        });
                      if (index > -1) {
                        let { Member } = OsClass[index];
                        if (Member.Status) {
                          newObj.className = `!bg-[#8951fc] h-[130px]`;
                        } else if (
                          Member?.Lists &&
                          Member?.Lists?.length > 0 &&
                          Member?.Lists?.length === clss.MemberTotal
                        ) {
                          newObj.className = `!bg-danger h-[130px]`;
                          newObj.Status = 1;
                        } else {
                          newObj.className = `!bg-success h-[130px]`;
                        }
                        newObj.ClassInfo = OsClass[index];
                      }
                      Events.push(newObj);
                    }
                  }
                }
              }
            }
          }

          Events = Events.filter((x) => {
            if (
              x?.ClassInfo?.Member?.Lists &&
              x?.ClassInfo?.Member?.Lists.length > 0
            ) {
              return (
                x?.ClassInfo?.Member?.Lists.findIndex(
                  (x) => x?.Member?.MemberID === getUser().ID
                ) === -1
              );
            }
            return true;
          }).filter((x) => x.Class.Title.indexOf("(*)") === -1);
          let newEvents = [];
          for (let book of Events) {
            let index = newEvents.findIndex(
              (x) => x.Class.ID === book.Class.ID
            );
            if (index > -1) {
              newEvents[index].Items = [...newEvents[index].Items, book];
            } else {
              newEvents.push({
                Class: book.Class,
                Items: [book],
              });
            }
          }
          formik.setFieldValue("Events", newEvents);
          formik.setFieldValue("EventsList", newEvents);
          f7.dialog.close();
        } catch (e) {
          console.error(e);
        }
      })();
    }
  }, [formik.values?.Date, formik.values?.ProdIDs, formik.values?.StockID]);

  useEffect(() => {
    if (formik?.values?.Key !== null) {
      if (formik.values.Key) {
        formik.setFieldValue(
          "Events",
          formik.values?.Events?.filter((x) =>
            ConvertViToEn(x.Class.Title, true).includes(
              ConvertViToEn(formik.values.Key, true)
            )
          )
        );
      } else {
        formik.setFieldValue("Events", formik.values?.EventsList);
      }
    }
  }, [formik.values.Key]);

  return null;
};

const CoachSelect = ({ StockID, onChange, value }) => {
  let { data } = useQuery({
    queryKey: ["CoachList"],
    queryFn: async () => {
      let { data } = await userService.getCoach({
        Key: "",
        GroupIDs: [],
        Status: [0, 1],
        Levels: [],
        StockIDs: StockID ? [StockID] : [],
        GroupTitle: window.GlobalConfig.Admin.ten_nhom_hlv,
        Pi: 1,
        Ps: 1000,
      });
      return data?.Items && data?.Items.length > 0
        ? data?.Items.map((x) => ({
            label: x.FullName,
            value: x.ID,
          }))
        : [];
    },
  });

  return (
    <SelectPicker
      placeholder="Chọn huấn luyện viên"
      value={value}
      options={data || []}
      label="Huấn luyện viên"
      onChange={onChange}
      isClearable
    />
  );
};

function FormScheduleClass(props) {
  let [visible, setVisible] = useState(false);
  let [visibleCard, setVisibleCard] = useState(false);
  let [isOpen, setIsOpen] = useState(false);

  let [initialValues, setInitialValues] = useState({
    StockID: localStorage.getItem("CurrentStockID")
      ? {
          label: localStorage.getItem("CurrentStockName"),
          value: localStorage.getItem("CurrentStockID"),
        }
      : null,
    ProdIDs: null,
    Date: null,
    Class: null,
    Books: null,
    Events: [],
    EventsList: [],
    Key: null,
    UserRequest: null,
    _v: 1,
  });

  let Stocks = useQuery({
    queryKey: ["ListStockOs"],
    queryFn: async () => {
      let { data } = await userService.getStock();
      let StocksNotBook = window?.GlobalConfig?.StocksNotBook || "";
      return data?.data?.all
        ? data.data.all
            .filter((o) => o.ID !== 778 && !StocksNotBook.includes(o.ID))
            .map((o) => ({
              ...o,
              label: o.Title,
              value: o.ID,
            }))
        : [];
    },
    onSuccess: (rs) => {
      if (rs && window.GlobalConfig?.Stocksclassactive) {
        let index = rs.findIndex(
          (x) => x.ID === Number(window.GlobalConfig?.Stocksclassactive)
        );
        if (index > -1) {
          setInitialValues((prevState) => ({
            ...prevState,
            StockID: {
              label: rs[index].Title,
              value: rs[index].ID,
            },
          }));
        }
      }
    },
  });

  const onSubmit = async (values, { setFieldValue }) => {
    const member = getUser();
    if (!values.StockID) {
      toast.error("Vui lòng chọn cơ sở");
    } else if (!values.ProdIDs) {
      toast.error("Vui lòng chọn thẻ liệu trình");
    } else if (!values.Date) {
      toast.error("Vui lòng chọn thời gian");
    } else if (!values.Books) {
      toast.error("Vui lòng chọn lớp học");
    } else {
      f7.dialog.preloader("Đang đặt lịch ...");

      let { Books, ProdIDs, StockID, Date, UserRequest } = values;

      if (UserRequest && Books.Class.MemberTotal === 1) {
        let rsCoachs = await userService.getSheduleOsList({
          StockID: [StockID?.value],
          ClassIDs: [],
          ProdIDs: [],
          TeachIDs: [],
          MemberIDs: [],
          From: null,
          To: null,
          Pi: 1,
          Ps: 1000,
          BeginFrom: moment(Date)
            .set({
              hour: "00",
              minute: "00",
              second: "00",
            })
            .format("YYYY-MM-DD HH:mm:ss"),
          BeginTo: moment(Date)
            .set({
              hour: "23",
              minute: "59",
              second: "59",
            })
            .format("YYYY-MM-DD HH:mm:ss"),
        });
        if (rsCoachs.data.Items && rsCoachs.data.Items.length > 0) {
          let index = rsCoachs.data.Items.findIndex(
            (x) =>
              moment(x.TimeBegin, "YYYY-MM-DD HH:mm").format(
                "DD-MM-YYYY HH:mm"
              ) ===
                moment(Books?.DateFrom)
                  .set({
                    hour: moment(Books?.TimeFrom, "HH:mm").get("hour"),
                    minute: moment(Books?.TimeFrom, "HH:mm").get("minute"),
                    second: moment(Books?.TimeFrom, "HH:mm").get("second"),
                  })
                  .format("DD-MM-YYYY HH:mm") &&
              x.TeacherID === UserRequest?.value
          );
          if (index > -1) {
            f7.dialog.close()
            f7.dialog.alert(
              `Bạn không thể chọn huấn luyện viên ${
                UserRequest?.label
              } lúc ${moment(Books?.DateFrom)
                .set({
                  hour: moment(Books?.TimeFrom, "HH:mm").get("hour"),
                  minute: moment(Books?.TimeFrom, "HH:mm").get("minute"),
                  second: moment(Books?.TimeFrom, "HH:mm").get("second"),
                })
                .format(
                  "HH:mm DD-MM-YYYY"
                )} vì lý do huấn luyện viên không trống lịch khung giờ này. Vui lòng thay đổi khung giờ hoặc huấn luyện viên.`
            );
            return;
          }
        }
      }

      let rs = await userService.getSheduleOsList({
        StockID: [StockID?.value],
        ClassIDs: [Books?.Class?.ID],
        ProdIDs: [ProdIDs?.ProdID],
        TeachIDs: [],
        MemberIDs: [],
        From: null,
        To: null,
        Pi: 1,
        Ps: 1000,
        BeginFrom: moment(Date)
          .set({
            hour: "00",
            minute: "00",
            second: "00",
          })
          .format("YYYY-MM-DD HH:mm:ss"),
        BeginTo: moment(Date)
          .set({
            hour: "23",
            minute: "59",
            second: "59",
          })
          .format("YYYY-MM-DD HH:mm:ss"),
      });

      let index = rs?.data?.Items.findIndex((x) => {
        return (
          Books?.Class?.ID === x?.Class?.ID &&
          moment(Date)
            .set({
              hour: moment(Books.TimeFrom, "HH:mm").get("hour"),
              minute: moment(Books.TimeFrom, "HH:mm").get("minute"),
              second: moment(Books.TimeFrom, "HH:mm").get("second"),
            })
            .format("DD-MM-YYYY HH:mm") ===
            moment(x.TimeBegin).format("DD-MM-YYYY HH:mm")
        );
      });

      if (index === -1) {
        let newValues = {
          ID: 0,
          StockID: StockID?.value,
          TimeBegin: Books?.DateFrom
            ? moment(Books?.DateFrom)
                .set({
                  hour: moment(Books?.TimeFrom, "HH:mm").get("hour"),
                  minute: moment(Books?.TimeFrom, "HH:mm").get("minute"),
                  second: moment(Books?.TimeFrom, "HH:mm").get("second"),
                })
                .format("YYYY-MM-DD HH:mm:ss")
            : null,
          OrderServiceClassID: Books?.Class?.ID,
          TeacherID: "",
          Member: {
            Lists: [
              {
                Member: {
                  MemberID: member?.ID,
                  FullName: member?.FullName,
                  ID: member?.ID,
                  Phone: member?.MobilePhone,
                },
                Os: {
                  OsID: ProdIDs?.OS?.ID,
                  ID: ProdIDs?.OS?.ID,
                  Title: ProdIDs?.OS?.Title,
                },
                Status: "",
              },
            ],
            Status: "",
          },
          MemberID: 0,
          Desc: "",
        };

        if (values.UserRequest) {
          newValues.Member["UserRequest"] = {
            ID: values.UserRequest?.value,
            FullName: values.UserRequest?.label,
          };
        }

        let { data } = await userService.addEditSheduleOs(
          { arr: [newValues] },
          member?.token
        );
        if (data.Inserted && data.Inserted.length > 0) {
          await userService.addEditSheduleUpdateOs(
            {
              arr: [
                {
                  ID: ProdIDs?.OS?.ID,
                  Desc: "(Đã xếp lớp)",
                  UserID: 0,
                },
              ],
            },
            member?.token
          );
          await BookDataService.bookContact({
            contact: {
              Fullname: member.FullName,
              Phone1: member.MobilePhone,
              Address: "",
              Email: "",
              Content: `${member.FullName} / ${
                member.MobilePhone
              }  đăng ký học lớp${Books.Class.Title} ${UserRequest ? ` với huấn luyện viên ${UserRequest?.label}` : ""} tại cơ sở ${
                StockID.label
              } ngày ${moment(Books.DateFrom).format("DD-MM-YYYY")} lúc ${
                Books.TimeFrom
              } - Dịch vụ thẻ ${ProdIDs?.OS?.Title}`,
            },
          });
          let { data: dataOs } = await userService.getSheduleOsMin({
            MemberIDs: [member?.ID],
            ProdIDs: [],
            Date: null,
          });

          let index = dataOs?.lst?.findIndex(
            (x) => x.ProdID === ProdIDs.ProdID
          );

          f7.dialog.close();

          f7.dialog
            .create({
              title: "Đặt lịch thành công",
              text: `Bạn đã đặt lịch tại lớp ${
                Books?.Class?.Title
              } lúc ${moment(Books?.DateFrom)
                .set({
                  hour: moment(Books?.TimeFrom, "HH:mm").get("hour"),
                  minute: moment(Books?.TimeFrom, "HH:mm").get("minute"),
                  second: moment(Books?.TimeFrom, "HH:mm").get("second"),
                })
                .format(
                  "HH:mm DD-MM-YYYY"
                )}${UserRequest ? ` với huấn luyện viên ${UserRequest?.label}` : ""} thành công. Bạn có muốn đặt lịch tiếp không ?`,
              buttons: [
                {
                  text: "Không",
                  close: true,
                  onClick: () => {
                    toast.success("Đặt lịch học thành công.");
                    f7.views.main.router.navigate("/");
                  },
                },
                {
                  text: "Đặt lịch tiếp",
                  close: true,
                  onClick: () => {
                    setFieldValue("Date", null);
                    setFieldValue("Events", []);
                    setFieldValue("EventsList", []);
                    setFieldValue("Books", null);
                    setFieldValue("UserRequest", null)

                    if (index > -1) {
                      setFieldValue("ProdIDs", {
                        ...dataOs?.lst[index],
                        value: dataOs?.lst[index].OS.ID,
                        label: dataOs?.lst[index].Prod.Title,
                      });
                      setIsOpen(true);
                    } else {
                      setFieldValue("ProdIDs", null);
                      setVisibleCard(true);
                    }
                  },
                },
              ],
            })
            .open();
        } else {
          toast.success("Xảy ra lỗi. Vui lòng thử lại");
          f7.dialog.close();
        }
      } else {
        let ClassInfo = rs?.data?.Items[index];
        let newLists = [...(ClassInfo.Member.Lists || [])];
        if (
          newLists.length > 0 &&
          newLists.length >= ClassInfo.Class.MemberTotal
        ) {
          toast.error(
            `Lớp ${ClassInfo?.Class?.Title} lúc ${moment(
              ClassInfo.TimeBegin
            ).format(
              "HH:mm DD-MM-YYYY"
            )} đã đầy học viên. Vui lòng chọn khoảng thời gian khác.`
          );
          return;
        }
        newLists.push({
          Member: {
            MemberID: member?.ID,
            FullName: member?.FullName,
            ID: member?.ID,
            Phone: member?.MobilePhone,
          },
          Os: {
            OsID: ProdIDs?.OS?.ID,
            ID: ProdIDs?.OS?.ID,
            Title: ProdIDs?.OS?.Title,
          },
          Status: "",
        });
        let newValues = {
          CreateDate: moment(ClassInfo?.CreateDate).format("YYYY-MM-DD HH:mm"),
          ID: ClassInfo?.ID,
          StockID: ClassInfo?.StockID,
          TimeBegin: moment(ClassInfo?.TimeBegin).format("YYYY-MM-DD HH:mm:ss"),
          OrderServiceClassID: ClassInfo?.OrderServiceClassID,
          TeacherID: ClassInfo.TeacherID,
          Member: {
            ...ClassInfo.Member,
            Lists: newLists,
          },
          MemberID: 0,
          Desc: "",
        };
        let { data } = await userService.addEditSheduleOs(
          { arr: [newValues] },
          member?.token
        );
        if (data.Updated && data.Updated.length > 0) {
          await userService.addEditSheduleUpdateOs(
            {
              arr: [
                {
                  ID: ProdIDs?.OS?.ID,
                  Desc: "(Đã xếp lớp)",
                  UserID: 0,
                },
              ],
            },
            member?.token
          );
          await BookDataService.bookContact({
            contact: {
              Fullname: member.FullName,
              Phone1: member.MobilePhone,
              Address: "",
              Email: "",
              Content: `${member.FullName} / ${
                member.MobilePhone
              }  đăng ký học lớp ${Books.Class.Title} tại cơ sở ${
                StockID.label
              } ngày ${moment(Books.DateFrom).format("DD-MM-YYYY")} lúc ${
                Books.TimeFrom
              } - Dịch vụ thẻ ${ProdIDs?.OS?.Title}`,
            },
          });
          let { data: dataOs } = await userService.getSheduleOsMin({
            MemberIDs: [member?.ID],
            ProdIDs: [],
            Date: null,
          });

          let index = dataOs?.lst?.findIndex(
            (x) => x.ProdID === ProdIDs.ProdID
          );

          f7.dialog.close();

          f7.dialog
            .create({
              title: "Đặt lịch thành công",
              text: `Bạn đã đặt lịch tại lớp ${
                Books?.Class?.Title
              } lúc ${moment(Books?.DateFrom)
                .set({
                  hour: moment(Books?.TimeFrom, "HH:mm").get("hour"),
                  minute: moment(Books?.TimeFrom, "HH:mm").get("minute"),
                  second: moment(Books?.TimeFrom, "HH:mm").get("second"),
                })
                .format(
                  "HH:mm DD-MM-YYYY"
                )} thành công. Bạn có muốn đặt lịch tiếp không ?`,
              buttons: [
                {
                  text: "Không",
                  close: true,
                  onClick: () => {
                    toast.success("Đặt lịch học thành công.");
                    f7.views.main.router.navigate("/");
                  },
                },
                {
                  text: "Đặt lịch tiếp",
                  close: true,
                  onClick: () => {
                    setFieldValue("Date", null);
                    setFieldValue("Events", []);
                    setFieldValue("EventsList", []);
                    setFieldValue("Books", null);

                    if (index > -1) {
                      setFieldValue("ProdIDs", {
                        ...dataOs?.lst[index],
                        value: dataOs?.lst[index].OS.ID,
                        label: dataOs?.lst[index].Prod.Title,
                      });
                      setIsOpen(true);
                    } else {
                      setFieldValue("ProdIDs", null);
                      setVisibleCard(true);
                    }
                  },
                },
              ],
            })
            .open();
        } else {
          toast.success("Xảy ra lỗi. Vui lòng thử lại");
          f7.dialog.close();
        }
      }
    }
  };

  const isDisabled = (item) => {
    let TimeStart = moment(item.DateFrom).set({
      hour: moment(item.TimeFrom, "HH:mm").get("hour"),
      minute: moment(item.TimeFrom, "HH:mm").get("minute"),
      second: moment(item.TimeFrom, "HH:mm").get("second"),
    });
    return (
      moment(TimeStart).diff(moment(), "minutes") <
      (window?.GlobalConfig?.Admin?.lop_hoc_pt_phut || 0)
    );
  };

  return (
    <>
      <Formik
        initialValues={initialValues}
        onSubmit={onSubmit}
        enableReinitialize={true}
        //validationSchema={sendSchema}
      >
        {(formikProps) => {
          const {
            values,
            touched,
            errors,
            handleChange,
            handleBlur,
            setFieldValue,
          } = formikProps;

          return (
            <Form
              className="h-100 d-flex"
              style={{
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  flexGrow: "1",
                  overflow: "auto",
                }}
              >
                <div
                  className="bg-white p-15px"
                  style={{
                    borderBottom: "1px solid #f1f1f1",
                  }}
                >
                  <h5
                    style={{
                      fontSize: "15px",
                      margin: 0,
                      textTransform: "uppercase",
                    }}
                  >
                    1. Chọn cơ sở đặt lịch
                  </h5>
                  <div className="mt-15px">
                    <div>
                      {values.StockID ? (
                        <div>
                          Bạn đang đặt lịch tại
                          <span className="pl-6px text-app2 fw-600">
                            {values.StockID?.label}
                          </span>
                        </div>
                      ) : (
                        "Bạn chưa chọn cơ sở đặt lịch."
                      )}

                      <div
                        className="text-primary mt-2px text-underline"
                        onClick={() => setVisible(true)}
                      >
                        {values?.StockID ? "Thay đổi cơ sở ?" : "Chọn cơ sở ?"}
                      </div>
                    </div>
                    <StocksProvincesFilter
                      isOpen={visible}
                      onClose={() => setVisible(false)}
                      Stocks={Stocks?.data || []}
                      onChange={(val) => {
                        setFieldValue("StockID", {
                          label: val?.Title,
                          value: val?.ID,
                        });
                        setFieldValue("Books", null);
                        setFieldValue("Events", null);
                        setFieldValue("EventsList", null);
                        setFieldValue("Key", null);
                        setVisible(false);
                      }}
                      StockActive={values?.StockID?.value || ""}
                    />
                  </div>
                </div>

                <div
                  className="bg-white p-15px"
                  style={{
                    borderBottom: "5px solid #f1f1f1",
                  }}
                >
                  <h5
                    style={{
                      fontSize: "15px",
                      margin: 0,
                      textTransform: "uppercase",
                    }}
                  >
                    2. Chọn thẻ liệu trình
                  </h5>
                  <div className="mt-15px">
                    <div>
                      {values.ProdIDs ? (
                        <div>
                          Bạn đang chọn thẻ
                          <span className="pl-6px text-app2 fw-600">
                            {values.ProdIDs?.label} (Còn{" "}
                            {values?.ProdIDs?.OSList?.length || 0} buổi)
                          </span>
                        </div>
                      ) : (
                        "Bạn chưa chọn thẻ liệu trình."
                      )}

                      <div
                        className="text-primary mt-2px text-underline"
                        onClick={() => {
                          if (!values.StockID) {
                            toast.error("Vui lòng chọn cơ sở trước.");
                          } else {
                            setVisibleCard(true);
                          }
                        }}
                      >
                        {values?.ProdIDs
                          ? "Thay đổi thẻ liệu trình ?"
                          : "Chọn thẻ liệu trình ?"}
                      </div>
                    </div>
                  </div>
                  <PickerServiceCard
                    isOpen={visibleCard}
                    onClose={() => setVisibleCard(false)}
                    onChange={(val) => {
                      setFieldValue("ProdIDs", val);
                      setFieldValue("Events", null);
                      setFieldValue("EventsList", null);
                      setFieldValue("Key", null);
                    }}
                    value={values.ProdIDs?.value || ""}
                    v={values._v}
                    //Date={values.Date}
                    callback={(val) => {
                      if (values._v) {
                        setFieldValue("ProdIDs", val);
                        setFieldValue("Events", null);
                        setFieldValue("EventsList", null);
                        setFieldValue("_v", null);
                      }
                    }}
                  />
                </div>

                <div
                  className="bg-white p-15px"
                  style={{
                    borderBottom: "1px solid #f1f1f1",
                  }}
                >
                  <h5
                    style={{
                      fontSize: "15px",
                      margin: 0,
                      textTransform: "uppercase",
                    }}
                  >
                    3. Chọn thời gian
                  </h5>
                  <div className="mt-15px">
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                        gap: "10px",
                      }}
                    >
                      <div
                        className="fw-500"
                        style={{
                          border:
                            values.Date &&
                            moment().format("DD-MM-YYYY") ===
                              moment(values.Date).format("DD-MM-YYYY")
                              ? "1px solid var(--ezs-color)"
                              : "1px solid #edf2f8",
                          background:
                            values.Date &&
                            moment().format("DD-MM-YYYY") ===
                              moment(values.Date).format("DD-MM-YYYY")
                              ? "#fff"
                              : "#edf2f8",
                          textAlign: "center",
                          height: "38px",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: "3px",
                          color:
                            values.Date &&
                            moment().format("DD-MM-YYYY") ===
                              moment(values.Date).format("DD-MM-YYYY")
                              ? "var(--ezs-color)"
                              : "#718096",
                          fontSize: "13px",
                        }}
                        onClick={() => {
                          setFieldValue("Date", new Date());
                          setFieldValue("Books", null);
                          setFieldValue("Events", null);
                          setFieldValue("EventsList", null);
                          setFieldValue("Key", "");
                          setFieldValue("UserRequest", null);
                        }}
                      >
                        Hôm nay {moment().format("DD-MM")}
                      </div>
                      <div
                        className="fw-500"
                        style={{
                          border:
                            values.Date &&
                            moment().add(1, "days").format("DD-MM-YYYY") ===
                              moment(values.Date).format("DD-MM-YYYY")
                              ? "1px solid var(--ezs-color)"
                              : "1px solid #edf2f8",
                          background:
                            values.Date &&
                            moment().add(1, "days").format("DD-MM-YYYY") ===
                              moment(values.Date).format("DD-MM-YYYY")
                              ? "#fff"
                              : "#edf2f8",
                          textAlign: "center",
                          height: "38px",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: "3px",
                          color:
                            values.Date &&
                            moment().add(1, "days").format("DD-MM-YYYY") ===
                              moment(values.Date).format("DD-MM-YYYY")
                              ? "var(--ezs-color)"
                              : "#718096",
                          fontSize: "13px",
                        }}
                        onClick={() => {
                          setFieldValue(
                            "Date",
                            moment().add(1, "days").toDate()
                          );
                          setFieldValue("Books", null);
                          setFieldValue("Events", null);
                          setFieldValue("EventsList", null);
                          setFieldValue("Key", null);
                          setFieldValue("UserRequest", null);
                        }}
                      >
                        Ngày mai {moment().add(1, "days").format("DD-MM")}
                      </div>
                      <div
                        className="fw-500"
                        style={{
                          border:
                            values.Date &&
                            moment().add(1, "days").format("DD-MM-YYYY") !==
                              moment(values.Date).format("DD-MM-YYYY") &&
                            moment().format("DD-MM-YYYY") !==
                              moment(values.Date).format("DD-MM-YYYY")
                              ? "1px solid var(--ezs-color)"
                              : "1px solid #edf2f8",
                          background:
                            values.Date &&
                            moment().add(1, "days").format("DD-MM-YYYY") !==
                              moment(values.Date).format("DD-MM-YYYY") &&
                            moment().format("DD-MM-YYYY") !==
                              moment(values.Date).format("DD-MM-YYYY")
                              ? "#fff"
                              : "#edf2f8",
                          textAlign: "center",
                          height: "38px",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: "3px",
                          color:
                            values.Date &&
                            moment().add(1, "days").format("DD-MM-YYYY") !==
                              moment(values.Date).format("DD-MM-YYYY") &&
                            moment().format("DD-MM-YYYY") !==
                              moment(values.Date).format("DD-MM-YYYY")
                              ? "var(--ezs-color)"
                              : "#718096",
                          fontSize: "13px",
                        }}
                        onClick={() => setIsOpen(true)}
                      >
                        {values.Date &&
                        moment().add(1, "days").format("DD-MM-YYYY") !==
                          moment(values.Date).format("DD-MM-YYYY") &&
                        moment().format("DD-MM-YYYY") !==
                          moment(values.Date).format("DD-MM-YYYY")
                          ? moment(values.Date).format("DD-MM-YYYY")
                          : "Ngày khác"}
                      </div>
                    </div>
                    <DatePicker
                      theme="ios"
                      cancelText="Đóng"
                      confirmText="Chọn"
                      headerFormat="Ngày DD/MM/YYYY"
                      showCaption={true}
                      dateConfig={dateConfig}
                      value={values.Date ? new Date(values.Date) : new Date()}
                      isOpen={isOpen}
                      onSelect={(val) => {
                        setFieldValue("Date", val);
                        setFieldValue("Books", null);
                        setFieldValue("Events", null);
                        setFieldValue("EventsList", null);
                        setFieldValue("Key", null);
                        setIsOpen(false);
                        setFieldValue("UserRequest", null);
                      }}
                      onCancel={() => setIsOpen(false)}
                      min={moment().subtract(1, "days").toDate()}
                    />
                  </div>
                </div>

                <div
                  className="bg-white p-15px"
                  style={{
                    borderBottom: "1px solid #f1f1f1",
                  }}
                >
                  <h5
                    style={{
                      fontSize: "15px",
                      margin: 0,
                      textTransform: "uppercase",
                    }}
                  >
                    4. Chọn lớp học
                  </h5>
                  <div className="mt-15px">
                    {values.Date && values.StockID && values.ProdIDs && (
                      <div className="mb-15px position-relative">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          stroke="currentColor"
                          style={{
                            width: "20px",
                            position: "absolute",
                            color: "#bcbcbc",
                            top: "50%",
                            left: "12px",
                            transform: "translateY(-50%)",
                            pointerEvents: "none",
                          }}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                          />
                        </svg>

                        <input
                          style={{
                            width: "100%",
                            height: "45px",
                            border: "1px solid #e4e4e4",
                            borderRadius: "4px",
                            padding: "0 15px 0 42px",
                            position: "relative",
                          }}
                          type="text"
                          value={values.Key || ""}
                          placeholder="Nhập tên lớp ?"
                          onChange={(e) => setFieldValue("Key", e.target.value)}
                        />
                        {values.Key && (
                          <div
                            style={{
                              position: "absolute",
                              width: "45px",
                              height: "100%",
                              top: "0",
                              right: "0",
                              display: "flex",
                              justifyContent: "center",
                              color: "#222222",
                            }}
                            onClick={(e) => setFieldValue("Key", "")}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth="1.5"
                              stroke="currentColor"
                              style={{
                                width: "22px",
                              }}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6 18 18 6M6 6l12 12"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                    )}
                    {values.Events && values.Events.length > 0 && (
                      <>
                        {values.Events.map((item, index) => (
                          <div
                            className="bg-white shadow rounded mb-15px last-mb-0"
                            style={{
                              border:
                                values?.Class?.Class?.ID === item.Class?.ID
                                  ? "1px solid var(--ezs-color)"
                                  : "1px solid #F3F6F9",
                              overflow: "hidden",
                            }}
                            key={index}
                            onClick={() => {
                              setFieldValue("Class", item);
                              //setFieldValue("UserRequest", null);
                            }}
                          >
                            <div
                              className={clsx(
                                "pl-15px py-12px fw-500 position-relative",
                                values?.Class?.Class?.ID === item.Class?.ID
                                  ? "text-white"
                                  : "text-primary"
                              )}
                              style={{
                                background:
                                  values?.Class?.Class?.ID === item.Class?.ID
                                    ? "var(--ezs-color)"
                                    : "#f3f3f3",
                                paddingRight: "45px",
                              }}
                            >
                              <div>{item.Class.Title}</div>
                              {values?.Class?.Class?.ID === item.Class?.ID && (
                                <div
                                  style={{
                                    position: "absolute",
                                    right: "15px",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                  }}
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth="1.5"
                                    stroke="currentColor"
                                    className="w-20px"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="m4.5 12.75 6 6 9-13.5"
                                    />
                                  </svg>
                                </div>
                              )}
                            </div>
                            {values?.Class?.Class?.ID === item.Class?.ID && (
                              <div
                                style={{
                                  padding: "12px",
                                  display: "grid",
                                  gridTemplateColumns:
                                    "repeat(3, minmax(0, 1fr))",
                                  gap: "12px",
                                }}
                              >
                                {item.Items.map((sub, i) => (
                                  <div
                                    className="fw-500 flex"
                                    style={{
                                      border:
                                        values?.Books?.Class?.ID ===
                                          item.Class?.ID &&
                                        values?.Books?.TimeFrom === sub.TimeFrom
                                          ? "1px solid var(--ezs-color)"
                                          : "1px solid #edf2f8",
                                      background:
                                        values?.Books?.Class?.ID ===
                                          sub?.Class?.ID &&
                                        values?.Books?.TimeFrom === sub.TimeFrom
                                          ? "#fff"
                                          : "#edf2f8",
                                      textAlign: "center",
                                      height: "42px",
                                      display: "flex",
                                      // alignItems: "center",
                                      justifyContent: "center",
                                      borderRadius: "3px",
                                      color:
                                        values?.Books?.Class?.ID ===
                                          sub?.Class?.ID &&
                                        values?.Books?.TimeFrom === sub.TimeFrom
                                          ? "var(--ezs-color)"
                                          : "#718096",
                                      fontSize: "13px",
                                      flexDirection: "column",
                                      opacity:
                                        ((sub?.ClassInfo?.Member?.Lists
                                          ?.length > 0 &&
                                          sub?.ClassInfo?.Member?.Lists
                                            ?.length ===
                                            item.Class.MemberTotal) ||
                                          isDisabled(sub)) &&
                                        ".6",
                                    }}
                                    key={i}
                                    onClick={(e) => {
                                      e.stopPropagation();

                                      if (
                                        sub?.ClassInfo?.Member?.Lists?.length >
                                          0 &&
                                        sub?.ClassInfo?.Member?.Lists
                                          ?.length === item.Class.MemberTotal
                                      )
                                        return;

                                      if (isDisabled(sub)) {
                                        toast.error(
                                          "Đã sát giờ học, vui lòng liên hệ cơ sở để được hỗ trợ."
                                        );
                                        return;
                                      }
                                      if (
                                        values?.Books?.Class?.ID ===
                                          sub?.Class?.ID &&
                                        values?.Books?.TimeFrom === sub.TimeFrom
                                      ) {
                                        setFieldValue("Books", null);
                                      } else {
                                        setFieldValue("Books", sub);
                                      }
                                    }}
                                  >
                                    <div>
                                      {moment()
                                        .set({
                                          hour: moment(
                                            sub.TimeFrom,
                                            "HH:mm"
                                          ).get("hour"),
                                          minute: moment(
                                            sub.TimeFrom,
                                            "HH:mm"
                                          ).get("minute"),
                                        })
                                        .format("HH:mm")}
                                      <span className="px-2px">-</span>
                                      {moment()
                                        .set({
                                          hour: moment(
                                            sub.TimeFrom,
                                            "HH:mm"
                                          ).get("hour"),
                                          minute: moment(
                                            sub.TimeFrom,
                                            "HH:mm"
                                          ).get("minute"),
                                        })
                                        .add(sub?.Class?.Minutes, "minute")
                                        .format("HH:mm")}
                                    </div>
                                    {sub?.ClassInfo?.Member?.Lists?.length >
                                      0 && (
                                      <div
                                        style={{
                                          lineHeight: "12px",
                                        }}
                                      >
                                        (
                                        {sub?.ClassInfo?.Member?.Lists
                                          ?.length || 0}
                                        <span>/</span>
                                        {item.Class.MemberTotal})
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}

                            {values?.Class?.Class?.ID === item.Class?.ID &&
                              item.Class?.MemberTotal === 1 && (
                                <div className="px-12px pb-12px">
                                  <div className="mb-5px">Huấn luyện viên</div>
                                  <CoachSelect
                                    StockID={values?.StockID?.value || ""}
                                    onChange={(val) => {
                                      setFieldValue("UserRequest", val);
                                    }}
                                    value={values.UserRequest}
                                  />
                                </div>
                              )}
                          </div>
                        ))}
                      </>
                    )}
                    {(!values.Events || values.Events.length === 0) && (
                      <div>
                        Chưa tìm thấy lớp học phù hợp. Vui lòng thay đổi từ
                        khoá, ngày hoặc thẻ liệu trình.
                      </div>
                    )}
                  </div>
                </div>
                <SubmitListener formik={formikProps} />
              </div>
              <div>
                <button
                  className={clsx(
                    "btn-submit-order btn-submit-order",
                    1 === 2 && "loading btn-no-click"
                  )}
                  type="submit"
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
            </Form>
          );
        }}
      </Formik>
      {isOpen &&
        createPortal(
          <div
            style={{
              position: "fixed",
              width: "100%",
              height: "100%",
              top: "0",
              left: "0",
              background: "rgb(0 0 0 / 40%)",
              zIndex: "10000",
            }}
            onClick={() => setIsOpen(false)}
          ></div>,
          document.getElementById("framework7-root")
        )}
    </>
  );
}

export default FormScheduleClass;
