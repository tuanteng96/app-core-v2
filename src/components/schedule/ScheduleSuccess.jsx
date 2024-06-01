import { Link } from "framework7-react";
import React from "react";
import { GrCheckmark } from "react-icons/gr";

export default class ScheduleSuccess extends React.Component {
  constructor() {
    super();
  }

  render() {
    return (
      <div className="page-schedule__success">
        <GrCheckmark />
        <h4>Lịch hẹn đang chờ xử lý</h4>
        <div className="desc">
          <span>Chúc mừng bạn đã đặt lịch thành công.</span>
          <span>Vui lòng chờ đợi. Chúng tôi sẽ phản hồi thông tin sớm nhất.</span>
        </div>
        <Link
          noLinkClass
          className="btn-submit-order"
          href="/manage-schedules/"
        >
          Quản lý đặt lịch
        </Link>
        <Link
          noLinkClass
          className="btn-submit-step"
          onClick={() => this.props.onResetStep()}
        >
          Đặt lịch mới
        </Link>
      </div>
    );
  }
}
