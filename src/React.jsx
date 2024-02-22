import PureComponent from "./PureComponent";

const { createRoot } = ReactDOM;

export const root = createRoot(document.getElementById("app"));

const states = [];
const stateSetters = [];
let stateIndex = 0;

function createState(initialState, stateIndex) {
  return states[stateIndex] ? states[stateIndex] : initialState;
}

function createStateSetter(stateIndex) {
  return (newState) => {
    // 区分函数和纯数值情况
    if (typeof newState === "function") {
      states[stateIndex] = newState(states[stateIndex]);
    } else {
      states[stateIndex] = newState;
    }

    render();
  };
}

export function useState(initialState) {
  states[stateIndex] = createState(initialState, stateIndex);

  if (!stateSetters[stateIndex]) {
    stateSetters.push(createStateSetter(stateIndex));
  }

  const _state = states[stateIndex];
  const _setSetter = stateSetters[stateIndex];

  stateIndex++;

  return [_state, _setSetter];
}

export function useReducer(reducer, initialState) {
  const [state, setState] = useState(initialState);

  const dispatch = (action) => {
    const newState = reducer(state, action);
    setState(newState);
  };

  return [state, dispatch];
}

async function render() {
  stateIndex = 0; // 重新渲染后, index 重置, 合理利用闭包
  effectIndex = 0; // 重新渲染后, index 重置
  memoIndex = 0;
  callbackIndex = 0;
  const App = (await import("./App")).default;
  root.render(<App />);
}

const effectDepArr = [];
const clearCallbacks = [];
let effectIndex = 0;

export function useEffect(callback, deps) {
  if (typeof callback !== "function") {
    throw new TypeError("callback must be a function");
  }

  if (deps !== undefined && !Array.isArray(deps)) {
    throw new TypeError("Dependence must be an array");
  }

  const curIndex = effectIndex++;
  const lastDeps = effectDepArr[curIndex];
  const isChanged =
    !lastDeps || // 首次渲染
    !deps || // 是否有依赖
    deps.some((dep, i) => dep !== lastDeps[i]); // 综合比较, 依赖是否改变

  if (isChanged) {
    effectDepArr[curIndex] = deps;

    // 只实现改变渲染时, 清除副作用函数, 未实现组件卸载时,清除副作用回调
    const clearCallback = clearCallbacks[curIndex];

    if (clearCallback) clearCallback();
    clearCallbacks[curIndex] = callback(); // 存储清除副作用函数, 并同时执行回调函数
  }
}

export function memo(FC) {
  // 匿名类的定义，它继承自 PureComponent，并覆盖了 render 方法。
  return class extends PureComponent {
    render() {
      // 调用原始的函数组件 FC，并将 props 传递给它
      return FC(this.props);
    }
  };
}

const memoArr = [];
let memoIndex = 0;
export function useMemo(cb, depArr) {
  const setNewMemo = (cb, depArr) => {
    const memo = cb(); // 比 useCallback 多一个执行函数结果
    memoArr[memoIndex++] = [memo, depArr];
    return memo;
  };

  // 查看是否已有该依赖
  if (memoArr[memoIndex]) {
    const [_memo, _depArr] = memoArr[memoIndex];
    // 查看依赖是否发生变化
    const isFullSame = depArr.every((dep, index) => dep === _depArr[index]);
    // 若相同直接返回原先结果, 否则重新计算
    if (isFullSame) {
      memoIndex++;
      return _memo;
    } else {
      return setNewMemo(cb, depArr);
    }
  } else {
    return setNewMemo(cb, depArr);
  }
}

// useCallback 和 useMemo 非常像, 简单实现也是一样的, 只不过在使用上, useMemo 是函数运行结果, 而 useCallback 缓存的是该函数本身
const callbackArr = [];
let callbackIndex = 0;
export function useCallback(cb, depArr) {
  const setNewArr = (cb, depArr) => {
    callbackArr[callbackIndex++] = [cb, depArr];
    return cb;
  };

  if (callbackArr[callbackIndex]) {
    const [_cb, _depArr] = callbackArr[callbackIndex];
    const isFullSame = depArr.every((dep, index) => dep === _depArr[index]);
    if (isFullSame) {
      callbackIndex++;
      return _cb;
    } else {
      return setNewArr(cb, depArr);
    }
  } else {
    setNewArr(cb, depArr);
  }
}
