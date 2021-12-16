"use strict";

function main() {
	// Get A WebGL context
	var canvas = document.querySelector("#c");
	var gl = canvas.getContext("webgl");
	if (!gl) {
		return;
	}

	// 在GPU上创建了一个GLSL着色程序
	var program = createProgramFromScripts(gl, ["vertex-shader-2d", "fragment-shader-2d"]);

	// 从刚才创建的GLSL着色程序中找到a_position属性值所在的位置。
	var positionAttributeLocation = gl.getAttribLocation(program, "a_position");

	// 从刚才创建的GLSL着色程序中找到全局变量u_resolution属性值所在的位置。
	var resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");

	var colorUniformLocation = gl.getUniformLocation(program, "u_color");

	// 属性值从缓冲中获取数据，所以我们创建一个缓冲
	var positionBuffer = gl.createBuffer();

	// 绑定位置信息缓冲（下面的绑定点就是ARRAY_BUFFER）。
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

	//   var positions = [
	//     0, 0,
	//     80, 20,
	//     10, 30,
	//     10, 30,
	//     80, 20,
	//     80, 30,
	//   ];
	//    // 绑定一个数据源到绑定点，然后可以引用绑定点指向该数据源。
	//   gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

	// canvas大小：
	resizeCanvasToDisplaySize(gl.canvas);

	// 把提供的gl_Position裁剪空间坐标对应到画布像素坐标（屏幕空间）
	gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

	// Clear the canvas
	gl.clearColor(0, 0, 0, 0);
	gl.clear(gl.COLOR_BUFFER_BIT);

	// 告诉它用我们之前写好的着色程序（一个着色器对）
	gl.useProgram(program);

	// 启用对应属性，告诉WebGL怎么从我们之前准备的缓冲中获取数据给着色器中的属性
	gl.enableVertexAttribArray(positionAttributeLocation);

	// 将绑定点绑定到缓冲数据（positionBuffer）.
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

	// 告诉属性怎么从positionBuffer中读取数据 (ARRAY_BUFFER)
	var size = 2;          // 每次迭代运行提取两个单位数据
	/**
	 * vec4是一个有四个浮点数据的数据类型,vec2和vec4有些类似但是仅有x和y值。
	 * 相当于a_position = {x: 0, y: 0, z: 0, w: 0}，属性默认值是0, 0, 0, 1
	 * 设置的size = 2
	 * 会从缓冲中获取前两个值（ x 和 y ）， z和w还是默认值 0 和 1 
	 */

	var type = gl.FLOAT;   // 每个单位的数据类型是32位浮点型
	var normalize = false; // 不需要归一化数据
	var stride = 0;        // 0 = 移动单位数量 * 每个单位占用内存（sizeof(type)）// 每次迭代运行运动多少内存到下一个数据开始点
	var offset = 0;        // 从缓冲起始位置开始读取
	// 将属性绑定到当前的ARRAY_BUFFER(就是属性绑定到了positionBuffer上),
	gl.vertexAttribPointer(
		positionAttributeLocation, size, type, normalize, stride, offset);

	// 通过设置u_resolution为画布的分辨率， 着色器从positionBuffer中获取像素坐标将之转换为对应的裁剪空间坐标。
	gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

	// 绘制50个随机颜色矩形
	for (var ii = 0; ii < 50; ++ii) {
		// 创建一个随机矩形
		// 并将写入位置缓冲
		// 因为位置缓冲是我们绑定在
		// `ARRAY_BUFFER`绑定点上的最后一个缓冲
		setRectangle(gl, randomInt(300), randomInt(300), randomInt(300), randomInt(300));

		// 设置一个随机颜色
		gl.uniform4f(colorUniformLocation, Math.random(), Math.random(), Math.random(), 1);

		// draw
		var primitiveType = gl.TRIANGLES; // 顶点着色器每运行三次WebGL将会根据三个gl_Position值绘制一个三角形
		var offset = 0;
		var count = 6;  //WebGL要运行六次顶点着色器来画两个三角形
		/**
		 * 第一次运行将会从位置缓冲中读取前两个值赋给属性值a_position.x和a_position.y。 第二次运行a_position.xy将会被赋予后两个值，第三次运行将被赋予最后两个值。
		 */
		gl.drawArrays(primitiveType, offset, count);
	}
}

// 返回 0 到 range 范围内的随机整数
function randomInt(range) {
	return Math.floor(Math.random() * range);
}

// 用参数生成矩形顶点并写进缓冲

function setRectangle(gl, x, y, width, height) {
	var x1 = x;
	var x2 = x + width;
	var y1 = y;
	var y2 = y + height;

	// 注意: gl.bufferData(gl.ARRAY_BUFFER, ...) 将会影响到
	// 当前绑定点`ARRAY_BUFFER`的绑定缓冲
	// 目前我们只有一个缓冲，如果我们有多个缓冲
	// 我们需要先将所需缓冲绑定到`ARRAY_BUFFER`

	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
		x1, y1,
		x2, y1,
		x1, y2,
		x1, y2,
		x2, y1,
		x2, y2]), gl.STATIC_DRAW);
}

main();
