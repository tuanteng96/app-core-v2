import React from "react";
import { Popover, Link } from "framework7-react";
import Skeleton from "react-loading-skeleton";

export default class SkeletonCardService extends React.Component {
    render() {
      
    return (
      <div className="cardservice-item__service">
        <div className="cardservice-item__service-img">
          <Skeleton height={200} />
          <div className="cardservice-item__service-text">
            <h4 className="title">
              <Skeleton count={2} />
            </h4>
            <ul>
              <li>
                <span>Giá trị : </span>
                <span>
                  <Skeleton width={100} />
                </span>
              </li>
              <li>
                <span>Dùng lần cuối : </span>
                <span>
                  <Skeleton width={100} />
                </span>
              </li>
              <li>
                <span>Hạn sử dụng : </span>
                <span>
                  <Skeleton width={100} />
                </span>
              </li>
            </ul>
          </div>
        </div>
        <div className="cardservice-item__service-list">
          {Array(4)
            .fill()
            .map((sub, i) => (
              <div className="item" key={i}>
                <div className={"item-box"}>
                  <span className="count">{i + 1}</span>
                </div>
              </div>
            ))}
        </div>
      </div>
    );
  }
}
