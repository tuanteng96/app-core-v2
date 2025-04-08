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
import { IoCalendarOutline } from "react-icons/io5";
import FormScheduleClass from "./FormScheduleClass";

export default class extends React.Component {
  constructor() {
    super();
    this.state = {};
  }

  componentDidMount() {}

  

  render() {
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
              <Link back>
                <i className="las la-angle-left"></i>
              </Link>
            </div>
            <div className="page-navbar__title">
              <span className="title">Đặt lịch theo lớp</span>
            </div>
            <div className="page-navbar__noti">
              <Link noLinkClass href="/schedule-os-list/">
                <IoCalendarOutline />
              </Link>
            </div>
          </div>
        </Navbar>
        <FormScheduleClass />
      </Page>
    );
  }
}
