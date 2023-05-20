# Modelのテスト

## Context

* [コンポーネントをView, Model, Stateの構成で作る](./component-code-structure.md)ことで、Jotaiの利点を活かしつつ短いコードで開発できるようになった
* StateやModelをテストしたい

## Decision

[CustomHookTester](../../test/util/CustomHookTester.tsx)を使ってModelのカスタムフックのテストをしよう

## Result


### テストの書き方 1. Modelのカスタムフック関数に引数が必要ない例

実例 [AddIssueTypeModel.test.ts](../../src/content/project/settings/AddIssueTypeModel.test.ts)

#### 1-1. ファイル冒頭
```typescript
/**
 * @jest-environment jsdom
 */
```

#### 1-2. テスト対象のカスタムフック関数を指定してCustomHookTesterインスタンスを作る

```typescript
const tester = CustomHookTester.create(useXXXXXModel)
```

#### 1-3. JotaiのProviderに初期値を与えながらテスト用コンポーネントを開始する
内部でReact Testing Libraryの`render`を実行している。
```typescript
// CustomHookTester内部で用意してあるテスト用コンポーネントを使うのでProviderの初期化だけ書く
await tester.renderFixture((set) => {
  set(YYYYState.atom, .....)
  set(ZZZZState.atom, .....)
   :
})
```

#### 1-4. テスト対象のModelオブジェクトをJestのMatcherでテストする
```typescript
tester.test((model) => {
  expect(model.xxxData).toStrictEqual({
    :
    :
    :
  })
})
```

#### 1-5. Component再描画を伴うメソッドを呼んでから再度テスト
内部でReact Testing Libraryの`act`を実行している。
```typescript
await tester.act(async (model) => {
  await model.submitXXX()
})

// 複数のAtomを非同期に更新するなどしていてコンポーネント再描画が複数回起こる場合はwait()を挟む
await tester.wait()

tester.test((model) => {
  expect(model.xxxData).toStrictEqual({
    :
    :
    :
  })
})
```


### テストの書き方 2. Modelのカスタムフック関数の引数に他のAtomの値が必要な場合

実例 [PBISubListModel.test.tsx](../../src/content/project/productBacklog/PBIList/PBISubListModel.test.tsx)

ファイル名を".tsx"にする必要がある。
コードの書き方は「引数が必要ない例」のrenderのところだけ異なる。

#### 2-1、 2-2 まで
1.1、1-2 と同じ

#### 2-3. JotaiのProviderに初期値を与えながらテスト用コンポーネントを開始する

```typescript jsx
type Model = ReturnType<typeof useXXXXXModel>
type Args = Parameters<typeof useXXXXXModel>

// テスト用コンポーネントを自分で作る
const TestView: React.FC<{ tester: CustomHookTester<Model, Args> }> = ({tester}) => {
  const parentData = useAtomValue(YYYYState.atom)
  // 他のAtomから加工した値を useXXXXXModel にわたす
  const model = tester.useTarget(parentData.some.infomation)
  return model.isReady ? tester.probeElement() : <></>
}

await tester.renderComponent((set) => {
  set(YYYYState.atom, .....)
  set(ZZZZState.atom, .....)
:
}, () => <TestView tester={tester} />)
```

#### 2-4以降
1.4以降と同じ
