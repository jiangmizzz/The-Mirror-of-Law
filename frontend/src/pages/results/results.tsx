import {
  Divider,
  Space,
  Tooltip,
  Button,
  Pagination,
  message,
  Skeleton,
  Spin,
  Card,
  Empty,
} from "antd";
import { LikeOutlined, DislikeOutlined } from "@ant-design/icons";
import "./results.css";
import { useEffect, useState } from "react";
import SearchBox from "../../components/SearchBox/SearchBox";
// import { RadialTreeGraph } from "@ant-design/graphs";
import rule from "../../assets/rule.svg";
import judge from "../../assets/judge.svg";
import article from "../../assets/article.svg";
import idea from "../../assets/idea.svg";
import information from "../../assets/infomation.svg";
import KnowledgeMap from "./component/KnowledgeMap";
import { useLocation, useNavigate } from "react-router-dom";
import logo from "../../assets/main-logo.svg";
import type { SearchProps } from "../../vite-env";
import { getFetcher } from "../../utils";
import useSWR from "swr";

export default function ResultsPage() {
  const location = useLocation(); //在react router v6 中模拟页面栈
  const navigate = useNavigate();
  const resultTypeMap = new Map([
    ["法律法规", "0"],
    ["裁判文书", "1"],
    ["期刊论文", "2"],
    ["法律观点", "3"],
    ["资讯", "4"],
  ]);
  const pageSize = 10; //默认页面记录条数
  interface NodeInfo {
    id: string; //节点的唯一标识符
    value: string; //节点值（显示出来的）
    children?: NodeInfo[]; //连接的下一层子节点
  }
  //知识图谱请求参数
  const [mapParams, setMapParams] = useState<{
    input: string;
    depth: string;
  } | null>(null);
  const [mapDepth, setMapDepth] = useState(2); //初始图谱深度
  //搜索框组件的传入参数
  const [searchProps, setSearchProps] = useState<SearchProps>({
    input: "",
    searchType: 0,
  });
  //初始页码
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [paramsStr, setParamsStr] = useState<string | null>(null);
  //根据路由参数重新请求搜索结果
  function reSearch() {
    const params = new URLSearchParams(location.search);
    // console.log(params.toString());
    const extraParams: Record<string, string | string[]> = {};
    const types: string[] = [];
    if (params.get("resultTypes")) {
      extraParams["resultTypes"] = params.get("resultTypes")!.split(",");
      extraParams["resultTypes"].forEach((item) => {
        if (resultTypeMap.has(item)) {
          types.push(resultTypeMap.get(item)!);
        }
      });
    }
    //为防止恶意篡改路由（两个时间值删去一个）导致解析错误，还是需要分开判断
    if (params.get("startTime")) {
      extraParams["startTime"] = params.get("startTime")!;
    }
    if (params.get("endTime")) {
      extraParams["endTime"] = params.get("endTime")!;
    }
    setSearchProps({
      input: params.get("input")!,
      searchType: Number(params.get("searchType"))!,
      ...extraParams,
    });

    const requestParams: Record<string, string> = {
      input: params.get("input")!,
      searchType: params.get("searchType")!,
      //TODO:等后端完全实现之后这里要改成全部包括
      resultType: String(params.get("resultTypes") ? types : ["0"]),
      startTime: params.get("startTime") ?? "-9999-01-01",
      endTime: params.get("endTime") ?? "9999-01-01",
      pageSize: String(pageSize),
      pageNumber: String(currentPage),
    };
    // console.log(new URLSearchParams(requestParams).toString());
    setParamsStr(new URLSearchParams(requestParams).toString());
    setMapParams({
      input: requestParams.input,
      depth: String(mapDepth),
    });
    //注意：搜索结果的请求参数均不在这一页直接维护，而是通过路由值获取
  }

  //路由值更新时更新当前页面为0，并重新请求
  useEffect(() => {
    //location.search返回值每次更新，你把大家都害死啦！！！
    if (currentPage != 0) {
      setCurrentPage(0);
    } else {
      reSearch();
    }
  }, [location.search]);

  //路由参数的解析和处理，并基于此进行请求
  useEffect(() => {
    reSearch();
  }, [currentPage]);

  //请求搜索结果的函数，注意要写在最外层
  const {
    data: resultsData,
    error: resultsError,
    isLoading: resultLoading,
  } = useSWR<{ results: ResultItemProps[]; total: number }, Error>(
    () => {
      //null, undefined, false, '' 均不会发起请求
      if (paramsStr == null) return false;
      return "/search/list?" + paramsStr;
    },
    getFetcher,
    {
      revalidateOnFocus: true, //聚焦时重新数据验证，保证数据实时性
    }
  );
  //图谱深度更改时重新获取图谱
  useEffect(() => {
    if (mapParams) {
      setMapParams({
        input: mapParams.input,
        depth: String(mapDepth),
      });
    }
  }, [mapDepth]);
  //请求知识图谱数据
  const {
    data: centerNode,
    error: mapError,
    isLoading: mapLoading,
  } = useSWR<{ center: NodeInfo; desc: string }, Error>(() => {
    //null, undefined, false, '' 均不会发起请求
    if (mapParams == null) return false;
    return "/graph/get?" + new URLSearchParams(mapParams).toString();
  }, getFetcher);

  //使用图谱节点的文本重新搜索
  function nodeSearch(text: string) {
    if (text == "") {
      message.info("搜索内容不能为空！");
    } else {
      navigate(`/results?input=${text}&searchType=0`);
    }
  }
  //转换图谱中心节点
  function changeCenter(text: string) {
    if (mapParams) {
      if (text == "") {
        message.error("节点值为空，无法更改当前节点为中心节点！");
      } else {
        setMapDepth(2);
        setMapParams(() => {
          return { input: text, depth: "2" };
          //更改节点后深度恢复为2
        });
      }
    }
  }
  //处理图谱搜索深度更改
  function handleDepthChange(change: 1 | -1) {
    if (change == -1) {
      //收缩节点
      if (mapDepth == 1) {
        message.info("最少需保留一层子节点！");
      } else {
        setMapDepth(() => {
          return mapDepth - 1;
        });
      }
    } else {
      setMapDepth(() => {
        return mapDepth + 1;
      });
    }
  }

  interface ResultItemProps {
    id: number; //唯一标识符
    title: string; //该条结果的标题
    description: string; //内容摘要
    date: string; //内容发布或更新时间，使用 ISO 8601 时间格式
    resultType: number; //该条结果的类型，0-法律法规，1-裁判文书，2-期刊论文，3-法律观点，4-资讯
    source: string; //来源网站或作者
    feedbackCnt: {
      likes: number; //点赞数量
      dislikes: number; //点踩数量
    };
  }

  //子组件，单条搜索结果
  function ResultItem(props: ResultItemProps) {
    const icon: { img: string; text: string } = (() => {
      //图标
      switch (props.resultType) {
        case 0:
          return { img: rule, text: "法律法规" };
        case 1:
          return { img: judge, text: "裁判文书" };
        case 2:
          return { img: article, text: "期刊论文" };
        case 3:
          return { img: idea, text: "法律观点" };
        default: //4
          return { img: information, text: "资讯" };
      }
    })();
    //点赞/点踩处理函数，应该是异步的
    function handleLike() {}
    function handleDislike() {}

    return (
      <>
        <div>
          <Space style={{ width: "100%" }} direction="vertical">
            <Space className="result-item-head">
              <Tooltip
                title={icon.text}
                placement="left"
                arrow={false}
                overlayStyle={{ fontSize: "12px" }}
              >
                <img src={icon.img} style={{ width: "2em", height: "2em" }} />
              </Tooltip>
              <Space direction="vertical">
                <div className="result-item-head-source">{props.source}</div>
                <div className="result-item-head-time">
                  {new Date(props.date).toLocaleString()}
                </div>
              </Space>
              <Space style={{ marginLeft: "1em" }}>
                <Button
                  type="dashed"
                  icon={<LikeOutlined />}
                  onClick={handleLike}
                >
                  {props.feedbackCnt.likes}
                </Button>
                <Button
                  type="dashed"
                  icon={<DislikeOutlined />}
                  onClick={handleDislike}
                >
                  {props.feedbackCnt.dislikes}
                </Button>
              </Space>
            </Space>
            <Space direction="vertical" className="result-item-body">
              <div
                className="result-item-body-title"
                style={{ margin: 0 }}
                onClick={() =>
                  navigate(`/detail/${props.id}/${props.resultType}`, {
                    state: { previousLocation: location.pathname },
                  })
                }
              >
                {props.title}
              </div>
              <div className="result-item-body-desc">{props.description}</div>
            </Space>
          </Space>
        </div>
      </>
    );
  }

  // 显示加载效果骨架屏
  if (resultLoading) {
    return (
      <div className="result-main">
        <div className="result-header">
          <div>
            <Space align="baseline" style={{ paddingLeft: "4.5em" }}>
              <Skeleton.Avatar active={true} shape={"square"} />
              <Skeleton.Input active={true} />
              <Skeleton.Button active={true} block={true} />
              <Skeleton.Avatar active={true} shape={"circle"} />
            </Space>
            <Divider className="result-header-divider" />
          </div>
        </div>
        <div className="result-main">
          <div className="result-body">
            <div className="result-body-content">
              <div className="result-body-left">
                <Skeleton loading={true} active avatar></Skeleton>
                <Skeleton loading={true} active avatar></Skeleton>
                <Skeleton loading={true} active avatar></Skeleton>
                <Skeleton loading={true} active avatar></Skeleton>
              </div>
              <div className="result-body-right">
                <Card>
                  <Skeleton active />
                  <Divider style={{ margin: "1em 0" }}></Divider>
                  <Spin spinning={true}>
                    <div className="img-loading">
                      <Skeleton.Image
                        active
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          width: "100px",
                          height: "100px",
                        }}
                      />
                    </div>
                  </Spin>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 显示获取数据错误时的空数据界面
  if (resultsError) {
    return (
      <div className="skeleton-box">
        <Card
          style={{
            marginTop: "20px",
            width: "800px",
            height: "600px",
            justifyContent: "center",
            alignItems: "center",
            display: "flex",
          }}
        >
          <Empty description="暂无数据" />
        </Card>
      </div>
    );
  }

  return (
    <>
      {/* {resultsError && <div>Error:{resultsError.message}</div>} */}
      {/* {resultLoading && <div>loading...</div>} */}
      {!resultLoading && !resultsError && (
        <div className="result-main">
          <div className="result-header">
            <div>
              <Space align="baseline" style={{ paddingLeft: "4.5em" }}>
                <div className="result-header-logo">
                  <img style={{ height: "2.5em" }} src={logo} />
                </div>
                {<SearchBox width={420} searchParams={searchProps} />}
              </Space>
              <Divider className="result-header-divider" />
            </div>
          </div>
          <div className="result-body">
            <div style={{ color: "#70757a" }}>
              {"律镜为您找到相关结果约 " + resultsData?.total + " 个"}
            </div>
            <div className="result-body-content">
              <div className="result-body-left">
                {resultsData?.results.map((item) => {
                  return (
                    <ResultItem
                      key={item.id}
                      id={item.id}
                      title={item.title}
                      description={item.description}
                      resultType={item.resultType}
                      date={item.date}
                      feedbackCnt={item.feedbackCnt}
                      source={item.source}
                    />
                  );
                })}
                <div className="result-left-footer">
                  <Pagination
                    current={currentPage + 1}
                    showSizeChanger={false}
                    showQuickJumper
                    total={resultsData?.total}
                    onChange={(...props) => setCurrentPage(props[0] - 1)}
                  />
                </div>
              </div>
              <div className="result-body-right">
                {mapError && !mapLoading && (
                  <Card>
                    <Empty description="暂无数据" />
                  </Card>
                )}
                {mapLoading && (
                  <Card>
                    <Skeleton active />
                    <Divider style={{ margin: "1em 0" }}></Divider>
                    <Spin spinning={true}>
                      <div className="img-loading">
                        <Skeleton.Image
                          active
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            width: "100px",
                            height: "100px",
                          }}
                        />
                      </div>
                    </Spin>
                  </Card>
                )}
                {!mapError && !mapLoading && (
                  <KnowledgeMap
                    center={
                      centerNode ? centerNode.center : { id: "", value: "" }
                    }
                    desc={centerNode ? centerNode.desc : ""}
                    changeDepth={handleDepthChange}
                    searchByNode={nodeSearch}
                    changeCenter={changeCenter}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
