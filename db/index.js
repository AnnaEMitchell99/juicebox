const { Client } = require('pg'); 


const client = new Client('postgres://localhost:5432/juicebox-dev');

async function getAllUsers(){
    const {rows} = await client.query(
        `SELECT id, username, name, location, active
        FROM users;
    `);

    return rows;
}

async function createUser({ username, password, name, location }) {
  try {
    const result = await client.query(`
      INSERT INTO users(username, password, name, location)
      VALUES ($1, $2, $3, $4);
    `, [username, password, name, location]);

    return result;
  } catch (error) {
    throw error;
  }
}


async function updateUser(id, fields = {}) {
  const setString = Object.keys(fields).map(
    (key, index) => `"${ key }"=$${ index + 1 }`
  ).join(', ');

  if (setString.length === 0) {
    return;
  }

  try {

    const result = await client.query(`
      UPDATE users
      SET ${ setString }
      WHERE id=${ id }
      RETURNING *;
    `, Object.values(fields));

    const { rows: [updatedUser] } = await client.query(`
      SELECT id, username, name, location, active
      FROM users
      WHERE id = $1;
    `, [id]);

    return updatedUser;
  } catch (error) {
    throw error;
  }
}

async function createPost({ authorId, title, content }) {
  try {
    const { rows: [ post ] } = await client.query(`
    INSERT INTO posts("authorId", title, content)
    VALUES ($1, $2, $3)
    RETURNING *;
  `, [authorId, title, content]);

  return post;

  } catch (error) {
    throw error;
  }
}

async function updatePost(id, fields = {}) {
  const setString = Object.keys(fields).map(
    (key, index) => `"${ key }"=$${ index + 1 }`
  ).join(', ');

  if (setString.length === 0) {
    return;
  }

  try {
    const { rows: [ post ] } = await client.query(`
      UPDATE posts
      SET ${ setString }
      WHERE id=${ id }
      RETURNING *;
    `, Object.values(fields));

    return post;
  } catch (error) {
    throw error;
  }
}

async function getAllPosts() {
  try {
    const { rows } = await client.query(`
      SELECT * FROM posts;
    `);

    return rows;
  } catch (error) {
    throw error;
  }
}

async function getPostsByUser(userId) {
  try {
    const { rows } = await client.query(`
      SELECT * FROM posts
      WHERE "authorId"=${ userId };
    `);

    return rows;
  } catch (error) {
    throw error;
  }
}

async function getUserById(userId) {
  try {
    const { rows } = await client.query(`
      SELECT * FROM users
      WHERE id=${ userId };
    `);

    if (!rows || rows.length === 0) {
      return null;
    }

    const user = rows[0];

    delete user.password;

    const posts = await getPostsByUser(userId);

    user.posts = posts;

    return user;
  } catch (error) {
    throw error;
  }
}


module.exports = {
  client,
  getAllUsers,
  createUser,
  updateUser,
  createPost,
  updatePost,
  getAllPosts,
  getPostsByUser,
  getUserById
}