var db = require(__dirname + '/../../db/db.js');

var Book = db.Model.extend({
  tableName: 'books',
  author: function() {
    return this.belongsTo(Author, 'author_id');
  },
  users: function () {
    return this.belongsToMany(User, 'books_users', 'user_id', 'book_id');
  },
  popularity: function () {
    return this.users().toJSON().length;
  },
  reads: function () {
    return this.hasMany(Read, 'book_id');
  }
});

var Author = db.Model.extend({
  tableName: 'authors',
  books: function () {
    return this.hasMany(Book, 'author_id');
  }
});

var Reaction = db.Model.extend({
  tableName: 'reactions',
});

var Read = db.Model.extend({
  tableName: 'books_users',
  books: function () {
    return this.belongsTo(Book, 'book_id');
  }
});



var User = db.Model.extend({
  tableName: 'users',
  books: function () {
    return this.belongsToMany(Book, 'books_users', 'user_id', 'book_id');
  },
  reads: function () {
    return this.hasMany(Read, 'user_id');
  },
  meetups: function () {
    return this.belongsToMany(Meetup, 'meetups_users', 'user_id', 'meetup_id');
  },
});
var Attending = db.Model.extend({
  tableName: 'meetups_users',
  user: function () {
    return this.belongsTo(User, 'user_id');
  }
});

var Meetup = db.Model.extend({
  tableName: 'meetups',
  users: function () {
    return this.belongsToMany(User, 'meetups_users', 'user_id', 'meetup_id');
  },
  book: function () {
    return this.belongsTo(Book, 'book_id');
  },
  host: function () {
    return this.belongsTo(User, 'user_id');
  }
});


module.exports = {
  Book: Book,
  Author: Author,
  Reaction: Reaction,
  User: User,
  Read: Read,
  Meetup: Meetup,
  Attending: Attending
};
