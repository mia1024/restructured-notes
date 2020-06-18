<template>
	<div id="app">
		{{msg}}
	</div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component
export default class App extends Vue {
	public msg:string = "I got a window!"
		// data(){
		// 	return {msg: "Hi"}
		// }
}



</script>

<style type="text/scss">
	body{
		text-align: center;
	}
</style>