import { create } from "zustand";
//类型标注
interface userState {
  ifLogin: boolean; //初始登录状态
  id: number;
  userName: string;
  email: string;
  history: string[];
  login: (
    id: number,
    userName: string,
    email: string,
    history: string[]
  ) => void;
  logout: () => void;
  addHistory: (newHistory: string) => void;
}
export const useUserStore = create<userState>()((set) => ({
  ifLogin: false, //初始登录状态
  id: 0,
  userName: "",
  email: "",
  history: [],
  //登录，并完成赋值
  login: (id, userName, email, history) =>
    set(() => ({
      ifLogin: true,
      id: id,
      userName: userName,
      email: email,
      history: history,
    })),
  logout: () =>
    set(() => ({
      //退出登录
      ifLogin: false,
      id: 0,
      userName: "",
      email: "",
      history: [],
    })),
  addHistory: (newHistory) =>
    set((state) => ({
      //新增一条历史
      ...state,
      history: [...state.history, newHistory],
    })),
}));
