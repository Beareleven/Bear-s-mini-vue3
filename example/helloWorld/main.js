// vue3 使用
import { createApp } from '../../lib/bear-s-mini-vue.esm.js'
import { App } from './App.js'

const rootContainer = document.querySelector('#app')
// console.log(rootContainer)
createApp(App).mount(rootContainer)