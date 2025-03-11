import axios from "axios";

export const registrationApi = axios.create({
  baseURL: `${process.env.REGISTRATION_API}`,
});
