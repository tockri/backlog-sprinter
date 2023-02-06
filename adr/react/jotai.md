# Jotai

https://jotai.org/

"An atomic approach to global React state management with a model inspired by Recoil"

# Context

* Jotaiには、Recoilには無い以下の2つの機能がある。
    * コンポーネントからatomに簡単に初期値を与えられる。初期値が読み込まれるタイミングは仮想DOMにマウントされたとき
    * イニシャライザを使うatom（recoilでいうselector）では、readだけでなくwriteでもPromiseを扱える
* API呼び出しをすべてJotaiのatom内に入れれば、仮想DOMにマウントされてからアンマウントされるまで有効なキャッシュ機構を備えたAPI呼び出しを作れる。
* 実際にAPI呼び出しをしているオブジェクトをJotaiのatomに入れて管理することで、storybookなどでダミーオブジェクトに差し替えることも可能。
* 実際に書いてみると、Reducerに当たる部分を省略したほうが構成をシンプルにできることに気づいた。

# Decision

* Jotaiを採用する。
* atomの中にAPIから情報を取得するコード、APIに情報を送信して、その返り値でStateを更新するコードを書く。

# Result

## APIから情報を取得してStateの初期値とする

atomのイニシャライザ中でAPIをコールし、Stateオブジェクトを組み上げて返すと初期値となる。

イニシャライザ例：[`ProductBacklog.ts` 内 `pbRead` 関数](../../src/content/project/productBacklog/state/ProductBacklog.ts)
```typescript
const api = get(Api.atom)
const conf = get(AppConfig.atom)
const milestones = get(Milestones.atom)
const today = new Date()
const milestoneFilter = milestones.filter(
(ms) =>
  !ms.archived &&
  ms.startDate &&
  ms.releaseDueDate &&
  DateUtil.diffDays(today, new Date(ms.releaseDueDate)) > -3
)
const list = await api.issue.searchInIssueTypeAndMilestones(project, conf.pbiIssueTypeId, milestoneFilter)
return PBIListDataHandler.nestIssues(list, orderCustomField)
```

## Stateの更新

Immerと一緒に使うことでState更新のコードが劇的に短くなった。

### (Before) Reducerを使う場合（例：React.useReducer）

1. UIでイベント発生
2. Stateに保存されている情報を使ってAPIを呼ぶための情報を集める
3. APIを非同期（Promise）で呼ぶ
4. API返り値とStateに保存されている情報を使ってActionを作る
5. ReducerにActionを渡して、Stateを変更する

2から5までは本質的に一連の処理。APIを呼ぶことと状態の変更ロジック（Reducer）を分離すると綺麗に見えるが不要なコードが多い。
なおかつ2と4でStateに保存されている情報にアクセスするところはほぼ同じなので無駄に冗長。

### (After) Jotai+Immerを使う場合

atomのSetterにロジック＋IOを詰め込んでしまう方法。

1. UIでイベント発生
2. イベントの情報のみからActionを作り、JotaiのSetterに渡す
3. Setter中で
    1. State（atom）に保存されている情報を使ってAPIを呼ぶための情報を集める
    2. APIを非同期（Promise）で呼ぶ
    3. API返り値を使ってStateを更新する。

一連の処理を1関数の中に収めてしまえるのが嬉しい。

Setter例：[`ProductBacklog.ts` 内 `pbAddMilestone` 関数](../../src/content/project/productBacklog/state/ProductBacklog.ts)
```typescript
// 複数のAtomから値を収集
const prev = get(productBacklogAtom)
const api = get(Api.atom)
const project = get(ProjectAtom.atom)
// APIを非同期で呼ぶ
const created = await api.projectInfo.addMilestone(project.id, action.input)
// 返り値を使って複数のAtomの値を更新
set(Milestones.atom, (c) => {
  c.push(created as WritableDraft<Version>)
})
set(pbiListDataStoreAtom, produce(prev, (draft) => {
  PBIListDataHandler.mutateByAddingMilestone(draft, created)
}))
```
