import type { Response } from "./vite-env";

const prefix = "http://127.0.0.1:8080/api";
export async function getFetcher(key: string) {

  const resp = (await fetch(prefix + key, { mode: "cors" }).then((res) =>
    res.json()
  )) as Response<any>;

  if (!resp.success) {
    throw new Error(resp.errorCode + ": " + resp.errorMessage);
  }
  console.log(resp);
  return resp.data;
}
export async function postFetcher(
  key: string,
  //注：Record类型用于创建一个具有指定属性类型的新对象类型
  body: { arg: Record<string, unknown> | Array<unknown> }
) {
  const resp = (await fetch(prefix + key, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body.arg),
    mode: "cors",
  }).then((res) => res.json())) as Response<any>;

  if (!resp.success) {
    throw new Error(resp.errorCode + ": " + resp.errorMessage);
  }
  console.log(resp);
  return resp.data;
}
