import React from "react";
import PropTypes from "prop-types";
import { Link, Popover } from "framework7-react";
import { getUser } from "../constants/user";
import clsx from "clsx";

PrivateNavReport.propTypes = {
  // auth: PropTypes.object.isRequired
};

function PrivateNavReport({
  roles,
  text,
  icon,
  className,
  href,
  currenRouter,
  ...props
}) {
  const infoUser = getUser();
  const userRoles = infoUser.GroupTitles;
  const hasRole =
    roles === "all" ||
    (Array.isArray(roles) && roles.some((role) => userRoles.includes(role)));
  const hasRoleLength =
    Array.isArray(userRoles) &&
    userRoles.length === 0 &&
    Array.isArray(roles) &&
    roles.length === 0;
    
  if (hasRole || hasRoleLength || infoUser.acc_group.includes("1")) {
    return (
      <>
        <Link
          noLinkClass
          className={clsx(
            "page-toolbar-bottom__link js-toolbar-link",
            "/report-tq/" === currenRouter && "js-active"
          )}
          style={{
            color:
              ["/report-tq/", "/report/"].findIndex((x) => x === currenRouter) >
              -1
                ? "var(--ezs-color)"
                : "#bbbbbb",
          }}
          popoverOpen=".popover-report"
        >
          <i
            className="las la-chart-bar"
            style={{
              color:
                ["/report-tq/", "/report/"].findIndex(
                  (x) => x === currenRouter
                ) > -1
                  ? "var(--ezs-color)"
                  : "#bbbbbb",
            }}
          ></i>
          <span>Báo cáo</span>
        </Link>
        <Popover className="popover-report">
          <div
            style={{
              padding: "6px 0",
              display: "flex",
              flexDirection: "column",
              alignItems: "start",
            }}
          >
            <Link
              style={{
                display: "block",
                padding: "12px 15px",
                color:
                  currenRouter === "/report-tq/" ? "var(--ezs-color)" : "#000",
                borderBottom: "1px solid #e9e9e9",
                width: "100%",
              }}
              href="/report-tq/"
              className=""
              popoverClose
            >
              Báo cáo tổng quan
            </Link>
            <Link
              style={{
                display: "block",
                padding: "12px 15px",
                color:
                  currenRouter === "/report/" ? "var(--ezs-color)" : "#000",
                width: "100%",
              }}
              href="/report/"
              className=""
              popoverClose
            >
              Báo cáo chi tiết
            </Link>
          </div>
        </Popover>
      </>
    );
  } else {
    return null;
  }
}

export default PrivateNavReport;
