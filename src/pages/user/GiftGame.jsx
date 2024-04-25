import React from "react";
import { Page, Link, Navbar } from "framework7-react";
import { IframeGift } from "./components";

export default class extends React.Component {
  constructor() {
    super();
    this.state = {};
  }
  componentDidMount() {
  }

  render() {
    return (
      <Page name="wheel" noToolbar>
        <Navbar>
          <div className="page-navbar">
            <div className="page-navbar__back">
              <Link onClick={() => this.$f7router.back("/", { force: true })}>
                <i className="las la-angle-left"></i>
              </Link>
            </div>
            <div className="page-navbar__title">
              <span className="title">Hộp quà may mắn</span>
            </div>
          </div>
        </Navbar>

        <div className="h-100">
          <IframeGift f7={this.$f7} params={this.$f7route.params}/>
        </div>
      </Page>
    );
  }
}
