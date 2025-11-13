import React from "react";
import { checkAvt, formatPriceVietnamese } from "../../constants/format";
import { getUser, app_request } from "../../constants/user";
import { Page, Link, Toolbar, f7, Navbar } from "framework7-react";
import ToolBarBottom from "../../components/ToolBarBottom";
import UserService from "../../service/user.service";
import { REMOVE_BADGE, SEND_TOKEN_FIREBASE } from "../../constants/prom21";
import { iOS } from "../../constants/helpers";
import clsx from "clsx";

export default class extends React.Component {
  constructor() {
    super();
    this.state = {
      memberInfo: getUser() || {},
      isLoading: true,
      showPreloader: false,
    };
  }
  componentDidMount() {
    // const username = infoUser.MobilePhone
    //   ? infoUser.MobilePhone
    //   : infoUser.UserName;
    // const password = getPassword();
    UserService.getInfo()
      .then(async ({ data }) => {
        if (data.error) {
          this.$f7router.navigate("/login/");
          SEND_TOKEN_FIREBASE().then(async (response) => {
            if (!response.error && response.Token) {
              const { ID, acc_type } = getUser();
              await UserService.authRemoveFirebase({
                Token: response.Token,
                ID: ID,
                Type: acc_type,
              });
            } else {
              app_request("unsubscribe", "");
            }
            iOS() && REMOVE_BADGE();

            window.hasReport = false;

            let CrDomain = localStorage.getItem("DOMAIN");

            await localStorage.clear();

            if (CrDomain) {
              localStorage.setItem("DOMAIN", CrDomain);
            }
            window.UnSubscribe && window.UnSubscribe();

            await new Promise((resolve) => setTimeout(resolve, 300));
          });
        } else {
          let MemberGroups = await UserService.getMemberGroups({
            cmd: "get",
            "(filter)StockID": data?.ByStockID,
            sort: "[Point] desc",
            Pi: 1,
            Ps: 100,
          });

          let groupTitles = "";

          if (
            MemberGroups?.data?.data?.list &&
            MemberGroups?.data?.data?.list.length > 0
          ) {
            let ToPay = 0;
            if (data?.Present?.cashSum && data?.Present?.cashSum.length > 0) {
              ToPay = Number(data.Present.cashSum[0].Payed || 0);
            }

            if (data.acc_group && Number(data.acc_group) > 0) {
              let newMemberGroups = [
                ...(MemberGroups?.data?.data?.list || []),
              ].sort((a, b) => Number(a.Point) - Number(b.Point));

              let currentGroup = newMemberGroups.find(
                (item) => Number(item.ID) === Number(data.acc_group)
              );

              if (currentGroup) {
                let nextGroup = newMemberGroups.find(
                  (item) => Number(item.Point) > Number(currentGroup.Point)
                );

                if (nextGroup) {
                  groupTitles = `Chi tiêu thêm <span class="text-danger fw-600">${formatPriceVietnamese(
                    nextGroup.Point - ToPay
                  )} <span class="fw-500">đ</span></span> </br> để đạt cấp <span class="fw-500">${
                    nextGroup.Title
                  }</span>.`;
                } else {
                  groupTitles = `Bạn đã đạt cấp <span class="fw-500">${currentGroup.Title}</span>.`;
                }
              }
            }
          }

          this.setState({
            memberInfo: {
              ...data,
              MemberGroupTitles: groupTitles,
            },
            isLoading: false,
          });
        }
      })
      .catch((err) => console.log(err));
  }
  signOut = () => {
    const $$this = this;
    $$this.$f7.dialog.confirm(
      "Bạn muốn đăng xuất khỏi tài khoản ?",
      async () => {
        f7.dialog.preloader(`Đăng xuất ...`);
        SEND_TOKEN_FIREBASE().then(async (response) => {
          if (!response.error && response.Token) {
            const { ID, acc_type } = getUser();
            await UserService.authRemoveFirebase({
              Token: response.Token,
              ID: ID,
              Type: acc_type,
            });
          } else {
            app_request("unsubscribe", "");
          }
          iOS() && REMOVE_BADGE();

          window.hasReport = false;

          let CrDomain = localStorage.getItem("DOMAIN");

          await localStorage.clear();

          if (CrDomain) {
            localStorage.setItem("DOMAIN", CrDomain);
          }

          window.UnSubscribe && window.UnSubscribe();

          await new Promise((resolve) => setTimeout(resolve, 300));
          f7.dialog.close();
          $$this.$f7router.navigate("/", {
            reloadCurrent: true,
          });
        });
      }
    );
  };

