const { Component } = React;

export default class PureComponent extends Component {
  // 重新定义是否需要重新渲染的钩子函数
  shouldComponentUpdate(nextProps, nextState) {
    return (
      !shallowEqual(this.props, nextProps) ||
      !shallowEqual(this.state, nextState)
    );
  }
}

function shallowEqual(o1, o2) {
  // 组件不能调用 render 函数
  if (o1 === o2) return true;

  if (
    typeof o1 !== "object" ||
    o1 === null ||
    typeof o2 !== "object" ||
    o2 === null
  ) {
    return false;
  }

  const k1 = Object.keys(o1);
  const k2 = Object.keys(o2);

  if (k1.length !== k2.length) return false;

  // 检测键
  for (const k of k1) {
    if (!o2.hasOwnProperty(k) || o1[k] !== o2[k]) {
      return false;
    }
  }

  return true;
}
