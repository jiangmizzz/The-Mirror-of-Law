/// <reference types="vite/client" />
export interface Response<T> {
  success: boolean; // 请求是否成功处理并返回
  data: T | null; // 返回的数据
  errorCode: string; // 错误码 (0 if success)
  errorMessage: string; // 错误信息
}
//SearchBox的默认值（可选）
export interface SearchProps {
  input: string;
  searchType: number;
  resultTypes?: string[];
  startTime?: string;
  endTime?: string;
}
//用户信息
export interface UserInfo {
  id: number; //唯一的用户id
  userName: string; //唯一的用户名
  email: string; //用户的注册邮箱
  history: string[]; //最近20条搜索记录（输入值）
}
//图谱节点信息
export interface NodeInfo {
  id: string; //节点的唯一标识符
  value: string; //节点值（显示出来的）
  children?: NodeInfo[]; //连接的下一层子节点
}
