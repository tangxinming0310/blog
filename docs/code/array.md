---
title: 数组
---
## 删除排序数组中的重复项
给定一个排序数组，你需要在 **原地** 删除重复出现的元素，使得每个元素只出现一次，返回移除后数组的新长度。

不要使用额外的数组空间，你必须在 **原地 修改输入数组** 并在使用 O(1) 额外空间的条件下完成。

示例1：
```js
给定数组 nums = [1,1,2], 

函数应该返回新的长度 2, 并且原数组 nums 的前两个元素被修改为 1, 2。 

你不需要考虑数组中超出新长度后面的元素。
```

示例2：
```js
给定 nums = [0,0,1,1,1,2,2,3,3,4],

函数应该返回新的长度 5, 并且原数组 nums 的前五个元素被修改为 0, 1, 2, 3, 4。

你不需要考虑数组中超出新长度后面的元素。
```
**说明:**

为什么返回数值是整数，但输出的答案是数组呢?

请注意，输入数组是以**「引用」**方式传递的，这意味着在函数里修改输入数组对于调用者是可见的。

你可以想象内部操作如下:
```
// nums 是以“引用”方式传递的。也就是说，不对实参做任何拷贝
int len = removeDuplicates(nums);

// 在函数里修改输入数组对于调用者是可见的。
// 根据你的函数返回的长度, 它会打印出数组中该长度范围内的所有元素。
for (int i = 0; i < len; i++) {
    print(nums[i]);
}
```
**思路：**
数组是有序的，我们可以放置两个指针 i 和 j，其中 i 是慢指针，而 j 是快指针。只要 nums[i] = nums[j]，我们就增加 j 以跳过重复项。

当我们遇到 nums[j] != nums[i] 时，跳过重复项的运行已经结束，因此我们必须把它（nums[j]）的值复制到 nums[i + 1]。然后递增 i，接着我们将再次重复相同的过程，直到 j 到达数组的末尾为止。

code:
```js
/**
 * @param {number[]} nums
 * @return {number}
 */
var removeDuplicates = function(nums) {
  let p1 = 0, p2 = 1
  while(p2 < nums.length) {
    if (nums[p1] !== nums[p2]) nums[++p1] = nums[p2++]
    else p2++
  }
  return p1 + 1
};
```

## 买卖股票的最佳时机 II
给定一个数组，它的第 i 个元素是一支给定股票第 i 天的价格。

设计一个算法来计算你所能获取的最大利润。你可以尽可能地完成更多的交易（多次买卖一支股票）。

**注意：**你不能同时参与多笔交易（你必须在再次购买前出售掉之前的股票）。  

示例1：
```js
输入: [7,1,5,3,6,4]
输出: 7
解释: 在第 2 天（股票价格 = 1）的时候买入，在第 3 天（股票价格 = 5）的时候卖出, 
      这笔交易所能获得利润 = 5-1 = 4 。随后，在第 4 天（股票价格 = 3）的时候买入，
      在第 5 天（股票价格 = 6）的时候卖出, 这笔交易所能获得利润 = 6-3 = 3 。
```

示例2：
```js
输入: [1,2,3,4,5]
输出: 4
解释: 在第 1 天（股票价格 = 1）的时候买入，在第 5 天 （股票价格 = 5）的时候卖出, 
     这笔交易所能获得利润 = 5-1 = 4 。注意你不能在第 1 天和第 2 天接连购买股票，
     之后再将它们卖出。因为这样属于同时参与了多笔交易，你必须在再次购买前出售掉之前的股票。
```  

示例3：
```js
输入: [7,6,4,3,1]
输出: 0
解释: 在这种情况下, 没有交易完成, 所以最大利润为 0。
```  

提示：

  + 1 <= prices.length <= 3 * 10 ^ 4
  + 0 <= prices[i] <= 10 ^ 4

code:  
```js
/**
 * @param {number[]} prices
 * @return {number}
 */
var maxProfit = function(prices) {
  if (!prices || prices.length < 1) return 0
  let profit = 0, len = prices.length
  for (let i = 0; i < len - 1; i++) {
    if (prices[i] < prices[i + 1]) profit += prices[i + 1] - prices[i]
  }
  return profit
}
```

## 旋转数组
给定一个数组，将数组中的元素向右移动 k 个位置，其中 k 是非负数。

示例1：
```js
输入: [1,2,3,4,5,6,7] 和 k = 3
输出: [5,6,7,1,2,3,4]
解释:
向右旋转 1 步: [7,1,2,3,4,5,6]
向右旋转 2 步: [6,7,1,2,3,4,5]
向右旋转 3 步: [5,6,7,1,2,3,4]
``` 


示例2：
```js
输入: [-1,-100,3,99] 和 k = 2
输出: [3,99,-1,-100]
解释: 
向右旋转 1 步: [99,-1,-100,3]
向右旋转 2 步: [3,99,-1,-100]
```   

