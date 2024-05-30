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
    axios.get(`https://vapi.vnappmob.com/api/province/`).then(({ data }) => {
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
              <span className="title">Cơ sở thuộc thành phố ?</span>
            </div>
          </div>
        </Navbar>
        <div>
          {data &&
            data.map((item, index) => (
              <Link
                href={`/stock-province/${item.province_id}/?province_name=${item.province_name}`}
                noLinkClass
                key={index}
                className="px-15px py-15px border-bottom fw-500 d-block text-black"
              >
                <div
                  style={{
                    fontSize: "15px",
                  }}
                >
                  {item.province_name}
                </div>
              </Link>
            ))}
        </div>
      </Page>
    );
  }
}
