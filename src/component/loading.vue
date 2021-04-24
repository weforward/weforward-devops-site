<template>
	<div class="loading-box"><div class="loading" v-if="isshow"></div></div>
</template>

<script>
export default {
	name: 'Loading',
	props: {
		isshow: Boolean
	}
};
</script>

<style scoped="scoped">
.loading-box {
	display: inline-block;
	/* width: 20px;
		height: 20px; */
	margin-top: 5px;
}
.loading {
	/*垂直水平居中*/
	width: 20px;
	height: 20px;
	border: 2px solid;
	border-color: #737373 #737373 transparent;
	border-radius: 50%;
	box-sizing: border-box;
	display: inline-block;
	animation: loading 1s linear infinite;
}

@keyframes loading {
	0% {
		transform: rotate(0deg);
	}

	100% {
		transform: rotate(360deg);
	}
}
</style>
