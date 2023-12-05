import {
  Divider,
  Space,
  Tooltip,
  Button,
  Pagination,
  Card,
  Typography,
} from 'antd';
import { LikeOutlined, DislikeOutlined, MoreOutlined } from '@ant-design/icons';
import './results.css';
import { useEffect } from 'react';
import SearchBox from '../../components/SearchBox/SearchBox';
import { RadialTreeGraph } from '@ant-design/graphs';
import rule from '../../assets/rule.svg';
import judge from '../../assets/judge.svg';
import article from '../../assets/article.svg';
import idea from '../../assets/idea.svg';
import information from '../../assets/infomation.svg';
import { useLocation, useNavigate } from 'react-router-dom';
import logo from '../../assets/main-logo.svg';

const { Title } = Typography;
export default function ResultsPage() {
  const location = useLocation(); //在react router v6 中模拟页面栈
  const navigate = useNavigate();
  // const history = useHistory();  //导航到其他页面
  const resultList: ResultItemProps[] = [
    {
      id: 1,
      title: '中共中央印发《全国干部教育培训规划(2023—2027年)》',
      description:
        '近日，中共中央印发了《全国干部教育培训规划（2023－2027年）》（以下简称《规划》），并发出通知，要求各地区各部门结合实际认真贯彻落实。通知指出，制定实施《规划》是党中央着眼新时代新征程党的使命任务作出的重要部署。',
      date: '2023-12-02T18:22:54.739Z',
      resultType: 0,
      source: '中国共产党中央委员会',
      feedbackCnt: {
        likes: 23,
        dislikes: 1,
      },
    },
    {
      id: 2,
      title: '中共中央办公厅、国务院办公厅关于调整应急管理部职责机构编制的通知',
      description:
        '根据《中国共产党机构编制工作条例》和党中央关于国家综合性消防救援队伍整合改革部署，经报党中央、国务院批准，现将应急管理部职责、机构、编制调整事项通知如下。',
      date: '2023-12-02T18:22:54.739Z',
      resultType: 2,
      source: '中共中央办公厅',
      feedbackCnt: {
        likes: 55,
        dislikes: 9,
      },
    },
    {
      id: 3,
      title: 'Ice-cream is a kind of good food',
      description:
        '近日，中共中央印发了《全国干部教育培训规划（2023－2027年）》（以下简称《规划》），并发出通知，要求各地区各部门结合实际认真贯彻落实。通知指出，制定实施《规划》是党中央着眼新时代新征程党的使命任务作出的重要部署。',
      date: '2023-12-02T18:22:54.739Z',
      resultType: 1,
      source: '全国人大常委会',
      feedbackCnt: {
        likes: 23,
        dislikes: 1,
      },
    },
    {
      id: 4,
      title: '中共中央印发《全国干部教育培训规划(2023—2027年)》',
      description:
        '近日，中共中央印发了《全国干部教育培训规划（2023－2027年）》（以下简称《规划》），并发出通知，要求各地区各部门结合实际认真贯彻落实。通知指出，制定实施《规划》是党中央着眼新时代新征程党的使命任务作出的重要部署。',
      date: '2023-12-02T18:22:54.739Z',
      resultType: 3,
      source: 'Swagger',
      feedbackCnt: {
        likes: 23,
        dislikes: 1,
      },
    },
    {
      id: 5,
      title: '中共中央印发《全国干部教育培训规划(2023—2027年)》',
      description:
        '近日，中共中央印发了《全国干部教育培训规划（2023－2027年）》（以下简称《规划》），并发出通知，要求各地区各部门结合实际认真贯彻落实。通aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa。',
      date: '2023-12-02T18:22:54.739Z',
      resultType: 4,
      source: 'xx记者',
      feedbackCnt: {
        likes: 23,
        dislikes: 1,
      },
    },
  ];
  interface NodeInfo {
    id: string; //节点的唯一标识符
    value: string; //节点值（显示出来的）
    children?: NodeInfo[]; //连接的下一层子节点
  }

  const centerNode: { center: NodeInfo; desc: string } = {
    center: {
      id: '1',
      value: '民法典',
      children: [
        {
          id: '2',
          value: 'Python',
        },
        {
          id: '3',
          value: 'C++',
        },
      ],
    },
    desc: 'Oracle Java 是广受欢迎的编程语言和开发平台。它有助于企业降低成本、缩短开发周期、推动创新以及改善应用服务。如今，Java 仍是企业和开发人员的首选开发平台...',
  };
  //TODO:进入该页面时需要获取搜索结果
  useEffect(() => {}, []);

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
          return { img: rule, text: '法律法规' };
        case 1:
          return { img: judge, text: '裁判文书' };
        case 2:
          return { img: article, text: '期刊论文' };
        case 3:
          return { img: idea, text: '法律观点' };
        default: //4
          return { img: information, text: '资讯' };
      }
    })();
    //点赞/点踩处理函数，应该是异步的
    function handleLike() {}
    function handleDislike() {}

    return (
      <>
        <div>
          <Space style={{ width: '100%' }} direction="vertical">
            <Space className="result-item-head">
              <Tooltip
                title={icon.text}
                placement="left"
                arrow={false}
                overlayStyle={{ fontSize: '12px' }}
              >
                <img src={icon.img} style={{ width: '2em', height: '2em' }} />
              </Tooltip>
              <Space direction="vertical">
                <div className="result-item-head-source">{props.source}</div>
                <div className="result-item-head-time">
                  {new Date(props.date).toLocaleString()}
                </div>
              </Space>
              <Space style={{ marginLeft: '1em' }}>
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
                  navigate(`/detail/${props.id}`, {
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
  //子组件，知识图谱
  function KnowledgeMap() {
    const data = {
      id: 'Modeling Methods',
      children: [
        {
          id: 'Classification',
          children: [
            { id: 'Logistic regression', value: 'Logistic regression' },
            {
              id: 'Linear discriminant analysis',
              value: 'Linear discriminant analysis',
            },
            { id: 'Rules', value: 'Rules' },
            { id: 'Decision trees', value: 'Decision trees' },
            { id: 'Naive Bayes', value: 'Naive Bayes' },
            { id: 'K nearest neighbor', value: 'K nearest neighbor' },
            {
              id: 'Probabilistic neural network',
              value: 'Probabilistic neural network',
            },
            { id: 'Support vector machine', value: 'Support vector machine' },
          ],
          value: 'Classification',
        },
        {
          id: 'Consensus',
          children: [
            {
              id: 'Models diversity',
              children: [
                {
                  id: 'Different initializations',
                  value: 'Different initializations',
                },
                {
                  id: 'Different parameter choices',
                  value: 'Different parameter choices',
                },
                {
                  id: 'Different architectures',
                  value: 'Different architectures',
                },
                {
                  id: 'Different modeling methods',
                  value: 'Different modeling methods',
                },
                {
                  id: 'Different training sets',
                  value: 'Different training sets',
                },
                {
                  id: 'Different feature sets',
                  value: 'Different feature sets',
                },
              ],
              value: 'Models diversity',
            },
            {
              id: 'Methods',
              children: [
                { id: 'Classifier selection', value: 'Classifier selection' },
                { id: 'Classifier fusion', value: 'Classifier fusion' },
              ],
              value: 'Methods',
            },
            {
              id: 'Common',
              children: [
                { id: 'Bagging', value: 'Bagging' },
                { id: 'Boosting', value: 'Boosting' },
                { id: 'AdaBoost', value: 'AdaBoost' },
              ],
              value: 'Common',
            },
          ],
          value: 'Consensus',
        },
        {
          id: 'Regression',
          children: [
            {
              id: 'Multiple linear regression',
              value: 'Multiple linear regression',
            },
            { id: 'Partial least squares', value: 'Partial least squares' },
            {
              id: 'Multi-layer feedforward neural network',
              value: 'Multi-layer feedforward neural network',
            },
            {
              id: 'General regression neural network',
              value: 'General regression neural network',
            },
            {
              id: 'Support vector regression',
              value: 'Support vector regression',
            },
          ],
          value: 'Regression',
        },
      ],
      value: 'Modeling Methods',
    };
    const themeColor = '#73B3D1';
    const config = {
      //TODO:设置合适的宽高
      // width: 500,
      // height: 500,
      data,
      nodeCfg: {
        size: 30,
        type: 'circle',
        label: {
          style: {
            fill: '#fff',
          },
        },
        style: {
          fill: themeColor,
          stroke: '#0E1155',
          lineWidth: 2,
          strokeOpacity: 0.45,
          shadowColor: themeColor,
          shadowBlur: 25,
        },
        nodeStateStyles: {
          hover: {
            stroke: themeColor,
            lineWidth: 2,
            strokeOpacity: 1,
          },
        },
      },
      edgeCfg: {
        style: {
          stroke: themeColor,
          shadowColor: themeColor,
          shadowBlur: 20,
        },
        endArrow: {
          type: 'triangle',
          fill: themeColor,
          d: 15,
          size: 8,
        },
        edgeStateStyles: {
          hover: {
            stroke: themeColor,
            lineWidth: 2,
          },
        },
      },
      behaviors: ['drag-canvas', 'zoom-canvas', 'drag-node'],
    };

    return (
      <div
        id="dom"
        style={{
          background: '#0E1155',
          height: '400px',
        }}
      >
        {
          //@ts-ignore
          <RadialTreeGraph {...config} />
        }
      </div>
    );
  }
  return (
    <>
      <div className="result-main">
        <div className="result-header">
          <div>
            <Space align="baseline" style={{ paddingLeft: '4.5em' }}>
              <div className="result-header-logo">
                <img style={{ height: '2.5em' }} src={logo} />
              </div>
              {<SearchBox width={420} />}
            </Space>
            <Divider className="result-header-divider" />
          </div>
        </div>
        <div className="result-body">
          <div style={{ color: '#70757a' }}>
            {'律镜为您找到相关结果约 ' + 525 + ' 个'}
          </div>
          <div className="result-body-content">
            <div className="result-body-left">
              {resultList.map((item) => {
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
                  defaultCurrent={1}
                  total={
                    525
                  } /*onChange={handlePageChange} onShowSizeChange={handlePageSizeChange}*/
                />
              </div>
            </div>
            <div className="result-body-right">
              <Card /*loading={true}*/>
                <Space className="result-body-right-head">
                  <Title level={3}>{centerNode.center.value}</Title>
                  <Tooltip
                    title="知识图谱：自动寻找与搜索内容最贴近的词条节点"
                    overlayStyle={{ fontSize: '12px' }}
                  >
                    <MoreOutlined
                      style={{ fontSize: '1.4em', color: 'rgba(0, 0, 0, 0.7)' }}
                    />
                  </Tooltip>
                </Space>
                <Divider style={{ margin: '1em 0' }}></Divider>
                <div>{centerNode.desc}</div>
                {<KnowledgeMap />}
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
