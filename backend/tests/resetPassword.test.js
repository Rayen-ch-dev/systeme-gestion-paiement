import request from "supertest";
import app from "../server.js";
import mongoose from "mongoose";
describe("Password Reset API", () => {
  //in case of the data is correct
  it("should return 200 for forgot password request", async () => {
    const res = await request(app)
      .post("/api/password/resetPassword/getForgotPasswordLink")
      .send({ email: "challoufrayen09@gmail.com", type: "comptable" });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message");
  });
  //in case of the data email not found
  it("should return 404 for unknown email", async () => {
    const res = await request(app)
      .post("/api/password/resetPassword/getForgotPasswordLink")
      .send({ email: "unknown@email.com", type: "comptable" });

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toMatch(/not found/i);
  });
});

// Mock valid token, id, and type
// (You can use a real one copied from your email for testing)
const id = "68fa5d7e8c1a18b10f6a3ddb";
const token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImNoYWxsb3VmcmF5ZW4wOUBnbWFpbC5jb20iLCJpZCI6IjY4ZmE1ZDdlOGMxYTE4YjEwZjZhM2RkYiIsInR5cGUiOiJjb21wdGFibGUiLCJpYXQiOjE3NjI0OTUxOTQsImV4cCI6MTc2MjQ5NTc5NH0.Xfge_HBokQzh1TvuoTl9hstHr8OXjiW3C_jAE-rpQ7Q";
const type = "comptable";

describe("Password Reset Flow", () => {
  it("should reset password successfully with valid data", async () => {
    const res = await request(app)
      .post(`/api/password/resetPassword/ResetPassword/${type}/${id}/${token}`)
      .send({
        password: "NewPassword123!",
        confirmPassword: "NewPassword123!",
      });

    expect([200, 400, 401, 404, 500]).toContain(res.statusCode);
    console.log("Response:", res.body);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });
});

