import React from "react";
import { Page, Link, Navbar, f7 } from "framework7-react";
import { toAbsoluteUrl } from "../../constants/assetPath";
import staffService from "../../service/staff.service";

export default class extends React.Component {
  constructor() {
    super();
    this.state = {
      ID: "",
    };
  }

  componentDidMount() {}

  onSubmit = () => {
    staffService.getList(this.state.ID).then(({ data }) => {
      if (data?.data && data?.data.length > 0) {
        let index = data?.data.findIndex(
          (x) =>
            x.ID === Number(this.state.ID) || x.MobilePhone === this.state.ID
        );
        if (index > -1) {
          let obj = {
            TranOTP: {
              MemberID: data?.data[index].ID,
              IsNoti: true,
              IsZALOZNS: false,
              IsSMS: false,
            },
          };
          staffService.sendOTPAdmin(obj).then((rs) => {
            if (rs?.data?.error) {
              f7.dialog.close();
              f7.dialog.alert(rs?.data?.error);
            } else {
              f7.dialog.close();
              f7.dialog.alert(
                `Mã OTP của khách hàng ${data?.data[index].FullName} là ${rs?.data?.result?.SecureCode}`,
                () => {
                  this.setState({ ID: "" });
                }
              );
            }
          });
        } else {
          f7.dialog.close();
          f7.dialog.alert("Không tìm thấy khách hàng.");
        }
      } else {
        f7.dialog.close();
        f7.dialog.alert("Không tìm thấy khách hàng.");
      }
    });
  };

  render() {
    return (
      <Page name="maps" noToolbar>
        <Navbar>
          <div className="page-navbar">
            <div className="page-navbar__back">
              <Link onClick={() => this.$f7router.back()}>
                <i className="las la-angle-left"></i>
              </Link>
            </div>
            <div className="page-navbar__title">
              <span className="title">OTP khách hàng</span>
            </div>
          </div>
        </Navbar>
        <div className="page-wrapper page-maps">
          <div className="h-100 bg-white d--f fd--c jc--sb">
            {/* <div className="position-relative">
              <img
                src={toAbsoluteUrl("/app2021/images/map-app.jpg")}
                alt="Maps"
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="var(--ezs-color)"
                style={{
                  width: "60px",
                  position: "absolute",
                  top: "40%",
                  left: "50%",
                  transform: "translateX(-50%) translateY(-50%)",
                }}
              >
                <path
                  fillRule="evenodd"
                  d="m11.54 22.351.07.04.028.016a.76.76 0 0 0 .723 0l.028-.015.071-.041a16.975 16.975 0 0 0 1.144-.742 19.58 19.58 0 0 0 2.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 0 0-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 0 0 2.682 2.282 16.975 16.975 0 0 0 1.145.742ZM12 13.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                  clipRule="evenodd"
                />
              </svg>
              <div
                style={{
                  backgroundImage: "linear-gradient(#fff6ef, #fff)",
                  height: "30px",
                  marginTop: "-2px",
                }}
              ></div>
            </div> */}
            <div className="p-20px">
              <div className="mb-15px">
                <div
                  className="mb-3px"
                  style={{
                    color: "rgb(120, 120, 120)",
                  }}
                >
                  ID hoặc Số điện thoại khách hàng
                </div>
                <input
                  name="OTP"
                  onChange={(e) => this.setState({ ID: e.target.value })}
                  //   onBlur={handleBlur}
                  value={this.state.ID}
                  style={{
                    fontSize: "15px",
                    width: "100%",
                    height: "50px",
                    borderRadius: ".125rem",
                    padding: "0 15px",
                    border: "1px solid #e8e8e8",
                  }}
                  type="text"
                  placeholder="Nhập ID hoặc số điện thoại"
                />
              </div>
              <div>
                <button
                  disabled={!this.state.ID}
                  onClick={this.onSubmit}
                  type="button"
                  className="text-white fw-500"
                  style={{
                    fontSize: "15px",
                    height: "50px",
                    borderRadius: ".125rem",
                    padding: "0 15px",
                    background: "var(--ezs-color)",
                    border: "1px solid var(--ezs-color)",
                    textTransform: "uppercase",
                    opacity: this.state.ID ? "1" : "0.5",
                  }}
                >
                  Thực hiện lấy OTP
                </button>
              </div>
            </div>
          </div>
        </div>
      </Page>
    );
  }
}
