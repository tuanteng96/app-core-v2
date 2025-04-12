import React, { useEffect, useState } from "react";
import userService from "../../service/user.service";
import BookDataService from "../../service/book.service";
import { useQuery } from "react-query";
import { Formik, Form, FieldArray, useFormikContext } from "formik";
import StocksProvincesFilter from "../../components/StocksProvincesFilter";
import { PickerServiceCard } from "./components";
import DatePicker from "react-mobile-datepicker";
import moment from "moment";
import clsx from "clsx";
import { getUser } from "../../constants/user";
import { f7 } from "framework7-react";
import { toast } from "react-toastify";

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

const SubmitListener = ({ item, onUpdate }) => {
  const { values } = useFormikContext();

  useEffect(() => {
    if (item?.Date) {
      (async function () {
        f7.dialog.preloader("Đang kiểm tra ...");
        let CrDate = item?.Date;
        try {
          let filter = {
            ProdIDs: [values?.ProdIDs?.ProdID],
            StockID: [values?.StockID?.value],
            From: null,
            To: null,
            ClassIDs: [],
            TeachIDs: [],
            MemberIDs: [],
            BeginFrom: moment(CrDate)
              .set({
                hour: "00",
                minute: "00",
                second: "00",
              })
              .format("YYYY-MM-DD HH:mm"),
            BeginTo: moment(CrDate)
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
            StockID: [values?.StockID?.value],
            ClassIDs: values?.ProdIDs?.ClassList
              ? values?.ProdIDs?.ClassList.map((x) => x.ID)
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
                      ? moment(CrDate, "e")
                          .startOf("week")
                          .isoWeekday(day.Index)
                          .format("YYYY-MM-DD")
                      : moment(CrDate, "e")
                          .startOf("week")
                          .isoWeekday(day.Index)
                          .add(7, "day")
                          .format("YYYY-MM-DD");

                  if (Date === moment(CrDate).format("YYYY-MM-DD")) {
                    for (let item of day.Items) {
                      let newObj = {
                        Class: clss,
                        Day: day,
                        TimeFrom: item.from,
                        DateFrom:
                          day.Index !== 0
                            ? moment(CrDate, "e")
                                .startOf("week")
                                .isoWeekday(day.Index)
                                .toDate()
                            : moment(CrDate, "e")
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

          if (values.Bookings && values.Bookings.length > 0) {
            let CrBookings = values.Bookings.filter((x) => x.Books && x.Date);
            if (CrBookings && CrBookings.length > 0) {
              Events = Events.map((evt) => {
                let newEvt = { ...evt };
                let TimeCr = moment(evt.DateFrom)
                  .set({
                    hour: moment(evt.TimeFrom, "HH:mm").get("hour"),
                    minute: moment(evt.TimeFrom, "HH:mm").get("minute"),
                    second: moment(evt.TimeFrom, "HH:mm").get("second"),
                  })
                  .format("YYYY-MM-DD HH:mm");

                let index = CrBookings.findIndex((x) => {
                  return (
                    x.Books.Class.ID === evt.Class.ID &&
                    TimeCr ===
                      moment(x.Date)
                        .set({
                          hour: moment(x.Books.TimeFrom, "HH:mm").get("hour"),
                          minute: moment(x.Books.TimeFrom, "HH:mm").get(
                            "minute"
                          ),
                          second: moment(x.Books.TimeFrom, "HH:mm").get(
                            "second"
                          ),
                        })
                        .format("YYYY-MM-DD HH:mm")
                  );
                });

                if (index > -1) {
                  newEvt["disabled"] = true;
                }
                return newEvt;
              });
            }
          }

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

          onUpdate && onUpdate(newEvents);
          //formik.setFieldValue("Events", newEvents);
          f7.dialog.close();
        } catch (e) {
          console.error(e);
        }
      })();
    }
  }, [item?.Date]);
  return null;
};

const RenderOs = ({ item, index, arrayHelpers }) => {
  const { values, setFieldValue } = useFormikContext();
  let [isOpen, setIsOpen] = useState(false);

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
    <div
      className="bg-white p-15px"
      style={{
        borderBottom: "1px solid #f1f1f1",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <h5
          style={{
            fontSize: "15px",
            margin: 0,
            textTransform: "uppercase",
            flex: "1",
            paddingRight: "10px",
          }}
        >
          Buổi {index + 1} - {item?.Os?.OrderTitle}
        </h5>
        <div
          style={{
            width: "30px",
            display: "flex",
            justifyContent: "end",
          }}
          className="text-danger"
          onClick={() => {
            f7.dialog.confirm("Xác nhận xoá buổi đặt lịch này ?", () => {
              arrayHelpers.remove(index);
            });
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            style={{
              width: "20px",
            }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
            />
          </svg>
        </div>
      </div>
      <div className="mt-15px">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(1, minmax(0, 1fr))",
            gap: "10px",
          }}
        >
          <div
            className="fw-500"
            style={{
              border: item.Date
                ? "1px solid var(--ezs-color)"
                : "1px solid #edf2f8",
              background: item.Date ? "#fff" : "#edf2f8",
              textAlign: "center",
              height: "38px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "3px",
              color: item.Date ? "var(--ezs-color)" : "#718096",
              fontSize: "13px",
            }}
            onClick={() => setIsOpen(true)}
          >
            {item.Date ? moment(item.Date).format("DD-MM-YYYY") : "Chọn ngày"}
          </div>
        </div>
        <DatePicker
          theme="ios"
          cancelText="Đóng"
          confirmText="Chọn"
          headerFormat="Ngày DD/MM/YYYY"
          showCaption={true}
          dateConfig={dateConfig}
          value={item.Date ? new Date(item.Date) : new Date()}
          isOpen={isOpen}
          onSelect={(val) => {
            setFieldValue(`Bookings[${index}]Date`, val);
            setFieldValue(`Bookings[${index}]Events`, null);
            setIsOpen(false)
          }}
          onCancel={() => setIsOpen(false)}
          min={moment().subtract(1, "days").toDate()}
        />
      </div>
      <div className="mt-15px">
        {item.Events && item.Events.length > 0 && (
          <>
            {item.Events.map((clss, idx) => (
              <div
                className="bg-white shadow rounded mb-15px last-mb-0"
                style={{
                  border:
                    item?.Books?.Class?.ID === clss.Class?.ID
                      ? "1px solid var(--ezs-color)"
                      : "1px solid #F3F6F9",
                  overflow: "hidden",
                }}
                key={idx}
              >
                <div
                  className="px-15px py-12px border-bottom fw-500 text-primary"
                  style={{
                    background: "#f3f3f3",
                  }}
                >
                  {clss.Class.Title}
                </div>
                <div
                  style={{
                    padding: "12px",
                    display: "grid",
                    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                    gap: "12px",
                  }}
                >
                  {clss.Items.map((sub, i) => (
                    <div
                      className="fw-500 flex"
                      style={{
                        border:
                          item?.Books?.Class?.ID === sub.Class?.ID &&
                          item?.Books?.TimeFrom === sub.TimeFrom
                            ? "1px solid var(--ezs-color)"
                            : "1px solid #edf2f8",
                        background:
                          item?.Books?.Class?.ID === sub?.Class?.ID &&
                          item?.Books?.TimeFrom === sub.TimeFrom
                            ? "#fff"
                            : "#edf2f8",
                        textAlign: "center",
                        height: "42px",
                        display: "flex",
                        // alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "3px",
                        color:
                          item?.Books?.Class?.ID === sub?.Class?.ID &&
                          item?.Books?.TimeFrom === sub.TimeFrom
                            ? "var(--ezs-color)"
                            : "#718096",
                        fontSize: "13px",
                        flexDirection: "column",
                        opacity:
                          ((sub?.ClassInfo?.Member?.Lists?.length > 0 &&
                            sub?.ClassInfo?.Member?.Lists?.length ===
                              item.Class.MemberTotal) ||
                            isDisabled(sub) ||
                            sub?.disabled) &&
                          ".6",
                      }}
                      key={i}
                      onClick={() => {
                        if (
                          sub?.ClassInfo?.Member?.Lists?.length > 0 &&
                          sub?.ClassInfo?.Member?.Lists?.length ===
                            item.Class.MemberTotal
                        )
                          return;

                        if (sub?.disabled) {
                          toast.error("Bạn đã chọn lịch khung giờ này.");
                          return;
                        }

                        if (isDisabled(sub)) {
                          toast.error(
                            "Đã sát giờ học, vui lòng liên hệ cơ sở để được hỗ trợ."
                          );
                          return;
                        }
                        if (
                          item?.Books?.Class?.ID === sub?.Class?.ID &&
                          item?.Books?.TimeFrom === sub.TimeFrom
                        ) {
                          setFieldValue(`Bookings[${index}]Books`, null);
                        } else {
                          setFieldValue(`Bookings[${index}]Books`, sub);
                        }
                      }}
                    >
                      <div>
                        {moment()
                          .set({
                            hour: moment(sub.TimeFrom, "HH:mm").get("hour"),
                            minute: moment(sub.TimeFrom, "HH:mm").get("minute"),
                          })
                          .format("HH:mm")}
                        <span className="px-2px">-</span>
                        {moment()
                          .set({
                            hour: moment(sub.TimeFrom, "HH:mm").get("hour"),
                            minute: moment(sub.TimeFrom, "HH:mm").get("minute"),
                          })
                          .add(sub?.Class?.Minutes, "minute")
                          .format("HH:mm")}
                      </div>
                      {sub?.ClassInfo?.Member?.Lists?.length > 0 && (
                        <div
                          style={{
                            lineHeight: "12px",
                          }}
                        >
                          ({sub?.ClassInfo?.Member?.Lists?.length || 0}
                          <span>/</span>
                          {item.Class.MemberTotal})
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}
        {(!item.Events || item.Events.length === 0) && (
          <div>
            Chưa tìm thấy lớp học phù hợp. Vui lòng thay đổi ngày hoặc thẻ liệu
            trình.
          </div>
        )}
      </div>
      <SubmitListener
        item={item}
        onUpdate={(val) =>
          setFieldValue(`Bookings[${index}]Events`, val || null)
        }
      />
    </div>
  );
};

function FormScheduleClass(props) {
  let [visible, setVisible] = useState(false);
  let [visibleCard, setVisibleCard] = useState(false);

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
    Bookings: null,
    Events: [],
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
  });

  const onSubmit = async (values) => {
    if (!values.StockID) {
      toast.error("Vui lòng chọn cơ sở");
    } else if (!values.Date) {
      toast.error("Vui lòng chọn thời gian");
    } else if (!values.ProdIDs) {
      toast.error("Vui lòng chọn thẻ liệu trình");
    } else if (!values.Books) {
      toast.error("Vui lòng chọn lớp học");
    } else {
      f7.dialog.preloader("Đang đặt lịch ...");
      let { Books, ProdIDs, StockID } = values;
      let member = getUser();
      if (!values.ClassInfo) {
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
              }  đăng ký học lớp ${Books.Class.Title} tại cơ sở ${
                StockID.label
              } ngày ${moment(Books.DateFrom).format("DD-MM-YYYY")} lúc ${
                Books.TimeFrom
              } - Dịch vụ thẻ ${ProdIDs?.OS?.Title}`,
            },
          });
          toast.success("Đặt lịch học thành công.");
          f7.views.main.router.navigate("/");
        } else {
          toast.success("Xảy ra lỗi. Vui lòng thử lại");
        }
        f7.dialog.close();
      } else {
        let { ClassInfo } = values;
        let newLists = [...ClassInfo.Member.Lists];
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
              }  đăng ký học lớp ${Books.Class.Title} tại cơ sở ${
                StockID.label
              } ngày ${moment(Books.DateFrom).format("DD-MM-YYYY")} lúc ${
                Books.TimeFrom
              } - Dịch vụ thẻ ${ProdIDs?.OS?.Title}`,
            },
          });
          toast.success("Đặt lịch học thành công.");
          f7.views.main.router.navigate("/");
        } else {
          toast.success("Xảy ra lỗi. Vui lòng thử lại");
        }
        f7.dialog.close();
      }
    }
  };

  return (
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
                    if (val.OSList && val.OSList.length > 0) {
                      setFieldValue("Bookings", [
                        {
                          Os: val,
                          Books: null,
                          Date: null,
                          Events: null,
                        },
                      ]);
                    }
                    setFieldValue("Events", null);
                  }}
                  value={values.ProdIDs?.value || ""}
                  //Date={values.Date}
                  callback={(val) => {
                    setFieldValue("ProdIDs", val);
                    if (val.OSList && val.OSList.length > 0) {
                      setFieldValue("Bookings", [
                        {
                          Os: val.OSList[0],
                          Books: null,
                          Date: null,
                          Events: null,
                        },
                      ]);
                    }
                    setFieldValue("Events", null);
                  }}
                />
              </div>
              <div>
                {
                  <FieldArray
                    name="Bookings"
                    render={(arrayHelpers) => (
                      <>
                        {values.Bookings && values.Bookings.length > 0 && (
                          <>
                            {values.Bookings.map((item, index) => (
                              <div>
                                <RenderOs
                                  item={item}
                                  key={index}
                                  index={index}
                                  arrayHelpers={arrayHelpers}
                                />
                              </div>
                            ))}
                          </>
                        )}
                        {values.ProdIDs?.OSList &&
                          values.ProdIDs?.OSList.length > 0 &&
                          values.ProdIDs?.OSList?.length -
                            values?.Bookings?.length !==
                            0 && (
                            <div className="p-15px">
                              <button
                                className="bg-success py-12px text-white fw-500"
                                type="button"
                                style={{
                                  border: "0",
                                  borderRadius: "30px",
                                  fontSize: "15px",
                                }}
                                onClick={() => {
                                  let newOSList = values.ProdIDs?.OSList.filter(
                                    (x) =>
                                      values?.Bookings &&
                                      values?.Bookings.length > 0
                                        ? values?.Bookings.some(
                                            (o) => o.ID !== x.ID
                                          )
                                        : x
                                  );

                                  if (newOSList && newOSList.length > 0) {
                                    arrayHelpers.push({
                                      Os: newOSList[0],
                                      Books: null,
                                      Date: null,
                                      Events: null,
                                    });
                                  }
                                }}
                              >
                                Đặt thêm buổi (Còn{" "}
                                {values.ProdIDs?.OSList?.length -
                                  values?.Bookings?.length}{" "}
                                buổi)
                              </button>
                            </div>
                          )}
                      </>
                    )}
                  />
                }
              </div>
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
  );
}

export default FormScheduleClass;
