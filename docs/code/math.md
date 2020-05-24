---
title: 其它类型
---

## 顺时针旋转正方形
已知数组是正方形，行列均相等
列子：
```js
arr = [
  [[1, 2, 3, 4],
  [5, 6, 7, 8],
  [9, 10, 11, 12],
  [13, 14, 15, 16]
]
旋转完成后：
arr = [
  [13, 9, 5, 1],
  [14, 10, 6, 2],
  [15, 11, 7, 3],
  [16, 12, 8, 4]
]
```

空间复杂度O(1)

思路：分圈旋转，先转最外圈，在转里面圈
<img class="custom" :src="$withBase('/rotate.png')" alt="rotate">  

code:
```js
function rotate(matrix) {
  let tR = 0, tC = 0 // 定义左上角的点
  let dR = matrix.length - 1, dC = matrix[0].length - 1 // 定义右上角的点
  while(tR < dR) {
    rotateEdge(matrix, tR++, tC++, dR--, dC--)
  }
}
function rotateEdge(m, tR, tC, dR, dC){
  let times = dC - tC
  let temp = 0
  for (let i = 0; i < times; i++) {
    temp = m[tR][tC + i]
    m[tR][tC + i] = m[dR - i][tC]
    m[dR - i][tC] = m[dR][dC - i]
    m[dR][dC - i] = m[tR + i][dC]
    m[tR + i][dC] = temp
  }
}
```
## 转圈打印矩阵
顺时针转圈打印矩阵

示例 1：
```
输入：matrix = [[1,2,3],[4,5,6],[7,8,9]]
输出：[1,2,3,6,9,8,7,4,5]
```

示例 2：
```
输入：matrix = [[1,2,3,4],[5,6,7,8],[9,10,11,12]]
输出：[1,2,3,4,8,12,11,10,9,5,6,7]
```

code:
```js
function spiralOrder(matrix){
  let tR = 0, tC = 0
  let dR = matrix.length - 1, dC = matrix[0].length - 1
  let res = []
  while(tR <= dR && tC <= dC){
    logInfo(res, tR++, tC++, dR--, dC--, res)
  }
  return res
}
function logInfo(m, tR, tC, dR, dC, res) {
  if (tR === dR) {
    for (let i = tC; i <= dC; i++) {
      res.push(m[tR][i])
    }
  } else if (tC === dC) {
    for (let i = tR; i <= dR; i++) {
      res.push(m[i][tC])
    }
  } else {
    let currC = tC, currR = tR
    while(currC < dC) {
      res.push(m[tR][currC++])
    }
    while(currR < dR) {
      res.push(m[currR++][dC])
    }
    while(currC > tC) {
      res.push(m[dR][currC--])
    }
    while(currR > tR) {
      res.push(m[currR--][tC])
    }
  }
}
```

## Z字型打印矩阵

示例 1：
```
输入：matrix = [[1,2,3],[4,5,6],[7,8,9]]
输出：[1, 2, 4, 7, 5, 3, 6, 8, 9]
```

示例 2：
```
输入：matrix = [[1,2,3,4],[5,6,7,8],[9,10,11,12]]
输出：[1, 2, 5, 9, 6, 3, 4, 7, 10, 11, 8, 12]
```

思路：
给定两个点a, b，都从左上角出发，然后a点向右走，走到最右边向下走，b点向下走，走到最下面向右走，然后打印每次a和b构成的斜线，约定一个变量fromUp,决定是从右上打印到左下，还是从左下打印到右上
<img class="custom" :src="$withBase('/zPrint.png')" alt="zPrint">  
code:

```js
function zPrint(matrix) {
  let aR = 0, aC = 0
  let bR = 0, bC = 0
  let endR = matrix.length - 1
  let endC = matrix[0].length - 1
  let res = []
  let fromUp = false
  while(aR !== endR + 1) {
    printLevel(matrix, aR, aC, bR, bC, fromUp, res)
    aR = aC === endC ? aR + 1 : aR
    aC = aC === endC ? aC : aC + 1
    bR = bR === endR ? bR : bR + 1
    bC = bR === endR ? bC + 1 : bC
    fromUp = !fromUp
  }
}
function printLevel(m, aR, aC, bR, bC, f, res) {
  if (f) {
    while(aR !== bR + 1) {
      res.push(m[aR++][aC--])
    }
  } else {
    while(bR !== aR - 1) {
      res.push(m[bR--][bC++])
    }
  }
}
```