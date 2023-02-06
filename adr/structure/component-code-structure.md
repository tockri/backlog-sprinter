# Component周りのコードの構造と命名規則

# Context

AtomにAPIなどのIOとState変更ロジックをまとめたことにより、Component中でAPIを呼ぶコードが消えた。
コンポーネントで行う処理は以下の4つになった。

1. 複数のAtomからStateを収集する
2. 収集したStateデータをJSXに反映する
3. UIイベントからActionオブジェクトを作る
4. AtomのSetterに渡す

残っている問題は

* コンポーネントのJSX以外の部分が長くなりがち
* コンポーネントから参照する複数のatomやActionの名前がコンフリクトしがち
* AtomのSetterが長くなりがち

# Decision

以下のような規則、ディレクトリ構造にする。

## ディレクトリ、ファイル名規則
```text
src/path/to/domain/
    state/
        Something.ts   .... 関心事「Something」のAtom
        AnotherThing.ts ... 関心事「AnotherThing」のAtom
  
    SomethingView.tsx ..... 関心事「Something」を表示するReact Component。"View"サフィックス
    SomethingModel.ts ..... `SomethingView`のJSX以外のロジック。"Model"サフィックス
```

## Atomのファイル内構造 （架空の例：`Something.ts`）

実例は[ProductBacklog.ts](../../src/content/project/productBacklog/state/ProductBacklog.ts)にあります。

### 型宣言
```typescript
// 関心事の中心データ型。ImmerのImmutable型を利用している
export type Something = Immutable<{
  id: number
  name: string
  address: string
}>
// 追加アクション
type AddAction = {
  type: "Add"
  name: string
  address: string
}
// 削除アクション
type DeleteAction = {
  type: "Delete"
  id: number
}
// アクションのスーパークラス
export type SometingAction = AddAction | DeleteAction
```
`export`しているtypeはすべて「Something」プレフィックス。

### 初期値の取得
```typescript
// イニシャライザ
const stRead = async (get: Getter): Promise<ReadonlyArray<Something>> => {
  const stored = get(stStoreAtom)
  if (stored) {
    // 保存用Atomに値が存在すればAPIを呼ばない
    return stored
  } else {
    // APIを呼ぶオブジェクトをAtomから取得することでモックに入れ替え可能
    const api = get(Api.atom)
    // 例：Somethingオブジェクトを複数取得
    return await api.getSomethings()
  }
}
```
Getterの型は[JotaiUtil](../../src/content/util/JotaiUtil.ts)でexportしているのでそれを使う。

「Something」を扱うプライベートメンバーにプレフィックスをつけるかは自由。ここでは「st」をつける。

### 更新
```typescript
// 追加アクションによる処理
const stAdd: Write<AddAction> = async (get, set, action) => {
  const {name, address} = action
  const api = get(Api.atom)
  const added = await api.addSomething({name, address})
  const prev = get(stAtom)
  // 更新後の値を保存用Atomに保存
  set(stStoreAtom,
    // Immerを使う更新コード
    produce(prev, (draft) => {
      draft.push(added as WritableDraft<Something>)
    }))
}
```

### Atomの構成
```typescript
// 値を保存する用
const stStoreAtom = atom<ReadonlyArray<Something> | null>(null)

// インターフェイス用。SetterにActionを渡す仕様
const stAtom = atom(
  // イニシャライザ
  stRead,
  // SetterをActionのtypeごとに分割している。
  async (get, set, action: SomethingAction) => {
  switch(action.type) {
    case "Add":
      await stAdd(get, set, action)
      break
    case "Delete":
      await stDelete(get, set, action)
      break
  }
})
```

### export
```typescript
// 名前空間をコンパクトに保つため、一つのモジュールに一つの定数だけexportする
export const SomethingsAtom = {
  // "atom"という名前でAtomを公開
  atom: stAtom,
  // "Action"という名前でAction生成関数をまとめる
  Action: {
    // Actionオブジェクトを生成する関数として公開
    Add: (name:string, address:string): AddAction => ({
      type: "Add",
      name,
      address
    }),
    Delete: (id: number): DeleteAction => ({
      type: "Delete",
      id
    })
  }
}
```

## Modelのコード例（架空の例：`SomethingModel.ts`）

```typescript
// カスタムフックとしてStateとActionに関わる処理を実装
export const useSomethingModel = () => {
  const [something, dispatch] = useAtom(SomethingsAtom.atom)
  return {
    add: (name: string, address: string) => {
      dispatch(SomethingsAtom.Action.Add(name, address))
    },
    delete: (id: number) => {
      dispatch(SomethingsAtom.Action.Delete(id))
    }
  }
}
```

## Viewのコード例（架空の例：`SomethingView.tsx`）

```typescript jsx
export const SomethingView: React.FC = () => {
  const model = useSomethingModel()
  return (<div>
    ....
    <button onClick={() => model.add(name, address)}>追加する</button>
    ...
    ..
  </div>)
}
```


# Result

長くなったり複雑になる部分がなくなった。
