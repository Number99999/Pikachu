class Room {
  id;
  listUser;

  constructor() {
    this.listUser = []
  }
  getListUser() {
    return this.listUser
  }
  setListUser(listUser) {
    this.listUser = listUser
  }
}

module.exports = Room
