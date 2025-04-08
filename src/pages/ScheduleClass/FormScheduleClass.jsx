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
          console.log(formik.values?.ProdIDs)
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

          Events = Events.filter(
            (x) =>
              !x.ClassInfo ||
              (x.ClassInfo &&
                x?.ClassInfo?.Member?.Lists &&
                x?.ClassInfo?.Member?.Lists.some(
                  (x) => x?.Member?.MemberID !== getUser().ID
                ))
          );
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
          f7.dialog.close();
        } catch (e) {
          console.error(e);
        }
      })();
    }
  }, [formik.values?.Date, formik.values?.ProdIDs, formik.values?.StockID]);
  return null;
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
                  2. Chọn thời gian
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
                        setFieldValue("ProdIDs", null);
                        setFieldValue("Books", null);
                        setFieldValue("Events", null);
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
                        setFieldValue("Date", moment().add(1, "days").toDate());
                        setFieldValue("ProdIDs", null);
                        setFieldValue("Books", null);
                        setFieldValue("Events", null);
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
                      setFieldValue("ProdIDs", null);
                      setFieldValue("Books", null);
                      setFieldValue("Events", null);
                      setIsOpen(false);
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
                  3. Chọn thẻ liệu trình
                </h5>
                <div className="mt-15px">
                  <div>
                    {values.ProdIDs ? (
                      <div>
                        Bạn đang chọn thẻ
                        <span className="pl-6px text-app2 fw-600">
                          {values.ProdIDs?.label}
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
                        } else if (!values.Date) {
                          toast.error("Vui lòng chọn thời gian trước.");
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
                  }}
                  value={values.ProdIDs?.value || ""}
                  Date={values.Date}
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
                  4. Chọn lớp học
                </h5>
                <div className="mt-15px">
                  {values.Events && values.Events.length > 0 && (
                    <>
                      {values.Events.map((item, index) => (
                        <div
                          className="bg-white shadow rounded mb-15px last-mb-0"
                          style={{
                            border:
                              values?.Books?.Class?.ID === item.Class?.ID
                                ? "1px solid var(--ezs-color)"
                                : "1px solid #F3F6F9",
                            overflow: "hidden",
                          }}
                          key={index}
                        >
                          <div
                            className="px-15px py-12px border-bottom fw-500 text-primary"
                            style={{
                              background: "#f3f3f3",
                            }}
                          >
                            {item.Class.Title}
                          </div>
                          <div
                            style={{
                              padding: "12px",
                              display: "grid",
                              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
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
                                  height: "38px",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  borderRadius: "3px",
                                  color:
                                    values?.Books?.Class?.ID ===
                                      sub?.Class?.ID &&
                                    values?.Books?.TimeFrom === sub.TimeFrom
                                      ? "var(--ezs-color)"
                                      : "#718096",
                                  fontSize: "13px",
                                }}
                                key={i}
                                onClick={() => {
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
                                {moment()
                                  .set({
                                    hour: moment(sub.TimeFrom, "HH:mm").get(
                                      "hour"
                                    ),
                                    minute: moment(sub.TimeFrom, "HH:mm").get(
                                      "minute"
                                    ),
                                  })
                                  .format("HH:mm")}
                                <span className="px-2px">-</span>
                                {moment()
                                  .set({
                                    hour: moment(sub.TimeFrom, "HH:mm").get(
                                      "hour"
                                    ),
                                    minute: moment(sub.TimeFrom, "HH:mm").get(
                                      "minute"
                                    ),
                                  })
                                  .add(sub?.Class?.Minutes, "minute")
                                  .format("HH:mm")}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                  {(!values.Events || values.Events.length === 0) && (
                    <div>
                      Chưa tìm thấy lớp học phù hợp. Vui lòng thay đổi ngày hoặc
                      thẻ liệu trình.
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
  );
}

export default FormScheduleClass;
