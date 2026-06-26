import jwt_decode from "jwt-decode";

export const decode = (token) => {
  const decode_token = jwt_decode(token)
  
  return decode_token
}
