import type { Response } from "./vite-env";

const prefix = "http://127.0.0.1:8080/api";
export async function getFetcher(
  key: string,
  //params的设置方便以接口文档里的形式传参
  params:
    | string
    //注意这里的键值只能都是string，因此在传入getFetcher中时需要进行类型转换
    | Record<string, string>
    | URLSearchParams
    | string[][]
    | undefined
) {
  const resp = (await fetch(prefix + key + "?" + new URLSearchParams(params), {
    mode: "cors",
  }).then((res) => res.json())) as Response<any>;

  if (!resp.success) {
    throw new Error(resp.errorCode + ": " + resp.errorMessage);
  }
  // console.log(resp);
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
  // console.log(resp);
  return resp.data;
}
