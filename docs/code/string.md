---
title: 字符串
---
## 反转字符串
编写一个函数，其作用是将输入的字符串反转过来。输入字符串以字符数组 `char[]` 的形式给出。

不要给另外的数组分配额外的空间，你必须原地修改输入数组、使用 O(1) 的额外空间解决这一问题。

你可以假设数组中的所有字符都是 ASCII 码表中的可打印字符

示例 1：
```js
输入：["h","e","l","l","o"]
输出：["o","l","l","e","h"]
```

示例 2：
```js
输入：["H","a","n","n","a","h"]
输出：["h","a","n","n","a","H"]
```

code:
```js
/**
 * @param {character[]} s
 * @return {void} Do not return anything, modify s in-place instead.
 */
var reverseString = function(s) {
  if (!s || s.length < 2) return
  let L = 0, R = s.length - 1
  while(L < R){
    let tempChar = s[R]
    s[R] = s[L]
    s[L++] = tempChar
    R--
  }
};
```

## 字符串中的第一个唯一字符
给定一个字符串，找到它的第一个不重复的字符，并返回它的索引。如果不存在，则返回 -1。

案例:
```js
s = "leetcode"
返回 0.

s = "loveleetcode",
返回 2.
```

code:
```js
/**
 * @param {string} s
 * @return {number}
 */
var firstUniqChar = function(s) {
  let map = {}
  let len = s.length
  for (let i = 0; i < len; i++) {
      if (!map[s[i]]) map[s[i]] = 1
      else map[s[i]]++
  }
  for (let i = 0; i < len; i++) {
      if (map[s[i]] === 1) return i
  }
  return -1
}
```
最简单的写法，利用库函数
```js
/**
 * @param {string} s
 * @return {number}
 */
var firstUniqChar = function(s) {
  let len = s.length
  for (let i = 0; i < len; i++) {
      if (s.indexOf(s[i]) === s.lastIndexOf(s[i])) return i
  }
  return -1
}
```