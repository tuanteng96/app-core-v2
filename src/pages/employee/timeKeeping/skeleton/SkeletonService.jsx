import { Col, Row } from "framework7-react";
import React from "react";
import Skeleton from "react-loading-skeleton";

export default class SkeletonService extends React.Component {
  constructor() {
    super();
    this.state = {};
  }

  componentDidMount() {}

  render() {
    return (
      <React.Fragment>
        {Array(1)
          .fill()
          .map((item, index) => (
            <div key={index}>
              <div className="item">
                <h3>
                  <Skeleton count={2} />
                </h3>
                <ul>
                  <li>
                    <span>Khách hàng : </span>
                    <span>{<Skeleton width={50} height={18} />}</span>
                  </li>
                  <li>
                    <span>Ngày đặt lịch : </span>
                    <span>{<Skeleton width={50} height={18} />}</span>
                  </li>
                  <li>
                    <span>Giờ đặt lịch : </span>
                    <span>{<Skeleton width={50} height={18} />}</span>
                  </li>
                  <li>
                    <span>Số phút : </span>
                    <span>{<Skeleton width={30} height={18} />} p/Ca</span>
                  </li>
                </ul>
              </div>
            </div>
          ))}
      </React.Fragment>
    );
  }
}