  checkMember = (memberInfo) => {
    if (!memberInfo) return "";
    if (memberInfo.acc_type === "M") {
      return memberInfo.acc_group > 0
        ? memberInfo.MemberGroups[0].Title
        : "Thành viên";
    }
    if (memberInfo.ID === 1) {
      return "ADMIN";
    }
    if (memberInfo.acc_type === "U" && memberInfo.GroupTitles.length > 0) {
      return memberInfo.GroupTitles.join(", ");
    }
  };

  loadRefresh(done) {
    setTimeout(() => {
      this.$f7.views.main.router.navigate(this.$f7.views.main.router.url, {
        reloadCurrent: true,
      });
      this.setState({
        showPreloader: true,
      });
      done();
    }, 600);
  }

  render() {
    const { memberInfo, isLoading } = this.state;

    return (
      <Page
        //bgColor="white"
        name="profile-list"
        //noNavbar
        ptr
        infiniteDistance={50}
        infinitePreloader={this.state.showPreloader}
        onPtrRefresh={this.loadRefresh.bind(this)}
      >
        <Navbar>
          <div className="page-navbar">
            <div className="page-navbar__back">
              <Link onClick={() => this.$f7router.back()}>
                <i className="las la-angle-left"></i>
              </Link>
            </div>
            <div className="page-navbar__title">
              <span className="title">{memberInfo?.FullName}</span>
            </div>
            <div className="page-navbar__noti">
              <Link noLinkClass onClick={() => this.signOut()}>
                <i className="las la-sign-out-alt"></i>
              </Link>
            </div>
          </div>
        </Navbar>
        <div className="p-15px">
          <div className="mb-20px">
            <div
              className="bg-white p-15px"
              style={{
                borderRadius: "8px",
              }}
            >
              <Link
                noLinkClass
                href="/detail-profile/"
                className="d--f"
                style={{
                  gap: "12px",
                }}
              >
                <div className="w-50px">
                  <img
                    className="rounded-circle w-100"
                    src={checkAvt(memberInfo && memberInfo.Photo)}
                  />
                </div>
                <div
                  className="d--f jc--sb ai--c"
                  style={{
                    width: "calc(100% - 50px)",
                  }}
                >
                  <div>
                    <div className="fw-500">{memberInfo?.FullName}</div>
                    <div className="text-muted mt-2px">
                      {this.checkMember(memberInfo && memberInfo)}
                    </div>
                  </div>
                  <div
                    className="d--f ai--c"
                    style={{
                      fontSize: "18px",
                      color: "#999",
                    }}
                  >
                    <i className="las la-angle-right"></i>
                  </div>
                </div>
              </Link>
              {memberInfo?.MemberGroupTitles && (
                <Link
                  href="/member-groups/"
                  noLinkClass
                  className="d--f jc--sb ai--c pt-15px mt-8px position-relative text-black"
                >
                  <div
                    className="position-absolute h-1px right-0 top-0"
                    style={{
                      background: "#f0f4f7",
                      width: "calc(100% - 50px)",
                    }}
                  ></div>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: memberInfo.MemberGroupTitles,
                    }}
                  ></div>
                  <div
                    className="d--f ai--c"
                    style={{
                      fontSize: "18px",
                      color: "#999",
                    }}
                  >
                    <i className="las la-angle-right"></i>
                  </div>
                </Link>
              )}
            </div>
            <div
              className="bg-white p-15px mt-8px"
              style={{
                borderRadius: "8px",
              }}
            >
              <Link
                href="/barcode/"
                noLinkClass
                className={clsx(
                  "d--f jc--sb ai--c position-relative text-black",
                  !window?.GlobalConfig?.APP?.isSell &&
                    "border-bottom pb-12px mb-12px"
                )}
              >
                <div>QR định danh</div>
                <div
                  className="d--f ai--c"
                  style={{
                    fontSize: "18px",
                    color: "#999",
                  }}
                >
                  <i className="las la-angle-right"></i>
                </div>
              </Link>
              {!window?.GlobalConfig?.APP?.isSell && (
                <Link
                  href="/rating/"
                  noLinkClass
                  className="d--f jc--sb ai--c position-relative text-black"
                >
                  <div>Đánh giá dịch vụ</div>
                  <div
                    className="d--f ai--c"
                    style={{
                      fontSize: "18px",
                      color: "#999",
                    }}
                  >
                    <i className="las la-angle-right"></i>
                  </div>
                </Link>
              )}
            </div>
          </div>
          <div className="mb-20px">
            <div
              className="mb-5px fw-500"
              style={{
                fontSize: "13px",
                color: "#b3b3b3",
              }}
            >
              Tài khoản
            </div>
            <div
              className="bg-white p-15px mt-8px"
              style={{
                borderRadius: "8px",
              }}
            >
              <Link
                href="/wallet/"
                noLinkClass
                className="d--f jc--sb ai--c position-relative text-black border-bottom pb-12px mb-12px"
              >
                <div>Ví điện tử</div>
                <div
                  className="d--f ai--c"
                  style={{
                    gap: "6px",
                  }}
                >
                  {memberInfo?.Present?.nap_vi > 0 && (
                    <div className="text-danger fw-500">
                      {formatPriceVietnamese(memberInfo?.Present?.nap_vi)}
                    </div>
                  )}

