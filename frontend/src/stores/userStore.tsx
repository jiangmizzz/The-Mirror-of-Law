import { create } from "zustand";
//类型标注
interface userState {
  ifLogin: boolean; //初始登录状态
  id: number;
  userName: string;
  email: string;
  history: string[];
  likes: string[];
  dislikes: string[];
  login: (
    id: number,
    userName: string,
    email: string,
    history: string[],
    likes: string[],
    dislikes: string[]
  ) => void;
  logout: () => void;
  addHistory: (newHistory: string) => void;
  changeLikes: (actionCode: number, id: string) => void;
  editInfo: (newUserName: string, newEmail: string) => void;
}
export const useUserStore = create<userState>()((set) => ({
  ifLogin: false, //初始登录状态
  id: 0,
  userName: "",
  email: "",
  history: [],
  likes: [],
  dislikes: [],
  //登录，并完成赋值
  login: (id, userName, email, history, likes, dislikes) =>
    set(() => ({
      ifLogin: true,
      id: id,
      userName: userName,
      email: email,
      history: history,
      likes: likes,
      dislikes: dislikes,
    })),
  logout: () =>
    set(() => ({
      //退出登录
      ifLogin: false,
      id: 0,
      userName: "",
      email: "",
      history: [],
      likes: [],
      dislikes: [],
    })),
  addHistory: (newHistory) => {
    set((state) => {
      if (state.history.indexOf(newHistory) !== -1) {
        //当前历史记录已经存在，不做任何更改
        return state;
      } else if (state.history.length == 20) {
        //已满20条
        return {
          history: [newHistory, ...state.history.slice(0, 19)],
        };
      } else {
        return {
          //直接添加历史
          history: [newHistory, ...state.history],
        };
      }
    });
  },
  changeLikes: (actionCode: number, id: string) => {
    set((state) => {
      if (actionCode == 0) {
        //点赞
        return {
          likes: [...state.likes, id],
        };
      } else if (actionCode == 1) {
        //点踩
        return {
          dislikes: [...state.dislikes, id],
        };
      } else if (actionCode == 2) {
        //取消点赞
        const index: number = state.likes.indexOf(id);
        return {
          //后端无误的话这个index一定不会是-1
          likes: state.likes.splice(index, 1),
        };
      } else if (actionCode == 3) {
        //取消点踩
        const index: number = state.dislikes.indexOf(id);
        return {
          dislikes: state.dislikes.splice(index, 1),
        };
      } else if (actionCode == 4) {
        //点赞变为点踩
        const index: number = state.likes.indexOf(id);
        return {
          likes: state.likes.splice(index, 1),
          dislikes: [...state.dislikes, id],
        };
      } else {
        //点踩变为点赞
        const index: number = state.dislikes.indexOf(id);
        return {
          dislikes: state.dislikes.splice(index, 1),
          likes: [...state.likes, id],
        };
      }
    });
  },
  editInfo: (newUserName: string, newEmail: string) => {
    set(() => ({
      userName: newUserName,
      email: newEmail,
    }));
  },
}));
