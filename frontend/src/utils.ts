import type { Response, UserInfo } from "./vite-env";

const prefix = "http://127.0.0.1:8080/api";
export async function getFetcher(key: string) {
  const resp = (await fetch(prefix + key, { mode: "cors" }).then((res) =>
    res.json()
  )) as Response<any>;

  if (!resp.success) {
    throw new Error(resp.errorCode + ": " + resp.errorMessage);
  }
  // console.log(resp);
  return resp.data;
}
//获取用户信息的专用GET接口（未登录不认为是Error）
export async function getUserInfo(key: string): Promise<UserInfo | -1> {
  const resp = (await fetch(prefix + key, { mode: "cors" }).then((res) =>
    res.json()
  )) as Response<UserInfo>;

  if (!resp.success) {
    if (resp.errorCode == "401") {
      //没有登录态则返回-1
      return -1;
    } else {
      throw new Error(resp.errorCode + ": " + resp.errorMessage);
    }
  } else {
    // console.log(resp);
    return resp.data!;
  }
}

export async function postFetcher(
  key: string,
  //注：Record类型用于创建一个具有指定属性类型的新对象类型
  body: { arg: Record<string, unknown> | Array<unknown> | null }
) {
  const resp = (await fetch(prefix + key, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body.arg),
    mode: "cors",
  }).then((res) => res.json())) as Response<any>;

  // if (!resp.success) {
  //   throw new Error(resp.errorCode + ": " + resp.errorMessage);
  // }
  //需要判断错误原因，因此不能直接抛出错误
  // console.log(resp);
  return resp;
}

export async function putFetcher(
  key: string,
  //注：Record类型用于创建一个具有指定属性类型的新对象类型
  body: { arg: Record<string, unknown> | Array<unknown> }
) {
  const resp = (await fetch(prefix + key, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body.arg),
    mode: "cors",
  }).then((res) => res.json())) as Response<any>;

  if (!resp.success) {
    throw new Error(resp.errorCode + ": " + resp.errorMessage);
  }
  // console.log(resp);
  return resp;
}
//和GET相似，区别是没有body等参数
export async function deleteFetcher(key: string) {
  const resp = (await fetch(prefix + key, {
    method: "DELETE",
    mode: "cors",
  }).then((res) => res.json())) as Response<any>;

  if (!resp.success) {
    throw new Error(resp.errorCode + ": " + resp.errorMessage);
  }
  // console.log(resp);
  return resp;
}
