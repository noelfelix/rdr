var knex = require('knex');

exports.seed = function(knex, Promise) {
  return Promise.join(
    // Deletes ALL existing entries
    knex('users').del(),

    knex('books').del(),

    knex('authors').del(),



    // Inserts seed entries
    knex('authors').insert({id: 1, name: 'J.K. Rowling'}),
    knex('authors').insert({id: 2, name: 'Donald J. Trump'}),
    knex('authors').insert({id: 3, name: 'Stephen Colbert'}),


    // Inserts seed entries
    knex('books').insert({
      id: 1,
      title: 'Harry Potter',
      author_id: 1
    }),
    knex('books').insert({
      id: 2,
      title: 'Trump: The Art of the Deal',
      author_id: 2
    }),
    knex('books').insert({
      id: 3,
      title: 'I Am America (And So Can You!)',
      author_id: 3
    })
  );
};