                  <div
                    className="d--f ai--c"
                    style={{
                      fontSize: "18px",
                      color: "#999",
                    }}
                  >
                    <i className="las la-angle-right"></i>
                  </div>
                </div>
              </Link>
              <Link
                href="/wallet/?tab=card"
                noLinkClass
                className="d--f jc--sb ai--c position-relative text-black border-bottom pb-12px mb-12px"
              >
                <div>Thẻ tiền trả trước</div>
                <div
                  className="d--f ai--c"
                  style={{
                    gap: "6px",
                  }}
                >
                  {memberInfo?.Present?.the_tien_kha_dung > 0 && (
                    <div className="text-danger fw-500">
                      {formatPriceVietnamese(
                        memberInfo?.Present?.the_tien_kha_dung
                      )}
                    </div>
                  )}
                  <div
                    className="d--f ai--c"
                    style={{
                      fontSize: "18px",
                      color: "#999",
                    }}
                  >
                    <i className="las la-angle-right"></i>
                  </div>
                </div>
              </Link>
              <Link
                href="/points-change/"
                noLinkClass
                className="d--f jc--sb ai--c position-relative text-black border-bottom pb-12px mb-12px"
              >
                <div>Tích điểm đổi quà</div>
                <div
                  className="d--f ai--c"
                  style={{
                    gap: "6px",
                  }}
                >
                  {memberInfo?.Present?.points > 0 && (
                    <div className="text-danger fw-500">
                      {memberInfo?.Present?.points} điểm
                    </div>
                  )}
                  <div
                    className="d--f ai--c"
                    style={{
                      fontSize: "18px",
                      color: "#999",
                    }}
                  >
                    <i className="las la-angle-right"></i>
                  </div>
                </div>
              </Link>
              <Link
                href="/voucher/"
                noLinkClass
                className="d--f jc--sb ai--c position-relative text-black"
              >
                <div>Mã Voucher ưu đãi</div>
                <div
                  className="d--f ai--c"
                  style={{
                    fontSize: "18px",
                    color: "#999",
                  }}
                >
                  <i className="las la-angle-right"></i>
                </div>
              </Link>
            </div>
          </div>
          <div className="mb-20px">
            <div
              className="mb-5px fw-500"
              style={{
                fontSize: "13px",
                color: "#696969",
              }}
            >
              Quản lý
            </div>
            <div
              className="bg-white p-15px mt-8px"
              style={{
                borderRadius: "8px",
              }}
            >
              <Link
                href="/lich-su-dich-vu/"
                noLinkClass
                className="d--f jc--sb ai--c position-relative text-black border-bottom pb-12px mb-12px"
              >
                <div>Lịch sử sử dụng dịch vụ</div>
                <div
                  className="d--f ai--c"
                  style={{
                    fontSize: "18px",
                    color: "#999",
                  }}
                >
                  <i className="las la-angle-right"></i>
                </div>
              </Link>
              <Link
                href="/cardservice/"
                noLinkClass
                className="d--f jc--sb ai--c position-relative text-black border-bottom pb-12px mb-12px"
              >
                <div>Thẻ liệu trình</div>
                <div
                  className="d--f ai--c"
                  style={{
                    fontSize: "18px",
                    color: "#999",
                  }}
                >
                  <i className="las la-angle-right"></i>
                </div>
              </Link>
              {!window?.GlobalConfig?.APP?.hiddenOrder && (
                <Link
                  href="/order/"
                  noLinkClass
                  className="d--f jc--sb ai--c position-relative text-black border-bottom pb-12px mb-12px"
                >
                  <div>Đơn hàng - Công nợ</div>
                  <div
                    className="d--f ai--c"
                    style={{
                      fontSize: "18px",
                      color: "#999",
                    }}
                  >
                    <i className="las la-angle-right"></i>
                  </div>
                </Link>
              )}

