# Canvas/WebGL Demo

为了做性能对比，一共移植了四个 Demo，这些 Demo 常用于浏览器自身的 Canvas/WebGL 性能测试，包括 [GUIMark3][1] 和 [WebGL Aquarium][2]。

<div style="text-align:center; padding:20px 0px"><img src="http://img.blog.csdn.net/2018021210453072" alt="Browser Render Pipeline"></img></div>

上图从左至右分别是：

1. Canvas Bitmap，修改自 [GUIMark3 Bitmap][3]，类似雷电的小游戏，多个小位图的重复绘制，主要测试 Canvas.drawImage 的性能，跟微信开发工具自带的样例游戏类似；
2. Canvas Compute，修改自 [GUIMark3 Compute][4]，模拟鸟群的运动，包含大量的物理运动计算，实际上是测试 JavaScript 的计算性能；
3. WebGL Compute，Canvas Compute 的 WebGL 版本，用 WebGL 绘制点取代 Canvas 绘制短线段；
4. WebGL Aqua，修改自 [WebGL Aquarium][2]，绘制的场景有一定的复杂度，包含了约 30 个模型；