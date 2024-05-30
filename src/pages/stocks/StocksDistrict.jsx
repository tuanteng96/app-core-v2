import React from "react";
import { Page, Link, Navbar } from "framework7-react";

import moment from "moment";
import "moment/locale/vi";
import axios from "axios";
moment.locale("vi");

export default class extends React.Component {
  constructor() {
    super();
    this.state = {
      data: [],
    };
  }
  componentDidMount() {
    axios
      .get(
        `https://vapi.vnappmob.com/api/province/district/${this.$f7route.params.province_id}`
      )
      .then(({ data }) => {
        this.setState({ data: data.results });
      });
  }

  render() {
    let { data } = this.state;
    return (
      <Page noToolbar className="bg-white">
        <Navbar>
          <div className="page-navbar">
            <div className="page-navbar__back">
              <Link onClick={() => this.$f7router.back()}>
                <i className="las la-angle-left"></i>
              </Link>
            </div>
            <div className="page-navbar__title">
              <span className="title">{this.$f7route.query.province_name}</span>
            </div>
          </div>
        </Navbar>
        <div>
          {data &&
            data.map((item, index) => (
              <div key={index}>
                <div
                  className="px-15px py-15px border-bottom fw-500"
                  style={{
                    fontSize: "15px",
                  }}
                >
                  {item.district_name}
                </div>
              </div>
            ))}
        </div>
      </Page>
    );
  }
}
