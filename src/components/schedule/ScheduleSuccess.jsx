import { Link } from "framework7-react";
import React from "react";
import userService from "../../service/user.service";

export default class ScheduleSuccess extends React.Component {
  constructor() {
    super();
    this.state = {
      phone: "",
    };
  }

  componentDidMount() {
    this.getPhone();
  }

  getPhone = () => {
    userService
      .getConfig("Chung.sdt")
      .then((response) => {
        this.setState({
          phone:
            response.data.data &&
            response.data.data.length > 0 &&
            response.data.data[0].Value,
        });
      })
      .catch((err) => console.log(err));
  };

  handleCall = (phone) => {
    CALL_PHONE(phone);
  };

  render() {
    let { phone } = this.state;
    return (
      <div className="page-schedule__success">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="size-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
          />
        </svg>

        <h4>Lịch hẹn đang chờ xử lý</h4>
        <div className="desc">
          {window?.GlobalConfig?.Admin?.text_dat_lich ||
            "Chúc mừng bạn đã đặt lịch thành công. Vui lòng chờ đợi. Chúng tôi sẽ phản hồi thông tin sớm nhất."}
        </div>
        <div
          className="mt-30px d--f fd--c jc--c"
          style={{
            gap: "12px",
          }}
        >
          <Link
            noLinkClass
            className="btn-submit-order w-200px"
            href="/manage-schedules/"
          >
            Quản lý đặt lịch
          </Link>
          <Link
            style={{
              padding: "0 15px",
              gap: "8px",
              height: "44px",
              lineHeight: "44px",
            }}
            noLinkClass
            className="btn-submit-step w-200px mt-0 d--f ai--c jc--c"
            onClick={() => this.handleCall(phone && phone)}
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
                d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z"
              />
            </svg>
            Liên hệ Hottline
          </Link>
          {/* <Link
            style={{
              padding: "0 15px",
              height: "44px",
              lineHeight: "44px",
            }}
            noLinkClass
            className="btn-submit-step mt-0"
            onClick={() => this.props.onResetStep()}
          >
            Đặt lịch mới
          </Link> */}
        </div>
      </div>
    );
  }
}
