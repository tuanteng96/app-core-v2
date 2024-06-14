import { Link, Navbar, Page, Toolbar } from "framework7-react";
import React from "react";
import { GrCheckmark } from "react-icons/gr";
import ToolBarBottom from "../../components/ToolBarBottom";

export default class extends React.Component {
  constructor() {
    super();
    this.state = {};
  }

  render() {
    return (
      <Page>
        <Navbar className="navbar-no-line">
          <div className="page-navbar">
            <div className="page-navbar__back">
              <Link onClick={() => this.$f7router.navigate(`/`)}>
                <i className="las la-angle-left"></i>
              </Link>
            </div>
            <div className="page-navbar__title">
              <span className="title">Xác nhận đặt lịch thành công.</span>
            </div>
          </div>
        </Navbar>
        <div className="page-schedule__success">
          <GrCheckmark />
          <h4>Lịch hẹn đang chờ xử lý</h4>
          <div className="desc">
            <span>Chúc mừng bạn đã đặt lịch thành công.</span>
            <span>
              Vui lòng chờ đợi. Chúng tôi sẽ phản hồi thông tin sớm nhất.
            </span>
          </div>
        </div>
        <Toolbar tabbar position="bottom">
          <ToolBarBottom />
        </Toolbar>
      </Page>
    );
  }
}
