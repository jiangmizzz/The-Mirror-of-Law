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
