import React, { createRef } from "react";
import { Page, Link, Navbar } from "framework7-react";
import IframeWheel from "./components/IframeWheel";

export default class extends React.Component {
  constructor() {
    super();
    this.state = {};

    this.iframeSpinRef = createRef();
  }
  componentDidMount() {}

  render() {
    return (
      <Page name="wheel" noToolbar>
        <Navbar>
          <div className="page-navbar">
            <div className="page-navbar__back">
              <Link
                onClick={() => {
                  if (this.iframeSpinRef.current) {
                    this.iframeSpinRef.current.onClose();
                  }

                  this.$f7router.back("/");
                }}
              >
                <i className="las la-angle-left"></i>
              </Link>
            </div>
            <div className="page-navbar__title">
              <span className="title">Vòng quay may mắn</span>
            </div>
          </div>
        </Navbar>

        <div className="h-100">
          <IframeWheel
            ref={this.iframeSpinRef}
            f7={this.$f7}
            params={this.$f7route.params}
          />
        </div>
      </Page>
    );
  }
}
