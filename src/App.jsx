// const { createRoot } = ReactDOM;
// const { useState, useReducer, useEffect, memo } = React;
// const { useMemo } = React;

// const root = createRoot(document.getElementById("app"));
import {
  root,
  useState,
  useReducer,
  useEffect,
  memo,
  useMemo,
  useCallback,
} from "./React";

function countReducer(count, { type, payload }) {
  switch (type) {
    case "PLUS":
      return count + payload;
      break;
    case "MINUS":
      return count - payload;
      break;
    default:
      return count;
      break;
  }
}

const Child = memo((props) => {
  console.log("Child 子组件开始渲染");

  return (
    <div>
      <h1>Child's count2: {props.count2}</h1>
    </div>
  );
});

const ChildSecond = memo((props) => {
  console.log("ChildSecond 子组件开始渲染");
  const { childData, cbSetCount2 } = props;

  return (
    <div>
      <h1>ChildSecond's count2: {childData.count2}</h1>
      <button onClick={cbSetCount2}>+</button>
    </div>
  );
});

function App() {
  const [count1, setCount1] = useState(0);
  const [count2, setCount2] = useState(20);

  const [count3, dispatch] = useReducer(countReducer, 0);

  console.log("begging~");
  useEffect(() => {
    console.log("count1 -> effect", count1);
    console.log("setTimeout", count1);
    return () => console.log("clear setTimeout", count1);
  }, [count1]);

  useEffect(() => {
    console.log("count2 -> effect", count2);
  }, [count2]);

  const childData = useMemo(() => ({ count2 }), [count2]);
  const cbSetCount2 = useCallback(() => {
    setCount2((count) => count + 1);
  }, []);

  return (
    <div>
      <div>{count1}</div>
      <button onClick={() => setCount1(count1 + 1)}>+1</button>
      <button onClick={() => setCount1(count1 - 1)}>-1</button>

      <div>{count2}</div>
      <button onClick={() => setCount2(count2 + 1)}>+1</button>
      <button onClick={() => setCount2(count2 - 1)}>-1</button>

      {/* useReducer */}
      <div>{count3}</div>
      <button onClick={() => dispatch({ type: "PLUS", payload: 2 })}>
        Reducer +
      </button>
      <button onClick={() => dispatch({ type: "MINUS", payload: 3 })}>
        Reducer -
      </button>

      {/* memo */}
      <Child count2={count2} />

      {/* useMemo */}
      <ChildSecond childData={childData} cbSetCount2={cbSetCount2} />
    </div>
  );
}

root.render(<App />);

export default App;