code:
```js
/**
 * @param {number[]} nums
 * @param {number} k
 * @return {void} Do not return anything, modify nums in-place instead.
 */
var rotate = function(nums, k) {
  if (k === 0) return
  let len = nums.length
  if (k > len) k = k % len
  // 先反转整个数组
  reverse(nums, 0, len - 1)
  // 反转前 k 个数
  reverse(nums, 0, k - 1)
  // 反转k之后的数
  reverse(nums, k, len - 1)
};
// 辅助函数，旋转数组
function reverse(array, L, R) {
  while(L < R) {
    let temp = array[R]
    array[R] = array[L]
    array[L] = temp
    L++
    R--
  }
}
```

## 存在重复元素
给定一个整数数组，判断是否存在重复元素。

如果任意一值在数组中出现至少两次，函数返回 `true` 。如果数组中每个元素都不相同，则返回 `false` 。

示例 1:
```js
输入: [1,2,3,1]
输出: true
```

示例 2:
```js
输入: [1,2,3,4]
输出: false
```

示例 3:
```js
输入: [1,1,1,3,3,4,3,2,4,2]
输出: true
```

code:
```js
/**
 * @param {number[]} nums
 * @return {boolean}
 */
var containsDuplicate = function(nums) {
  let len = nums.length
  if (!nums || len < 1) return false
  let map = new Map()
  for (let i = 0; i < len; i++) {
    if (map.get(nums[i])) {
      return true
    }
    map.set(nums[i], 1)
  }
  return false
}
```

## 只出现一次的数字
给定一个非空整数数组，除了某个元素只出现一次以外，其余每个元素均出现两次。找出那个只出现了一次的元素。

示例 1:
```js
输入: [2,2,1]
输出: 1
```

示例 2:
```js
输入: [4,1,2,1,2]
输出: 4
```

code:
```js
/**
 * @param {number[]} nums
 * @return {number}
 */
var singleNumber = function(nums) {
  let ret = nums[0]
  for (let i = 1, len = nums.length; i < len; i++) {
    ret = ret ^ nums[i]
  }
  return ret
}
```  

## 两个数组的交集 II
给定两个数组，编写一个函数来计算它们的交集。

示例 1:
```js
输入: nums1 = [1,2,2,1], nums2 = [2,2]
输出: [2,2]
```
示例 2:
```js
输入: nums1 = [4,9,5], nums2 = [9,4,9,8,4]
输出: [4,9]
```
说明：

  + 输出结果中每个元素出现的次数，应与元素在两个数组中出现的次数一致。
  + 我们可以不考虑输出结果的顺序。

code:
解法一：
利用map
```js
/**
 * @param {number[]} nums1
 * @param {number[]} nums2
 * @return {number[]}
 */
var intersect = function(nums1, nums2) {
  let map = new Map()
  for (let i = 0, len = nums1.length; i < len; i++) {
    if (map.get(nums1[i])) {
      let count = map.get(nums1[i])
      map.set(nums1[i], count+1)
    } else {
      map.set(nums1[i], 1)
    }
  }
  let ret = []
  for (let j = 0, len = nums2.length; j < len; j++) {
    if (map.get(nums2[j]) > 0) {
      ret.push(nums2[j])
      let count = map.get(nums2[j])
      map.set(nums2[j], count-1)
    }
  }
  return ret
}
```

解法二：
因为不要求输出顺序，可以先对数组排序，然后利用双指针
```js
/**
 * @param {number[]} nums1
 * @param {number[]} nums2
 * @return {number[]}
 */
var intersect = function(nums1, nums2) {
  const sortRule = (a, b) => a- b
  nums1.sort(sortRule) 
  nums2.sort(sortRule)
  let p1 = 0, 
      p2 = 0,
      ret = []
  while(p1 < nums1.length && p2 < nums2.length) {
    if (nums1[p1] > nums2[p2]) p2++
    else if (nums[p1] < nums2[p2]) p1++
    else {
      ret.push(nums[p1++])
      p2++
    }
  }
  return ret
}
```

## 在有序二维数组中查找一个数字是否存在
假如数组横向和纵向都有序，给定一个数字，查找是否在改数组中存在

示例:
```js
let arr = [
		[1, 3, 5, 6],
		[2, 5, 7, 9],
		[4, 6, 8, 10]
]
给定数字 6
返回 true
```

思路，从右上角开始查找，因为数组有序，所以如果比要查找的数字大则向左移动，小的话向下移动

code:

```js
var findNumber = function (arr, target) {
  let x = 0,
      y = arr[0].length
  while(x <= arr.length - 1 && y >= 0) {
    if (arr[x][y] > target) {
      y--
    } else if (arr[x][y] < target) {
      x++
    } else {
      return true
    }
  }
  return false
}
```