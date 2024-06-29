const request = require("supertest");
const app = require("../app");
const db = require("../db");
const Book = require("../models/book");

async function resetTestDB() {
  await db.query("DELETE FROM books");
}

async function insertTestBook() {
  const testBook = {
    isbn: "1234567890",
    amazon_url: "http://a.co/eobPtX2",
    author: "John Doe",
    language: "english",
    pages: 100,
    publisher: "Test Publisher",
    title: "Test Book",
    year: 2020,
  };
  await Book.create(testBook);
}

describe("Books API", () => {
  beforeAll(() => {
    process.env.NODE_ENV = "test";
  });

  beforeEach(async () => {
    await resetTestDB();
  });

  afterAll(async () => {
    await resetTestDB();
    await db.end();
  });

  test("GET /books should return a list of books", async () => {
    await insertTestBook();
    const response = await request(app).get("/books");
    expect(response.status).toBe(200);
    expect(response.body.books.length).toBe(1);
    expect(response.body.books[0].isbn).toBe("1234567890");
  });

  test("GET /books/:id should return a single book", async () => {
    await insertTestBook();
    const response = await request(app).get("/books/1234567890");
    expect(response.status).toBe(200);
    expect(response.body.book.isbn).toBe("1234567890");
  });

  test("POST /books with valid data should create a new book", async () => {
    const newBook = {
      isbn: "0987654321",
      amazon_url: "http://a.co/eobPtX3",
      author: "Jane Doe",
      language: "english",
      pages: 150,
      publisher: "Test Publisher",
      title: "New Test Book",
      year: 2021,
    };
    const response = await request(app).post("/books").send(newBook);
    expect(response.status).toBe(201);
    expect(response.body.book).toMatchObject(newBook);
  });

  test("POST /books with invalid data should return validation errors", async () => {
    const invalidBook = { isbn: "123", amazon_url: "invalid-url" };
    const response = await request(app).post("/books").send(invalidBook);
    expect(response.status).toBe(400);
    expect(response.body.errors).toBeDefined();
  });

  test("PUT /books/:isbn with valid data should update the book", async () => {
    await insertTestBook();
    const updatedBook = {
      isbn: "1234567890",
      amazon_url: "http://a.co/eobPtX2",
      author: "John Doe Updated",
      language: "english",
      pages: 100,
      publisher: "Test Publisher",
      title: "Test Book Updated",
      year: 2020,
    };
    const response = await request(app)
      .put("/books/1234567890")
      .send(updatedBook);
    expect(response.status).toBe(200);
    expect(response.body.book).toMatchObject(updatedBook);
  });

  test("PUT /books/:isbn with invalid data should return validation errors", async () => {
    await insertTestBook();
    const invalidBook = { isbn: "123", amazon_url: "invalid-url" };
    const response = await request(app)
      .put("/books/1234567890")
      .send(invalidBook);
    expect(response.status).toBe(400);
    expect(response.body.errors).toBeDefined();
  });

  test("DELETE /books/:isbn should delete the book", async () => {
    await insertTestBook();
    const response = await request(app).delete("/books/1234567890");
    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Book deleted");
  });
});
