<template>
  <router-view></router-view>
</template>

<script>
import firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/auth'

export default {
  name: 'sub-app',
  beforeCreate () {
    const firestore = firebase.firestore()
    firestore.settings({})
  }
}
</script>

<style scoped>
#qrcode {
    position: absolute;
    bottom: 0;
    width: 100%;
    display: flex;
    justify-content: center;
}
</style>
