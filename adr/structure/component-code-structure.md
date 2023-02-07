# Component周りのコードの構造と命名規則

# Context

[jotaiのAtomにAPIなどのIOとState変更ロジックをまとめた](../react/jotai.md)ことにより、Component中で直接APIを呼ぶコードが消えた。
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

以下のような命名規則、ディレクトリ構造にする。

## ディレクトリ、ファイル名規則

境界づけられたドメインのディレクトリ以下をこのように分割する。
○○○Stateはドメイン内で共有されるので、共有範囲直下の`state`ディレクトリに平たく置く。
```text
src/(path)/(to)/(domain)/
    state/
        SomethingState.ts   ...... 関心事「Something」のAtom
        AnotherThingState.ts ..... 関心事「AnotherThing」のAtom
    (path)/(to)/(component)
        MyAppView.tsx ... React Component。"View"サフィックス
        MyAppModel.ts ... `MyAppView`のJSX以外のロジック。"Model"サフィックス
```

## Atomのファイル内構造 （架空の例：`SomethingsState.ts`）

型`Something`の配列を扱うAtomの例を記載する。名前はSomethingの複数形でSomethingsとしたが、SomethingListなども考えられる。

実例は[PBIListState.ts](../../src/content/project/productBacklog/state/PBIListState.ts)にある。

### 型宣言
```typescript
// 関心事の中心データ型。ImmerのImmutable型を利用している。
// ここで宣言するのではなくAPIを扱うモジュールからimportするる場合もある。
export type Something = Immutable<{
  id: number
  name: string
  address: string
}>

// 追加アクション
// Actionの型名は動詞、または動詞＋目的語＋"Action"
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

// アクションのUnion typeは公開する
export type SometingAction = AddAction | DeleteAction
```
`export`しているtypeはすべて「Something」プレフィックス。

### 初期値の取得
```typescript
import {Read} from "../../src/content/util/JotaiUtil"

// イニシャライザ
// プライベートメンバーにプレフィックスをつけるかは自由。ここでは「st」をつけた。
const stRead:Read<Promise<ReadonlyArray<Something>>> = async (get) => {
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
型`Read`はjotaiでexportされていないため[JotaiUtil](../../src/content/util/JotaiUtil.ts)にコピーして置いたのでそれを使う。


### 更新
```typescript
import {Write} from "../../src/content/util/JotaiUtil"

// 追加アクションによる処理。
const stAdd: Write<AddAction> = async (get, set, action) => {
  const {name, address} = action
  const api = get(Api.atom)
  const added = await api.addSomething({name, address})
  const prev = get(stAtom)
  
  // 更新後の値を保存用Atomに保存
  set(stStoreAtom,
    // Immerを使う更新コード。短い！
    produce(prev, (draft) => {
      draft.push(added as WritableDraft<Something>) // Immutableなオブジェクトをpushするにはキャストが必要
    })
  )
}
```
型`Write`はjotaiでexportされていないため[JotaiUtil](../../src/content/util/JotaiUtil.ts)にコピーして置いたのでそれを使う。

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

実例の[PBIListState.ts](../../src/content/project/productBacklog/state/PBIListState.ts)では、ここまでの構成を少し便利にするため、[JotaiUtil.asyncAtomWithAction](../../src/content/util/JotaiUtil.ts)を利用している。

本質的ではない`stStoreAtom`が関数中に隠蔽されている。

### export
```typescript
// 名前空間をコンパクトに保つため、一つの関心事につき一つのオブジェクトだけexportする。サフィックス「State」
export const SomethingsState = {
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
  // UIで使いたい情報とActionを渡す関数
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
  // Stateに関する処理をmodelに移したので、JSXの構築だけ行う
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

際限なく長くなっていく関数がなくなった。
