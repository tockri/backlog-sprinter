# Jotai

https://jotai.org/

"An atomic approach to global React state management with a model inspired by Recoil"

# Context

* Jotaiには、Recoilには無い以下の2つの機能がある。
    * コンポーネントからatomに簡単に初期値を与えられる。初期値が読み込まれるタイミングは仮想DOMにマウントされたとき
    * イニシャライザを使うatom（recoilでいうselector）では、readだけでなくwriteでもPromiseを扱える
* さらに、Atomが保持している（正確にはProviderが保持している）値は参照するコンポーネントが仮想DOMからアンマウントされると消えるので、API呼び出しをすべてJotaiのatom内に入れれば、仮想DOMにマウントされてからアンマウントされるまで有効なキャッシュ機構を備えたAPI呼び出しを作れる。
* 実際にAPI呼び出しをしているオブジェクトをJotaiのatomに入れて管理することで、storybookなどでダミーオブジェクトに差し替えることも可能。
* 実際に書いてみると、Reducerに当たる部分を省略したほうが構成をシンプルにできることに気づいた。

# Decision

* Jotaiを採用する。
* atomの中にAPIの読み書きとState更新の処理を一緒に含める。

# Result

Atomの書き方を標準化することでコードをクリーンに保てる。

以下、Atomの書き方を実例をもとに解説する。

## APIから情報を取得してStateの初期値とする

atomのイニシャライザ中でAPIをコールし、Stateオブジェクトを組み上げて返すと初期値となる。

イニシャライザ例：[PBIListState.ts](../../src/content/project/productBacklog/state/PBIListState.ts)内 `pbRead` 関数

※ 説明用のため、実際のコードとは異なる

```typescript
// 周りのatomから値を収集する
const project = get(ProjectState.atom)
const api = get(Api.atom) // api呼び出し用オブジェクトもatomに入っている
const conf = get(AppConfState.atom)
const milestones = get(MilestonesState.atom)
const today = new Date()

// APIリクエスト用オブジェクトを作る
const milestoneFilter = milestones.filter(
  (ms) =>
    !ms.archived &&
    ms.startDate &&
    ms.releaseDueDate &&
    DateUtil.diffDays(today, new Date(ms.releaseDueDate)) > -3
)

// APIを呼ぶ
const list = await api.issue.searchInIssueTypeAndMilestones(project, conf.pbiIssueTypeId, milestoneFilter)

// APIから返ってきた値をコンポーネントで使いやすく加工したものをAtomの初期値とする
return PBIListFunc.nestIssues(list, orderCustomField)
```

## Stateの更新

Setterを非同期にできることにより、API実行とState更新を一続きに書けるようになり、読みやすくなった。

### (Before) Reducerを使う場合（例：React.useReducer）

1. UIでイベント発生
2. Stateに保存されている情報を使ってAPIを呼ぶための情報を集める
3. APIを非同期（Promise）で呼ぶ
4. API返り値とStateに保存されている情報を使ってActionを作りReducerに渡す
5. Reducerの処理でStateを変更する

2から5までは本質的に一連の処理。APIを呼ぶことと状態の変更ロジック（Reducer）を分離すると一見綺麗に見えるが不要なコードが多くなる。
なおかつ2と4でStateに保存されている情報にアクセスするところはほぼ同じなので無駄に冗長。

RecoilのselectorではSetterに非同期のコードを書けないので、どうしても3, 4, 5を別の場所に書く必要があった。

### (After) Jotaiを使う場合

atomのSetterにロジック＋IOを詰め込んでしまう方法。

1. UIでイベント発生
2. イベントの情報のみからActionを作り、JotaiのSetterに渡す
3. Setter中で
    1. State（atom）に保存されている情報を使ってAPIを呼ぶための情報を集める
    2. APIを非同期（Promise）で呼ぶ
    3. API返り値を使ってStateを更新する。（さらに[Immer](./Immer.md)を利用することで簡潔になった）

一連の処理を1関数の中に収めてしまえるのが嬉しい。

Setter例：[ProjectInfoState.ts](src/content/state/ProjectInfoState.ts)内、`issueTypesAtom` のSetter

※ 説明用のため、実際のコードとは異なる

```typescript
async (get: WriteGetter, set: Setter, action: IssueTypesAction) => {
  if (action.type === "Create") {
    // 他のAtomから情報を集める
    const api = get(Api.atom)
    const project = get(projectAtom)
    
    // APIを呼ぶ
    const created = await api.projectInfo.createIssueType({
      projectId: project.id,
      name: action.name,
      color: action.color
    })
    
    // 複数のAtomの値を更新する
    set(AppConfState.atom, (curr) => 
      produce(curr, (c) => {
        c.pbiIssueTypeId = created.id
      })
    )
    set(issueTypesStoreAtom, (curr) => 
      produce(curr, (draft) => {
        draft.splice(0, 0, created as WritableDraft<IssueType>)
      })
    )
  }
}
```

# 続き
[ファイル名、命名規則、構成方法について](../structure/component-code-structure.md)
