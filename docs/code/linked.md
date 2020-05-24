---
title: 链表
---

## 反转单向链表
code:
```js
function reverseList(head) {
  let pre = null,
      cur = head,
      temp = null

  while(cur != null) {
    temp = cur.next
    cur.next = pre
    pre = cur
    cur = temp
  }
  return pre
}
```
## 反转双向链表
code:
```js
function reverseList(head){
  let pre = null,
      next = null
  while(head != null) {
    next = head.next
    head.next = pre
    head.last = next
    pre = head
    head = next
  }
  return pre
}
```