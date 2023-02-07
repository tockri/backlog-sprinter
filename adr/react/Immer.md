# Immer

# Context

* コード全体をImmutableにしたい
* State変更のコードを短くしたい

# Decision

Immerを採用する

# Result

## 1. 手軽にImmutableにできる

例：普通はこう書くところが
```typescript
type Hobby = {
  readonly name: string
  readonly imageUrl: string
}
type User = {
  readonly id: number
  readonly name: string
  readonly hobbies: ReadonlyArray<Hobby>
}
```
下のようになる。短い！
```typescript
type Hobby = Immutable<{
  name: string
  imageUrl: string
}>
type User = Immutable<{
  id: number
  name: string
  hobbies: Hobby[]
}>
```

## 2. Immutableなオブジェクトを変更するコードが劇的に書きやすくなる

上記Userオブジェクトのhobbiesの一つを名前変更する場合

普通はこう書くところが（書くのも読むのも面倒）
```typescript
const changeHobbyName = (user: User, index: number, newName: string): User => ({
  ...user,
  hobbies: user.hobbies.map((hobby, idx) => 
    idx === index 
      ? {...hobby, name: newName} 
      : hobby)
})
```
こうなる。書きやすい、読みやすい！
```typescript
const changeHobbyName = (user: User, index: number, newName: string): User => 
  produce(user, (u) => {
    if (index < u.hobbies.length) {
      u.hobbies[index].name = newName
    }
  })
```

なお、引数で渡ってきたImmutableな値をArrayに追加する場合は`WritableDraft<T>`にキャストする必要がある。
```typescript
const addHobby = (user: User, newHobby: Hobby): User =>
  produce(user, (u) => {
    u.hobbies.push(newHobby as WritableDraft<Hobby>) // キャスト
  })
```

