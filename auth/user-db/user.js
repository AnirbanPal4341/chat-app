let users = [
    {
      id: 1,
      username: 'bob',
      password: '123',
    },
    {
      id: 2,
      username: 'john',
      password: '456',
    },
    {
      id: 3,
      username: 'max',
      password: '789',
    },
  ];

async function findOne(username) {
  return users.find(user => user.username === username);
}

module.exports = {findOne} ;
