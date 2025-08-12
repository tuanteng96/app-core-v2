import http from "../service/http-common";

class BookDataService {
  getCardService(data) {
    return http.get(
      `/api/v3/mbook?cmd=getroot&memberid=${data.MemberID}&ps=${data.Ps}&pi=${data.Pi}&key=${data.Key}&stockid=${data.StockID}`
    );
  }
  postBooking(data) {
    return http.post(`/api/v3/mbook?cmd=booking`, JSON.stringify(data));
  }
  bookDelete(data) {
    return http.post(`/api/v3/mbook?cmd=booking`, JSON.stringify(data));
  }
  getListBook(MemberID) {
    return http.get(`/api/v3/mbook?cmd=getbook&memberid=${MemberID}`);
  }
  getBookId(ID) {
    return http.get(`/api/v3/mbook?cmd=getbookid&id=${ID}`);
  }
  bookContact(data) {
    return http.post("/api/v3/contact23@send", JSON.stringify(data));
  }
  getListBookConfig(data) {
    return http.post(`/api/v3/MemberBookConfig@get`, JSON.stringify(data));
  }
  getBooking({
    MemberID,
    From,
    To,
    StockID,
    Status,
    UserServiceIDs,
    StatusMember,
    StatusBook,
    StatusAtHome,
    Tags = "",
  }) {
    return http.get(
      `/api/v3/MBookApp?cmd=getbooks&memberid=${MemberID}&from=${From}&to=${To}&stockid=${StockID}&status=${Status}&UserServiceIDs=${UserServiceIDs}&StatusMember=${StatusMember}&StatusBook=${StatusBook}&StatusAtHome=${StatusAtHome}&Tags=${Tags}`
    );
  }
  getListStaff(stockid) {
    return http.get(`/api/gl/select2?cmd=user&includeRoles=1&includeSource=1&crstockid=${stockid}&roles=DV`)
  }
}

export default new BookDataService();
