import http from "../service/http-common";
import qs from "qs";
import { getToken } from "../constants/user";

class StaffService {
  getServiceStaff(user, data) {
    return http.post(
      `/app/index.aspx?cmd=member_sevice&token=${getToken()}&IsUser=1&StockID=${
        user.StockID
      }`,
      qs.stringify(data)
    );
  }
  getStaffService(user, data) {
    return http.post(
      `/app/index.aspx?cmd=get_staff_service&token=${getToken()}&IsUser=1&StockID=${
        user.StockID
      }`,
      qs.stringify(data)
    );
  }
  getSurchargeStaff(user, data) {
    return http.post(
      `/app/index.aspx?cmd=service_fee&token=${getToken()}&IsUser=1&StockID=${
        user.StockID
      }`,
      qs.stringify(data)
    );
  }
  serviceDoneStaff(user, data) {
    return http.post(
      `/app/index.aspx?cmd=staff_done_service&token=${getToken()}&IsUser=1&StockID=${
        user.StockID
      }`,
      qs.stringify(data)
    );
  }
  getImageStaff(osid) {
    return http.get(`/api/v3/orderservice?cmd=attachment&osid=${osid}`);
  }
  uploadImageStaff(file) {
    return http.post(`/api/v3/file?cmd=upload&token=${getToken()}`, file);
  }
  updateDescStaff(id, data) {
    return http.post(
      `/api/v3/orderservice?cmd=desc&osid=${id}`,
      qs.stringify(data)
    );
  }
  updateImageStaff(id, data) {
    return http.post(
      `/api/v3/orderservice?cmd=attachment&osid=${id}`,
      qs.stringify(data)
    );
  }
  deleteImageStaff(id, deletes) {
    return http.post(
      `/api/v3/orderservice?cmd=attachment&osid=${id}`,
      qs.stringify(deletes)
    );
  }
  getNotiStaff(user, data) {
    return http.post(
      `/app/index.aspx?cmd=noti&token=${getToken()}&IsUser=1&StockID=${
        user.StockID
      }`,
      qs.stringify(data)
    );
  }
  addNotiStaff(user, data) {
    return http.post(
      `/app/index.aspx?cmd=service_note&token=${getToken()}&IsUser=1&StockID=${
        user.StockID
      }`,
      qs.stringify(data)
    );
  }
  getBookStaff(user, data) {
    return http.post(
      `/app/index.aspx?cmd=booklist&token=${getToken()}&IsUser=1&StockID=${
        user.StockID
      }`,
      qs.stringify(data)
    );
  }
  getSalary(userID, mon) {
    return http.get(`api/v3/usersalary?cmd=salary&userid=${userID}&mon=${mon}`);
  }
  getListStaff(stockid) {
    return http.get(
      `/api/gl/select2?cmd=user&includeRoles=1&includeSource=1&crstockid=${stockid}&roles=DV`
    );
  }
  getListImgUse(data) {
    return http.post(
      `/api/v3/orderservice@osAttachments`,
      JSON.stringify(data)
    );
  }
  getAttachments(data) {
    return http.post(`/api/v3/OrderService@Attachments`, JSON.stringify(data));
  }
  getList(key = "") {
    return http.get(
      `/services/preview.aspx?cmd=search_member&key=${key}&typeSearch=sell&ps=100&pi=1&searchId=3&select=ID%2CFullName%2CMobilePhone%2CHomeAddress%2CByStockID%2CPresent%2CSource%2CAppInfo%2CBirthDate%2CTeleNote%2CJobs%2CReceiveInformation%2CPresent%2CPhoto%2CAFFMemberID%2CAFFJSON%2CRequirePwd&includes=GroupNames&isAdmin=true&__MemberCheckin=&__MemberMoney=0&__MyNoti=0&__AllNoti=0&__Birth=0&__MBirth=0&__Cate=false&__HasOrderService=0&__MemberGroups=false&__StaffID=0&__StockID=0&__Source=&__Tags=&from=top`,
      {
        headers: { Authorization: `Bearer ${getToken()}` },
      }
    );
  }
  sendOTPAdmin(body) {
    return http.post(`/api/v3/TranOTP@Send`, JSON.stringify(body), {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
  }
  getSuckMilk(body) {
    return http.post(`/api/v4/MemberCustome@get`, JSON.stringify(body), {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
  }
  addEditSuckMilk(body) {
    return http.post(`/api/v4/MemberCustome@edit`, JSON.stringify(body), {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
  }
  deleteSuckMilk(body) {
    return http.post(`/api/v4/MemberCustome@delete`, JSON.stringify(body), {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
  }
}

export default new StaffService();