              <Link
                href="/manage-schedules/"
                noLinkClass
                className="d--f jc--sb ai--c position-relative text-black"
              >
                <div>Quản lý đặt lịch</div>
                <div
                  className="d--f ai--c"
                  style={{
                    fontSize: "18px",
                    color: "#999",
                  }}
                >
                  <i className="las la-angle-right"></i>
                </div>
              </Link>
            </div>
          </div>
          <div className="mb-5px">
            <div
              className="mb-5px fw-500"
              style={{
                fontSize: "13px",
                color: "#696969",
              }}
            >
              Khác
            </div>
            <div
              className="bg-white p-15px mt-8px"
              style={{
                borderRadius: "8px",
              }}
            >
              <Link
                href="/diary/"
                noLinkClass
                className="d--f jc--sb ai--c position-relative text-black border-bottom pb-12px mb-12px"
              >
                <div>Nhật ký khách hàng</div>
                <div
                  className="d--f ai--c"
                  style={{
                    fontSize: "18px",
                    color: "#999",
                  }}
                >
                  <i className="las la-angle-right"></i>
                </div>
              </Link>
              {window?.GlobalConfig?.Admin?.maff && (
                <Link
                  href="/aff/"
                  noLinkClass
                  className="d--f jc--sb ai--c position-relative text-black border-bottom pb-12px mb-12px"
                >
                  <div>Người giới thiệu</div>
                  <div
                    className="d--f ai--c"
                    style={{
                      fontSize: "18px",
                      color: "#999",
                    }}
                  >
                    <i className="las la-angle-right"></i>
                  </div>
                </Link>
              )}

              <Link
                href="/maps/"
                noLinkClass
                className="d--f jc--sb ai--c position-relative text-black"
              >
                <div>Hệ thống cơ sở - Liên hệ</div>
                <div
                  className="d--f ai--c"
                  style={{
                    fontSize: "18px",
                    color: "#999",
                  }}
                >
                  <i className="las la-angle-right"></i>
                </div>
              </Link>
            </div>
          </div>
        </div>
        <Toolbar tabbar position="bottom">
          <ToolBarBottom />
        </Toolbar>
      </Page>
    );
  }
}
